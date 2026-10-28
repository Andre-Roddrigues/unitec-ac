"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Layers, CircleUser, Users, ShieldCheck, Search } from "lucide-react";

const indicadores = [
  { icon: CircleUser, label: ["Cursos próprios", "e de parceiros"] },
  { icon: Users, label: ["Formadores", "especializados"] },
  { icon: ShieldCheck, label: ["Certificado", "reconhecido"] },
];

export function Hero() {
  return (
    <section className="relative h-screen mt-8 isolate overflow-hidden bg-primary text-primary-foreground">
      {/* Imagem de fundo com degradê para dar contraste ao texto */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/brand/Lizzy.webp"
          alt="Estudante sorridente com tablet"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[70%_center]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--primary)_0%,color-mix(in_oklab,var(--primary)_85%,transparent)_38%,transparent_72%)]" />
      </div>

      <div className="container-page flex min-h-[560px] flex-col justify-between py-14 md:min-h-[600px] md:py-16">
        <div className="max-w-2xl">

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-5xl font-extrabold leading-[1.02] md:text-6xl"
          >
            Aprenda.
            <br />
            Desenvolva-se.
            <br />
            <span className="text-primary-glow">Avance.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 max-w-md text-base text-primary-foreground/85 md:text-lg"
          >
            Cursos que transformam o seu potencial em competências reais para o
            mercado de trabalho.
          </motion.p>

          {/* Barra de pesquisa */}
          <motion.form
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            onSubmit={(e) => e.preventDefault()}
            className="mt-8 flex w-full max-w-xl items-center gap-2 rounded-2xl bg-card p-2 shadow-elevated"
          >
            <Search className="ml-3 h-5 w-5 shrink-0 text-muted-foreground" />
            <input
              type="search"
              placeholder="O que você quer aprender?"
              className="h-11 min-w-0 flex-1 bg-transparent px-2 text-base text-card-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <button
              type="submit"
              className="h-11 shrink-0 rounded-xl bg-secondary px-6 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-secondary/90"
            >
              Pesquisar
            </button>
          </motion.form>
        </div>

        {/* Indicadores */}
        <motion.ul
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-4"
        >
          {indicadores.map(({ icon: Icon, label }) => (
            <li key={label.join(" ")} className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary-foreground/30 bg-primary-foreground/10 backdrop-blur-sm">
                <Icon className="h-5 w-5 text-primary-foreground" />
              </span>
              <span className="text-sm leading-tight text-primary-foreground/90">
                {label[0]}
                <br />
                {label[1]}
              </span>
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}