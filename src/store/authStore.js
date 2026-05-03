import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      permissions: [],
      isHydrated: false,

      setAuth: (token, user, permissions) =>
        set({ token, user, permissions }),

      logout: () =>
        set({ token: null, user: null, permissions: [] }),

      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: "auth-storage",
      onRehydrateStorage: () => (state) => {
        state.setHydrated();
      },
    }
  )
);