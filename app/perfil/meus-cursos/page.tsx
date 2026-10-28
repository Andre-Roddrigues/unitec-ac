import type { Metadata } from "next";
import { MyCoursesView } from "@/components/my-courses/my-courses-view";
import { getUserEnrollments, type Enrollment } from "@/actions/enrollment-actions";

export const metadata: Metadata = {
  title: "Meus cursos | Unitec Academy",
  description:
    "Continue a assistir os cursos que comprou — acompanhe o progresso das aulas e retome onde parou.",
  openGraph: {
    title: "Meus cursos | Unitec Academy",
    description: "Os seus cursos, progresso e continuar a assistir.",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default async function MeusCursosPage() {
  const enrollmentsRes = await getUserEnrollments();
  const enrollments = (enrollmentsRes.data ?? []) as Enrollment[];

  // `/enrollments/me` já traz o curso resumido (nº de aulas, duração,
  // formador). Antes pedia-se o detalhe completo de cada curso, um a um.
  const items = enrollments.map((enrollment) => ({
    id: enrollment.id,
    courseId: enrollment.courseId,
    slug: enrollment.course?.slug ?? "",
    progress: enrollment.progress,
    course: enrollment.course
      ? {
          slug: enrollment.course.slug,
          title: enrollment.course.title,
          thumbnailUrl: enrollment.course.thumbnailUrl,
          durationMinutes: enrollment.course.durationMinutes ?? 0,
          instructorName: enrollment.course.instructorName ?? undefined,
          lessonsCount: enrollment.course.lessonsCount ?? 0,
        }
      : null,
  }));

  return <MyCoursesView items={items} />;
}
