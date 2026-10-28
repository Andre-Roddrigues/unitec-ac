"use client";

import { useState } from "react";
import Image from "next/image";
import { CalendarClock, Globe, MonitorSmartphone, Signal, Users } from "lucide-react";
import { CourseCurriculum } from "./course-curriculum";
import { CourseGrid } from "./course-grid";
import { CourseInstructor } from "./course-instructor";
import { CourseOutcomes, CourseRequirements } from "./course-outcomes";
import { CourseReviewForm } from "./course-review-form";
import { CoursePackages, getDefaultPackage, getEnabledPackages, type CoursePackageId } from "./course-packages";
import { CoursePriceCard, CourseStickyBar } from "./course-price-card";
import { CourseRating } from "./course-rating";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCompact, formatDate, FORMAT_LABEL, LEVEL_LABEL } from "@/lib/format";
import type { CourseWithRelations, Review } from "@/types";

export function CourseDetailView({
  course,
  relatedCourses,
  canReview = false,
  myReview = null,
}: {
  course: CourseWithRelations;
  relatedCourses: CourseWithRelations[];
  canReview?: boolean;
  myReview?: Review | null;
}) {
  const enabledPackages = getEnabledPackages(course.pricing);
  const [selectedPackage, setSelectedPackage] = useState<CoursePackageId>(
    () => getDefaultPackage(course.pricing),
  );

  return (
    <>
      {/* Hero Section */}
      <section className="border-b border-border">
        <div className="container-page grid gap-10 py-10 lg:grid-cols-[1fr_360px] lg:py-12 px-4 sm:px-6">
          <div className="space-y-5">


            {/* Title & Subtitle */}
            <h1 className="text-3xl font-extrabold font-sans leading-tight tracking-tight sm:text-4xl lg:text-[38px] text-foreground">
              {course.title}
            </h1>
            <p className="max-w-2xl text-base  leading-relaxed text-muted-foreground">
              {course.subtitle}
            </p>
            {/* Description — o painel escreve `longDescription` a pensar nesta
                página; até aqui esse texto não aparecia em lado nenhum. */}
            {(course.longDescription || course.description) && (
              <section className="space-y-4">
                <h2 className="text-x  font-semibold tracking-tight text-foreground">
                  Descrição do Curso
                </h2>
                {(course.longDescription || course.description).split("\n\n").map((p, i) => (
                  <p key={i} className="text-sm leading-relaxed text-muted-foreground">
                    {p}
                  </p>
                ))}
              </section>
            )}


            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <CourseRating value={course.rating} count={course.reviewsCount} size="md" />
              <span className="inline-flex items-center gap-1.5">
                <Users className="size-4 text-primary" /> {formatCompact(course.studentsCount)} alunos
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Globe className="size-4 text-primary" /> {course.language}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MonitorSmartphone className="size-4 text-primary" /> {FORMAT_LABEL[course.format] ?? course.format}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Signal className="size-4 text-primary" /> {LEVEL_LABEL[course.level]}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarClock className="size-4 text-primary" /> Atualizado em {formatDate(course.updatedAt)}
              </span>
            </div>



            {/* Instructor Quick Profile */}
            <div className="flex items-center gap-3 pt-1">
              {course.instructor.avatarUrl ? (
                <Image
                  src={course.instructor.avatarUrl}
                  alt={course.instructor.name}
                  width={44}
                  height={44}
                  className="size-11 rounded-full object-cover border border-border"
                />
              ) : (
                <div className="grid size-11 place-items-center rounded-full bg-primary-soft text-sm font-bold text-primary">
                  {course.instructor.name.substring(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-foreground">{course.instructor.name}</p>
                <p className="text-xs text-muted-foreground">{course.instructor.headline}</p>
              </div>
            </div>

            {/* Information Tabs right underneath metadata */}
            <div className="pt-10 border-t border-border/60">
              <Tabs defaultValue="como-funciona" className="w-full">
                <TabsList variant="line" className="borde w-full justify-start gap-2 sm:gap-6 overflow-x-auto pb-0">
                  <TabsTrigger value="como-funciona" className="text-sm font-medium cursor-pointer">
                    Como funciona
                  </TabsTrigger>
                  <TabsTrigger value="requisitos" className="text-sm font-medium cursor-pointer">
                    Requisitos
                  </TabsTrigger>
                  <TabsTrigger value="aprenderas" className="text-sm font-medium cursor-pointer">
                    O que aprenderás
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="aprenderas" className="pt-2">
                  <CourseOutcomes outcomes={course.outcomes} />
                </TabsContent>

                <TabsContent value="requisitos" className="pt-2">
                  <CourseRequirements requirements={course.requirements} />
                </TabsContent>

                <TabsContent value="como-funciona" className="pt-2">
                  <div className="space-y-3 text-sm leading-relaxed text-muted-foreground pt-1">
                    <p>
                      Pode aceder às aulas a qualquer hora do dia ou da noite, bem como fins-de-semana e feriados, em função da sua disponibilidade e disposição, tendo apenas a restrição de ter de terminar o curso até ao último dia de formação.
                    </p>
                    <p>
                      As aulas são disponibilizadas na sua Área de Membro.
                    </p>
                    <p>
                      Pode ainda interromper uma aula a qualquer momento e recomeçá-la mais tarde, podendo frequentar cada aula quantas vezes desejar.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Desktop Sticky Price Card */}
          <div className="lg:relative">
            <div className="lg:sticky lg:top-24">
              <CoursePriceCard course={course} selectedPackage={selectedPackage} />
            </div>
          </div>
        </div>
      </section>

      {/* Packages Section (Centered & Full Width across container) */}
      {enabledPackages.length > 0 && (
        <section className="border-b border-border bg-muted/20 py-8 sm:py-10">
          <div className="container-page px-4 sm:px-6">
            <CoursePackages
              pricing={course.pricing}
              value={selectedPackage}
              onChange={setSelectedPackage}
              courseSlug={course.slug}
            />
          </div>
        </section>
      )}

      {/* Content Section (Curriculum, Description, Instructor, Reviews) */}
      <div className="container-page grid gap-10 pb-20 pt-12 lg:grid-cols-[1fr_360px] px-4 sm:px-6">
        <div className="min-w-0 space-y-12">
          <CourseCurriculum
            modules={course.modules}
            courseTitle={course.title}
            thumbnailUrl={course.thumbnailUrl}
          />


          <CourseInstructor instructor={course.instructor} />

          {/* Student Reviews */}
          <CourseReviewForm
            courseId={course.id}
            initialReviews={course.reviews ?? []}
            initialRating={course.rating}
            initialCount={course.reviewsCount}
            canReview={canReview}
            myReview={myReview}
          />
        </div>

        {/* Column spacer for desktop layout balance */}
        <div className="hidden lg:block" />
      </div>

      {/* Related Courses Section */}
      {relatedCourses && relatedCourses.length > 0 && (
        <div className="border-t border-border bg-muted/20 py-12">
          <div className="container-page space-y-8 px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Cursos Relacionados
            </h2>
            <CourseGrid
              courses={relatedCourses}
              columns={4}
              emptyTitle="Sem cursos relacionados no momento"
              emptyDescription="Em breve apresentaremos mais cursos nesta categoria."
            />
          </div>
        </div>
      )}

      {/* Mobile Bottom Sticky Bar */}
      <CourseStickyBar course={course} selectedPackage={selectedPackage} />
    </>
  );
}
