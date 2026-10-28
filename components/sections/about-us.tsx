const METRICS = [
    { value: "+5.000", label: "Alunos formados" },
    { value: "87%", label: "Taxa de empregabilidade" },
    { value: "+20", label: "Cursos disponíveis" },
];

export function AboutUs() {
    return (
        <section className="relative overflow-hidden bg-gradient-primary py-16">
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
                        A Unitec em números
                    </h2>
                </div>

                <dl
                    data-reveal-group
                    className="mt-10 grid grid-cols-1 gap-8 text-center sm:grid-cols-3 sm:gap-6"
                >
                    {METRICS.map(({ value, label }) => (
                        <div key={label}>
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