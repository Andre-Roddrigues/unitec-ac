"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { isNavLinkActive, navLinks } from "@/lib/nav-links";
import { cn } from "@/lib/utils";

export function NavbarLinks() {
  const pathname = usePathname();
  const [openHref, setOpenHref] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLUListElement>(null);

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

  return (
    <nav aria-label="Navegação principal" className="hidden md:block">
      <ul ref={containerRef} className="flex items-center gap-8">
        {navLinks.map((link) => {
          const isActive = isNavLinkActive(link.href, pathname);
          const hasChildren = Boolean(link.children?.length);
          const isOpen = openHref === link.href;

          return (
            <li
              key={link.href}
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
                    isActive ? "text-darkBlue" : "text- hover:text-darkBlue/70",
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
                      key={child.href}
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