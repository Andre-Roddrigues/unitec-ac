import Image from "next/image";
import { Loader2, Lock, ShieldCheck, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDuration, formatPrice } from "@/lib/format";
import { courseThumbnail } from "@/lib/images";
import { PACKAGE_LABEL, type CoursePackageId } from "@/components/courses/course-packages";
import type { CourseWithRelations } from "@/types";
import type { PaymentMethod } from "@/lib/checkout";

export function CheckoutOrderSummary({
  course,
  selectedPkg,
  method,
  subtotal,
  fee,
  total,
  valid,
  processing,
  onPay,
}: {
  course: CourseWithRelations;
  selectedPkg: CoursePackageId;
  method: PaymentMethod;
  subtotal: number;
  fee: number;
  total: number;
  valid: boolean;
  processing: boolean;
  onPay: () => void;
}) {
  return (
    <div className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-elevated">
      <div className="flex gap-4">
        <Image
          src={courseThumbnail(course.thumbnailUrl)}
          alt={`Capa do curso ${course.title}`}
          width={80}
          height={80}
          className="size-20 shrink-0 rounded-lg object-cover"
        />
        <div className="min-w-0 space-y-1">
          <p className="line-clamp-2 font-semibold leading-snug">{course.title}</p>
          <p className="text-xs text-muted-foreground">{course.instructor.name}</p>
          <p className="text-xs text-muted-foreground">
            {course.lessonsCount} aulas · {formatDuration(course.durationMinutes)}
          </p>
        </div>
      </div>

      <div className="h-px bg-border" />

      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Pacote</span>
          <Badge variant="secondary">{PACKAGE_LABEL[selectedPkg]}</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Taxa de processamento</span>
          <span className="font-medium">
            {fee ? formatPrice(fee) : "Grátis"}
            {method === "CARD" && <span className="ml-1 text-xs">(2%)</span>}
          </span>
        </div>
      </div>

      <div className="h-px bg-border" />

      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium">Total</span>
        <span className="text-3xl font-extrabold tracking-tight">{formatPrice(total)}</span>
      </div>

      <Button size="lg" className="w-full cursor-pointer" disabled={!valid || processing} onClick={onPay}>
        {processing ? (
          <>
            <Loader2 className="size-4 animate-spin" /> A confirmar pagamento…
          </>
        ) : (
          <>
            <Lock className="size-4" /> Pagar {formatPrice(total)}
          </>
        )}
      </Button>

      <ul className="space-y-2 text-xs text-muted-foreground">
        <li className="flex items-center gap-2">
          <ShieldCheck className="size-3.5 text-success" /> Pagamento seguro
        </li>
        <li className="flex items-center gap-2">
          <Sparkles className="size-3.5 text-primary" /> Acesso imediato após confirmação
        </li>
      </ul>
    </div>
  );
}
