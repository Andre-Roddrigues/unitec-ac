"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Award, Loader2, PartyPopper, Smartphone } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { purchaseCertificate, type CertificateStatus } from "@/actions/certificate-actions";
import { getPurchaseStatus } from "@/actions/enrollment-actions";
import { formatPrice } from "@/lib/format";

export const CERTIFICATES_TAB_HREF = "/perfil?tab=certificados";

export interface CertificateOffer {
  id: string;
  status: CertificateStatus;
  price: number | null;
  courseTitle: string;
}

/**
 * Oferta do certificado logo a seguir a tornar-se elegível (exame final
 * aprovado) — e o mesmo ecrã de pagamento no perfil e no leitor do curso.
 *
 * `PENDING_PAYMENT` pede o pagamento por M-Pesa, com "Pagar mais tarde";
 * `ISSUED` (pacote Interativo) só anuncia que já está disponível.
 */
export function CertificateDialog({
  open,
  onOpenChange,
  certificate,
  defaultPhone,
  remindWhereToPay = true,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  certificate: CertificateOffer | null;
  defaultPhone?: string | null;
  /**
   * "Pagar mais tarde" lembra (num toast) onde se paga depois. Desligado no
   * próprio separador de certificados, onde isso seria dizer "está aqui".
   */
  remindWhereToPay?: boolean;
}) {
  const router = useRouter();
  // `null` = o aluno ainda não mexeu: usa-se o do perfil (`defaultPhone`).
  const [phone, setPhone] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  /**
   * Pagamento que ficou por confirmar — guarda-se o id para se poder
   * reconsultar. Preso ao certificado: no perfil o mesmo pop-up serve vários.
   */
  const [pending, setPending] = useState<{ certificateId: string; paymentId: string } | null>(null);
  const [checking, setChecking] = useState(false);

  if (!certificate) return null;

  const pendingPaymentId = pending?.certificateId === certificate.id ? pending.paymentId : null;

  const phoneValue = phone ?? defaultPhone ?? "";
  const phoneValid = phoneValue.replace(/\D/g, "").length >= 9;

  const paid = () => {
    toast.success("Certificado emitido!", {
      description: `O certificado de ${certificate.courseTitle} já está no seu perfil.`,
      action: { label: "Ver", onClick: () => router.push(CERTIFICATES_TAB_HREF) },
    });
    onOpenChange(false);
    router.refresh();
  };

  const pay = async () => {
    if (!phoneValid || processing) return;
    setProcessing(true);

    // Síncrono, como a compra do curso: só volta depois de o aluno confirmar
    // (ou recusar) no telemóvel — pode demorar até 60-90s.
    const res = await purchaseCertificate(certificate.id, phoneValue);
    setProcessing(false);

    switch (res.data?.status) {
      case "completed":
        paid();
        return;
      case "pending":
        setPending(res.data.paymentId ? { certificateId: certificate.id, paymentId: res.data.paymentId } : null);
        toast.info(res.message || "Pagamento em confirmação.");
        return;
      case "unknown":
        // Pode ter passado do lado do M-Pesa sem chegar resposta — tentar
        // logo outra vez arrisca cobrar duas vezes.
        toast.warning("Não foi possível confirmar o pagamento a tempo", {
          description:
            "Se recebeu a mensagem de confirmação do M-Pesa, aguarde uns minutos antes de tentar de novo.",
        });
        return;
      default:
        toast.error(res.message || "Falha ao processar o pagamento");
    }
  };

  const checkPending = async () => {
    if (!pendingPaymentId || checking) return;
    setChecking(true);
    const res = await getPurchaseStatus(pendingPaymentId);
    setChecking(false);

    if (res.data?.status === "completed") {
      paid();
      return;
    }
    if (res.data?.status === "failed") {
      setPending(null);
      toast.error(res.message || "O pagamento não foi concluído.");
      return;
    }
    toast.info("Ainda a aguardar confirmação do pagamento.");
  };

  const later = () => {
    onOpenChange(false);
    if (remindWhereToPay) {
      toast("Pode pagar o certificado quando quiser", {
        description: "Fica guardado em Perfil → Certificados.",
        action: { label: "Abrir", onClick: () => router.push(CERTIFICATES_TAB_HREF) },
      });
    }
  };

  // Enquanto o M-Pesa espera pelo PIN, fechar o pop-up deixava o aluno sem
  // saber o desfecho — por isso não se fecha a meio.
  const handleOpenChange = (next: boolean) => {
    if (processing) return;
    if (!next && certificate.status === "PENDING_PAYMENT" && !pendingPaymentId) {
      later();
      return;
    }
    onOpenChange(next);
  };

  if (certificate.status === "ISSUED") {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader className="items-center text-center">
            <span className="mb-2 grid size-14 place-items-center rounded-2xl bg-success/15 text-success">
              <PartyPopper className="size-7" />
            </span>
            <DialogTitle className="font-display text-xl font-bold">Parabéns, concluiu o curso!</DialogTitle>
            <DialogDescription>
              O certificado de <strong className="text-foreground">{certificate.courseTitle}</strong> está
              incluído no seu pacote e já está disponível no perfil.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" className="cursor-pointer" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
            <Link href={CERTIFICATES_TAB_HREF} className={buttonVariants()}>
              <Award className="size-4" /> Ver certificado
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={!processing}>
        <DialogHeader className="items-center text-center">
          <span className="mb-2 grid size-14 place-items-center rounded-2xl bg-primary-soft text-primary">
            <Award className="size-7" />
          </span>
          <DialogTitle className="font-display text-xl font-bold">O seu certificado está pronto</DialogTitle>
          <DialogDescription>
            Concluiu <strong className="text-foreground">{certificate.courseTitle}</strong> com aproveitamento.
            Para emitir o certificado, efectue o pagamento — ou faça-o mais tarde, no seu perfil.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 px-4 py-3">
          <span className="text-sm text-muted-foreground">Certificado de conclusão</span>
          <span className="font-display text-lg font-bold">{formatPrice(certificate.price ?? 0)}</span>
        </div>

        {pendingPaymentId ? (
          <div className="space-y-3 rounded-xl border border-warning/40 bg-warning/10 p-4">
            <p className="text-sm font-semibold">Pagamento por confirmar</p>
            <p className="text-sm text-muted-foreground">
              Ainda não recebemos a confirmação. Assim que chegar, o certificado aparece no seu perfil.
            </p>
            <Button variant="outline" onClick={checkPending} disabled={checking} className="w-full cursor-pointer">
              {checking ? "A verificar…" : "Verificar novamente"}
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="certificate-phone" className="flex items-center gap-1.5">
              <Smartphone className="size-4 text-destructive" /> Número M-Pesa
            </Label>
            <Input
              id="certificate-phone"
              inputMode="tel"
              autoComplete="tel"
              value={phoneValue}
              disabled={processing}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="84 000 0000"
            />
            <p className="text-xs text-muted-foreground">
              {processing
                ? "Confirme o pedido no seu telemóvel e introduza o PIN do M-Pesa."
                : "Vai receber um pedido de confirmação no telemóvel."}
            </p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" className="cursor-pointer" disabled={processing} onClick={later}>
            Pagar mais tarde
          </Button>
          {!pendingPaymentId && (
            <Button className="cursor-pointer" disabled={!phoneValid || processing} onClick={pay}>
              {processing ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> A confirmar pagamento…
                </>
              ) : (
                <>Pagar {formatPrice(certificate.price ?? 0)}</>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
