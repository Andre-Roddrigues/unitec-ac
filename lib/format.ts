export function formatPrice(val: number | string) {
  const value = Number(val) || 0;
  if (value === 0) return "Grátis";
  return new Intl.NumberFormat("pt-MZ", {
    style: "currency",
    currency: "MZN",
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatCompact(val: number | string) {
  const value = Number(val) || 0;
  return new Intl.NumberFormat("pt-MZ", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatDuration(val: number | string) {
  const minutes = Number(val) || 0;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-MZ", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export const LEVEL_LABEL: Record<string, string> = {
  BEGINNER: "Iniciante",
  INTERMEDIATE: "Intermédio",
  ADVANCED: "Avançado",
  ALL_LEVELS: "Todos os níveis",
};

export const FORMAT_LABEL: Record<string, string> = {
  ONLINE: "Online",
  PRESENCIAL: "Presencial",
  HIBRIDO: "Híbrido",
};

export const LESSON_TYPE_LABEL: Record<string, string> = {
  VIDEO: "Vídeo",
  DOCUMENT: "Documento",
  QUIZ: "Quiz",
  LIVE: "Sessão ao vivo",
};
