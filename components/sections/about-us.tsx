import { Award, Briefcase, BookOpen, MonitorPlay } from "lucide-react";

const METRICS = [
    { value: "+5.000", label: "Alunos formados", icon: Award },
    { value: "87%", label: "Taxa de empregabilidade", icon: Briefcase },
    { value: "+20", label: "Cursos Presenciais", icon: BookOpen },
    { value: "+30", label: "Cursos Online", icon: MonitorPlay },
];

export function AboutUs() {
    return (
        <section className="relative overflow-hidden bg-primary py-16">
            <div
                aria-hidden="true"
                data-speed="0.8"
                className="pointer-events-none absolute -top-1/2 left-1/2 h-[200%] w-[70%] -translate-x-1/2 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.10),transparent_60%)]"
            />

            <div className="relative container-page">
                <div className="mx-auto max-w-xl text-center">
                    <h2
                        data-split
                        className="text-2xl font-bold tracking-tight text-primary-foreground sm:text-3xl"
                    >
                        A Unitec Academy em números
                    </h2>
                </div>

                <dl
                    data-reveal-group
                    className="mt-10 grid grid-cols-2 gap-8 text-center sm:gap-6 lg:grid-cols-4"
                >
                    {METRICS.map(({ value, label, icon: Icon }) => (
                        <div key={label} className="flex flex-col items-center">
                            <span className="mb-3 grid size-12 place-items-center rounded-full bg-primary-foreground/10 text-primary-foreground ring-1 ring-primary-foreground/20">
                                <Icon className="size-6" strokeWidth={1.75} />
                            </span>
                            <dd className="text-3xl font-extrabold tracking-tight text-primary-foreground sm:text-4xl">
                                {value}
                            </dd>
                            <dt className="mt-1 text-xs uppercase tracking-wider text-primary-foreground/70">
                                {label}
                            </dt>
                        </div>
                    ))}
                </dl>
            </div>
        </section>
    );
}