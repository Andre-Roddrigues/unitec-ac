import Image from "next/image";
import { Award, MessagesSquare, PlayCircle, Star, Users } from "lucide-react";
import { CourseRating } from "./course-rating";
import { formatCompact, formatDate } from "@/lib/format";
import type { Instructor, Review } from "@/types";

export function CourseInstructor({ instructor }: { instructor: Instructor }) {
  const name = instructor.name || instructor.user?.name || "Formador";
  const avatarUrl = instructor.avatarUrl || instructor.user?.avatarUrl;
  const headline = instructor.headline || instructor.user?.headline || "";
  const bio = instructor.biography || instructor.user?.bio || "";
  const rating = instructor.rating ?? 5;
  const reviewsCount = instructor.reviewsCount ?? 0;
  const studentsCount = instructor.studentsCount ?? 0;
  const coursesCount = instructor.coursesCount ?? 0;

  return (
    <section className="space-y-5">
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
        Formador
      </h2>
      <div className="flex flex-col gap-6 rounded-xl border border-border bg-card p-6 sm:p-7 sm:flex-row">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={name}
            width={80}
            height={80}
            className="size-20 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="grid size-20 shrink-0 place-items-center rounded-full bg-primary/10 text-xl font-bold text-primary">
            {name.substring(0, 2).toUpperCase()}
          </div>
        )}
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-semibold text-foreground">{name}</h3>
            {headline && <p className="text-sm text-muted-foreground">{headline}</p>}
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Star className="size-4 text-warning fill-warning" /> {rating.toFixed(1)} avaliação
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MessagesSquare className="size-4" /> {formatCompact(reviewsCount)} comentários
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users className="size-4" /> {formatCompact(studentsCount)} alunos
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Award className="size-4" /> {coursesCount} cursos
            </span>
          </div>
          {bio && (
            <p className="text-sm leading-relaxed text-muted-foreground">{bio}</p>
          )}
        </div>
      </div>
    </section>
  );
}

export function CourseReview({ review }: { review: Review }) {
  return (
    <article className="space-y-4 rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-3">
        {review.authorAvatarUrl ? (
          <Image
            src={review.authorAvatarUrl}
            alt={review.authorName}
            width={36}
            height={36}
            className="size-9 rounded-full object-cover"
          />
        ) : (
          <div className="grid size-9 place-items-center rounded-full bg-muted text-xs font-semibold">
            {review.authorName.charAt(0)}
          </div>
        )}
        <div>
          <p className="text-sm font-semibold text-foreground">{review.authorName}</p>
          <p className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</p>
        </div>
      </div>
      <CourseRating value={review.rating} />
      <p className="text-sm leading-relaxed text-muted-foreground">{review.comment}</p>
    </article>
  );
}

export function CourseIncludes({
  durationMinutes,
  lessonsCount,
  resourcesCount,
}: {
  durationMinutes: number;
  lessonsCount: number;
  resourcesCount: number;
}) {
  const hours = Math.round(durationMinutes / 60);
  // Só se lista o que o curso tem mesmo: os recursos eram anunciados como "5"
  // quando o curso não tinha nenhum.
  const items = [
    ...(hours > 0 ? [`${hours} ${hours === 1 ? "hora" : "horas"} de vídeo sob demanda`] : []),
    `${lessonsCount} ${lessonsCount === 1 ? "aula" : "aulas"} divididas em módulos`,
    ...(resourcesCount > 0
      ? [`${resourcesCount} ${resourcesCount === 1 ? "recurso" : "recursos"} para download`]
      : []),
    "Acesso em computador, tablet e celular",
    "Acesso vitalício ao conteúdo",
    "Certificado de conclusão reconhecido",
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Este curso inclui:</h3>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-2.5 text-sm text-muted-foreground">
            <PlayCircle className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
