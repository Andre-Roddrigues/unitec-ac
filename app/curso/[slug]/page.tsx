import Link from "next/link";
import { getCourseBySlug, getRelatedCourses } from "@/actions/courses-actions";
import { getMyCourseReview } from "@/actions/review-actions";
import { getUserEnrollments } from "@/actions/enrollment-actions";
import { CourseDetailView } from "@/components/courses/course-detail-view";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
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
    title: `${course.seoTitle || course.title} | Unitec Academy`,
    description: course.seoDescription || course.subtitle || course.description,
    openGraph: {
      title: course.seoTitle || course.title,
      description: course.seoDescription || course.subtitle || course.description,
      images: course.thumbnailUrl ? [{ url: course.thumbnailUrl }] : [],
    },
  };
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // As matrículas não dependem do curso — começam já, em paralelo com ele,
  // em vez de esperarem pelo curso para só depois arrancar.
  const enrollmentsPromise = getUserEnrollments();
  const result = await getCourseBySlug(slug);
  const course = result.data;

  if (!course) {
    return (
      <div className="container-page py-20 px-4">
        <EmptyState
          title="Curso não encontrado"
          description="O curso que procura pode ter sido removido ou o link está incorreto."
          action={
            <Link href="/cursos">
              <Button>Ver todos os cursos</Button>
            </Link>
          }
        />
      </div>
    );
  }

  // `getMyCourseReview` e `getUserEnrollments` falham em silêncio para visitantes
  // não autenticados (401) — é assim que se distingue "pode avaliar" de "não".
  const [relatedResult, myReviewResult, enrollmentsResult] = await Promise.all([
    getRelatedCourses(course.categoryId, course.slug),
    getMyCourseReview(course.id),
    enrollmentsPromise,
  ]);

  const isEnrolled = (enrollmentsResult.data ?? []).some((e) => e.courseId === course.id);

  return (
    <CourseDetailView
      course={course}
      relatedCourses={relatedResult.data ?? []}
      canReview={isEnrolled}
      myReview={myReviewResult.data ?? null}
    />
  );
}
