"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  LogOut,
  Maximize2,
  RotateCcw,
  ShieldAlert,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  getAssessmentByLesson,
  getAttemptReview,
  saveAttemptDraft,
  startAttempt,
  submitQuizAttempt,
  type AttemptReview,
  type AttemptSubmitReason,
  type FinalExamAttempts,
  type QuizAnswerInput,
  type QuizAssessment,
  type QuizQuestion,
  type SubmitResult,
} from "@/actions/assessment-actions";
import type { Lesson } from "@/types";
import { CertificateDialog, type CertificateOffer } from "@/components/certificates/certificate-dialog";
import { ExamRetakeDialog } from "@/components/my-courses/exam-retake-dialog";
import { formatPrice } from "@/lib/format";
import { useExamGuard } from "@/components/my-courses/use-exam-guard";
import { ExamWatermark, type ExamStudent } from "@/components/my-courses/exam-watermark";

interface QuizViewerProps {
  /** Aula do tipo QUIZ — a avaliação é carregada por `lessonId`. */
  lesson?: Lesson;
  /** Avaliação já carregada (teste de módulo ou exame final). */
  assessment?: QuizAssessment;
  onCompleted?: () => void;
  /** Para o pop-up do certificado, ao passar o exame final. */
  courseTitle?: string;
  /** Telefone do perfil, para pré-preencher o pagamento do certificado. */
  defaultPhone?: string | null;
  /** Para a marca de água dos testes de módulo e do exame final. */
  student?: ExamStudent | null;
}

type Phase = "loading" | "intro" | "quiz" | "result" | "review" | "error";

export function QuizViewer({ lesson, assessment: given, onCompleted, courseTitle, defaultPhone, student }: QuizViewerProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>(given ? "intro" : "loading");
  const [assessment, setAssessment] = useState<QuizAssessment | null>(given ?? null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [attemptNumber, setAttemptNumber] = useState<number | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [written, setWritten] = useState<Record<string, string>>({});
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [review, setReview] = useState<AttemptReview | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [starting, setStarting] = useState(false);
  const [certificate, setCertificate] = useState<CertificateOffer | null>(null);
  const [certificateOpen, setCertificateOpen] = useState(false);
  // Exame final: o servidor decide as tentativas; actualiza-se com o que a
  // submissão devolve e com a compra de uma repetição.
  const [examAttempts, setExamAttempts] = useState<FinalExamAttempts | null>(given?.examAttempts ?? null);
  const [retakeOpen, setRetakeOpen] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);
  const quizRef = useRef<HTMLDivElement>(null);

  const totalQuestions = assessment?.questions.length ?? 0;
  const current: QuizQuestion | null = assessment?.questions[currentIdx] ?? null;

  const lessonId = lesson?.id ?? null;
  const hasGivenAssessment = Boolean(given);
  // Modo antifraude: testes de módulo e exame final. Os quizzes de aula não.
  const guarded = Boolean(assessment && GUARDED_TYPES.includes(assessment.type));

  const load = useCallback(async () => {
    setPhase("loading");
    if (!lessonId) {
      setPhase("error");
      return;
    }
    const res = await getAssessmentByLesson(lessonId);
    if (!res.success || !res.data || res.data.questions.length === 0) {
      setPhase("error");
      return;
    }
    setAssessment(res.data);
    setPhase("intro");
  }, [lessonId]);

  useEffect(() => {
    // A avaliação pode já vir pronta (teste de módulo / exame final).
    if (hasGivenAssessment) return;
    // Data fetch on mount — setState happens inside the async resolver, not the effect body
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [hasGivenAssessment, load]);

  useEffect(() => {
    if (phase !== "quiz" || secondsLeft === null) return;
    const t = setInterval(() => setSecondsLeft((s) => (s === null ? s : Math.max(0, s - 1))), 1000);
    return () => clearInterval(t);
  }, [phase, secondsLeft]);

  const toggleEnterFullscreen = useCallback(() => {
    const el = quizRef.current;
    if (el && !document.fullscreenElement) {
      el.requestFullscreen?.().catch(() => {});
    }
  }, []);

  const exitFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
  };

  /**
   * Cada ida ao quiz é uma tentativa nova no servidor. Antes, "Tentar
   * novamente" reaproveitava o `attemptId` já submetido — a segunda
   * submissão era rejeitada, e o limite de tentativas nunca era respeitado.
   */
  const startQuiz = async () => {
    if (!assessment || starting) return;
    setStarting(true);
    // Pede-se já, ainda dentro do clique: depois do `await` o browser pode
    // deixar de o considerar um gesto do aluno e recusar o ecrã inteiro.
    toggleEnterFullscreen();

    const res = await startAttempt(assessment.id);
    setStarting(false);

    if (!res.success || !res.data) {
      exitFullscreen();
      toast.error(res.message || "Não foi possível iniciar a avaliação");
      return;
    }

    setAttemptId(res.data.id);
    setAttemptNumber(res.data.attemptNumber);
    setSelected({});
    setWritten({});
    setResult(null);
    setReview(null);
    setCurrentIdx(0);
    setSecondsLeft(assessment.timeLimit ? assessment.timeLimit * 60 : null);
    setConfirmExit(false);
    guard.reset();
    toggleEnterFullscreen();
    setPhase("quiz");
  };

  const isMulti = current?.questionType === "MULTIPLE_CHOICE";
  const isEssay = current?.questionType === "ESSAY";
  const selection = current ? (selected[current.id] ?? []) : [];
  const essayText = current ? (written[current.id] ?? "") : "";
  const answered = isEssay ? essayText.trim().length > 0 : selection.length > 0;

  const toggleOption = (optionId: string) => {
    if (!current) return;
    setSelected((prev) => {
      const cur = prev[current.id] ?? [];
      if (isMulti) {
        return {
          ...prev,
          [current.id]: cur.includes(optionId)
            ? cur.filter((id) => id !== optionId)
            : [...cur, optionId],
        };
      }
      return { ...prev, [current.id]: [optionId] };
    });
  };

  const goPrev = () => setCurrentIdx((i) => Math.max(0, i - 1));
  const goNext = () => setCurrentIdx((i) => Math.min(totalQuestions - 1, i + 1));

  const handleSubmit = async (reason: SubmitReason = "MANUAL") => {
    if (!attemptId || loadingSubmit || !assessment) return;
    setLoadingSubmit(true);
    setConfirmExit(false);

    const res = await submitQuizAttempt(attemptId, buildAnswers(assessment, selected, written), {
      reason,
      violationCount: guard.violations,
    });
    setLoadingSubmit(false);

    if (res.success && res.data) {
      // Só depois de submetida: sair do ecrã inteiro com a tentativa ainda
      // aberta contaria como saída.
      exitFullscreen();
      setResult(res.data);
      if (res.data.examAttempts) setExamAttempts(res.data.examAttempts);
      setPhase("result");
      if (res.data.passed && onCompleted) onCompleted();

      // Exame final aprovado: o servidor já criou o certificado — oferece-se
      // logo (pagar agora ou mais tarde, ou "já está disponível" no Interativo).
      if (res.data.certificate) {
        setCertificate({ ...res.data.certificate, courseTitle: courseTitle ?? assessment.title });
        setCertificateOpen(true);
        router.refresh();
      }
    } else {
      toast.error(res.message || "Falha ao submeter a avaliação");
    }
  };

  const maxWarnings = assessment?.maxWarnings ?? EXAM_MAX_WARNINGS;

  const guard = useExamGuard({
    active: guarded && phase === "quiz" && Boolean(attemptId) && !loadingSubmit,
    containerRef: quizRef,
    maxWarnings,
    onLimit: () => handleSubmit("LEFT_PAGE"),
    // A página está a fechar: o beacon é o único pedido que o browser garante
    // enviar. Se nem esse sair, o servidor fecha a tentativa como ABANDONED
    // com o rascunho, quando o aluno voltar a começar.
    onLeave: (violationCount) => {
      if (!attemptId || !assessment) return;
      const body = JSON.stringify({ answers: buildAnswers(assessment, selected, written), violationCount });
      navigator.sendBeacon(`/api/attempts/${attemptId}/submit`, new Blob([body], { type: "application/json" }));
    },
  });

  // Rascunho contínuo dos testes e do exame: as respostas vão ficando no
  // servidor, para uma saída sem beacon (browser que rebenta, bateria) não as
  // perder.
  useEffect(() => {
    if (!guarded || phase !== "quiz" || !attemptId || !assessment) return;
    const t = setTimeout(() => {
      saveAttemptDraft(attemptId, buildAnswers(assessment, selected, written));
    }, 1500);
    return () => clearTimeout(t);
  }, [guarded, phase, attemptId, assessment, selected, written]);

  // Auto-submit on timeout — declared after handleSubmit
  useEffect(() => {
    if (phase === "quiz" && secondsLeft === 0 && attemptId && !loadingSubmit) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      handleSubmit("TIMEOUT");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, phase, attemptId, loadingSubmit]);

  const openReview = async () => {
    if (!attemptId) return;
    const res = await getAttemptReview(attemptId);
    if (!res.success || !res.data) {
      toast.error(res.message || "Não foi possível carregar a revisão");
      return;
    }
    setReview(res.data);
    setPhase("review");
  };

  const timeLabel = secondsLeft === null ? null : formatTime(secondsLeft);
  const attemptsLeft = examAttempts
    ? examAttempts.remaining
    : assessment?.maximumAttempts != null && attemptNumber != null
      ? Math.max(0, assessment.maximumAttempts - attemptNumber)
      : null;
  // Há uma repetição para comprar — ou uma compra por confirmar, que o mesmo
  // pop-up deixa reconsultar.
  const retakeOffer =
    examAttempts && (examAttempts.canPurchaseRetake || examAttempts.pendingPaymentId) ? examAttempts : null;

  const onRetakePaid = () => {
    setExamAttempts((prev) =>
      prev && {
        ...prev,
        paidAttempts: prev.paidAttempts + 1,
        allowed: prev.allowed + 1,
        remaining: prev.remaining + 1,
        canPurchaseRetake: false,
        pendingPaymentId: null,
      },
    );
    router.refresh();
  };

  return (
    <div
      ref={quizRef}
      className={cn(
        "relative w-full overflow-hidden rounded-xl border border-border bg-card [&:fullscreen]:overflow-y-auto",
        // Nada para copiar nem imprimir enquanto decorre um teste ou exame.
        guarded && phase === "quiz" && "select-none print:hidden",
      )}
    >
      {phase === "loading" && (
        <div className="grid min-h-[300px] place-items-center p-8 text-sm text-muted-foreground">
          A carregar avaliação…
        </div>
      )}

      {phase === "error" && (
        <div className="grid min-h-[300px] place-items-center p-8 text-center">
          <div className="space-y-3">
            <AlertTriangle className="mx-auto size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Não foi possível carregar a avaliação desta aula.
            </p>
          </div>
        </div>
      )}

      {phase === "intro" && assessment && (
        <QuizIntro
          assessment={assessment}
          guarded={guarded}
          maxWarnings={maxWarnings}
          examAttempts={examAttempts}
          retakeOffer={retakeOffer}
          starting={starting}
          onStart={startQuiz}
          onBuyRetake={() => setRetakeOpen(true)}
        />
      )}

      {phase === "quiz" && assessment && current && (
        <div className="relative flex w-full flex-col bg-background">
          {guarded && student && <ExamWatermark student={student} />}
          <QuizHeader
            title={assessment.title}
            current={currentIdx + 1}
            total={totalQuestions}
            timeLabel={timeLabel}
            guarded={guarded}
            onExit={() => {
              if (guarded) {
                setConfirmExit(true);
                return;
              }
              exitFullscreen();
              setPhase("intro");
            }}
          />
          <Progress value={((currentIdx + 1) / totalQuestions) * 100} className="h-1" />

          <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-6 px-6 py-10">
            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                Pergunta {currentIdx + 1} de {totalQuestions}
              </p>
              <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{current.question}</h2>
              <p className="text-xs text-muted-foreground">
                {isEssay
                  ? "Escreva a sua resposta — será corrigida pelo formador"
                  : isMulti
                    ? "Selecione uma ou mais opções"
                    : "Selecione uma opção"}
              </p>
            </div>

            {isEssay ? (
              <Textarea
                value={essayText}
                onChange={(e) => setWritten((prev) => ({ ...prev, [current.id]: e.target.value }))}
                placeholder="Escreva aqui a sua resposta…"
                className={cn("min-h-40", guarded && "relative z-20 select-text")}
              />
            ) : (
              <div className="grid gap-3">
                {current.options.map((opt) => {
                  const active = selection.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => toggleOption(opt.id)}
                      aria-pressed={active}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5 text-left text-sm font-medium transition-all hover:border-primary/60 cursor-pointer",
                        active && "border-primary bg-primary-soft ring-1 ring-primary",
                      )}
                    >
                      <span
                        className={cn(
                          "grid size-5 shrink-0 place-items-center border border-muted-foreground/50",
                          isMulti ? "rounded-md" : "rounded-full",
                          active && "border-primary bg-primary",
                        )}
                      >
                        {active && <span className="size-2 rounded-sm bg-background" />}
                      </span>
                      <span>{opt.answer}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="border-t border-border bg-background px-6 py-4">
            <div className="mx-auto flex max-w-2xl items-center justify-between gap-2">
              <Button variant="outline" onClick={goPrev} disabled={currentIdx === 0}>
                <ChevronLeft className="size-4" /> Anterior
              </Button>
              {currentIdx < totalQuestions - 1 ? (
                <Button onClick={goNext} disabled={!answered}>
                  Próxima <ChevronRight className="size-4" />
                </Button>
              ) : (
                <Button onClick={() => handleSubmit()} disabled={loadingSubmit} className="cursor-pointer">
                  {loadingSubmit ? "A submeter…" : "Submeter avaliação"}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dentro do contentor, e não num Dialog: um portal no <body> ficaria
          por trás do ecrã inteiro e o aluno não o veria. */}
      {phase === "quiz" && guard.warningOpen && !loadingSubmit && (
        <ExamOverlay
          icon={<ShieldAlert className="size-10 text-destructive" />}
          title="Saiu da avaliação"
          description={
            <>
              Ficou registado que saiu da página ou do ecrã inteiro.{" "}
              {maxWarnings - guard.violations > 0
                ? `Ainda tem ${maxWarnings - guard.violations} ${maxWarnings - guard.violations === 1 ? "aviso" : "avisos"}; depois disso, ao sair, as suas respostas serão `
                : "Se voltar a sair, as suas respostas serão "}
              <span className="font-semibold text-foreground">submetidas automaticamente</span> e a tentativa conta
              como usada.
            </>
          }
        >
          <Button className="w-full cursor-pointer" onClick={guard.resume}>
            <Maximize2 className="size-4" /> Voltar à avaliação
          </Button>
        </ExamOverlay>
      )}

      {phase === "quiz" && confirmExit && (
        <ExamOverlay
          icon={<LogOut className="size-10 text-primary" />}
          title="Submeter e sair?"
          description="As respostas dadas até agora são submetidas e corrigidas, e a tentativa conta como usada. As perguntas sem resposta valem zero."
        >
          <div className="flex w-full flex-col gap-2 sm:flex-row">
            <Button variant="outline" className="flex-1 cursor-pointer" onClick={() => setConfirmExit(false)}>
              Continuar a avaliação
            </Button>
            <Button className="flex-1 cursor-pointer" onClick={() => handleSubmit()} disabled={loadingSubmit}>
              {loadingSubmit ? "A submeter…" : "Submeter e sair"}
            </Button>
          </div>
        </ExamOverlay>
      )}

      {phase === "result" && result && assessment && (
        <QuizResult
          result={result}
          minimumScore={assessment.minimumScore}
          questionCount={totalQuestions}
          showScoreImmediately={assessment.showScoreImmediately}
          reviewRequiresPass={REVIEW_REQUIRES_PASS.includes(assessment.type)}
          attemptsLeft={attemptsLeft}
          blockedRetry={Boolean(examAttempts?.awaitingCorrection)}
          retakeOffer={retakeOffer}
          onBuyRetake={() => setRetakeOpen(true)}
          onRetry={startQuiz}
          onReview={openReview}
          certificate={certificate}
          onCertificate={() => setCertificateOpen(true)}
        />
      )}

      {phase === "review" && review && (
        <QuizReview review={review} onBack={() => setPhase("result")} />
      )}

      <CertificateDialog
        open={certificateOpen}
        onOpenChange={setCertificateOpen}
        certificate={certificate}
        defaultPhone={defaultPhone}
      />

      {assessment && retakeOffer && (
        <ExamRetakeDialog
          open={retakeOpen}
          onOpenChange={setRetakeOpen}
          assessmentId={assessment.id}
          examTitle={assessment.title}
          price={retakeOffer.retakePrice}
          pendingPaymentId={retakeOffer.pendingPaymentId}
          defaultPhone={defaultPhone}
          onPaid={onRetakePaid}
        />
      )}
    </div>
  );
}

function QuizIntro({
  assessment,
  guarded,
  maxWarnings,
  examAttempts,
  retakeOffer,
  starting,
  onStart,
  onBuyRetake,
}: {
  assessment: QuizAssessment;
  guarded: boolean;
  maxWarnings: number;
  examAttempts: FinalExamAttempts | null;
  retakeOffer: FinalExamAttempts | null;
  starting: boolean;
  onStart: () => void;
  onBuyRetake: () => void;
}) {
  const [accepted, setAccepted] = useState(false);
  // O servidor recusaria o `startAttempt` em qualquer destes casos — aqui só
  // se explica porquê, em vez de deixar o aluno carregar e levar um erro.
  const examBlock = !examAttempts
    ? null
    : examAttempts.passed
      ? "Já foi aprovado neste exame."
      : examAttempts.awaitingCorrection
        ? "A sua última tentativa aguarda correcção do formador."
        : examAttempts.remaining === 0
          ? retakeOffer?.pendingPaymentId
            ? "Esgotou as tentativas. O pagamento da nova tentativa ainda está por confirmar."
            : retakeOffer
              ? `Esgotou as tentativas. Cada nova tentativa custa ${formatPrice(retakeOffer.retakePrice)}.`
              : "Esgotou as tentativas deste exame."
          : null;

  return (
    <div className="flex min-h-[300px] flex-col gap-5 p-8">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          {ASSESSMENT_TYPE_LABEL[assessment.type] ?? "Avaliação"}
        </p>
        <h2 className="text-2xl font-bold tracking-tight">{assessment.title}</h2>
        {assessment.description && (
          <p className="text-sm text-muted-foreground">{assessment.description}</p>
        )}
      </div>
      <ul className="space-y-2 text-sm text-muted-foreground">
        <li className="flex items-center gap-2">
          <span className="text-lg font-semibold text-foreground">{assessment.questions.length}</span> perguntas
        </li>
        <li className="flex items-center gap-2">
          Nota mínima: <span className="font-semibold text-foreground">{assessment.minimumScore}%</span>
        </li>
        {assessment.timeLimit ? (
          <li className="flex items-center gap-2">
            <Clock className="size-4" /> {assessment.timeLimit} minutos
          </li>
        ) : null}
        {examAttempts ? (
          <li className="flex items-center gap-2">
            {examAttempts.used === 0
              ? `${examAttempts.allowed} ${examAttempts.allowed === 1 ? "tentativa" : "tentativas"}`
              : `${examAttempts.used} de ${examAttempts.allowed} tentativas usadas`}
            {examAttempts.retakePrice > 0 &&
              ` · depois, ${formatPrice(examAttempts.retakePrice)} por cada tentativa extra`}
          </li>
        ) : (
          <li className="flex items-center gap-2">
            {assessment.maximumAttempts != null
              ? `Máximo de ${assessment.maximumAttempts} ${assessment.maximumAttempts === 1 ? "tentativa" : "tentativas"}`
              : "Tentativas ilimitadas"}
          </li>
        )}
        <li className="flex items-center gap-2">
          <Maximize2 className="size-4" /> A avaliação abre em ecrã inteiro
        </li>
      </ul>
      {guarded && (
        <div className="space-y-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <ShieldAlert className="size-4 text-destructive" /> Regras da avaliação
          </p>
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
            <li>
              Não pode sair desta página, mudar de separador ou de janela, nem sair do ecrã inteiro.{" "}
              {maxWarnings === 0
                ? "À primeira saída, as respostas são "
                : `${maxWarnings === 1 ? "À primeira saída recebe um aviso" : `Nas primeiras ${maxWarnings} saídas recebe um aviso`}; à ${EXIT_ORDINAL[maxWarnings + 1] ?? `${maxWarnings + 1}.ª`}, as respostas são `}
              <strong className="text-foreground">submetidas automaticamente</strong>.
            </li>
            <li>
              Se fechar, recarregar ou sair da página, as respostas que tiver dado são submetidas e a tentativa conta
              como usada.
            </li>
            <li>O texto da avaliação não pode ser seleccionado nem copiado, e colar está desactivado.</li>
            <li>
              Capturas de ecrã e impressão não são permitidas. A tecla Print Screen conta como saída, e as perguntas
              têm uma marca de água com o seu nome e email.
            </li>
          </ul>
          <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium">
            <Checkbox checked={accepted} onCheckedChange={(checked) => setAccepted(checked === true)} />
            Li e aceito as regras da avaliação
          </label>
        </div>
      )}
      <div className="mt-auto space-y-2">
        {/* Segunda linha de defesa: a barra lateral já não deixa abrir uma
            avaliação bloqueada, mas se chegar aqui por outro caminho o botão
            continua fechado. A autoridade é do servidor, que recusa o
            `startAttempt` com 403. */}
        {assessment.locked && (
          <p className="text-sm text-muted-foreground">
            Conclui {assessment.unlockAtProgress}% do curso para desbloquear esta avaliação — estás em{" "}
            {assessment.currentProgress}%.
          </p>
        )}
        {!assessment.locked && examBlock && <p className="text-sm text-muted-foreground">{examBlock}</p>}
        {!assessment.locked && examAttempts?.remaining === 0 && retakeOffer ? (
          <Button className="w-full cursor-pointer" onClick={onBuyRetake}>
            <RotateCcw className="size-4" />
            {retakeOffer.pendingPaymentId ? "Verificar pagamento" : "Pagar nova tentativa"}
          </Button>
        ) : (
          <Button
            className="w-full cursor-pointer"
            onClick={onStart}
            disabled={starting || assessment.locked || Boolean(examBlock) || (guarded && !accepted)}
          >
            {starting ? "A iniciar…" : "Começar avaliação"}
          </Button>
        )}
      </div>
    </div>
  );
}

function QuizHeader({
  title,
  current,
  total,
  timeLabel,
  guarded,
  onExit,
}: {
  title: string;
  current: number;
  total: number;
  timeLabel: string | null;
  /** Nos testes e no exame, sair é submeter — o botão di-lo. */
  guarded: boolean;
  onExit: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border bg-background px-6 py-4">
      <div className="min-w-0">
        <h3 className="truncate font-semibold">{title}</h3>
        <p className="text-xs text-muted-foreground">
          Pergunta {current} de {total}
        </p>
      </div>
      {timeLabel && (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
          <Clock className="size-3.5" /> {timeLabel}
        </span>
      )}
      {guarded ? (
        <Button variant="outline" size="sm" className="cursor-pointer" onClick={onExit}>
          <LogOut className="size-4" /> Submeter e sair
        </Button>
      ) : (
        <Button variant="ghost" size="icon" aria-label="Sair da avaliação" onClick={onExit}>
          <X className="size-4" />
        </Button>
      )}
    </div>
  );
}

function QuizResult({
  result,
  minimumScore,
  questionCount,
  showScoreImmediately,
  reviewRequiresPass,
  attemptsLeft,
  blockedRetry,
  retakeOffer,
  onBuyRetake,
  onRetry,
  onReview,
  certificate,
  onCertificate,
}: {
  result: SubmitResult;
  minimumScore: number;
  questionCount: number;
  showScoreImmediately: boolean;
  /** Teste de módulo e exame final não se revêem antes de aprovados — ver `canReview`. */
  reviewRequiresPass: boolean;
  attemptsLeft: number | null;
  /** Exame final com desenvolvimento por corrigir: só se repete depois da correcção. */
  blockedRetry: boolean;
  retakeOffer: FinalExamAttempts | null;
  onBuyRetake: () => void;
  onRetry: () => void;
  onReview: () => void;
  certificate: CertificateOffer | null;
  onCertificate: () => void;
}) {
  // `percentage`/`passed` vêm a `null` quando há perguntas de desenvolvimento
  // por corrigir — nesse caso não há nota para mostrar, e dizer "0%" seria
  // mentira.
  const awaitingCorrection = result.percentage === null;
  const hideScore = awaitingCorrection || !showScoreImmediately;
  // No teste de módulo e no exame final a revisão só abre depois de aprovado:
  // quem reprova tem (ou pode comprar) outra tentativa sobre as mesmas
  // perguntas, e rever daria-lhe as opções certas e as explicações. O servidor
  // recusa a revisão nos mesmos termos — aqui apenas não se mostra o botão.
  const canReview = !hideScore && (!reviewRequiresPass || result.passed === true);
  // Depois de aprovado, repetir só serve para melhorar a nota — deixa de ser
  // a acção principal (e no exame final, já com certificado, sai de vez).
  const canRetry = (attemptsLeft === null || attemptsLeft > 0) && !certificate && !blockedRetry;
  // Exame final reprovado sem tentativas: a única saída é pagar uma repetição.
  const offerRetake = attemptsLeft === 0 && retakeOffer !== null && !certificate;

  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center gap-5 p-8 text-center">
      {certificate || (!hideScore && result.passed) ? (
        <CheckCircle2 className="size-14 text-success" />
      ) : hideScore ? (
        <CheckCircle2 className="size-14 text-primary" />
      ) : (
        <XCircle className="size-14 text-destructive" />
      )}

      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">
          {/* O certificado já denuncia a aprovação — esconder a nota não pode
              dizer "a nota será divulgada" ao lado de "o certificado está pronto". */}
          {certificate ? "Aprovado!" : hideScore ? "Respostas submetidas" : result.passed ? "Aprovado!" : "Não passou"}
        </h2>
        {certificate && hideScore ? (
          <p className="text-sm text-muted-foreground">Concluiu o exame final com aproveitamento.</p>
        ) : hideScore ? (
          <p className="text-sm text-muted-foreground">
            {awaitingCorrection
              ? "Há perguntas de desenvolvimento à espera de correcção do formador."
              : "A nota será divulgada pelo formador."}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Nota: <span className="font-semibold text-foreground">{result.percentage}%</span> · mínimo{" "}
            {minimumScore}%
          </p>
        )}
        <p className="text-xs text-muted-foreground">{questionCount} perguntas</p>
        {result.submitReason && AUTO_SUBMIT_NOTE[result.submitReason] && (
          <p className="flex items-center justify-center gap-1.5 pt-1 text-xs font-medium text-destructive">
            <ShieldAlert className="size-3.5" /> {AUTO_SUBMIT_NOTE[result.submitReason]}
          </p>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
        {canReview && (
          <Button variant="outline" onClick={onReview} className="cursor-pointer">
            Rever respostas
          </Button>
        )}
        {canRetry && (
          <Button
            variant={hideScore || result.passed ? "outline" : "default"}
            onClick={onRetry}
            className="cursor-pointer"
          >
            Tentar novamente
          </Button>
        )}
        {offerRetake && (
          <Button onClick={onBuyRetake} className="cursor-pointer">
            <RotateCcw className="size-4" />
            {retakeOffer.pendingPaymentId
              ? "Verificar pagamento"
              : `Pagar nova tentativa · ${formatPrice(retakeOffer.retakePrice)}`}
          </Button>
        )}
        {certificate && (
          <Button onClick={onCertificate} className="cursor-pointer">
            <Award className="size-4" />
            {certificate.status === "PENDING_PAYMENT" ? "Obter certificado" : "Ver certificado"}
          </Button>
        )}
      </div>

      {attemptsLeft !== null && !certificate && (
        <p className="text-xs text-muted-foreground">
          {blockedRetry
            ? "Pode voltar a tentar depois da correcção do formador, se não passar."
            : attemptsLeft === 0
              ? "Sem tentativas restantes."
              : `${attemptsLeft} ${attemptsLeft === 1 ? "tentativa restante" : "tentativas restantes"}.`}
        </p>
      )}
    </div>
  );
}

function QuizReview({ review, onBack }: { review: AttemptReview; onBack: () => void }) {
  return (
    <div className="space-y-5 p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Revisão das respostas</h2>
          <p className="text-sm text-muted-foreground">
            Tentativa {review.attemptNumber}
            {review.percentage !== null && ` · ${review.percentage}%`}
          </p>
        </div>
        <Button variant="outline" onClick={onBack} className="cursor-pointer">
          Voltar ao resultado
        </Button>
      </div>

      <ol className="space-y-4">
        {review.assessment.questions.map((question, index) => {
          const given = review.answers.filter((a) => a.questionId === question.id);
          const chosenIds = given.map((a) => a.selectedOptionId).filter(Boolean) as string[];
          const essayAnswer = given.find((a) => a.writtenAnswer)?.writtenAnswer;
          const isCorrect = given.length > 0 && given.every((a) => a.isCorrect === true);
          const pending = given.some((a) => a.isCorrect === null);

          return (
            <li key={question.id} className="space-y-2 rounded-xl border border-border p-4">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0">
                  {pending ? (
                    <Clock className="size-4 text-muted-foreground" />
                  ) : isCorrect ? (
                    <CheckCircle2 className="size-4 text-success" />
                  ) : (
                    <XCircle className="size-4 text-destructive" />
                  )}
                </span>
                <p className="text-sm font-semibold">
                  {index + 1}. {question.question}
                </p>
              </div>

              {question.questionType === "ESSAY" ? (
                <p className="rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">
                  {essayAnswer || "Sem resposta."}
                </p>
              ) : (
                <ul className="space-y-1.5 pl-6">
                  {question.options.map((option) => {
                    const chosen = chosenIds.includes(option.id);
                    return (
                      <li
                        key={option.id}
                        className={cn(
                          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
                          option.isCorrect && "bg-success/10 font-medium text-success",
                          chosen && !option.isCorrect && "bg-destructive/10 text-destructive",
                        )}
                      >
                        {option.answer}
                        {chosen && <span className="text-xs">(a sua resposta)</span>}
                      </li>
                    );
                  })}
                </ul>
              )}

              {question.explanation && (
                <p className="rounded-lg bg-primary-soft/50 p-3 text-sm text-muted-foreground">
                  {question.explanation}
                </p>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/**
 * Avaliações que só se revêem depois de aprovadas. Espelha
 * `REVIEW_REQUIRES_PASS` no `AssessmentService`, que é quem recusa de facto a
 * revisão — o quiz de aula revê-se sempre.
 */
const REVIEW_REQUIRES_PASS: string[] = ["MODULE_TEST", "FINAL_EXAM"];

/**
 * Modo antifraude (ver `useExamGuard`): o mesmo par de tipos que o
 * `GUARDED_TYPES` do `AssessmentService`, que fecha como ABANDONED a tentativa
 * deixada aberta em vez de a retomar.
 */
const GUARDED_TYPES: string[] = ["MODULE_TEST", "FINAL_EXAM"];

/**
 * Saídas toleradas com aviso; a seguinte submete. O valor vem do servidor
 * (`assessment.maxWarnings`, Definições do painel); este é só o fallback para
 * um backend que ainda não o envie.
 */
const EXAM_MAX_WARNINGS = 1;

const EXIT_ORDINAL: Record<number, string> = { 2: "segunda", 3: "terceira", 4: "quarta", 5: "quinta", 6: "sexta" };

type SubmitReason = Exclude<AttemptSubmitReason, "ABANDONED">;

const AUTO_SUBMIT_NOTE: Partial<Record<AttemptSubmitReason, string>> = {
  TIMEOUT: "Submetida automaticamente: o tempo acabou.",
  LEFT_PAGE: "Submetida automaticamente: saiu da avaliação depois do aviso.",
  ABANDONED: "Submetida automaticamente: a avaliação ficou aberta e foi abandonada.",
};

/**
 * Uma entrada por opção escolhida: é o que o servidor conta para pontuar
 * escolha múltipla. Antes só ia a primeira opção — a resposta ficava sempre
 * errada por construção.
 */
function buildAnswers(
  assessment: QuizAssessment,
  selected: Record<string, string[]>,
  written: Record<string, string>,
): QuizAnswerInput[] {
  const payload: QuizAnswerInput[] = [];
  for (const question of assessment.questions) {
    if (question.questionType === "ESSAY") {
      const text = written[question.id]?.trim();
      if (text) payload.push({ questionId: question.id, writtenAnswer: text });
      continue;
    }
    for (const optionId of selected[question.id] ?? []) {
      payload.push({ questionId: question.id, selectedOptionId: optionId });
    }
  }
  return payload;
}

/** Aviso bloqueante sobre a avaliação, dentro do contentor em ecrã inteiro. */
function ExamOverlay({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 grid place-items-center bg-background/95 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-md space-y-4 rounded-xl border border-border bg-card p-6 text-center shadow-lg">
        <div className="flex justify-center">{icon}</div>
        <div className="space-y-1.5">
          <h3 className="text-lg font-bold tracking-tight">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

const ASSESSMENT_TYPE_LABEL: Record<string, string> = {
  QUIZ: "Avaliação",
  MODULE_TEST: "Teste do módulo",
  FINAL_EXAM: "Exame final",
};

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
