"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Users, ShieldCheck, CircleUser, Search } from "lucide-react";
import { VideoModal, PlayButton } from "./VideoModal";

const indicadores = [
  { icon: CircleUser, label: ["Cursos próprios", "e de parceiros"] },
  { icon: Users, label: ["Formadores", "especializados"] },
  { icon: ShieldCheck, label: ["Certificado", "reconhecido"] },
];

export function Hero() {
  return (
    <section className="relative isolate mt-8 flex h-screen overflow-hidden bg-primary text-primary-foreground">
      {/* Imagem de fundo com véu uniforme e reforço em baixo, para o texto centrado ler bem */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/brand/Lizzy.webp"
          alt="Estudante sorridente com tablet"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-primary/75" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_40%,var(--primary)_100%)] opacity-80" />
      </div>

      <div className="container-page flex h-full flex-col items-center justify-center py-14 text-center md:py-16">
        <div className="flex max-w-3xl flex-col items-center">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl font-extrabold leading-[1.02] md:text-6xl"
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
            className="mt-8 flex w-full max-w-xl items-center gap-2 rounded-2xl bg-card p-2 text-left shadow-elevated"
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

        {/* Indicadores, centrados em linha */}
        <motion.ul
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 grid w-full max-w-4xl grid-cols-2 gap-6 md:grid-cols-4 md:gap-4"
        >
          {indicadores.map(({ icon: Icon, label }) => (
            <li key={label.join(" ")} className="flex items-center justify-center gap-3 text-left">
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

          {/* Como se inscrever: abre o vídeo num modal */}
          <li className="flex items-center justify-center">
            <VideoModal
              titulo="Como se inscrever na Unitec"
              src="/brand/como-inscrever.mp4"
              poster="/brand/como-inscrever-poster.webp"
            >
              <PlayButton label="Como se inscrever" />
            </VideoModal>
          </li>
        </motion.ul>
      </div>
    </section>
  );
}