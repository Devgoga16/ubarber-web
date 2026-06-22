import { useMemo, useState } from "react";
import { Wallet } from "lucide-react";
import { useAppointments } from "../hooks/useAppointments";
import { useAuthStore } from "../store/auth";
import { PageHeader } from "../components/ui/PageHeader";
import { StatCard } from "../components/ui/StatCard";
import { CardSkeletons } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { cn } from "../lib/utils";
import { formatCurrency } from "../lib/format";

type Period = "today" | "week" | "month";

const periodLabels: Record<Period, string> = {
  today: "Hoy",
  week: "Esta semana",
  month: "Este mes",
};

function getPeriodRange(period: Period) {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  if (period === "week") {
    const dayOfWeek = start.getDay();
    const diffToMonday = (dayOfWeek + 6) % 7;
    start.setDate(start.getDate() - diffToMonday);
  } else if (period === "month") {
    start.setDate(1);
  }

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return { from: start.toISOString(), to: end.toISOString() };
}

export function CashboxPage() {
  const [period, setPeriod] = useState<Period>("today");
  const activeLocationId = useAuthStore((state) => state.activeLocationId);
  const range = getPeriodRange(period);

  const { data: allAppointments, isLoading } = useAppointments({
    ...range,
    locationId: activeLocationId ?? undefined,
  });

  const appointments = useMemo(
    () => (allAppointments ?? []).filter((a) => a.paid),
    [allAppointments]
  );

  const summary = useMemo(() => {
    const total = appointments.reduce((sum, a) => sum + a.totalPriceCents, 0);
    const byMethod = new Map<string, number>();
    for (const a of appointments) {
      const name = typeof a.paymentMethodId === "object" ? a.paymentMethodId.name : "Sin método";
      byMethod.set(name, (byMethod.get(name) ?? 0) + a.totalPriceCents);
    }
    return { total, count: appointments.length, byMethod: Array.from(byMethod.entries()) };
  }, [appointments]);

  return (
    <div>
      <PageHeader title="Caja" description="Ingresos por citas completadas." />

      <div className="mb-4 flex gap-1 rounded-lg bg-surface p-1 sm:w-fit">
        {(Object.keys(periodLabels) as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={cn(
              "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors sm:flex-none",
              period === p ? "bg-background text-primary shadow-sm" : "text-muted-foreground"
            )}
          >
            {periodLabels[p]}
          </button>
        ))}
      </div>

      {isLoading && <CardSkeletons count={3} />}

      {!isLoading && (
        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard icon={Wallet} label="Total cobrado" value={formatCurrency(summary.total)} />
          {summary.byMethod.map(([name, amount]) => (
            <StatCard key={name} icon={Wallet} label={name} value={formatCurrency(amount)} />
          ))}
        </div>
      )}

      {!isLoading && (
        <div className="mt-6 rounded-2xl border border-border bg-background shadow-soft p-4">
          <h2 className="mb-3 font-heading font-semibold text-primary">
            Pagos registrados ({summary.count})
          </h2>

          {appointments.length === 0 && (
            <EmptyState icon={Wallet} title="Sin pagos registrados en este periodo" />
          )}

          <div className="flex flex-col gap-2">
            {appointments.map((appointment) => {
              const client = typeof appointment.clientId === "object" ? appointment.clientId : null;
              const methodName =
                typeof appointment.paymentMethodId === "object"
                  ? appointment.paymentMethodId.name
                  : "Sin método";
              return (
                <div
                  key={appointment._id}
                  className="flex items-center justify-between gap-2 rounded-lg px-2 py-2 hover:bg-surface"
                >
                  <div>
                    <p className="text-sm font-medium text-primary">{client?.name ?? "Cliente"}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(appointment.startsAt).toLocaleDateString("es", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}{" "}
                      · {methodName}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-primary">
                    {formatCurrency(appointment.totalPriceCents)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
