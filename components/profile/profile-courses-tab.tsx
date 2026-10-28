import Image from "next/image";
import Link from "next/link";
import { Award, CheckCircle2, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { buttonVariants } from "@/components/ui/button";
import { courseThumbnail } from "@/lib/images";
import { cn } from "@/lib/utils";
import type { CertificateStatus } from "@/actions/certificate-actions";

export interface ProfileCourse {
  id: string;
  slug: string;
  title: string;
  thumbnailUrl: string;
}

export interface ProfileCourseProgress {
  course: ProfileCourse;
  pct: number;
  completed: boolean;
  /** Estado do certificado desta matrícula, se já for elegível. */
  certificate: CertificateStatus | null;
}

function CourseStatus({ completed, certificate }: Pick<ProfileCourseProgress, "completed" | "certificate">) {
  if (certificate === "PENDING_PAYMENT") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2 py-0.5 text-xs font-medium text-warning-foreground">
        <Clock className="size-3" /> Certificado por pagar
      </span>
    );
  }
  if (certificate === "ISSUED") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-xs font-medium text-success">
        <Award className="size-3" /> Certificado emitido
      </span>
    );
  }
  if (completed) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2 py-0.5 text-xs font-medium text-primary">
        <CheckCircle2 className="size-3" /> Aulas concluídas
      </span>
    );
  }
  return null;
}

export function ProfileCoursesTab({ items }: { items: ProfileCourseProgress[] }) {
  if (items.length === 0) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map(({ course, pct, completed, certificate }) => (
        <article
          key={course.id}
          className="flex gap-4 rounded-xl border border-border bg-card p-4"
        >
          <Image
            src={courseThumbnail(course.thumbnailUrl)}
            alt={`Capa do curso ${course.title}`}
            width={96}
            height={96}
            loading="lazy"
            className="size-20 shrink-0 rounded-lg object-cover sm:size-24"
          />
          <div className="min-w-0 flex-1 space-y-2">
            <h2 className="line-clamp-2 font-semibold leading-snug">{course.title}</h2>
            <CourseStatus completed={completed} certificate={certificate} />
            <Progress value={pct} className="h-2" />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">{pct}% concluído</p>
              <Link
                href={`/perfil/meus-cursos/${course.slug}`}
                className={cn(buttonVariants({ size: "sm", variant: pct === 0 ? "default" : "outline" }))}
              >
                {pct === 0 ? "Começar" : completed ? "Rever curso" : "Continuar"}
              </Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
