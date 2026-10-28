import Image from "next/image";
import Link from "next/link";
import { PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatDuration } from "@/lib/format";
import { courseThumbnail } from "@/lib/images";

export interface MyCourseCardCourse {
  slug: string;
  title: string;
  thumbnailUrl: string;
  durationMinutes: number;
  instructorName?: string;
}

export function MyCourseCard({
  course,
  pct,
  done,
  total,
}: {
  course: MyCourseCardCourse;
  pct: number;
  done: number;
  total: number;
}) {
  const href = `/perfil/meus-cursos/${course.slug}`;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-elevated transition-all duration-300 hover:-translate-y-1">
      <Link href={href} className="relative block aspect-video overflow-hidden bg-muted">
        <Image
          src={courseThumbnail(course.thumbnailUrl)}
          alt={`Capa do curso ${course.title}`}
          width={1200}
          height={675}
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute inset-0 grid place-items-center bg-foreground/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="grid size-14 place-items-center rounded-full bg-card/90 backdrop-blur">
            <PlayCircle className="size-7 text-primary" />
          </span>
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="space-y-1">
          <Link href={href}>
            <h2 className="line-clamp-2 font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
              {course.title}
            </h2>
          </Link>
          <p className="text-sm text-muted-foreground">{course.instructorName ?? "Unitec Academy"}</p>
        </div>

        <div className="mt-auto space-y-2">
          <Progress value={pct} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {pct}% concluído · {done}/{total} aulas · {formatDuration(course.durationMinutes)}
          </p>
          <Link href={href}>
            <Button size="sm" className="w-full cursor-pointer" variant={pct > 0 ? "default" : "outline"}>
              {pct > 0 ? "Continuar a assistir" : "Iniciar curso"}
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
}
