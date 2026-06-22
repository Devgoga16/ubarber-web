import { useState, type FormEvent } from "react";
import { Plus, Wallet, Pencil, Power } from "lucide-react";
import {
  usePaymentMethods,
  useCreatePaymentMethod,
  useUpdatePaymentMethod,
  useSetPaymentMethodStatus,
} from "../hooks/usePaymentMethods";
import { Modal } from "../components/ui/Modal";
import { Field, Input } from "../components/ui/Field";
import { Button } from "../components/ui/Button";
import { IconButton } from "../components/ui/IconButton";
import { StatusBadge } from "../components/ui/StatusBadge";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { PageHeader } from "../components/ui/PageHeader";
import { CardSkeletons } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import type { PaymentMethod } from "../api/types";

export function PaymentMethodsPage() {
  const { data: methods, isLoading } = usePaymentMethods();
  const createMethod = useCreatePaymentMethod();
  const updateMethod = useUpdatePaymentMethod();
  const setStatus = useSetPaymentMethodStatus();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PaymentMethod | null>(null);
  const [name, setName] = useState("");
  const [statusTarget, setStatusTarget] = useState<PaymentMethod | null>(null);
  const [error, setError] = useState<string | null>(null);

  function openCreate() {
    setEditing(null);
    setName("");
    setOpen(true);
  }

  function openEdit(method: PaymentMethod) {
    setEditing(method);
    setName(method.name);
    setOpen(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      if (editing) {
        await updateMethod.mutateAsync({ id: editing._id, name });
      } else {
        await createMethod.mutateAsync({ name });
      }
      setOpen(false);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "No se pudo guardar el método de pago");
    }
  }

  async function handleToggleStatus() {
    if (!statusTarget) return;
    await setStatus.mutateAsync({ id: statusTarget._id, isActive: !statusTarget.isActive });
    setStatusTarget(null);
  }

  const isSaving = createMethod.isPending || updateMethod.isPending;

  return (
    <div>
      <PageHeader
        title="Métodos de pago"
        description="Las formas de pago que tu equipo puede registrar al cobrar una cita."
        action={
          <Button onClick={openCreate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nuevo método
          </Button>
        }
      />

      {isLoading && <CardSkeletons count={2} />}

      {!isLoading && methods?.length === 0 && (
        <EmptyState
          icon={Wallet}
          title="Aún no tienes métodos de pago"
          description="Crea al menos uno (por ejemplo Efectivo) para poder registrar pagos en las citas."
        />
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {methods?.map((method) => (
          <div
            key={method._id}
            className="rounded-2xl border border-border bg-background shadow-soft p-4 transition-shadow hover:shadow-sm"
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-accent" />
                <h3 className="font-medium text-primary">{method.name}</h3>
              </div>
              <StatusBadge active={method.isActive} />
            </div>

            <div className="mt-3 flex justify-end gap-1 border-t border-border pt-3">
              <IconButton onClick={() => openEdit(method)} aria-label="Editar">
                <Pencil className="h-4 w-4" />
              </IconButton>
              <IconButton
                variant="danger"
                onClick={() => setStatusTarget(method)}
                aria-label={method.isActive ? "Desactivar" : "Activar"}
              >
                <Power className="h-4 w-4" />
              </IconButton>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={open}
        title={editing ? "Editar método de pago" : "Nuevo método de pago"}
        onClose={() => setOpen(false)}
      >
        <form onSubmit={handleSubmit}>
          <Field label="Nombre">
            <Input value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
          </Field>
          {error && <p className="mb-3 text-sm text-danger">{error}</p>}
          <Button type="submit" loading={isSaving} className="w-full">
            Guardar
          </Button>
        </form>
      </Modal>

      <ConfirmDialog
        open={statusTarget !== null}
        title={statusTarget?.isActive ? "Desactivar método de pago" : "Activar método de pago"}
        description={
          statusTarget?.isActive
            ? "Ya no se podrá elegir este método al registrar un pago."
            : "El método volverá a estar disponible para registrar pagos."
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
