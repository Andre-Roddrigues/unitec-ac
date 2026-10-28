import { ArrowRight, Award, BadgeCheck, GraduationCap, TrendingUp } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import Image from "next/image";

export function HowToSubscribe() {
    const BENEFITS = [
        {
            icon: GraduationCap,
            title: "Processo de admissão",
            description:
                "Um processo simples e rápido: escolha o curso, faça a inscrição e comece a sua formação sem burocracia.",
        },
        {
            icon: BadgeCheck,
            title: "Certificado Profissional",
            description:
                "No final da formação recebe um certificado reconhecido que valoriza o seu percurso profissional.",
        },
        {
            icon: TrendingUp,
            title: "Desenvolvimento Profissional",
            description:
                "Competências práticas e actualizadas que o preparam para os desafios reais do mercado de trabalho.",
        },
        {
            icon: Award,
            title: "Professores Qualificados",
            description:
                "Formadores com experiência de terreno, dedicados a acompanhar cada estudante ao longo do curso.",
        },
    ];
    return (
        <div className="container-page space-y-24 py-20">
            {/* Como se inscrever + Porquê */}
            <section className="grid gap-12 lg:grid-cols-2 ">
                <div>
                    <h2 data-split className="text-2xl font-bold tracking-tight sm:text-3xl">
                        Como se <span className="text-primary">inscrever?</span>
                    </h2>
                    <div data-scale-in className="group relative mt-6 overflow-hidden rounded-lg border border-border shadow-card">
                        <Image
                            src="/images/video-thumbnail.png"
                            alt="Vídeo explicativo sobre como se inscrever na Unitec"
                            loading="lazy"
                            width={960}
                            height={540}
                            className="aspect-video w-full object-cover"
                        />
                        {/* Havia aqui um botão de play sem `onClick` e sem
                            vídeo nenhum por trás. Repor quando existir o
                            vídeo explicativo. */}
                    </div>
                </div>

                <div className="flex flex-col justify-between h-full ">
                    <h2 data-split className="text-2xl font-bold tracking-tight sm:text-3xl ">
                        Porquê se inscrever na <span className="text-gradient">Unitec</span>
                    </h2>
                    <p data-reveal className="mt-5 text-sm leading-relaxed text-muted-foreground">
                        Os Alunos da Unitec, por meio de sua formação profissional, conquistam melhores
                        oportunidades de emprego, ampliam suas perspectivas de desenvolvimento de carreira e
                        aumentam significativamente seu valor no mercado.

                    </p>
                    <p data-reveal className="mt-4 text-sm leading-relaxed text-muted-foreground">
                        A formação oferecida pela Unitec não
                        apenas prepara os alunos com competências técnicas e teóricas de alta qualidade, mas também
                        os capacita a responder de forma eficaz às exigências e desafios constantes do mercado de
                        trabalho, tornando-os profissionais altamente competitivos e requisitados em diversas áreas
                        de actuação.


                    </p>
                    <p data-reveal className="mt-4 text-sm leading-relaxed text-muted-foreground">
                        Contamos com formadores qualificados, materiais actualizados e um acompanhamento
                        próximo em cada etapa do percurso. Presencial ou online, o objectivo é o mesmo:
                        transformar conhecimento em oportunidades reais.
                    </p>
                    {/* Dizia "Falar connosco" e ia para o catálogo — não há
                        página de contacto. O rótulo passa a dizer o que o
                        botão faz mesmo. */}
                    <Button data-reveal className="mt-8 w-fit " size="lg">
                        <Link href="/cursos" className="flex items-center gap-2">
                            Ver cursos <ArrowRight className="size-5" />
                        </Link>
                    </Button>
                </div>
            </section>

            {/* Benefícios */}
            <section data-reveal-group className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {BENEFITS.map((item) => (
                    <div
                        key={item.title}
                        className="group rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-card"
                    >
                        <span className="grid size-11 place-items-center rounded-xl bg-primary-soft text-primary transition-colors group-hover:bg-gradient-primary group-hover:text-primary-foreground">
                            <item.icon className="size-5" />
                        </span>
                        <h3 className="mt-4 text-base font-semibold">{item.title}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                            {item.description}
                        </p>
                    </div>
                ))}
            </section>
        </div>
    )
}