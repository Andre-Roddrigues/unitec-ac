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
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=80`;

const IMAGEM_EQUIPA = UNSPLASH("photo-REPLACE-EQUIPA");

export function BannerEquipa() {
  return (
    <section className="bg-background py-10 md:py-14">
      <div className="container-page">
        <div className="grid overflow-hidden bg-background rounded-3xl bg-card shadow-elevated md:grid-cols-2">
          {/* Texto */}
          <div className="flex flex-col justify-center px-6 py-12 md:px-12 lg:px-16">

            <h2 className="mt-3 text-3xl font-extrabold leading-tight text-primary md:text-4xl">
              Partilhe o seu conhecimento. Chegue a mais pessoas.
            </h2>

            <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
              É formador ou representa uma instituição de formação? Publique os seus cursos na Unitec Academy e ajude mais pessoas a desenvolver competências e a descobrir novas oportunidades
            </p>

            <Link
              href="https://partner.unitec.co.mz"
              className="mt-8 inline-flex w-fit items-center gap-2 rounded-xl bg-secondary px-6 py-3 text-sm font-semibold text-secondary-foreground shadow-glow transition-colors hover:bg-secondary/90"
            >
              Ensinar na Unitec Academy →
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Imagem */}
          <div className="relative min-h-[260px] md:min-h-[360px]">
            <Image
              src="/images/be-a-teacher.jpg"
              alt="Equipa de formadores a colaborar numa sala de formação"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}