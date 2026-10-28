"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { User, Mail, Lock, Phone, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { registerSchema } from "@/lib/validations/auth";

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const raw = {
      nome: String(formData.get("nome") ?? "").trim(),
      apelido: String(formData.get("apelido") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      password: String(formData.get("password") ?? ""),
      contacto: String(formData.get("contacto") ?? "").trim(),
    };

    const parsed = registerSchema.safeParse(raw);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      setFormError(null);
      return;
    }

    setErrors({});
    setFormError(null);
    setIsPending(true);

    const { contacto, ...rest } = parsed.data;
    const { error: signUpError } = await authClient.signUp.authService({
      ...rest,
      contacto: contacto || undefined,
    });

    if (signUpError) {
      const message = signUpError.message || "Não foi possível criar a conta.";
      setFormError(message);
      toast.error(message);
      setIsPending(false);
      return;
    }

    toast.success("Conta criada com sucesso!");
    const from = searchParams.get("from");
    router.replace(from && from.startsWith("/") ? from : "/perfil");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formError && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm font-medium text-destructive"
        >
          {formError}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input id="nome" name="nome" autoComplete="given-name" required className="h-12 pl-10" />
          </div>
          {errors.nome && <p className="text-xs text-destructive">{errors.nome}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="apelido">Apelido</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input id="apelido" name="apelido" autoComplete="family-name" required className="h-12 pl-10" />
          </div>
          {errors.apelido && <p className="text-xs text-destructive">{errors.apelido}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="nome@exemplo.com"
            required
            className="h-12 pl-10"
          />
        </div>
        {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="contacto">Contacto (opcional)</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            id="contacto"
            name="contacto"
            type="tel"
            autoComplete="tel"
            placeholder="+258 84 000 0000"
            className="h-12 pl-10"
          />
        </div>
        {errors.contacto && <p className="text-xs text-destructive">{errors.contacto}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Palavra-passe</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            placeholder="••••••••"
            className="h-12 pl-10"
          />
        </div>
        {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
      </div>

      <Button type="submit" disabled={isPending} className="h-12 w-full font-semibold">
        {isPending ? <Loader2 className="size-5 animate-spin" /> : "Criar conta"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link href="/entrar" className="font-medium text-primary hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}
