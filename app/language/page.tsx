import { Suspense } from "react";
import { getCategories, getCourses, getLanguageCategoryId } from "@/actions/courses-actions";
import { LanguageHero } from "@/components/courses/language/language-hero";
import LanguageCatalog from "@/components/courses/language/language-catalog";

export const metadata = {
  title: "Unitec Language Center | Cursos de Línguas",
  description: "Aprenda inglês, francês, mandarim e outros idiomas.",
};

export default async function LanguagePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  // 1. Descobrir o ID da categoria "Idiomas" (slug: idiomas)
  const [categoriesRes, languageCategoryId] = await Promise.all([
    getCategories(),
    getLanguageCategoryId(),
  ]);
  const categories = categoriesRes.data ?? [];

  // 2. Se não existir categoria, mostramos a página sem cursos
  if (!languageCategoryId) {
    return (
      <main className="flex min-h-screen flex-col">
        <LanguageHero />
        <div className="container-page py-16 text-center text-muted-foreground">
          Categoria de idiomas ainda não configurada.
        </div>
      </main>
    );
  }

  // 3. Extrair filtros da URL
  const get = (name: string) => {
    const v = params[name];
    return Array.isArray(v) ? v[0] : v ?? undefined;
  };

  // 4. Buscar cursos já filtrados pela categoria de idiomas
  const coursesRes = await getCourses({
    categoryId: languageCategoryId,
    search: get("search"),
    level: get("level") as any,
    price: get("price") as any,
    sort: get("sort") as any,
    page: Number(get("page")) || 1,
  });

  return (
    <main className="flex min-h-screen flex-col">
      <LanguageHero
        totalCourses={coursesRes.success ? coursesRes.data?.total : undefined}
      />
      <Suspense fallback={<div className="h-96 animate-pulse bg-muted" />}>
        <LanguageCatalog
          categories={categories}
          categoryId={languageCategoryId}
          initialFilters={{
            search: get("search") ?? "",
            level: get("level") ?? "all",
            price: get("price") ?? "all",
            sort: get("sort") ?? "relevance",
            page: Number(get("page")) || 1,
          }}
          initialResult={coursesRes}
        />
      </Suspense>
    </main>
  );
}