import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres").max(100, "Nome muito longo"),
  avatarUrl: z.string().url("URL do avatar inválida").optional().or(z.literal("")),
  phone: z.string().max(30, "Telefone muito longo").optional().or(z.literal("")),
  city: z.string().max(100, "Cidade muito longa").optional().or(z.literal("")),
  headline: z.string().max(150, "Título muito longo").optional().or(z.literal("")),
  bio: z.string().max(1000, "Biografia muito longa").optional().or(z.literal("")),
});

export type ProfileInput = z.infer<typeof profileSchema>;
