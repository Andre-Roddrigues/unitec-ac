import type { NextConfig } from "next";

/**
 * Origens autorizadas a invocar as server actions desta app (login, registo,
 * checkout, …) — em produção o Next recusa, em silêncio, toda a server
 * action cuja origem não esteja aqui. Isto tinha ficado fixo em
 * `['localhost:3000', 'localhost:3001']`, o que bloqueava tudo assim que o
 * site saísse do domínio local (era o mesmo que não ter `allowedOrigins`
 * nenhum, só que a fingir que estava configurado). `BETTER_AUTH_URL` já é o
 * URL público desta app (ver `.env.example`) — reaproveita-se em vez de
 * duplicar noutra variável. `SERVER_ACTIONS_EXTRA_ORIGINS` cobre casos como
 * www vs. domínio nu, ou um ambiente de staging, sem voltar a editar código.
 */
function serverActionsAllowedOrigins(): string[] {
  const origins = new Set(["localhost:3000", "localhost:3001"]);

  const publicUrl = process.env.BETTER_AUTH_URL;
  if (publicUrl) {
    try {
      origins.add(new URL(publicUrl).host);
    } catch {
      // BETTER_AUTH_URL inválido — ignora-se aqui; better-auth já se queixa
      // disto alto e bom som no arranque.
    }
  }

  (process.env.SERVER_ACTIONS_EXTRA_ORIGINS ?? "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean)
    .forEach((o) => origins.add(o));

  return Array.from(origins);
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      // Uploads do backend LMS em desenvolvimento local (http://localhost:5000).
      // Inofensivo em produção: nenhuma imagem real é servida a partir de "localhost".
      { protocol: 'http', hostname: '*' },
    ],
  },
  // Ensure server actions and server-only imports resolve correctly
  experimental: {
    serverActions: {
      allowedOrigins: serverActionsAllowedOrigins(),
    },
  },
};

export default nextConfig;
