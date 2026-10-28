import { z } from "zod";

export const reviewSchema = z.object({
  courseId: z.string().min(1, "ID do curso é obrigatório"),
  rating: z.number().min(1, "Selecione pelo menos 1 estrela").max(5, "Máximo de 5 estrelas"),
  comment: z.string().max(1000, "O comentário não pode exceder 1000 caracteres").optional(),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
