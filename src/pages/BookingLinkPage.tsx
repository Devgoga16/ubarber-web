import { useMemo, useState } from "react";
import { Copy, Check, MessageCircle, Link as LinkIcon } from "lucide-react";
import { usePublicLink } from "../hooks/usePublicLink";
import { useLocations } from "../hooks/useLocations";
import { useBarbers } from "../hooks/useBarbers";
import { useServices } from "../hooks/useServices";
import { PageHeader } from "../components/ui/PageHeader";
import { Field } from "../components/ui/Field";
import { Button } from "../components/ui/Button";
import { Spinner } from "../components/ui/Spinner";

export function BookingLinkPage() {
  const { data: linkInfo, isLoading } = usePublicLink();
  const { data: locations } = useLocations();
  const { data: barbers } = useBarbers();
  const { data: services } = useServices();

  const [locationId, setLocationId] = useState("");
  const [barberId, setBarberId] = useState("");
  const [serviceIds, setServiceIds] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  function toggleService(id: string) {
    setServiceIds((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  }

  const url = useMemo(() => {
    if (!linkInfo) return "";
    const base = `${window.location.origin}/reservar/${linkInfo.slug}`;
    const params = new URLSearchParams();
    if (locationId) params.set("sede", locationId);
    if (barberId) params.set("barbero", barberId);
    if (serviceIds.length > 0) params.set("servicios", serviceIds.join(","));
    const query = params.toString();
    return query ? `${base}?${query}` : base;
  }, [linkInfo, locationId, barberId, serviceIds]);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleShareWhatsApp() {
    const text = encodeURIComponent(`Hola, agenda tu cita aquí: ${url}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
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
        title="Enlace de reservas"
        description="Personaliza el link y envíaselo a un cliente por WhatsApp para que agende sin necesidad de cuenta."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-background p-4 shadow-soft">
          <Field label="Sede (opcional)">
            <select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-base text-primary"
            >
              <option value="">Que el cliente elija</option>
              {locations?.map((l) => (
                <option key={l._id} value={l._id}>
                  {l.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Barbero (opcional)">
            <select
              value={barberId}
              onChange={(e) => setBarberId(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-base text-primary"
            >
              <option value="">Que el cliente elija</option>
              {barbers?.map((b) => (
                <option key={b._id} value={b._id}>
                  {typeof b.userId === "object" ? b.userId.name : b._id}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Servicios (opcional)">
            <div className="flex flex-col gap-2">
              {services?.map((s) => (
                <label key={s._id} className="flex items-center gap-2 text-sm text-primary">
                  <input
                    type="checkbox"
                    checked={serviceIds.includes(s._id)}
                    onChange={() => toggleService(s._id)}
                  />
                  {s.name}
                </label>
              ))}
            </div>
          </Field>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-background p-4 shadow-soft">
          <div>
            <p className="mb-2 text-sm font-medium text-primary">Tu enlace personalizado</p>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2.5">
              <LinkIcon className="h-4 w-4 shrink-0 text-accent" />
              <p className="truncate text-sm text-primary">{url}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleCopy} className="flex flex-1 items-center justify-center gap-2">
              {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copiado" : "Copiar"}
            </Button>
            <Button onClick={handleShareWhatsApp} className="flex flex-1 items-center justify-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Enviar por WhatsApp
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            "Enviar por WhatsApp" abre tu propio WhatsApp con el mensaje listo — elige ahí el
            contacto del cliente y envíalo.
          </p>
        </div>
      </div>
    </div>
  );
}
