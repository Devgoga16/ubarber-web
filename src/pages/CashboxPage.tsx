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

  interface CashEntry {
    key: string;
    label: "Servicio" | "Adelanto";
    clientName: string;
    date: string;
    methodName: string;
    amountCents: number;
  }

  const entries = useMemo(() => {
    const list: CashEntry[] = [];
    for (const a of allAppointments ?? []) {
      const client = typeof a.clientId === "object" ? a.clientId : null;

      // Adelanto cobrado online (comprobante ya confirmado por el dueño) — es plata real recibida.
      if (a.depositStatus === "confirmed" && a.depositMethod === "proof_photo" && a.depositAmountCents) {
        const methodName =
          typeof a.depositPaymentMethodId === "object" ? a.depositPaymentMethodId.name : "Sin método";
        list.push({
          key: `${a._id}-deposit`,
          label: "Adelanto",
          clientName: client?.name ?? "Cliente",
          date: a.depositConfirmedAt ?? a.startsAt,
          methodName,
          amountCents: a.depositAmountCents,
        });
      }

      if (a.paid) {
        const methodName =
          typeof a.paymentMethodId === "object" ? a.paymentMethodId.name : "Sin método";
        list.push({
          key: `${a._id}-payment`,
          label: "Servicio",
          clientName: client?.name ?? "Cliente",
          date: a.paidAt ?? a.startsAt,
          methodName,
          amountCents: a.finalPaymentAmountCents ?? a.totalPriceCents,
        });
      }
    }
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [allAppointments]);

  const summary = useMemo(() => {
    const total = entries.reduce((sum, e) => sum + e.amountCents, 0);
    const byMethod = new Map<string, number>();
    for (const e of entries) {
      byMethod.set(e.methodName, (byMethod.get(e.methodName) ?? 0) + e.amountCents);
    }
    return { total, count: entries.length, byMethod: Array.from(byMethod.entries()) };
  }, [entries]);

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

          {entries.length === 0 && (
            <EmptyState icon={Wallet} title="Sin pagos registrados en este periodo" />
          )}

          <div className="flex flex-col gap-2">
            {entries.map((entry) => (
              <div
                key={entry.key}
                className="flex items-center justify-between gap-2 rounded-lg px-2 py-2 hover:bg-surface"
              >
                <div>
                  <p className="text-sm font-medium text-primary">{entry.clientName}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(entry.date).toLocaleDateString("es", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}{" "}
                    · {entry.methodName} · {entry.label}
                  </p>
                </div>
                <p className="text-sm font-medium text-primary">{formatCurrency(entry.amountCents)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
