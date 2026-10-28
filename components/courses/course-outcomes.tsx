import { Check, CircleCheck, CircleDot } from "lucide-react";
import type { LearningOutcome, Requirement } from "@/types";

export function CourseOutcomes({ outcomes }: { outcomes: LearningOutcome[] }) {
  if (!outcomes || outcomes.length === 0) return null;

  return (
    <ul className="grid gap-3.5 sm:grid-cols-2 pt-1">
      {outcomes.map((o) => (
        <li key={o.id} className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
          <CircleCheck className="mt-1 size-4 shrink-0 text-primary" />
          <span>{o.description || o.text}</span>
        </li>
      ))}
    </ul>
  );
}

export function CourseRequirements({ requirements }: { requirements: Requirement[] }) {
  if (!requirements || requirements.length === 0) return null;

  return (
    <ul className="space-y-3 pt-1">
      {requirements.map((r) => (
        <li key={r.id} className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
          <CircleDot className="mt-1 size-3.5 shrink-0 text-primary" />
          <span>{r.description || r.text}</span>
        </li>
      ))}
    </ul>
  );
}
