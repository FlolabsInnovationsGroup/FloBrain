/**
 * Flobrain Core API client (auth endpoints).
 * Base URL: NEXT_PUBLIC_API_URL (e.g. http://127.0.0.1:8000)
 */

const getBaseUrl = () =>
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000";

function formatDetails(details: unknown): string | undefined {
  if (details == null) return undefined;
  if (typeof details === "string") return details;
  if (typeof details === "object" && !Array.isArray(details)) {
    const parts = Object.entries(details).map(([k, v]) => {
      const val = Array.isArray(v) ? v.join(" ") : String(v);
      return `${k}: ${val}`;
    });
    return parts.length ? parts.join("; ") : undefined;
  }
  return String(details);
}

export const api = {
  get baseUrl() {
    return getBaseUrl();
  },

  async request<T>(
    path: string,
    options: RequestInit & { json?: object } = {}
  ): Promise<{ data?: T; error?: string; details?: unknown; status: number }> {
    const { json, ...init } = options;
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(init.headers as Record<string, string>),
    };
    const body = json !== undefined ? JSON.stringify(json) : init.body;
    let res: Response;
    try {
      res = await fetch(`${getBaseUrl()}${path}`, { ...init, headers, body });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Network error";
      return {
        error: "Could not reach server. Check that the backend is running and the URL is correct.",
        details: message,
        status: 0,
      };
    }
    let data: T | undefined;
    let error: string | undefined;
    let details: unknown;
    const text = await res.text();
    if (text) {
      try {
        const parsed = JSON.parse(text) as Record<string, unknown>;
        data = parsed as T;
        if (!res.ok) {
          error = (parsed.error as string) ?? "Request failed";
          details = parsed.details;
          const formatted = formatDetails(details);
          if (formatted) error = `${error}. ${formatted}`;
        }
      } catch {
        if (!res.ok) error = text || "Request failed";
      }
    }
    if (!res.ok && !error) error = res.statusText || "Request failed";
    return { data: res.ok ? data : undefined, error, details, status: res.status };
  },

  // --- Auth ---

  async signIn(email: string, password: string) {
    return this.request<{
      access_token: string;
      refresh_token: string;
      userId: string;
    }>("/api/auth/signin/", {
      method: "POST",
      json: { email, password },
    });
  },

  async register(body: { name: string; email: string; password: string; phone?: string }) {
    return this.request<{
      access_token: string;
      refresh_token: string;
      userId: string;
    }>("/api/auth/register/", {
      method: "POST",
      json: body,
    });
  },

  async signOut(userId: string, refreshToken: string | null) {
    return this.request<{ message: string }>("/api/auth/signout/", {
      method: "POST",
      json: { userId, refresh_token: refreshToken },
    });
  },

  async refreshToken(refresh: string) {
    return this.request<{ access: string }>("/api/auth/refresh/", {
      method: "POST",
      json: { refresh },
    });
  },
};
