"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isNavLinkActive, navLinks } from "@/lib/nav-links";

export function NavbarMobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
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
          <ul className="flex flex-col gap-4">
            {navLinks.map((link) => {
              const isActive = isNavLinkActive(link.href, pathname);

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    aria-current={isActive ? "page" : undefined}
                    className={[
                      "block text-sm font-medium",
                      isActive ? "text-white" : "text-white/80 hover:text-white",
                    ].join(" ")}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-6 flex gap-3">
            <Button
              variant="secondary"
              size="sm"
              className="flex-1 bg-white text-[#0A1550] hover:bg-white/90"
            >
              <Link href="/entrar">Entrar</Link>
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-[#1E6FE0] text-white hover:bg-[#1E6FE0]/90"
            >
              <Link href="/registar">Registar</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
