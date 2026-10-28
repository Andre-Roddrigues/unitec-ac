import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";
import {
  getEnabledPackages,
  getPackagePrice,
  PACKAGE_LABEL,
  type CoursePackageId,
} from "@/components/courses/course-packages";
import type { CoursePricing } from "@/types";

export function CheckoutPackages({
  pricing,
  value,
  onChange,
}: {
  pricing: CoursePricing;
  value: CoursePackageId;
  onChange: (pkg: CoursePackageId) => void;
}) {
  const enabled = getEnabledPackages(pricing);

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        1 · Pacote
      </h2>
      {enabled.length === 0 ? (
        <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          Este curso é vendido a preço único ·{" "}
          <span className="font-bold text-foreground">
            {formatPrice(pricing.discountedPrice ?? pricing.price)}
          </span>
        </p>
      ) : (
        <div className={`grid gap-3 ${enabled.length === 1 ? "sm:grid-cols-1" : enabled.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
          {enabled.map((p) => {
            const active = p === value;
            return (
              <button
                key={p}
                type="button"
                onClick={() => onChange(p)}
                aria-pressed={active}
                className={cn(
                  "rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/60 cursor-pointer",
                  active && "border-primary ring-1 ring-primary shadow-elevated",
                )}
              >
                <span className="flex items-center justify-between">
                  <span className="font-semibold">{PACKAGE_LABEL[p]}</span>
                  {active && <CheckCircle2 className="size-4 text-primary" />}
                </span>
                <span className="mt-2 block text-xl font-extrabold tracking-tight">
                  {formatPrice(getPackagePrice(pricing, p))}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}