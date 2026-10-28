import Image from "next/image";
import Link from "next/link";
import { Clock, MapPin, Monitor, PlayCircle, Shuffle, Users } from "lucide-react";
import { CourseBadge } from "./course-badge";
import { CourseRating } from "./course-rating";
import { courseThumbnail } from "@/lib/images";
import { FORMAT_LABEL, formatCompact, formatDuration, formatPrice, LEVEL_LABEL } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CourseWithRelations } from "@/types";

/**
 * Modalidade na capa: cada uma com ícone e cor próprios para se distinguirem
 * de relance. O online é o caso comum, por isso fica discreto; o presencial e
 * o híbrido (que exigem deslocação) levam cor sólida.
 */
const FORMAT_STYLE = {
  ONLINE: { icon: Monitor, className: "bg-card/90 text-foreground" },
  PRESENCIAL: { icon: MapPin, className: "bg-secondary text-secondary-foreground" },
  HIBRIDO: { icon: Shuffle, className: "bg-warning text-warning-foreground" },
} as const;

/**
 * Cartão do catálogo — `/cursos` e "Cursos Relacionados".
 *
 * Mostra mais do que o `CourseCard` da homepage: subtítulo, formador,
 * avaliação, nível e número de aulas. O cartão inteiro é clicável (o `<Link>`
 * do título estende-se por cima de tudo com `after:inset-0`).
 *
 * Os campos vêm todos da listagem `GET /courses` — nada é inventado. O que é
 * `null` (subtítulo, formador, avaliação sem reviews) simplesmente não aparece,
 * em vez de deixar um espaço vazio ou um "0.0" que se lê como má nota.
 */
export function CatalogCourseCard({
  course,
  className,
}: {
  course: CourseWithRelations;
  className?: string;
}) {
  // `price` chega como string (Decimal do Prisma); `pricing.*` já são números.
  const hasDiscount = course.pricing?.hasDiscount ?? false;
  const price = hasDiscount ? course.pricing.discountedPrice : course.pricing?.price ?? Number(course.price);
  const oldPrice = hasDiscount ? course.pricing.price : null;
  const discountPercentage = hasDiscount ? course.pricing.discountPercentage : null;

  // O tipo diz que o formador nunca falta, mas um curso sem `CourseInstructor`
  // associado chega com `instructor: null`.
  const formatStyle = FORMAT_STYLE[course.format] ?? FORMAT_STYLE.ONLINE;
  const FormatIcon = formatStyle.icon;

  const instructorName = course.instructor?.name ?? course.instructor?.user?.name;

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden surface-card transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated",
        className,
      )}
    >
      <div className="relative aspect-video overflow-hidden bg-muted">
        <Image
          src={courseThumbnail(course.thumbnailUrl)}
          alt={`Capa do curso ${course.title}`}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          loading="lazy"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/45 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="absolute left-3 top-3 flex gap-1.5">
          {course.isBestSeller && <CourseBadge variant="bestseller">Mais vendido</CourseBadge>}
          {course.isNew && !course.isBestSeller && <CourseBadge variant="new">Novo</CourseBadge>}
        </div>
        <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-md bg-card/90 px-2 py-1 text-[11px] font-medium text-foreground backdrop-blur">
          <PlayCircle className="size-3.5 text-primary" />
          {course.lessonsCount === 1 ? "1 aula" : `${course.lessonsCount ?? 0} aulas`}
        </span>
        <span
          className={cn(
            "absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold backdrop-blur",
            formatStyle.className,
          )}
        >
          <FormatIcon className="size-3.5" />
          {FORMAT_LABEL[course.format] ?? FORMAT_LABEL.ONLINE}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
          {course.category?.name ?? "Geral"}
        </span>
        <Link
          href={`/curso/${course.slug}`}
          className="after:absolute after:inset-0 focus-visible:outline-none"
        >
          <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
            {course.title}
          </h3>
        </Link>
        {course.subtitle && (
          <p className="line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
            {course.subtitle}
          </p>
        )}
        {instructorName && <p className="text-xs text-muted-foreground">{instructorName}</p>}

        {course.reviewsCount > 0 && (
          <CourseRating value={course.rating} count={course.reviewsCount} />
        )}

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Users className="size-3.5" /> {formatCompact(course.studentsCount ?? 0)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" /> {formatDuration(course.durationMinutes ?? 0)}
          </span>
          <span>{LEVEL_LABEL[course.level] ?? LEVEL_LABEL.ALL_LEVELS}</span>
        </div>

        <div className="mt-auto flex items-baseline gap-2 pt-2">
          <span className="text-lg font-bold text-foreground">{formatPrice(price || 0)}</span>
          {oldPrice !== null && (
            <span className="text-sm text-muted-foreground line-through">{formatPrice(oldPrice)}</span>
          )}
          {discountPercentage !== null && (
            <CourseBadge variant="discount" className="ml-auto">
              -{Math.round(discountPercentage)}%
            </CourseBadge>
          )}
        </div>
      </div>
    </article>
  );
}
