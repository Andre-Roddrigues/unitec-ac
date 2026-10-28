import type { Metadata } from "next";
import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Registar | Unitec Academy",
  description: "Crie a sua conta na Unitec Academy e comece a aprender hoje.",
};

export default function RegistarPage() {
  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-lg space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="font-display text-3xl font-bold tracking-tight">Criar conta</h1>
          <p className="text-muted-foreground">
            Registe-se para se inscrever em cursos e acompanhar o seu progresso.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <Suspense>
            <RegisterForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
