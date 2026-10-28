"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isNavLinkActive, navLinks } from "@/lib/nav-links";

export function NavbarLinks() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegação principal" className="hidden md:block">
      <ul className="flex items-center gap-8">
        {navLinks.map((link) => {
          const isActive = isNavLinkActive(link.href, pathname);

          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={[
                  "text-sm font-medium transition-colors",
                  isActive
                    ? "text-white"
                    : "text-white/70 hover:text-white",
                ].join(" ")}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
