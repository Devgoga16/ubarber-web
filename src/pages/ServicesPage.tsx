import { useRef, useState, type FormEvent } from "react";
import { Plus, Tag, Pencil, Power, Camera } from "lucide-react";
import {
  useCreateService,
  useServices,
  useSetServiceStatus,
  useUpdateService,
  type ServiceInput,
} from "../hooks/useServices";
import { useLocations } from "../hooks/useLocations";
import { useDepositSettings } from "../hooks/useDepositSettings";
import { useAuthStore } from "../store/auth";
import { Modal } from "../components/ui/Modal";
import { Field, Input } from "../components/ui/Field";
import { Button } from "../components/ui/Button";
import { IconButton } from "../components/ui/IconButton";
import { StatusBadge } from "../components/ui/StatusBadge";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { PageHeader } from "../components/ui/PageHeader";
import { CardSkeletons } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { formatCurrency as formatPrice } from "../lib/format";
import type { Service } from "../api/types";

const emptyForm = {
  name: "",
  durationMinutes: "30",
  priceCents: "",
  locationIds: [] as string[],
  photo: undefined as string | undefined,
  hasOwnDeposit: false,
  depositType: "percentage" as "percentage" | "fixed",
  depositValuePercent: "20",
  depositValueCents: "0",
};

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ServicesPage() {
  const activeLocationId = useAuthStore((state) => state.activeLocationId);
  const { data: services, isLoading } = useServices();
  const { data: locations } = useLocations();
  const { data: depositSettings } = useDepositSettings();
  const showDepositOverride = depositSettings?.depositEnabled && depositSettings.depositScope === "per_service";
  const createService = useCreateService();
  const updateService = useUpdateService();
  const setStatus = useSetServiceStatus();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const visibleServices = activeLocationId
    ? services?.filter((s) => s.locationIds.includes(activeLocationId))
    : services;

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [statusTarget, setStatusTarget] = useState<Service | null>(null);
  const [error, setError] = useState<string | null>(null);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(service: Service) {
    setEditing(service);
    setForm({
      name: service.name,
      durationMinutes: String(service.durationMinutes),
      priceCents: String(service.priceCents / 100),
      locationIds: service.locationIds,
      photo: service.photo,
      hasOwnDeposit: Boolean(service.depositType),
      depositType: service.depositType ?? "percentage",
      depositValuePercent: String(service.depositValuePercent ?? 20),
      depositValueCents: String((service.depositValueCents ?? 0) / 100),
    });
    setOpen(true);
  }

  function toggleLocation(id: string) {
    setForm((prev) => ({
      ...prev,
      locationIds: prev.locationIds.includes(id)
        ? prev.locationIds.filter((l) => l !== id)
        : [...prev.locationIds, id],
    }));
  }

  async function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    setForm((prev) => ({ ...prev, photo: dataUrl }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    const payload: ServiceInput = {
      name: form.name,
      durationMinutes: Number(form.durationMinutes),
      priceCents: Math.round(Number(form.priceCents) * 100),
      locationIds: form.locationIds,
      photo: form.photo,
      ...(form.hasOwnDeposit
        ? {
            depositType: form.depositType,
            depositValuePercent: Number(form.depositValuePercent),
            depositValueCents: Math.round(Number(form.depositValueCents) * 100),
          }
        : {}),
    };
    try {
      if (editing) {
        await updateService.mutateAsync({ id: editing._id, ...payload });
      } else {
        await createService.mutateAsync(payload);
      }
      setOpen(false);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "No se pudo guardar el servicio");
    }
  }

  async function handleToggleStatus() {
    if (!statusTarget) return;
    await setStatus.mutateAsync({ id: statusTarget._id, isActive: !statusTarget.isActive });
    setStatusTarget(null);
  }

  const isSaving = createService.isPending || updateService.isPending;

  return (
    <div>
      <PageHeader
        title="Servicios"
        description="Lo que ofreces y su duración/precio."
        action={
          <Button onClick={openCreate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nuevo servicio
          </Button>
        }
      />

      {isLoading && <CardSkeletons />}

      {!isLoading && visibleServices?.length === 0 && (
        <EmptyState
          icon={Tag}
          title="Aún no tienes servicios"
          description={
            activeLocationId
              ? "No hay servicios disponibles en esta sede."
              : "Crea tu primer servicio para poder agendar citas."
          }
        />
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visibleServices?.map((service) => (
          <div
            key={service._id}
            className="overflow-hidden rounded-2xl border border-border bg-background shadow-soft transition-shadow hover:shadow-soft-lg"
          >
            {service.photo ? (
              <img src={service.photo} alt={service.name} className="h-32 w-full object-cover" />
            ) : (
              <div className="flex h-32 w-full items-center justify-center bg-surface">
                <Tag className="h-8 w-8 text-accent/40" />
              </div>
            )}
            <div className="p-4">
              <div className="mb-2 flex items-start justify-between gap-2">
                <h3 className="font-medium text-primary">{service.name}</h3>
                <StatusBadge active={service.isActive} />
              </div>
              <p className="text-sm text-muted-foreground">{service.durationMinutes} min</p>
              <p className="text-sm font-medium text-primary">{formatPrice(service.priceCents)}</p>

              <div className="mt-3 flex justify-end gap-1 border-t border-border pt-3">
                <IconButton onClick={() => openEdit(service)} aria-label="Editar">
                  <Pencil className="h-4 w-4" />
                </IconButton>
                <IconButton
                  variant="danger"
                  onClick={() => setStatusTarget(service)}
                  aria-label={service.isActive ? "Desactivar" : "Activar"}
                >
                  <Power className="h-4 w-4" />
                </IconButton>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal open={open} title={editing ? "Editar servicio" : "Nuevo servicio"} onClose={() => setOpen(false)}>
        <form onSubmit={handleSubmit}>
          <Field label="Foto del servicio (opcional)">
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
              {form.photo ? "Cambiar foto" : "Subir foto"}
            </button>
            {form.photo && (
              <img
                src={form.photo}
                alt="Vista previa"
                className="mt-2 h-32 w-full rounded-lg border border-border object-cover"
              />
            )}
          </Field>

          <Field label="Nombre">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </Field>
          <Field label="Duración (minutos)">
            <Input
              type="number"
              min={5}
              value={form.durationMinutes}
              onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
              inputMode="numeric"
              required
            />
          </Field>
          <Field label="Precio">
            <Input
              type="number"
              min={0}
              step="0.01"
              value={form.priceCents}
              onChange={(e) => setForm({ ...form, priceCents: e.target.value })}
              inputMode="decimal"
              required
            />
          </Field>
          <Field label="Sedes donde aplica">
            <div className="flex flex-col gap-2">
              {locations?.map((location) => (
                <label key={location._id} className="flex items-center gap-2 text-sm text-primary">
                  <input
                    type="checkbox"
                    checked={form.locationIds.includes(location._id)}
                    onChange={() => toggleLocation(location._id)}
                  />
                  {location.name}
                </label>
              ))}
            </div>
          </Field>
          {showDepositOverride && (
            <Field label="Adelanto al reservar online">
              <label className="mb-2 flex items-center gap-2 text-sm text-primary">
                <input
                  type="checkbox"
                  checked={form.hasOwnDeposit}
                  onChange={(e) => setForm({ ...form, hasOwnDeposit: e.target.checked })}
                />
                Este servicio tiene su propio adelanto (si no, usa el valor por defecto del negocio)
              </label>
              {form.hasOwnDeposit && (
                <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, depositType: "percentage" })}
                      className={`flex-1 rounded-md px-2 py-1.5 text-sm font-medium ${form.depositType === "percentage" ? "bg-accent/10 text-accent" : "text-muted-foreground"}`}
                    >
                      Porcentaje
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, depositType: "fixed" })}
                      className={`flex-1 rounded-md px-2 py-1.5 text-sm font-medium ${form.depositType === "fixed" ? "bg-accent/10 text-accent" : "text-muted-foreground"}`}
                    >
                      Monto fijo
                    </button>
                  </div>
                  {form.depositType === "percentage" ? (
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={form.depositValuePercent}
                      onChange={(e) => setForm({ ...form, depositValuePercent: e.target.value })}
                    />
                  ) : (
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={form.depositValueCents}
                      onChange={(e) => setForm({ ...form, depositValueCents: e.target.value })}
                    />
                  )}
                </div>
              )}
            </Field>
          )}

          {error && <p className="mb-3 text-sm text-danger">{error}</p>}
          <Button type="submit" loading={isSaving} className="w-full">
            Guardar
          </Button>
        </form>
      </Modal>

      <ConfirmDialog
        open={statusTarget !== null}
        title={statusTarget?.isActive ? "Desactivar servicio" : "Activar servicio"}
        description={
          statusTarget?.isActive
            ? "Ya no se podrá elegir este servicio al crear nuevas citas."
            : "El servicio volverá a estar disponible para agendar."
        }
        confirmLabel={statusTarget?.isActive ? "Desactivar" : "Activar"}
        danger={statusTarget?.isActive}
        loading={setStatus.isPending}
        onConfirm={handleToggleStatus}
        onClose={() => setStatusTarget(null)}
      />
    </div>
  );
}
