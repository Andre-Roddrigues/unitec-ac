"use client";

import { cn } from "@/lib/utils";
import type { Category } from "@/types";

export const ALL_CATEGORIES = "all" as const;

export function CategoryFilter({
    categories,
    active = ALL_CATEGORIES,
    onCategoryChange,
}: {
    categories: Category[];
    active?: string;
    onCategoryChange?: (categoryId: string) => void;
}) {
    return (
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filtrar por categoria">
            <button
                type="button"
                role="tab"
                aria-selected={active === ALL_CATEGORIES}
                onClick={() => onCategoryChange?.(ALL_CATEGORIES)}
                className={cn(
                    "rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200 cursor-pointer border",
                    active === ALL_CATEGORIES
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground hover:bg-muted/50",
                )}
            >
                Todos
            </button>
            {categories.map((category) => {
                const isActive = active === category.id;
                return (
                    <button
                        key={category.id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => onCategoryChange?.(category.id)}
                        className={cn(
                            "rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200 cursor-pointer border",
                            isActive
                                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                : "bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground hover:bg-muted/50",
                        )}
                    >
                        {category.name}
                    </button>
                );
            })}
        </div>
    );
}
