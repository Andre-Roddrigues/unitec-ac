import { ArrowRight, Clock3, Play, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatCompact, formatDuration, formatPrice, FORMAT_LABEL } from '@/lib/format';
import { courseThumbnail } from '@/lib/images';
import { cn } from '@/lib/utils';
import { WISHLIST_ENABLED } from '@/lib/wishlist';
import type { CourseWithRelations } from '@/types';
import { CourseBadge } from './course-badge';
import { WishlistButton } from './wishlist-button';

export function CourseCard({
    course,
    className,
}: {
    course: CourseWithRelations;
    className?: string;
}) {
    const hasDiscount = course.pricing?.hasDiscount ?? false;
    const displayPrice = hasDiscount ? course.pricing.discountedPrice : course.pricing?.price ?? Number(course.price);
    const oldPrice = hasDiscount ? course.pricing.price : null;

    // Estava fixo em "Online", ignorando o formato que o painel define —
    // cursos presenciais e híbridos apareciam todos como online.
    const formatLabel = FORMAT_LABEL[course.format] ?? FORMAT_LABEL.ONLINE;

    // Uma só etiqueta por cartão: empilhadas ("Destaque" + "Mais vendido" +
    // "Novo") tapavam a capa e diluíam-se umas nas outras.
    const badge = course.isBestSeller
        ? { variant: "bestseller" as const, label: "Mais vendido" }
        : course.isFeatured
          ? { variant: "featured" as const, label: "Destaque" }
          : course.isNew
            ? { variant: "new" as const, label: "Novo" }
            : null;

    return (
        <article className={cn("group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-elevated", className)}>
            <div className="relative overflow-hidden">
                <Image
                    src={courseThumbnail(course.thumbnailUrl)}
                    alt={course.title}
                    width={640}
                    height={380}
                    loading="lazy"
                    className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-[11px] font-semibold text-secondary backdrop-blur">
                    {course.category?.name || "Geral"}
                </span>
                <div className="absolute right-3 top-3 flex flex-col items-end gap-1">
                    {WISHLIST_ENABLED && <WishlistButton courseId={course.id} />}
                    
                </div>
            </div>
            <div className="flex flex-1 flex-col gap-3 p-4">
                <h3 className="text-sm font-semibold uppercase leading-snug tracking-tight">
                    {course.title}
                </h3>
                <div className="mt-auto flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                        <Clock3 className="size-3.5" /> {formatDuration(Number(course.durationMinutes || 0))}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <Play className="size-3.5" /> {formatLabel}
                    </span>
                    {Number(course.studentsCount) >= 0 && (
                        <span className="inline-flex items-center gap-1.5">
                            <Users className="size-3.5" /> {formatCompact(Number(course.studentsCount || 0))}
                        </span>
                    )}
                </div>
                <div className="flex flex-wrap items-baseline gap-2 border-t border-border pt-3">
                    <span className="text-sm font-bold text-foreground">{formatPrice(displayPrice || 0)}</span>
                    {oldPrice && (
                        <span className="text-xs text-muted-foreground/70 line-through decoration-1">
                            {formatPrice(oldPrice)}
                        </span>
                    )}
                    <Link
                        href={`/curso/${course.slug}`}
                        aria-label={`Ver curso ${course.title}`}
                        className="ml-auto grid size-8 place-items-center rounded-full bg-secondary text-secondary-foreground transition-transform group-hover:translate-x-0.5"
                    >
                        <ArrowRight className="size-4" />
                    </Link>
                </div>
            </div>
        </article>
    );
}
