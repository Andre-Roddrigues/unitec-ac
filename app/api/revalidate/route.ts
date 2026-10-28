import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import { PUBLIC_CACHE_TAG_VALUES } from "@/lib/api/cache-tags";

/**
 * Invalida a cache das leituras públicas (ver `apiGetPublic`). Chamada pelo
 * painel admin depois de gravar um curso ou uma categoria, para o site não
 * ficar até 60s com a versão antiga.
 *
 * `POST` com `Authorization: Bearer <REVALIDATE_SECRET>` e `{ "tags": [...] }`.
 * Sem o segredo configurado a rota fica desligada — a cache expira sozinha.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return Response.json({ success: false, message: "Revalidação desligada" }, { status: 503 });
  }

  const sent = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!safeEqual(sent, secret)) {
    return Response.json({ success: false, message: "Não autorizado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const tags: unknown = body?.tags;
  if (!Array.isArray(tags) || tags.length === 0) {
    return Response.json({ success: false, message: "Indique as tags a invalidar" }, { status: 400 });
  }

  const unknownTags = tags.filter((tag) => !PUBLIC_CACHE_TAG_VALUES.includes(tag));
  if (unknownTags.length > 0) {
    return Response.json(
      { success: false, message: `Tags desconhecidas: ${unknownTags.join(", ")}` },
      { status: 400 }
    );
  }

  // `expire: 0` e não o perfil "max": quem chama é outra app, que acabou de
  // gravar e quer a próxima visita já com os dados novos — não servir a
  // versão antiga uma última vez enquanto revalida em fundo.
  for (const tag of tags as string[]) {
    revalidateTag(tag, { expire: 0 });
  }

  return Response.json({ success: true, revalidated: tags });
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}
