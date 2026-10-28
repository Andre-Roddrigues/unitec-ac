"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const identifier = String(formData.get("identifier") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!identifier || !password) {
      setError("Por favor, preencha todos os campos.");
      return;
    }

    setError(null);
    setIsPending(true);

    const { error: signInError } = await authClient.signIn.authService({
      identifier,
      password,
    });

    if (signInError) {
      const message = signInError.message || "Credenciais inválidas.";
      setError(message);
      toast.error(message);
      setIsPending(false);
      return;
    }

    // `from` é preenchido pelo middleware quando bloqueia uma rota protegida.
    const from = searchParams.get("from");
    router.replace(from && from.startsWith("/") ? from : "/perfil");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm font-medium text-destructive"
        >
          {error}
        </div>
      )}

      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="identifier">Email ou contacto</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              id="identifier"
              name="identifier"
              type="text"
              autoComplete="username"
              placeholder="nome@exemplo.com"
              required
              className="h-12 pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Palavra-passe</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              className="h-12 pl-10"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            A recuperação de palavra-passe é feita no serviço de autenticação da Unitec.
          </p>
        </div>
      </div>

      <Button type="submit" disabled={isPending} className="h-12 w-full font-semibold">
        {isPending ? <Loader2 className="size-5 animate-spin" /> : "Entrar"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Ainda não tem conta?{" "}
        <Link href="/registar" className="font-medium text-primary hover:underline">
          Registar
        </Link>
      </p>
    </form>
  );
}
