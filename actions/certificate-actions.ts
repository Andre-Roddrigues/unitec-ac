'use server';

import { revalidatePath } from 'next/cache';
import { apiGet, apiPost, type ActionResponse } from '@/lib/api/api-client';
import type { PurchaseResult } from '@/actions/enrollment-actions';

export interface CertificateCourse {
  id: string;
  title: string;
  slug: string;
  thumbnailUrl: string;
}

/**
 * `PENDING_PAYMENT`: elegível (passou o exame final, ou 100% das aulas em
 * cursos sem exame), mas o pacote não inclui o certificado — só o Interativo
 * o inclui. Passa a `ISSUED` quando o pagamento confirma.
 */
export type CertificateStatus = 'PENDING_PAYMENT' | 'ISSUED';

export interface UserCertificate {
  id: string;
  enrollmentId: string;
  status: CertificateStatus;
  /** Preço a pagar — só em `PENDING_PAYMENT`. */
  price: number | null;
  amountPaid: number | null;
  paymentId: string | null;
  package: 'ESSENTIAL' | 'STANDARD' | 'INTERACTIVE' | string | null;
  createdAt: string;
  issuedAt: string;
  url: string | null;
  course?: CertificateCourse | null;
  userName?: string | null;
}

/** O que `POST /attempts/:id/submit` devolve quando a tentativa aprova um exame final. */
export interface CertificateGrant {
  id: string;
  status: CertificateStatus;
  price: number | null;
}

export async function getMyCertificates(): Promise<ActionResponse<UserCertificate[]>> {
  try {
    return await apiGet<UserCertificate[]>('/certificates/me');
  } catch {
    return {
      success: false,
      message: 'Erro ao carregar os certificados',
    };
  }
}

export async function getCertificateById(
  id: string
): Promise<ActionResponse<UserCertificate>> {
  try {
    return await apiGet<UserCertificate>(`/certificates/${id}`);
  } catch {
    return {
      success: false,
      message: 'Erro ao carregar o certificado',
    };
  }
}

/**
 * Paga o certificado por M-Pesa. Como na compra de curso, é síncrono: só
 * volta depois de o aluno confirmar (ou recusar) no telemóvel — até 60-90s.
 * O preço é decidido pelo LMS, nunca enviado daqui.
 */
export async function purchaseCertificate(
  certificateId: string,
  phone: string
): Promise<ActionResponse<PurchaseResult>> {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 9) {
    return { success: false, message: 'Número de telefone inválido' };
  }

  try {
    const result = await apiPost<PurchaseResult>(`/certificates/${certificateId}/purchase`, {
      paymentMethod: 'mpesa',
      phone: digits,
    });

    if (result.data?.status === 'completed' || result.data?.status === 'pending') {
      revalidatePath('/perfil');
      revalidatePath('/perfil/meus-cursos/[slug]', 'page');
    }

    return result;
  } catch {
    return {
      success: false,
      message: 'Erro de conexão com o servidor de pagamentos',
    };
  }
}
