'use server';

import { revalidatePath } from 'next/cache';
import { apiDelete, apiGet, apiPost, type ActionResponse } from '@/lib/api/api-client';
import type { Review } from '@/types';

interface BackendReview {
  id: string;
  courseId?: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  user?: {
    name?: string;
    avatarUrl?: string | null;
  } | null;
  authorName?: string;
  authorAvatarUrl?: string | null;
}

function toReview(r: BackendReview): Review {
  return {
    id: r.id,
    courseId: r.courseId ?? '',
    authorName: r.user?.name || r.authorName || 'Aluno',
    authorAvatarUrl: r.user?.avatarUrl || r.authorAvatarUrl || '',
    rating: r.rating,
    comment: r.comment || '',
    createdAt: r.createdAt,
  };
}

export async function submitCourseReview(
  courseId: string,
  rating: number,
  comment?: string,
): Promise<ActionResponse<Review>> {
  try {
    const result = await apiPost<BackendReview>(`/courses/${courseId}/reviews`, {
      rating,
      comment: comment || undefined,
    });

    if (!result.success) {
      return {
        success: false,
        message: result.message || 'Falha ao submeter a avaliação',
      };
    }

    revalidatePath(`/curso/[slug]`);
    revalidatePath(`/curso/${courseId}`);

    return {
      success: true,
      message: 'Avaliação submetida com sucesso',
      data: result.data ? toReview(result.data) : undefined,
    };
  } catch {
    return {
      success: false,
      message: 'Erro de conexão ao submeter a avaliação',
    };
  }
}

/**
 * A avaliação que o próprio aluno já deixou neste curso, ou `null`. Sem isto o
 * formulário aparecia sempre, e uma segunda submissão era recusada pelo
 * servidor sem o aluno perceber porquê.
 */
export async function getMyCourseReview(courseId: string): Promise<ActionResponse<Review | null>> {
  try {
    const result = await apiGet<BackendReview | null>(`/courses/${courseId}/reviews/mine`);
    if (!result.success) {
      return { success: false, message: result.message || 'Não autenticado' };
    }
    return {
      success: true,
      message: result.message,
      data: result.data ? toReview(result.data) : null,
    };
  } catch {
    return { success: false, message: 'Erro ao carregar a sua avaliação' };
  }
}

export async function deleteCourseReview(
  courseId: string,
  reviewId: string,
): Promise<ActionResponse<null>> {
  try {
    const result = await apiDelete<null>(`/courses/${courseId}/reviews/${reviewId}`);
    if (!result.success) {
      return { success: false, message: result.message || 'Falha ao remover a avaliação' };
    }

    revalidatePath('/curso/[slug]');

    return { success: true, message: 'Avaliação removida' };
  } catch {
    return { success: false, message: 'Erro de conexão ao remover a avaliação' };
  }
}

export async function getCourseReviews(courseId: string): Promise<ActionResponse<Review[]>> {
  try {
    const result = await apiGet<BackendReview[]>(`/courses/${courseId}/reviews`);
    if (!result.success) {
      return { success: false, message: result.message || 'Erro ao carregar avaliações' };
    }
    return {
      success: true,
      message: 'Avaliações obtidas',
      data: (result.data ?? []).map(toReview),
    };
  } catch {
    return { success: false, message: 'Erro de conexão ao carregar avaliações' };
  }
}
