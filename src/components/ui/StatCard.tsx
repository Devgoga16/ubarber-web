import type { LucideIcon } from "lucide-react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "../../lib/utils";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  delta?: number;
  deltaLabel?: string;
  invertDeltaColor?: boolean;
}

export function StatCard({ icon: Icon, label, value, delta, deltaLabel, invertDeltaColor }: StatCardProps) {
  const isPositive = (delta ?? 0) >= 0;
  const isGood = invertDeltaColor ? !isPositive : isPositive;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-background p-4 shadow-soft transition-shadow hover:shadow-soft-lg">
      <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-accent/[0.06] transition-transform duration-300 group-hover:scale-125" />
      <div className="relative mb-3 flex h-10 w-10 items-center justify-center rounded-xl gradient-accent shadow-soft">
        <Icon className="h-5 w-5 text-accent-foreground" />
      </div>
      <p className="font-heading text-2xl font-semibold tracking-tight text-primary">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
      {delta !== undefined && (
        <p className={cn("mt-1 flex items-center gap-1 text-xs font-medium", isGood ? "text-success" : "text-danger")}>
          {isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
          {Math.abs(delta)} {deltaLabel ?? "vs ayer"}
        </p>
      )}
    </div>
  );
}
