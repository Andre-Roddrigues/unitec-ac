import 'server-only';
import { cookies } from 'next/headers';
import { verifySignedCookie } from '@/lib/auth/signed-cookie';
import { API_TOKEN_COOKIE } from '@/lib/auth/auth-service-plugin';
import { PUBLIC_CACHE_SECONDS, type PublicCacheTag } from '@/lib/api/cache-tags';

export type ActionResponse<T = null> = {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
};

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface FetchOptions extends RequestInit {
  token?: string;
  /** Pedido sem sessão: não lê o cookie nem envia `Authorization`. */
  anonymous?: boolean;
}

/**
 * Devolve o JWT do Auth Service, lido do cookie httpOnly assinado que o
 * plugin de sign-in/sign-up escreve. É este token que o LMS valida.
 *
 * Só funciona em contexto de servidor (server action, RSC ou route handler).
 */
export async function getAuthToken(): Promise<string | null> {
  const raw = (await cookies()).get(API_TOKEN_COOKIE)?.value;
  if (!raw) return null;
  return verifySignedCookie(raw, process.env.BETTER_AUTH_SECRET!);
}

async function request<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<ActionResponse<T>> {
  const { token: explicitToken, anonymous, headers: customHeaders, ...restOptions } = options;
  // Chamadas feitas logo após login/registo passam o token explicitamente
  // (o cookie que acabou de ser definido não é legível na mesma resposta);
  // todas as outras vêm do cookie de sessão.
  const token = anonymous ? undefined : explicitToken ?? (await getAuthToken()) ?? undefined;

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${BASE_URL}${cleanEndpoint}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...customHeaders,
  };

  try {
    const response = await fetch(url, {
      headers,
      // `cache` e `next.revalidate` juntos são recusados pelo Next (ignora os
      // dois) — só se fixa `no-store` quando o pedido não traz a sua cache.
      ...(restOptions.next ? {} : { cache: 'no-store' as const }),
      ...restOptions,
    });

    const json = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        success: false,
        message: json?.message || `Erro ${response.status}: ${response.statusText}`,
        errors: json?.errors || undefined,
        data: json?.data || undefined,
      };
    }

    return {
      success: json?.success ?? true,
      message: json?.message || 'Operação realizada com sucesso',
      data: json?.data !== undefined ? json.data : (json as T),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro de conexão com o servidor';
    return {
      success: false,
      message: errorMessage,
    };
  }
}

export async function apiGet<T>(
  endpoint: string,
  options?: FetchOptions
): Promise<ActionResponse<T>> {
  return request<T>(endpoint, { method: 'GET', ...options });
}

/**
 * GET a um endpoint **público** do LMS (catálogo, detalhe de curso,
 * categorias), com cache partilhada entre todos os visitantes.
 *
 * Não lê o cookie nem envia `Authorization`: estes endpoints respondem o
 * mesmo a toda a gente, e um cabeçalho por utilizador partia a cache numa
 * entrada por sessão. A cache dura `revalidate` segundos, ou até o admin
 * invalidar a tag (ver `app/api/revalidate/route.ts`).
 */
export async function apiGetPublic<T>(
  endpoint: string,
  { tags, revalidate = PUBLIC_CACHE_SECONDS }: { tags: PublicCacheTag[]; revalidate?: number }
): Promise<ActionResponse<T>> {
  return request<T>(endpoint, { method: 'GET', anonymous: true, next: { revalidate, tags } });
}

export async function apiPost<T>(
  endpoint: string,
  data?: unknown,
  options?: FetchOptions
): Promise<ActionResponse<T>> {
  return request<T>(endpoint, {
    method: 'POST',
    body: data !== undefined ? JSON.stringify(data) : undefined,
    ...options,
  });
}

export async function apiPut<T>(
  endpoint: string,
  data?: unknown,
  options?: FetchOptions
): Promise<ActionResponse<T>> {
  return request<T>(endpoint, {
    method: 'PUT',
    body: data !== undefined ? JSON.stringify(data) : undefined,
    ...options,
  });
}

export async function apiPatch<T>(
  endpoint: string,
  data?: unknown,
  options?: FetchOptions
): Promise<ActionResponse<T>> {
  return request<T>(endpoint, {
    method: 'PATCH',
    body: data !== undefined ? JSON.stringify(data) : undefined,
    ...options,
  });
}

export async function apiDelete<T>(
  endpoint: string,
  options?: FetchOptions
): Promise<ActionResponse<T>> {
  return request<T>(endpoint, { method: 'DELETE', ...options });
}
