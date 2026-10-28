"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ALL_CATEGORIES } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

export function CategoryCarousel({
    categories,
    active = ALL_CATEGORIES,
    onCategoryChange,
}: {
    categories: Category[];
    active?: string;
    onCategoryChange?: (categoryId: string) => void;
}) {
    const trackRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const updateScrollState = useCallback(() => {
        const el = trackRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 4);
        setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    }, []);

    useEffect(() => {
        updateScrollState();
        const el = trackRef.current;
        if (!el) return;
        el.addEventListener("scroll", updateScrollState, { passive: true });
        const ro = new ResizeObserver(updateScrollState);
        ro.observe(el);
        return () => {
            el.removeEventListener("scroll", updateScrollState);
            ro.disconnect();
        };
    }, [updateScrollState, categories.length]);

    const scrollBy = (dir: 1 | -1) => {
        trackRef.current?.scrollBy({ left: dir * 240, behavior: "smooth" });
    };

    return (
        <div className="relative">
            {/* Seta esquerda */}
            {canScrollLeft && (
                <button
                    type="button"
                    onClick={() => scrollBy(-1)}
                    aria-label="Ver categorias anteriores"
                    className="absolute left-0 top-1/2 z-10 -translate-y-1/2 -translate-x-1 rounded-full border border-border bg-card p-1.5 shadow-md transition-colors hover:bg-muted cursor-pointer"
                >
                    <ChevronLeft className="size-3.5" />
                </button>
            )}

            <div
                ref={trackRef}
                role="tablist"
                aria-label="Filtrar por categoria"
                className="flex gap-2 overflow-x-auto scroll-smooth pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                <CategoryPill
                    active={active === ALL_CATEGORIES}
                    onClick={() => onCategoryChange?.(ALL_CATEGORIES)}
                >
                    Todos
                </CategoryPill>
                {categories.map((category) => (
                    <CategoryPill
                        key={category.id}
                        active={active === category.id}
                        onClick={() => onCategoryChange?.(category.id)}
                    >
                        {category.name}
                    </CategoryPill>
                ))}
            </div>

            {/* Seta direita */}
            {canScrollRight && (
                <button
                    type="button"
                    onClick={() => scrollBy(1)}
                    aria-label="Ver mais categorias"
                    className="absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-1 rounded-full border border-border bg-card p-1.5 shadow-md transition-colors hover:bg-muted cursor-pointer"
                >
                    <ChevronRight className="size-3.5" />
                </button>
            )}
        </div>
    );
}

function CategoryPill({
    active,
    onClick,
    children,
}: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            role="tab"
            aria-selected={active}
            onClick={onClick}
            className={cn(
                "shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-200 cursor-pointer",
                active
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:bg-muted/50 hover:text-foreground",
            )}
        >
            {children}
        </button>
    );
}