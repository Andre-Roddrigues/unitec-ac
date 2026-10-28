import { CatalogCourseCard } from "./catalog-course-card";
import { EmptyState } from "@/components/EmptyState";
import { SkeletonCard } from "@/components/SkeletonCard";
import { cn } from "@/lib/utils";
import type { CourseWithRelations } from "@/types";

type GridColumns = 3 | 4;

function gridClass(columns: GridColumns) {
    return cn("grid gap-5 sm:grid-cols-2", columns === 3 ? "lg:grid-cols-3" : "lg:grid-cols-3 xl:grid-cols-4");
}

// A grelha do catálogo (`/cursos`) e a de "Cursos Relacionados" usam o cartão
// rico. O `CourseCard` mais simples ficou reservado às secções da homepage,
// que o importam directamente.
export function CourseGrid({
    courses,
    columns = 3,
    emptyTitle = "Nenhum curso encontrado",
    emptyDescription = "Tente remover um filtro ou pesquisar por algo mais amplo.",
    emptyAction,
}: {
    courses: CourseWithRelations[];
    columns?: GridColumns;
    emptyTitle?: string;
    emptyDescription?: string;
    emptyAction?: React.ReactNode;
}) {
    if (!courses.length) {
        return <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />;
    }

    return (
        <div className={gridClass(columns)}>
            {courses.map((course) => (
                <CatalogCourseCard key={course.id} course={course} />
            ))}
        </div>
    );
}

/** Mesma grelha, com cartões-esqueleto do tamanho do `CatalogCourseCard`. */
export function CourseGridSkeleton({ columns = 3, count = 8 }: { columns?: GridColumns; count?: number }) {
    return (
        <div aria-hidden="true" className={gridClass(columns)}>
            {Array.from({ length: count }, (_, index) => (
                <SkeletonCard key={index} />
            ))}
        </div>
    );
}
