export interface NavLink {
  label: string;
  href: string;
}

/**
 * O link do menu corresponde à página actual? A raiz e as âncoras da página
 * inicial (`/#seccao`) exigem correspondência exacta — de outra forma "Início"
 * ficaria activo em todas as páginas do site.
 */
export function isNavLinkActive(href: string, pathname: string): boolean {
  const base = href.split("#")[0] || "/";
  return base === "/" ? pathname === "/" : pathname.startsWith(base);
}

export const navLinks: NavLink[] = [
  { label: "Início", href: "/" },
  { label: "Cursos", href: "/cursos" },
  { label: "Language Center", href: "/language-center" },
  { label: "Bpartner", href: "/bpartner" },
  { label: "Suporte", href: "/suporte" },
  { label: "Perfil", href: "/perfil" },

];
