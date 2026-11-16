"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavLink {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
}

function isNavLinkActive(href: string, pathname: string): boolean {
  const base = href.split("#")[0] || "/";
  return base === "/" ? pathname === "/" : pathname.startsWith(base);
}

// ✅ Lista base (sem Academy/Language)
const baseNavLinks: NavLink[] = [
  { label: "Início", href: "/" },
  {
    label: "Cursos",
    href: "/cursos",
    children: [
      { label: "Online", href: "/cursos" },
      { label: "Presencial", href: "/presenciais" },
    ],
  },
  { label: "Business", href: "https://business.unitec.co.mz" },
  {
    label: "Suporte",
    href: "/",
    children: [
      { label: "FAQ", href: "https://unitec.co.mz/faq" },
      { label: "Assistência", href: "https://unitec.co.mz/assistencia" },
    ],
  },
];

export function NavbarMobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const pathname = usePathname();

  const isLanguagePage = pathname?.startsWith("/language");

  // ✅ Link dinâmico
  const dynamicLink: NavLink = isLanguagePage
    ? { label: "Academy", href: "/" }
    : { label: "Language", href: "/language" };

  // ✅ Inserir depois de "Cursos"
  const cursosIndex = baseNavLinks.findIndex((link) =>
    link.label.toLowerCase().includes("cursos")
  );

  const displayedLinks: NavLink[] =
    cursosIndex !== -1
      ? [
          ...baseNavLinks.slice(0, cursosIndex + 1),
          dynamicLink,
          ...baseNavLinks.slice(cursosIndex + 1),
        ]
      : [...baseNavLinks, dynamicLink];

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
        className="flex h-9 w-9 items-center justify-center text-white"
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {isOpen && (
        <div className="absolute inset-x-0 top-full z-50 border-t border-white/10 bg-[#0A1550] px-6 py-4 shadow-lg">
          <ul className="flex flex-col gap-1">
            {displayedLinks.map((link) => {
              const isActive = isNavLinkActive(link.href, pathname);
              const hasChildren = Boolean(link.children?.length);
              const isSubOpen = openSubmenu === link.href;

              // ✅ Chave única
              const uniqueKey = `${link.label}-${link.href}`;

              return (
                <li key={uniqueKey}>
                  <div className="flex items-center justify-between">
                    <Link
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "block flex-1 py-2 text-sm font-medium",
                        isActive ? "text-white" : "text-white/80 hover:text-white"
                      )}
                    >
                      {link.label}
                    </Link>

                    {hasChildren && (
                      <button
                        type="button"
                        onClick={() => setOpenSubmenu(isSubOpen ? null : link.href)}
                        aria-label={`Mostrar opções de ${link.label}`}
                        aria-expanded={isSubOpen}
                        className="flex h-7 w-7 items-center justify-center text-white/70 hover:text-white"
                      >
                        <ChevronDown
                          className={cn("h-4 w-4 transition-transform", isSubOpen && "rotate-180")}
                        />
                      </button>
                    )}
                  </div>

                  {hasChildren && isSubOpen && (
                    <ul className="mb-2 ml-3 flex flex-col gap-1 border-l border-white/10 pl-3">
                      {link.children!.map((child) => (
                        <li key={`${child.label}-${child.href}`}>
                          <Link
                            href={child.href}
                            onClick={() => setIsOpen(false)}
                            className="block py-1.5 text-sm text-white/70 hover:text-white"
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="mt-4 flex gap-3 border-t border-white/10 pt-4">
            <Button
              variant="secondary"
              size="sm"
              className="flex-1 bg-white text-[#0A1550] hover:bg-white/90"
            >
              <Link href="/entrar" onClick={() => setIsOpen(false)}>
                Entrar
              </Link>
            </Button>
            <Button size="sm" className="flex-1 bg-[#1E6FE0] text-white hover:bg-[#1E6FE0]/90">
              <Link href="/registar" onClick={() => setIsOpen(false)}>
                Registar
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}