/**
 * Tags da cache de dados do Next para as leituras públicas do LMS (ver
 * `apiGetPublic`). O painel admin invalida-as em `POST /api/revalidate`
 * quando grava um curso ou uma categoria — a lista fica aqui para a rota só
 * aceitar tags que existem.
 */
export const PUBLIC_CACHE_TAGS = {
  courses: 'courses',
  categories: 'categories',
} as const;

export type PublicCacheTag = (typeof PUBLIC_CACHE_TAGS)[keyof typeof PUBLIC_CACHE_TAGS];

export const PUBLIC_CACHE_TAG_VALUES: readonly string[] = Object.values(PUBLIC_CACHE_TAGS);

/** Segundos que uma leitura pública fica em cache se ninguém a invalidar antes. */
export const PUBLIC_CACHE_SECONDS = 60;
