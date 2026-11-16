import { Suspense } from "react";
import { HeroCourses } from "@/components/hero/hero-courses";
import CoursesList, { CoursesListSkeleton } from "@/components/sections/courses/coursesList";
import { getCourses } from "@/actions/courses-actions";
import { getCategories } from "@/actions/categories-actions";
import { catalogQueryString, parseCatalogParams, toGetCoursesFilters } from "@/lib/catalog";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Cursos Online | Unitec Academy",
    description:
        "Explore o catálogo completo de cursos online da Unitec Academy. Formação prática em Administração, Informática, Saúde e mais.",
};

interface CoursesPageProps {
    searchParams: Promise<{
        search?: string;
        category?: string;
        level?: string;
        price?: string;
        page?: string;
        sort?: string;
    }>;
}

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
    
    // ✅ Forçar sempre o formato ONLINE
    const forcedFilters = { ...filters, format: "ONLINE" as const };

    const [result, categoriesResult] = await Promise.all([
        getCourses(toGetCoursesFilters(forcedFilters)),
        getCategories(),
    ]);

    return (
        <div>
            <HeroCourses totalCourses={result.data?.total} />
            <CoursesList
                categories={categoriesResult.data ?? []}
                initialKey={catalogQueryString(forcedFilters)}
                initialResult={result}
            />
        </div>
    );
}