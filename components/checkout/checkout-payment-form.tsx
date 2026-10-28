import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PaymentMethod } from "@/lib/checkout";

export interface CardDetails {
  number: string;
  name: string;
  expiry: string;
  cvc: string;
}

export function CheckoutPaymentForm({
  method,
  phone,
  onPhoneChange,
  card,
  onCardChange,
  profileName,
}: {
  method: PaymentMethod;
  phone: string;
  onPhoneChange: (phone: string) => void;
  card: CardDetails;
  onCardChange: (card: CardDetails) => void;
  profileName: string;
}) {
  return (
    <section className="space-y-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        3 · Dados de pagamento
      </h2>

      {method !== "CARD" ? (
        <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
          <div className="space-y-2">
            <Label htmlFor="phone">Número {method === "MPESA" ? "M-Pesa" : "e-Mola"}</Label>
            <Input
              id="phone"
              inputMode="tel"
              value={phone}
              onChange={(e) => onPhoneChange(e.target.value)}
              placeholder={method === "MPESA" ? "+258 84 000 0000" : "+258 86 000 0000"}
            />
            <p className="text-xs text-muted-foreground">
              Vai receber um pedido de confirmação no telemóvel. Introduza o seu PIN para concluir.
            </p>
          </div>
          {/* O campo "E-mail para o recibo" era só decoração: não tinha
              `value` nem `onChange`, e a compra nunca o enviava. */}
        </div>
      ) : (
        <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
          <div className="space-y-2">
            <Label htmlFor="card-number">Número do cartão</Label>
            <Input
              id="card-number"
              inputMode="numeric"
              placeholder="4242 4242 4242 4242"
              value={card.number}
              onChange={(e) => onCardChange({ ...card, number: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="card-name">Nome no cartão</Label>
            <Input
              id="card-name"
              placeholder={profileName}
              value={card.name}
              onChange={(e) => onCardChange({ ...card, name: e.target.value })}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="card-expiry">Validade</Label>
              <Input
                id="card-expiry"
                placeholder="MM/AA"
                value={card.expiry}
                onChange={(e) => onCardChange({ ...card, expiry: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="card-cvc">CVC</Label>
              <Input
                id="card-cvc"
                inputMode="numeric"
                placeholder="123"
                maxLength={4}
                value={card.cvc}
                onChange={(e) => onCardChange({ ...card, cvc: e.target.value })}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Pagamentos com cartão têm uma taxa de processamento de 2%.
          </p>
        </div>
      )}
    </section>
  );
}
