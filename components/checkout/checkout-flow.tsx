"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";
import { toast } from "sonner";
import { parseAsStringEnum, useQueryState } from "nuqs";
import { Button } from "@/components/ui/button";
import { getDefaultPackage, getPackagePrice, PACKAGE_CODE, PACKAGE_IDS, type CoursePackageId } from "@/components/courses/course-packages";
import { getPurchaseStatus, purchaseCourse } from "@/actions/enrollment-actions";
import type { PaymentMethod } from "@/lib/checkout";
import type { CourseWithRelations } from "@/types";
import { CheckoutPackages } from "./checkout-packages";
import { CheckoutPaymentMethods } from "./checkout-payment-methods";
import { CheckoutPaymentForm, type CardDetails } from "./checkout-payment-form";
import { CheckoutOrderSummary } from "./checkout-order-summary";

export function CheckoutFlow({
  course,
  profile,
}: {
  course: CourseWithRelations;
  profile?: { name: string; phone: string | null };
}) {
  const router = useRouter();
  const [selectedPkg, setSelectedPkg] = useQueryState(
    "pkg",
    parseAsStringEnum<CoursePackageId>(PACKAGE_IDS).withDefault(getDefaultPackage(course.pricing)),
  );
  const [method, setMethod] = useState<PaymentMethod>("MPESA");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [card, setCard] = useState<CardDetails>({ number: "", name: "", expiry: "", cvc: "" });
  const [processing, setProcessing] = useState(false);
  /** Compra que ficou por confirmar — guarda-se o id para se poder reconsultar. */
  const [pendingPaymentId, setPendingPaymentId] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const subtotal = getPackagePrice(course.pricing, selectedPkg);
  const fee = method === "CARD" ? Math.round(subtotal * 0.02) : 0;
  const total = subtotal + fee;

  const mobileValid = phone.replace(/\D/g, "").length >= 9;
  const cardValid =
    card.number.replace(/\D/g, "").length >= 15 &&
    card.name.trim().length > 2 &&
    /^\d{2}\/\d{2}$/.test(card.expiry) &&
    card.cvc.length >= 3;
  const valid = method === "CARD" ? cardValid : mobileValid;

  const pay = async () => {
    if (!valid || processing) return;
    setProcessing(true);

    // Síncrono, sem webhook: esta chamada só volta depois do M-Pesa
    // confirmar (ou recusar) no telemóvel do aluno — pode demorar até
    // 60-90s. Ver PLANO-BACKEND-CO-ACADEMIA.md, "Fluxo de pagamento".
    const res = await purchaseCourse({
      courseId: course.id,
      courseSlug: course.slug,
      packageId: PACKAGE_CODE[selectedPkg],
      paymentMethod: method,
      phone,
    });

    setProcessing(false);

    switch (res.data?.status) {
      case "completed":
        toast.success("Inscrição confirmada!", {
          description: `${course.title} já está disponível em Meus cursos.`,
        });
        router.push(`/perfil/meus-cursos/${course.slug}`);
        return;
      case "pending":
        // Não acontece hoje com M-Pesa (resolve sempre antes de responder) —
        // preparado para quando a transferência bancária também passar por
        // aqui (revisão manual do admin).
        setPendingPaymentId(res.data.paymentId ?? null);
        toast.info(res.message || "Pagamento em confirmação.");
        return;
      default:
        // 'failed' (recusado) ou 'unknown' (não deu para confirmar a tempo) —
        // em nenhum dos casos há matrícula criada.
        toast.error(res.message || "Falha ao processar o pagamento");
    }
  };

  /** Reconsulta uma compra pendente — o LMS vai perguntar ao serviço de pagamentos. */
  const checkPending = async () => {
    if (!pendingPaymentId || checking) return;
    setChecking(true);

    const res = await getPurchaseStatus(pendingPaymentId);
    setChecking(false);

    if (res.data?.status === "completed") {
      toast.success("Pagamento confirmado!", {
        description: `${course.title} já está disponível em Meus cursos.`,
      });
      router.push(`/perfil/meus-cursos/${course.slug}`);
      return;
    }

    if (res.data?.status === "failed") {
      setPendingPaymentId(null);
      toast.error(res.message || "O pagamento não foi concluído.");
      return;
    }

    toast.info("Ainda a aguardar confirmação do pagamento.");
  };

  return (
    <>
      <div className="container-page grid gap-10 py-10 lg:grid-cols-[1.45fr_1fr] lg:py-14">
        <div className="space-y-10">
          <header className="space-y-2">
            <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              Finalizar inscrição
            </h1>
            <p className="text-muted-foreground">
              Escolha o pacote e a forma de pagamento. O acesso é imediato após a confirmação.
            </p>
          </header>

          {pendingPaymentId && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-warning/40 bg-warning/10 p-4">
              <div className="space-y-1">
                <p className="text-sm font-semibold">Pagamento por confirmar</p>
                <p className="text-sm text-muted-foreground">
                  Ainda não recebemos a confirmação. Assim que chegar, o curso aparece em Meus cursos.
                </p>
              </div>
              <Button variant="outline" onClick={checkPending} disabled={checking} className="cursor-pointer">
                {checking ? "A verificar…" : "Verificar novamente"}
              </Button>
            </div>
          )}

          <CheckoutPackages pricing={course.pricing} value={selectedPkg} onChange={setSelectedPkg} />

          <CheckoutPaymentMethods value={method} onChange={setMethod} />

          <CheckoutPaymentForm
            method={method}
            phone={phone}
            onPhoneChange={setPhone}
            card={card}
            onCardChange={setCard}
            profileName={profile?.name ?? ""}
          />
        </div>

        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <CheckoutOrderSummary
            course={course}
            selectedPkg={selectedPkg}
            method={method}
            subtotal={subtotal}
            fee={fee}
            total={total}
            valid={valid}
            processing={processing}
            onPay={pay}
          />
        </aside>
      </div>
    </>
  );
}
