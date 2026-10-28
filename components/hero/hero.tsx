"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { CircleUser, Users, ShieldCheck, Search } from "lucide-react";
import { VideoModal, PlayButton } from "./VideoModal";

const indicadores = [
  { icon: CircleUser, label: ["Cursos próprios", "e de parceiros"] },
  { icon: Users, label: ["Formadores", "especializados"] },
  { icon: ShieldCheck, label: ["Certificado", "reconhecido"] },
];

export function Hero() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const term = query.trim();
    router.push(term ? `/cursos?search=${encodeURIComponent(term)}` : "/cursos");
  };

  return (
    <section className="relative min-h-screen isolate overflow-hidden bg-primary text-primary-foreground">
      {/* Fundo */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/brand/Lizzy.webp"
          alt="Estudante sorridente com tablet"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[70%_center]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--primary)_0%,color-mix(in_oklab,var(--primary)_52%,transparent)_45%,color-mix(in_oklab,var(--primary)_60%,transparent)_100%)]" />
      </div>

      <div className="container-page grid min-h-screen items-center gap-10 py-24 md:py-28 lg:grid-cols-2">
        {/* ---------- Coluna esquerda: conteúdo ---------- */}
        <div className="flex flex-col justify-center">
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
            onSubmit={handleSearch}
            role="search"
            className="mt-8 flex w-full max-w-xl items-center gap-2 rounded-2xl bg-card p-2 shadow-elevated"
          >
            <Search className="ml-3 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="O que você quer aprender?"
              aria-label="Pesquisar cursos"
              className="h-11 min-w-0 flex-1 bg-transparent px-2 text-base text-card-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <button
              type="submit"
              className="h-11 shrink-0 rounded-xl bg-secondary px-6 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-secondary/90"
            >
              Pesquisar
            </button>
          </motion.form>

          {/* Indicadores + Como se inscrever */}
          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 grid grid-cols-2 gap-5 md:grid-cols-4 md:gap-4"
          >
            <li>
              <VideoModal
                titulo="Como se inscrever na Unitec Academy"
                src="/brand/como-inscrever.mp4"
                poster="/brand/como-inscrever-poster.webp"
              >
                <PlayButton label="Como se inscrever" />
              </VideoModal>
            </li>
            {indicadores.map(({ icon: Icon, label }) => (
              <li key={label.join(" ")} className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary-foreground/30 bg-primary-foreground/10 backdrop-blur-sm">
                  <Icon className="h-4 w-4 text-primary-foreground" aria-hidden="true" />
                </span>
                <span className="text-xs leading-tight text-primary-foreground/90">
                  {label[0]}
                  <br />
                  {label[1]}
                </span>
              </li>
            ))}

            {/* Como se inscrever — abre modal com vídeo */}
            
          </motion.ul>
        </div>

        {/* ---------- Coluna direita: vazia (deixa a imagem respirar) ---------- */}
        <div className="hidden lg:block" aria-hidden="true" />
      </div>
    </section>
  );
}