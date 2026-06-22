import { Link } from "react-router-dom";
import { Crown } from "lucide-react";
import { useMySubscription } from "../../hooks/useDashboard";

export function PlanCard() {
  const { data: subscription } = useMySubscription();

  if (!subscription) return null;

  const plan = typeof subscription.planId === "object" ? subscription.planId : null;
  const periodEnd = new Date(subscription.currentPeriodEnd).toLocaleDateString("es", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="relative mb-4 overflow-hidden rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="absolute -right-4 -top-8 h-16 w-16 rounded-full bg-gold/20" />
      <div className="relative mb-1 flex items-center gap-2">
        <Crown className="h-4 w-4 text-gold" />
        <p className="text-sm font-semibold text-primary-foreground">{plan?.name ?? "Plan"}</p>
      </div>
      <p className="relative mb-2 text-xs text-primary-foreground/60">
        {subscription.status === "trial" ? "Periodo de prueba hasta" : "Activo hasta"} {periodEnd}
      </p>
      <Link
        to="/dashboard"
        className="relative inline-flex w-full items-center justify-center rounded-lg bg-gold px-3 py-1.5 text-xs font-semibold text-gold-foreground transition-opacity hover:opacity-90"
      >
        Ver plan
      </Link>
    </div>
  );
}
