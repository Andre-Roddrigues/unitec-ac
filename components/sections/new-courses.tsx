import { CourseCard } from '../courses/course-card';
import type { CourseWithRelations } from '@/types';

interface NewCoursesProps {
  courses: CourseWithRelations[];
}

export function NewCourses({ courses }: NewCoursesProps) {
  if (!courses || courses.length === 0) return null;

  return (
    <section className="container-page space-y-10 py-10 px-0">
      <h2 data-split className="text-xl font-extrabold sm:text-xl lg:text-3xl">
        Cursos <span className="text-gradient">Novos</span>
      </h2>
      <div data-reveal-group className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {courses.slice(0, 4).map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </section>
  );
}
