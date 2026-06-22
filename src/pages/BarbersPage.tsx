import { useState, type FormEvent } from "react";
import { Plus, Scissors, Pencil, Power } from "lucide-react";
import {
  useBarbers,
  useCreateBarber,
  useSetBarberStatus,
  useUpdateBarber,
  type CreateBarberInput,
} from "../hooks/useBarbers";
import { useLocations } from "../hooks/useLocations";
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
import type { Barber } from "../api/types";

const emptyCreateForm: CreateBarberInput = {
  name: "",
  email: "",
  password: "",
  phone: "",
  locationIds: [],
};

export function BarbersPage() {
  const activeLocationId = useAuthStore((state) => state.activeLocationId);
  const { data: barbers, isLoading } = useBarbers();
  const { data: locations } = useLocations();
  const createBarber = useCreateBarber();
  const updateBarber = useUpdateBarber();
  const setStatus = useSetBarberStatus();

  const visibleBarbers = activeLocationId
    ? barbers?.filter((b) => b.locationIds.includes(activeLocationId))
    : barbers;

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Barber | null>(null);
  const [createForm, setCreateForm] = useState<CreateBarberInput>(emptyCreateForm);
  const [editLocationIds, setEditLocationIds] = useState<string[]>([]);
  const [editPhone, setEditPhone] = useState("");
  const [statusTarget, setStatusTarget] = useState<Barber | null>(null);
  const [error, setError] = useState<string | null>(null);

  function openCreate() {
    setEditing(null);
    setCreateForm(emptyCreateForm);
    setOpen(true);
  }

  function openEdit(barber: Barber) {
    setEditing(barber);
    setEditLocationIds(barber.locationIds);
    setEditPhone(barber.phone ?? "");
    setOpen(true);
  }

  function toggleLocation(id: string) {
    if (editing) {
      setEditLocationIds((prev) => (prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]));
    } else {
      setCreateForm((prev) => ({
        ...prev,
        locationIds: prev.locationIds.includes(id)
          ? prev.locationIds.filter((l) => l !== id)
          : [...prev.locationIds, id],
      }));
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      if (editing) {
        await updateBarber.mutateAsync({
          id: editing._id,
          locationIds: editLocationIds,
          phone: editPhone,
        });
      } else {
        await createBarber.mutateAsync(createForm);
      }
      setOpen(false);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "No se pudo guardar el barbero");
    }
  }

  async function handleToggleStatus() {
    if (!statusTarget) return;
    await setStatus.mutateAsync({ id: statusTarget._id, isActive: !statusTarget.isActive });
    setStatusTarget(null);
  }

  const isSaving = createBarber.isPending || updateBarber.isPending;

  return (
    <div>
      <PageHeader
        title="Barberos"
        description="Tu equipo y en qué sedes atienden."
        action={
          <Button onClick={openCreate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nuevo barbero
          </Button>
        }
      />

      {isLoading && <CardSkeletons />}

      {!isLoading && visibleBarbers?.length === 0 && (
        <EmptyState
          icon={Scissors}
          title="Aún no tienes barberos"
          description={
            activeLocationId
              ? "No hay barberos asignados a esta sede."
              : "Agrega a tu primer barbero para empezar a agendar citas."
          }
        />
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visibleBarbers?.map((barber) => (
          <div
            key={barber._id}
            className="rounded-2xl border border-border bg-background shadow-soft p-4 transition-shadow hover:shadow-sm"
          >
            <div className="mb-1 flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <Scissors className="h-4 w-4 text-accent" />
                <h3 className="font-medium text-primary">
                  {typeof barber.userId === "object" ? barber.userId.name : "—"}
                </h3>
              </div>
              <StatusBadge active={barber.isActive} />
            </div>
            <p className="text-sm text-muted-foreground">
              {typeof barber.userId === "object" ? barber.userId.email : ""}
            </p>
            {barber.specialties.length > 0 && (
              <p className="mt-1 text-sm text-muted-foreground">{barber.specialties.join(", ")}</p>
            )}

            <div className="mt-3 flex justify-end gap-1 border-t border-border pt-3">
              <IconButton onClick={() => openEdit(barber)} aria-label="Editar">
                <Pencil className="h-4 w-4" />
              </IconButton>
              <IconButton
                variant="danger"
                onClick={() => setStatusTarget(barber)}
                aria-label={barber.isActive ? "Desactivar" : "Activar"}
              >
                <Power className="h-4 w-4" />
              </IconButton>
            </div>
          </div>
        ))}
      </div>

      <Modal open={open} title={editing ? "Editar barbero" : "Nuevo barbero"} onClose={() => setOpen(false)}>
        <form onSubmit={handleSubmit}>
          {!editing && (
            <>
              <Field label="Nombre">
                <Input
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  required
                />
              </Field>
              <Field label="Email">
                <Input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  required
                />
              </Field>
              <Field label="Contraseña temporal">
                <Input
                  type="password"
                  minLength={6}
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  required
                />
              </Field>
            </>
          )}

          <Field label="WhatsApp (para recibir notificaciones de citas)">
            <Input
              type="tel"
              placeholder="987654321"
              value={editing ? editPhone : (createForm.phone ?? "")}
              onChange={(e) =>
                editing
                  ? setEditPhone(e.target.value)
                  : setCreateForm({ ...createForm, phone: e.target.value })
              }
            />
          </Field>

          <Field label="Sedes donde trabaja">
            <div className="flex flex-col gap-2">
              {locations?.map((location) => (
                <label key={location._id} className="flex items-center gap-2 text-sm text-primary">
                  <input
                    type="checkbox"
                    checked={
                      editing
                        ? editLocationIds.includes(location._id)
                        : createForm.locationIds.includes(location._id)
                    }
                    onChange={() => toggleLocation(location._id)}
                  />
                  {location.name}
                </label>
              ))}
            </div>
          </Field>

          {error && <p className="mb-3 text-sm text-danger">{error}</p>}
          <Button type="submit" loading={isSaving} className="w-full">
            Guardar
          </Button>
        </form>
      </Modal>

      <ConfirmDialog
        open={statusTarget !== null}
        title={statusTarget?.isActive ? "Desactivar barbero" : "Activar barbero"}
        description={
          statusTarget?.isActive
            ? "No podrá iniciar sesión ni se le podrán agendar nuevas citas."
            : "Recuperará acceso y se le podrán volver a agendar citas."
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
