import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CtaFinal() {
  return (
    <section className="bg-background py-12 md:py-16">
      <div className="container-page">
        {/* Banner */}
        <div className="relative isolate overflow-hidden rounded-3xl bg-primary px-6 py-10 text-primary-foreground shadow-elevated md:px-12 md:py-12 lg:px-16">

          <div className="flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between md:gap-12">
            {/* Texto */}
            <div className="max-w-2xl">
              <h2 className="mt-4 text-2xl font-extrabold leading-tight md:text-3xl lg:text-4xl">
                O seu próximo passo começa com uma escolha.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-primary-foreground/85 md:text-base">
                Descubra o curso ideal para os seus objectivos e comece hoje a investir
                no seu desenvolvimento.
              </p>
            </div>

            {/* Botão */}
            <div className="shrink-0">
              <Link
                href="/cursos"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-secondary px-8 py-4 text-sm font-semibold text-secondary-foreground shadow-glow transition-all hover:-translate-y-0.5 hover:bg-secondary/90 md:text-base"
              >
                Explorar Cursos
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}