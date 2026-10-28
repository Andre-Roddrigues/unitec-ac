"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function NavbarUserMenu({ name }: { name: string }) {
  const router = useRouter();

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
        <Link href="/perfil">{name.split(" ")[0] || "Minha conta"}</Link>
      </Button>
      <Button
        variant="secondary"
        size="icon"
        onClick={handleSignOut}
        title="Sair"
        aria-label="Sair"
      >
        <LogOut className="size-4" />
      </Button>
    </div>
  );
}
