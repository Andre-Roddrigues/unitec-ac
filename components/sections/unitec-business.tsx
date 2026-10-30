import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  GraduationCap,
  MapPin,
  Target,
  TrendingUp,
} from "lucide-react";

/*
 * Imagem do Unsplash. Substitui o ID pela foto escolhida em
 * https://unsplash.com (formato images.unsplash.com/photo-<ID>).
 * Para usar next/image, adiciona "images.unsplash.com" a
 * `images.remotePatterns` no next.config.js.
 */
const UNSPLASH = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=80`;

const IMAGEM_BUSINESS = UNSPLASH("photo-REPLACE-BUSINESS");

const modalidades = [
  {
    titulo: "No seu local de trabalho",
    descricao:
      "Levamos a formação até à sua equipa. As sessões decorrem nas instalações da sua organização, com horários adaptados à rotina de trabalho.",
    Icon: Building2,
  },
  {
    titulo: "Nas nossas instalações",
    descricao:
      "Os colaboradores deslocam-se a um dos nossos espaços, com equipamento e salas preparados para formação prática.",
    Icon: MapPin,
  },
];

const beneficios = [
  {
    titulo: "Programas à medida",
    descricao: "Conteúdos desenhados a partir das necessidades reais da sua equipa e dos seus objetivos.",
    Icon: Target,
  },
  {
    titulo: "Formadores especializados",
    descricao: "Profissionais com experiência prática nas áreas em que formam.",
    Icon: GraduationCap,
  },
  {
    titulo: "Resultados mensuráveis",
    descricao: "Acompanhamento do progresso e avaliação das competências adquiridas.",
    Icon: TrendingUp,
  },
];

const pontos = [
  "Programas adaptados às necessidades da organização.",
  "Formação nas instalações da empresa ou da Unitec Academy",
  "Planeamento de horários e cargas horárias",
  "Acompanhamento e avaliação da formação",
];

export function UnitecBusiness() {
  return (
    <section className="bg-background py-16 md:py-20">
      <div className="container-page">
        {/* Cabeçalho */}
        {/* Cabeçalho */}
        <div className="grid bg-darkBlue overflow-hidden rounded-3xl bg-card shadow-elevated lg:grid-cols-2">
          {/* Texto */}
          <div className="flex flex-col justify-center px-6 py-12 md:px-10 lg:px-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-background">
              Unitec Business
            </p>
            <h2 className="mt-3 text-3xl font-extrabold leading-tight text-background md:text-4xl">
              Desenvolva o talento da sua equipa.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-background/80 md:text-lg">
              Formação profissional adaptada às necessidades da sua organização. Desenvolva competências, prepare os seus colaboradores e invista no crescimento da sua equipa.
            </p>

            <ul className="mt-6 space-y-3">
              {pontos.map((ponto) => (
                <li key={ponto} className="flex items-start gap-3 text-sm text-background/80 md:text-base">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                  {ponto}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="https://business.unitec.co.mz"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-secondary px-6 py-3 text-sm font-semibold text-secondary-foreground shadow-glow transition-colors hover:bg-secondary/90"
              >
                Solicitar formação empresarial
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Imagem — preenche de ponta a ponta a coluna que ocupa */}
          <div className="relative min-h-[300px] lg:min-h-[480px]">
            <Image
              src="/images/small-business-mentoring.png"
              alt="Formação de equipa numa empresa"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>

        {/* Modalidades */}
        <div className="mt-16">
          <h3 className="text-xl font-bold text-primary md:text-2xl">
            Escolha como quer formar a sua equipa
          </h3>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {modalidades.map(({ titulo, descricao, Icon }) => (
              <div
                key={titulo}
                className="flex gap-5 rounded-2xl border border-border bg-card p-6 shadow-card"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Icon className="h-6 w-6" />
                </span>
                <div>
                  <h4 className="font-bold text-card-foreground">{titulo}</h4>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {descricao}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}