import axios from "axios";
import { useAuthStore } from "../store/auth";
import { useSubscriptionGateStore } from "../store/subscriptionGate";

// En producción la URL real se inyecta en runtime (ver docker-entrypoint.sh -> env-config.js),
// porque las variables VITE_* de Vite quedan fijas en el bundle desde el momento del build.
const runtimeApiUrl = (window as { __ENV__?: { VITE_API_URL?: string } }).__ENV__?.VITE_API_URL;

export const apiClient = axios.create({
  baseURL: runtimeApiUrl || import.meta.env.VITE_API_URL || "http://localhost:4000/api",
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    if (useSubscriptionGateStore.getState().blocked) {
      useSubscriptionGateStore.getState().clear();
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 402) {
      const message = error.response.data?.message ?? "Tu suscripción no está activa.";
      useSubscriptionGateStore.getState().setBlocked(message);
    }
    return Promise.reject(error);
  }
);
