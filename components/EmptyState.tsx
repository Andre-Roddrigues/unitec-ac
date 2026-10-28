import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
    icon: Icon = Inbox,
    title,
    description,
    action,
    className,
}: {
    icon?: React.ComponentType<{ className?: string }>;
    title: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center",
                className,
            )}
        >
            <div className="grid size-12 place-items-center rounded-xl bg-primary-soft text-primary">
                <Icon className="size-6" />
            </div>
            <h3 className="text-base font-semibold text-foreground">{title}</h3>
            {description && (
                <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p>
            )}
            {action && <div className="pt-2">{action}</div>}
        </div>
    );
}
