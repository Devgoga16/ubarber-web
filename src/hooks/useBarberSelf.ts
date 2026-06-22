import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import type { Barber } from "../api/types";

export interface BarberShift {
  locationId: string;
  day: number;
  startTime: string;
  endTime: string;
}

export function useMyBarberProfile() {
  return useQuery({
    queryKey: ["barbers", "me"],
    queryFn: async () => (await apiClient.get<Barber & { shifts: BarberShift[] }>("/business/barbers/me")).data,
  });
}

export function useUpdateMyShifts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (shifts: BarberShift[]) =>
      (await apiClient.patch("/business/barbers/me/shifts", { shifts })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["barbers", "me"] }),
  });
}
