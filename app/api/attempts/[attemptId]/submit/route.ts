import type { NextRequest } from "next/server";
import { submitQuizAttempt, type QuizAnswerInput } from "@/actions/assessment-actions";

/**
 * Submissão de saída do modo antifraude: o aluno fechou ou recarregou o
 * separador a meio de um teste ou exame, e o `navigator.sendBeacon` do
 * `pagehide` chega aqui com as respostas que ele tinha dado. Não é uma server
 * action porque o beacon é um POST simples, o único pedido que o browser
 * garante enviar com a página já a fechar.
 *
 * O cookie de sessão vem com o pedido (mesma origem) e o `apiPost` lê-o como
 * em qualquer outra chamada. O servidor é idempotente: se o aluno já tinha
 * submetido, devolve o resultado existente.
 */
export async function POST(request: NextRequest, ctx: { params: Promise<{ attemptId: string }> }) {
  // O beacon é sempre da própria origem: recusa-se o que vier de outro site.
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) {
    return Response.json({ success: false, message: "Origem inválida" }, { status: 403 });
  }

  const { attemptId } = await ctx.params;
  const body = (await request.json().catch(() => null)) as {
    answers?: QuizAnswerInput[];
    violationCount?: number;
  } | null;

  const result = await submitQuizAttempt(attemptId, Array.isArray(body?.answers) ? body.answers : [], {
    reason: "LEFT_PAGE",
    violationCount: typeof body?.violationCount === "number" ? body.violationCount : 0,
  });
  return Response.json(result, { status: result.success ? 200 : 502 });
}
