"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { PlayCircle, Share2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VimeoPlayer } from "@/components/video/vimeo-player";
import { extractVimeoHash, extractVimeoId } from "@/lib/vimeo";
import { CourseIncludes } from "./course-instructor";
import { formatPrice } from "@/lib/format";
import { getEnabledPackages, getOriginalPackagePrice, getPackagePrice, PACKAGE_LABEL, type CoursePackageId } from "./course-packages";
import type { CourseWithRelations } from "@/types";

function shareCourse(course: CourseWithRelations) {
  const url = typeof window !== "undefined" ? window.location.href : "";
  if (typeof navigator !== "undefined" && navigator.share) {
    navigator.share({ title: course.title, url }).catch(() => undefined);
    return;
  }
  navigator?.clipboard?.writeText(url);
  toast.success("Link copiado para a área de transferência!");
}

export function CoursePriceCard({
  course,
  selectedPackage = "padrao",
}: {
  course: CourseWithRelations;
  selectedPackage?: CoursePackageId;
}) {
  const price = getPackagePrice(course.pricing, selectedPackage);
  const originalPrice = getOriginalPackagePrice(course.pricing, selectedPackage);
  const hasPackages = getEnabledPackages(course.pricing).length > 0;
  const resourcesCount = (course.modules || []).reduce(
    (s, m) => s + (m.lessons || []).reduce((ls, l) => ls + (l.resources || []).length, 0),
    0,
  );

  // Trailer no Vimeo toca aqui mesmo, no player da Unitec. Qualquer outro
  // link (YouTube, etc.) continua a abrir num separador novo — não temos
  // player próprio para esses.
  const [trailerOpen, setTrailerOpen] = useState(false);
  const trailerVimeoId = extractVimeoId(course.trailerUrl);

  function playTrailer() {
    if (trailerVimeoId) {
      setTrailerOpen(true);
      return;
    }
    if (course.trailerUrl) {
      window.open(course.trailerUrl, "_blank", "noopener,noreferrer");
      return;
    }
    toast.info("Demonstração disponível em breve", { description: course.title });
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-elevated">
      {trailerVimeoId && (
        <Dialog open={trailerOpen} onOpenChange={setTrailerOpen}>
          <DialogContent className="gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-3xl">
            <div className="border-b border-border px-5 py-4 pr-14">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">Demonstração</p>
              <DialogTitle className="truncate font-semibold">{course.title}</DialogTitle>
            </div>
            {trailerOpen && (
              <VimeoPlayer
                vimeoId={trailerVimeoId}
                vimeoHash={extractVimeoHash(course.trailerUrl)}
                title={course.title}
                kind="trailer"
                autoplay
              />
            )}
          </DialogContent>
        </Dialog>
      )}
      <div className="relative aspect-video bg-muted">
        <Image
          src={course.thumbnailUrl}
          alt={`${course.title} pré-visualização`}
          fill
          sizes="(max-width: 1024px) 100vw, 360px"
          className="object-cover"
        />
        <button
          type="button"
          className="absolute inset-0 grid place-items-center bg-foreground/35 transition-colors hover:bg-foreground/45 cursor-pointer"
          onClick={playTrailer}
          aria-label="Ver demonstração do curso"
        >
          <span className="grid size-14 place-items-center rounded-full bg-card/95 shadow-md">
            <PlayCircle className="size-7 text-primary" />
          </span>
        </button>
      </div>

      <div className="space-y-5 p-6">
        <div className="space-y-1.5">
          <div className="flex items-baseline gap-2.5">
            <span className="text-3xl font-extrabold tracking-tight text-foreground">
              {formatPrice(price)}
            </span>
            {hasPackages &&
              selectedPackage === "padrao" &&
              course.pricing?.hasDiscount &&
              originalPrice !== null && (
              <span className="text-base text-muted-foreground line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>
          {hasPackages && (
            <p className="text-xs text-muted-foreground">
              Pacote <span className="font-semibold text-foreground">{PACKAGE_LABEL[selectedPackage]}</span>
            </p>
          )}
        </div>

        <div className="space-y-2.5">
          <Link href={`/inscrever-se/${course.slug}?pkg=${selectedPackage}`}>
            <Button size="lg" className="w-full font-semibold cursor-pointer">
              Inscrever-se agora
            </Button>
          </Link>

          <Button
            variant="outline"
            className="w-full gap-2 cursor-pointer"
            onClick={() => shareCourse(course)}
          >
            <Share2 className="size-4" />
            Compartilhar Curso
          </Button>
        </div>

        <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="size-3.5 text-success" /> Garantia de satisfação e qualidade
        </p>

        <div className="border-t border-border pt-4">
          <CourseIncludes
            durationMinutes={course.durationMinutes}
            lessonsCount={course.lessonsCount}
            resourcesCount={resourcesCount}
          />
        </div>
      </div>
    </div>
  );
}

export function CourseStickyBar({
  course,
  selectedPackage = "padrao",
}: {
  course: CourseWithRelations;
  selectedPackage?: CoursePackageId;
}) {
  const price = getPackagePrice(course.pricing, selectedPackage);
  const hasPackages = getEnabledPackages(course.pricing).length > 0;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-border bg-background/95 p-3.5 backdrop-blur lg:hidden">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{course.title}</p>
        <p className="text-sm font-bold text-foreground">
          {formatPrice(price)}{" "}
          {hasPackages && (
            <span className="font-normal text-muted-foreground">· {PACKAGE_LABEL[selectedPackage]}</span>
          )}
        </p>
      </div>
      <Link href={`/inscrever-se/${course.slug}?pkg=${selectedPackage}`}>
        <Button size="sm" className="shrink-0 cursor-pointer">
          Inscrever-se
        </Button>
      </Link>
    </div>
  );
}
