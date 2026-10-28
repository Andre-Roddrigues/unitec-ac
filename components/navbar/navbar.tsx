import { NavbarLogo } from "@/components/navbar/navbar-logo";
import { NavbarLinks } from "@/components/navbar/navbar-links";
import { NavbarAuthButtons } from "@/components/navbar/navbar-auth-buttons";
import { NavbarMobileMenu } from "@/components/navbar/navbar-mobile-menu";

export function Navbar() {
  // `z-50`: na página inicial o conteúdo vive num wrapper `position: fixed`
  // (ScrollSmoother, ver HomeMotion) — sem isto tapava a navbar e o menu mobile.
  return (
    <header className="fixed z-50 w-full border-b border-slate-100 bg-white/95 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.04)]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <NavbarLogo />

        {/* O link activo vem do pathname — ver NavbarLinks. */}
        <NavbarLinks />

        <div className="hidden items-center md:flex">
          <NavbarAuthButtons />
        </div>

        <NavbarMobileMenu />
      </div>
    </header>
  );
}
