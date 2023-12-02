import { create } from "zustand";

interface User {
  username: string;
  // Add other user-related properties here
}

interface LoginStore {
  isAuthenticated: boolean;
  user: User | null; // Change to null initially
  login: (user: User) => void;
  logout: () => void;
}

export const useLoginStore = create<LoginStore>((set) => ({
  isAuthenticated: false,
  user: null,
  login: (user) => set({ isAuthenticated: true, user }),
  logout: () => set({ isAuthenticated: false, user: null }),

}));
