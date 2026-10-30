"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavbarLogo() {
  const pathname = usePathname();
  const isLanguage = pathname?.startsWith("/language");

  return (
    <Link
      href="/"
      aria-label="Página inicial"
      className="flex items-center justify-center transition-opacity hover:opacity-85"
    >
      <Image
        src={isLanguage ? "/images/unitec_languagehd.png" : "/images/academyhd.png"}
        alt={
          isLanguage
            ? "Logótipo Unitec Language Center"
            : "Logótipo Unitec Academy"
        }
        width={70}
        height={70}
        className="h-full w-full object-contain"
        priority
      />
    </Link>
  );
}