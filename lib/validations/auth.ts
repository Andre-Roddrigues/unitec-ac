import { z } from "zod";

export const loginSchema = z.object({
  identifier: z.string().min(1, "Indique o seu email ou contacto"),
  password: z.string().min(1, "Palavra-passe obrigatória"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  nome: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  apelido: z.string().min(2, "O apelido deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A palavra-passe deve ter pelo menos 6 caracteres"),
  contacto: z
    .string()
    .min(9, "Contacto inválido")
    .max(20, "Contacto inválido")
    .optional()
    .or(z.literal("")),
});

export type RegisterInput = z.infer<typeof registerSchema>;
