import { create } from "zustand";

interface SubscriptionGateState {
  blocked: boolean;
  message: string | null;
  setBlocked: (message: string) => void;
  clear: () => void;
}

export const useSubscriptionGateStore = create<SubscriptionGateState>((set) => ({
  blocked: false,
  message: null,
  setBlocked: (message) => set({ blocked: true, message }),
  clear: () => set({ blocked: false, message: null }),
}));
