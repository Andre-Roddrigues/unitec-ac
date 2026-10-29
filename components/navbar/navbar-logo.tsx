import Image from "next/image";
import Link from "next/link";

export function NavbarLogo() {
  return (
    <Link
      href="/"
      aria-label="Página inicial"
      className="flex  items-center justify-center transition-opacity hover:opacity-85"
    >
      <Image
        src="/images/academyhd.png"
        alt="Logótipo Unitec Academy"
        width={70}
        height={70}
        className="h-full w-full object-contain"
        priority
      />
    </Link>
  );
}
