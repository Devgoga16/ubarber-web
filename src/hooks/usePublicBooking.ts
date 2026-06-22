import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "../api/client";

export interface PublicLocation {
  _id: string;
  name: string;
  address?: string;
}

export interface PublicService {
  _id: string;
  name: string;
  durationMinutes: number;
  priceCents: number;
  photo?: string;
  locationIds: string[];
}

export interface PublicBarber {
  _id: string;
  name: string;
  locationIds: string[];
  favoriteServiceIds: string[];
}

export interface PublicBusinessInfo {
  business: { name: string };
  bookable: boolean;
  locations: PublicLocation[];
  services: PublicService[];
  barbers: PublicBarber[];
}

export function usePublicBusiness(slug: string) {
  return useQuery({
    queryKey: ["public-business", slug],
    queryFn: async () => (await apiClient.get<PublicBusinessInfo>(`/public/${slug}`)).data,
    retry: false,
  });
}

export function usePublicAvailability(
  slug: string,
  params: { barberId: string; locationId: string; date: string; durationMinutes: number },
  enabled: boolean
) {
  return useQuery({
    queryKey: ["public-availability", slug, params],
    queryFn: async () =>
      (await apiClient.get<{ slots: string[] }>(`/public/${slug}/availability`, { params })).data,
    enabled,
  });
}

export interface CreatePublicAppointmentInput {
  locationId: string;
  barberId: string;
  serviceIds: string[];
  startsAt: string;
  client: { name: string; phone: string };
}

export function useCreatePublicAppointment(slug: string) {
  return useMutation({
    mutationFn: async (payload: CreatePublicAppointmentInput) =>
      (await apiClient.post(`/public/${slug}/appointments`, payload)).data,
  });
}
