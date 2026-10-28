"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Briefcase,
  Calculator,
  ChevronLeft,
  ChevronRight,
  HardHat,
  HeartPulse,
  Languages,
  Laptop,
  Megaphone,
  Palette,
  Truck,
  Users,
  type LucideIcon,
} from "lucide-react";

type Area = {
  nome: string;
  href: string;
  Icon: LucideIcon;
  tom: string;
};

const areas: Area[] = [
  { nome: "Administração e Gestão", href: "/cursos?area=administracao", Icon: Briefcase, tom: "bg-chart-1/10 text-chart-1" },
  { nome: "Contabilidade e Finanças", href: "/cursos?area=contabilidade", Icon: Calculator, tom: "bg-chart-2/10 text-chart-2" },
  { nome: "Informática e Tecnologia", href: "/cursos?area=informatica", Icon: Laptop, tom: "bg-chart-1/10 text-chart-1" },
  { nome: "Idiomas", href: "/idiomas", Icon: Languages, tom: "bg-chart-5/10 text-chart-5" },
  { nome: "Marketing e Comunicação", href: "/cursos?area=marketing", Icon: Megaphone, tom: "bg-chart-5/10 text-chart-5" },
  { nome: "Engenharia e Construção", href: "/cursos?area=engenharia", Icon: HardHat, tom: "bg-chart-2/10 text-chart-2" },
  { nome: "Saúde e Segurança", href: "/cursos?area=saude", Icon: HeartPulse, tom: "bg-chart-4/10 text-chart-4" },
  { nome: "Logística e Procurement", href: "/cursos?area=logistica", Icon: Truck, tom: "bg-chart-3/10 text-chart-3" },
  { nome: "Recursos Humanos", href: "/cursos?area=rh", Icon: Users, tom: "bg-chart-1/10 text-chart-1" },
  { nome: "Design e Multimédia", href: "/cursos?area=design", Icon: Palette, tom: "bg-chart-4/10 text-chart-4" },
];

const GAP_PX = 12; // gap-3

export function AreasAprendizagem() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [podeVoltar, setPodeVoltar] = useState(false);
  const [podeAvancar, setPodeAvancar] = useState(true);

  const atualizarEstado = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const maximo = el.scrollWidth - el.clientWidth;
    setPodeVoltar(el.scrollLeft > 4);
    setPodeAvancar(el.scrollLeft < maximo - 4);
  }, []);

  useEffect(() => {
    atualizarEstado();
    window.addEventListener("resize", atualizarEstado);
    return () => window.removeEventListener("resize", atualizarEstado);
  }, [atualizarEstado]);

  const navegar = (sentido: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const primeiro = el.firstElementChild as HTMLElement | null;
    const passo = primeiro ? primeiro.offsetWidth + GAP_PX : el.clientWidth * 0.8;
    el.scrollBy({ left: sentido * passo, behavior: "smooth" });
  };

  return (
    <section className="bg-darkBlue py-12 md:py-16">
      <div className="container-page">
        {/* Cabeçalho */}
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-background md:text-3xl">
              Áreas de aprendizagem
            </h2>
            <p className="mt-1.5 text-sm text-background/80">
              Explore as principais áreas de formação e encontre o curso certo para si.
            </p>
          </div>

          <div className="flex items-center gap-3">

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => navegar(-1)}
                disabled={!podeVoltar}
                aria-label="Áreas anteriores"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => navegar(1)}
                disabled={!podeAvancar}
                aria-label="Próximas áreas"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Faixa de cartões */}
        <div
          ref={trackRef}
          onScroll={atualizarEstado}
          className="mt-8 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {areas.map(({ nome, href, Icon, tom }) => (
            <Link
              key={nome}
              href={href}
              className="group flex w-[132px] shrink-0 snap-start flex-col items-center rounded-xl border border-border/70 bg-card px-3 py-5 text-center transition-colors hover:border-primary/30 hover:bg-accent/40 sm:w-[144px]"
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-105 ${tom}`}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="mt-3 line-clamp-2 text-xs font-medium leading-snug text-card-foreground">
                {nome}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}