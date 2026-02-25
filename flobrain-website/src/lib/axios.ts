/**
 * Axios instance for Flobrain API.
 * - Base URL from NEXT_PUBLIC_API_URL
 * - Request interceptor: attach JWT (Bearer) when present
 * - Use this instance for all API calls (auth + other collections)
 */

import axios from "axios";

const ACCESS_TOKEN_KEY = "flobrain_access_token";

function getBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;
  return url ? url.replace(/\/$/, "") : "http://127.0.0.1:8000";
}

export const apiClient = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window === "undefined") return config;
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Optional: handle 401 and trigger refresh or redirect to login
    if (error.response?.status === 401) {
      // Could dispatch event or call refresh here; for now just reject
    }
    return Promise.reject(error);
  }
);

export function getApiBaseUrl(): string {
  return getBaseUrl();
}
