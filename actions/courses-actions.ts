'use server';

import { apiGet, apiGetPublic, type ActionResponse } from '@/lib/api/api-client';
import { PUBLIC_CACHE_TAGS } from '@/lib/api/cache-tags';
import {
  ALL_CATEGORIES,
  COURSES_PER_PAGE,
  DEFAULT_SORT,
  PRICE_TO_API,
  SORT_TO_API,
  type CatalogFormat,
  type CatalogLevel,
  type CatalogPrice,
  type CatalogSort,
} from '@/lib/catalog';
import type { Category, CourseContent, CourseWithRelations, Paginated } from '@/types';

/** A home mostra 4 cursos por secção — pedir só esses. */
const HOME_SECTION_SIZE = 8;

const COURSES_CACHE = { tags: [PUBLIC_CACHE_TAGS.courses] };

export async function getPopularCourses(): Promise<ActionResponse<CourseWithRelations[]>> {
  try {
    return await apiGetPublic<CourseWithRelations[]>(`/courses/popular?limit=${HOME_SECTION_SIZE}`, COURSES_CACHE);
  } catch {
    return {
      success: false,
      message: 'Erro ao carregar os cursos populares',
    };
  }
}

export async function getNewCourses(): Promise<ActionResponse<CourseWithRelations[]>> {
  try {
    return await apiGetPublic<CourseWithRelations[]>(`/courses/newest?limit=${HOME_SECTION_SIZE}`, COURSES_CACHE);
  } catch {
    return {
      success: false,
      message: 'Erro ao carregar os novos cursos',
    };
  }
}

export async function getFeaturedCourses(): Promise<ActionResponse<CourseWithRelations[]>> {
  try {
    const result = await apiGetPublic<Paginated<CourseWithRelations>>(
      `/courses?isFeatured=true&perPage=${HOME_SECTION_SIZE}`,
      COURSES_CACHE
    );
    if (result.success && result.data) {
      return { success: true, message: result.message, data: result.data.items };
    }
    return { success: false, message: result.message || 'Erro ao carregar os cursos em destaque' };
  } catch {
    return {
      success: false,
      message: 'Erro ao carregar os cursos em destaque',
    };
  }
}

export interface GetCoursesFilters {
  search?: string;
  categoryId?: string;
  level?: CatalogLevel;
  format?: CatalogFormat;
  price?: CatalogPrice;
  sort?: CatalogSort;
  page?: number;
  perPage?: number;
  /** Só estes cursos (ex.: favoritos), independentemente dos outros filtros de catálogo. */
  ids?: string[];
}

export async function getCourses(
  filters: GetCoursesFilters = {}
): Promise<ActionResponse<Paginated<CourseWithRelations>>> {
  try {
    const params = new URLSearchParams();
    if (filters.ids) params.set('ids', filters.ids.join(','));
    if (filters.search) params.set('search', filters.search);
    if (filters.categoryId && filters.categoryId !== ALL_CATEGORIES) {
      params.set('categoryId', filters.categoryId);
    }
    if (filters.level && filters.level !== 'all') params.set('level', filters.level);
    if (filters.format && filters.format !== 'all') params.set('format', filters.format);

    const price = PRICE_TO_API[filters.price ?? 'all'];
    if (price.minPrice !== undefined) params.set('minPrice', String(price.minPrice));
    if (price.maxPrice !== undefined) params.set('maxPrice', String(price.maxPrice));

    // O servidor lê `sortBy`/`sortOrder`; o antigo `sort` era ignorado em
    // silêncio, e por isso a ordenação nunca chegou a funcionar.
    const sort = SORT_TO_API[filters.sort ?? DEFAULT_SORT];
    params.set('sortBy', sort.sortBy);
    params.set('sortOrder', sort.sortOrder);

    params.set('page', String(filters.page ?? 1));
    params.set('perPage', String(filters.perPage ?? COURSES_PER_PAGE));

    const query = params.toString() ? `?${params.toString()}` : '';
    const result = await apiGetPublic<Paginated<CourseWithRelations>>(`/courses${query}`, COURSES_CACHE);

    if (result.success && result.data) {
      return result;
    }

    return {
      success: false,
      message: result.message || 'Erro ao carregar os cursos',
    };
  } catch {
    return {
      success: false,
      message: 'Erro ao carregar os cursos',
    };
  }
}

export async function getCourseBySlug(slug: string): Promise<ActionResponse<CourseWithRelations>> {
  try {
    const result = await apiGetPublic<CourseWithRelations>(`/courses/slug/${encodeURIComponent(slug)}`, COURSES_CACHE);
    if (result.success && result.data) {
      return result;
    }
    return { success: false, message: result.message || 'Curso não encontrado' };
  } catch {
    return { success: false, message: 'Curso não encontrado' };
  }
}

/**
 * Conteúdo do curso com os recursos de cada aula (vídeo, PDFs, anexos) — o
 * `getCourseBySlug` acima serve o catálogo e **não** os traz, de propósito:
 * publicaria os URLs do conteúdo pago. Esta chamada exige matrícula no
 * servidor (`GET /courses/:id/content`), por isso só faz sentido no leitor
 * de "Meus cursos".
 */
export async function getCourseContent(
  courseId: string
): Promise<ActionResponse<CourseContent>> {
  try {
    const result = await apiGet<CourseContent>(`/courses/${courseId}/content`);
    if (result.success && result.data) {
      return result;
    }
    return { success: false, message: result.message || 'Conteúdo do curso não disponível' };
  } catch {
    return { success: false, message: 'Conteúdo do curso não disponível' };
  }
}

export async function getRelatedCourses(
  categoryId: string,
  excludeSlug: string
): Promise<ActionResponse<CourseWithRelations[]>> {
  try {
    // 5 e não 4: o próprio curso pode vir na lista e é tirado a seguir.
    const params = new URLSearchParams({ categoryId, perPage: '5' });
    const result = await apiGetPublic<Paginated<CourseWithRelations>>(`/courses?${params.toString()}`, COURSES_CACHE);
    if (result.success && result.data?.items?.length) {
      const filtered = result.data.items.filter((c) => c.slug !== excludeSlug).slice(0, 4);
      return { success: true, message: 'Cursos relacionados', data: filtered };
    }
    return { success: false, message: result.message || 'Não foram encontrados cursos relacionados' };
  } catch {
    return { success: false, message: 'Erro ao carregar cursos relacionados' };
  }
}

/** Todas as categorias — usada por filtros e pela página de idiomas. */
export async function getCategories(): Promise<ActionResponse<Category[]>> {
  try {
    return await apiGetPublic<Category[]>('/categories', {
      tags: [PUBLIC_CACHE_TAGS.categories],
    });
  } catch {
    return { success: false, message: 'Erro ao carregar as categorias' };
  }
}

export async function getLanguageCategoryId(): Promise<string | null> {
  const result = await getCategories();
  if (!result.success || !result.data) return null;
  return result.data.find((c) => c.slug === 'idiomas')?.id ?? null;
}