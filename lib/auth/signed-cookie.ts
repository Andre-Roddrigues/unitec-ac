/**
 * Verificação de cookies assinados pelo better-call (a camada HTTP do better-auth).
 *
 * Formato produzido por `ctx.setSignedCookie`: `urlencode(<valor>.<HMAC base64>)`,
 * onde o HMAC é SHA-256 sobre `<valor>` com o secret do better-auth.
 *
 * O Next descodifica o `%XX` ao ler o cookie, pelo que aqui só resta separar o
 * valor da assinatura e verificá-la.
 */

const ALGORITHM = { name: "HMAC", hash: "SHA-256" } as const;

async function cryptoKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    ALGORITHM,
    false,
    ["verify"]
  );
}

/**
 * Devolve o valor do cookie se a assinatura for válida, ou `null` caso
 * contrário (cookie adulterado, truncado, ou assinado com outro secret).
 */
export async function verifySignedCookie(
  signed: string,
  secret: string
): Promise<string | null> {
  // A assinatura é base64, que pode conter '.', por isso separa-se no último ponto.
  const separator = signed.lastIndexOf(".");
  if (separator <= 0) return null;

  const value = signed.slice(0, separator);
  const base64Signature = signed.slice(separator + 1);

  try {
    const binary = atob(base64Signature);
    const signature = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      signature[i] = binary.charCodeAt(i);
    }

    const valid = await crypto.subtle.verify(
      ALGORITHM,
      await cryptoKey(secret),
      signature,
      new TextEncoder().encode(value)
    );

    return valid ? value : null;
  } catch {
    return null;
  }
}
