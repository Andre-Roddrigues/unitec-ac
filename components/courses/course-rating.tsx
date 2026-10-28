import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface CourseRatingProps {
    value: number;
    count?: number;
    size?: "sm" | "md" | "lg";
    className?: string;
}

const SIZES = { sm: "size-3.5", md: "size-4", lg: "size-5" } as const;

export function CourseRating({ value, count, size = "sm", className }: CourseRatingProps) {
    return (
        <div className={cn("flex items-center gap-1.5", className)}>
            <span className="text-sm font-semibold tabular-nums text-warning-foreground dark:text-warning">
                {value.toFixed(1)}
            </span>
            <div
                className="flex items-center gap-0.5"
                role="img"
                aria-label={`Rated ${value.toFixed(1)} out of 5`}
            >
                {[0, 1, 2, 3, 4].map((i) => (
                    <Star
                        key={i}
                        className={cn(
                            SIZES[size],
                            i < Math.round(value) ? "fill-warning text-warning" : "text-muted-foreground/35",
                        )}
                    />
                ))}
            </div>
            {count !== undefined && (
                <span className="text-xs text-muted-foreground">({count.toLocaleString()})</span>
            )}
        </div>
    );
}
