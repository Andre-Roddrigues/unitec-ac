import { Suspense } from "react";
import { HeroCourses } from "@/components/hero/hero-courses";
import CoursesList, { CoursesListSkeleton } from "@/components/sections/courses/coursesList";
import { getCourses } from "@/actions/courses-actions";
import { getCategories } from "@/actions/categories-actions";
import { catalogQueryString, parseCatalogParams, toGetCoursesFilters } from "@/lib/catalog";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Cursos | Unitec Academy",
    description:
        "Explore o catálogo completo de cursos profissionais da Unitec Academy. Formação prática em Administração, Informática, Saúde e mais.",
};

interface CoursesPageProps {
    searchParams: Promise<{
        search?: string;
        category?: string;
        level?: string;
        format?: string;
        price?: string;
        page?: string;
        sort?: string;
    }>;
}

/**
 * O esqueleto entra logo e o catálogo chega em streaming. É um `<Suspense>`
 * aqui e não um `loading.tsx` na pasta porque esse também cobriria
 * `/cursos/[slug]` — abrir um curso mostraria o esqueleto do catálogo.
 */
export default function CoursesPage({ searchParams }: CoursesPageProps) {
    return (
        <Suspense
            fallback={
                <div>
                    <HeroCourses />
                    <CoursesListSkeleton />
                </div>
            }
        >
            <CoursesCatalog searchParams={searchParams} />
        </Suspense>
    );
}

async function CoursesCatalog({ searchParams }: CoursesPageProps) {
    const params = await searchParams;
    const filters = parseCatalogParams((key) => params[key as keyof typeof params]);

    // Só a primeira resposta vem daqui: as mudanças de filtro seguintes são
    // pedidas pelo próprio `CoursesList` a `/api/courses`, com cache.
    const [result, categoriesResult] = await Promise.all([
        getCourses(toGetCoursesFilters(filters)),
        getCategories(),
    ]);

    return (
        <div>
            <HeroCourses totalCourses={result.data?.total} />
            <CoursesList
                categories={categoriesResult.data ?? []}
                initialKey={catalogQueryString(filters)}
                initialResult={result}
            />
        </div>
    );
}
