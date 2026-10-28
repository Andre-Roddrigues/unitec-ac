"use client";

import { useMemo, useState } from "react";
import { Loader2, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CourseRating } from "@/components/courses/course-rating";
import { CourseReview } from "@/components/courses/course-instructor";
import { deleteCourseReview, submitCourseReview } from "@/actions/review-actions";
import { cn } from "@/lib/utils";
import type { Review } from "@/types";

export function CourseReviewForm({
  courseId,
  initialReviews,
  initialRating,
  initialCount,
  canReview = false,
  myReview: initialMyReview = null,
}: {
  courseId: string;
  initialReviews: Review[];
  initialRating: number;
  initialCount: number;
  /** Só quem comprou o curso pode avaliar — é o que o servidor exige. */
  canReview?: boolean;
  /** Avaliação que este aluno já deixou, se alguma. */
  myReview?: Review | null;
}) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [myReview, setMyReview] = useState<Review | null>(initialMyReview);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [removing, setRemoving] = useState(false);

  const avg = useMemo(() => {
    if (reviews.length === 0) return initialRating;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return sum / reviews.length;
  }, [reviews, initialRating]);

  const submit = async () => {
    if (rating === 0) {
      toast.error("Selecione uma nota de 1 a 5 estrelas.");
      return;
    }
    setSending(true);
    const res = await submitCourseReview(courseId, rating, comment.trim() || undefined);
    setSending(false);
    if (res.success && res.data) {
      setReviews((prev) => [res.data!, ...prev]);
      setMyReview(res.data);
      setRating(0);
      setComment("");
      toast.success("Avaliação submetida com sucesso!");
    } else {
      toast.error(res.message || "Falha ao submeter a avaliação");
    }
  };

  const remove = async () => {
    if (!myReview || removing) return;
    setRemoving(true);
    const res = await deleteCourseReview(courseId, myReview.id);
    setRemoving(false);

    if (res.success) {
      setReviews((prev) => prev.filter((r) => r.id !== myReview.id));
      setMyReview(null);
      toast.success("Avaliação removida");
    } else {
      toast.error(res.message || "Falha ao remover a avaliação");
    }
  };

  const displayCount = reviews.length || initialCount;

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Avaliações dos alunos
        </h2>
        <CourseRating value={avg} count={displayCount} size="md" />
      </div>

      {/* O formulário estava sempre visível, mesmo a quem nunca comprou o
          curso — e o servidor só aceita avaliações de alunos matriculados. */}
      {myReview ? (
        <div className="space-y-3 rounded-xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold">A sua avaliação</p>
            <Button
              variant="outline"
              size="sm"
              onClick={remove}
              disabled={removing}
              className="cursor-pointer"
            >
              {removing ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
              Remover
            </Button>
          </div>
          <CourseRating value={myReview.rating} count={0} size="md" />
          {myReview.comment && (
            <p className="text-sm leading-relaxed text-muted-foreground">{myReview.comment}</p>
          )}
        </div>
      ) : !canReview ? (
        <p className="rounded-xl border border-dashed border-border bg-muted/30 p-5 text-sm text-muted-foreground">
          Só quem frequenta o curso pode avaliá-lo.
        </p>
      ) : (
      <div className="space-y-3 rounded-xl border border-border bg-card p-5">
        <p className="text-sm font-semibold">A sua avaliação</p>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(star)}
              aria-label={`${star} estrelas`}
              className="cursor-pointer"
            >
              <Star
                className={cn(
                  "size-8 transition-colors",
                  (hover || rating) >= star
                    ? "fill-warning text-warning"
                    : "text-muted-foreground/40",
                )}
              />
            </button>
          ))}
        </div>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Deixe o seu comentário (opcional)…"
          rows={3}
          maxLength={1000}
        />
        <Button
          className="cursor-pointer"
          onClick={submit}
          disabled={sending || rating === 0}
        >
          {sending && <Loader2 className="size-4 animate-spin" />}
          Submeter avaliação
        </Button>
      </div>
      )}

      {reviews.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2">
          {reviews.map((r) => (
            <CourseReview key={r.id} review={r} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Seja o primeiro a avaliar este curso.
        </p>
      )}
    </section>
  );
}
