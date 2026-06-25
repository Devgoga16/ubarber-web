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
  depositType?: "percentage" | "fixed";
  depositValueCents?: number;
  depositValuePercent?: number;
}

export interface PublicReview {
  rating: number;
  comment?: string;
  clientName: string;
}

export interface PublicBarber {
  _id: string;
  name: string;
  locationIds: string[];
  favoriteServiceIds: string[];
  photo?: string;
  ratingAverage: number | null;
  ratingCount: number;
  recentReviews: PublicReview[];
}

export interface PublicPaymentMethod {
  _id: string;
  name: string;
}

export interface PublicDepositInfo {
  enabled: boolean;
  scope: "global" | "per_service";
  type: "percentage" | "fixed";
  valueCents: number;
  valuePercent: number;
}

export interface PublicBusinessInfo {
  business: { name: string };
  bookable: boolean;
  deposit: PublicDepositInfo;
  locations: PublicLocation[];
  services: PublicService[];
  barbers: PublicBarber[];
  paymentMethods: PublicPaymentMethod[];
}

export function computeRequiredDepositCents(deposit: PublicDepositInfo, services: PublicService[]): number {
  if (!deposit.enabled) return 0;
  const apply = (type: "percentage" | "fixed", cents: number, percent: number, base: number) =>
    type === "percentage" ? Math.round(base * (percent / 100)) : cents;

  if (deposit.scope === "global") {
    const total = services.reduce((sum, s) => sum + s.priceCents, 0);
    return apply(deposit.type, deposit.valueCents, deposit.valuePercent, total);
  }

  return services.reduce((sum, s) => {
    const type = s.depositType ?? deposit.type;
    const cents = s.depositValueCents ?? deposit.valueCents;
    const percent = s.depositValuePercent ?? deposit.valuePercent;
    return sum + apply(type, cents, percent, s.priceCents);
  }, 0);
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
  depositMethod?: "proof_photo" | "trust_code";
  depositProofPhoto?: string;
  depositPaymentMethodId?: string;
  trustCode?: string;
}

export function useCreatePublicAppointment(slug: string) {
  return useMutation({
    mutationFn: async (payload: CreatePublicAppointmentInput) =>
      (await apiClient.post(`/public/${slug}/appointments`, payload)).data,
  });
}
