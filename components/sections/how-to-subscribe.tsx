import { Award, BadgeCheck, GraduationCap, TrendingUp } from "lucide-react";

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

export function WhySubscribe() {
    return (
        <section className="bg-primary ">
            <div className="container-page space-y-10 py-20">
                {/* Cabeçalho + texto */}
                <div className="mx-auto max-w-3xl text-center">
                    <h2
                        data-split
                        className="text-2xl font-extrabold tracking-tight text-white lg:text-3xl"
                    >
                        Porquê se inscrever na{" "}
                        <span className="text-primary-glow">Unitec</span>
                    </h2>
                    <p
                        data-reveal
                        className="mt-5 text-sm leading-relaxed text-white/85"
                    >
                        Na Unitec, a formação profissional abre melhores oportunidades de emprego e
                        aumenta o valor de cada aluno no mercado. Com formadores qualificados,
                        materiais actualizados e acompanhamento próximo, preparamos profissionais
                        competitivos, presencial ou online, o objectivo é transformar conhecimento
                        em oportunidades reais.
                    </p>
                </div>

                {/* Benefícios */}
                <div
                    data-reveal-group
                    className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
                >
                    {BENEFITS.map(({ icon: Icon, title, description }) => (
                        <div
                            key={title}
                            className="group rounded-xl border border-white/15 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/30 hover:bg-white/10"
                        >
                            <span className="grid size-11 place-items-center rounded-xl bg-white/15 text-white transition-colors group-hover:bg-white group-hover:text-primary">
                                <Icon className="size-5" aria-hidden="true" />
                            </span>
                            <h3 className="mt-4 text-base font-semibold text-white">{title}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-white/75">
                                {description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}