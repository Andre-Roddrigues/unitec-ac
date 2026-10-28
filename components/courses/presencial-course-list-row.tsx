"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock, GraduationCap, MapPin, Star, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDuration, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CourseWithRelations } from "@/types";

export function PresencialCourseListRow({ course }: { course: CourseWithRelations }) {
    const price = course.pricing?.discountedPrice ?? course.price;
    const hasDiscount = Boolean(course.pricing?.hasDiscount);

    return (
        <Link
            href={`/cursos/${course.slug}`}
            className="group flex flex-col gap-4 rounded-xl border border-border/50 bg-card p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md sm:flex-row sm:items-stretch"
        >
            {/* Thumbnail */}
            <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-lg bg-muted sm:aspect-auto sm:w-48">
                <Image
                    src={course.thumbnailUrl}
                    alt={course.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 192px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-semibold text-foreground backdrop-blur">
                    <MapPin className="size-2.5" />
                    Presencial
                </span>
            </div>

            {/* Conteúdo */}
            <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
                        <span className="rounded-full bg-primary-soft/60 px-2 py-0.5 font-medium text-primary">
                            {course.category.name}
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <GraduationCap className="size-3" />
                            {course.instructor.name}
                        </span>
                    </div>
                    <h3 className="line-clamp-2 text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                        {course.title}
                    </h3>
                    <p className="line-clamp-1 text-xs text-muted-foreground">{course.subtitle}</p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                            <Star className="size-3 fill-amber-400 text-amber-400" />
                            {course.rating.toFixed(1)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <Users className="size-3" />
                            {course.studentsCount}
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <Clock className="size-3" />
                            {formatDuration(course.durationMinutes)}
                        </span>
                    </div>

                    <div className="flex items-baseline gap-2">
                        {hasDiscount && (
                            <span className="text-[11px] text-muted-foreground line-through">
                                {formatPrice(course.price)}
                            </span>
                        )}
                        <span className="text-sm font-bold text-foreground">
                            {formatPrice(price)}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}

export function PresencialCourseListRowSkeleton() {
    return (
        <div className="flex flex-col gap-4 rounded-xl border border-border/50 bg-card p-3 sm:flex-row">
            <Skeleton className="aspect-video w-full shrink-0 rounded-lg sm:aspect-auto sm:w-48" />
            <div className="flex flex-1 flex-col justify-between gap-3">
                <div className="space-y-2">
                    <Skeleton className="h-3 w-32 rounded" />
                    <Skeleton className="h-4 w-3/4 rounded" />
                    <Skeleton className="h-3 w-1/2 rounded" />
                </div>
                <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-40 rounded" />
                    <Skeleton className="h-4 w-16 rounded" />
                </div>
            </div>
        </div>
    );
}