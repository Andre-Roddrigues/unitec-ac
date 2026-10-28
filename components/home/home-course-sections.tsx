import { Suspense } from "react";
import { getFeaturedCourses, getNewCourses, getPopularCourses } from "@/actions/courses-actions";
import { HomeMotionScope } from "@/components/home/home-motion";
import { FeaturedCourses } from "@/components/sections/featured-courses";
import { NewCourses } from "@/components/sections/new-courses";
import { MostPopularCourses } from "@/components/sections/popupar-courses";
import { SkeletonCard } from "@/components/SkeletonCard";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Secções de cursos da home, em streaming: a página não espera pelo
 * backend. Cada secção entra quando o seu pedido responder; até
 * lá ocupa o lugar com um esqueleto do mesmo tamanho. Os três pedidos correm
 * em paralelo. Sem cursos (ou com o backend em baixo) a secção desaparece,
 * como antes.
 */

function CourseSectionSkeleton() {
  return (
    <section aria-hidden="true" className="container-page space-y-10 py-10 px-0">
      <Skeleton className="h-7 w-56" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    </section>
  );
}

async function FeaturedCoursesContent() {
  const courses = (await getFeaturedCourses()).data ?? [];
  if (courses.length === 0) return null;
  return (
    <HomeMotionScope>
      <FeaturedCourses courses={courses} />
    </HomeMotionScope>
  );
}

async function PopularCoursesContent() {
  const courses = (await getPopularCourses()).data ?? [];
  if (courses.length === 0) return null;
  return (
    <HomeMotionScope>
      <MostPopularCourses courses={courses} />
    </HomeMotionScope>
  );
}

async function NewCoursesContent() {
  const courses = (await getNewCourses()).data ?? [];
  if (courses.length === 0) return null;
  return (
    <HomeMotionScope>
      <NewCourses courses={courses} />
    </HomeMotionScope>
  );
}

export function HomeFeaturedCourses() {
  return (
    <Suspense fallback={<CourseSectionSkeleton />}>
      <FeaturedCoursesContent />
    </Suspense>
  );
}

export function HomePopularCourses() {
  return (
    <Suspense fallback={<CourseSectionSkeleton />}>
      <PopularCoursesContent />
    </Suspense>
  );
}

export function HomeNewCourses() {
  return (
    <Suspense fallback={<CourseSectionSkeleton />}>
      <NewCoursesContent />
    </Suspense>
  );
}
