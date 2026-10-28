import { randomUUID } from "crypto";
import { z } from "zod";
import { APIError, createAuthEndpoint, createAuthMiddleware } from "better-auth/api";
import { setSessionCookie } from "better-auth/cookies";
import type { BetterAuthPlugin } from "better-auth";
import type { BetterAuthClientPlugin } from "better-auth/client";
import {
  AuthServiceError,
  fullName,
  login as authServiceLogin,
  register as authServiceRegister,
  normalizeRoles,
  type AuthServiceUser,
} from "./auth-service";

/**
 * Duração da sessão do site do aluno: alinhada com o JWT do Auth Service
 * (~60 dias), ao contrário das 8h do painel admin — lá a superfície é
 * sensível (controlo total da plataforma); aqui o pior cenário de uma sessão
 * comprometida é o acesso da própria pessoa aos seus cursos. Sem essa
 * assimetria de risco, expirar a sessão local antes do JWT externo não
 * ganharia nada: os pedidos ao LMS já falhariam com 401 quando o JWT
 * caducasse, sessão local ou não.
 */
export const SESSION_MAX_AGE_SECONDS = 60 * 24 * 60 * 60;

/**
 * Cookie que transporta o JWT do Auth Service.
 *
 * Fica fora da sessão do better-auth de propósito: um campo de sessão marcado
 * com `returned: false` é removido do próprio cookie cache (não apenas da
 * resposta), e sem essa marca o token seria devolvido ao cliente em
 * `/api/auth/get-session`. Um cookie httpOnly assinado à parte evita ambos.
 */
export const API_TOKEN_COOKIE = "academy.api_token";

function apiTokenCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge,
  };
}

/**
 * Chama o LMS uma vez com o token novo, só para disparar o `upsert` do
 * `UserProfile` (ver `authenticate.middleware.ts` do backend_unitec) — assim
 * o aluno aparece de imediato em Painel → Alunos, em vez de só na próxima
 * vez que calhar a fazer um pedido autenticado qualquer. Falha em silêncio:
 * não vale a pena chumbar o registo por causa disto, o espelho acaba sempre
 * por se auto-corrigir no primeiro pedido seguinte.
 */
async function warmUpLmsMirror(token: string): Promise<void> {
  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
  try {
    await fetch(`${apiUrl}/user/profile`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  } catch (error) {
    console.error("[auth-service-plugin] falha ao sincronizar o perfil com o LMS", error);
  }
}

/**
 * Sintetiza a sessão do better-auth a partir do utilizador devolvido pelo
 * Auth Service e grava os dois cookies (sessão JWE + JWT assinado à parte).
 * Partilhado por sign-in e sign-up — só o que acontece depois difere (o
 * sign-up ainda dispara `warmUpLmsMirror`).
 */
async function establishSession(
  // `better-call` tipa `ctx` de forma diferente por endpoint (o corpo varia);
  // aqui só se usa a parte comum (request/cookies/setSignedCookie), por isso
  // o tipo solto — o mesmo compromisso que o `as never` abaixo já assume.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx: any,
  externalUser: AuthServiceUser,
  token: string
) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_MAX_AGE_SECONDS * 1000);

  const user = {
    id: externalUser.id,
    name: fullName(externalUser),
    email: externalUser.email,
    emailVerified: true,
    image: null,
    createdAt: now,
    updatedAt: now,
    userType: externalUser.userType,
    roles: normalizeRoles(externalUser.role),
    apelido: externalUser.apelido ?? null,
    contacto: externalUser.contacto ?? null,
  };

  const session = {
    id: randomUUID(),
    token: randomUUID(),
    userId: user.id,
    createdAt: now,
    updatedAt: now,
    expiresAt,
    ipAddress: ctx.request?.headers.get("x-forwarded-for") ?? null,
    userAgent: ctx.request?.headers.get("user-agent") ?? null,
  };

  await setSessionCookie(ctx as never, { session, user } as never);
  await ctx.setSignedCookie(
    API_TOKEN_COOKIE,
    token,
    ctx.context.secret,
    apiTokenCookieOptions(SESSION_MAX_AGE_SECONDS)
  );

  return user;
}

/**
 * Plugin de servidor que delega a autenticação ao Auth Service externo
 * (`backend_co`).
 *
 * Corre em modo stateless (sem base de dados), pelo que a sessão é sintetizada
 * aqui e escrita no cookie encriptado (JWE) por `setSessionCookie` — não é
 * possível usar `internalAdapter.createSession`, que exige um adapter.
 *
 * O JWT do Auth Service não viaja na sessão do better-auth (ver nota em
 * `API_TOKEN_COOKIE`); vive num cookie httpOnly assinado à parte e é
 * reenviado ao LMS como `Authorization: Bearer`.
 */
export const authServicePlugin = () =>
  ({
    id: "auth-service",
    endpoints: {
      signInAuthService: createAuthEndpoint(
        "/sign-in/auth-service",
        {
          method: "POST",
          body: z.object({
            identifier: z.string().min(1),
            password: z.string().min(1),
          }),
        },
        async (ctx) => {
          const { identifier, password } = ctx.body;

          let result;
          try {
            result = await authServiceLogin(identifier, password);
          } catch (error) {
            if (error instanceof AuthServiceError) {
              throw new APIError(error.status === 503 ? "SERVICE_UNAVAILABLE" : "UNAUTHORIZED", {
                message: error.message,
              });
            }
            throw error;
          }

          const user = await establishSession(ctx, result.user, result.token);
          return ctx.json({ user, redirect: false });
        }
      ),

      signUpAuthService: createAuthEndpoint(
        "/sign-up/auth-service",
        {
          method: "POST",
          body: z.object({
            nome: z.string().min(1),
            apelido: z.string().min(1),
            email: z.string().email(),
            password: z.string().min(6),
            contacto: z.string().optional(),
          }),
        },
        async (ctx) => {
          let result;
          try {
            result = await authServiceRegister(ctx.body);
          } catch (error) {
            if (error instanceof AuthServiceError) {
              throw new APIError(error.status === 503 ? "SERVICE_UNAVAILABLE" : "BAD_REQUEST", {
                message: error.message,
              });
            }
            throw error;
          }

          const user = await establishSession(ctx, result.user, result.token);

          // Materializa o UserProfile no LMS já com o token novo, em vez de
          // depender do próximo pedido autenticado que o aluno calhe a fazer.
          await warmUpLmsMirror(result.token);

          return ctx.json({ user, redirect: false });
        }
      ),
    },
    hooks: {
      after: [
        {
          // O better-auth só limpa os seus próprios cookies no sign-out.
          matcher: (ctx) => ctx.path === "/sign-out",
          handler: createAuthMiddleware(async (ctx) => {
            ctx.setCookie(API_TOKEN_COOKIE, "", apiTokenCookieOptions(0));
          }),
        },
      ],
    },
  }) satisfies BetterAuthPlugin;

/** Plugin de cliente correspondente — expõe `signIn.authService` e `signUp.authService`. */
export const authServicePluginClient = () =>
  ({
    id: "auth-service",
    $InferServerPlugin: {} as ReturnType<typeof authServicePlugin>,
  }) satisfies BetterAuthClientPlugin;
