import Image from "next/image";
import Link from "next/link";

export function NavbarLogo() {
  return (
    <Link
      href="/"
      aria-label="Página inicial"
      className="flex h-10 w-10 items-center justify-center transition-opacity hover:opacity-85"
    >
      <Image
        src="/brand/ICON_ACADEMY.png"
        alt="Logótipo Unitec Academy"
        width={40}
        height={40}
        className="h-full w-full object-contain"
        priority
      />
    </Link>
  );
}
