"use client";

import { useState } from "react";
import { Award, Clock, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { CertificateDialog, type CertificateOffer } from "@/components/certificates/certificate-dialog";
import { formatDate, formatPrice } from "@/lib/format";
import type { UserCertificate } from "@/actions/certificate-actions";

export function ProfileCertificatesTab({
  items,
  userName,
  phone,
}: {
  items: UserCertificate[];
  userName?: string;
  phone?: string | null;
}) {
  const [viewing, setViewing] = useState<UserCertificate | null>(null);
  const [paying, setPaying] = useState<CertificateOffer | null>(null);

  if (items.length === 0) return null;

  const pending = items.filter((c) => c.status === "PENDING_PAYMENT");
  const issued = items.filter((c) => c.status !== "PENDING_PAYMENT");

  return (
    <div className="space-y-8">
      {pending.length > 0 && (
        <section className="space-y-3">
          <div>
            <h2 className="font-semibold">Por pagar</h2>
            <p className="text-sm text-muted-foreground">
              Concluiu estes cursos — o certificado é emitido assim que o pagamento for confirmado.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {pending.map((cert) => (
              <article
                key={cert.id}
                className="flex flex-col gap-4 rounded-xl border border-warning/40 bg-warning/5 p-5 sm:flex-row sm:items-center"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-warning/15 text-warning-foreground">
                  <Clock className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{cert.course?.title ?? "Certificado"}</p>
                  <p className="text-xs text-muted-foreground">
                    Disponível desde {formatDate(cert.createdAt)} · {formatPrice(cert.price ?? 0)}
                  </p>
                </div>
                <Button
                  size="sm"
                  className="cursor-pointer"
                  onClick={() =>
                    setPaying({
                      id: cert.id,
                      status: cert.status,
                      price: cert.price,
                      courseTitle: cert.course?.title ?? "o curso",
                    })
                  }
                >
                  Pagar certificado
                </Button>
              </article>
            ))}
          </div>
        </section>
      )}

      {issued.length > 0 && (
        <section className="space-y-3">
          {pending.length > 0 && <h2 className="font-semibold">Emitidos</h2>}
          <div className="grid gap-4 md:grid-cols-2">
            {issued.map((cert) => (
              <article
                key={cert.id}
                className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                  <Award className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{cert.course?.title ?? "Certificado"}</p>
                  <p className="text-xs text-muted-foreground">Emitido a {formatDate(cert.issuedAt)}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => setViewing(cert)}
                >
                  Ver certificado
                </Button>
              </article>
            ))}
          </div>
        </section>
      )}

      <CertificateDialog
        open={paying !== null}
        onOpenChange={(open) => !open && setPaying(null)}
        certificate={paying}
        defaultPhone={phone}
        remindWhereToPay={false}
      />

      <Dialog open={viewing !== null} onOpenChange={(open) => !open && setViewing(null)}>
        {viewing && (
          <DialogContent
            data-certificate-print
            className="max-h-[calc(100dvh-2rem)] overflow-y-auto bg-white p-6 text-left text-slate-900 sm:max-w-3xl sm:p-8"
          >
            <DialogTitle className="sr-only">
              Certificado — {viewing.course?.title ?? "curso"}
            </DialogTitle>
            <div className="print:hidden flex items-center gap-2 pr-10">
              <Badge variant="secondary">Pré-visualização</Badge>
              <Button size="sm" className="ml-auto cursor-pointer" onClick={() => window.print()}>
                <Download className="size-4" /> Imprimir / Guardar PDF
              </Button>
            </div>

            <div className="rounded-xl border-4 border-double border-amber-400 bg-gradient-to-br from-amber-50 to-white p-6 text-center sm:p-8">
              <p className="font-display text-lg font-semibold tracking-[0.3em] text-amber-600/80">
                CERTIFICADO
              </p>
              <p className="mt-4 text-sm text-slate-500">Este certificado é atribuído a</p>
              <p className="font-display mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                {viewing.userName ?? userName ?? "Estudante"}
              </p>
              <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-slate-500">
                por concluir com aproveitamento o curso
              </p>
              <p className="font-display mt-2 text-xl font-bold text-primary sm:text-2xl">
                {viewing.course?.title ?? ""}
              </p>
              <div className="mt-8 flex flex-wrap items-end justify-center gap-6 text-xs text-slate-500 sm:gap-8">
                <div className="border-t border-slate-400 px-6 pt-2">
                  {formatDate(viewing.issuedAt)}
                  <div className="mt-1 text-[10px] uppercase tracking-wide">Data de emissão</div>
                </div>
                <div className="border-t border-slate-400 px-6 pt-2">
                  {viewing.id.slice(0, 12).toUpperCase()}
                  <div className="mt-1 text-[10px] uppercase tracking-wide">Referência</div>
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
