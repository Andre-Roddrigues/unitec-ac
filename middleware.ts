import { NextRequest, NextResponse } from "next/server";
import { getCookieCache } from "better-auth/cookies";

const AUTH_PATHS = ["/entrar", "/registar"];
const PROTECTED_PREFIXES = ["/perfil", "/inscrever-se"];

/**
 * Valida a sessão a partir do cookie cache (JWE) assinado com BETTER_AUTH_SECRET.
 * Ao contrário de verificar apenas a presença do cookie, isto rejeita cookies
 * forjados e sessões expiradas — e não toca em rede nem em base de dados.
 */
async function hasValidSession(req: NextRequest): Promise<boolean> {
  try {
    // `strategy` e `isSecure` têm de coincidir com lib/auth.ts, senão o
    // cookie não é encontrado nem desencriptado.
    const cached = await getCookieCache(req, {
      secret: process.env.BETTER_AUTH_SECRET,
      strategy: "jwe",
      isSecure: process.env.NODE_ENV === "production",
    });
    if (!cached) return false;

    const expiresAt = cached.session?.expiresAt;
    if (expiresAt && new Date(expiresAt).getTime() <= Date.now()) return false;

    return true;
  } catch {
    // Cookie corrompido, assinado com outro secret, ou ilegível.
    return false;
  }
}

/**
 * Ao contrário do painel admin (tudo privado por omissão), este é um site
 * público — só se protege o que precisa mesmo de sessão: a área do aluno e o
 * checkout (que chama endpoints do LMS que exigem `authenticate`).
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAuthPage = AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));

  if (!isAuthPage && !isProtected) {
    return NextResponse.next();
  }

  const authenticated = await hasValidSession(req);

  if (isAuthPage && authenticated) {
    return NextResponse.redirect(new URL("/perfil", req.url));
  }

  if (isProtected && !authenticated) {
    const entrarUrl = new URL("/entrar", req.url);
    entrarUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(entrarUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
