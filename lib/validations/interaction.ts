import { z } from "zod";

export const interactionSchema = z.object({
  enrollmentId: z.string().min(1, "ID da matrícula é obrigatório"),
  question: z.string().min(5, "A pergunta deve ter pelo menos 5 caracteres").max(2000, "Pergunta muito longa"),
});

export type InteractionInput = z.infer<typeof interactionSchema>;
