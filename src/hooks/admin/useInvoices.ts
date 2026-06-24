import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../api/client";
import type { Invoice, InvoiceStatus } from "../../api/types";

export function useInvoices(status?: InvoiceStatus) {
  return useQuery({
    queryKey: ["admin", "invoices", status ?? "all"],
    queryFn: async () =>
      (
        await apiClient.get<Invoice[]>("/admin/invoices", {
          params: status ? { status } : undefined,
        })
      ).data,
  });
}

export function usePayInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (invoiceId: string) =>
      (await apiClient.post(`/admin/invoices/${invoiceId}/pay`)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "invoices"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "businesses"] });
    },
  });
}
