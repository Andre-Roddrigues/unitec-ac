import type { NextRequest } from "next/server";
import { getCourses } from "@/actions/courses-actions";
import { parseCatalogParams, toGetCoursesFilters } from "@/lib/catalog";

/**
 * Catálogo para o `CoursesList` pedir páginas/filtros novos sem re-renderizar
 * `/cursos` no servidor. Não é uma server action porque essas são enfileiradas
 * (uma de cada vez) e o Next desaconselha-as para leitura.
 *
 * Recebe a mesma query que o URL de `/cursos` (`category`, `level`, …) e
 * devolve o `ActionResponse` de `getCourses` tal como está.
 */
export async function GET(request: NextRequest) {
  const filters = parseCatalogParams((key) => request.nextUrl.searchParams.get(key));
  const result = await getCourses(toGetCoursesFilters(filters));
  return Response.json(result, { status: result.success ? 200 : 502 });
}
