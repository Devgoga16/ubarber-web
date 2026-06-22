import { useState, type FormEvent } from "react";
import { Plus, MapPin, Pencil, Power } from "lucide-react";
import {
  useCreateLocation,
  useLocations,
  useSetLocationStatus,
  useUpdateLocation,
  type LocationInput,
} from "../hooks/useLocations";
import { Modal } from "../components/ui/Modal";
import { Field, Input } from "../components/ui/Field";
import { Button } from "../components/ui/Button";
import { IconButton } from "../components/ui/IconButton";
import { StatusBadge } from "../components/ui/StatusBadge";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { PageHeader } from "../components/ui/PageHeader";
import { CardSkeletons } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import type { Location } from "../api/types";

const emptyForm: LocationInput = { name: "", address: "", phone: "" };

export function LocationsPage() {
  const { data: locations, isLoading } = useLocations();
  const createLocation = useCreateLocation();
  const updateLocation = useUpdateLocation();
  const setStatus = useSetLocationStatus();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Location | null>(null);
  const [form, setForm] = useState<LocationInput>(emptyForm);
  const [statusTarget, setStatusTarget] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(location: Location) {
    setEditing(location);
    setForm({ name: location.name, address: location.address ?? "", phone: location.phone ?? "" });
    setOpen(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      if (editing) {
        await updateLocation.mutateAsync({ id: editing._id, ...form });
      } else {
        await createLocation.mutateAsync(form);
      }
      setOpen(false);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "No se pudo guardar la sede");
    }
  }

  async function handleToggleStatus() {
    if (!statusTarget) return;
    await setStatus.mutateAsync({ id: statusTarget._id, isActive: !statusTarget.isActive });
    setStatusTarget(null);
  }

  const isSaving = createLocation.isPending || updateLocation.isPending;

  return (
    <div>
      <PageHeader
        title="Sedes"
        description="Las sucursales de tu negocio."
        action={
          <Button onClick={openCreate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nueva sede
          </Button>
        }
      />

      {isLoading && <CardSkeletons />}

      {!isLoading && locations?.length === 0 && (
        <EmptyState
          icon={MapPin}
          title="Aún no tienes sedes"
          description="Crea la primera sede para empezar a agendar citas."
        />
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {locations?.map((location) => (
          <div
            key={location._id}
            className="group rounded-2xl border border-border bg-background shadow-soft p-4 transition-shadow hover:shadow-sm"
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-accent" />
                <h3 className="font-medium text-primary">{location.name}</h3>
              </div>
              <StatusBadge active={location.isActive} />
            </div>
            {location.address && <p className="text-sm text-muted-foreground">{location.address}</p>}
            {location.phone && <p className="text-sm text-muted-foreground">{location.phone}</p>}

            <div className="mt-3 flex justify-end gap-1 border-t border-border pt-3">
              <IconButton onClick={() => openEdit(location)} aria-label="Editar">
                <Pencil className="h-4 w-4" />
              </IconButton>
              <IconButton
                variant="danger"
                onClick={() => setStatusTarget(location)}
                aria-label={location.isActive ? "Desactivar" : "Activar"}
              >
                <Power className="h-4 w-4" />
              </IconButton>
            </div>
          </div>
        ))}
      </div>

      <Modal open={open} title={editing ? "Editar sede" : "Nueva sede"} onClose={() => setOpen(false)}>
        <form onSubmit={handleSubmit}>
          <Field label="Nombre">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </Field>
          <Field label="Dirección">
            <Input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </Field>
          <Field label="Teléfono">
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              inputMode="tel"
            />
          </Field>
          {error && <p className="mb-3 text-sm text-danger">{error}</p>}
          <Button type="submit" loading={isSaving} className="w-full">
            Guardar
          </Button>
        </form>
      </Modal>

      <ConfirmDialog
        open={statusTarget !== null}
        title={statusTarget?.isActive ? "Desactivar sede" : "Activar sede"}
        description={
          statusTarget?.isActive
            ? "No se podrán agendar más citas en esta sede hasta reactivarla."
            : "La sede volverá a estar disponible para agendar citas."
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
