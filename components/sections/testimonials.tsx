"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { MessageSquareQuote, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { TESTIMONIALS_DATA } from "@/lib/testimonial";

export function Testimonials() {
    const trackRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    // Duplicamos os dados para criar o efeito infinito
    const infiniteData = [...TESTIMONIALS_DATA, ...TESTIMONIALS_DATA, ...TESTIMONIALS_DATA];

    // Calcula qual depoimento deve ficar destacado, com base na posição do scroll
    const atualizarAtivo = useCallback(() => {
        const el = trackRef.current;
        if (!el) return;

        const card = el.firstElementChild as HTMLElement | null;
        if (!card) return;

        const passo = card.offsetWidth + 16;
        // Em desktop mostram-se vários cards, por isso destacamos o segundo visível.
        // Em mobile só se vê um card, por isso destacamos o primeiro.
        const emDesktop = window.matchMedia("(min-width: 1024px)").matches;
        const posicao = Math.round(el.scrollLeft / passo) + (emDesktop ? 1 : 0);

        setActiveIndex(posicao % TESTIMONIALS_DATA.length);
    }, []);

    // Atualiza no arranque e sempre que a janela muda de tamanho
    useEffect(() => {
        atualizarAtivo();
        window.addEventListener("resize", atualizarAtivo);
        return () => window.removeEventListener("resize", atualizarAtivo);
    }, [atualizarAtivo]);

    // Função para avançar um card
    const avancar = useCallback(() => {
        const el = trackRef.current;
        if (!el) return;

        const card = el.firstElementChild as HTMLElement | null;
        const passo = card ? card.offsetWidth + 16 : el.clientWidth / 4;

        // Se estivermos perto do fim da lista duplicada, voltamos ao início original
        const maxScroll = el.scrollWidth - el.clientWidth;
        if (el.scrollLeft >= maxScroll - 10) {
            el.scrollTo({ left: TESTIMONIALS_DATA.length * passo, behavior: "instant" });
            setTimeout(() => {
                el.scrollBy({ left: passo, behavior: "smooth" });
            }, 10);
        } else {
            el.scrollBy({ left: passo, behavior: "smooth" });
        }
    }, []);

    // Função para retroceder
    const retroceder = () => {
        const el = trackRef.current;
        if (!el) return;

        const card = el.firstElementChild as HTMLElement | null;
        const passo = card ? card.offsetWidth + 16 : el.clientWidth / 4;

        el.scrollBy({ left: -passo, behavior: "smooth" });
    };

    // Autoplay (pausa ao passar o rato)
    useEffect(() => {
        if (isHovered) return;

        const interval = setInterval(() => {
            avancar();
        }, 4000);

        return () => clearInterval(interval);
    }, [isHovered, avancar]);

    return (
        <section className="bg-muted/40 py-20 overflow-hidden">
            <div className="container-page space-y-10 w-full">

                {/* Cabeçalho + Vídeo */}
                <div className="grid items-center gap-10 lg:grid-cols-2">
                    <div>
                        <span data-pop className="grid size-12 place-items-center rounded-2xl bg-primary-soft text-primary">
                            <MessageSquareQuote className="size-10" />
                        </span>
                        <h2 data-split className="mt-5 text-3xl font-extrabold tracking-tight sm:text-5xl">
                            O que os nossos <span className="text-gradient">alunos dizem</span>
                        </h2>
                        <p data-split className="py-2 text-sm text-midnight">
                            Conheça a experiência de quem escolheu a Unitec Academy para desenvolver novas competências.
                        </p>

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
                            src="/images/be-a-teacher.jpeg"
                            alt="Depoimento em vídeo"
                            loading="lazy"
                            className="aspect-video w-full object-cover"
                        />
                    </div>
                </div>

                {/* CARROSSEL ÚNICO (Responsivo) */}
                <div
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    className="w-full relative"
                >
                    <div
                        ref={trackRef}
                        onScroll={atualizarAtivo}
                        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-4 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [scroll-padding-inline:1rem]"
                    >
                        {infiniteData.map((t, i) => {
                            // O index real, ignorando as duplicações
                            const realIndex = i % TESTIMONIALS_DATA.length;
                            // Apenas o "activeIndex" fica com o destaque azul
                            const isActive = realIndex === activeIndex;

                            return (
                                <figure
                                    key={`${t.name}-${i}`}
                                    className={`group flex w-full lg:w-[calc((100%-3rem)/4)] shrink-0 snap-start flex-col justify-between rounded-2xl p-6 text-left transition-colors duration-300 border ${
                                        isActive
                                            ? "bg-[#0A1550] text-white border-[#0A1550] shadow-lg"
                                            : "bg-white text-slate-800 border-border/60 hover:border-primary/30"
                                    }`}
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