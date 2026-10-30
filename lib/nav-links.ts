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
      { label: "Online", href: "/cursos" },
      { label: "Presencial", href: "/presenciais" },
    ],
  },
  { label: "Language", href: "/language" },
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