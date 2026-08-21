/**
 * Axios instance for Flobrain API.
 * - Base URL from NEXT_PUBLIC_API_URL
 * - Request interceptor: attach JWT (Bearer) when present
 * - Use this instance for all API calls (auth + other collections)
 */

import axios from "axios";

const ACCESS_TOKEN_KEY = "flobrain_access_token";
const REFRESH_TOKEN_KEY = "flobrain_refresh_token";


function getBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;
  return url ? url.replace(/\/$/, "") : "https://api.flobrain.ai";
}

async function refreshAccessToken() {
  if (typeof window === "undefined") {
    throw new Error("Cannot refresh token on server");
  }

  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

  if (!refreshToken) {
    throw new Error("No refresh token");
  }

  const response = await axios.post(
    `${getBaseUrl()}/api/auth/refresh/`,
    {
      refresh: refreshToken,
    }
  );

  const newAccessToken = response.data.access;

  localStorage.setItem(
    ACCESS_TOKEN_KEY,
    newAccessToken
  );

  return newAccessToken;
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


declare module "axios" {
  export interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

apiClient.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (
      !originalRequest ||
      error.response?.status !== 401 ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const newToken = await refreshAccessToken();

      originalRequest.headers.Authorization =
        `Bearer ${newToken}`;

      return apiClient(originalRequest);

    } catch (refreshError) {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);

      return Promise.reject(refreshError);
    }
  }
);

export function getApiBaseUrl(): string {
  return getBaseUrl();
}
