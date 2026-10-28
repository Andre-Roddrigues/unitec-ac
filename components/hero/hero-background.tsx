import Image from "next/image";
import { HERO_PHOTO, HERO_WATERMARK } from "@/lib/hero-assets";

/**
 * Fundo da hero: foto, véu azul que escurece da esquerda para a direita (é ele
 * que garante a leitura do título) e a marca "un" em contorno, grande, atrás
 * do texto.
 *
 * Em desktop a foto é desenhada pela altura (`bg-size-[auto_100%]`), mais
 * pequena do que o `cover`, e encostada à direita — a faixa que sobra à
 * esquerda é tapada por `PHOTO_EDGE`, um gradiente com as cores da própria
 * margem da foto, por baixo do lado opaco do véu.
 *
 * A folga vertical entre a foto e a secção é pequena (a foto está o mais
 * afastada possível sem deixar de a cobrir), por isso o parallax da foto é
 * curto e é o título que faz o grosso do movimento. Em mobile a foto é
 * cortada pela altura e não sobra folga nenhuma: aí não leva parallax.
 */
/** Cores amostradas da margem esquerda da própria foto, faixa a faixa. */
const PHOTO_EDGE =
  "linear-gradient(180deg," +
  "#16248F 0%," +
  "#13228E 12%," +
  "#11208E 25%," +
  "#2834A3 38%," +
  "#1F2391 50%," +
  "#3E43AF 62%," +
  "#4C50B8 75%," +
  "#4A4CB3 88%," +
  "#494AB2 100%)";

const VEIL_DESKTOP =
  "linear-gradient(90deg," +
  "rgba(74,92,208,0.68) 0%," +
  "rgba(58,72,186,0.64) 14%," +
  "rgba(30,42,135,0.57) 27%," +
  "rgba(10,21,80,0.45) 38%," +
  "rgba(10,21,80,0.24) 46%," +
  "rgba(10,21,80,0.07) 53%," +
  "rgba(10,21,80,0) 61%)";

const VEIL_MOBILE =
  "linear-gradient(170deg," +
  "rgba(74,92,208,0.34) 0%," +
  "rgba(34,48,150,0.33) 30%," +
  "rgba(14,26,96,0.62) 52%," +
  "rgba(10,21,80,0.78) 75%," +
  "rgba(10,21,80,0.84) 100%)";

export function HeroBackground() {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden bg-[#0A1550]">
      <div
        data-hero-photo
        className="absolute inset-x-0 top-0 h-full bg-cover md:-top-[2%] md:h-[104%] bg-position-[center_20%] bg-no-repeat md:bg-size-[auto_100%] md:bg-position-[right_center]"
        style={{ backgroundImage: `url('${HERO_PHOTO}'), ${PHOTO_EDGE}` }}
      />

      <div className="absolute inset-0 md:hidden" style={{ backgroundImage: VEIL_MOBILE }} />
      <div className="absolute inset-0 hidden md:block" style={{ backgroundImage: VEIL_DESKTOP }} />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,21,80,0.26)_0%,rgba(10,21,80,0)_26%,rgba(10,21,80,0)_72%,rgba(8,16,62,0.3)_100%)]" />

      <div data-hero-watermark className="absolute top-[24%] left-[3.5%] w-[62%] opacity-30 md:top-[17%] md:w-[48%]">
        <Image src={HERO_WATERMARK} alt="" width={361} height={273} priority sizes="(min-width: 768px) 48vw, 62vw" className="h-auto w-full" />
      </div>
    </div>
  );
}
