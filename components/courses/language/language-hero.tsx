import Image from "next/image";
import Link from "next/link";
import { Globe2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LanguageHero({ totalCourses }: { totalCourses?: number }) {
    return (
        <header className="relative overflow-hidden bg-darkBlue text-white">
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-[url('/images/hero-courses.webp')] bg-cover bg-center bg-no-repeat md:bg-fixed opacity-40"
                aria-hidden="true"
            />
            {/* Gradiente escuro para garantir leitura */}
            <div className="absolute inset-0 bg-gradient-to-r from-darkBlue via-darkBlue/90 to-transparent" />

            <div className="container-page relative flex flex-col justify-center py-20 md:py-28 lg:py-32">
                <div className="max-w-2xl space-y-6">
                    {/* Tag do Language Center */}
                    {/* <div className="inline-flex items-center gap-3">
                        <div className="rounded-lg bg-white p-1.5 shadow-lg">
                            <Image 
                                src="/images/unitec_languagehd.png" 
                                alt="Unitec Language" 
                                width={120} 
                                height={40} 
                                className="h-6 w-auto object-contain"
                            />
                        </div>
                    </div> */}

                    <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                        Novos idiomas. <br className="hidden sm:block" />
                        <span className="text-primary-glow">Novas oportunidades.</span>
                    </h1>

                    <p className="max-w-lg text-sm leading-relaxed text-white/80 md:text-base">
                        Aprenda inglês, francês, mandarim e outros idiomas com opções de formação 
                        adaptadas aos seus objectivos, à sua disponibilidade e à modalidade que prefere.
                    </p>

                    <div className="flex flex-wrap gap-3 pt-2">
                        <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-semibold shadow-glow">
                            <Link href="#cursos">Explorar Cursos de Línguas</Link>
                        </Button>
                    </div>
                </div>

                {totalCourses !== undefined && totalCourses > 0 && (
                    <div className="mt-12 flex flex-wrap gap-6 border-t border-white/10 pt-6 md:gap-10">
                        <div className="flex items-center gap-3">
                            <div className="grid size-10 place-items-center rounded-lg bg-white/10 backdrop-blur-sm">
                                <Globe2 className="size-5 text-primary-glow" />
                            </div>
                            <div>
                                <p className="text-lg font-bold text-white">{totalCourses}</p>
                                <p className="text-[11px] text-white/60">
                                    {totalCourses === 1 ? "Idioma disponível" : "Idiomas disponíveis"}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}