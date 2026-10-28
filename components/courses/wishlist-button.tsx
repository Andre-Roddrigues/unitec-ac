"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "@/hooks/use-wishlist";
import { cn } from "@/lib/utils";

/**
 * Guarda um curso na lista de desejos.
 *
 * O `useWishlist` existia com `toggle`/`has` e **nenhum componente os
 * chamava** — não havia um único botão de favorito no site, e o separador
 * "Lista de desejos" do perfil pedia ao aluno para fazer algo impossível.
 *
 * A lista vive no `localStorage` deste browser: não segue o aluno para outro
 * dispositivo (guardá-la no servidor exigiria uma tabela que não existe).
 */
export function WishlistButton({ courseId, className }: { courseId: string; className?: string }) {
  const { ids, toggle, hydrated } = useWishlist();
  const saved = hydrated && ids.includes(courseId);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(courseId);
      }}
      aria-pressed={saved}
      aria-label={saved ? "Remover da lista de desejos" : "Guardar na lista de desejos"}
      title={saved ? "Remover da lista de desejos" : "Guardar na lista de desejos"}
      className={cn(
        "grid size-8 cursor-pointer place-items-center rounded-full bg-background/90 text-muted-foreground shadow-sm backdrop-blur transition-colors hover:text-destructive",
        saved && "text-destructive",
        className,
      )}
    >
      <Heart className={cn("size-4", saved && "fill-current")} />
    </button>
  );
}
