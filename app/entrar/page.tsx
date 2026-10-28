import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Entrar | Unitec Academy",
  description: "Inicie sessão para aceder aos seus cursos na Unitec Academy.",
};

export default function EntrarPage() {
  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="font-display text-3xl font-bold tracking-tight">Entrar</h1>
          <p className="text-muted-foreground">Aceda à sua conta Unitec para continuar a aprender.</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
