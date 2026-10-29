"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CourseCard } from "../courses/course-card";
import type { CourseWithRelations } from "@/types";

interface MostPopularCoursesProps {
  courses: CourseWithRelations[];
}

const PAGE_SIZE = 4;

const pageVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -40 : 40,
    opacity: 0,
  }),
};

export function MostPopularCourses({ courses }: MostPopularCoursesProps) {
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState(0);

  if (!courses || courses.length === 0) return null;

  const allCourses = courses.slice(0, 8);
  const totalPages = Math.ceil(allCourses.length / PAGE_SIZE);
  const pageCourses = allCourses.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const canGoPrev = page > 0;
  const canGoNext = page < totalPages - 1;

  const goTo = (next: number) => {
    setDirection(next > page ? 1 : -1);
    setPage(next);
  };

  return (
    <section className="container-page space-y-6 py-10 px-0">
      <div className="flex items-center justify-between">
        <h2 data-split className="text-xl font-extrabold sm:text-xl lg:text-3xl">
          Cursos <span className="text-gradient">Populares</span>
        </h2>

        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => goTo(Math.max(0, page - 1))}
              disabled={!canGoPrev}
              aria-label="Ver 4 cursos anteriores"
              className="grid size-9 place-items-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-primary/40 hover:bg-secondary hover:text-secondary-foreground disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:bg-card disabled:hover:text-foreground"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => goTo(Math.min(totalPages - 1, page + 1))}
              disabled={!canGoNext}
              aria-label="Ver próximos 4 cursos"
              className="grid size-9 place-items-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-primary/40 hover:bg-secondary hover:text-secondary-foreground disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:bg-card disabled:hover:text-foreground"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          <Link href="/cursos" data-reveal="right">
            <Button variant="outline" size="sm">Ver todos</Button>
          </Link>
        </div>
      </div>

      {/* Linha separadora entre o cabeçalho e os cartões */}
      <div className="border-t border-border pt-6">
        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={page}
              custom={direction}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-4"
            >
              {pageCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}