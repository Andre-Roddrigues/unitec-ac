"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal, X, LayoutGrid, List } from "lucide-react";
import { debounce, parseAsInteger, parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";
import { CourseGrid, CourseGridSkeleton } from "@/components/courses/course-grid";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { ActionResponse } from "@/lib/api/api-client";
import type { Category, CourseWithRelations, Paginated } from "@/types";
import {
  COURSES_PER_PAGE,
  DEFAULT_LEVEL,
  DEFAULT_PRICE,
  DEFAULT_SORT,
  LEVEL_LABELS,
  LEVEL_VALUES,
  PRICE_LABELS,
  PRICE_VALUES,
  SORT_LABELS,
  SORT_VALUES,
} from "@/lib/catalog";

type CatalogPage = Paginated<CourseWithRelations>;
type ViewMode = "grid" | "list";

const CACHE_TTL_MS = 5 * 60 * 1000;
const VIEW_STORAGE_KEY = "unitec:language-courses:view";

const SELECT_CLASS =
  "h-9 w-full cursor-pointer appearance-none rounded-lg border border-border bg-muted/20 px-3 pr-7 text-xs font-medium text-foreground outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary/20";

interface LanguageCatalogProps {
  categories: Category[];
  categoryId: string;
  initialFilters: {
    search: string;
    level: string;
    price: string;
    sort: string;
    page: number;
  };
  initialResult: ActionResponse<CatalogPage>;
}

export default function LanguageCatalog({
  categoryId,
  initialFilters,
  initialResult,
}: LanguageCatalogProps) {
  const [filters, setFilters] = useQueryStates(
    {
      search: parseAsString.withDefault(""),
      level: parseAsStringLiteral(LEVEL_VALUES).withDefault(DEFAULT_LEVEL),
      price: parseAsStringLiteral(PRICE_VALUES).withDefault(DEFAULT_PRICE),
      sort: parseAsStringLiteral(SORT_VALUES).withDefault(DEFAULT_SORT),
      page: parseAsInteger.withDefault(1),
    },
    { clearOnDefault: true, scroll: false },
  );

  const searchParams = useSearchParams();

  // Chave de cache: string estável com a categoria fixa + filtros atuais
  const key = JSON.stringify({
    categoryId,
    search: filters.search,
    level: filters.level,
    price: filters.price,
    sort: filters.sort,
    page: filters.page,
  });

  // Chave inicial vinda do servidor (para semear a cache)
  const initialKey = JSON.stringify({
    categoryId,
    search: initialFilters.search,
    level: initialFilters.level,
    price: initialFilters.price,
    sort: initialFilters.sort,
    page: initialFilters.page,
  });

  const [entries, setEntries] = useState<Record<string, CatalogPage>>(() =>
    initialResult.success && initialResult.data ? { [initialKey]: initialResult.data } : {},
  );
  const [failedKey, setFailedKey] = useState<string | null>(initialResult.success ? null : initialKey);
  const fetchedAt = useRef(new Map<string, number>());

  const entry = entries[key];
  const hasEntry = entry !== undefined;

  useEffect(() => {
    const at = fetchedAt.current.get(key);
    if (hasEntry && at !== undefined && Date.now() - at < CACHE_TTL_MS) return;

    const controller = new AbortController();
    // Chama o teu endpoint real. Ajusta o URL se for diferente.
    const params = new URLSearchParams({
      categoryId,
      perPage: String(COURSES_PER_PAGE),
      page: String(filters.page),
      ...(filters.search && { search: filters.search }),
      ...(filters.level !== "all" && { level: filters.level }),
      ...(filters.sort && { sort: filters.sort }),
    });

    fetch(`/api/courses?${params.toString()}`, { signal: controller.signal })
      .then((r) => r.json() as Promise<ActionResponse<CatalogPage>>)
      .then((result) => {
        if (!result.success || !result.data) throw new Error(result.message);
        fetchedAt.current.set(key, Date.now());
        setEntries((prev) => ({ ...prev, [key]: result.data! }));
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        if (!hasEntry) setFailedKey(key);
      });
    return () => controller.abort();
  }, [key, hasEntry, categoryId, filters]);

  const failed = !hasEntry && failedKey === key;
  const loading = !hasEntry && !failed;

  const [lastEntry, setLastEntry] = useState(entry);
  if (entry && entry !== lastEntry) setLastEntry(entry);

  const courses = entry?.items ?? [];
  const total = entry?.total ?? 0;
  const page = entry?.page ?? filters.page;
  const totalPages = failed ? 1 : (entry ?? lastEntry)?.totalPages ?? 1;

  // Vista grelha/lista
  const [view, setView] = useState<ViewMode>("grid");
  useEffect(() => {
    const saved = localStorage.getItem(VIEW_STORAGE_KEY);
    if (saved === "grid" || saved === "list") setView(saved);
  }, []);
  const changeView = (next: ViewMode) => {
    setView(next);
    try { localStorage.setItem(VIEW_STORAGE_KEY, next); } catch {}
  };

  const applyFilter = (values: Partial<typeof filters>) => setFilters({ ...values, page: 1 });

  const hasActiveFilters =
    Boolean(filters.search) ||
    filters.level !== DEFAULT_LEVEL ||
    filters.price !== DEFAULT_PRICE ||
    filters.sort !== DEFAULT_SORT;

  const from = total === 0 ? 0 : (page - 1) * COURSES_PER_PAGE + 1;

  return (
    <section id="cursos" className="container-page space-y-6 py-12 md:py-16">
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-5 rounded-xl border border-border/50 bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <SlidersHorizontal className="size-3.5 text-primary" />
                Filtros
              </div>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() =>
                    setFilters({ search: null, level: null, price: null, sort: null, page: null })
                  }
                  className="inline-flex cursor-pointer items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                >
                  <X className="size-3" /> Limpar
                </button>
              )}
            </div>

            <FilterField label="Pesquisar">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Pesquisar idiomas..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters(
                      { search: e.target.value, page: 1 },
                      { limitUrlUpdates: debounce(400) },
                    )
                  }
                  className="h-9 w-full rounded-lg border border-border bg-muted/20 pl-9 pr-3 text-xs text-foreground outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary focus:ring-1 focus:ring-primary/20"
                />
              </div>
            </FilterField>

            <FilterField label="Nível">
              <select
                value={filters.level}
                onChange={(e) => applyFilter({ level: e.target.value as typeof filters.level })}
                className={SELECT_CLASS}
              >
                {LEVEL_VALUES.map((v) => (
                  <option key={v} value={v}>{LEVEL_LABELS[v]}</option>
                ))}
              </select>
            </FilterField>

            <FilterField label="Preço">
              <select
                value={filters.price}
                onChange={(e) => applyFilter({ price: e.target.value as typeof filters.price })}
                className={SELECT_CLASS}
              >
                {PRICE_VALUES.map((v) => (
                  <option key={v} value={v}>{PRICE_LABELS[v]}</option>
                ))}
              </select>
            </FilterField>

            <FilterField label="Ordenar por">
              <select
                value={filters.sort}
                onChange={(e) => applyFilter({ sort: e.target.value as typeof filters.sort })}
                className={SELECT_CLASS}
              >
                {SORT_VALUES.map((v) => (
                  <option key={v} value={v}>{SORT_LABELS[v]}</option>
                ))}
              </select>
            </FilterField>
          </div>
        </aside>

        <div className="min-w-0 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/50 bg-card px-3 py-2.5 shadow-sm">
            {loading ? (
              <Skeleton className="h-4 w-44 rounded-md" />
            ) : (
              <p className="text-xs text-muted-foreground">
                {total === 0 ? (
                  "Nenhum idioma encontrado"
                ) : (
                  <>
                    A mostrar{" "}
                    <span className="font-semibold text-foreground">
                      {from}–{from + courses.length - 1}
                    </span>{" "}
                    de {total} {total === 1 ? "curso" : "cursos"}
                  </>
                )}
              </p>
            )}

            <div className="inline-flex items-center rounded-lg border border-border bg-muted/20 p-0.5">
              <button
                onClick={() => changeView("grid")}
                className={cn(
                  "p-1.5 rounded-md",
                  view === "grid" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground",
                )}
                aria-label="Vista grelha"
              >
                <LayoutGrid className="size-3.5" />
              </button>
              <button
                onClick={() => changeView("list")}
                className={cn(
                  "p-1.5 rounded-md",
                  view === "list" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground",
                )}
                aria-label="Vista lista"
              >
                <List className="size-3.5" />
              </button>
            </div>
          </div>

          {loading ? (
            <CourseGridSkeleton columns={3} />
          ) : view === "grid" ? (
            <CourseGrid
              courses={courses}
              columns={3}
              emptyTitle={failed ? "Erro ao carregar" : "Nenhum curso encontrado"}
              emptyDescription={
                failed
                  ? "Tente novamente."
                  : "Tente ajustar os filtros ou pesquisar por outro idioma."
              }
            />
          ) : (
            <div className="space-y-3">
              {courses.map((course) => (
                <div key={course.id} className="rounded-xl border border-border/50 p-4">
                  <h3 className="font-bold">{course.title}</h3>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <nav className="flex items-center justify-center gap-2 pt-2">
              <button
                disabled={loading || page <= 1}
                onClick={() => setFilters({ page: page - 1 })}
                className="inline-flex h-9 items-center gap-1 rounded-lg border px-3 text-xs font-medium hover:bg-muted disabled:opacity-40"
              >
                <ChevronLeft className="size-3.5" /> Anterior
              </button>
              <span className="px-2 text-xs text-muted-foreground">
                Página <span className="font-semibold text-foreground">{page}</span> de {totalPages}
              </span>
              <button
                disabled={loading || page >= totalPages}
                onClick={() => setFilters({ page: page + 1 })}
                className="inline-flex h-9 items-center gap-1 rounded-lg border px-3 text-xs font-medium hover:bg-muted disabled:opacity-40"
              >
                Seguinte <ChevronRight className="size-3.5" />
              </button>
            </nav>
          )}
        </div>
      </div>
    </section>
  );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}