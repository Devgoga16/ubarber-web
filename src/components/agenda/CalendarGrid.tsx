import { cn } from "../../lib/utils";
import type { Appointment, AppointmentStatus, Barber } from "../../api/types";

const DAY_START_HOUR = 8;
const DAY_END_HOUR = 20;
const HOUR_HEIGHT = 64;

const statusBlockColors: Record<AppointmentStatus, string> = {
  pending: "bg-warning/20 border-warning text-warning",
  in_progress: "bg-accent/20 border-accent text-accent",
  completed: "bg-success/20 border-success text-success",
  cancelled: "bg-danger/10 border-danger/40 text-danger line-through",
  no_show: "bg-danger/10 border-danger/40 text-danger",
};

interface CalendarGridProps {
  barbers: Barber[];
  appointments: Appointment[];
  onSelectAppointment?: (appointment: Appointment) => void;
}

function minutesSinceDayStart(date: Date) {
  return (date.getHours() - DAY_START_HOUR) * 60 + date.getMinutes();
}

function barberName(barber: Barber) {
  return typeof barber.userId === "object" ? barber.userId.name : "Barbero";
}

export function CalendarGrid({ barbers, appointments, onSelectAppointment }: CalendarGridProps) {
  const hours = Array.from({ length: DAY_END_HOUR - DAY_START_HOUR + 1 }, (_, i) => DAY_START_HOUR + i);
  const totalHeight = (DAY_END_HOUR - DAY_START_HOUR) * HOUR_HEIGHT;

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-background shadow-soft">
      <div className="flex min-w-[640px]">
        <div className="w-16 shrink-0 border-r border-border">
          <div className="h-12 border-b border-border" />
          {hours.map((hour) => (
            <div
              key={hour}
              className="flex items-start justify-end pr-2 text-xs text-muted-foreground"
              style={{ height: HOUR_HEIGHT }}
            >
              {String(hour).padStart(2, "0")}:00
            </div>
          ))}
        </div>

        {barbers.map((barber) => {
          const barberAppointments = appointments.filter((a) => a.barberId === barber._id);
          return (
            <div key={barber._id} className="flex-1 border-r border-border last:border-r-0">
              <div className="flex h-12 items-center justify-center gap-2 border-b border-border px-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface text-xs font-medium text-primary">
                  {barberName(barber).charAt(0)}
                </span>
                <span className="truncate text-sm font-medium text-primary">{barberName(barber)}</span>
              </div>

              <div className="relative" style={{ height: totalHeight }}>
                {hours.slice(0, -1).map((hour) => (
                  <div
                    key={hour}
                    className="border-b border-border/60"
                    style={{ height: HOUR_HEIGHT }}
                  />
                ))}

                {barberAppointments.map((appointment) => {
                  const start = new Date(appointment.startsAt);
                  const end = new Date(appointment.endsAt);
                  const top = (minutesSinceDayStart(start) / 60) * HOUR_HEIGHT;
                  const height = Math.max(
                    ((end.getTime() - start.getTime()) / 60000 / 60) * HOUR_HEIGHT,
                    28
                  );
                  const client = typeof appointment.clientId === "object" ? appointment.clientId : null;
                  const service =
                    Array.isArray(appointment.serviceIds) && typeof appointment.serviceIds[0] === "object"
                      ? (appointment.serviceIds[0] as { name: string }).name
                      : "";

                  return (
                    <button
                      key={appointment._id}
                      onClick={() => onSelectAppointment?.(appointment)}
                      className={cn(
                        "absolute left-1 right-1 overflow-hidden rounded-md border px-2 py-1 text-left text-xs transition-shadow hover:shadow-sm",
                        statusBlockColors[appointment.status]
                      )}
                      style={{ top, height }}
                    >
                      <p className="truncate font-medium">
                        {start.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })} ·{" "}
                        {client?.name ?? "Cliente"}
                      </p>
                      {height > 36 && <p className="truncate opacity-80">{service}</p>}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {barbers.length === 0 && (
          <div className="flex flex-1 items-center justify-center py-10 text-sm text-muted-foreground">
            No hay barberos para mostrar.
          </div>
        )}
      </div>
    </div>
  );
}
