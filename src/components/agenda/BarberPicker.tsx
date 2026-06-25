import { useState } from "react";
import { Star, User, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "../../lib/utils";
import type { PublicBarber } from "../../hooks/usePublicBooking";

interface BarberPickerProps {
  barbers: PublicBarber[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function BarberPicker({ barbers, selectedId, onSelect }: BarberPickerProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-2">
      {barbers.map((barber) => {
        const isSelected = selectedId === barber._id;
        const isExpanded = expandedId === barber._id;
        const hasReviews = barber.ratingCount > 0;

        return (
          <div
            key={barber._id}
            className={cn(
              "rounded-lg border p-2.5 transition-colors",
              isSelected ? "border-accent bg-accent/10" : "border-border"
            )}
          >
            <div className="flex cursor-pointer items-center gap-3" onClick={() => onSelect(barber._id)}>
              <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-surface">
                {barber.photo ? (
                  <img src={barber.photo} alt={barber.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <User className="h-5 w-5 text-accent/40" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-primary">{barber.name}</p>
                {hasReviews ? (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                    {barber.ratingAverage?.toFixed(1)} ({barber.ratingCount})
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Sin calificaciones aún</p>
                )}
              </div>

              {hasReviews && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedId(isExpanded ? null : barber._id);
                  }}
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-surface"
                >
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              )}
            </div>

            {isExpanded && hasReviews && (
              <div className="mt-2.5 flex flex-col gap-2 border-t border-border pt-2.5">
                {barber.recentReviews.map((review, i) => (
                  <div key={i} className="text-xs">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, starIdx) => (
                        <Star
                          key={starIdx}
                          className={cn(
                            "h-3 w-3",
                            starIdx < review.rating
                              ? "fill-gold text-gold"
                              : "text-muted-foreground/30"
                          )}
                        />
                      ))}
                      <span className="ml-1 font-medium text-primary">
                        {review.clientName.split(" ")[0]}
                      </span>
                    </div>
                    {review.comment && <p className="mt-0.5 text-muted-foreground">{review.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {barbers.length === 0 && (
        <p className="p-3 text-center text-sm text-muted-foreground">No hay barberos disponibles.</p>
      )}
    </div>
  );
}
