import { ArrowRight, Info } from "lucide-react";

const URL_SOBRE = "https://unitec.co.mz/sobre";

export function CtaQuemSomos() {
  return (
    <section className="bg-background py-10 md:py-14">
      <div className="container-page">
        <div className="relative isolate flex flex-col items-start justify-between gap-8 overflow-hidden rounded-3xl bg-primary-soft px-6 py-10 md:flex-row md:items-center md:px-12 md:py-12">
          {/* Decoração suave ao fundo */}
          <div
            className="pointer-events-none absolute -right-24 -top-24 -z-10 h-72 w-72 rounded-full bg-primary-glow/20 blur-3xl"
            aria-hidden="true"
          />

          <div className="flex items-start gap-5">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-glow">
              <Info className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
                Sobre nós
              </p>
              <h2 className="mt-2 text-2xl font-extrabold leading-tight text-primary md:text-3xl">
                Quem somos
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
                Conheça a nossa missão, a nossa equipa e o compromisso da Unitec
                com a formação que transforma carreiras em Moçambique.
              </p>
            </div>
          </div>

          <a
            href={URL_SOBRE}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-secondary px-6 py-3 text-sm font-semibold text-secondary-foreground shadow-glow transition-colors hover:bg-secondary/90"
          >
            Conheça a Unitec
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}