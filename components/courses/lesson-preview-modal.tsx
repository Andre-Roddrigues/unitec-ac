"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LessonViewer } from "@/components/my-courses/lesson-viewer";
import { getLessonPreview } from "@/actions/progress-actions";
import type { Lesson, Module } from "@/types";

/**
 * Abre uma aula de demonstração a quem ainda não comprou o curso.
 *
 * O conteúdo não vem no payload público do curso (as aulas chegam sem
 * recursos, de propósito) — é pedido ao servidor, que só devolve aulas
 * marcadas com `isPreview`.
 */
export function LessonPreviewModal({
  lesson,
  module,
  courseTitle,
  thumbnailUrl,
  onClose,
}: {
  lesson: Lesson;
  module: Module;
  courseTitle: string;
  thumbnailUrl: string;
  onClose: () => void;
}) {
  const [content, setContent] = useState<Lesson | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    getLessonPreview(lesson.id).then((res) => {
      if (!active) return;
      if (res.success && res.data) setContent(res.data);
      else setError(res.message || "Não foi possível abrir a demonstração");
    });

    return () => {
      active = false;
    };
  }, [lesson.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Demonstração: ${lesson.title}`}
    >
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-3xl overflow-hidden rounded-t-2xl border border-border bg-card shadow-elevated sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Demonstração</p>
            <h2 className="truncate font-semibold">{lesson.title}</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fechar">
            <X className="size-4" />
          </Button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto p-5">
          {error ? (
            <p className="py-10 text-center text-sm text-muted-foreground">{error}</p>
          ) : content ? (
            <LessonViewer
              lesson={content}
              module={module}
              courseTitle={courseTitle}
              thumbnailUrl={thumbnailUrl}
            />
          ) : (
            <p className="py-10 text-center text-sm text-muted-foreground">A carregar demonstração…</p>
          )}
        </div>
      </div>
    </div>
  );
}
