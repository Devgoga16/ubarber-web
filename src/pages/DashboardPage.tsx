import { Link } from "react-router-dom";
import { CalendarDays, Users, DollarSign, Clock3, Plus } from "lucide-react";
import { useDashboardStats } from "../hooks/useDashboard";
import { useAuthStore } from "../store/auth";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/Button";
import { StatCard } from "../components/ui/StatCard";
import { CardSkeletons } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { formatCurrency } from "../lib/format";

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  in_progress: "En curso",
  completed: "Completada",
  cancelled: "Cancelada",
  no_show: "No asistió",
};

const statusColors: Record<string, string> = {
  pending: "bg-warning/15 text-warning",
  in_progress: "bg-info/15 text-info",
  completed: "bg-success/15 text-success",
  cancelled: "bg-danger/15 text-danger",
  no_show: "bg-danger/15 text-danger",
};

export function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const { data: stats, isLoading } = useDashboardStats();

  return (
    <div>
      <PageHeader
        title={`¡Hola, ${user?.name?.split(" ")[0] ?? ""}! 👋`}
        description="Bienvenido al panel de control de tu barbería."
        action={
          <Link to="/agenda">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nueva cita
            </Button>
          </Link>
        }
      />

      {isLoading && <CardSkeletons count={4} />}

      {stats && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={CalendarDays}
            label="Citas hoy"
            value={String(stats.todayAppointmentsCount)}
            delta={stats.todayAppointmentsDelta}
          />
          <StatCard icon={Users} label="Clientes" value={String(stats.activeClientsCount)} />
          <StatCard
            icon={DollarSign}
            label="Ingresos hoy"
            value={formatCurrency(stats.todayRevenueCents)}
            delta={Math.round(stats.todayRevenueDeltaCents / 100)}
          />
          <StatCard
            icon={Clock3}
            label="Pendientes"
            value={String(stats.pendingCount)}
            delta={stats.pendingDelta}
            invertDeltaColor
          />
        </div>
      )}

      {stats && (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-background shadow-soft p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-heading font-semibold text-primary">Citas recientes</h2>
              <Link to="/agenda" className="text-sm font-medium text-accent">
                Ver todas
              </Link>
            </div>

            {stats.recentAppointments.length === 0 && (
              <EmptyState icon={CalendarDays} title="Sin citas todavía" />
            )}

            <div className="flex flex-col gap-2">
              {stats.recentAppointments.map((appointment) => {
                const client = typeof appointment.clientId === "object" ? appointment.clientId : null;
                const service =
                  Array.isArray(appointment.serviceIds) && typeof appointment.serviceIds[0] === "object"
                    ? (appointment.serviceIds[0] as { name: string }).name
                    : null;
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
                        })}{" "}
                        · {service ?? ""}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusColors[appointment.status]}`}
                    >
                      {statusLabels[appointment.status]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-background shadow-soft p-4">
            <h2 className="mb-3 font-heading font-semibold text-primary">Servicios más populares</h2>

            {stats.popularServices.length === 0 && (
              <EmptyState icon={DollarSign} title="Aún no hay datos este mes" />
            )}

            <div className="flex flex-col gap-3">
              {stats.popularServices.map((service) => (
                <div key={service.serviceId} className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-primary">{service.name}</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(service.priceCents)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-20 overflow-hidden rounded-full bg-surface">
                      <div className="h-full rounded-full bg-accent" style={{ width: `${service.percentage}%` }} />
                    </div>
                    <span className="w-10 text-right text-sm font-medium text-primary">
                      {service.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
