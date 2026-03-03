"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api } from "@/lib/api";

const STORAGE_KEYS = {
  accessToken: "flobrain_access_token",
  refreshToken: "flobrain_refresh_token",
  userId: "flobrain_user_id",
} as const;

function getStoredAuth() {
  if (typeof window === "undefined") return null;
  const accessToken = localStorage.getItem(STORAGE_KEYS.accessToken);
  const userId = localStorage.getItem(STORAGE_KEYS.userId);
  if (!accessToken || !userId) return null;
  return {
    accessToken,
    refreshToken: localStorage.getItem(STORAGE_KEYS.refreshToken),
    userId,
  };
}

function setStoredAuth(accessToken: string, refreshToken: string, userId: string) {
  localStorage.setItem(STORAGE_KEYS.accessToken, accessToken);
  localStorage.setItem(STORAGE_KEYS.refreshToken, refreshToken);
  localStorage.setItem(STORAGE_KEYS.userId, userId);
}

function clearStoredAuth() {
  localStorage.removeItem(STORAGE_KEYS.accessToken);
  localStorage.removeItem(STORAGE_KEYS.refreshToken);
  localStorage.removeItem(STORAGE_KEYS.userId);
}

export function getAccessToken() {
  return typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEYS.accessToken) : null;
}

type AuthContextValue = {
  userId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string; details?: unknown }>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) => Promise<{ ok: boolean; error?: string; details?: unknown }>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const id = setTimeout(() => {
      const stored = getStoredAuth();
      setUserId(stored?.userId ?? null);
      setIsLoading(false);
    }, 0);
    return () => clearTimeout(id);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.signIn(email, password);
    if (res.error || !res.data) {
      return {
        ok: false,
        error: res.error ?? "Sign in failed",
        details: res.details,
      };
    }
    setStoredAuth(
      res.data.access_token,
      res.data.refresh_token,
      res.data.userId
    );
    setUserId(res.data.userId);
    return { ok: true };
  }, []);

  const register = useCallback(
    async (payload: {
      name: string;
      email: string;
      password: string;
      phone?: string;
    }) => {
      const res = await api.register(payload);
      if (res.error || !res.data) {
        return {
          ok: false,
          error: res.error ?? "Registration failed",
          details: res.details,
        };
      }
      setStoredAuth(
        res.data.access_token,
        res.data.refresh_token,
        res.data.userId
      );
      setUserId(res.data.userId);
      return { ok: true };
    },
    []
  );

  const logout = useCallback(async () => {
    const uid = userId ?? localStorage.getItem(STORAGE_KEYS.userId);
    const refresh = localStorage.getItem(STORAGE_KEYS.refreshToken);
    if (uid) await api.signOut(uid, refresh);
    clearStoredAuth();
    setUserId(null);
  }, [userId]);

  const value: AuthContextValue = {
    userId,
    isAuthenticated: !!userId,
    isLoading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
