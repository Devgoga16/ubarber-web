import { useMemo, useState } from "react";
import { Search, Star, Tag, Check } from "lucide-react";
import { cn } from "../../lib/utils";
import { formatCurrency } from "../../lib/format";

interface PickableService {
  _id: string;
  name: string;
  durationMinutes: number;
  priceCents: number;
  photo?: string;
}

interface ServicePickerProps {
  services: PickableService[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  favoriteIds: string[];
  onToggleFavorite?: (id: string) => void;
  favoriteLimit?: number;
}

export function ServicePicker({
  services,
  selectedIds,
  onToggleSelect,
  favoriteIds,
  onToggleFavorite,
  favoriteLimit = 5,
}: ServicePickerProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const list = query ? services.filter((s) => s.name.toLowerCase().includes(query)) : services;
    return [...list].sort((a, b) => {
      const aFav = favoriteIds.includes(a._id) ? 0 : 1;
      const bFav = favoriteIds.includes(b._id) ? 0 : 1;
      if (aFav !== bFav) return aFav - bFav;
      return a.name.localeCompare(b.name);
    });
  }, [services, search, favoriteIds]);

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar servicio..."
          className="w-full rounded-lg border border-border bg-surface py-2.5 pl-9 pr-3 text-base text-primary placeholder:text-muted-foreground"
        />
      </div>

      <div className="flex max-h-64 flex-col gap-1.5 overflow-y-auto rounded-lg border border-border bg-background p-1.5">
        {filtered.map((service) => {
          const isSelected = selectedIds.includes(service._id);
          const isFavorite = favoriteIds.includes(service._id);
          const favoriteDisabled = !isFavorite && favoriteIds.length >= favoriteLimit;

          return (
            <div
              key={service._id}
              onClick={() => onToggleSelect(service._id)}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-lg border p-2 transition-colors",
                isSelected ? "border-accent bg-accent/10" : "border-transparent hover:bg-surface"
              )}
            >
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-surface">
                {service.photo ? (
                  <img src={service.photo} alt={service.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Tag className="h-4 w-4 text-accent/40" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-primary">{service.name}</p>
                <p className="text-xs text-muted-foreground">
                  {service.durationMinutes} min · {formatCurrency(service.priceCents)}
                </p>
              </div>

              {onToggleFavorite && (
                <button
                  type="button"
                  disabled={favoriteDisabled}
                  title={
                    favoriteDisabled
                      ? `Solo puedes tener ${favoriteLimit} favoritos`
                      : isFavorite
                        ? "Quitar de favoritos"
                        : "Marcar como favorito"
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(service._id);
                  }}
                  className={cn(
                    "rounded-md p-1.5 transition-colors",
                    isFavorite ? "text-gold" : "text-muted-foreground/50 hover:text-gold",
                    favoriteDisabled && !isFavorite && "cursor-not-allowed opacity-40"
                  )}
                >
                  <Star className={cn("h-4 w-4", isFavorite && "fill-gold")} />
                </button>
              )}

              {isSelected && <Check className="h-4 w-4 shrink-0 text-accent" />}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <p className="p-3 text-center text-sm text-muted-foreground">No se encontraron servicios.</p>
        )}
      </div>
    </div>
  );
}
