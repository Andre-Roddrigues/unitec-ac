'use server';

import { revalidatePath } from 'next/cache';
import { apiGet, apiPut, type ActionResponse } from '@/lib/api/api-client';
import { profileSchema, type ProfileInput } from '@/lib/validations/profile';

export interface Profile {
  id: string;
  name: string;
  avatarUrl: string | null;
  phone: string | null;
  city: string | null;
  headline: string | null;
  bio: string | null;
  updatedAt: string;
}

export interface ProfileSummary {
  totalEnrolled: number;
  completedCourses: number;
  certificatesEarned: number;
  totalHoursLearned: number;
}

export async function getUserProfile(): Promise<ActionResponse<Profile>> {
  try {
    const result = await apiGet<Profile>('/user/profile');
    if (!result.success || !result.data) {
      return { success: false, message: result.message || 'Falha ao carregar o perfil' };
    }
    return result;
  } catch {
    return { success: false, message: 'Erro de conexão ao carregar o perfil' };
  }
}

export async function updateUserProfile(
  payload: ProfileInput
): Promise<ActionResponse<Profile>> {
  const parsed = profileSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      success: false,
      message: 'Dados do perfil inválidos',
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { name, avatarUrl, phone, city, headline, bio } = parsed.data;

  try {
    const result = await apiPut<Profile>('/user/profile', {
      name,
      avatarUrl: avatarUrl || null,
      phone: phone || null,
      city: city || null,
      headline: headline || null,
      bio: bio || null,
    });

    if (!result.success) {
      return {
        success: false,
        message: result.message || 'Falha ao actualizar o perfil',
        errors: result.errors,
      };
    }

    revalidatePath('/perfil');

    return {
      success: true,
      message: 'Perfil actualizado com sucesso',
      data: result.data,
    };
  } catch {
    return { success: false, message: 'Erro de conexão ao actualizar o perfil' };
  }
}

export async function getUserProfileStats(): Promise<ActionResponse<ProfileSummary>> {
  try {
    return await apiGet<ProfileSummary>('/user/profile-summary');
  } catch {
    return { success: false, message: 'Erro de conexão ao carregar as estatísticas' };
  }
}
