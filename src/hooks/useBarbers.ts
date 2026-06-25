import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import type { Barber } from "../api/types";

export function useBarbers(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ["barbers"],
    queryFn: async () => (await apiClient.get<Barber[]>("/business/barbers")).data,
    enabled: options.enabled ?? true,
  });
}

export interface CreateBarberInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  locationIds: string[];
  specialties?: string[];
}

export function useCreateBarber() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateBarberInput) =>
      (await apiClient.post<Barber>("/business/barbers", payload)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["barbers"] }),
  });
}

export interface UpdateBarberInput {
  phone?: string;
  photo?: string;
  locationIds?: string[];
  specialties?: string[];
  commissionPercentage?: number;
}

export function useUpdateBarber() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateBarberInput & { id: string }) =>
      (await apiClient.patch<Barber>(`/business/barbers/${id}`, payload)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["barbers"] }),
  });
}

export function useSetBarberStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) =>
      (await apiClient.patch<Barber>(`/business/barbers/${id}/status`, { isActive })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["barbers"] }),
  });
}

export function useSetBarberFavoriteServices() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, serviceIds }: { id: string; serviceIds: string[] }) =>
      (await apiClient.patch<Barber>(`/business/barbers/${id}/favorites`, { serviceIds })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["barbers"] }),
  });
}

export function useSetMyFavoriteServices() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (serviceIds: string[]) =>
      (await apiClient.patch<Barber>("/business/barbers/me/favorites", { serviceIds })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["barbers"] }),
  });
}
