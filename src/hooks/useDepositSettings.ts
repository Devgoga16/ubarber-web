import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import type { DepositType } from "../api/types";

export interface DepositSettings {
  depositEnabled: boolean;
  depositScope: "global" | "per_service";
  depositType: DepositType;
  depositValueCents: number;
  depositValuePercent: number;
  trustCode: string;
}

export function useDepositSettings() {
  return useQuery({
    queryKey: ["deposit-settings"],
    queryFn: async () => (await apiClient.get<DepositSettings>("/business/deposit-settings")).data,
  });
}

export function useUpdateDepositSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<DepositSettings, "trustCode">) =>
      (await apiClient.patch<DepositSettings>("/business/deposit-settings", payload)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["deposit-settings"] }),
  });
}

export function useRegenerateTrustCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () =>
      (await apiClient.post<{ trustCode: string }>("/business/deposit-settings/regenerate-code")).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["deposit-settings"] }),
  });
}
