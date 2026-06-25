import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "../api/client";

export interface ReviewInfo {
  businessName: string;
  barberName: string;
  serviceNames: string[];
  startsAt: string;
  alreadySubmitted: boolean;
}

export function useReviewInfo(token: string) {
  return useQuery({
    queryKey: ["review", token],
    queryFn: async () => (await apiClient.get<ReviewInfo>(`/public/reviews/${token}`)).data,
    retry: false,
  });
}

export function useSubmitReview(token: string) {
  return useMutation({
    mutationFn: async (payload: { rating: number; comment?: string }) =>
      (await apiClient.post(`/public/reviews/${token}`, payload)).data,
  });
}
