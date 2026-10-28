"use client";

import { Check, X } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CoursePackageInfo, CoursePackageCode, CoursePricing } from "@/types";
import Link from "next/link";

export type CoursePackageId = "essencial" | "padrao" | "interactivo";

export const PACKAGE_CODE: Record<CoursePackageId, CoursePackageCode> = {
  essencial: "ESSENTIAL",
  padrao: "STANDARD",
  interactivo: "INTERACTIVE",
};

const CODE_TO_ID: Record<CoursePackageCode, CoursePackageId> = {
  ESSENTIAL: "essencial",
  STANDARD: "padrao",
  INTERACTIVE: "interactivo",
};

export const PACKAGE_LABEL: Record<CoursePackageId, string> = {
  essencial: "Essencial",
  padrao: "Padrão",
  interactivo: "Interativo",
};

export const PACKAGE_IDS: CoursePackageId[] = ["essencial", "padrao", "interactivo"];

export const PACKAGE_RANK: Record<CoursePackageId, number> = {
  essencial: 1,
  padrao: 2,
  interactivo: 3,
};

function packageInfo(
  pricing: CoursePricing | undefined | null,
  pkg: CoursePackageId,
): CoursePackageInfo | undefined {
  const code = PACKAGE_CODE[pkg];
  return pricing?.packages?.find((p) => p.package === code);
}

/** Pacotes que este curso realmente oferece (configurado no backend). */
export function getEnabledPackages(pricing?: CoursePricing | null): CoursePackageId[] {
  if (!pricing?.packages?.length) return PACKAGE_IDS;
  return PACKAGE_IDS.filter((id) => packageInfo(pricing, id)?.enabled ?? false);
}

/** Preço final de um pacote (números calculados no backend). */
export function getPackagePrice(pricing: CoursePricing | undefined | null, pkg: CoursePackageId): number {
  const info = packageInfo(pricing, pkg);
  if (info && info.enabled) return info.price;
  return pricing?.discountedPrice ?? pricing?.price ?? 0;
}

/** Preço original de um pacote (vai ser riscado) ou null se não há desconto. */
export function getOriginalPackagePrice(
  pricing: CoursePricing | undefined | null,
  pkg: CoursePackageId,
): number | null {
  const info = packageInfo(pricing, pkg);
  if (!info || !info.hasDiscount) return null;
  return info.originalPrice;
}

/** Pacote selecionado por defeito, priorizando o "padrao" quando disponível. */
export function getDefaultPackage(
  pricing?: CoursePricing | null,
  prefer: CoursePackageId = "padrao",
): CoursePackageId {
  const enabled = getEnabledPackages(pricing);
  if (enabled.length === 0) return PACKAGE_IDS[0];
  return enabled.includes(prefer) ? prefer : enabled[0];
}

export const PACKAGE_TO_ID = CODE_TO_ID;

interface Feature {
  label: string;
  /** Texto = incluído com uma ressalva (ex.: "pago à parte"). */
  included: Record<CoursePackageId, boolean | string>;
}

const FEATURES: Feature[] = [
  {
    label: "Acesso a todas as aulas em vídeo",
    included: { essencial: true, padrao: true, interactivo: true },
  },
  {
    label: "Materiais de apoio e documentos",
    included: { essencial: true, padrao: true, interactivo: true },
  },
  {
    label: "Avaliações e testes",
    included: { essencial: false, padrao: true, interactivo: true },
  },
  {
    label: "Trabalhos práticos corrigidos",
    included: { essencial: false, padrao: true, interactivo: true },
  },
  {
    label: "Interação directa com o formador para tirar dúvidas",
    included: { essencial: false, padrao: false, interactivo: true },
  },
];

/**
 * O certificado só vem incluído no Interativo; nos outros paga-se à parte,
 * depois de passar o exame final (preço único, `CERTIFICATE_PRICE` no LMS).
 * Com preço 0 está incluído em todos.
 */
function certificateFeature(pricing: CoursePricing): Feature {
  const price = pricing.certificatePrice ?? 0;
  const extra = price > 0 ? `Pago à parte: ${formatPrice(price)}` : true;
  return {
    label: "Certificado de conclusão",
    included: { essencial: extra, padrao: extra, interactivo: true },
  };
}

const SUBTITLE: Record<CoursePackageId, string> = {
  essencial: "Para quem quer aprender ao seu ritmo.",
  padrao: "A experiência completa de aprendizagem.",
  interactivo: "Tudo do Padrão, com acompanhamento do formador.",
};

export function CoursePackages({
  pricing,
  value,
  onChange,
  courseSlug,
}: {
  pricing: CoursePricing;
  value: CoursePackageId;
  onChange: (pkg: CoursePackageId) => void;
  courseSlug?: string;
}) {
  const enabled = getEnabledPackages(pricing);
  if (enabled.length === 0) return null;

  // O certificado entra antes da interacção com o formador, onde estava.
  const features = [...FEATURES.slice(0, -1), certificateFeature(pricing), ...FEATURES.slice(-1)];

  return (
    <section id="pacotes" className="space-y-5 max-w-5xl mx-auto w-full py-1">
      <div className="space-y-1 text-center max-w-lg mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Escolha o seu pacote
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Três formas de fazer este curso. Pode alterar o pacote selecionado antes da inscrição.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 items-stretch">
        {enabled.map((pkg) => {
          const selected = value === pkg;
          const price = getPackagePrice(pricing, pkg);
          const originalPrice = getOriginalPackagePrice(pricing, pkg);
          return (
            <div
              key={pkg}
              onClick={() => onChange(pkg)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onChange(pkg);
                }
              }}
              className={cn(
                "flex flex-col gap-4 rounded-xl border border-border bg-card p-5 transition-all duration-200 relative cursor-pointer select-none",
                selected
                  ? "border-primary ring-1 ring-primary shadow-md z-10"
                  : "hover:border-border/80 hover:shadow-sm",
              )}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-lg font-bold text-foreground">{PACKAGE_LABEL[pkg]}</h3>
                  {pkg === "padrao" && (
                    <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                      Mais popular
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground min-h-[28px]">{SUBTITLE[pkg]}</p>
              </div>

              <div className="border-y border-border/50 py-3">
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                    {formatPrice(price)}
                  </p>
                  {originalPrice !== null && (
                    <span className="text-sm text-muted-foreground/70 line-through decoration-1">
                      {formatPrice(originalPrice)}
                    </span>
                  )}
                </div>
              </div>

              <ul className="flex-1 space-y-2.5 text-xs sm:text-sm">
                {features.map((f) => {
                  const ok = f.included[pkg] !== false;
                  const note = typeof f.included[pkg] === "string" ? f.included[pkg] : null;
                  return (
                    <li
                      key={f.label}
                      className={cn(
                        "flex items-start gap-2.5",
                        ok ? "text-foreground" : "text-muted-foreground/60",
                      )}
                    >
                      {ok ? (
                        <Check className="mt-0.5 size-3.5 shrink-0 text-success" />
                      ) : (
                        <X className="mt-0.5 size-3.5 shrink-0 opacity-40" />
                      )}
                      <span className={cn(!ok && "line-through decoration-1 opacity-60")}>
                        {f.label}
                        {note && <span className="block text-[11px] text-muted-foreground">{note}</span>}
                      </span>
                    </li>
                  );
                })}
              </ul>

              {courseSlug ? (
                <Link
                  href={`/inscrever-se/${courseSlug}?pkg=${pkg}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(pkg);
                  }}
                  className={cn(
                    buttonVariants({ variant: selected ? "default" : "outline" }),
                    "w-full font-semibold cursor-pointer mt-1 text-center justify-center"
                  )}
                >
                  Inscrever-se agora
                </Link>
              ) : (
                <Button
                  variant={selected ? "default" : "outline"}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(pkg);
                  }}
                  aria-pressed={selected}
                  className="w-full font-semibold cursor-pointer mt-1"
                >
                  Inscrever-se agora
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}