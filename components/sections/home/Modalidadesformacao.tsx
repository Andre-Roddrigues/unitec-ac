import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Monitor, Users } from "lucide-react";

/*
 * Imagens do Unsplash. Substitui os IDs pelas fotos escolhidas em
 * https://unsplash.com (o formato é images.unsplash.com/photo-<ID>).
 * Para usar next/image, adiciona "images.unsplash.com" a
 * `images.remotePatterns` no next.config.js.
 */
const UNSPLASH = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

const modalidades = [
  {
    titulo: "Cursos Presenciais",
    descricao:
      "Aprenda na prática, desenvolva competências profissionais e prepare-se para os desafios reais do mercado de trabalho.",
    href: "/cursos?modalidade=presencial",
    imagem: "/brand/presencial.jpg",
    alt: "Formandos a trabalhar em grupo numa sala de formação",
    Icon: Users,
    iconBg: "bg-primary text-primary-foreground",
  },
  {
    titulo: "Cursos Online",
    descricao: "Aprenda a partir de qualquer lugar, desenvolva novas competências e invista no seu futuro com mais flexibilidade.",
    href: "/cursos?modalidade=online",
    imagem: "/brand/online.jpg",
    alt: "Estudante a usar portátil e auscultadores",
    Icon: Monitor,
    iconBg: "bg-secondary text-secondary-foreground",
  },
];

export function ModalidadesFormacao() {
  return (
    <section className="bg-background py-16 md:py-20">
      <div className="container-page">
        {/* Cabeçalho da secção */}
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
              Unitec Academy
            </p>
            <h2 className="mt-2 text-3xl font-bold text-primary md:text-4xl">
              Formação para todas as suas metas
            </h2>
          </div>
        </div>

        {/* Cartões */}
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {modalidades.map(({ titulo, descricao, href, imagem, alt, Icon, iconBg }) => (
            <article
              key={titulo}
              className="group overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-shadow duration-300 hover:shadow-elevated"
            >
              <div className="relative h-56 w-full overflow-hidden md:h-64">
                <Image
                  src={imagem}
                  alt={alt}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              <div className="relative px-6 pb-6 pt-10">
                {/* Ícone sobreposto à imagem */}
                <span
                  className={`absolute -top-8 left-6 flex h-16 w-16 items-center justify-center rounded-full border-4 border-card shadow-card ${iconBg}`}
                >
                  <Icon className="h-7 w-7" />
                </span>

                <h3 className="text-xl font-bold text-card-foreground">{titulo}</h3>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
                  {descricao}
                </p>

                <Link
                  href={href}
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-secondary transition-colors hover:text-primary"
                >
                  Explorar cursos
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Link para ecrãs pequenos */}
        <Link
          href="/cursos"
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-secondary sm:hidden"
        >
          Ver todos os cursos
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}