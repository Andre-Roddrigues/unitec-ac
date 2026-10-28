import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
    rating: number;
    max?: number;
    className?: string;
}

export function StarRating({ rating = 0, max = 5, className }: StarRatingProps) {
    return (
        <div className={cn("flex items-center gap-0.5", className)}>
            {Array.from({ length: max }).map((_, i) => {
                const filled = i < Math.round(rating);
                return (
                    <Star
                        key={i}
                        className={cn(
                            "h-3.5 w-3.5",
                            filled
                                ? "fill-[#FFD700] text-[#FFD700]"
                                : "fill-transparent text-muted-foreground/30"
                        )}
                    />
                );
            })}
        </div>
    );
}