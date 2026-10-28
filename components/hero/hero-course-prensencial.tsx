import { GraduationCap, MapPin, BookOpen } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HeroPresencial({ totalCourses }: { totalCourses?: number }) {
    return (
        <header className="relative overflow-hidden border-b border-border/50">
            {/* Fundo: imagem + overlay simples, sem parallax nem grelha */}
            <div
                className="absolute inset-0 bg-[url('/images/hero-courses.webp')] bg-cover bg-center bg-no-repeat"
                aria-hidden="true"
            />
            <div
                className="absolute inset-0 bg-gradient-to-b from-foreground/85 to-foreground/70"
                aria-hidden="true"
            />

            <div className="container-page relative py-14 md:py-20">
                <div className="max-w-xl space-y-4">

                    <h1 className="text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl">
                        Aprenda em sala, com acompanhamento directo
                    </h1>

                    <p className="text-sm leading-relaxed text-white/70 md:text-base">
                        Formação prática com formadores especializados, em turmas
                        reduzidas e horários compatíveis com o seu dia a dia.
                    </p>
                </div>

                {totalCourses !== undefined && totalCourses > 0 && (
                    <div className="mt-10 flex items-center gap-3 border-t border-white/10 pt-5">
                        <div className="grid size-9 place-items-center rounded-md bg-white/10">
                            <BookOpen className="size-4 text-white/75" />
                        </div>
                        <div>
                            <p className="text-base font-semibold text-white">
                                {totalCourses} {totalCourses === 1 ? "curso" : "cursos"}
                            </p>
                            <p className="text-[11px] text-white/55">
                                Disponíveis em regime presencial
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}