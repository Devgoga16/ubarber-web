import { useEffect, useState } from "react";
import { RefreshCw, ShieldCheck } from "lucide-react";
import {
  useDepositSettings,
  useUpdateDepositSettings,
  useRegenerateTrustCode,
} from "../hooks/useDepositSettings";
import { PageHeader } from "../components/ui/PageHeader";
import { Field, Input } from "../components/ui/Field";
import { Button } from "../components/ui/Button";
import { Spinner } from "../components/ui/Spinner";
import { cn } from "../lib/utils";

export function DepositSettingsPage() {
  const { data, isLoading } = useDepositSettings();
  const update = useUpdateDepositSettings();
  const regenerate = useRegenerateTrustCode();

  const [enabled, setEnabled] = useState(false);
  const [scope, setScope] = useState<"global" | "per_service">("global");
  const [type, setType] = useState<"percentage" | "fixed">("percentage");
  const [valuePercent, setValuePercent] = useState("20");
  const [valueCents, setValueCents] = useState("0");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!data) return;
    setEnabled(data.depositEnabled);
    setScope(data.depositScope);
    setType(data.depositType);
    setValuePercent(String(data.depositValuePercent));
    setValueCents(String(data.depositValueCents / 100));
  }, [data]);

  async function handleSave() {
    setSaved(false);
    await update.mutateAsync({
      depositEnabled: enabled,
      depositScope: scope,
      depositType: type,
      depositValuePercent: Number(valuePercent),
      depositValueCents: Math.round(Number(valueCents) * 100),
    });
    setSaved(true);
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Adelantos"
        description="Pide un adelanto al reservar por el link público, para asegurar que el cliente sí va a venir."
      />

      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-background p-4 shadow-soft">
        <label className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-primary">Pedir adelanto al reservar online</p>
            <p className="text-xs text-muted-foreground">
              Si está apagado, el cliente reserva directo, sin pagar nada antes.
            </p>
          </div>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="h-5 w-5 accent-accent"
          />
        </label>

        {enabled && (
          <>
            <Field label="¿Cómo se calcula?">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setScope("global")}
                  className={cn(
                    "flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
                    scope === "global"
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border text-muted-foreground"
                  )}
                >
                  Igual para todos los servicios
                </button>
                <button
                  type="button"
                  onClick={() => setScope("per_service")}
                  className={cn(
                    "flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
                    scope === "per_service"
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border text-muted-foreground"
                  )}
                >
                  Distinto por servicio
                </button>
              </div>
              {scope === "per_service" && (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Configura el monto/porcentaje de cada servicio en "Servicios". Lo de aquí abajo se
                  usa como valor por defecto si un servicio no tiene uno propio.
                </p>
              )}
            </Field>

            <Field label={scope === "per_service" ? "Tipo por defecto" : "Tipo de adelanto"}>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setType("percentage")}
                  className={cn(
                    "flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
                    type === "percentage"
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border text-muted-foreground"
                  )}
                >
                  Porcentaje
                </button>
                <button
                  type="button"
                  onClick={() => setType("fixed")}
                  className={cn(
                    "flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
                    type === "fixed"
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border text-muted-foreground"
                  )}
                >
                  Monto fijo
                </button>
              </div>
            </Field>

            {type === "percentage" ? (
              <Field label="Porcentaje del total (%)">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={valuePercent}
                  onChange={(e) => setValuePercent(e.target.value)}
                />
              </Field>
            ) : (
              <Field label="Monto fijo (S/)">
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={valueCents}
                  onChange={(e) => setValueCents(e.target.value)}
                />
              </Field>
            )}
          </>
        )}

        {saved && <p className="text-sm text-success">Configuración guardada.</p>}

        <Button onClick={handleSave} loading={update.isPending} className="w-full sm:w-auto">
          Guardar configuración
        </Button>
      </div>

      <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-border bg-background p-4 shadow-soft">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-accent" />
          <p className="text-sm font-medium text-primary">Código de confianza (salvoconducto)</p>
        </div>
        <p className="text-xs text-muted-foreground">
          Para clientes que ya conoces: en vez de pedirles el comprobante del adelanto, les dictas
          este código y lo escriben al reservar. Pagan normal cuando termine el corte.
        </p>
        <div className="flex items-center gap-2">
          <div className="flex-1 rounded-lg border border-border bg-surface px-3 py-2.5 text-center font-heading text-lg font-semibold tracking-widest text-primary">
            {data?.trustCode}
          </div>
          <Button
            variant="secondary"
            onClick={() => regenerate.mutate()}
            loading={regenerate.isPending}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Regenerar
          </Button>
        </div>
      </div>
    </div>
  );
}
