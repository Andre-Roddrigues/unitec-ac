import { Suspense } from "react";
import { HeroCourses } from "@/components/hero/hero-courses";
import PresencialCoursesList, {
    
    PresencialCoursesListSkeleton,
} from "@/components/courses/presencial-courses-list";
import { getCourses } from "@/actions/courses-actions";
import { getCategories } from "@/actions/categories-actions";
import { catalogQueryString, parseCatalogParams, toGetCoursesFilters } from "@/lib/catalog";
import type { Metadata } from "next";
import { HeroPresencial } from "@/components/hero/hero-course-prensencial";

export const metadata: Metadata = {
    title: "Cursos Presenciais | Unitec Academy",
    description:
        "Cursos presenciais da Unitec Academy - formação prática com acompanhamento em sala, em Administração, Informática, Saúde e mais.",
};

const PRESENCIAL_FORMAT = "PRESENCIAL" as const;

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

export default function PresencialCoursesPage({ searchParams }: CoursesPageProps) {
    return (
        <Suspense
            fallback={
                <div>
                    <HeroCourses />
                    <PresencialCoursesListSkeleton />
                </div>
            }
        >
            <PresencialCoursesCatalog searchParams={searchParams} />
        </Suspense>
    );
}

async function PresencialCoursesCatalog({ searchParams }: CoursesPageProps) {
    const params = await searchParams;

    // Lê tudo do URL mas força sempre format=PRESENCIAL.
    const filters = {
        ...parseCatalogParams((key) => params[key as keyof typeof params]),
        format: PRESENCIAL_FORMAT,
    };

    const [result, categoriesResult] = await Promise.all([
        getCourses(toGetCoursesFilters(filters)),
        getCategories(),
    ]);

    return (
        <div>
            <HeroPresencial totalCourses={result.data?.total} />
            <PresencialCoursesList
                categories={categoriesResult.data ?? []}
                // a chave já leva format=PRESENCIAL porque != DEFAULT_FORMAT ("all")
                initialKey={catalogQueryString(filters)}
                initialResult={result}
            />
        </div>
    );
}