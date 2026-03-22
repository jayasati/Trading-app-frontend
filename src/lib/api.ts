import axios, { AxiosError } from "axios";
import { getAccessToken, getRefreshToken, redirectToLogin } from "./auth";

export const api = axios.create({
  baseURL: "/api",
});

// ── Request: attach access token ─────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response: refresh on 401, retry once, redirect on failure ────────────
let isRefreshing  = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject:  (err: unknown)  => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else       p.resolve(token!);
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const original = err.config as any;

    // Only attempt refresh on 401, once per request
    if (err.response?.status !== 401 || original._retry) {
      return Promise.reject(err);
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      redirectToLogin();
      return Promise.reject(err);
    }

    if (isRefreshing) {
      // Queue subsequent 401s until refresh resolves
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(api(original));
          },
          reject,
        });
      });
    }

    original._retry  = true;
    isRefreshing     = true;

    try {
      const { data } = await axios.post("/api/auth/refresh", { refreshToken });

      // Persist new tokens
      const { useAuthStore } = await import("@/store/useAuthStore");
      useAuthStore.getState().updateTokens(data.accessToken, data.refreshToken);

      original.headers.Authorization = `Bearer ${data.accessToken}`;
      processQueue(null, data.accessToken);
      return api(original);
    } catch (refreshErr) {
      processQueue(refreshErr, null);
      redirectToLogin();
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);