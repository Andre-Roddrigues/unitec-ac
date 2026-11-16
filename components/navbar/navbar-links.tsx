"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
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

export function NavbarLinks() {
  const pathname = usePathname();
  const [openHref, setOpenHref] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLUListElement>(null);

  const isLanguagePage = pathname?.startsWith("/language");

  // Fecha ao clicar fora
  useEffect(() => {
    if (!openHref) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpenHref(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenHref(null);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [openHref]);

  const open = (href: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenHref(href);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenHref(null), 120);
  };

  // ✅ Link dinâmico
  const dynamicLink: NavLink = isLanguagePage
    ? { label: "Academy", href: "/" }
    : { label: "Language", href: "/language" };

  // ✅ Encontrar o índice de "Cursos"
  const cursosIndex = baseNavLinks.findIndex((link) =>
    link.label.toLowerCase().includes("cursos")
  );

  // ✅ Inserir o link dinâmico depois de "Cursos"
  const displayedLinks: NavLink[] =
    cursosIndex !== -1
      ? [
          ...baseNavLinks.slice(0, cursosIndex + 1),
          dynamicLink,
          ...baseNavLinks.slice(cursosIndex + 1),
        ]
      : [...baseNavLinks, dynamicLink];

  return (
    <nav aria-label="Navegação principal" className="hidden md:block">
      <ul ref={containerRef} className="flex items-center gap-8">
        {displayedLinks.map((link) => {
          const isActive = isNavLinkActive(link.href, pathname);
          const hasChildren = Boolean(link.children?.length);
          const isOpen = openHref === link.href;

          // ✅ Chave única para evitar problemas de re-renderização
          const uniqueKey = `${link.label}-${link.href}`;

          return (
            <li
              key={uniqueKey}
              className="relative"
              onMouseEnter={hasChildren ? () => open(link.href) : undefined}
              onMouseLeave={hasChildren ? scheduleClose : undefined}
            >
              <div className="flex items-center gap-1">
                <Link
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "text-sm font-medium transition-colors font-bold",
                    isActive ? "text-darkBlue" : "text-slate-700 hover:text-darkBlue/70"
                  )}
                >
                  {link.label}
                </Link>

                {hasChildren && (
                  <button
                    type="button"
                    aria-label={`Abrir opções de ${link.label}`}
                    aria-haspopup="menu"
                    aria-expanded={isOpen}
                    onClick={() => setOpenHref(isOpen ? null : link.href)}
                    className="flex h-5 w-5 items-center justify-center text-darkBlue/70 hover:text-darkBlue"
                  >
                    <ChevronDown
                      className={cn("h-3.5 w-3.5 transition-transform", isOpen && "rotate-180")}
                    />
                  </button>
                )}
              </div>

              {hasChildren && isOpen && (
                <div
                  role="menu"
                  className="absolute left-0 top-full z-50 mt-2 min-w-[180px] rounded-lg border border-border bg-white p-1.5 shadow-xl"
                >
                  {link.children!.map((child) => (
                    <Link
                      key={`${child.label}-${child.href}`}
                      href={child.href}
                      role="menuitem"
                      onClick={() => setOpenHref(null)}
                      className="block rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-primary"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}