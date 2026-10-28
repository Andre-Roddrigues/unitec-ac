'use server';

import { revalidatePath } from 'next/cache';
import { apiGet, apiPost, type ActionResponse } from '@/lib/api/api-client';
import { checkoutSchema, type CheckoutInput } from '@/lib/validations/checkout';

/**
 * Espelha `PurchaseResult` do LMS — ver PLANO-BACKEND-CO-ACADEMIA.md, secção
 * "Mapa de estados". A compra é síncrona (sem webhook): `completed` e
 * `failed` já são definitivos; `pending` e `unknown` precisam de nova
 * consulta — ver `getPurchaseStatus`.
 */
export interface PurchaseResult {
  status: 'completed' | 'pending' | 'failed' | 'unknown';
  enrollmentId?: string;
  /** Só em compras de certificado. */
  certificateId?: string;
  /** Só em compras de tentativa extra do exame final. */
  retakeCreditId?: string;
  paymentId?: string;
  message?: string;
}

export interface EnrollmentCourse {
  id: string;
  slug: string;
  title: string;
  thumbnailUrl: string;
  durationMinutes?: number;
  lessonsCount?: number;
  instructorName?: string | null;
}

export interface Enrollment {
  id: string;
  courseId: string;
  userId: string;
  paymentId: string | null;
  package: 'ESSENTIAL' | 'STANDARD' | 'INTERACTIVE' | string;
  amountPaid: number | null;
  progress: number;
  completed: boolean;
  enrolledAt: string;
  course?: EnrollmentCourse;
}

export interface PurchaseCoursePayload extends CheckoutInput {
  courseSlug: string;
}

function revalidateEnrollmentPaths() {
  revalidatePath('/perfil');
  revalidatePath('/perfil/meus-cursos');
  revalidatePath('/perfil/meus-cursos/[slug]');
}

export async function purchaseCourse(
  payload: PurchaseCoursePayload
): Promise<ActionResponse<PurchaseResult>> {
  const parsed = checkoutSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      success: false,
      message: 'Dados de inscrição inválidos',
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { courseId, packageId, phone } = parsed.data;

  try {
    // O LMS paga por M-Pesa e matricula na mesma chamada — pode demorar até
    // 60-90s à espera da confirmação no telemóvel do aluno (ver plano).
    const result = await apiPost<PurchaseResult>(`/courses/${courseId}/purchase`, {
      package: packageId,
      paymentMethod: 'mpesa',
      // O LMS só aceita dígitos (`^\d{9,15}$`) — o placeholder do ecrã sugere
      // "+258 84 000 0000", que sem isto dava erro de validação.
      phone: phone.replace(/\D/g, ''),
    });

    if (result.data?.status === 'completed' || result.data?.status === 'pending') {
      revalidateEnrollmentPaths();
    }

    return result;
  } catch {
    return {
      success: false,
      message: 'Erro de conexão com o servidor de pagamentos',
    };
  }
}

/**
 * Recupera uma compra que ficou `pending` ou `unknown` — reconsulta o LMS
 * (que por sua vez consulta `GET /payments/:id` no Payment Service). Só faz
 * sentido chamar com um `paymentId` real; `unknown` sem `paymentId` não tem
 * o que recuperar (ver nota em `payment-service.client.ts` do LMS).
 */
export async function getPurchaseStatus(paymentId: string): Promise<ActionResponse<PurchaseResult>> {
  try {
    const result = await apiGet<PurchaseResult>(`/purchases/${paymentId}`);

    if (result.data?.status === 'completed') {
      revalidateEnrollmentPaths();
    }

    return result;
  } catch {
    return {
      success: false,
      message: 'Erro ao consultar o pagamento',
    };
  }
}

export async function getUserEnrollments(): Promise<ActionResponse<Enrollment[]>> {
  try {
    return await apiGet<Enrollment[]>('/enrollments/me');
  } catch {
    return {
      success: false,
      message: 'Erro ao carregar as matrículas do utilizador',
    };
  }
}
