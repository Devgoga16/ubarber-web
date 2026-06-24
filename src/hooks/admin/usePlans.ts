import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../api/client";
import type { Plan } from "../../api/types";

export interface PlanInput {
  name: string;
  description?: string;
  priceCents: number;
  billingPeriod: "monthly" | "yearly";
  limits: { maxLocations: number; maxBarbers: number; maxAppointmentsPerMonth: number };
  features: string[];
  highlighted: boolean;
  sortOrder: number;
  whatsappEnabled: boolean;
}

export function usePlans() {
  return useQuery({
    queryKey: ["admin", "plans"],
    queryFn: async () => (await apiClient.get<Plan[]>("/admin/plans")).data,
  });
}

export function useCreatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: PlanInput) => (await apiClient.post<Plan>("/admin/plans", payload)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "plans"] }),
  });
}

export function useUpdatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<PlanInput> & { id: string }) =>
      (await apiClient.patch<Plan>(`/admin/plans/${id}`, payload)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "plans"] }),
  });
}

export function useSetPlanActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) =>
      (await apiClient.patch<Plan>(`/admin/plans/${id}/active`, { isActive })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "plans"] }),
  });
}

export function useDeletePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await apiClient.delete(`/admin/plans/${id}`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "plans"] }),
  });
}
