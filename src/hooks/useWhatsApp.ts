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
    // Sigue consultando aunque ya esté conectado, para detectar si se desconecta solo
    // (por ejemplo si lo cierran desde el teléfono) — más rápido mientras espera el QR.
    refetchInterval: (query) => (query.state.data?.status === "connected" ? 8000 : 2500),
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
