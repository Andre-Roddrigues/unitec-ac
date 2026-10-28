'use server';

import { revalidatePath } from 'next/cache';
import { apiGet, apiPost, type ActionResponse } from '@/lib/api/api-client';

export interface InteractionRequest {
  id: string;
  enrollmentId?: string;
  question: string;
  response?: string | null;
  status: 'OPEN' | 'ANSWERED' | 'CLOSED' | string;
  requestedAt: string;
  respondedAt?: string | null;
}

export async function createInteractionRequest(
  enrollmentId: string,
  question: string,
): Promise<ActionResponse<InteractionRequest>> {
  try {
    const result = await apiPost<InteractionRequest>(
      `/enrollments/${enrollmentId}/interactions`,
      { question },
    );

    if (!result.success) {
      return {
        success: false,
        message: result.message || 'Falha ao enviar a dúvida',
      };
    }

    revalidatePath('/perfil');
    revalidatePath('/perfil/meus-cursos/[slug]');

    return {
      success: true,
      message: 'Dúvida enviada com sucesso',
      data: result.data,
    };
  } catch {
    return {
      success: false,
      message: 'Erro de conexão ao enviar a dúvida',
    };
  }
}

export async function getMyInteractions(): Promise<ActionResponse<InteractionRequest[]>> {
  try {
    return await apiGet<InteractionRequest[]>('/interactions/mine');
  } catch {
    return {
      success: false,
      message: 'Erro ao carregar as suas dúvidas',
    };
  }
}
