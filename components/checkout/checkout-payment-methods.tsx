import { CreditCard, Smartphone } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PaymentMethod } from "@/lib/checkout";

const METHODS: {
  id: PaymentMethod;
  label: string;
  description: string;
  icon: LucideIcon;
  accent: string;
  /** Sem processador ligado no Payment Service — ver PLANO-BACKEND-CO-ACADEMIA.md. */
  disabled?: boolean;
}[] = [
  {
    id: "MPESA",
    label: "M-Pesa",
    description: "Confirme o pagamento no seu telemóvel Vodacom.",
    icon: Smartphone,
    accent: "bg-destructive/10 text-destructive",
  },
  {
    id: "EMOLA",
    label: "e-Mola",
    description: "Brevemente.",
    icon: Smartphone,
    accent: "bg-warning/15 text-warning-foreground",
    disabled: true,
  },
  {
    id: "CARD",
    label: "Cartão bancário",
    description: "Brevemente.",
    icon: CreditCard,
    accent: "bg-primary-soft text-primary",
    disabled: true,
  },
];

export function CheckoutPaymentMethods({
  value,
  onChange,
}: {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        2 · Forma de pagamento
      </h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {METHODS.map((m) => {
          const active = m.id === value;
          return (
            <button
              key={m.id}
              type="button"
              disabled={m.disabled}
              onClick={() => onChange(m.id)}
              aria-pressed={active}
              className={cn(
                "flex flex-col gap-2 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/60 cursor-pointer",
                active && "border-primary ring-1 ring-primary shadow-elevated",
                m.disabled && "cursor-not-allowed opacity-50 hover:border-border",
              )}
            >
              <span className={cn("grid size-9 place-items-center rounded-lg", m.accent)}>
                <m.icon className="size-4" />
              </span>
              <span className="font-semibold">{m.label}</span>
              <span className="text-xs text-muted-foreground">{m.description}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
