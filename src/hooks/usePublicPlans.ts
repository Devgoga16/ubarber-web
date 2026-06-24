import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../api/client";

export interface PublicPlan {
  _id: string;
  name: string;
  description?: string;
  priceCents: number;
  billingPeriod: "monthly" | "yearly";
  limits: { maxLocations: number; maxBarbers: number; maxAppointmentsPerMonth: number };
  features: string[];
  highlighted: boolean;
  whatsappEnabled: boolean;
}

export function usePublicPlans() {
  return useQuery({
    queryKey: ["public-plans"],
    queryFn: async () => (await apiClient.get<PublicPlan[]>("/public/plans")).data,
  });
}
