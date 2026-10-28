"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Award, CheckCircle2, ChevronLeft, ChevronRight, ClipboardCheck, Lock, MessageSquareText, PlayCircle } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/EmptyState";
import { Button, buttonVariants } from "@/components/ui/button";
import { LessonViewer } from "@/components/my-courses/lesson-viewer";
import { QuizViewer } from "@/components/my-courses/quiz-viewer";
import type { ExamStudent } from "@/components/my-courses/exam-watermark";
import { CourseProgressSidebar } from "@/components/my-courses/course-progress-sidebar";
import { AskInstructorModal } from "@/components/my-courses/ask-instructor-modal";
import { toggleLessonProgress } from "@/actions/progress-actions";
import type { QuizAssessment } from "@/actions/assessment-actions";
import type { UserCertificate } from "@/actions/certificate-actions";
import { CertificateDialog, CERTIFICATES_TAB_HREF } from "@/components/certificates/certificate-dialog";
import { formatPrice } from "@/lib/format";
import { useTimeOnLesson } from "@/hooks/use-time-on-lesson";
import { cn } from "@/lib/utils";
import type { CourseWithRelations } from "@/types";

export function CoursePlayerView({
  course,
  isEnrolled = false,
  enrollmentId,
  completedLessonIds = [],
  watchedSecondsByLesson = {},
  assessments = [],
  canAskInstructor = false,
  certificate = null,
  profilePhone = null,
  student = null,
}: {
  course: CourseWithRelations;
  isEnrolled?: boolean;
  enrollmentId?: string;
  /** Só o pacote Interativo dá direito a perguntar ao formador — é o que o servidor exige. */
  canAskInstructor?: boolean;
  /** Aulas já concluídas, vindas do servidor (`GET /courses/:id/progress`). */
  completedLessonIds?: string[];
  /** Tempo já acumulado por aula, para não o sobrepor com o desta sessão. */
  watchedSecondsByLesson?: Record<string, number>;
  /** Avaliações do curso — os quizzes de aula aparecem dentro da própria aula. */
  assessments?: QuizAssessment[];
  /** Certificado desta matrícula, se o aluno já for elegível (pago ou por pagar). */
  certificate?: UserCertificate | null;
  /** Para pré-preencher o número M-Pesa no pagamento do certificado. */
  profilePhone?: string | null;
  /** Para a marca de água dos testes de módulo e do exame final. */
  student?: ExamStudent | null;
}) {
  const router = useRouter();
  const [certificateOpen, setCertificateOpen] = useState(false);
  const [done, setDone] = useState<string[]>(completedLessonIds);
  const [watched, setWatched] = useState<Record<string, number>>(watchedSecondsByLesson);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeAssessmentId, setActiveAssessmentId] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [askOpen, setAskOpen] = useState(false);

  const flat = useMemo(
    () =>
      course.modules.flatMap((m) => m.lessons.map((lesson) => ({ lesson, module: m }))) ?? [],
    [course],
  );

  /**
   * Testes de módulo e exame final. Os quizzes ligados a uma aula ficam de
   * fora — esses já são a própria aula. Ordena-se por módulo, com o exame
   * final no fim.
   */
  const courseAssessments = useMemo(() => {
    const moduleOrder = new Map(course.modules.map((m, index) => [m.id, index]));
    return assessments
      .filter((a) => !a.lessonId)
      .map((a) => ({
        assessment: a,
        moduleTitle: a.moduleId
          ? course.modules.find((m) => m.id === a.moduleId)?.title
          : undefined,
        order: a.moduleId ? (moduleOrder.get(a.moduleId) ?? 0) : Number.MAX_SAFE_INTEGER,
      }))
      .sort((a, b) => a.order - b.order);
  }, [assessments, course.modules]);

  const activeAssessment = courseAssessments.find((a) => a.assessment.id === activeAssessmentId);

  const current = flat.find((f) => f.lesson.id === activeId) ?? flat[0];
  const currentIndex = flat.findIndex((f) => f.lesson.id === current?.lesson.id);
  const nextEntry = currentIndex >= 0 ? flat[currentIndex + 1] : undefined;

  const isDone = current ? done.includes(current.lesson.id) : false;

  const timeOnLesson = useTimeOnLesson(current?.lesson.id ?? null);

  if (!isEnrolled) {
    return (
      <div className="container-page py-20">
        <EmptyState
          icon={PlayCircle}
          title="Você ainda não tem acesso a este curso"
          description="Adquira o curso para desbloquear todas as aulas, recursos e o certificado de conclusão."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Link href={`/inscrever-se/${course.slug}`}>
                <Button>Adquirir agora</Button>
              </Link>
              <Link href={`/curso/${course.slug}`}>
                <Button variant="outline">Ver detalhes</Button>
              </Link>
            </div>
          }
        />
      </div>
    );
  }

  const setLessonDone = async (lessonId: string, completed: boolean) => {
    setPending(lessonId);
    const prev = done;
    const next = completed
      ? prev.includes(lessonId)
        ? prev
        : [...prev, lessonId]
      : prev.filter((id) => id !== lessonId);
    setDone(next);

    // O servidor substitui `watchedDuration` em vez de o somar, por isso
    // acumula-se aqui: o que já lá estava mais o tempo desta sessão. Só a
    // aula activa é que esteve a contar.
    const sessionSeconds = lessonId === current?.lesson.id ? timeOnLesson.read() : 0;
    const totalSeconds = (watched[lessonId] ?? 0) + sessionSeconds;

    const res = await toggleLessonProgress(lessonId, completed, totalSeconds);
    setPending(null);

    if (!res.success) {
      setDone(prev);
      toast.error(res.message || "Falha ao atualizar o progresso da aula");
      return;
    }

    setWatched((w) => ({ ...w, [lessonId]: totalSeconds }));
    if (sessionSeconds > 0) timeOnLesson.reset();

    // Última aula: em cursos sem exame (e no Essencial) é aqui que o servidor
    // cria o certificado — recarrega-se para a faixa aparecer já.
    if (completed && next.length === flat.length && !certificate) router.refresh();
  };

  return (
    <div className="container-page py-6 md:py-10">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <Link
          href="/perfil/meus-cursos"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Voltar aos meus cursos
        </Link>
        {/* O botão aparecia a toda a gente, mas o servidor recusa a quem não
            tem o pacote Interativo — era uma promessa que dava 403. */}
        {canAskInstructor ? (
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer"
            onClick={() => setAskOpen(true)}
          >
            <MessageSquareText className="size-4" /> Fazer pergunta ao formador
          </Button>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <MessageSquareText className="size-3.5" /> Perguntas ao formador: pacote Interativo
          </span>
        )}
      </div>

      {certificate && (
        <div
          className={cn(
            "mb-4 flex flex-wrap items-center gap-3 rounded-xl border p-4",
            certificate.status === "PENDING_PAYMENT"
              ? "border-warning/40 bg-warning/10"
              : "border-success/30 bg-success/10",
          )}
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-background text-primary">
            <Award className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">
              {certificate.status === "PENDING_PAYMENT"
                ? "O seu certificado está pronto"
                : "Certificado emitido"}
            </p>
            <p className="text-sm text-muted-foreground">
              {certificate.status === "PENDING_PAYMENT"
                ? `Efectue o pagamento de ${formatPrice(certificate.price ?? 0)} para o emitir.`
                : "Pode vê-lo e imprimi-lo no seu perfil."}
            </p>
          </div>
          {certificate.status === "PENDING_PAYMENT" ? (
            <Button className="cursor-pointer" onClick={() => setCertificateOpen(true)}>
              Pagar certificado
            </Button>
          ) : (
            <Link href={CERTIFICATES_TAB_HREF} className={buttonVariants({ variant: "outline" })}>
              Ver certificado
            </Link>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          {activeAssessment ? (
            <div className="space-y-3">
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer"
                onClick={() => setActiveAssessmentId(null)}
              >
                <ArrowLeft className="size-4" /> Voltar à aula
              </Button>
              <QuizViewer
                key={activeAssessment.assessment.id}
                assessment={activeAssessment.assessment}
                courseTitle={course.title}
                defaultPhone={profilePhone}
                student={student}
              />
            </div>
          ) : (
            <>
              {current && (
                <LessonViewer
                  lesson={current.lesson}
                  module={current.module}
                  courseTitle={course.title}
                  thumbnailUrl={course.thumbnailUrl}
                  initialPositionSeconds={watched[current.lesson.id] ?? 0}
                  onCompleted={() => {
                    if (!done.includes(current.lesson.id)) {
                      setLessonDone(current.lesson.id, true);
                    }
                  }}
                  // O ecrã final do vídeo leva à aula seguinte — a mesma do
                  // botão "Próxima aula" aqui em baixo.
                  nextLesson={
                    nextEntry
                      ? { title: nextEntry.lesson.title, onSelect: () => setActiveId(nextEntry.lesson.id) }
                      : undefined
                  }
                />
              )}

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant={isDone ? "outline" : "default"}
                  className="cursor-pointer"
                  disabled={pending === current?.lesson.id}
                  onClick={() => current && setLessonDone(current.lesson.id, !isDone)}
                >
                  <CheckCircle2 className="size-4" />
                  {isDone ? "Marcar como não concluída" : "Marcar como concluída"}
                </Button>

                <div className="ml-auto flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Aula anterior"
                    disabled={currentIndex <= 0}
                    className="cursor-pointer"
                    onClick={() => setActiveId(flat[currentIndex - 1]?.lesson.id ?? null)}
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Próxima aula"
                    disabled={currentIndex >= flat.length - 1}
                    className="cursor-pointer"
                    onClick={() => setActiveId(flat[currentIndex + 1]?.lesson.id ?? null)}
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

        <aside className="space-y-3 lg:sticky lg:top-20 lg:self-start">
          {courseAssessments.length > 0 && (
            <section className="space-y-2 surface-card p-4">
              <h2 className="text-sm font-semibold">Testes e exame</h2>
              <ul className="space-y-1.5">
                {courseAssessments.map(({ assessment, moduleTitle }) => (
                  <li key={assessment.id}>
                    {/* `locked` e as percentagens vêm decididas pelo servidor
                        (ver AssessmentService.listAssessmentsByCourse) — o ecrã
                        não recalcula a regra nem guarda o limiar, para nunca
                        divergir do 403 que o servidor daria. */}
                    <button
                      type="button"
                      disabled={assessment.locked}
                      onClick={() => setActiveAssessmentId(assessment.id)}
                      aria-current={assessment.id === activeAssessmentId ? "true" : undefined}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-lg border border-border px-3 py-2.5 text-left transition-colors",
                        assessment.locked
                          ? "cursor-not-allowed opacity-60"
                          : "cursor-pointer hover:bg-muted/60",
                        assessment.id === activeAssessmentId && "border-primary bg-primary-soft",
                      )}
                    >
                      {assessment.locked ? (
                        <Lock className="size-4 shrink-0 text-muted-foreground/60" />
                      ) : (
                        <ClipboardCheck className="size-4 shrink-0 text-muted-foreground" />
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{assessment.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {assessment.locked
                            ? `Disponível a partir de ${assessment.unlockAtProgress}% do curso — estás em ${assessment.currentProgress}%`
                            : assessment.examAttempts && !assessment.examAttempts.passed
                              ? `Exame final · ${assessment.examAttempts.used} de ${assessment.examAttempts.allowed} tentativas usadas`
                              : (moduleTitle ?? "Exame final")}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <CourseProgressSidebar
            modules={course.modules}
            done={done}
            currentId={current?.lesson.id ?? null}
            onSelect={setActiveId}
            onToggle={(lessonId) => setLessonDone(lessonId, !done.includes(lessonId))}
          />
        </aside>
      </div>

      <CertificateDialog
        open={certificateOpen}
        onOpenChange={setCertificateOpen}
        certificate={
          certificate
            ? {
                id: certificate.id,
                status: certificate.status,
                price: certificate.price,
                courseTitle: course.title,
              }
            : null
        }
        defaultPhone={profilePhone}
      />

      <AskInstructorModal
        open={askOpen}
        onClose={() => setAskOpen(false)}
        enrollmentId={enrollmentId}
      />
    </div>
  );
}
