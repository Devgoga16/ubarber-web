import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import type { DepositStatus } from "../api/types";

export interface ConfirmationInfo {
  businessName: string;
  barberName: string;
  clientName: string;
  serviceNames: string[];
  startsAt: string;
  depositAmountCents: number;
  depositStatus: DepositStatus;
}

export function useAppointmentConfirmation(token: string) {
  return useQuery({
    queryKey: ["confirmation", token],
    queryFn: async () =>
      (await apiClient.get<ConfirmationInfo>(`/public/confirmations/${token}`)).data,
    retry: false,
  });
}

export function useAcceptConfirmation(token: string) {
  return useMutation({
    mutationFn: async () =>
      (await apiClient.post<{ depositStatus: DepositStatus }>(`/public/confirmations/${token}/accept`)).data,
  });
}

export function useRejectConfirmation(token: string) {
  return useMutation({
    mutationFn: async (reason?: string) =>
      (
        await apiClient.post<{ depositStatus: DepositStatus }>(`/public/confirmations/${token}/reject`, {
          reason,
        })
      ).data,
  });
}
