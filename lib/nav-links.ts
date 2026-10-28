export interface NavLink {
  label: string;
  href: string;
  /** Sub-opções (dropdown). O link principal continua a navegar. */
  children?: { label: string; href: string }[];
}

export function isNavLinkActive(href: string, pathname: string): boolean {
  const base = href.split("#")[0] || "/";
  return base === "/" ? pathname === "/" : pathname.startsWith(base);
}

export const navLinks: NavLink[] = [
  { label: "Início", href: "/" },
  {
    label: "Cursos",
    href: "/cursos",
    children: [
      { label: "Online", href: "/cursos-online" },
      { label: "Presencial", href: "/cursos-presenciais" },
    ],
  },
  { label: "Language Center", href: "/language-center" },
  { label: "Bpartner", href: "/bpartner" },
  { label: "Suporte", href: "/suporte" },
  { label: "Perfil", href: "/perfil" },
];