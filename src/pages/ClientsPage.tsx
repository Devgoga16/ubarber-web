import { useState, type FormEvent } from "react";
import { Plus, User, Search, Pencil, Power } from "lucide-react";
import {
  useClients,
  useCreateClient,
  useSetClientStatus,
  useUpdateClient,
  type ClientInput,
} from "../hooks/useClients";
import { Modal } from "../components/ui/Modal";
import { Field, Input } from "../components/ui/Field";
import { Button } from "../components/ui/Button";
import { IconButton } from "../components/ui/IconButton";
import { StatusBadge } from "../components/ui/StatusBadge";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { PageHeader } from "../components/ui/PageHeader";
import { EmptyState } from "../components/ui/EmptyState";
import { Spinner } from "../components/ui/Spinner";
import type { Client } from "../api/types";

const emptyForm: ClientInput = { name: "", phone: "", email: "" };

export function ClientsPage() {
  const [search, setSearch] = useState("");
  const { data: clients, isLoading } = useClients(search);
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const setStatus = useSetClientStatus();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState<ClientInput>(emptyForm);
  const [statusTarget, setStatusTarget] = useState<Client | null>(null);
  const [error, setError] = useState<string | null>(null);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(client: Client) {
    setEditing(client);
    setForm({ name: client.name, phone: client.phone, email: client.email ?? "" });
    setOpen(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    const payload = { ...form, email: form.email || undefined };
    try {
      if (editing) {
        await updateClient.mutateAsync({ id: editing._id, ...payload });
      } else {
        await createClient.mutateAsync(payload);
      }
      setOpen(false);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "No se pudo guardar el cliente");
    }
  }

  async function handleToggleStatus() {
    if (!statusTarget) return;
    await setStatus.mutateAsync({ id: statusTarget._id, isActive: !statusTarget.isActive });
    setStatusTarget(null);
  }

  const isSaving = createClient.isPending || updateClient.isPending;

  return (
    <div>
      <PageHeader
        title="Clientes"
        description="Tu base de clientes y su historial."
        action={
          <Button onClick={openCreate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nuevo cliente
          </Button>
        }
      />

      <div className="mb-4 flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2.5">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre o teléfono"
          className="w-full bg-transparent text-base text-primary outline-none"
        />
      </div>

      {isLoading && (
        <div className="flex justify-center py-8 text-accent">
          <Spinner />
        </div>
      )}

      {!isLoading && clients?.length === 0 && (
        <EmptyState icon={User} title="Sin resultados" description="No se encontraron clientes." />
      )}

      <div className="flex flex-col gap-2">
        {clients?.map((client) => (
          <div
            key={client._id}
            className="flex items-center gap-3 rounded-2xl border border-border bg-background shadow-soft p-3 transition-shadow hover:shadow-sm"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface">
              <User className="h-5 w-5 text-accent" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-primary">{client.name}</p>
                <StatusBadge active={client.isActive} />
              </div>
              <p className="text-sm text-muted-foreground">{client.phone}</p>
            </div>
            <div className="flex gap-1">
              <IconButton onClick={() => openEdit(client)} aria-label="Editar">
                <Pencil className="h-4 w-4" />
              </IconButton>
              <IconButton
                variant="danger"
                onClick={() => setStatusTarget(client)}
                aria-label={client.isActive ? "Desactivar" : "Activar"}
              >
                <Power className="h-4 w-4" />
              </IconButton>
            </div>
          </div>
        ))}
      </div>

      <Modal open={open} title={editing ? "Editar cliente" : "Nuevo cliente"} onClose={() => setOpen(false)}>
        <form onSubmit={handleSubmit}>
          <Field label="Nombre">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </Field>
          <Field label="Teléfono">
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              inputMode="tel"
              required
            />
          </Field>
          <Field label="Email (opcional)">
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
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
        title={statusTarget?.isActive ? "Desactivar cliente" : "Activar cliente"}
        description={
          statusTarget?.isActive
            ? "No aparecerá en el buscador para nuevas citas, pero su historial se conserva."
            : "El cliente volverá a estar disponible para agendar citas."
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
