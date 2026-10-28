"use client";

import { createContext, useContext, useLayoutEffect, useRef } from "react";
import type { RefObject } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { registerGsapPlugins } from "@/lib/gsap/register";

/** Atributo posto por `HomeMotionScope` — ver o comentário de `HomeMotion`. */
const SCOPE_ATTR = "data-motion-scope";

type ScopeRegistry = {
  /** Blocos `HomeMotionScope` já hidratados. */
  mounted: Set<HTMLElement>;
  /** Liga as animações de um bloco que hidratou depois do arranque. */
  attach: ((root: HTMLElement) => void) | null;
};

const ScopeRegistryContext = createContext<RefObject<ScopeRegistry> | null>(null);

/** Marca conteúdo que chega depois do arranque (ex.: secções em streaming). */
export function HomeMotionScope({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const registryRef = useContext(ScopeRegistryContext);

  useLayoutEffect(() => {
    const root = ref.current;
    const registry = registryRef?.current;
    if (!root || !registry) return;
    registry.mounted.add(root);
    registry.attach?.(root);
    return () => {
      registry.mounted.delete(root);
    };
  }, [registryRef]);

  return (
    <div ref={ref} data-motion-scope="">
      {children}
    </div>
  );
}

/**
 * Scroll suave + animações de scroll da página inicial.
 *
 * As secções (`components/sections/*`) continuam server components — só
 * marcam o que anima com atributos `data-*`, e é aqui que esses atributos
 * ganham comportamento:
 *
 * - `data-reveal` (`="left"` / `="right"`): entra com fade + deslocamento.
 * - `data-reveal-group`: os filhos directos entram em cascata.
 * - `data-split`: título entra palavra a palavra, por baixo de uma máscara.
 * - `data-scale-in`: moldura de imagem abre do centro; a imagem de dentro
 *   desfaz um zoom ligeiro.
 * - `data-pop`: ícones/badges entram com um pequeno salto.
 * - `data-speed` / `data-lag`: parallax nativo do ScrollSmoother (`effects`).
 * - `data-parallax="18"`: parallax explícito com `scrub`, ±N% da altura do
 *   próprio elemento — mais pronunciado que o `data-speed`.
 *
 * Nada é escondido por CSS: os estados iniciais são postos pelo `gsap.from`
 * dentro do `useGSAP` (antes do paint), por isso sem JS — ou com
 * `prefers-reduced-motion` — a página fica simplesmente estática e visível.
 *
 * Conteúdo que chega depois (secções em streaming dentro de `<Suspense>`) vai
 * embrulhado em `<HomeMotionScope>`: os seus elementos só ganham animação
 * quando esse bloco hidrata — nunca antes, para o GSAP não mexer em HTML que
 * o React ainda vai hidratar.
 */
export function HomeMotion({ children }: { children: React.ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const registryRef = useRef<ScopeRegistry>({ mounted: new Set(), attach: null });

  useGSAP(
    () => {
      registerGsapPlugins();
      const wrapper = wrapperRef.current;
      const content = contentRef.current;
      if (!wrapper || !content) return;

      const mm = gsap.matchMedia();

      const registry = registryRef.current;

      mm.add("(prefers-reduced-motion: no-preference)", (context) => {
        gsap.set(spacerRef.current, { height: "4rem" });
        ScrollSmoother.create({
          wrapper,
          content,
          smooth: 1.1,
          effects: true,
          smoothTouch: false,
        });

        const onEnter = { start: "top 85%", toggleActions: "play none none none" } as const;
        // Cada elemento é animado uma só vez por tipo de efeito, mesmo que o
        // seu bloco seja percorrido outra vez quando hidrata.
        const done = new Map<string, WeakSet<Element>>();

        const animateWithin = (root: HTMLElement) => {
          const q = <T extends HTMLElement>(selector: string): T[] => {
            let seen = done.get(selector);
            if (!seen) done.set(selector, (seen = new WeakSet()));
            return Array.from(root.querySelectorAll<T>(selector)).filter((el) => {
              if (seen.has(el)) return false;
              // Dentro de um bloco ainda por hidratar: fica para quando hidratar.
              const scope = el.closest<HTMLElement>(`[${SCOPE_ATTR}]`);
              if (scope && !registry.mounted.has(scope)) return false;
              seen.add(el);
              return true;
            });
          };

          q<HTMLElement>("[data-reveal]").forEach((el) => {
            const dir = el.dataset.reveal;
            gsap.from(el, {
              autoAlpha: 0,
              x: dir === "left" ? -40 : dir === "right" ? 40 : 0,
              y: dir === "left" || dir === "right" ? 0 : 40,
              duration: 0.9,
              ease: "power3.out",
              scrollTrigger: { trigger: el, ...onEnter },
            });
          });

          q<HTMLElement>("[data-reveal-group]").forEach((group) => {
            const items = Array.from(group.children) as HTMLElement[];
            if (items.length === 0) return;
            gsap.set(items, { autoAlpha: 0, y: 30 });
            ScrollTrigger.batch(items, {
              start: "top 88%",
              once: true,
              onEnter: (batch) =>
                gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.1, ease: "power3.out", overwrite: true }),
            });
          });

          q<HTMLElement>("[data-split]").forEach((el) => {
            SplitText.create(el, {
              type: "words",
              mask: "words",
              autoSplit: true,
              onSplit: (self) =>
                gsap.from(self.words, {
                  yPercent: 100,
                  duration: 0.8,
                  stagger: 0.04,
                  ease: "power4.out",
                  scrollTrigger: { trigger: el, ...onEnter },
                }),
            });
          });

          q<HTMLElement>("[data-scale-in]").forEach((frame) => {
            const inner = frame.querySelector<HTMLElement>("img, [data-scale-target]");
            const tl = gsap.timeline({ scrollTrigger: { trigger: frame, ...onEnter } });
            tl.from(frame, {
              clipPath: "inset(12% 12% 12% 12% round 12px)",
              duration: 1.1,
              ease: "power3.inOut",
              clearProps: "clipPath",
            });
            if (inner) tl.from(inner, { scale: 1.15, duration: 1.4, ease: "power3.out" }, 0);
          });

          // Parallax explícito, ligado ao scroll (`scrub`) — para imagens de
          // fundo em secções baixas, onde o `data-speed="auto"` do smoother mal
          // se nota. O valor é o deslocamento máximo em % da altura do próprio
          // elemento; quem o usa tem de ser mais alto que o pai (`overflow-hidden`).
          q<HTMLElement>("[data-parallax]").forEach((el) => {
            const amount = Number(el.dataset.parallax) || 15;
            gsap.fromTo(
              el,
              { yPercent: -amount },
              {
                yPercent: amount,
                ease: "none",
                scrollTrigger: {
                  trigger: el.parentElement ?? el,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: true,
                },
              },
            );
          });

          q<HTMLElement>("[data-pop]").forEach((el) => {
            gsap.from(el, {
              scale: 0.6,
              autoAlpha: 0,
              duration: 0.6,
              ease: "back.out(1.7)",
              scrollTrigger: { trigger: el, ...onEnter },
            });
          });
        };

        animateWithin(content);
        registry.attach = (root) => {
          context.add(() => animateWithin(root));
          ScrollTrigger.refresh();
        };

        // O Hero cria os seus ScrollTriggers antes deste efeito (os efeitos
        // dos filhos correm primeiro) — recalcular com o smoother já activo.
        ScrollTrigger.refresh();

        return () => {
          registry.attach = null;
        };
      });

      // Imagens lazy mudam alturas depois do primeiro cálculo — sem isto os
      // triggers mais abaixo disparavam no sítio errado.
      const refresh = () => ScrollTrigger.refresh();
      if (document.readyState === "complete") {
        requestAnimationFrame(refresh);
      } else {
        window.addEventListener("load", refresh, { once: true });
      }

      return () => {
        window.removeEventListener("load", refresh);
        mm.revert();
      };
    },
    { scope: wrapperRef },
  );

  return (
    <ScopeRegistryContext.Provider value={registryRef}>
      <div id="smooth-wrapper" ref={wrapperRef}>
        <div id="smooth-content" ref={contentRef}>
          {/* Com o smoother activo o wrapper é `position: fixed` a partir do
              topo — este espaço passa a 4rem (ver `useGSAP`) para ocupar o
              lugar da navbar, que fica fora dele. Sem smoother fica a 0. A cor
              é a da navbar, para não se ver uma faixa durante o atraso do
              scroll suave. */}
          <div ref={spacerRef} aria-hidden="true" className="h-0 bg-[#0A1550]" />
          {children}
        </div>
      </div>
    </ScopeRegistryContext.Provider>
  );
}
