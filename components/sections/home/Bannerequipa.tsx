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
        <div className="grid overflow-hidden bg-primary rounded-3xl bg-card shadow-elevated md:grid-cols-2">
          {/* Texto */}
          <div className="flex flex-col justify-center px-6 py-12 md:px-12 lg:px-16">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-background">
              Junte-se a nós
            </p>

            <h2 className="mt-3 text-3xl font-extrabold leading-tight text-background md:text-4xl">
              Faça parte da nossa equipa
            </h2>

            <p className="mt-4 max-w-md text-base leading-relaxed text-background/80">
              Procuramos formadores e profissionais apaixonados por ensinar e por
              transformar vidas através da formação. Candidate-se e cresça connosco.
            </p>

            <Link
              href="/carreiras"
              className="mt-8 inline-flex w-fit items-center gap-2 rounded-xl bg-secondary px-6 py-3 text-sm font-semibold text-secondary-foreground shadow-glow transition-colors hover:bg-secondary/90"
            >
              Candidate-se
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