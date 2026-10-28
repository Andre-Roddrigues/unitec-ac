import { CheckCircle2, Circle, FileText, HelpCircle, PlayCircle, Radio } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { formatDuration, LESSON_TYPE_LABEL } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { LessonType, Module } from "@/types";

const ICONS: Record<LessonType, React.ElementType> = {
  VIDEO: PlayCircle,
  DOCUMENT: FileText,
  QUIZ: HelpCircle,
  LIVE: Radio,
};

export function CourseProgressSidebar({
  modules,
  done,
  currentId,
  onSelect,
  onToggle,
}: {
  modules: Module[];
  done: string[];
  currentId: string | null;
  onSelect: (lessonId: string) => void;
  onToggle: (lessonId: string) => void;
}) {
  const flat = modules.flatMap((m) => m.lessons);
  // `done` vem agora do servidor, por isso a percentagem e os visto batem
  // certo entre si. Antes havia um `Math.max` com a percentagem agregada da
  // matrícula, que dizia "6 de 10 aulas" com um único visto na lista.
  const pct = flat.length ? Math.round((done.length / flat.length) * 100) : 0;

  return (
    <div className="space-y-3">
      <div className="space-y-2 surface-card p-4">
        <div className="flex items-center justify-between text-sm font-medium">
          <span>O seu progresso</span>
          <span className="tabular-nums">{pct}%</span>
        </div>
        <Progress value={pct} className="h-2" />
        <p className="text-xs text-muted-foreground">
          {done.length} de {flat.length} aulas concluídas
        </p>
      </div>

      <div className="max-h-[70vh] overflow-y-auto rounded-xl border border-border">
        {modules.map((module) => (
          <section key={module.id}>
            <h2 className="sticky top-0 z-10 bg-muted/80 px-4 py-2.5 text-sm font-semibold text-foreground backdrop-blur">
              {module.title}
            </h2>
            <ul>
              {module.lessons.map((lesson) => {
                const type = lesson.lessonType || lesson.type || "VIDEO";
                const durationMinutes = lesson.durationMinutes ?? Math.ceil((lesson.durationInSeconds || 0) / 60);
                const Icon = (ICONS[type as LessonType] || PlayCircle) as React.ComponentType<{
                  className?: string;
                }>;
                const complete = done.includes(lesson.id);
                const active = lesson.id === currentId;
                return (
                  <li
                    key={lesson.id}
                    className={cn(
                      "flex items-center border-t border-border transition-colors hover:bg-muted/60",
                      active && "bg-primary-soft",
                    )}
                  >
                    {/* Dois botões irmãos: marcar e abrir. Antes o "marcar"
                        era um <span role="presentation"> com onClick dentro do
                        botão de abrir — inalcançável por teclado. */}
                    <button
                      type="button"
                      onClick={() => onToggle(lesson.id)}
                      aria-pressed={complete}
                      aria-label={
                        complete
                          ? `Marcar "${lesson.title}" como não concluída`
                          : `Marcar "${lesson.title}" como concluída`
                      }
                      className="grid shrink-0 cursor-pointer place-items-center py-3 pl-4 pr-2"
                    >
                      {complete ? (
                        <CheckCircle2 className="size-4 text-success" />
                      ) : (
                        <Circle className="size-4 text-muted-foreground" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => onSelect(lesson.id)}
                      aria-current={active ? "true" : undefined}
                      className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 py-3 pr-4 text-left"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{lesson.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {LESSON_TYPE_LABEL[type] || type} · {formatDuration(durationMinutes)}
                        </span>
                      </span>
                      <Icon className="size-4 shrink-0 text-muted-foreground" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
