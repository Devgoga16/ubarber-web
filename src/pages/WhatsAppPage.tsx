import { useState } from "react";
import { MessageCircle, CheckCircle2, Power, Lock } from "lucide-react";
import { useWhatsAppStatus, useConnectWhatsApp, useDisconnectWhatsApp } from "../hooks/useWhatsApp";
import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/Button";
import { Spinner } from "../components/ui/Spinner";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";

export function WhatsAppPage() {
  const { data, isLoading } = useWhatsAppStatus();
  const connect = useConnectWhatsApp();
  const disconnect = useDisconnectWhatsApp();
  const [confirmingDisconnect, setConfirmingDisconnect] = useState(false);

  const status = data?.status ?? "disconnected";
  const planAllowsWhatsApp = data?.planAllowsWhatsApp ?? true;

  async function handleDisconnect() {
    await disconnect.mutateAsync();
    setConfirmingDisconnect(false);
  }

  return (
    <div>
      <PageHeader
        title="WhatsApp"
        description="Conecta el WhatsApp del negocio para enviar recordatorios de citas y el resumen de pago a tus clientes."
      />

      <div className="mx-auto max-w-sm rounded-2xl border border-border bg-background p-6 text-center shadow-soft">
        {isLoading && (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        )}

        {!isLoading && !planAllowsWhatsApp && (
          <>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted/15">
              <Lock className="h-7 w-7 text-muted-foreground" />
            </div>
            <h2 className="font-heading mb-1 text-lg font-semibold text-primary">
              No disponible en tu plan
            </h2>
            <p className="text-sm text-muted-foreground">
              La integración de WhatsApp (recordatorios y confirmaciones automáticas) no está
              incluida en tu plan actual. Habla con nosotros para actualizarlo.
            </p>
          </>
        )}

        {!isLoading && planAllowsWhatsApp && status === "connected" && (
          <>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success/15">
              <CheckCircle2 className="h-7 w-7 text-success" />
            </div>
            <h2 className="font-heading mb-1 text-lg font-semibold text-primary">
              WhatsApp conectado
            </h2>
            {data?.qr === null && (
              <p className="mb-6 text-sm text-muted-foreground">
                Los recordatorios y resúmenes de pago se enviarán desde este número.
              </p>
            )}
            <Button
              variant="danger"
              onClick={() => setConfirmingDisconnect(true)}
              className="flex w-full items-center justify-center gap-2"
            >
              <Power className="h-4 w-4" />
              Desconectar
            </Button>
          </>
        )}

        {!isLoading && planAllowsWhatsApp && status !== "connected" && (
          <>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/15">
              <MessageCircle className="h-7 w-7 text-accent" />
            </div>

            {status === "connecting" && data?.qr && (
              <>
                <h2 className="font-heading mb-1 text-lg font-semibold text-primary">
                  Escanea este código QR
                </h2>
                <p className="mb-4 text-sm text-muted-foreground">
                  Abre WhatsApp en tu teléfono → Dispositivos vinculados → Vincular un dispositivo.
                </p>
                <img
                  src={data.qr}
                  alt="Código QR de WhatsApp"
                  className="mx-auto mb-4 h-56 w-56 rounded-lg border border-border"
                />
                <p className="text-xs text-muted-foreground">
                  El código se renueva solo cada poco tiempo, no hace falta recargar la página.
                </p>
              </>
            )}

            {status === "connecting" && !data?.qr && (
              <>
                <h2 className="font-heading mb-1 text-lg font-semibold text-primary">
                  Generando código QR...
                </h2>
                <div className="flex justify-center py-4">
                  <Spinner />
                </div>
              </>
            )}

            {status === "disconnected" && (
              <>
                <h2 className="font-heading mb-1 text-lg font-semibold text-primary">
                  WhatsApp no conectado
                </h2>
                <p className="mb-6 text-sm text-muted-foreground">
                  Conecta el WhatsApp del negocio para que los recordatorios y resúmenes de pago
                  salgan desde tu propio número.
                </p>
                <Button
                  onClick={() => connect.mutate()}
                  loading={connect.isPending}
                  className="flex w-full items-center justify-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  Conectar WhatsApp
                </Button>
              </>
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        open={confirmingDisconnect}
        title="Desconectar WhatsApp"
        description="Se cerrará la sesión de este número. Los recordatorios y resúmenes de pago dejarán de enviarse hasta que vuelvas a conectarlo."
        confirmLabel="Desconectar"
        danger
        loading={disconnect.isPending}
        onConfirm={handleDisconnect}
        onClose={() => setConfirmingDisconnect(false)}
      />
    </div>
  );
}
