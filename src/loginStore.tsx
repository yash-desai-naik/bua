// loginStore.ts
import create from "zustand";

interface LoginStore {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

export const useLoginStore = create<LoginStore>((set) => ({
  isAuthenticated: false,
  login: () => set({ isAuthenticated: true }),
  logout: () => set({ isAuthenticated: false }),
}));
