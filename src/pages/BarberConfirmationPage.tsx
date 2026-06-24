import { useState } from "react";
import { useParams } from "react-router-dom";
import { CalendarDays, Check, Scissors, User, X } from "lucide-react";
import {
  useAppointmentConfirmation,
  useAcceptConfirmation,
  useRejectConfirmation,
} from "../hooks/useAppointmentConfirmation";
import { Button } from "../components/ui/Button";
import { Spinner } from "../components/ui/Spinner";

export function BarberConfirmationPage() {
  const { token } = useParams<{ token: string }>();
  const { data, isLoading, error, refetch } = useAppointmentConfirmation(token ?? "");
  const accept = useAcceptConfirmation(token ?? "");
  const reject = useRejectConfirmation(token ?? "");
  const [actionError, setActionError] = useState<string | null>(null);
  const [done, setDone] = useState<"accepted" | "rejected" | null>(null);

  async function handleAccept() {
    setActionError(null);
    try {
      await accept.mutateAsync();
      setDone("accepted");
    } catch (err: any) {
      setActionError(err?.response?.data?.message ?? "No se pudo confirmar la cita");
    }
  }

  async function handleReject() {
    setActionError(null);
    try {
      await reject.mutateAsync(undefined);
      setDone("rejected");
    } catch (err: any) {
      setActionError(err?.response?.data?.message ?? "No se pudo rechazar la cita");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-background p-6 shadow-soft-lg sm:p-8">
        <div className="mb-5 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-accent shadow-soft">
            <Scissors className="h-5 w-5 text-accent-foreground" />
          </div>
          <h1 className="font-heading text-lg font-semibold tracking-tight text-primary">uBarber</h1>
        </div>

        {isLoading && (
          <div className="flex justify-center py-8 text-accent">
            <Spinner />
          </div>
        )}

        {!isLoading && error && (
          <p className="text-sm text-danger">
            {(error as any)?.response?.data?.message ?? "Este enlace ya no es válido."}
          </p>
        )}

        {!isLoading && data && !done && (
          <>
            <p className="mb-4 text-sm text-muted-foreground">
              Solicitud de cita en <strong className="text-primary">{data.businessName}</strong>
            </p>

            <div className="mb-5 flex flex-col gap-2 rounded-xl border border-border bg-surface p-3 text-sm">
              <div className="flex items-center gap-2 text-primary">
                <User className="h-4 w-4 text-accent" />
                {data.clientName}
              </div>
              <div className="flex items-center gap-2 text-primary">
                <Scissors className="h-4 w-4 text-accent" />
                {data.serviceNames.join(", ")}
              </div>
              <div className="flex items-center gap-2 text-primary">
                <CalendarDays className="h-4 w-4 text-accent" />
                {new Date(data.startsAt).toLocaleString("es", {
                  dateStyle: "long",
                  timeStyle: "short",
                })}
              </div>
            </div>

            {data.depositStatus !== "awaiting_barber" ? (
              <p className="text-sm text-muted-foreground">Esta cita ya fue resuelta anteriormente.</p>
            ) : (
              <>
                <p className="mb-4 text-sm text-muted-foreground">¿Tienes disponibilidad para esta cita?</p>
                {actionError && <p className="mb-3 text-sm text-danger">{actionError}</p>}
                <div className="flex gap-2">
                  <Button
                    variant="danger"
                    className="flex flex-1 items-center justify-center gap-1.5"
                    loading={reject.isPending}
                    onClick={handleReject}
                  >
                    <X className="h-4 w-4" />
                    Rechazar
                  </Button>
                  <Button
                    className="flex flex-1 items-center justify-center gap-1.5"
                    loading={accept.isPending}
                    onClick={handleAccept}
                  >
                    <Check className="h-4 w-4" />
                    Aceptar
                  </Button>
                </div>
              </>
            )}
          </>
        )}

        {done === "accepted" && (
          <p className="text-sm text-success">
            Confirmaste la cita. Si el cliente todavía debe enviar el comprobante de adelanto, te
            avisaremos cuando lo revise el dueño del negocio.
          </p>
        )}
        {done === "rejected" && (
          <p className="text-sm text-muted-foreground">
            Rechazaste la cita y avisamos al cliente para que agende en otro horario.
          </p>
        )}

        {!isLoading && error && (
          <Button variant="secondary" className="mt-4 w-full" onClick={() => refetch()}>
            Reintentar
          </Button>
        )}
      </div>
    </div>
  );
}
