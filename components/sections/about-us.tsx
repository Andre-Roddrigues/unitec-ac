import React from 'react'
import { Button } from '../ui/button'
import Link from 'next/link'

export function AboutUs() {
    return (
        <section className="relative overflow-hidden bg-gradient-primary py-20 text-center">
            <div
                aria-hidden="true"
                data-speed="0.8"
                className="pointer-events-none absolute -top-1/2 left-1/2 h-[200%] w-[70%] -translate-x-1/2 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.14),transparent_60%)]"
            />
            <div className="relative container-page">
                <h2 data-split className="text-3xl font-extrabold tracking-tight text-primary-foreground sm:text-4xl">
                    Quem Somos
                </h2>
                <p data-reveal className="mx-auto mt-5 max-w-3xl text-sm leading-relaxed text-primary-foreground/85">
                    A Unitec Academy é uma instituição de formação profissional dedicada ao desenvolvimento
                    de competências técnicas e comportamentais. Trabalhamos com estudantes, profissionais e
                    empresas, oferecendo cursos certificados em áreas como administração, informática,
                    saúde, línguas e gestão, com uma metodologia prática e orientada para resultados.
                </p>
                {/* <Button size="lg" variant="secondary" className="mt-8 h-12 px-7">
                    <Link href="/cursos">Saber mais</Link>
                </Button> */}
            </div>
        </section>
    )
}
