/**
 * Reconhecer um vídeo do Vimeo a partir de um URL — partilhado pelo leitor
 * de aulas (`lesson-viewer.tsx`) e pelo trailer do curso
 * (`course-price-card.tsx`), que recebem links em formatos diferentes
 * (`player.vimeo.com/video/{id}?h=…`, `vimeo.com/{id}/{hash}`, …).
 */

export function extractVimeoId(url?: string | null): string | null {
  if (!url) return null;
  const m = url.match(/(?:vimeo\.com|player\.vimeo\.com)\/(?:video\/)?(\d+)/i);
  return m ? m[1] : null;
}

/** O hash de privacidade (`?h=...` no player, ou `/{id}/{hash}` no vimeo.com)
 *  — um vídeo oculto (`view: disable`) não toca no embed sem ele. */
export function extractVimeoHash(url?: string | null): string | null {
  if (!url) return null;
  const query = url.match(/[?&]h=([a-zA-Z0-9]+)/);
  if (query) return query[1];
  const path = url.match(/vimeo\.com\/\d+\/([a-zA-Z0-9]+)/i);
  return path ? path[1] : null;
}
