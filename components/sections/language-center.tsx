import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";

export function LanguageCenter() {
    return (
        <section id="language-center" className="scroll-mt-16">
            <div className="relative aspect-[16/6] w-full  overflow-hidden  sm:aspect-[21/6] lg:aspect-[30/10] 2xl:aspect-[30/6]">
                {/* 160% da altura da secção (30% a mais em cima e em baixo):
                    é essa folga que o parallax (`data-parallax`, ±18% da
                    própria altura ≈ ±29% da secção) percorre sem nunca deixar
                    faixas vazias. */}
                <div data-parallax="18" className="absolute inset-x-0 -top-[30%] h-[160%] will-change-transform">
                    <Image
                        src="/images/language-center-flags.png"
                        alt="Bandeiras do Reino Unido, França, China, Portugal e Moçambique"
                        fill
                        priority
                        className="object-cover object-top-right"
                        sizes="100vw"
                    />
                </div>

                <div className="relative z-10 flex h-full items-center container-page">
                    <div data-reveal="left" className="max-w-md">
                        <span className="flex w-fit items-center gap-2 rounded-full bg-purple-700 px-3 py-1 text-xs font-semibold text-white">
                            <Languages size={14} /> Language center
                        </span>
                        <h2 className="mt-4 text-2xl font-extrabold text-white sm:text-3xl">
                            Unitec Language Center
                        </h2>
                        <p className="mt-1.5 text-base font- text-white/95 sm:text-lg lg:text-xl">
                            Inglês, Francês, Mandarim e Português
                        </p>
                        <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/70 sm:text-base">
                            Torne-se fluente de forma prática e rápida através do nosso
                            método definitivo e inovador
                        </p>
                        {/* O botão não tinha `onClick` nem link nenhum. */}
                        <Button className="mt-6  bg-purple-800 px-6 py-5 font-bold text-white hover:bg-purple-900 cursor-pointer    ">
                            <Link href="/cursos">Ver cursos</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}