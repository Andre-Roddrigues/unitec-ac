/**
 * O `next/image` lança em runtime com `src=""` — e tanto `Course.thumbnail`
 * como `UserProfile.avatarUrl` são nulos por omissão no LMS. Estes helpers
 * garantem que nunca se passa uma string vazia adiante.
 */

export const COURSE_PLACEHOLDER = "/images/course-placeholder.svg";

/** Capa do curso, ou um marcador local quando o curso ainda não tem imagem. */
export function courseThumbnail(url?: string | null): string {
  const trimmed = url?.trim();
  return trimmed ? trimmed : COURSE_PLACEHOLDER;
}
