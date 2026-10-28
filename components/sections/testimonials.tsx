"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { MessageSquareQuote, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { TESTIMONIALS_DATA } from "@/lib/testimonial";

export function Testimonials() {
    const trackRef = useRef<HTMLDivElement>(null);
    const [podeVoltar, setPodeVoltar] = useState(false);
    const [podeAvancar, setPodeAvancar] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    // Duplicamos os dados para criar o efeito infinito
    const infiniteData = [...TESTIMONIALS_DATA, ...TESTIMONIALS_DATA, ...TESTIMONIALS_DATA];

    const atualizarEstado = useCallback(() => {
        const el = trackRef.current;
        if (!el) return;
        const max = el.scrollWidth - el.clientWidth;
        setPodeVoltar(el.scrollLeft > 4);
        setPodeAvancar(el.scrollLeft < max - 4);
    }, []);

    useEffect(() => {
        atualizarEstado();
        window.addEventListener("resize", atualizarEstado);
        return () => window.removeEventListener("resize", atualizarEstado);
    }, [atualizarEstado]);

    // Função para avançar um card
    const avancar = useCallback(() => {
        const el = trackRef.current;
        if (!el) return;
        
        const card = el.firstElementChild as HTMLElement | null;
        const passo = card ? card.offsetWidth + 16 : el.clientWidth * 0.8;
        
        // Se estivermos perto do fim da lista duplicada, voltamos ao início original
        const maxScroll = el.scrollWidth - el.clientWidth;
        if (el.scrollLeft >= maxScroll - 10) {
            // Reseta para o início da segunda cópia (onde o loop é idêntico)
            el.scrollTo({ left: TESTIMONIALS_DATA.length * passo, behavior: "instant" });
            setTimeout(() => {
                el.scrollBy({ left: passo, behavior: "smooth" });
            }, 10);
        } else {
            el.scrollBy({ left: passo, behavior: "smooth" });
        }

        // Atualiza o visual do card ativo (apenas visual, o scroll real é independente)
        setActiveIndex((prev) => (prev + 1) % TESTIMONIALS_DATA.length);
    }, []);

    const retroceder = () => {
        const el = trackRef.current;
        if (!el) return;
        const card = el.firstElementChild as HTMLElement | null;
        const passo = card ? card.offsetWidth + 16 : el.clientWidth * 0.8;
        el.scrollBy({ left: -passo, behavior: "smooth" });
        setActiveIndex((prev) => (prev - 1 + TESTIMONIALS_DATA.length) % TESTIMONIALS_DATA.length);
    };

    // Auto-play
    useEffect(() => {
        if (isHovered) return; // Pausa ao passar o rato

        const interval = setInterval(() => {
            avancar();
        }, 4000); // Passa a cada 4 segundos

        return () => clearInterval(interval);
    }, [isHovered, avancar]);

    return (
        <section className="bg-muted/40 py-20">
            <div className="container-page space-y-10">
                
                {/* Cabeçalho + Vídeo */}
                <div className="grid items-center gap-10 lg:grid-cols-2">
                    <div>
                        <span data-pop className="grid size-12 place-items-center rounded-2xl bg-primary-soft text-primary">
                            <MessageSquareQuote className="size-10" />
                        </span>
                        <h2 data-split className="mt-5 text-3xl font-extrabold tracking-tight sm:text-5xl">
                            O que os nossos <span className="text-gradient">alunos dizem</span>
                        </h2>

                        {/* Setas */}
                        <div className="mt-6 flex items-center gap-2">
                            <button
                                type="button"
                                onClick={retroceder}
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                onClick={avancar}
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    <div data-scale-in className="group relative overflow-hidden rounded-2xl border border-border shadow-card">
                        <Image
                            width={960}
                            height={540}
                            src="/images/be-a-teacher.png"
                            alt="Depoimento em vídeo"
                            loading="lazy"
                            className="aspect-video w-full object-cover"
                        />
                    </div>
                </div>

                {/* Carrossel Infinito */}
                <div
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <div
                        ref={trackRef}
                        onScroll={atualizarEstado}
                        data-reveal-group
                        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    >
                        {infiniteData.map((t, i) => {
                            // O card em destaque visual (azul) segue o activeIndex
                            const isActive = (i % TESTIMONIALS_DATA.length) === activeIndex;

                            return (
                                <figure
                                    key={`${t.name}-${i}`}
                                    className={`group flex w-[300px] shrink-0 snap-start flex-col justify-between rounded-2xl p-6 text-left transition-colors duration-300 sm:w-[360px] ${
                                        isActive
                                            ? "bg-[#0A1550] text-white border-[#0A1550] shadow-lg scale-[1.02]"
                                            : "bg-white text-slate-800 border-border/60 hover:border-primary/30 scale-100"
                                    } border`}
                                >
                                    <div>
                                        <div className="flex items-center gap-4">
                                            <span className={`text-4xl font-serif leading-none ${isActive ? "text-blue-400" : "text-[#3b82f6]"}`}>
                                                “
                                            </span>
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <svg key={star} viewBox="0 0 24 24" fill="currentColor" className={`size-3.5 ${isActive ? "text-blue-400" : "text-[#3b82f6]"}`}>
                                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                                    </svg>
                                                ))}
                                            </div>
                                        </div>
                                        <blockquote className={`mt-4 text-sm leading-relaxed ${isActive ? "text-white/90" : "text-slate-600"}`}>
                                            {t.quote}
                                        </blockquote>
                                    </div>

                                    <figcaption className="mt-8 flex items-center gap-4">
                                        <img
                                            src={`https://picsum.photos/seed/${t.seed}/120/120`}
                                            alt={t.name}
                                            loading="lazy"
                                            className={`size-12 rounded-full object-cover border-2 ${isActive ? "border-[#0A1550]" : "border-white"}`}
                                        />
                                        <div>
                                            <p className={`text-sm font-bold ${isActive ? "text-white" : "text-slate-900"}`}>
                                                {t.name}
                                            </p>
                                            <p className={`text-[11px] ${isActive ? "text-white/70" : "text-slate-500"}`}>
                                                {t.course}
                                            </p>
                                        </div>
                                    </figcaption>
                                </figure>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}