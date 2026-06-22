import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import type { Location } from "../api/types";

export function useLocations() {
  return useQuery({
    queryKey: ["locations"],
    queryFn: async () => (await apiClient.get<Location[]>("/business/locations")).data,
  });
}

export interface LocationInput {
  name: string;
  address?: string;
  phone?: string;
}

export function useCreateLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: LocationInput) =>
      (await apiClient.post<Location>("/business/locations", payload)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["locations"] }),
  });
}

export function useUpdateLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: LocationInput & { id: string }) =>
      (await apiClient.patch<Location>(`/business/locations/${id}`, payload)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["locations"] }),
  });
}

export function useSetLocationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) =>
      (await apiClient.patch<Location>(`/business/locations/${id}/status`, { isActive })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["locations"] }),
  });
}
