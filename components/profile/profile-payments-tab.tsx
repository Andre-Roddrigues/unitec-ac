import { CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatPrice } from "@/lib/format";

export interface ProfilePayment {
  id: string;
  /** Referência do serviço de pagamentos; `null` nas matrículas antigas. */
  reference: string | null;
  courseTitle: string;
  /** "Pacote Padrão", "Certificado", … */
  itemLabel: string;
  amount: number;
  date: string;
}

const BACKEND_PACKAGE_LABEL: Record<string, string> = {
  ESSENTIAL: "Essencial",
  STANDARD: "Padrão",
  INTERACTIVE: "Interativo",
};

export function packageLabel(pkg?: string | null): string {
  return BACKEND_PACKAGE_LABEL[pkg ?? ""] ?? pkg ?? "Padrão";
}

export function ProfilePaymentsTab({ payments }: { payments: ProfilePayment[] }) {
  if (payments.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        Só aparecem aqui os pagamentos confirmados — inscrições em cursos e certificados.
      </p>
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Referência</TableHead>
            <TableHead>Curso</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Data</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell className="font-mono text-xs">
                {payment.reference ?? <span className="text-muted-foreground">—</span>}
              </TableCell>
              <TableCell className="max-w-[240px] truncate">{payment.courseTitle}</TableCell>
              <TableCell className="whitespace-nowrap">{payment.itemLabel}</TableCell>
              <TableCell className="whitespace-nowrap">{formatDate(payment.date)}</TableCell>
              <TableCell className="text-right font-medium">
                {formatPrice(payment.amount)}
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="inline-flex items-center gap-1">
                  <CreditCard className="size-3.5" /> Pago
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>
    </div>
  );
}
