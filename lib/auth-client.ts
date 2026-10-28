"use client";

import { createAuthClient } from "better-auth/react";
import { authServicePluginClient } from "./auth/auth-service-plugin";

/**
 * Cliente de autenticação do site do aluno.
 *
 * `authClient.signIn.authService({identifier, password})` e
 * `authClient.signUp.authService({nome, apelido, email, password, contacto})`
 * delegam ao Auth Service externo; `useSession()` e `signOut()` leem/limpam
 * o cookie de sessão.
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  plugins: [authServicePluginClient()],
});

export const { signIn, signUp, signOut, useSession } = authClient;
