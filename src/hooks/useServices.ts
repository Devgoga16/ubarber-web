import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import type { Service } from "../api/types";

export function useServices() {
  return useQuery({
    queryKey: ["services"],
    queryFn: async () => (await apiClient.get<Service[]>("/business/services")).data,
  });
}

export interface ServiceInput {
  name: string;
  durationMinutes: number;
  priceCents: number;
  locationIds: string[];
  photo?: string;
}

export function useCreateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ServiceInput) =>
      (await apiClient.post<Service>("/business/services", payload)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["services"] }),
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: ServiceInput & { id: string }) =>
      (await apiClient.patch<Service>(`/business/services/${id}`, payload)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["services"] }),
  });
}

export function useSetServiceStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) =>
      (await apiClient.patch<Service>(`/business/services/${id}/status`, { isActive })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["services"] }),
  });
}
