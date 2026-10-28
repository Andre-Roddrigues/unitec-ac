'use server';

import { apiGetPublic, type ActionResponse } from '@/lib/api/api-client';
import { PUBLIC_CACHE_TAGS } from '@/lib/api/cache-tags';
import type { Category } from '@/types';

export async function getCategories(): Promise<ActionResponse<Category[]>> {
  try {
    const result = await apiGetPublic<Category[]>('/categories', { tags: [PUBLIC_CACHE_TAGS.categories] });
    return result;
  } catch {
    return { success: false, message: 'Erro ao carregar categorias' };
  }
}
