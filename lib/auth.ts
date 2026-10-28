import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { authServicePlugin, SESSION_MAX_AGE_SECONDS } from "./auth/auth-service-plugin";

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET não está definida (gerar com: openssl rand -base64 32)");
}

/**
 * Camada de sessão do site do aluno.
 *
 * As credenciais vivem no Auth Service externo (`backend_co`) — este
 * better-auth não regista nem guarda utilizadores. Sem `database`, corre em
 * modo stateless: a sessão é um cookie encriptado (JWE), sem qualquer query.
 *
 * Consequência aceite: as sessões não são revogáveis do lado do servidor.
 * Mitigação: ver a nota em `SESSION_MAX_AGE_SECONDS` sobre a duração.
 */
export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",

  // O login/registo são feitos pelo plugin `auth-service`, não por
  // email/password local.
  emailAndPassword: { enabled: false },

  session: {
    expiresIn: SESSION_MAX_AGE_SECONDS,
    cookieCache: {
      enabled: true,
      strategy: "jwe",
      maxAge: SESSION_MAX_AGE_SECONDS,
      refreshCache: true,
    },
  },

  user: {
    additionalFields: {
      userType: { type: "string", input: false },
      roles: { type: "string[]", input: false },
      apelido: { type: "string", input: false, required: false },
      contacto: { type: "string", input: false, required: false },
    },
  },

  rateLimit: { enabled: true, window: 60, max: 10 },

  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
  },

  // nextCookies() tem de ser o último plugin.
  plugins: [authServicePlugin(), nextCookies()],
});
