import { GraduationCap, BookOpen } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";

export function HeroCourses({ totalCourses }: { totalCourses?: number }) {
    return (
        <header className="relative overflow-hidden">
            {/* Background image with overlay */}
            <div
                className="absolute inset-0 bg-[url('/images/hero-courses.webp')] bg-cover bg-center bg-no-repeat md:bg-fixed"
                aria-hidden="true"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[oklch(0.15_0.04_265/0.92)] via-[oklch(0.18_0.03_265/0.82)] to-[oklch(0.20_0.02_265/0.65)]" />

            {/* Decorative subtle grid pattern */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage:
                        "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                }}
                aria-hidden="true"
            />

            <div className="container-page relative flex flex-col justify-center py-16 md:py-24 lg:py-32">
                <div className="max-w-2xl space-y-5">
                    {/* Tag */}
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-white/90 backdrop-blur-sm">
                        <GraduationCap className="size-3.5" />
                        Catálogo de Cursos
                    </span>

                    <h1 className="text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl 2xl:text-5xl">
                        Desenvolva o seu{" "}
                        <span className="bg-gradient-to-r from-[oklch(0.82_0.17_85)] to-[oklch(0.75_0.15_55)] bg-clip-text text-transparent">
                            potencial
                        </span>{" "}
                        profissional
                    </h1>

                    <p className="max-w-lg text-sm leading-relaxed text-white/75 md:text-base">
                        Aprenda com especialistas e transforme a sua carreira com
                        cursos práticos e reconhecidos no mercado moçambicano.
                    </p>

                    {/* "Fale Connosco" apontava para /contacto, que não existe.
                        Repor quando houver página de contacto — não há dados de
                        contacto reais em lado nenhum do projecto. */}
                    <div className="flex flex-wrap gap-3 pt-2">
                        <Button size="lg" className="font-semibold shadow-lg">
                            <Link href="#cursos">Explorar Cursos</Link>
                        </Button>
                    </div>
                </div>

                {/* Só se mostra o que é verdade. Aqui estavam "1.200+
                    certificados emitidos" e "98% de taxa de conclusão" —
                    números inventados, sem nada por trás. O total de cursos
                    vem agora do catálogo real. */}
                {totalCourses !== undefined && totalCourses > 0 && (
                    <div className="mt-12 flex flex-wrap gap-6 border-t border-white/10 pt-6 md:gap-10">
                        <div className="flex items-center gap-3">
                            <div className="grid size-10 place-items-center rounded-lg bg-white/10 backdrop-blur-sm">
                                <BookOpen className="size-5 text-white/80" />
                            </div>
                            <div>
                                <p className="text-lg font-bold text-white">{totalCourses}</p>
                                <p className="text-[11px] text-white/55">
                                    {totalCourses === 1 ? "Curso disponível" : "Cursos disponíveis"}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
