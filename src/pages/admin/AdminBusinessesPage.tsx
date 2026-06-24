import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Plus, Building2, Trash2, Settings } from "lucide-react";
import {
  useBusinesses,
  useCreateBusiness,
  useSetSubscriptionStatus,
  useChangeSubscriptionPlan,
  useRegisterPayment,
  useDeleteBusiness,
} from "../../hooks/admin/useBusinesses";
import { usePlans } from "../../hooks/admin/usePlans";
import { Modal } from "../../components/ui/Modal";
import { Field, Input } from "../../components/ui/Field";
import { Button } from "../../components/ui/Button";
import { PageHeader } from "../../components/ui/PageHeader";
import { Spinner } from "../../components/ui/Spinner";
import { cn } from "../../lib/utils";
import type { Business, SubscriptionStatus } from "../../api/types";

const statusLabels: Record<SubscriptionStatus, string> = {
  trial: "Prueba",
  active: "Activa",
  past_due: "Pago atrasado",
  suspended: "Suspendida",
  cancelled: "Cancelada",
};

const statusColors: Record<SubscriptionStatus, string> = {
  trial: "bg-info/15 text-info",
  active: "bg-success/15 text-success",
  past_due: "bg-warning/15 text-warning",
  suspended: "bg-danger/15 text-danger",
  cancelled: "bg-danger/15 text-danger",
};

export function AdminBusinessesPage() {
  const { data: businesses, isLoading } = useBusinesses();
  const { data: plans } = usePlans();
  const createBusiness = useCreateBusiness();
  const setStatus = useSetSubscriptionStatus();
  const changePlan = useChangeSubscriptionPlan();
  const registerPayment = useRegisterPayment();
  const deleteBusiness = useDeleteBusiness();

  const [openBusiness, setOpenBusiness] = useState(false);
  const [paymentBusinessId, setPaymentBusinessId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentNote, setPaymentNote] = useState("");
  const [businessToDelete, setBusinessToDelete] = useState<Business | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [planId, setPlanId] = useState("");

  async function handleCreateBusiness(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      await createBusiness.mutateAsync({
        businessName,
        ownerName,
        ownerEmail,
        ownerPassword,
        planId,
      });
      setOpenBusiness(false);
      setBusinessName("");
      setOwnerName("");
      setOwnerEmail("");
      setOwnerPassword("");
      setPlanId("");
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "No se pudo crear el negocio");
    }
  }

  async function handleDeleteBusiness() {
    if (!businessToDelete) return;
    setError(null);
    try {
      await deleteBusiness.mutateAsync(businessToDelete._id);
      setBusinessToDelete(null);
      setDeleteConfirmText("");
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "No se pudo eliminar el negocio");
    }
  }

  async function handleRegisterPayment(event: FormEvent) {
    event.preventDefault();
    if (!paymentBusinessId) return;
    setError(null);
    try {
      await registerPayment.mutateAsync({
        businessId: paymentBusinessId,
        amountCents: Math.round(Number(paymentAmount) * 100),
        note: paymentNote || undefined,
      });
      setPaymentBusinessId(null);
      setPaymentAmount("");
      setPaymentNote("");
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "No se pudo registrar el pago");
    }
  }

  return (
    <div>
      <PageHeader
        title="Negocios"
        description="Planes, suscripciones y clientes del SaaS."
        action={
          <div className="flex gap-2">
            <Link to="/admin/planes">
              <Button variant="secondary" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Gestionar planes
              </Button>
            </Link>
            <Button onClick={() => setOpenBusiness(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nuevo negocio
            </Button>
          </div>
        }
      />

      {isLoading && (
        <div className="flex justify-center py-8 text-accent">
          <Spinner />
        </div>
      )}

      <div className="flex flex-col gap-2">
        {businesses?.map((business) => (
          <div key={business._id} className="rounded-2xl border border-border bg-background shadow-soft p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-accent" />
                <div>
                  <p className="font-medium text-primary">{business.name}</p>
                  <p className="text-sm text-muted-foreground">{business.ownerEmail}</p>
                </div>
              </div>
              {business.subscription && (
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium",
                    statusColors[business.subscription.status]
                  )}
                >
                  {statusLabels[business.subscription.status]}
                </span>
              )}
            </div>

            {business.subscription && (
              <p className="mt-2 text-sm text-muted-foreground">
                Plan:{" "}
                {typeof business.subscription.planId === "object"
                  ? business.subscription.planId.name
                  : "—"}{" "}
                · vence{" "}
                {new Date(business.subscription.currentPeriodEnd).toLocaleDateString("es")}
              </p>
            )}

            {business.subscription && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {business.subscription.status !== "suspended" ? (
                  <Button
                    variant="secondary"
                    className="px-3 py-1.5 text-sm"
                    onClick={() =>
                      setStatus.mutate({ businessId: business._id, status: "suspended" })
                    }
                  >
                    Suspender
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    className="px-3 py-1.5 text-sm"
                    onClick={() => setStatus.mutate({ businessId: business._id, status: "active" })}
                  >
                    Reactivar
                  </Button>
                )}

                <Button
                  variant="secondary"
                  className="px-3 py-1.5 text-sm"
                  onClick={() => setPaymentBusinessId(business._id)}
                >
                  Registrar pago
                </Button>

                <select
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) {
                      changePlan.mutate({ businessId: business._id, planId: e.target.value });
                      e.target.value = "";
                    }
                  }}
                  className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-primary"
                >
                  <option value="">Cambiar plan...</option>
                  {plans?.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>

                <Button
                  variant="danger"
                  className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-sm"
                  onClick={() => setBusinessToDelete(business)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Eliminar
                </Button>
              </div>
            )}
          </div>
        ))}
        {businesses?.length === 0 && (
          <p className="text-sm text-muted-foreground">Aún no hay negocios registrados.</p>
        )}
      </div>

      <Modal open={openBusiness} title="Nuevo negocio" onClose={() => setOpenBusiness(false)}>
        <form onSubmit={handleCreateBusiness}>
          <Field label="Nombre del negocio">
            <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />
          </Field>
          <Field label="Nombre del owner">
            <Input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} required />
          </Field>
          <Field label="Email del owner">
            <Input
              type="email"
              value={ownerEmail}
              onChange={(e) => setOwnerEmail(e.target.value)}
              required
            />
          </Field>
          <Field label="Contraseña temporal">
            <Input
              type="password"
              minLength={6}
              value={ownerPassword}
              onChange={(e) => setOwnerPassword(e.target.value)}
              required
            />
          </Field>
          <Field label="Plan">
            <select
              value={planId}
              onChange={(e) => setPlanId(e.target.value)}
              required
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-base text-primary"
            >
              <option value="">Selecciona un plan</option>
              {plans?.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
          {error && <p className="mb-3 text-sm text-danger">{error}</p>}
          <Button type="submit" loading={createBusiness.isPending} className="w-full">
            Crear negocio
          </Button>
        </form>
      </Modal>

      <Modal
        open={paymentBusinessId !== null}
        title="Registrar pago"
        onClose={() => setPaymentBusinessId(null)}
      >
        <form onSubmit={handleRegisterPayment}>
          <Field label="Monto">
            <Input
              type="number"
              min={0}
              step="0.01"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              required
            />
          </Field>
          <Field label="Nota (opcional)">
            <Input value={paymentNote} onChange={(e) => setPaymentNote(e.target.value)} />
          </Field>
          <p className="mb-3 text-sm text-muted-foreground">
            Al registrar el pago se extiende el periodo y la suscripción queda activa.
          </p>
          {error && <p className="mb-3 text-sm text-danger">{error}</p>}
          <Button type="submit" loading={registerPayment.isPending} className="w-full">
            Registrar pago
          </Button>
        </form>
      </Modal>

      <Modal
        open={businessToDelete !== null}
        title="Eliminar negocio"
        onClose={() => {
          setBusinessToDelete(null);
          setDeleteConfirmText("");
        }}
      >
        <p className="mb-3 text-sm text-danger">
          Esta acción es irreversible. Se eliminarán el negocio <strong>{businessToDelete?.name}</strong>,
          su suscripción y facturas, citas, clientes, servicios, sedes, barberos, métodos de pago y
          usuarios asociados.
        </p>
        <Field label={`Escribe "${businessToDelete?.name}" para confirmar`}>
          <Input value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} />
        </Field>
        {error && <p className="mb-3 text-sm text-danger">{error}</p>}
        <Button
          variant="danger"
          className="w-full"
          disabled={deleteConfirmText !== businessToDelete?.name}
          loading={deleteBusiness.isPending}
          onClick={handleDeleteBusiness}
        >
          Eliminar definitivamente
        </Button>
      </Modal>
    </div>
  );
}
