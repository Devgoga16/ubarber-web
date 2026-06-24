import { useState } from "react";
import { Receipt } from "lucide-react";
import { useInvoices, usePayInvoice } from "../../hooks/admin/useInvoices";
import { Button } from "../../components/ui/Button";
import { PageHeader } from "../../components/ui/PageHeader";
import { Spinner } from "../../components/ui/Spinner";
import { cn } from "../../lib/utils";
import { formatCurrency } from "../../lib/format";
import type { InvoiceStatus } from "../../api/types";

const statusLabels: Record<InvoiceStatus, string> = {
  pending: "Pendiente",
  overdue: "Vencida",
  paid: "Pagada",
  cancelled: "Cancelada",
};

const statusColors: Record<InvoiceStatus, string> = {
  pending: "bg-info/15 text-info",
  overdue: "bg-danger/15 text-danger",
  paid: "bg-success/15 text-success",
  cancelled: "bg-muted/15 text-muted-foreground",
};

const filterOptions: { label: string; value: InvoiceStatus | undefined }[] = [
  { label: "Todas", value: undefined },
  { label: "Pendientes", value: "pending" },
  { label: "Vencidas", value: "overdue" },
  { label: "Pagadas", value: "paid" },
];

function daysUntil(dateStr: string): number {
  const diffMs = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diffMs / (24 * 60 * 60 * 1000));
}

export function AdminPaymentsPage() {
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | undefined>(undefined);
  const { data: invoices, isLoading } = useInvoices(statusFilter);
  const payInvoice = usePayInvoice();
  const [error, setError] = useState<string | null>(null);

  async function handlePay(invoiceId: string) {
    setError(null);
    try {
      await payInvoice.mutateAsync(invoiceId);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "No se pudo registrar el pago de la factura");
    }
  }

  return (
    <div>
      <PageHeader title="Pagos" description="Facturas emitidas a los owners y su estado de pago." />

      <div className="mb-4 flex flex-wrap gap-2">
        {filterOptions.map((option) => (
          <button
            key={option.label}
            onClick={() => setStatusFilter(option.value)}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
              statusFilter === option.value
                ? "bg-accent text-accent-foreground"
                : "border border-border bg-background text-muted-foreground hover:text-primary"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {error && <p className="mb-3 text-sm text-danger">{error}</p>}

      {isLoading && (
        <div className="flex justify-center py-8 text-accent">
          <Spinner />
        </div>
      )}

      <div className="flex flex-col gap-2">
        {invoices?.map((invoice) => {
          const business = typeof invoice.businessId === "object" ? invoice.businessId : null;
          const plan = typeof invoice.planId === "object" ? invoice.planId : null;
          const remainingDays = daysUntil(invoice.dueDate);

          return (
            <div
              key={invoice._id}
              className="rounded-2xl border border-border bg-background shadow-soft p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-accent" />
                  <div>
                    <p className="font-medium text-primary">{business?.name ?? "—"}</p>
                    <p className="text-sm text-muted-foreground">{business?.ownerEmail}</p>
                  </div>
                </div>
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium",
                    statusColors[invoice.status]
                  )}
                >
                  {statusLabels[invoice.status]}
                </span>
              </div>

              <p className="mt-2 text-sm text-muted-foreground">
                Plan: {plan?.name ?? "—"} · {formatCurrency(invoice.amountCents)} · vence{" "}
                {new Date(invoice.dueDate).toLocaleDateString("es")}
                {invoice.status === "pending" &&
                  (remainingDays >= 0
                    ? ` (${remainingDays} día${remainingDays === 1 ? "" : "s"} restantes)`
                    : ` (vencida hace ${Math.abs(remainingDays)} día${Math.abs(remainingDays) === 1 ? "" : "s"})`)}
                {invoice.status === "overdue" &&
                  ` · dentro de la ventana de 5 días de gracia antes de la suspensión`}
              </p>

              {invoice.status !== "paid" && invoice.status !== "cancelled" && (
                <div className="mt-3">
                  <Button
                    variant="secondary"
                    className="px-3 py-1.5 text-sm"
                    loading={payInvoice.isPending}
                    onClick={() => handlePay(invoice._id)}
                  >
                    Marcar como pagada
                  </Button>
                </div>
              )}
            </div>
          );
        })}
        {invoices?.length === 0 && (
          <p className="text-sm text-muted-foreground">No hay facturas para este filtro.</p>
        )}
      </div>
    </div>
  );
}
