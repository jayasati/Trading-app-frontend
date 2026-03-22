import { create } from "zustand";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "@/lib/auth";

interface User {
  id:    string;
  name:  string;
  email: string;
}

interface AuthState {
  user:         User | null;
  accessToken:  string | null;
  isHydrated:   boolean;

  // Actions
  hydrate:      ()                              => void;
  login:        (tokens: { accessToken: string; refreshToken: string }, user?: User) => void;
  logout:       ()                              => void;
  setUser:      (user: User)                    => void;
  updateTokens: (access: string, refresh: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user:        null,
  accessToken: null,
  isHydrated:  false,

  // Called once on app boot — reads tokens from localStorage into store
  hydrate: () => {
    const token = getAccessToken();
    set({ accessToken: token, isHydrated: true });
  },

  login: (tokens, user) => {
    setTokens(tokens.accessToken, tokens.refreshToken);
    set({ accessToken: tokens.accessToken, user: user ?? null });
  },

  logout: () => {
    clearTokens();
    set({ user: null, accessToken: null });
  },

  setUser: (user) => set({ user }),

  updateTokens: (access, refresh) => {
    setTokens(access, refresh);
    set({ accessToken: access });
  },
}));