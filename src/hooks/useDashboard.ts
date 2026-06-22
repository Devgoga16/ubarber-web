import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import type { DashboardStats, Subscription } from "../api/types";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: async () => (await apiClient.get<DashboardStats>("/business/dashboard/stats")).data,
  });
}

export function useMySubscription() {
  return useQuery({
    queryKey: ["subscription", "mine"],
    queryFn: async () => (await apiClient.get<Subscription | null>("/business/subscription")).data,
  });
}
