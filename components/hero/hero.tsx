"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { CircleUser, Users, ShieldCheck, Play, Search } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VideoPlayer } from "./Videoplayer";

const indicadores = [
  { icon: CircleUser, label: ["Cursos próprios", "e de parceiros"] },
  { icon: Users, label: ["Formadores", "especializados"] },
  { icon: ShieldCheck, label: ["Certificado", "reconhecido"] },
];

export function Hero() {
  const [videoAberto, setVideoAberto] = useState(false);

  return (
    <section className="relative isolate mt-8 h-screen overflow-hidden bg-primary text-primary-foreground">
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
        <div className="absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--primary)_80%,transparent)_0%,color-mix(in_oklab,var(--primary)_90%,transparent)_100%)]" />
      </div>

      <div className="container-page flex h-full flex-col items-center justify-center gap-12 py-14 text-center md:gap-16">
        <div className="flex max-w-2xl flex-col items-center">
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

        {/* Indicadores */}
        <motion.ul
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid w-full max-w-4xl grid-cols-2 gap-8 md:grid-cols-4 md:gap-6"
        >
          {indicadores.map(({ icon: Icon, label }) => (
            <li key={label.join(" ")} className="flex flex-col items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-primary-foreground/30 bg-primary-foreground/10 backdrop-blur-sm">
                <Icon className="h-5 w-5 text-primary-foreground" />
              </span>
              <span className="text-sm leading-tight text-primary-foreground/90">
                {label[0]}
                <br />
                {label[1]}
              </span>
            </li>
          ))}

          {/* Como se inscrever: abre o vídeo */}
          <li className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => setVideoAberto(true)}
              className="group flex flex-col items-center gap-3 rounded-xl p-1 outline-none focus-visible:ring-2 focus-visible:ring-primary-glow"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground shadow-glow transition-transform duration-300 group-hover:scale-110">
                <Play className="ml-0.5 h-5 w-5 fill-current" />
              </span>
              <span className="text-sm leading-tight text-primary-foreground/90 group-hover:text-primary-foreground">
                Como se inscrever
                <br />
                <span className="text-primary-glow">Veja o vídeo</span>
              </span>
            </button>
          </li>
        </motion.ul>
      </div>

      {/* Modal com o vídeo */}
      <Dialog open={videoAberto} onOpenChange={setVideoAberto}>
        <DialogContent className="max-w-3xl border-0 bg-black p-3 sm:p-4">
          <DialogTitle className="sr-only">Como se inscrever</DialogTitle>
          {videoAberto && (
            <VideoPlayer
              src="/videos/como-inscrever.mp4"
              poster="/images/como-inscrever-poster.jpg"
              autoPlay
              title="Como se inscrever na Unitec"
            />
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}