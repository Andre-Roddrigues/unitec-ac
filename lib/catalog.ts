/**
 * Filtros do catálogo — fonte única partilhada pelo ecrã (`CoursesList`) e
 * pela chamada à API (`getCourses`).
 *
 * Existe porque os dois lados tinham divergido: a UI oferecia ordenações e
 * níveis que o LMS não conhece (`rating-desc`, `ALL_LEVELS`) e enviava um
 * parâmetro `sort` que o servidor ignorava — só aceita `sortBy` + `sortOrder`.
 * Cada valor daqui tem de ter tradução em `SORT_TO_API` / `PRICE_TO_API`.
 */

export const COURSES_PER_PAGE = 12;
export const ALL_CATEGORIES = "all";

export const LEVEL_VALUES = ["all", "BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;
export const FORMAT_VALUES = ["all", "ONLINE", "PRESENCIAL", "HIBRIDO"] as const;
export const PRICE_VALUES = ["all", "free", "paid"] as const;
// "Melhor Avaliados" saiu: a nota do curso é calculada a partir das reviews e
// não há coluna por onde ordenar no servidor. Ordenar só a página visível
// daria uma lista errada assim que houvesse mais do que uma página.
export const SORT_VALUES = ["newest", "price-asc", "price-desc", "title-asc"] as const;

export type CatalogLevel = (typeof LEVEL_VALUES)[number];
export type CatalogFormat = (typeof FORMAT_VALUES)[number];
export type CatalogPrice = (typeof PRICE_VALUES)[number];
export type CatalogSort = (typeof SORT_VALUES)[number];

export const LEVEL_LABELS: Record<CatalogLevel, string> = {
  all: "Todos os Níveis",
  BEGINNER: "Iniciante",
  INTERMEDIATE: "Intermédio",
  ADVANCED: "Avançado",
};

export const FORMAT_LABELS: Record<CatalogFormat, string> = {
  all: "Todas as Modalidades",
  ONLINE: "Online",
  PRESENCIAL: "Presencial",
  HIBRIDO: "Híbrido",
};

export const PRICE_LABELS: Record<CatalogPrice, string> = {
  all: "Qualquer Preço",
  free: "Grátis",
  paid: "Pago",
};

export const SORT_LABELS: Record<CatalogSort, string> = {
  newest: "Mais Recentes",
  "price-asc": "Menor Preço",
  "price-desc": "Maior Preço",
  "title-asc": "Título (A-Z)",
};

export const DEFAULT_LEVEL: CatalogLevel = "all";
export const DEFAULT_FORMAT: CatalogFormat = "all";
export const DEFAULT_PRICE: CatalogPrice = "all";
export const DEFAULT_SORT: CatalogSort = "newest";

/** `sortBy`/`sortOrder` são os nomes que `courseFilterSchema` aceita no LMS. */
export const SORT_TO_API: Record<CatalogSort, { sortBy: string; sortOrder: "asc" | "desc" }> = {
  newest: { sortBy: "createdAt", sortOrder: "desc" },
  "price-asc": { sortBy: "price", sortOrder: "asc" },
  "price-desc": { sortBy: "price", sortOrder: "desc" },
  "title-asc": { sortBy: "title", sortOrder: "asc" },
};

/** "Pago" usa um mínimo simbólico: o LMS filtra por `price >= minPrice`. */
export const PRICE_TO_API: Record<CatalogPrice, { minPrice?: number; maxPrice?: number }> = {
  all: {},
  free: { maxPrice: 0 },
  paid: { minPrice: 0.01 },
};

export function toCatalogLevel(value: string | undefined): CatalogLevel {
  return LEVEL_VALUES.includes(value as CatalogLevel) ? (value as CatalogLevel) : DEFAULT_LEVEL;
}

export function toCatalogFormat(value: string | undefined): CatalogFormat {
  return FORMAT_VALUES.includes(value as CatalogFormat) ? (value as CatalogFormat) : DEFAULT_FORMAT;
}

export function toCatalogPrice(value: string | undefined): CatalogPrice {
  return PRICE_VALUES.includes(value as CatalogPrice) ? (value as CatalogPrice) : DEFAULT_PRICE;
}

export function toCatalogSort(value: string | undefined): CatalogSort {
  return SORT_VALUES.includes(value as CatalogSort) ? (value as CatalogSort) : DEFAULT_SORT;
}

/** Estado completo do catálogo, tal como está (ou fica) no URL de `/cursos`. */
export interface CatalogFilters {
  search: string;
  category: string;
  level: CatalogLevel;
  format: CatalogFormat;
  price: CatalogPrice;
  sort: CatalogSort;
  page: number;
}

/**
 * Lê os filtros de qualquer fonte de query string — `searchParams` da
 * página, o `NextRequest` do route handler ou o `useSearchParams()` do
 * cliente. Os três têm de chegar exactamente ao mesmo resultado, senão a
 * chave da cache do cliente não coincide com a resposta que o servidor semeou.
 */
export function parseCatalogParams(get: (key: string) => string | null | undefined): CatalogFilters {
  return {
    search: get("search")?.trim() ?? "",
    category: get("category") || ALL_CATEGORIES,
    level: toCatalogLevel(get("level") ?? undefined),
    format: toCatalogFormat(get("format") ?? undefined),
    price: toCatalogPrice(get("price") ?? undefined),
    sort: toCatalogSort(get("sort") ?? undefined),
    page: Math.max(1, Math.floor(Number(get("page"))) || 1),
  };
}

/**
 * Forma canónica dos filtros: ordem fixa e sem os valores por omissão. É a
 * chave da cache de resultados do `CoursesList` e, ao mesmo tempo, a query
 * de `/api/courses` — duas combinações iguais dão sempre a mesma string.
 */
export function catalogQueryString(filters: CatalogFilters): string {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.category !== ALL_CATEGORIES) params.set("category", filters.category);
  if (filters.level !== DEFAULT_LEVEL) params.set("level", filters.level);
  if (filters.format !== DEFAULT_FORMAT) params.set("format", filters.format);
  if (filters.price !== DEFAULT_PRICE) params.set("price", filters.price);
  if (filters.sort !== DEFAULT_SORT) params.set("sort", filters.sort);
  if (filters.page > 1) params.set("page", String(filters.page));
  return params.toString();
}

/** Traduz o estado do URL para os argumentos de `getCourses`. */
export function toGetCoursesFilters(filters: CatalogFilters) {
  return {
    search: filters.search || undefined,
    categoryId: filters.category,
    level: filters.level,
    format: filters.format,
    price: filters.price,
    sort: filters.sort,
    page: filters.page,
    perPage: COURSES_PER_PAGE,
  };
}
