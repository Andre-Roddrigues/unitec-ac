import Image from "next/image";

export function JoinOurTeam() {
    return (
        <div className="bg-muted/40">
            <section className="container-page grid items-center gap-10 overflow-hidden p-8 sm:p-12 lg:grid-cols-2">
                <div data-reveal="left">
                    <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                        Faça parte da nossa <span className="text-gradient">equipa</span>
                    </h2>
                    <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
                        Procuramos formadores e profissionais apaixonados por ensinar e por transformar vidas
                        através da formação. Candidate-se e cresça connosco.
                    </p>
                    {/* Havia aqui um "Cadastre um curso" que apontava para
                        `/courses` (rota inexistente) e que, mesmo corrigido,
                        levaria o candidato a formador para o catálogo. Não há
                        candidatura nenhuma para onde o mandar — repor quando
                        existir. */}
                </div>
                <div data-scale-in className="relative h-64 w-full max-w-lg overflow-hidden rounded-lg shadow-card lg:h-86">
                    <div data-speed="auto" className="absolute inset-x-0 -top-[10%] h-[120%]">
                        <Image
                            src="/images/be-a-teacher.png"
                            alt="Formadora da Unitec"
                            loading="lazy"
                            fill
                            className="object-cover object-bottom"
                        />
                    </div>
                </div>
            </section>
        </div>
    )
}


