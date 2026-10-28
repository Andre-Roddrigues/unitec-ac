import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { NavbarUserMenu } from "./navbar-user-menu";

export async function NavbarAuthButtons() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session) {
    return <NavbarUserMenu name={session.user.name} />;
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="secondary"
        className="bg-white text-[#0A1550] hover:bg-white/90 px-6"
      >
        <Link href="/entrar">Entrar</Link>
      </Button>

      <Button
        variant="secondary"
        className="text-white  px-6"
      >
        <Link href="/registar">Registar</Link>
      </Button>
    </div>
  );
}
