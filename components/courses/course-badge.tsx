import { cn } from "@/lib/utils";

type Variant = "bestseller" | "new" | "featured" | "discount" | "neutral";

const STYLES: Record<Variant, string> = {
  bestseller: "bg-warning text-warning-foreground",
  new: "bg-primary-soft text-accent-foreground",
  featured: "bg-primary text-primary-foreground",
  discount: "bg-success text-success-foreground",
  neutral: "bg-secondary text-secondary-foreground",
};

export function CourseBadge({
  variant = "neutral",
  children,
  className,
}: {
  variant?: Variant;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        STYLES[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
