"use client";

import { useState } from "react";
import { Loader2, RotateCcw, Smartphone } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { purchaseExamRetake } from "@/actions/assessment-actions";
import { getPurchaseStatus } from "@/actions/enrollment-actions";
import { formatPrice } from "@/lib/format";

/**
 * Pagamento de uma tentativa extra do exame final, depois de esgotar as
 * gratuitas sem aprovar. Cada pagamento dá uma tentativa. Mesmo fluxo M-Pesa
 * do `CertificateDialog` (síncrono, com `pending` reconsultável).
 */
export function ExamRetakeDialog({
  open,
  onOpenChange,
  assessmentId,
  examTitle,
  price,
  pendingPaymentId: initialPendingPaymentId,
  defaultPhone,
  onPaid,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assessmentId: string;
  examTitle: string;
  price: number;
  /** Pagamento que já tinha ficado por confirmar (vem do servidor). */
  pendingPaymentId?: string | null;
  defaultPhone?: string | null;
  /** Pagamento confirmado: há mais uma tentativa. */
  onPaid: () => void;
}) {
  // `null` = o aluno ainda não mexeu: usa-se o do perfil (`defaultPhone`).
  const [phone, setPhone] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  // `undefined` = ainda não houve compra nesta sessão: vale o do servidor.
  const [pending, setPending] = useState<string | null | undefined>(undefined);
  const [checking, setChecking] = useState(false);

  const pendingPaymentId = pending === undefined ? (initialPendingPaymentId ?? null) : pending;

  const phoneValue = phone ?? defaultPhone ?? "";
  const phoneValid = phoneValue.replace(/\D/g, "").length >= 9;

  const paid = () => {
    toast.success("Pagamento confirmado", {
      description: "Já pode fazer mais uma tentativa no exame.",
    });
    setPending(null);
    onOpenChange(false);
    onPaid();
  };

  const pay = async () => {
    if (!phoneValid || processing) return;
    setProcessing(true);

    // Síncrono: só volta depois de o aluno confirmar (ou recusar) no
    // telemóvel — pode demorar até 60-90s.
    const res = await purchaseExamRetake(assessmentId, phoneValue);
    setProcessing(false);

    switch (res.data?.status) {
      case "completed":
        paid();
        return;
      case "pending":
        setPending(res.data.paymentId ?? null);
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

  // Enquanto o M-Pesa espera pelo PIN, fechar o pop-up deixava o aluno sem
  // saber o desfecho — por isso não se fecha a meio.
  const handleOpenChange = (next: boolean) => {
    if (processing) return;
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={!processing}>
        <DialogHeader className="items-center text-center">
          <span className="mb-2 grid size-14 place-items-center rounded-2xl bg-primary-soft text-primary">
            <RotateCcw className="size-7" />
          </span>
          <DialogTitle className="font-display text-xl font-bold">Nova tentativa no exame</DialogTitle>
          <DialogDescription>
            Esgotou as tentativas de <strong className="text-foreground">{examTitle}</strong>. Cada nova
            tentativa tem uma taxa — depois de pagar, pode voltar a fazer o exame.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 px-4 py-3">
          <span className="text-sm text-muted-foreground">1 tentativa extra</span>
          <span className="font-display text-lg font-bold">{formatPrice(price)}</span>
        </div>

        {pendingPaymentId ? (
          <div className="space-y-3 rounded-xl border border-warning/40 bg-warning/10 p-4">
            <p className="text-sm font-semibold">Pagamento por confirmar</p>
            <p className="text-sm text-muted-foreground">
              Ainda não recebemos a confirmação. Assim que chegar, a nova tentativa fica disponível.
            </p>
            <Button variant="outline" onClick={checkPending} disabled={checking} className="w-full cursor-pointer">
              {checking ? "A verificar…" : "Verificar novamente"}
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="retake-phone" className="flex items-center gap-1.5">
              <Smartphone className="size-4 text-destructive" /> Número M-Pesa
            </Label>
            <Input
              id="retake-phone"
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
          <Button variant="outline" className="cursor-pointer" disabled={processing} onClick={() => onOpenChange(false)}>
            Agora não
          </Button>
          {!pendingPaymentId && (
            <Button className="cursor-pointer" disabled={!phoneValid || processing} onClick={pay}>
              {processing ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> A confirmar pagamento…
                </>
              ) : (
                <>Pagar {formatPrice(price)}</>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
