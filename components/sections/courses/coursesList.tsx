"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal, X } from "lucide-react";
import { debounce, parseAsInteger, parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";
import { CourseGrid, CourseGridSkeleton } from "@/components/courses/course-grid";
import { CategoryFilter } from "@/components/courses/category-filter";
import { Skeleton } from "@/components/ui/skeleton";
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

const CACHE_TTL_MS = 5 * 60 * 1000;

const SELECT_CLASS =
    "h-9 cursor-pointer appearance-none rounded-lg border border-border bg-muted/20 px-3 pr-7 text-xs font-medium text-foreground outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary/20";

function CatalogHeading() {
    return (
        <div className="space-y-1">
            <h2 className="text-2xl font-bold sm:text-3xl">
                <span className="text-gradient">Cursos Online</span> disponíveis
            </h2>
            <p className="text-sm text-muted-foreground">
                Encontre o curso online ideal para o seu desenvolvimento profissional.
            </p>
        </div>
    );
}

export function CoursesListSkeleton() {
    return (
        <section aria-busy="true" className="container-page space-y-6 py-12 md:py-16">
            <CatalogHeading />
            <div className="flex flex-wrap gap-2" aria-hidden="true">
                {Array.from({ length: 6 }, (_, index) => (
                    <Skeleton key={index} className="h-7 w-24 rounded-full" />
                ))}
            </div>
            <Skeleton aria-hidden="true" className="h-32 rounded-xl sm:h-[62px]" />
            <Skeleton aria-hidden="true" className="h-4 w-44 rounded-md" />
            <CourseGridSkeleton columns={4} />
        </section>
    );
}

export default function CoursesList({
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
    const key = catalogQueryString({
        ...parseCatalogParams((name) => searchParams.get(name)),
        format: "ONLINE", // ✅ Forçar online
    });

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
            <CatalogHeading />

            <CategoryFilter
                categories={categories}
                active={filters.category}
                onCategoryChange={(category) => applyFilter({ category })}
            />

            <div className="flex flex-col gap-3 rounded-xl border border-border/50 bg-card p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:max-w-xs">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="search"
                        placeholder="Pesquisar cursos online..."
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

                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <SlidersHorizontal className="size-3.5" />
                        <span className="hidden sm:inline">Filtros:</span>
                    </div>

                    {/* ✅ Removido o seletor de formato */}

                    <select
                        aria-label="Filtrar por nível"
                        value={filters.level}
                        onChange={(e) => applyFilter({ level: e.target.value as typeof filters.level })}
                        className={SELECT_CLASS}
                    >
                        {LEVEL_VALUES.map((value) => (
                            <option key={value} value={value}>
                                {LEVEL_LABELS[value]}
                            </option>
                        ))}
                    </select>

                    <select
                        aria-label="Filtrar por preço"
                        value={filters.price}
                        onChange={(e) => applyFilter({ price: e.target.value as typeof filters.price })}
                        className={SELECT_CLASS}
                    >
                        {PRICE_VALUES.map((value) => (
                            <option key={value} value={value}>
                                {PRICE_LABELS[value]}
                            </option>
                        ))}
                    </select>

                    <select
                        aria-label="Ordenar cursos"
                        value={filters.sort}
                        onChange={(e) => applyFilter({ sort: e.target.value as typeof filters.sort })}
                        className={SELECT_CLASS}
                    >
                        {SORT_VALUES.map((value) => (
                            <option key={value} value={value}>
                                {SORT_LABELS[value]}
                            </option>
                        ))}
                    </select>

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
                            className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-primary/20 bg-primary-soft/50 px-3 text-xs font-semibold text-primary transition-colors hover:bg-primary-soft"
                        >
                            <X className="size-3" />
                            Limpar
                        </button>
                    )}
                </div>
            </div>

            <div className="flex min-h-4 items-center justify-between px-1">
                {loading ? (
                    <Skeleton className="h-4 w-44 rounded-md" />
                ) : (
                    <p className="text-xs text-muted-foreground">
                        {total === 0 ? (
                            "Nenhum curso online encontrado"
                        ) : (
                            <>
                                A mostrar{" "}
                                <span className="font-semibold text-foreground">
                                    {from}–{from + courses.length - 1}
                                </span>{" "}
                                de {total} {total === 1 ? "curso online" : "cursos online"}
                            </>
                        )}
                    </p>
                )}
            </div>

            {loading ? (
                <CourseGridSkeleton columns={4} />
            ) : (
                <CourseGrid
                    courses={courses}
                    columns={4}
                    emptyTitle={failed ? "Não foi possível carregar os cursos" : "Nenhum curso online encontrado"}
                    emptyDescription={
                        failed
                            ? "Houve um problema a falar com o servidor. Tente novamente dentro de instantes."
                            : "Tente ajustar os filtros ou pesquisar por outro termo."
                    }
                />
            )}

            {totalPages > 1 && (
                <nav aria-label="Paginação de cursos" className="flex items-center justify-center gap-2 pt-2">
                    <button
                        type="button"
                        disabled={loading || page <= 1}
                        onClick={() => setFilters({ page: page - 1 })}
                        className="inline-flex h-9 cursor-pointer items-center gap-1 rounded-lg border border-border px-3 text-xs font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <ChevronLeft className="size-3.5" /> Anterior
                    </button>
                    <span className="px-2 text-xs text-muted-foreground">
                        Página <span className="font-semibold text-foreground">{page}</span> de {totalPages}
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
        </section>
    );
}