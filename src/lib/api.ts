import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
});

// ── Request: attach token (SSR-safe) ──────────────────────────────────────
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response: handle token expiry ─────────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const status = err?.response?.status;

    if (status === 401 && typeof window !== "undefined") {
      // Clear stale tokens and redirect to login
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
    }

    return Promise.reject(err);
  }
);