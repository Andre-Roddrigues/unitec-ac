import { z } from "zod";

export const coursePackageSchema = z.enum(["ESSENTIAL", "STANDARD", "INTERACTIVE"]);

// Só M-Pesa está ligado ao backend_co por agora — e-Mola e cartão continuam
// no ecrã (desactivados na UI, ver checkout-payment-methods.tsx) e
// transferência fica para a Fase 4 do plano (exige comprovativo e ecrã de
// revisão do admin, que ainda não existem). O `refine` é defesa a mais: a UI
// já impede escolher outro método. Ver PLANO-BACKEND-CO-ACADEMIA.md.
export const checkoutSchema = z
  .object({
    courseId: z.string().min(1, "ID do curso é obrigatório"),
    packageId: coursePackageSchema,
    paymentMethod: z.enum(["MPESA", "EMOLA", "CARD"]).default("MPESA"),
    phone: z
      .string()
      .min(8, "Número de telefone inválido")
      .max(20, "Número de telefone inválido"),
  })
  .refine((data) => data.paymentMethod === "MPESA", {
    message: "Este método de pagamento ainda não está disponível",
    path: ["paymentMethod"],
  });

export type CheckoutInput = z.infer<typeof checkoutSchema>;
