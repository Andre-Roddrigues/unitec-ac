"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isNavLinkActive, navLinks } from "@/lib/nav-links";
import { cn } from "@/lib/utils";

export function NavbarMobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const pathname = usePathname();

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
            {navLinks.map((link) => {
              const isActive = isNavLinkActive(link.href, pathname);
              const hasChildren = Boolean(link.children?.length);
              const isSubOpen = openSubmenu === link.href;

              return (
                <li key={link.href}>
                  <div className="flex items-center justify-between">
                    <Link
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "block flex-1 py-2 text-sm font-medium",
                        isActive ? "text-white" : "text-white/80 hover:text-white",
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
                        <li key={child.href}>
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
            <Button  size="sm" className="flex-1 bg-[#1E6FE0] text-white hover:bg-[#1E6FE0]/90">
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