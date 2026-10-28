"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
    ChevronLeft,
    ChevronRight,
    Search,
    SlidersHorizontal,
    X,
    LayoutGrid,
    List,
    MapPin,
} from "lucide-react";
import { debounce, parseAsInteger, parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";
import { CourseGrid, CourseGridSkeleton } from "@/components/courses/course-grid";
import { CategoryCarousel } from "@/components/courses/category-carousel";
import {
    PresencialCourseListRow,
    PresencialCourseListRowSkeleton,
} from "@/components/courses/presencial-course-list-row";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { ActionResponse } from "@/lib/api/api-client";
import type { Category, CourseWithRelations, Paginated } from "@/types";
import {
    ALL_CATEGORIES,
    catalogQueryString,
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
    parseCatalogParams,
} from "@/lib/catalog";

type CatalogPage = Paginated<CourseWithRelations>;
type ViewMode = "grid" | "list";

const CACHE_TTL_MS = 5 * 60 * 1000;
const VIEW_STORAGE_KEY = "unitec:courses-presenciais:view";
const PRESENCIAL_FORMAT = "PRESENCIAL" as const; // FIX

const SELECT_CLASS =
    "h-9 w-full cursor-pointer appearance-none rounded-lg border border-border bg-muted/20 px-3 pr-7 text-xs font-medium text-foreground outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary/20";

function CatalogHeading() {
    return (
        <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                <MapPin className="size-3.5" />
                Presencial
            </div>
            <h2 className="text-2xl font-bold sm:text-3xl">
                <span className="text-gradient">Cursos</span> presenciais
            </h2>
            <p className="text-sm text-muted-foreground">
                Aprenda em sala, com acompanhamento direto de formadores especializados.
            </p>
        </div>
    );
}

export function PresencialCoursesListSkeleton() {
    return (
        <section aria-busy="true" className="container-page space-y-6 py-12 md:py-16">
            {/* <CatalogHeading /> */}
            <div className="flex gap-2 overflow-hidden" aria-hidden="true">
                {Array.from({ length: 8 }, (_, index) => (
                    <Skeleton key={index} className="h-7 w-24 shrink-0 rounded-full" />
                ))}
            </div>
            <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
                <Skeleton aria-hidden="true" className="hidden h-[420px] rounded-xl lg:block" />
                <div className="space-y-6">
                    <Skeleton aria-hidden="true" className="h-9 w-full rounded-lg" />
                    <Skeleton aria-hidden="true" className="h-4 w-44 rounded-md" />
                    <CourseGridSkeleton columns={3} />
                </div>
            </div>
        </section>
    );
}

export default function PresencialCoursesList({
    categories,
    initialKey,
    initialResult,
}: {
    categories: Category[];
    initialKey: string;
    initialResult: ActionResponse<CatalogPage>;
}) {
    const [filters, setFilters] = useQueryStates(
        {
            search: parseAsString.withDefault(""),
            category: parseAsString.withDefault(ALL_CATEGORIES),
            level: parseAsStringLiteral(LEVEL_VALUES).withDefault(DEFAULT_LEVEL),
            price: parseAsStringLiteral(PRICE_VALUES).withDefault(DEFAULT_PRICE),
            sort: parseAsStringLiteral(SORT_VALUES).withDefault(DEFAULT_SORT),
            page: parseAsInteger.withDefault(1),
        },
        { clearOnDefault: true, scroll: false },
    );

    const searchParams = useSearchParams();
    const key = (() => {
        const parsed = parseCatalogParams((name) => searchParams.get(name));
        return catalogQueryString({ ...parsed, format: PRESENCIAL_FORMAT });
    })();

    const [entries, setEntries] = useState<Record<string, CatalogPage>>(() =>
        initialResult.success && initialResult.data ? { [initialKey]: initialResult.data } : {},
    );
    const [failedKey, setFailedKey] = useState<string | null>(initialResult.success ? null : initialKey);
    const fetchedAt = useRef(new Map<string, number>());

    const [seededKey, setSeededKey] = useState(initialKey);
    if (seededKey !== initialKey) {
        setSeededKey(initialKey);
        if (initialResult.success && initialResult.data) {
            const data = initialResult.data;
            setEntries((prev) => ({ ...prev, [initialKey]: data }));
        }
    }

    const [previousKey, setPreviousKey] = useState(key);
    if (previousKey !== key) {
        setPreviousKey(key);
        setFailedKey(null);
    }

    useEffect(() => {
        if (initialResult.success) fetchedAt.current.set(initialKey, Date.now());
    }, [initialKey, initialResult]);

    const entry = entries[key];
    const hasEntry = entry !== undefined;

    useEffect(() => {
        const at = fetchedAt.current.get(key);
        if (hasEntry && at !== undefined && Date.now() - at < CACHE_TTL_MS) return;

        const controller = new AbortController();
        fetch(`/api/courses?${key}`, { signal: controller.signal })
            .then((response) => response.json() as Promise<ActionResponse<CatalogPage>>)
            .then((result) => {
                if (!result.success || !result.data) throw new Error(result.message);
                const data = result.data;
                fetchedAt.current.set(key, Date.now());
                setEntries((prev) => ({ ...prev, [key]: data }));
            })
            .catch(() => {
                if (controller.signal.aborted) return;
                if (!hasEntry) setFailedKey(key);
            });
        return () => controller.abort();
    }, [key, hasEntry]);

    const failed = !hasEntry && failedKey === key;
    const loading = !hasEntry && !failed;

    const [lastEntry, setLastEntry] = useState(entry);
    if (entry && entry !== lastEntry) setLastEntry(entry);

    const courses = entry?.items ?? [];
    const total = entry?.total ?? 0;
    const page = entry?.page ?? filters.page;
    const totalPages = failed ? 1 : (entry ?? lastEntry)?.totalPages ?? 1;

    // ---- vista grelha/lista ----
    const [view, setView] = useState<ViewMode>("grid");
    useEffect(() => {
        const saved = localStorage.getItem(VIEW_STORAGE_KEY);
        if (saved === "grid" || saved === "list") setView(saved);
    }, []);
    const changeView = (next: ViewMode) => {
        setView(next);
        try {
            localStorage.setItem(VIEW_STORAGE_KEY, next);
        } catch {
        }
    };

    const applyFilter = (values: Partial<typeof filters>) => setFilters({ ...values, page: 1 });

    const hasActiveFilters =
        Boolean(filters.search) ||
        filters.category !== ALL_CATEGORIES ||
        filters.level !== DEFAULT_LEVEL ||
        filters.price !== DEFAULT_PRICE ||
        filters.sort !== DEFAULT_SORT;

    const from = total === 0 ? 0 : (page - 1) * COURSES_PER_PAGE + 1;

    return (
        <section id="cursos" className="container-page space-y-6 py-12 md:py-16">
            {/* <CatalogHeading /> */}

            <CategoryCarousel
                categories={categories}
                active={filters.category}
                onCategoryChange={(category) => applyFilter({ category })}
            />

            <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
                <aside className="hidden lg:block">
                    <div className="sticky top-24 space-y-5 rounded-xl border border-border/50 bg-card p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                                <SlidersHorizontal className="size-3.5" />
                                Filtros
                            </div>
                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setFilters({
                                            search: null,
                                            category: null,
                                            level: null,
                                            price: null,
                                            sort: null,
                                            page: null,
                                        })
                                    }
                                    className="inline-flex cursor-pointer items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                                >
                                    <X className="size-3" />
                                    Limpar
                                </button>
                            )}
                        </div>

                        <FilterField label="Pesquisar">
                            <div className="relative">
                                <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type="search"
                                    placeholder="Pesquisar cursos..."
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
                                aria-label="Filtrar por nível"
                                value={filters.level}
                                onChange={(e) =>
                                    applyFilter({ level: e.target.value as typeof filters.level })
                                }
                                className={SELECT_CLASS}
                            >
                                {LEVEL_VALUES.map((value) => (
                                    <option key={value} value={value}>
                                        {LEVEL_LABELS[value]}
                                    </option>
                                ))}
                            </select>
                        </FilterField>

                        <FilterField label="Preço">
                            <select
                                aria-label="Filtrar por preço"
                                value={filters.price}
                                onChange={(e) =>
                                    applyFilter({ price: e.target.value as typeof filters.price })
                                }
                                className={SELECT_CLASS}
                            >
                                {PRICE_VALUES.map((value) => (
                                    <option key={value} value={value}>
                                        {PRICE_LABELS[value]}
                                    </option>
                                ))}
                            </select>
                        </FilterField>

                        <FilterField label="Ordenar por">
                            <select
                                aria-label="Ordenar cursos"
                                value={filters.sort}
                                onChange={(e) =>
                                    applyFilter({ sort: e.target.value as typeof filters.sort })
                                }
                                className={SELECT_CLASS}
                            >
                                {SORT_VALUES.map((value) => (
                                    <option key={value} value={value}>
                                        {SORT_LABELS[value]}
                                    </option>
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
                                    "Nenhum curso encontrado"
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

                        <div
                            className="inline-flex items-center rounded-lg border border-border bg-muted/20 p-0.5"
                            role="group"
                            aria-label="Modo de visualização"
                        >
                            <ViewButton
                                active={view === "grid"}
                                onClick={() => changeView("grid")}
                                label="Grelha"
                            >
                                <LayoutGrid className="size-3.5" />
                            </ViewButton>
                            <ViewButton
                                active={view === "list"}
                                onClick={() => changeView("list")}
                                label="Lista"
                            >
                                <List className="size-3.5" />
                            </ViewButton>
                        </div>
                    </div>

                    {loading ? (
                        view === "grid" ? (
                            <CourseGridSkeleton columns={3} />
                        ) : (
                            <div className="space-y-3">
                                {Array.from({ length: 6 }, (_, i) => (
                                    <PresencialCourseListRowSkeleton key={i} />
                                ))}
                            </div>
                        )
                    ) : view === "grid" ? (
                        <CourseGrid
                            courses={courses}
                            columns={3}
                            emptyTitle={
                                failed
                                    ? "Não foi possível carregar os cursos"
                                    : "Nenhum curso presencial encontrado"
                            }
                            emptyDescription={
                                failed
                                    ? "Houve um problema a falar com o servidor. Tente novamente dentro de instantes."
                                    : "Tente ajustar os filtros ou pesquisar por outro termo."
                            }
                        />
                    ) : (
                        <div className="space-y-3">
                            {courses.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                                    {failed
                                        ? "Não foi possível carregar os cursos."
                                        : "Nenhum curso presencial encontrado."}
                                </div>
                            ) : (
                                courses.map((course) => (
                                    <PresencialCourseListRow key={course.id} course={course} />
                                ))
                            )}
                        </div>
                    )}

                    {totalPages > 1 && (
                        <nav
                            aria-label="Paginação de cursos"
                            className="flex items-center justify-center gap-2 pt-2"
                        >
                            <button
                                type="button"
                                disabled={loading || page <= 1}
                                onClick={() => setFilters({ page: page - 1 })}
                                className="inline-flex h-9 cursor-pointer items-center gap-1 rounded-lg border border-border px-3 text-xs font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <ChevronLeft className="size-3.5" /> Anterior
                            </button>
                            <span className="px-2 text-xs text-muted-foreground">
                                Página <span className="font-semibold text-foreground">{page}</span> de{" "}
                                {totalPages}
                            </span>
                            <button
                                type="button"
                                disabled={loading || page >= totalPages}
                                onClick={() => setFilters({ page: page + 1 })}
                                className="inline-flex h-9 cursor-pointer items-center gap-1 rounded-lg border border-border px-3 text-xs font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
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

function ViewButton({
    active,
    onClick,
    label,
    children,
}: {
    active: boolean;
    onClick: () => void;
    label: string;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            aria-label={`Vista ${label}`}
            title={`Vista ${label}`}
            className={cn(
                "inline-flex h-7 w-8 cursor-pointer items-center justify-center rounded-md transition-colors",
                active
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
            )}
        >
            {children}
        </button>
    );
}