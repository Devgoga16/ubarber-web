import { useState, type FormEvent } from "react";
import { Plus, Star, X, MessageCircle, Trash2 } from "lucide-react";
import {
  usePlans,
  useCreatePlan,
  useUpdatePlan,
  useSetPlanActive,
  useDeletePlan,
  type PlanInput,
} from "../../hooks/admin/usePlans";
import { Modal } from "../../components/ui/Modal";
import { Field, Input } from "../../components/ui/Field";
import { Button } from "../../components/ui/Button";
import { PageHeader } from "../../components/ui/PageHeader";
import { Spinner } from "../../components/ui/Spinner";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { cn } from "../../lib/utils";
import { formatCurrency } from "../../lib/format";
import type { Plan } from "../../api/types";

interface PlanFormState {
  name: string;
  description: string;
  price: string;
  billingPeriod: "monthly" | "yearly";
  maxLocations: string;
  maxBarbers: string;
  maxAppointments: string;
  features: string[];
  featureDraft: string;
  highlighted: boolean;
  sortOrder: string;
  whatsappEnabled: boolean;
}

const emptyForm: PlanFormState = {
  name: "",
  description: "",
  price: "",
  billingPeriod: "monthly",
  maxLocations: "1",
  maxBarbers: "5",
  maxAppointments: "500",
  features: [],
  featureDraft: "",
  highlighted: false,
  sortOrder: "0",
  whatsappEnabled: true,
};

function planToForm(plan: Plan): PlanFormState {
  return {
    name: plan.name,
    description: plan.description ?? "",
    price: (plan.priceCents / 100).toString(),
    billingPeriod: plan.billingPeriod,
    maxLocations: plan.limits.maxLocations.toString(),
    maxBarbers: plan.limits.maxBarbers.toString(),
    maxAppointments: plan.limits.maxAppointmentsPerMonth.toString(),
    features: plan.features,
    featureDraft: "",
    highlighted: plan.highlighted,
    sortOrder: plan.sortOrder.toString(),
    whatsappEnabled: plan.whatsappEnabled,
  };
}

function formToPayload(form: PlanFormState): PlanInput {
  return {
    name: form.name,
    description: form.description || undefined,
    priceCents: Math.round(Number(form.price) * 100),
    billingPeriod: form.billingPeriod,
    limits: {
      maxLocations: Number(form.maxLocations),
      maxBarbers: Number(form.maxBarbers),
      maxAppointmentsPerMonth: Number(form.maxAppointments),
    },
    features: form.features,
    highlighted: form.highlighted,
    sortOrder: Number(form.sortOrder) || 0,
    whatsappEnabled: form.whatsappEnabled,
  };
}

export function AdminPlansPage() {
  const { data: plans, isLoading } = usePlans();
  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan();
  const setPlanActive = useSetPlanActive();
  const deletePlan = useDeletePlan();

  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<PlanFormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleDeletePlan() {
    if (!planToDelete) return;
    setDeleteError(null);
    try {
      await deletePlan.mutateAsync(planToDelete._id);
      setPlanToDelete(null);
    } catch (err: any) {
      setDeleteError(err?.response?.data?.message ?? "No se pudo eliminar el plan");
    }
  }

  function openCreate() {
    setEditingPlan(null);
    setForm(emptyForm);
    setError(null);
    setOpen(true);
  }

  function openEdit(plan: Plan) {
    setEditingPlan(plan);
    setForm(planToForm(plan));
    setError(null);
    setOpen(true);
  }

  function addFeature() {
    const value = form.featureDraft.trim();
    if (!value) return;
    setForm((prev) => ({ ...prev, features: [...prev.features, value], featureDraft: "" }));
  }

  function removeFeature(index: number) {
    setForm((prev) => ({ ...prev, features: prev.features.filter((_, i) => i !== index) }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      const payload = formToPayload(form);
      if (editingPlan) {
        await updatePlan.mutateAsync({ id: editingPlan._id, ...payload });
      } else {
        await createPlan.mutateAsync(payload);
      }
      setOpen(false);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "No se pudo guardar el plan");
    }
  }

  return (
    <div>
      <PageHeader
        title="Planes"
        description="Estos planes se usan al crear negocios y son los que se muestran en la landing pública."
        action={
          <Button onClick={openCreate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nuevo plan
          </Button>
        }
      />

      {isLoading && (
        <div className="flex justify-center py-8 text-accent">
          <Spinner />
        </div>
      )}

      <div className="flex flex-col gap-2">
        {plans?.map((plan) => (
          <div key={plan._id} className="rounded-2xl border border-border bg-background p-4 shadow-soft">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-primary">{plan.name}</p>
                  {plan.highlighted && (
                    <span className="flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-xs font-medium text-accent">
                      <Star className="h-3 w-3" />
                      Destacado
                    </span>
                  )}
                  {!plan.isActive && (
                    <span className="rounded-full bg-muted/20 px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      Inactivo
                    </span>
                  )}
                  {plan.whatsappEnabled && (
                    <span className="flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-xs font-medium text-success">
                      <MessageCircle className="h-3 w-3" />
                      WhatsApp
                    </span>
                  )}
                </div>
                {plan.description && <p className="text-sm text-muted-foreground">{plan.description}</p>}
              </div>
              <p className="font-heading text-lg font-semibold text-primary">
                {formatCurrency(plan.priceCents)}
                <span className="text-sm font-normal text-muted-foreground">
                  /{plan.billingPeriod === "monthly" ? "mes" : "año"}
                </span>
              </p>
            </div>

            <p className="mt-2 text-sm text-muted-foreground">
              Hasta {plan.limits.maxLocations} sede(s) · {plan.limits.maxBarbers} barbero(s) ·{" "}
              {plan.limits.maxAppointmentsPerMonth} citas/mes
            </p>

            {plan.features.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {plan.features.map((feature) => (
                  <span
                    key={feature}
                    className="rounded-full border border-border bg-surface px-2.5 py-0.5 text-xs text-primary"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="secondary" className="px-3 py-1.5 text-sm" onClick={() => openEdit(plan)}>
                Editar
              </Button>
              <Button
                variant="secondary"
                className="px-3 py-1.5 text-sm"
                onClick={() => setPlanActive.mutate({ id: plan._id, isActive: !plan.isActive })}
              >
                {plan.isActive ? "Desactivar" : "Activar"}
              </Button>
              <Button
                variant="danger"
                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-sm"
                onClick={() => {
                  setDeleteError(null);
                  setPlanToDelete(plan);
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Eliminar
              </Button>
            </div>
          </div>
        ))}
        {plans?.length === 0 && <p className="text-sm text-muted-foreground">Aún no hay planes creados.</p>}
      </div>

      <Modal open={open} title={editingPlan ? "Editar plan" : "Nuevo plan"} onClose={() => setOpen(false)}>
        <form onSubmit={handleSubmit}>
          <Field label="Nombre">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </Field>
          <Field label="Descripción (opcional)">
            <Input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Ideal para barberías con 1 sede"
            />
          </Field>
          <Field label="Precio">
            <Input
              type="number"
              min={0}
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
            />
          </Field>
          <Field label="Periodicidad">
            <select
              value={form.billingPeriod}
              onChange={(e) => setForm({ ...form, billingPeriod: e.target.value as "monthly" | "yearly" })}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-base text-primary"
            >
              <option value="monthly">Mensual</option>
              <option value="yearly">Anual</option>
            </select>
          </Field>
          <Field label="Máx. sedes">
            <Input
              type="number"
              min={1}
              value={form.maxLocations}
              onChange={(e) => setForm({ ...form, maxLocations: e.target.value })}
              required
            />
          </Field>
          <Field label="Máx. barberos">
            <Input
              type="number"
              min={1}
              value={form.maxBarbers}
              onChange={(e) => setForm({ ...form, maxBarbers: e.target.value })}
              required
            />
          </Field>
          <Field label="Máx. citas / mes">
            <Input
              type="number"
              min={1}
              value={form.maxAppointments}
              onChange={(e) => setForm({ ...form, maxAppointments: e.target.value })}
              required
            />
          </Field>

          <Field label="Características (se muestran en la landing)">
            <div className="flex gap-2">
              <Input
                value={form.featureDraft}
                onChange={(e) => setForm({ ...form, featureDraft: e.target.value })}
                placeholder="Ej: WhatsApp automático"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addFeature();
                  }
                }}
              />
              <Button type="button" variant="secondary" className="px-3" onClick={addFeature}>
                Agregar
              </Button>
            </div>
          </Field>
          {form.features.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {form.features.map((feature, index) => (
                <span
                  key={`${feature}-${index}`}
                  className="flex items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-1 text-xs text-primary"
                >
                  {feature}
                  <button type="button" onClick={() => removeFeature(index)} className="text-muted-foreground hover:text-danger">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <Field label="Orden (menor número aparece primero)">
            <Input
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
            />
          </Field>

          <label className="mb-3 flex items-center gap-2 text-sm font-medium text-primary">
            <input
              type="checkbox"
              checked={form.highlighted}
              onChange={(e) => setForm({ ...form, highlighted: e.target.checked })}
              className={cn("h-4 w-4 rounded border-border accent-accent")}
            />
            Marcar como plan destacado en la landing
          </label>

          <label className="mb-4 flex items-center gap-2 text-sm font-medium text-primary">
            <input
              type="checkbox"
              checked={form.whatsappEnabled}
              onChange={(e) => setForm({ ...form, whatsappEnabled: e.target.checked })}
              className={cn("h-4 w-4 rounded border-border accent-accent")}
            />
            Incluye integración de WhatsApp
          </label>

          {error && <p className="mb-3 text-sm text-danger">{error}</p>}
          <Button
            type="submit"
            loading={createPlan.isPending || updatePlan.isPending}
            className="w-full"
          >
            {editingPlan ? "Guardar cambios" : "Crear plan"}
          </Button>
        </form>
      </Modal>

      <ConfirmDialog
        open={planToDelete !== null}
        title="Eliminar plan"
        description={
          deleteError ??
          `¿Eliminar el plan "${planToDelete?.name}"? Esta acción no se puede deshacer. Si hay negocios usándolo, no se podrá eliminar.`
        }
        confirmLabel="Eliminar"
        danger
        loading={deletePlan.isPending}
        onConfirm={handleDeletePlan}
        onClose={() => setPlanToDelete(null)}
      />
    </div>
  );
}
