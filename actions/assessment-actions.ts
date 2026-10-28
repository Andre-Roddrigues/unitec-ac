'use server';

import { revalidatePath } from 'next/cache';
import type { CertificateGrant } from '@/actions/certificate-actions';
import type { PurchaseResult } from '@/actions/enrollment-actions';
import { apiGet, apiPost, apiPut, type ActionResponse } from '@/lib/api/api-client';

export type QuestionType = 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'ESSAY';

export interface AssessmentOption {
  id: string;
  answer: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  questionType: QuestionType;
  points: number;
  explanation?: string | null;
  position: number;
  options: AssessmentOption[];
}

export type AssessmentType = 'QUIZ' | 'MODULE_TEST' | 'FINAL_EXAM';

/**
 * Tentativas do aluno no exame final, decididas pelo servidor (ver
 * `ExamRetakeService` no LMS): `freeAttempts` gratuitas e, depois, uma por
 * cada taxa paga. Nunca ilimitadas — o ecrã só lê, não recalcula.
 */
export interface FinalExamAttempts {
  freeAttempts: number;
  paidAttempts: number;
  allowed: number;
  used: number;
  remaining: number;
  passed: boolean;
  /** Uma tentativa submetida tem perguntas de desenvolvimento por corrigir. */
  awaitingCorrection: boolean;
  /** `0` = repetições ainda sem preço: não se vendem. */
  retakePrice: number;
  canPurchaseRetake: boolean;
  /** Pagamento de repetição que ficou por confirmar. */
  pendingPaymentId: string | null;
}

export interface QuizAssessment {
  id: string;
  title: string;
  description?: string | null;
  type: AssessmentType | string;
  lessonId?: string | null;
  moduleId?: string | null;
  courseId?: string | null;
  minimumScore: number;
  timeLimit?: number | null;
  /** `null` = tentativas ilimitadas. Ignorado no exame final — ver `examAttempts`. */
  maximumAttempts?: number | null;
  showScoreImmediately: boolean;
  questions: QuizQuestion[];
  /**
   * Porta decidida pelo servidor (ver `AssessmentService.listAssessmentsByCourse`
   * no LMS). Hoje só o exame final tem porta: fica bloqueado até o aluno
   * concluir `unlockAtProgress`% do curso. `currentProgress` é a percentagem
   * que o servidor usou para decidir — é essa que se mostra ao aluno, para a
   * mensagem no ecrã não divergir do 403 que ele levaria ao tentar.
   */
  locked?: boolean;
  unlockAtProgress?: number | null;
  currentProgress?: number;
  /**
   * Saídas da página toleradas pelo modo antifraude antes de submeter —
   * definido no painel (Definições). `null` nas avaliações sem antifraude.
   */
  maxWarnings?: number | null;
  /** Só no exame final. */
  examAttempts?: FinalExamAttempts | null;
}

export interface QuizAttempt {
  id: string;
  assessmentId: string;
  status: string;
  attemptNumber: number;
}

/**
 * Porque foi submetida. `LEFT_PAGE` e `ABANDONED` só existem nos testes de
 * módulo e no exame final (modo antifraude); `ABANDONED` é o servidor que
 * decide, ao encontrar uma tentativa deixada aberta.
 */
export type AttemptSubmitReason = 'MANUAL' | 'TIMEOUT' | 'LEFT_PAGE' | 'ABANDONED';

export interface SubmitResult {
  status: string;
  percentage: number | null;
  passed: boolean | null;
  /** Só quando a tentativa aprova um exame final — ver `CertificateGrant`. */
  certificate?: CertificateGrant | null;
  /** Só no exame final: as tentativas já depois desta. */
  examAttempts?: FinalExamAttempts | null;
  submitReason?: AttemptSubmitReason | null;
}

export interface SubmitOptions {
  reason?: Exclude<AttemptSubmitReason, 'ABANDONED'>;
  /** Saídas da página registadas pelo modo antifraude. */
  violationCount?: number;
}

/** Uma resposta por opção escolhida — é assim que o servidor pontua escolha múltipla. */
export interface QuizAnswerInput {
  questionId: string;
  selectedOptionId?: string | null;
  writtenAnswer?: string | null;
}

export interface AttemptReviewAnswer {
  id: string;
  questionId: string;
  selectedOptionId: string | null;
  writtenAnswer: string | null;
  isCorrect: boolean | null;
  earnedPoints: number;
}

export interface AttemptReview {
  id: string;
  status: string;
  attemptNumber: number;
  score: number;
  percentage: number | null;
  passed: boolean | null;
  /** Aqui — e só aqui — as opções trazem `isCorrect` e as perguntas a explicação. */
  assessment: QuizAssessment;
  answers: AttemptReviewAnswer[];
}

export async function getAssessment(id: string): Promise<ActionResponse<QuizAssessment>> {
  try {
    const [assessmentRes, questionsRes] = await Promise.all([
      apiGet<Omit<QuizAssessment, 'questions'>>(`/assessments/${id}`),
      apiGet<Array<Omit<QuizQuestion, 'options'>>>(`/assessments/${id}/questions`),
    ]);

    if (!assessmentRes.success || !questionsRes.success || !assessmentRes.data) {
      return { success: false, message: 'Avaliação não encontrada' };
    }

    const questionsWithOptions = await Promise.all(
      (questionsRes.data ?? []).map(async (q) => {
        const opts = await apiGet<AssessmentOption[]>(
          `/assessments/${id}/questions/${q.id}/options`,
        );
        return { ...q, options: opts.success ? (opts.data ?? []) : [] };
      }),
    );

    return {
      success: true,
      message: 'Avaliação obtida',
      data: {
        ...assessmentRes.data,
        questions: questionsWithOptions,
      },
    };
  } catch {
    return { success: false, message: 'Erro ao carregar a avaliação' };
  }
}

/**
 * Avaliação associada a uma aula (aulas QUIZ), pelo `lessonId` — não pelo id
 * da própria avaliação, que é uma entidade diferente. Já vem com as perguntas
 * e opções incluídas, num único pedido.
 */
export async function getAssessmentByLesson(lessonId: string): Promise<ActionResponse<QuizAssessment>> {
  try {
    const res = await apiGet<QuizAssessment>(`/assessments/by-lesson/${lessonId}`);
    if (!res.success || !res.data) {
      return { success: false, message: res.message || 'Avaliação não encontrada' };
    }
    return { success: true, message: 'Avaliação obtida', data: res.data };
  } catch {
    return { success: false, message: 'Erro ao carregar a avaliação' };
  }
}

export async function startAttempt(assessmentId: string): Promise<ActionResponse<QuizAttempt>> {
  try {
    return await apiPost<QuizAttempt>(`/assessments/${assessmentId}/attempts`, {});
  } catch {
    return { success: false, message: 'Erro ao iniciar a tentativa' };
  }
}

/**
 * Um só pedido: o servidor substitui as respostas gravadas pelas enviadas e
 * corrige. Antes ia uma resposta de cada vez — lento, e uma falha a meio
 * deixava a tentativa por submeter.
 */
export async function submitQuizAttempt(
  attemptId: string,
  answers: QuizAnswerInput[],
  { reason = 'MANUAL', violationCount = 0 }: SubmitOptions = {},
): Promise<ActionResponse<SubmitResult>> {
  try {
    return await apiPost<SubmitResult>(`/attempts/${attemptId}/submit`, {
      answers: toAnswerPayload(answers),
      reason,
      violationCount,
    });
  } catch {
    return { success: false, message: 'Erro ao submeter a avaliação' };
  }
}

/**
 * Rascunho contínuo: as respostas ficam no servidor enquanto o aluno responde,
 * para que uma tentativa deixada aberta (separador fechado, browser que
 * rebentou) seja corrigida com o que ele já tinha dado.
 */
export async function saveAttemptDraft(
  attemptId: string,
  answers: QuizAnswerInput[],
): Promise<ActionResponse<null>> {
  try {
    return await apiPut<null>(`/attempts/${attemptId}/answers`, { answers: toAnswerPayload(answers) });
  } catch {
    return { success: false, message: 'Erro ao guardar as respostas' };
  }
}

function toAnswerPayload(answers: QuizAnswerInput[]) {
  return answers.map((a) => ({
    questionId: a.questionId,
    selectedOptionId: a.selectedOptionId ?? null,
    writtenAnswer: a.writtenAnswer ?? null,
  }));
}

/**
 * Avaliações de um curso — inclui os testes de módulo e o exame final, que
 * não estão ligados a nenhuma aula e por isso não apareciam em lado nenhum.
 * Exige matrícula.
 */
export async function getCourseAssessments(courseId: string): Promise<ActionResponse<QuizAssessment[]>> {
  try {
    return await apiGet<QuizAssessment[]>(`/courses/${courseId}/assessments`);
  } catch {
    return { success: false, message: 'Erro ao carregar as avaliações do curso' };
  }
}

/** Tentativa submetida, com as respostas certas e as explicações do formador. */
export async function getAttemptReview(attemptId: string): Promise<ActionResponse<AttemptReview>> {
  try {
    return await apiGet<AttemptReview>(`/attempts/${attemptId}`);
  } catch {
    return { success: false, message: 'Erro ao carregar a revisão da tentativa' };
  }
}

/**
 * Paga uma tentativa extra do exame final por M-Pesa. Como na compra de curso,
 * é síncrono: só volta depois de o aluno confirmar (ou recusar) no telemóvel.
 * O preço é decidido pelo LMS, nunca enviado daqui.
 */
export async function purchaseExamRetake(
  assessmentId: string,
  phone: string,
): Promise<ActionResponse<PurchaseResult>> {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 9) {
    return { success: false, message: 'Número de telefone inválido' };
  }

  try {
    const result = await apiPost<PurchaseResult>(`/assessments/${assessmentId}/retake/purchase`, {
      paymentMethod: 'mpesa',
      phone: digits,
    });

    if (result.data?.status === 'completed' || result.data?.status === 'pending') {
      revalidatePath('/perfil/meus-cursos/[slug]', 'page');
    }

    return result;
  } catch {
    return { success: false, message: 'Erro de conexão com o servidor de pagamentos' };
  }
}
