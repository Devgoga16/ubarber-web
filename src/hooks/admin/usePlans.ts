import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../api/client";
import type { Plan } from "../../api/types";

export function usePlans() {
  return useQuery({
    queryKey: ["admin", "plans"],
    queryFn: async () => (await apiClient.get<Plan[]>("/admin/plans")).data,
  });
}

export function useCreatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      name: string;
      description?: string;
      priceCents: number;
      billingPeriod: "monthly" | "yearly";
      limits: { maxLocations: number; maxBarbers: number; maxAppointmentsPerMonth: number };
      features: string[];
    }) => (await apiClient.post<Plan>("/admin/plans", payload)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "plans"] }),
  });
}
