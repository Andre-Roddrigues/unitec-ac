'use server';

import { revalidatePath } from 'next/cache';
import { apiGet, apiPatch, type ActionResponse } from '@/lib/api/api-client';
import type { Lesson } from '@/types';

export async function getLessonContent(lessonId: string): Promise<ActionResponse<Lesson>> {
  try {
    return await apiGet<Lesson>(`/lessons/${lessonId}`);
  } catch {
    return {
      success: false,
      message: 'Erro ao carregar o conteúdo da aula',
    };
  }
}

/**
 * Aula de demonstração (`isPreview`) — aberta a quem ainda não comprou.
 * O servidor recusa qualquer aula que o formador não tenha marcado como tal.
 */
export async function getLessonPreview(lessonId: string): Promise<ActionResponse<Lesson>> {
  try {
    return await apiGet<Lesson>(`/lessons/${lessonId}/preview`);
  } catch {
    return {
      success: false,
      message: 'Erro ao carregar a demonstração',
    };
  }
}

export interface CourseProgress {
  progress: number;
  completed: boolean;
  lessons: Array<{
    lessonId: string;
    completed: boolean;
    watchedDuration: number;
    completedAt: string | null;
  }>;
}

/**
 * Progresso do aluno num curso, aula a aula. Sem isto o player abria sempre
 * com tudo por marcar, por mais aulas que o aluno já tivesse concluído.
 */
export async function getCourseProgress(courseId: string): Promise<ActionResponse<CourseProgress>> {
  try {
    return await apiGet<CourseProgress>(`/courses/${courseId}/progress`);
  } catch {
    return {
      success: false,
      message: 'Erro ao carregar o progresso do curso',
    };
  }
}

export interface ToggleProgressResult {
  completed: boolean;
}

export async function toggleLessonProgress(
  lessonId: string,
  completed: boolean,
  watchedDuration = 0
): Promise<ActionResponse<ToggleProgressResult>> {
  try {
    const result = await apiPatch<null>(`/lessons/${lessonId}/progress`, {
      completed,
      watchedDuration,
    });

    if (!result.success) {
      return {
        success: false,
        message: result.message || 'Falha ao atualizar o progresso da aula',
      };
    }

    revalidatePath('/perfil');
    revalidatePath('/perfil/meus-cursos');

    return {
      success: true,
      message: completed ? 'Aula marcada como concluída' : 'Aula marcada como não concluída',
      data: { completed },
    };
  } catch {
    return {
      success: false,
      message: 'Erro de conexão ao atualizar o progresso',
    };
  }
}
