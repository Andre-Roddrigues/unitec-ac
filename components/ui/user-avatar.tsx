import Image from "next/image";
import { cn } from "@/lib/utils";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return (first + last).toUpperCase();
}

/**
 * Fotografia do utilizador — ou as iniciais, quando não há nenhuma.
 *
 * `avatarUrl` é nulo por omissão no LMS, e o `next/image` lança com `src=""`,
 * por isso o caso "sem foto" não pode passar por `<Image>`. As iniciais são
 * decorativas: o nome aparece sempre ao lado.
 */
export function UserAvatar({
  name,
  src,
  size,
  className,
}: {
  name: string;
  src?: string | null;
  /** Dimensão intrínseca da imagem; o tamanho visual vem do `className`. */
  size: number;
  className?: string;
}) {
  const url = src?.trim();

  if (!url) {
    return (
      <span
        aria-hidden
        className={cn(
          "grid shrink-0 place-items-center bg-primary-soft font-semibold text-primary",
          className,
        )}
      >
        {initials(name)}
      </span>
    );
  }

  return (
    <Image
      src={url}
      alt={`Fotografia de ${name}`}
      width={size}
      height={size}
      className={cn("shrink-0 object-cover", className)}
    />
  );
}
