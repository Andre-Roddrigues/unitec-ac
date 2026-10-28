/**
 * Cliente do Auth Service externo (`backend_co`).
 *
 * O Auth Service é a única fonte de verdade das credenciais — este site não
 * regista nem guarda passwords. Este módulo conhece o formato exacto das suas
 * respostas; ver `backend_unitec/auth-service.md`.
 */

export interface AuthServiceUser {
  id: string;
  nome: string;
  apelido?: string;
  email: string;
  contacto?: string;
  userType: "admin" | "client" | "associado";
  role?: string[] | string | null;
}

export interface AuthServiceAuthResult {
  user: AuthServiceUser;
  token: string;
}

export class AuthServiceError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = "AuthServiceError";
  }
}

function authServiceUrl(): string {
  const url = process.env.AUTH_SERVICE_URL;
  if (!url) {
    throw new AuthServiceError("AUTH_SERVICE_URL não está configurada", 500);
  }
  return url.replace(/\/$/, "");
}

/** Normaliza `role`, que pode vir como array, string única ou ausente. */
export function normalizeRoles(role: AuthServiceUser["role"]): string[] {
  if (Array.isArray(role)) {
    return role.filter((r): r is string => typeof r === "string" && r.trim() !== "");
  }
  if (typeof role === "string" && role.trim() !== "") return [role];
  return [];
}

export function fullName(user: AuthServiceUser): string {
  return `${user.nome ?? ""} ${user.apelido ?? ""}`.trim() || user.email;
}

/**
 * Autentica no Auth Service.
 *
 * @param identifier email ou contacto — o Auth Service aceita ambos
 * @throws AuthServiceError quando as credenciais falham ou o serviço não responde
 */
export async function login(
  identifier: string,
  password: string
): Promise<AuthServiceAuthResult> {
  let res: Response;

  try {
    res = await fetch(`${authServiceUrl()}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
      cache: "no-store",
    });
  } catch (error) {
    console.error("[auth-service] falha de ligação", error);
    throw new AuthServiceError("Não foi possível contactar o serviço de autenticação", 503);
  }

  const text = await res.text();
  let body: { success?: boolean; message?: string; user?: AuthServiceUser; token?: string } | null =
    null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = null;
  }

  // Resposta plana: {success, message, user, token} — ao contrário do registo.
  if (!res.ok || !body?.success || !body.user || !body.token) {
    throw new AuthServiceError(
      body?.message || "Credenciais inválidas",
      res.status === 200 ? 401 : res.status
    );
  }

  return { user: body.user, token: body.token };
}

export interface RegisterInput {
  nome: string;
  apelido: string;
  email: string;
  password: string;
  contacto?: string;
}

/**
 * Regista uma conta nova no Auth Service.
 *
 * `userType` nunca vem do chamador: o endpoint do Auth Service aceita esse
 * campo do corpo do pedido sem o validar contra o enum (auto-promoção a admin
 * é possível chamando a API directamente — falha de segurança conhecida e
 * registada, fora do âmbito deste site). Fixa-se sempre a "client" aqui para
 * que este formulário nunca seja o vector.
 *
 * @throws AuthServiceError quando o registo falha (email já existe, etc.)
 */
export async function register(input: RegisterInput): Promise<AuthServiceAuthResult> {
  let res: Response;

  try {
    res = await fetch(`${authServiceUrl()}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...input, userType: "client" }),
      cache: "no-store",
    });
  } catch (error) {
    console.error("[auth-service] falha de ligação", error);
    throw new AuthServiceError("Não foi possível contactar o serviço de autenticação", 503);
  }

  const text = await res.text();
  let body: {
    success?: boolean;
    message?: string;
    user?: { user?: AuthServiceUser; token?: string };
  } | null = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = null;
  }

  // Resposta com um nível extra de aninhamento (user.user, user.token) —
  // diferente do login. Ver auth-service.md.
  const user = body?.user?.user;
  const token = body?.user?.token;

  if (!res.ok || !body?.success || !user || !token) {
    throw new AuthServiceError(
      body?.message || "Não foi possível criar a conta",
      res.status === 200 ? 400 : res.status
    );
  }

  return { user, token };
}
