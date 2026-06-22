import { cn } from "../../lib/utils";

export function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-xs font-medium",
        active ? "bg-success/15 text-success" : "bg-muted-foreground/15 text-muted-foreground"
      )}
    >
      {active ? "Activo" : "Inactivo"}
    </span>
  );
}
