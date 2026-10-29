"use client";

// components/sections/Footer.tsx
import Link from "next/link";
import Image from "next/image";
import { useRef, type SVGProps } from "react";
import { Mail, MapPin, Phone, Send, ChevronLeft, ChevronRight } from "lucide-react";

// Importações do Modal e das Imagens de Pagamento
import mpesaLogo from "@/public/images/payments/Mpesalogo.png";
import visaLogo from "@/public/images/payments/visalogo.png";
import masterCardLogo from "@/public/images/payments/masterCardIcon.png";
import emola from "@/public/images/payments/emolalogo.png";
import PrivacyPolicyModal from "./politicadeprovacidade";

// ---------------------------------------------------------------------------
// Ícones de redes sociais (SVG inline, 24×24, fill=currentColor)
// ---------------------------------------------------------------------------

function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.412c0-3.02 1.792-4.688 4.533-4.688 1.312 0 2.686.235 2.686.235v2.972H15.83c-1.491 0-1.956.93-1.956 1.885v2.257h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073Z" />
    </svg>
  );
}

function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069ZM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0Zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881Z" />
    </svg>
  );
}

function LinkedInIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125ZM7.119 20.452H3.554V9h3.565v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0Z" />
    </svg>
  );
}

function TikTokIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Dados
// ---------------------------------------------------------------------------

const exploreServices = [
  { label: "Presenciais", href: "/cursos-presenciais" },
  { label: "Online", href: "/cursos-online" },
  { label: "Registar", href: "/registar" },
  { label: "Meu Perfil", href: "/perfil" },
];

const forProfessionals = [
  { label: "Registar-se", href: "/registo" },
  { label: "Publicar serviços", href: "/servicos/publicar" },
  { label: "Gerir o meu perfil", href: "/perfil" },
  { label: "Planos e comissões", href: "/planos" },
  { label: "Perguntas frequentes", href: "/faq" },
];

const help = [
  { label: "Suporte", href: "/suporte" },
  { label: "Pagamentos", href: "/pagamentos" },
  { label: "Cancelamentos", href: "/cancelamentos" },
  { label: "Segurança e privacidade", href: "/seguranca" },
];

const ecosystem = [
  { label: "Professional", href: "https://pro.unitec.co.mz" },
  { label: "Business", href: "https://business.unitec.co.mz" },
  { label: "Market", href: "https://market.unitec.co.mz" },
  { label: "Sobre-nós", href: "https://unitec.co.mz/sobre-nos" },
];

const contacts = [
  { icon: MapPin, text: "Av. Marien Ngouabi Nº 49, Maputo, Moçambique", href: undefined },
  { icon: Phone, text: "870088787 | 834303184", href: "tel:+258870088787" },
  { icon: Mail, text: "hello@unitec.co.mz", href: "mailto:hello@unitec.co.mz" },
];

const socials = [
  { icon: FacebookIcon, label: "Facebook", href: "https://facebook.com/unitec.mentor" },
  { icon: InstagramIcon, label: "Instagram", href: "https://instagram.com/unitec.mentor" },
  { icon: TikTokIcon, label: "TikTok", href: "https://tiktok.com/@unitec.mentor" },
  { icon: LinkedInIcon, label: "LinkedIn", href: "https://linkedin.com/company/unitecmentor/" },
];

const paymentLogos = [
  { name: "M-Pesa", src: mpesaLogo, alt: "M-Pesa" },
  { name: "e-Mola", src: emola, alt: "e-Mola" },
  { name: "VISA", src: visaLogo, alt: "VISA" },
  { name: "Mastercard", src: masterCardLogo, alt: "Mastercard" },
];

const linkColumns = [
  { title: "Links rápidos", links: exploreServices },
  // { title: "Para profissionais", links: forProfessionals },
  { title: "Ajuda", links: help },
  { title: "Ecossistema Unitec", links: ecosystem },
];

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

export function Footer() {
  const year = new Date().getFullYear();
  const socialScrollRef = useRef<HTMLDivElement>(null);

  const scrollSocials = (direction: "left" | "right") => {
    if (socialScrollRef.current) {
      const scrollAmount = 150;
      socialScrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <footer className="relative overflow-hidden bg-darkBlue text-white pt-14">
      {/* Decoração de fundo */}
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-secondary/30 blur-3xl" />
        <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-secondary/20 blur-3xl" />
      </div>

      <div className="relative mx-auto px-6 sm:px-10 lg:px-16 pb-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-6 lg:gap-12">
          {/* Marca */}
          <div className="md:col-span-2 lg:col-span-2">
            <div className="flex items-center gap-3">
              <Image
                src="/images/footeruni.png"
                alt="Unitec Pro"
                width={156}
                height={156}
              />
              <div>
                <p className="mt-1 text-xs text-white/70">
                  Profissionais. Serviços. Oportunidades.
                </p>
              </div>
            </div>

            <p className="mt-6 max-w-sm text-sm leading-relaxed text-white/70">
              A Unitec Academy é a plataforma de formação profissional que conecta estudantes, profissionais e empresas, oferecendo cursos de alta qualidade para impulsionar carreiras e negócios.
            </p>

            {/* Pagamentos */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {paymentLogos.map((method) => (
                <div
                  key={method.name}
                  className="bg-white/10 p-1.5 rounded-md flex items-center justify-center h-8 w-12"
                  title={method.alt}
                >
                  <Image
                    src={method.src}
                    alt={method.alt}
                    width={40}
                    height={20}
                    className="object-contain h-full w-full"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Colunas de links */}
          {linkColumns.map((column) => (
            <div key={column.title}>
              <h4 className="mb-5 font-bold text-white">{column.title}</h4>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/70 transition-colors duration-200 hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contactos e redes */}
          <div>
            <h4 className="mb-5 font-bold text-white">Contacte-nos</h4>
            <ul className="space-y-4">
              {contacts.map((item) => {
                const content = (
                  <>
                    <item.icon className="h-4 w-4 shrink-0 text-secondary" />
                    <span>{item.text}</span>
                  </>
                );

                return (
                  <li key={item.text} className="text-sm text-white/70">
                    {item.href ? (
                      <a
                        href={item.href}
                        className="flex items-start gap-3 transition-colors duration-200 hover:text-white"
                      >
                        {content}
                      </a>
                    ) : (
                      <span className="flex items-start gap-3">{content}</span>
                    )}
                  </li>
                );
              })}
            </ul>

            {/* Siga-nos com setas e scroll horizontal */}
            <div className="flex items-center justify-between mb-3 mt-8">
              <h4 className="font-bold text-white">Siga-nos</h4>
              <div className="flex gap-1">
                <button
                  onClick={() => scrollSocials("left")}
                  className="p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white/70 hover:text-white"
                  aria-label="Rolar para a esquerda"
                  type="button"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollSocials("right")}
                  className="p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white/70 hover:text-white"
                  aria-label="Rolar para a direita"
                  type="button"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div
              ref={socialScrollRef}
              className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory"
            >
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex h-10 w-10 shrink-0 snap-start items-center justify-center rounded-lg border border-white/15 text-white/80 transition-all duration-300 hover:border-secondary hover:bg-secondary hover:text-white"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Barra inferior */}
        <div className="mt-14 border-t border-white/10 pt-8">
          <div className="flex flex-col xl:flex-row items-center justify-between gap-8 mb-6">
            {/* Esquerda: marca */}
            <div className="flex items-center gap-4 w-full xl:w-auto justify-center xl:justify-start">
              <Image
                src="/images/unitecfooter.png"
                alt="Unitec Pro"
                width={150}
                height={150}
                className="h-10 w-auto"
              />
              <span className="hidden h-6 w-px bg-white/15 sm:block" />
              <span className="hidden text-xs font-semibold uppercase tracking-[0.2em] text-white/60 sm:block">
                Conectando o presente ao futuro
              </span>
            </div>

            {/* Centro: WhatsApp + subscrição */}
            <div className="w-full max-w-2xl flex flex-col sm:flex-row gap-3 items-center justify-center">
              <a
                href="https://whatsapp.com/channel/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-white hover:bg-[#20ba5a] text-[#25D366] font-semibold px-5 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Canal de Ofertas
              </a>

              <form
                className="flex flex-col sm:flex-row gap-2 items-center w-full"
                onSubmit={(e) => e.preventDefault()}
              >
                <div className="relative w-full">
                  <input
                    type="email"
                    placeholder="Email para promoções e novidades"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/50 focus:outline-none focus:border-secondary transition-colors"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-secondary text-background hover:bg-secondary/90 font-semibold px-6 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  Subscrever
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Direita: links legais */}
            <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-white/60 w-full xl:w-auto justify-center xl:justify-end">
              <div className="transition-colors hover:text-white whitespace-nowrap">
                <PrivacyPolicyModal />
              </div>
              <span className="hidden sm:block text-white/20">|</span>
              <Link href="/termos" className="transition-colors hover:text-white whitespace-nowrap">
                Termos e Condições
              </Link>
            </div>
          </div>

          <div className="text-center text-xs text-white/40 mt-6">
            <span>© {year} Unitec. Todos os direitos reservados.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}