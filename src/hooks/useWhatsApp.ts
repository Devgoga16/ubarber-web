import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/client";

export type WhatsAppStatus = "disconnected" | "connecting" | "connected";

export interface WhatsAppStatusResponse {
  status: WhatsAppStatus;
  qr: string | null;
}

export function useWhatsAppStatus() {
  return useQuery({
    queryKey: ["whatsapp-status"],
    queryFn: async () =>
      (await apiClient.get<WhatsAppStatusResponse>("/business/whatsapp/status")).data,
    refetchInterval: (query) => (query.state.data?.status === "connected" ? false : 2500),
  });
}

export function useConnectWhatsApp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => (await apiClient.post("/business/whatsapp/connect")).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["whatsapp-status"] }),
  });
}

export function useDisconnectWhatsApp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => (await apiClient.post("/business/whatsapp/disconnect")).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["whatsapp-status"] }),
  });
}
