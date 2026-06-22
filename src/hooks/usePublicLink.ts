import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../api/client";

export function usePublicLink() {
  return useQuery({
    queryKey: ["public-link"],
    queryFn: async () =>
      (await apiClient.get<{ slug: string; businessName: string }>("/business/public-link")).data,
  });
}
