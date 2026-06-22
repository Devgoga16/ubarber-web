import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../api/client";
import type { Business, SubscriptionStatus } from "../../api/types";

export function useBusinesses() {
  return useQuery({
    queryKey: ["admin", "businesses"],
    queryFn: async () => (await apiClient.get<Business[]>("/admin/businesses")).data,
  });
}

export function useCreateBusiness() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      businessName: string;
      phone?: string;
      ownerName: string;
      ownerEmail: string;
      ownerPassword: string;
      planId: string;
    }) => (await apiClient.post("/admin/businesses", payload)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "businesses"] }),
  });
}

export function useSetSubscriptionStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ businessId, status }: { businessId: string; status: SubscriptionStatus }) =>
      (await apiClient.patch(`/admin/businesses/${businessId}/subscription/status`, { status })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "businesses"] }),
  });
}

export function useChangeSubscriptionPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ businessId, planId }: { businessId: string; planId: string }) =>
      (await apiClient.patch(`/admin/businesses/${businessId}/subscription/plan`, { planId })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "businesses"] }),
  });
}

export function useRegisterPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      businessId,
      amountCents,
      note,
    }: {
      businessId: string;
      amountCents: number;
      note?: string;
    }) =>
      (
        await apiClient.post(`/admin/businesses/${businessId}/subscription/payments`, {
          amountCents,
          note,
        })
      ).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "businesses"] }),
  });
}
