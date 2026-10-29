import Link from "next/link";
import { ArrowRight, CheckCircle2, GraduationCap, Phone } from "lucide-react";

const garantias = [
  "Inscrição simples e rápida",
  "Certificado reconhecido",
  "Acompanhamento por formadores",
];

export function CtaProximoPasso() {
  return (
    <section className="bg-background py-12 md:py-16">
      <div className="container-page">
        <div className="relative isolate overflow-hidden rounded-3xl bg-primary px-6 py-12 text-primary-foreground shadow-glow md:px-12 md:py-16 lg:px-16">
          {/* Elementos decorativos */}
          {/* <div
            className="pointer-events-none absolute -right-20 -top-20 -z-10 h-80 w-80 rounded-full bg-primary-glow/30 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-24 left-1/3 -z-10 h-72 w-72 rounded-full bg-white/10 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07] [background-image:linear-gradient(white_1px,transparent_1px),linear-gradient(90deg,white_1px,transparent_1px)] [background-size:44px_44px]"
            aria-hidden="true"
          /> */}

          <div className="grid items-center gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
            {/* Texto e ações */}
            <div>
              <div className="flex items-center gap-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/25 bg-white/10 backdrop-blur-sm">
                  <GraduationCap className="h-7 w-7" />
                </span>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground/80">
                  O seu futuro começa aqui
                </p>
              </div>

              <h2 className="mt-6 text-3xl font-extrabold leading-tight md:text-4xl lg:text-5xl">
                Pronto para dar o próximo passo?
              </h2>

              <p className="mt-4 max-w-xl text-base leading-relaxed text-primary-foreground/85 md:text-lg">
                Escolha o curso que mais se adequa aos seus objetivos e dê o primeiro
                passo para uma carreira com mais competências e mais oportunidades.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/cursos"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-secondary px-7 py-3.5 text-sm font-semibold text-secondary-foreground shadow-elevated transition-all hover:-translate-y-0.5 hover:bg-secondary/90"
                >
                  Explorar cursos
                  <ArrowRight className="h-4 w-4" />
                </Link>
                {/* <Link
                  href="/contactos"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/5 px-7 py-3.5 text-sm font-semibold text-primary-foreground backdrop-blur-sm transition-colors hover:bg-white/15"
                >
                  <Phone className="h-4 w-4" />
                  Falar com um consultor
                </Link> */}
              </div>
            </div>

            {/* Painel de garantias */}
            <aside className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-md md:p-8">
              <p className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/80">
                Porquê a Unitec Academy
              </p>
              <ul className="mt-5 space-y-4">
                {garantias.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm font-medium md:text-base">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary-glow" />
                    {item}
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}