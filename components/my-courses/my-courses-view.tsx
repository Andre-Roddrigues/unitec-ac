"use client";

import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { MyCourseCard, type MyCourseCardCourse } from "@/components/my-courses/my-course-card";

export interface MyCourseItem {
  id: string;
  courseId: string;
  slug: string;
  progress: number;
  course: (MyCourseCardCourse & { lessonsCount: number }) | null;
}

export function MyCoursesView({ items }: { items: MyCourseItem[] }) {
  // A página que renderiza isto é um Server Component: os dados já chegam
  // resolvidos, não há carregamento nenhum a representar. Tratar "lista vazia"
  // como "ainda a carregar" deixava um aluno sem cursos a olhar para
  // skeletons para sempre.
  const courses = items.filter((i) => i.course);

  return (
    <div className="container-page py-10 md:py-14">
      <header className="mb-8 space-y-2">
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
          Meus cursos
        </h1>
        <p className="text-muted-foreground">
          Tudo o que comprou, pronto para assistir quando quiser.
        </p>
      </header>

      {courses.length === 0 && (
        <EmptyState
          icon={GraduationCap}
          title="Ainda não comprou nenhum curso"
          description="Explore o catálogo e comece a aprender — os cursos que comprar aparecem aqui com o seu progresso."
          action={
            <Link href="/cursos">
              <Button>Explorar cursos</Button>
            </Link>
          }
        />
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((item) => {
          const course = item.course!;
          const done = Math.round((item.progress / 100) * course.lessonsCount);
          return (
            <MyCourseCard
              key={item.id}
              course={course}
              pct={item.progress}
              done={done}
              total={course.lessonsCount}
            />
          );
        })}
      </div>
    </div>
  );
}
