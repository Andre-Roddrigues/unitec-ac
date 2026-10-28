"use client";

import { useState } from "react";
import { ChevronDown, FileText, HelpCircle, Lock, PlayCircle, Radio } from "lucide-react";
import { LessonPreviewModal } from "@/components/courses/lesson-preview-modal";
import { formatDuration, LESSON_TYPE_LABEL } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Lesson, LessonType, Module } from "@/types";

const ICONS: Record<LessonType, React.ElementType> = {
  VIDEO: PlayCircle,
  DOCUMENT: FileText,
  QUIZ: HelpCircle,
  LIVE: Radio,
};

export function CourseLesson({
  lesson,
  onPreview,
}: {
  lesson: Lesson;
  onPreview?: (lesson: Lesson) => void;
}) {
  const type = lesson.lessonType || lesson.type || "VIDEO";
  const durationInMinutes = lesson.durationMinutes ?? Math.ceil((lesson.durationInSeconds || 0) / 60);
  const IconComponent = (ICONS[type as LessonType] || PlayCircle) as React.ComponentType<{ className?: string }>;
  return (
    <li className="flex items-center gap-3 border-t border-border px-5 py-3.5 transition-colors hover:bg-muted/50 sm:px-6">
      <IconComponent className="size-4 shrink-0 text-muted-foreground" />
      <span className="min-w-0 flex-1 truncate text-sm text-foreground">{lesson.title}</span>
      {lesson.resources && lesson.resources.length > 0 && (
        <span className="hidden text-xs text-muted-foreground sm:inline">
          {lesson.resources.length} recurso{lesson.resources.length > 1 ? "s" : ""}
        </span>
      )}
      <span className="hidden text-xs text-muted-foreground md:inline">
        {LESSON_TYPE_LABEL[type] || type}
      </span>
      {lesson.isPreview ? (
        // Era um <span> com ar de link e sem comportamento nenhum: o painel
        // marcava a aula como demonstração e o aluno não tinha como a abrir.
        <button
          type="button"
          onClick={() => onPreview?.(lesson)}
          className="cursor-pointer text-xs font-semibold text-primary underline-offset-2 hover:underline"
        >
          Demonstração
        </button>
      ) : (
        <Lock className="size-3.5 text-muted-foreground/60" />
      )}
      <span className="w-12 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
        {formatDuration(durationInMinutes)}
      </span>
    </li>
  );
}

export function CourseModule({
  module,
  defaultOpen,
  onPreview,
}: {
  module: Module;
  defaultOpen?: boolean;
  onPreview?: (lesson: Lesson) => void;
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  const total = module.lessons.reduce((s, l) => s + (l.durationMinutes ?? Math.ceil((l.durationInSeconds || 0) / 60)), 0);

  return (
    <div className="overflow-hidden border border-border bg-card first:rounded-t-xl last:rounded-b-xl [&+&]:border-t-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 bg-muted/40 px-5 py-4 text-left transition-colors hover:bg-muted sm:px-6 cursor-pointer"
      >
        <ChevronDown
          className={cn("size-4 shrink-0 transition-transform duration-200", open && "rotate-180")}
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-foreground">
            {module.title}
          </span>
        </span>
        {/* Um módulo sem aulas é só um tema do programa (os cursos presenciais
            importados do sistema antigo nunca as terão) — "0 aulas · 0m"
            fazia-o parecer partido. */}
        {module.lessons.length > 0 && (
          <span className="shrink-0 text-xs text-muted-foreground">
            {module.lessons.length} aulas · {formatDuration(total)}
          </span>
        )}
      </button>
      {open && (
        <>
          {/* O painel deixa descrever cada módulo e essa descrição não
              aparecia em lado nenhum. */}
          {module.description && (
            <p className="border-t border-border px-5 py-3 text-sm leading-relaxed text-muted-foreground sm:px-6">
              {module.description}
            </p>
          )}
          <ul>
            {module.lessons.map((l) => (
              <CourseLesson key={l.id} lesson={l} onPreview={onPreview} />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export function CourseCurriculum({
  modules,
  courseTitle,
  thumbnailUrl,
}: {
  modules: Module[];
  courseTitle: string;
  thumbnailUrl: string;
}) {
  const [preview, setPreview] = useState<{ lesson: Lesson; module: Module } | null>(null);

  const totalLessons = modules?.reduce((s, m) => s + m.lessons.length, 0) ?? 0;
  const totalDuration =
    modules?.reduce(
      (s, m) => s + m.lessons.reduce((ls, l) => ls + (l.durationMinutes ?? Math.ceil((l.durationInSeconds || 0) / 60)), 0),
      0,
    ) ?? 0;

  if (!modules || modules.length === 0) return null;

  return (
    <section id="curriculum" className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Programa do Curso
        </h2>
        <p className="text-sm text-muted-foreground">
          {totalLessons > 0
            ? `${modules.length} módulos · ${totalLessons} aulas · ${formatDuration(totalDuration)} no total`
            : `${modules.length} módulos`}
        </p>
      </div>
      <div className="rounded-xl overflow-hidden border border-border">
        {modules.map((m, i) => (
          <CourseModule
            key={m.id}
            module={m}
            defaultOpen={i === 0}
            onPreview={(lesson) => setPreview({ lesson, module: m })}
          />
        ))}
      </div>

      {preview && (
        <LessonPreviewModal
          lesson={preview.lesson}
          module={preview.module}
          courseTitle={courseTitle}
          thumbnailUrl={thumbnailUrl}
          onClose={() => setPreview(null)}
        />
      )}
    </section>
  );
}
