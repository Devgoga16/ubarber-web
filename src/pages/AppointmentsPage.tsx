import { useRef, useState, type FormEvent } from "react";
import {
  Plus,
  Clock,
  ChevronLeft,
  ChevronRight,
  List,
  LayoutGrid,
  X,
  Camera,
  Wallet,
  ShieldCheck,
  ThumbsUp,
  ThumbsDown,
  Image as ImageIcon,
} from "lucide-react";
import {
  useAppointments,
  useCreateAppointment,
  useUpdateAppointmentStatus,
  useRegisterAppointmentPayment,
} from "../hooks/useAppointments";
import {
  usePendingConfirmations,
  useConfirmAvailability,
  useRejectAvailability,
  useConfirmDeposit,
  useRejectDeposit,
} from "../hooks/useAppointmentConfirmations";
import { useLocations } from "../hooks/useLocations";
import { useBarbers, useSetBarberFavoriteServices, useSetMyFavoriteServices } from "../hooks/useBarbers";
import { useMyBarberProfile } from "../hooks/useBarberSelf";
import { useClients } from "../hooks/useClients";
import { useServices } from "../hooks/useServices";
import { usePaymentMethods } from "../hooks/usePaymentMethods";
import { useAuthStore } from "../store/auth";
import { Modal } from "../components/ui/Modal";
import { Field, Input } from "../components/ui/Field";
import { Button } from "../components/ui/Button";
import { IconButton } from "../components/ui/IconButton";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { PageHeader } from "../components/ui/PageHeader";
import { CardSkeletons } from "../components/ui/Skeleton";
import { CalendarGrid } from "../components/agenda/CalendarGrid";
import { ServicePicker } from "../components/agenda/ServicePicker";
import { cn } from "../lib/utils";
import { formatCurrency } from "../lib/format";
import type { Appointment, AppointmentStatus } from "../api/types";

const statusLabels: Record<AppointmentStatus, string> = {
  pending: "Pendiente",
  in_progress: "En curso",
  completed: "Completada",
  cancelled: "Cancelada",
  no_show: "No asistió",
};

const statusColors: Record<AppointmentStatus, string> = {
  pending: "bg-warning/15 text-warning",
  in_progress: "bg-accent/15 text-accent",
  completed: "bg-success/15 text-success",
  cancelled: "bg-danger/15 text-danger",
  no_show: "bg-danger/15 text-danger",
};

function dayRange(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { from: start.toISOString(), to: end.toISOString() };
}

function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function AppointmentsPage() {
  const user = useAuthStore((state) => state.user);
  const activeLocationId = useAuthStore((state) => state.activeLocationId);
  const isBarber = user?.role === "barber";

  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const range = dayRange(selectedDate);
  const { data: appointments, isLoading } = useAppointments({
    ...range,
    locationId: activeLocationId ?? undefined,
  });
  const { data: locations } = useLocations();
  const { data: barbers } = useBarbers({ enabled: !isBarber });
  const { data: myProfile } = useMyBarberProfile();
  const { data: clients } = useClients();
  const { data: services } = useServices();
  const { data: paymentMethods } = usePaymentMethods();
  const createAppointment = useCreateAppointment();
  const updateStatus = useUpdateAppointmentStatus();
  const registerPayment = useRegisterAppointmentPayment();
  const setMyFavorites = useSetMyFavoriteServices();
  const setBarberFavorites = useSetBarberFavoriteServices();
  const { data: pendingConfirmations } = usePendingConfirmations();
  const confirmAvailability = useConfirmAvailability();
  const rejectAvailability = useRejectAvailability();
  const confirmDeposit = useConfirmDeposit();
  const rejectDeposit = useRejectDeposit();
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [rejectConfirmationTarget, setRejectConfirmationTarget] = useState<Appointment | null>(null);

  const visibleBarbers = activeLocationId
    ? (barbers ?? []).filter((b) => b.locationIds.includes(activeLocationId))
    : barbers ?? [];

  const [view, setView] = useState<"list" | "grid">("list");
  const [open, setOpen] = useState(false);
  const [locationId, setLocationId] = useState("");
  const [barberId, setBarberId] = useState("");
  const [clientId, setClientId] = useState("");
  const [serviceIds, setServiceIds] = useState<string[]>([]);
  const [date, setDate] = useState(() => toDateInputValue(new Date()));
  const [time, setTime] = useState("");
  const [error, setError] = useState<string | null>(null);

  const relevantBarber = isBarber ? myProfile : barbers?.find((b) => b._id === barberId);
  const favoriteServiceIds = relevantBarber?.favoriteServiceIds ?? [];

  function handleToggleFavoriteService(serviceId: string) {
    if (!relevantBarber) return;
    const current = relevantBarber.favoriteServiceIds ?? [];
    const next = current.includes(serviceId)
      ? current.filter((id) => id !== serviceId)
      : [...current, serviceId].slice(0, 5);
    if (isBarber) {
      setMyFavorites.mutate(next);
    } else {
      setBarberFavorites.mutate({ id: relevantBarber._id, serviceIds: next });
    }
  }

  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);

  const [paymentTarget, setPaymentTarget] = useState<Appointment | null>(null);
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [receiptPhoto, setReceiptPhoto] = useState<string | undefined>(undefined);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function toggleService(id: string) {
    setServiceIds((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  }

  function shiftDay(delta: number) {
    setSelectedDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + delta);
      return next;
    });
  }

  function openCreateModal() {
    setDate(toDateInputValue(selectedDate));
    setLocationId(activeLocationId ?? "");
    setOpen(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      const [hours, minutes] = time.split(":").map(Number);
      const [year, month, day] = date.split("-").map(Number);
      const startsAt = new Date(year, month - 1, day, hours, minutes, 0, 0);

      await createAppointment.mutateAsync({
        locationId,
        barberId: isBarber ? undefined : barberId,
        clientId,
        serviceIds,
        startsAt: startsAt.toISOString(),
      });
      setOpen(false);
      setServiceIds([]);
      setTime("");
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "No se pudo crear la cita");
    }
  }

  async function handleConfirmCancel() {
    if (!cancelTarget) return;
    await updateStatus.mutateAsync({ id: cancelTarget._id, status: "cancelled" });
    setCancelTarget(null);
  }

  function openPaymentModal(appointment: Appointment) {
    setPaymentTarget(appointment);
    setPaymentMethodId("");
    setReceiptPhoto(undefined);
    setPaymentError(null);
  }

  async function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    setReceiptPhoto(dataUrl);
  }

  async function handleConfirmPayment(event: FormEvent) {
    event.preventDefault();
    if (!paymentTarget) return;
    setPaymentError(null);
    try {
      await registerPayment.mutateAsync({
        id: paymentTarget._id,
        paymentMethodId,
        receiptPhoto,
      });
      setPaymentTarget(null);
    } catch (err: any) {
      setPaymentError(err?.response?.data?.message ?? "No se pudo registrar el pago");
    }
  }

  async function handleRejectConfirmation() {
    if (!rejectConfirmationTarget) return;
    if (rejectConfirmationTarget.depositStatus === "awaiting_barber") {
      await rejectAvailability.mutateAsync({ id: rejectConfirmationTarget._id });
    } else {
      await rejectDeposit.mutateAsync({ id: rejectConfirmationTarget._id });
    }
    setRejectConfirmationTarget(null);
  }

  function handleGridSelect(appointment: Appointment) {
    if (appointment.status === "pending") {
      updateStatus.mutate({ id: appointment._id, status: "in_progress" });
    } else if (appointment.status === "in_progress") {
      updateStatus.mutate({ id: appointment._id, status: "completed" });
    }
  }

  const today = new Date();

  return (
    <div>
      <PageHeader
        title={isBarber ? "Mi agenda" : "Agenda"}
        description={isBarber ? "Tus citas del día." : "Las citas de tu negocio."}
        action={
          <Button onClick={openCreateModal} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nueva cita
          </Button>
        }
      />

      {pendingConfirmations && pendingConfirmations.length > 0 && (
        <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-warning/30 bg-warning/5 p-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-warning" />
            <p className="text-sm font-semibold text-primary">
              {isBarber ? "Solicitudes por confirmar" : "Pagos por confirmar"} (
              {pendingConfirmations.length})
            </p>
          </div>

          {pendingConfirmations.map((appointment) => {
            const client = typeof appointment.clientId === "object" ? appointment.clientId : null;
            const barber =
              typeof appointment.barberId === "object" ? (appointment.barberId as any) : null;
            const barberName =
              barber && typeof barber.userId === "object" ? barber.userId.name : "Barbero";
            const startsAt = new Date(appointment.startsAt);

            return (
              <div
                key={appointment._id}
                className="flex flex-col gap-2 rounded-xl border border-border bg-background p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-primary">{client?.name ?? "Cliente"}</p>
                  <p className="text-xs text-muted-foreground">
                    {startsAt.toLocaleDateString("es", { day: "2-digit", month: "2-digit" })} ·{" "}
                    {startsAt.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })}
                    {!isBarber && ` · ${barberName}`}
                    {appointment.depositAmountCents
                      ? ` · Adelanto ${formatCurrency(appointment.depositAmountCents)}`
                      : ""}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {!isBarber && appointment.depositProofPhoto && (
                    <IconButton
                      onClick={() => setProofPreview(appointment.depositProofPhoto ?? null)}
                      aria-label="Ver comprobante"
                    >
                      <ImageIcon className="h-4 w-4" />
                    </IconButton>
                  )}
                  <Button
                    variant="secondary"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm"
                    loading={confirmAvailability.isPending || confirmDeposit.isPending}
                    onClick={() =>
                      isBarber
                        ? confirmAvailability.mutate({ id: appointment._id })
                        : confirmDeposit.mutate({ id: appointment._id })
                    }
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                    {isBarber ? "Confirmar disponibilidad" : "Confirmar pago"}
                  </Button>
                  <IconButton
                    variant="danger"
                    onClick={() => setRejectConfirmationTarget(appointment)}
                    aria-label="Rechazar"
                  >
                    <ThumbsDown className="h-4 w-4" />
                  </IconButton>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-background shadow-soft p-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => shiftDay(-1)}
            className="rounded-lg p-2 text-muted-foreground hover:bg-surface"
            aria-label="Día anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex flex-col items-center">
            <p className="text-sm font-medium capitalize text-primary">
              {selectedDate.toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long" })}
            </p>
            {!isSameDay(selectedDate, today) && (
              <button
                onClick={() => setSelectedDate(new Date())}
                className="text-xs font-medium text-accent"
              >
                Volver a hoy
              </button>
            )}
          </div>
          <button
            onClick={() => shiftDay(1)}
            className="rounded-lg p-2 text-muted-foreground hover:bg-surface"
            aria-label="Día siguiente"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {!isBarber && (
          <div className="flex gap-1 rounded-lg bg-surface p-1">
            <button
              onClick={() => setView("list")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                view === "list" ? "bg-background text-primary shadow-sm" : "text-muted-foreground"
              )}
            >
              <List className="h-4 w-4" />
              Lista
            </button>
            <button
              onClick={() => setView("grid")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                view === "grid" ? "bg-background text-primary shadow-sm" : "text-muted-foreground"
              )}
            >
              <LayoutGrid className="h-4 w-4" />
              Grid
            </button>
          </div>
        )}
      </div>

      {isLoading && <CardSkeletons count={2} />}

      {view === "grid" && !isBarber && !isLoading && (
        <CalendarGrid
          barbers={visibleBarbers}
          appointments={appointments ?? []}
          onSelectAppointment={handleGridSelect}
        />
      )}

      {view === "list" && (
        <div className="flex flex-col gap-2">
          {appointments?.map((appointment) => {
            const client = typeof appointment.clientId === "object" ? appointment.clientId : null;
            const time = new Date(appointment.startsAt).toLocaleTimeString("es", {
              hour: "2-digit",
              minute: "2-digit",
            });
            const canCancel = appointment.status === "pending" || appointment.status === "in_progress";
            const paymentMethodName =
              typeof appointment.paymentMethodId === "object"
                ? appointment.paymentMethodId.name
                : null;
            const awaitingConfirmation =
              appointment.depositStatus === "awaiting_barber" ||
              appointment.depositStatus === "awaiting_owner_review";
            return (
              <div
                key={appointment._id}
                className="flex flex-col gap-2 rounded-2xl border border-border bg-background shadow-soft p-4 transition-shadow hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 flex-col items-center justify-center rounded-lg bg-surface text-primary">
                    <Clock className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-primary">
                      {time} — {client?.name ?? "Cliente"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(appointment.totalPriceCents)}
                      {appointment.paid && (
                        <span className="ml-2 text-success">
                          · Pagado{paymentMethodName ? ` (${paymentMethodName})` : ""}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium",
                      statusColors[appointment.status]
                    )}
                  >
                    {statusLabels[appointment.status]}
                  </span>
                  {awaitingConfirmation && (
                    <span className="rounded-full bg-warning/15 px-3 py-1 text-xs font-medium text-warning">
                      {appointment.depositStatus === "awaiting_barber"
                        ? "Esperando confirmación del barbero"
                        : "Esperando confirmación del pago"}
                    </span>
                  )}
                  {!awaitingConfirmation && appointment.status === "pending" && (
                    <Button
                      variant="secondary"
                      className="px-3 py-1.5 text-sm"
                      onClick={() => updateStatus.mutate({ id: appointment._id, status: "in_progress" })}
                    >
                      Iniciar
                    </Button>
                  )}
                  {!awaitingConfirmation && appointment.status === "in_progress" && (
                    <Button
                      variant="secondary"
                      className="px-3 py-1.5 text-sm"
                      onClick={() => updateStatus.mutate({ id: appointment._id, status: "completed" })}
                    >
                      Terminar
                    </Button>
                  )}
                  {!awaitingConfirmation && !appointment.paid && appointment.status !== "cancelled" && (
                    <Button
                      variant="secondary"
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm"
                      onClick={() => openPaymentModal(appointment)}
                    >
                      <Wallet className="h-3.5 w-3.5" />
                      Registrar pago
                    </Button>
                  )}
                  {canCancel && (
                    <IconButton
                      variant="danger"
                      onClick={() => setCancelTarget(appointment)}
                      aria-label="Cancelar cita"
                    >
                      <X className="h-4 w-4" />
                    </IconButton>
                  )}
                </div>
              </div>
            );
          })}
          {appointments?.length === 0 && (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <p className="text-sm text-muted-foreground">No hay citas para este día.</p>
            </div>
          )}
        </div>
      )}

      <Modal open={open} title="Nueva cita" onClose={() => setOpen(false)}>
        <form onSubmit={handleSubmit}>
          <Field label="Sede">
            <select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              required
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-base text-primary"
            >
              <option value="">Selecciona una sede</option>
              {locations?.map((l) => (
                <option key={l._id} value={l._id}>
                  {l.name}
                </option>
              ))}
            </select>
          </Field>

          {!isBarber && (
            <Field label="Barbero">
              <select
                value={barberId}
                onChange={(e) => setBarberId(e.target.value)}
                required
                className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-base text-primary"
              >
                <option value="">Selecciona un barbero</option>
                {barbers?.map((b) => (
                  <option key={b._id} value={b._id}>
                    {typeof b.userId === "object" ? b.userId.name : b._id}
                  </option>
                ))}
              </select>
            </Field>
          )}

          <Field label="Cliente">
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              required
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-base text-primary"
            >
              <option value="">Selecciona un cliente</option>
              {clients?.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} — {c.phone}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Servicios">
            <ServicePicker
              services={services ?? []}
              selectedIds={serviceIds}
              onToggleSelect={toggleService}
              favoriteIds={favoriteServiceIds}
              onToggleFavorite={relevantBarber ? handleToggleFavoriteService : undefined}
            />
            {!isBarber && !barberId && (
              <p className="mt-1.5 text-xs text-muted-foreground">
                Elige un barbero para ver y marcar sus favoritos.
              </p>
            )}
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Fecha">
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </Field>
            <Field label="Hora">
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
            </Field>
          </div>

          {error && <p className="mb-3 text-sm text-danger">{error}</p>}
          <Button type="submit" loading={createAppointment.isPending} className="w-full">
            Agendar
          </Button>
        </form>
      </Modal>

      <Modal open={paymentTarget !== null} title="Registrar pago" onClose={() => setPaymentTarget(null)}>
        <form onSubmit={handleConfirmPayment}>
          <Field label="Método de pago">
            <select
              value={paymentMethodId}
              onChange={(e) => setPaymentMethodId(e.target.value)}
              required
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-base text-primary"
            >
              <option value="">Selecciona un método</option>
              {paymentMethods?.filter((m) => m.isActive).map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name}
                </option>
              ))}
            </select>
          </Field>

          {paymentMethods?.length === 0 && (
            <p className="mb-3 text-sm text-warning">
              Aún no tienes métodos de pago creados. Pide al dueño que cree uno en "Métodos de pago".
            </p>
          )}

          <Field label="Foto del comprobante (opcional)">
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border px-3 py-3 text-sm text-muted-foreground hover:bg-surface"
            >
              <Camera className="h-4 w-4" />
              {receiptPhoto ? "Cambiar foto" : "Tomar / adjuntar foto"}
            </button>
            {receiptPhoto && (
              <img
                src={receiptPhoto}
                alt="Comprobante"
                className="mt-2 max-h-40 w-full rounded-lg border border-border object-contain"
              />
            )}
          </Field>

          {paymentError && <p className="mb-3 text-sm text-danger">{paymentError}</p>}
          <Button type="submit" loading={registerPayment.isPending} className="w-full">
            Confirmar pago
          </Button>
        </form>
      </Modal>

      <ConfirmDialog
        open={cancelTarget !== null}
        title="Cancelar cita"
        description="El horario quedará libre nuevamente para ese barbero. Esta acción no se puede deshacer."
        confirmLabel="Cancelar cita"
        danger
        loading={updateStatus.isPending}
        onConfirm={handleConfirmCancel}
        onClose={() => setCancelTarget(null)}
      />

      <Modal open={proofPreview !== null} title="Comprobante del adelanto" onClose={() => setProofPreview(null)}>
        {proofPreview && (
          <img src={proofPreview} alt="Comprobante" className="w-full rounded-lg border border-border object-contain" />
        )}
      </Modal>

      <ConfirmDialog
        open={rejectConfirmationTarget !== null}
        title={
          rejectConfirmationTarget?.depositStatus === "awaiting_barber"
            ? "Rechazar disponibilidad"
            : "Rechazar pago"
        }
        description="El cliente recibirá un mensaje por WhatsApp avisando que la cita no pudo confirmarse."
        confirmLabel="Rechazar"
        danger
        loading={rejectAvailability.isPending || rejectDeposit.isPending}
        onConfirm={handleRejectConfirmation}
        onClose={() => setRejectConfirmationTarget(null)}
      />
    </div>
  );
}
