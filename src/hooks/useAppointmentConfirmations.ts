import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import type { Appointment } from "../api/types";

export function usePendingConfirmations() {
  return useQuery({
    queryKey: ["appointments", "pending-confirmation"],
    queryFn: async () =>
      (await apiClient.get<Appointment[]>("/business/appointments/pending-confirmation")).data,
    refetchInterval: 15000,
  });
}

function useConfirmationMutation(action: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) =>
      (await apiClient.patch<Appointment>(`/business/appointments/${id}/${action}`, { reason })).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}

export function useConfirmAvailability() {
  return useConfirmationMutation("confirm-availability");
}

export function useRejectAvailability() {
  return useConfirmationMutation("reject-availability");
}

export function useConfirmDeposit() {
  return useConfirmationMutation("confirm-deposit");
}

export function useRejectDeposit() {
  return useConfirmationMutation("reject-deposit");
}
