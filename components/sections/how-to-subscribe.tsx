import { Award, BadgeCheck, GraduationCap, TrendingUp } from "lucide-react";

const BENEFITS = [
    {
        icon: GraduationCap,
        title: "Aprenda com especialistas",
        description:
            "Desenvolva competências com formadores que partilham conhecimentos e experiência nas suas áreas.",
    },
    {
        icon: BadgeCheck,
        title: "Escolha como aprender",
        description:
            "Descubra cursos presenciais e online, de acordo com os seus objectivos e a disponibilidade de cada formação.",
    },
    {
        icon: TrendingUp,
        title: "Invista no seu desenvolvimento",
        description:
            "Adquira conhecimentos que pode aplicar no trabalho, nos estudos ou no seu próprio negócio.",
    },
    {
        icon: Award,
        title: "Encontre a sua próxima oportunidade",
        description:
            "Explore diferentes áreas de formação e descubra novos caminhos para o seu crescimento profissional.",
    },
];

export function WhySubscribe() {
    return (
        <section className="bg-darkBlue">
            <div className="container-page space-y-12 py-20">
                {/* Cabeçalho em duas colunas: título à esquerda, texto à direita */}
                <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-16">
                    <h2
                        data-split
                        className="text-3xl font-extrabold tracking-tight text-white lg:text-4xl"
                    >
                        Mais conhecimento. Mais competências.{" "}
                        <span className="text-primary-glow">Mais oportunidades.</span>
                    </h2>
                    <p
                        data-reveal
                        className="text-sm leading-relaxed text-white/85 lg:border-l lg:border-white/15 lg:pl-8"
                    >
                        Na Unitec Academy, encontra formação para desenvolver competências,
                        explorar novas áreas e preparar-se para os próximos passos da sua vida
                        profissional.
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