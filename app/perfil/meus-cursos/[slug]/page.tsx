import type { Metadata } from "next";
import { headers } from "next/headers";
import { AlertTriangle } from "lucide-react";
import { getCourseBySlug, getCourseContent } from "@/actions/courses-actions";
import { getUserEnrollments } from "@/actions/enrollment-actions";
import { getCourseProgress } from "@/actions/progress-actions";
import { getCourseAssessments } from "@/actions/assessment-actions";
import { getMyCertificates } from "@/actions/certificate-actions";
import { getUserProfile } from "@/actions/profile-actions";
import { auth } from "@/lib/auth";
import { CoursePlayerView } from "@/components/my-courses/course-player-view";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type PageParams = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: PageParams }): Promise<Metadata> {
  const { slug } = await params;
  const result = await getCourseBySlug(slug);
  const course = result.data;

  if (!course) {
    return {
      title: "Curso não encontrado | Unitec Academy",
      description: "O curso solicitado não foi encontrado ou não está mais disponível.",
    };
  }

  return {
    title: `${course.title} | Unitec Academy`,
    description:
      "Assista às aulas do seu curso, marque-as como concluídas e acompanhe o seu progresso.",
    openGraph: {
      title: course.title,
      description: course.subtitle || course.description,
      type: "website",
      images: course.thumbnailUrl ? [{ url: course.thumbnailUrl }] : [],
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function MyCoursePage({ params }: { params: PageParams }) {
  const { slug } = await params;
  // As matrículas não dependem do curso — arrancam em paralelo com ele.
  const enrollmentsPromise = getUserEnrollments();
  const courseResult = await getCourseBySlug(slug);
  const course = courseResult.data;

  if (!course) {
    return (
      <div className="container-page py-20">
        <EmptyState
          title="Curso não encontrado"
          description="Este curso já não está disponível."
          action={
            <Link href="/perfil/meus-cursos">
              <Button>Voltar aos meus cursos</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const enrollmentsResult = await enrollmentsPromise;

  // Sem esta distinção, uma falha de rede (ou um 401) dava uma lista vazia e o
  // aluno matriculado lia "ainda não tem acesso a este curso" — uma acusação
  // em vez de um erro.
  if (!enrollmentsResult.success) {
    return (
      <div className="container-page py-20">
        <EmptyState
          icon={AlertTriangle}
          title="Não foi possível confirmar a sua matrícula"
          description="Houve um problema a falar com o servidor. Actualize a página dentro de instantes."
          action={
            <Link href="/perfil/meus-cursos">
              <Button>Voltar aos meus cursos</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const enrollments = (enrollmentsResult.data ?? []) as Array<{
    id?: string;
    courseId?: string;
    progress?: number;
    package?: string;
  }>;
  const enrollment = enrollments.find((e) => e.courseId === course.id);

  // Só faz sentido pedir estes a quem está matriculado — os endpoints
  // respondem 403 aos outros.
  const [progressResult, assessmentsResult, contentResult, certificatesResult, profileResult, session] = enrollment
    ? await Promise.all([
        getCourseProgress(course.id),
        getCourseAssessments(course.id),
        getCourseContent(course.id),
        getMyCertificates(),
        getUserProfile(),
        // Nome e email para a marca de água dos testes e do exame.
        auth.api.getSession({ headers: await headers() }),
      ])
    : [undefined, undefined, undefined, undefined, undefined, undefined];

  const certificate = (certificatesResult?.data ?? []).find((c) => c.enrollmentId === enrollment?.id) ?? null;

  const lessons = progressResult?.data?.lessons ?? [];

  // `getCourseBySlug` é o payload público do catálogo: traz o programa, mas
  // sem os recursos (vídeo, anexos) nem a descrição de cada aula. Para quem
  // está matriculado a árvore inteira vem de `/content`; o programa público
  // só serve de recurso para quem não está (o leitor mostra-lhe o bloqueio).
  const courseWithContent = {
    ...course,
    modules:
      contentResult?.data?.modules ??
      (course.modules ?? []).map((module) => ({
        ...module,
        lessons: (module.lessons ?? []).map((lesson) => ({ ...lesson, resources: lesson.resources ?? [] })),
      })),
  };

  return (
    <CoursePlayerView
      course={courseWithContent}
      isEnrolled={Boolean(enrollment)}
      enrollmentId={enrollment?.id}
      completedLessonIds={lessons.filter((l) => l.completed).map((l) => l.lessonId)}
      watchedSecondsByLesson={Object.fromEntries(
        lessons.map((l) => [l.lessonId, l.watchedDuration]),
      )}
      assessments={assessmentsResult?.data ?? []}
      canAskInstructor={enrollment?.package === "INTERACTIVE"}
      certificate={certificate}
      profilePhone={profileResult?.data?.phone ?? null}
      student={session ? { name: profileResult?.data?.name || session.user.name, email: session.user.email } : null}
    />
  );
}
