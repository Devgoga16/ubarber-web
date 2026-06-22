import { MapPin } from "lucide-react";
import { useLocations } from "../../hooks/useLocations";
import { useAuthStore } from "../../store/auth";
import { cn } from "../../lib/utils";

export function LocationSwitcher({ dark }: { dark?: boolean }) {
  const { data: locations } = useLocations();
  const activeLocationId = useAuthStore((state) => state.activeLocationId);
  const setActiveLocation = useAuthStore((state) => state.setActiveLocation);

  if (!locations || locations.length < 2) return null;

  return (
    <div
      className={cn(
        "mb-4 flex items-center gap-2 rounded-lg border px-3 py-2",
        dark ? "border-white/10 bg-white/5" : "border-border bg-surface"
      )}
    >
      <MapPin className={cn("h-4 w-4 shrink-0", dark ? "text-accent-soft" : "text-accent")} />
      <select
        value={activeLocationId ?? ""}
        onChange={(e) => setActiveLocation(e.target.value || null)}
        className={cn(
          "w-full bg-transparent text-sm font-medium outline-none",
          dark ? "text-primary-foreground [&>option]:text-primary" : "text-primary"
        )}
      >
        <option value="">Todas las sedes</option>
        {locations.map((location) => (
          <option key={location._id} value={location._id}>
            {location.name}
          </option>
        ))}
      </select>
    </div>
  );
}
