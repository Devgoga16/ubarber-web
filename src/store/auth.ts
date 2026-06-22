import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role = "super_admin" | "owner" | "manager" | "barber";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  businessId: string | null;
  locationIds: string[];
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  activeLocationId: string | null;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  setActiveLocation: (locationId: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      activeLocationId: null,
      login: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null, activeLocationId: null }),
      setActiveLocation: (locationId) => set({ activeLocationId: locationId }),
    }),
    { name: "ubarber-auth" }
  )
);
