import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import type { Client } from "../api/types";

export function useClients(search?: string) {
  return useQuery({
    queryKey: ["clients", search ?? ""],
    queryFn: async () =>
      (await apiClient.get<Client[]>("/business/clients", { params: { search } })).data,
  });
}

export interface ClientInput {
  name: string;
  phone: string;
  email?: string;
  notes?: string;
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ClientInput) =>
      (await apiClient.post<Client>("/business/clients", payload)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["clients"] }),
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: ClientInput & { id: string }) =>
      (await apiClient.patch<Client>(`/business/clients/${id}`, payload)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["clients"] }),
  });
}

export function useSetClientStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) =>
      (await apiClient.patch<Client>(`/business/clients/${id}/status`, { isActive })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["clients"] }),
  });
}
