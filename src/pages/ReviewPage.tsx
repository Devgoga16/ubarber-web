import { useState } from "react";
import { useParams } from "react-router-dom";
import { Star, CheckCircle2 } from "lucide-react";
import { useReviewInfo, useSubmitReview } from "../hooks/useReview";
import { Button } from "../components/ui/Button";
import { Spinner } from "../components/ui/Spinner";
import { cn } from "../lib/utils";

export function ReviewPage() {
  const { token } = useParams<{ token: string }>();
  const { data, isLoading, error } = useReviewInfo(token ?? "");
  const submitReview = useSubmitReview(token ?? "");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit() {
    if (rating === 0) return;
    setSubmitError(null);
    try {
      await submitReview.mutateAsync({ rating, comment: comment.trim() || undefined });
      setDone(true);
    } catch (err: any) {
      setSubmitError(err?.response?.data?.message ?? "No se pudo enviar tu calificación");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-background p-6 shadow-soft-lg sm:p-8">
        <div className="mb-5 flex items-center gap-2.5">
          <img src="/logo-mark.png" alt="uBarber" className="h-9 w-9 object-contain" />
          <h1 className="font-heading text-lg font-semibold tracking-tight text-primary">uBarber</h1>
        </div>

        {isLoading && (
          <div className="flex justify-center py-8 text-accent">
            <Spinner />
          </div>
        )}

        {!isLoading && error && (
          <p className="text-sm text-danger">
            {(error as any)?.response?.data?.message ?? "Este enlace ya no es válido."}
          </p>
        )}

        {!isLoading && data && (data.alreadySubmitted || done) && (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success/15">
              <CheckCircle2 className="h-7 w-7 text-success" />
            </div>
            <h2 className="font-heading mb-1 text-lg font-semibold text-primary">¡Gracias por tu opinión!</h2>
            <p className="text-sm text-muted-foreground">
              Ya registramos tu calificación para {data.barberName}.
            </p>
          </div>
        )}

        {!isLoading && data && !data.alreadySubmitted && !done && (
          <>
            <p className="mb-1 text-sm text-muted-foreground">
              Tu visita a <strong className="text-primary">{data.businessName}</strong>
            </p>
            <p className="mb-5 text-sm text-muted-foreground">
              ¿Cómo te fue con <strong className="text-primary">{data.barberName}</strong>?
            </p>

            <div className="mb-5 flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  onMouseEnter={() => setHoverRating(value)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1"
                >
                  <Star
                    className={cn(
                      "h-9 w-9 transition-colors",
                      value <= (hoverRating || rating)
                        ? "fill-gold text-gold"
                        : "text-muted-foreground/30"
                    )}
                  />
                </button>
              ))}
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Cuéntanos cómo te fue (opcional)"
              maxLength={500}
              rows={3}
              className="mb-4 w-full resize-none rounded-lg border border-border bg-surface p-3 text-sm text-primary placeholder:text-muted-foreground"
            />

            {submitError && <p className="mb-3 text-sm text-danger">{submitError}</p>}

            <Button
              onClick={handleSubmit}
              loading={submitReview.isPending}
              disabled={rating === 0}
              className="w-full"
            >
              Enviar calificación
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
