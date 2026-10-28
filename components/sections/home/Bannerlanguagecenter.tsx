import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

/*
 * Imagem do Unsplash. Substitui o ID pela foto escolhida em
 * https://unsplash.com (formato images.unsplash.com/photo-<ID>).
 * Para usar next/image, adiciona "images.unsplash.com" a
 * `images.remotePatterns` no next.config.js.
 */
const UNSPLASH = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=80`;

const IMAGEM_BANNER = UNSPLASH("photo-REPLACE-LANGUAGE");

const idiomas = [
  { nome: "Inglês", bandeira: "gb" },
  { nome: "Francês", bandeira: "fr" },
  { nome: "Mandarim", bandeira: "cn" },
  { nome: "Português", bandeira: "pt" },
  { nome: "Changana", bandeira: "mz" },
];

export function BannerLanguageCenter() {
  return (
    <section className="bg-background w-full">
      <div className="">
        <div className="relative isolate overflow-hidden bg-primary text-primary-foreground shadow-elevated">
          {/* Imagem à direita, com degradê para o texto ler bem */}
          <div className="absolute inset-0 -z-10">
            <Image
              src="/images/language-center-flags.png"
              alt="Estudante a tomar notas com auscultadores"
              fill
              sizes="(min-width: 1280px) 1280px, 100vw"
              className="object-cover object-[center_30%]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--primary)_0%,color-mix(in_oklab,var(--primary)_88%,transparent)_45%,transparent_80%)]" />
          </div>

          <div className="relative flex min-h-[360px] flex-col justify-center px-6 py-12 md:min-h-[400px] md:px-12 lg:px-16">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground/90">
              Unitec Language Center
            </p>

            <h2 className="mt-3 max-w-lg text-3xl font-extrabold leading-[1.1] md:text-4xl lg:text-5xl">
              Aprenda um novo idioma.
            </h2>

            <p className="mt-4 max-w-md text-sm text-primary-foreground/85 md:text-base">
              Cursos de idiomas da Unitec e de formadores parceiros, com opções
              presenciais, online e ao domicílio.
            </p>

            {/* Lista de idiomas */}
            <ul className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3">
              {idiomas.map(({ nome, bandeira }, i) => (
                <li key={nome} className="flex items-center gap-4">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://flagcdn.com/w40/${bandeira}.png`}
                      srcSet={`https://flagcdn.com/w80/${bandeira}.png 2x`}
                      width={24}
                      height={24}
                      alt=""
                      className="h-6 w-6 rounded-full object-cover ring-1 ring-primary-foreground/30"
                    />
                    {nome}
                  </span>
                  {i < idiomas.length - 1 && (
                    <span className="hidden h-5 w-px bg-primary-foreground/30 sm:block" aria-hidden="true" />
                  )}
                </li>
              ))}
              <li className="text-sm text-primary-foreground/80">+ e mais…</li>
            </ul>

            <Link
              href="/idiomas"
              className="mt-8 inline-flex w-fit items-center gap-2 rounded-xl bg-secondary px-6 py-3 text-sm font-semibold text-secondary-foreground shadow-glow transition-colors hover:bg-secondary/90"
            >
              Explorar idiomas
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}