import { TESTIMONIALS } from '@/lib/testimonial'
import { MessageSquareQuote, Quote } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

export function Testimonials() {
    return (
        <section className="bg-muted/40 py-20">
            <div className="container-page space-y-10">
                <div className="grid items-center gap-10 lg:grid-cols-2">
                    <div>
                        <span data-pop className="grid size-12 place-items-center rounded-2xl bg-primary-soft text-primary">
                            <MessageSquareQuote className="size-10" />
                        </span>
                        <h2 data-split className="mt-5 text-3xl font-extrabold tracking-tight sm:text-5xl">
                            O que os nossos <span className="text-gradient">alunos dizem</span>
                        </h2>
                    </div>
                    <div data-scale-in className="group relative overflow-hidden rounded-2xl border border-border shadow-card">
                        <Image
                            width={960}
                            height={540}
                            src="/images/be-a-teacher.png"
                            alt="Depoimento em vídeo de um aluno da Unitec"
                            loading="lazy"
                            className="aspect-video w-full object-cover"
                        />
                        {/* Botão de play sem `onClick` e sem depoimento em
                            vídeo nenhum — repor quando existir o vídeo. */}
                    </div>
                </div>

                <div data-reveal-group className="grid gap-5 lg:grid-cols-3">
                    {TESTIMONIALS.map((t) => (
                        <figure key={t.name} className="flex flex-col gap-4 surface-card p-6">
                            <Quote className="size-6 text-primary/40" />
                            <blockquote className="flex-1 text-sm leading-relaxed">“{t.quote}”</blockquote>
                            <figcaption className="flex items-center gap-3 border-t border-border pt-4">
                                <img
                                    src={`https://picsum.photos/seed/${t.seed}/80/80`}
                                    alt={t.name}
                                    loading="lazy"
                                    className="size-10 rounded-full object-cover"
                                />
                                <span className="text-sm font-semibold text-primary">{t.name}</span>
                            </figcaption>
                        </figure>
                    ))}
                </div>
            </div>
        </section>
    )
}
