import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import type { PaymentMethod } from "../api/types";

export function usePaymentMethods() {
  return useQuery({
    queryKey: ["payment-methods"],
    queryFn: async () => (await apiClient.get<PaymentMethod[]>("/business/payment-methods")).data,
  });
}

export function useCreatePaymentMethod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string }) =>
      (await apiClient.post<PaymentMethod>("/business/payment-methods", payload)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["payment-methods"] }),
  });
}

export function useUpdatePaymentMethod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) =>
      (await apiClient.patch<PaymentMethod>(`/business/payment-methods/${id}`, { name })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["payment-methods"] }),
  });
}

export function useSetPaymentMethodStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) =>
      (await apiClient.patch<PaymentMethod>(`/business/payment-methods/${id}/status`, { isActive }))
        .data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["payment-methods"] }),
  });
}
