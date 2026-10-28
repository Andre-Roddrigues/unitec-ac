"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { WishlistButton } from "@/components/courses/wishlist-button";
import { formatPrice } from "@/lib/format";
import { courseThumbnail } from "@/lib/images";
import { getCourses } from "@/actions/courses-actions";
import type { CourseWithRelations } from "@/types";

export function ProfileWishlistTab({ ids }: { ids: string[] }) {
  const [courses, setCourses] = useState<CourseWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const prevIds = useRef<string | null>(null);

  useEffect(() => {
    const key = ids.sort().join(",");
    if (prevIds.current === key) return;
    prevIds.current = key;

    const run = async () => {
      if (ids.length === 0) {
        setCourses([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      // Só os cursos da lista — antes trazia-se o catálogo (até 100 cursos)
      // para filtrar aqui, o que também deixava de fora tudo além do 100.º.
      const res = await getCourses({ ids, perPage: Math.min(ids.length, 100) });
      if (res.success && res.data) {
        setCourses(res.data.items);
      }
      setLoading(false);
    };
    run();
  }, [ids]);

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (courses.length === 0) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <div
          key={course.id}
          className="flex items-start gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary/60"
        >
          <Link href={`/curso/${course.slug}`} className="flex min-w-0 flex-1 gap-3">
            <Image
              src={courseThumbnail(course.thumbnailUrl)}
              alt={`Capa do curso ${course.title}`}
              width={64}
              height={64}
              loading="lazy"
              className="size-16 shrink-0 rounded-md object-cover"
            />
            <div className="min-w-0">
              <p className="line-clamp-2 text-sm font-semibold">{course.title}</p>
              <p className="mt-1 text-sm font-bold">
                {formatPrice(course.pricing?.discountedPrice ?? course.price)}
              </p>
            </div>
          </Link>
          <WishlistButton courseId={course.id} className="shadow-none" />
        </div>
      ))}
    </div>
  );
}
