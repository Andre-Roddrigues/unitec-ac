import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CourseCard } from "../courses/course-card";
import type { CourseWithRelations } from "@/types";

interface MostPopularCoursesProps {
  courses: CourseWithRelations[];
}

export function MostPopularCourses({ courses }: MostPopularCoursesProps) {
  if (!courses || courses.length === 0) return null;

  return (
    <section className="container-page space-y-10 py-10 px-0">
      <div className="flex items-center justify-between">
        <h2 data-split className="text-xl font-extrabold sm:text-xl lg:text-3xl">
          Cursos <span className="text-gradient">Populares</span>
        </h2>
        <Link href="/cursos" data-reveal="right">
          <Button variant="outline" size="sm">Ver todos</Button>
        </Link>
      </div>

      <div data-reveal-group className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {courses.slice(0, 4).map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </section>
  );
}