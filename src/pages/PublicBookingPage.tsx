import { useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Scissors, CheckCircle2, CalendarDays, MapPin, Camera, ShieldCheck } from "lucide-react";
import {
  usePublicBusiness,
  usePublicAvailability,
  useCreatePublicAppointment,
  computeRequiredDepositCents,
} from "../hooks/usePublicBooking";
import { ServicePicker } from "../components/agenda/ServicePicker";
import { Field, Input } from "../components/ui/Field";
import { Button } from "../components/ui/Button";
import { Spinner } from "../components/ui/Spinner";
import { cn } from "../lib/utils";
import { formatCurrency } from "../lib/format";

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function PublicBookingPage() {
  const { slug = "" } = useParams();
  const [searchParams] = useSearchParams();
  const { data, isLoading, isError } = usePublicBusiness(slug);
  const createAppointment = useCreatePublicAppointment(slug);

  const [locationId, setLocationId] = useState(searchParams.get("sede") ?? "");
  const [barberId, setBarberId] = useState(searchParams.get("barbero") ?? "");
  const [serviceIds, setServiceIds] = useState<string[]>(
    searchParams.get("servicios")?.split(",").filter(Boolean) ?? []
  );
  const [date, setDate] = useState(() => toDateInputValue(new Date()));
  const [time, setTime] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [knowsBusiness, setKnowsBusiness] = useState<"yes" | "no" | null>(null);
  const [trustCode, setTrustCode] = useState("");
  const [depositProofPhoto, setDepositProofPhoto] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const locations = data?.locations ?? [];
  const services = data?.services ?? [];
  const barbers = data?.barbers ?? [];

  const barbersForLocation = locationId
    ? barbers.filter((b) => b.locationIds.includes(locationId))
    : barbers;
  const servicesForLocation = locationId
    ? services.filter((s) => s.locationIds.includes(locationId))
    : services;

  const selectedBarber = barbers.find((b) => b._id === barberId);
  const durationMinutes = services
    .filter((s) => serviceIds.includes(s._id))
    .reduce((sum, s) => sum + s.durationMinutes, 0);

  const availabilityEnabled = Boolean(locationId && barberId && date && durationMinutes > 0);
  const { data: availability, isFetching: loadingSlots } = usePublicAvailability(
    slug,
    { locationId, barberId, date, durationMinutes },
    availabilityEnabled
  );

  function toggleService(id: string) {
    setServiceIds((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
    setTime("");
  }

  const selectedServices = services.filter((s) => serviceIds.includes(s._id));
  const requiredDepositCents = data?.deposit
    ? computeRequiredDepositCents(data.deposit, selectedServices)
    : 0;
  const needsDepositStep = requiredDepositCents > 0;

  const depositResolved =
    !needsDepositStep ||
    (knowsBusiness === "yes" && trustCode.trim().length > 0) ||
    (knowsBusiness === "no" && Boolean(depositProofPhoto));

  async function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setDepositProofPhoto(await readFileAsDataUrl(file));
  }

  const canSubmit =
    locationId &&
    barberId &&
    serviceIds.length > 0 &&
    date &&
    time &&
    clientName &&
    clientPhone &&
    depositResolved;

  async function handleSubmit() {
    setError(null);
    try {
      const [hours, minutes] = time.split(":").map(Number);
      const [year, month, day] = date.split("-").map(Number);
      const startsAt = new Date(year, month - 1, day, hours, minutes, 0, 0);

      await createAppointment.mutateAsync({
        locationId,
        barberId,
        serviceIds,
        startsAt: startsAt.toISOString(),
        client: { name: clientName, phone: clientPhone },
        ...(needsDepositStep
          ? knowsBusiness === "yes"
            ? { depositMethod: "trust_code" as const, trustCode }
            : { depositMethod: "proof_photo" as const, depositProofPhoto }
          : {}),
      });
      setDone(true);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "No se pudo agendar la cita, intenta de nuevo");
    }
  }

  const heading = useMemo(() => data?.business.name ?? "Reservar cita", [data]);

  return (
    <div className="min-h-screen bg-surface">
      <div className="gradient-primary px-4 py-8 text-center text-primary-foreground">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl gradient-accent shadow-soft">
          <Scissors className="h-6 w-6 text-accent-foreground" />
        </div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">{heading}</h1>
        <p className="mt-1 text-sm text-primary-foreground/60">Agenda tu cita en segundos</p>
      </div>

      <div className="mx-auto max-w-md px-4 py-6">
        {isLoading && (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        )}

        {isError && (
          <p className="rounded-2xl border border-border bg-background p-6 text-center text-sm text-muted-foreground shadow-soft">
            No encontramos este negocio. Revisa el enlace e intenta de nuevo.
          </p>
        )}

        {data && !data.bookable && (
          <p className="rounded-2xl border border-border bg-background p-6 text-center text-sm text-muted-foreground shadow-soft">
            Este negocio no está aceptando reservas en este momento. Contáctalo directamente.
          </p>
        )}

        {data && data.bookable && done && (
          <div className="rounded-2xl border border-border bg-background p-8 text-center shadow-soft">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success/15">
              <CheckCircle2 className="h-7 w-7 text-success" />
            </div>
            <h2 className="font-heading mb-1 text-lg font-semibold text-primary">
              {needsDepositStep ? "¡Solicitud enviada!" : "¡Tu cita quedó agendada!"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {needsDepositStep
                ? "El barbero debe confirmar disponibilidad. Te avisamos por WhatsApp en cuanto se confirme."
                : "Te llegará un recordatorio por WhatsApp antes de tu cita."}
            </p>
          </div>
        )}

        {data && data.bookable && !done && (
          <div className="flex flex-col gap-4">
            {locations.length > 1 && (
              <Field label="Sede">
                <select
                  value={locationId}
                  onChange={(e) => {
                    setLocationId(e.target.value);
                    setBarberId("");
                    setTime("");
                  }}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-base text-primary"
                >
                  <option value="">Selecciona una sede</option>
                  {locations.map((l) => (
                    <option key={l._id} value={l._id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </Field>
            )}
            {locations.length === 1 && (
              <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-primary">
                <MapPin className="h-4 w-4 text-accent" />
                {locations[0].name}
              </div>
            )}

            <Field label="Servicios">
              <ServicePicker
                services={servicesForLocation}
                selectedIds={serviceIds}
                onToggleSelect={toggleService}
                favoriteIds={selectedBarber?.favoriteServiceIds ?? []}
              />
            </Field>

            <Field label="Barbero">
              <select
                value={barberId}
                onChange={(e) => {
                  setBarberId(e.target.value);
                  setTime("");
                }}
                disabled={!locationId}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-base text-primary disabled:opacity-50"
              >
                <option value="">Selecciona un barbero</option>
                {barbersForLocation.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Fecha">
              <Input
                type="date"
                value={date}
                min={toDateInputValue(new Date())}
                onChange={(e) => {
                  setDate(e.target.value);
                  setTime("");
                }}
              />
            </Field>

            {availabilityEnabled && (
              <Field label="Hora disponible">
                {loadingSlots && (
                  <div className="flex justify-center py-3">
                    <Spinner size="sm" />
                  </div>
                )}
                {!loadingSlots && availability?.slots.length === 0 && (
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays className="h-4 w-4" />
                    No hay horarios disponibles ese día, prueba otra fecha.
                  </p>
                )}
                {!loadingSlots && availability && availability.slots.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {availability.slots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setTime(slot)}
                        className={cn(
                          "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                          time === slot
                            ? "border-accent bg-accent/10 text-accent"
                            : "border-border text-muted-foreground hover:bg-surface"
                        )}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </Field>
            )}

            {needsDepositStep && (
              <div className="flex flex-col gap-3 rounded-2xl border border-accent/30 bg-accent/5 p-4">
                <div>
                  <p className="text-sm font-medium text-primary">
                    Esta cita requiere un adelanto de {formatCurrency(requiredDepositCents)}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    ¿La barbería ya te conoce? Pídele el código y paga una vez finalizado el corte.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setKnowsBusiness("yes")}
                    className={cn(
                      "flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
                      knowsBusiness === "yes"
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border text-muted-foreground"
                    )}
                  >
                    Sí, tengo el código
                  </button>
                  <button
                    type="button"
                    onClick={() => setKnowsBusiness("no")}
                    className={cn(
                      "flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
                      knowsBusiness === "no"
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border text-muted-foreground"
                    )}
                  >
                    No, voy a pagar el adelanto
                  </button>
                </div>

                {knowsBusiness === "yes" && (
                  <Field label="Código de la barbería">
                    <div className="relative">
                      <ShieldCheck className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-accent" />
                      <input
                        value={trustCode}
                        onChange={(e) => setTrustCode(e.target.value)}
                        placeholder="123456"
                        className="w-full rounded-lg border border-border bg-surface py-2.5 pl-9 pr-3 text-base text-primary"
                      />
                    </div>
                  </Field>
                )}

                {knowsBusiness === "no" && (
                  <Field label="Comprobante del adelanto">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoChange}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border px-3 py-3 text-sm text-muted-foreground hover:bg-surface"
                    >
                      <Camera className="h-4 w-4" />
                      {depositProofPhoto ? "Cambiar comprobante" : "Subir comprobante de pago"}
                    </button>
                    {depositProofPhoto && (
                      <img
                        src={depositProofPhoto}
                        alt="Comprobante"
                        className="mt-2 h-32 w-full rounded-lg border border-border object-contain"
                      />
                    )}
                  </Field>
                )}
              </div>
            )}

            <Field label="Tu nombre">
              <Input value={clientName} onChange={(e) => setClientName(e.target.value)} required />
            </Field>
            <Field label="Tu WhatsApp">
              <Input
                type="tel"
                placeholder="987654321"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                required
              />
            </Field>

            {error && <p className="text-sm text-danger">{error}</p>}

            <Button
              onClick={handleSubmit}
              loading={createAppointment.isPending}
              disabled={!canSubmit}
              className="w-full"
            >
              Confirmar cita
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
