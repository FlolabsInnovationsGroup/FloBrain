/**
 * Flobrain API client (Axios-based).
 * Base URL: NEXT_PUBLIC_API_URL (e.g. http://127.0.0.1:8000)
 * Use api.* for auth; use apiClient + useQuery/useMutation for other collections.
 */

import { apiClient, getApiBaseUrl } from "./axios";

export type ApiResult<T> = {
  data?: T;
  error?: string;
  details?: unknown;
  status: number;
};

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

function normalizeError(err: unknown): ApiResult<never> {
  if (err && typeof err === "object" && "response" in err) {
    const ax = err as { response?: { data?: unknown; status?: number }; message?: string };
    const status = ax.response?.status ?? 0;
    const data = ax.response?.data;
    let error = "Request failed";
    let details: unknown;
    if (data && typeof data === "object") {
      const obj = data as Record<string, unknown>;
      error = (obj.error as string) ?? error;
      details = obj.details;
      const formatted = formatDetails(details);
      if (formatted) error = `${error}. ${formatted}`;
    } else if (ax.message) {
      error = ax.message;
      details = ax.message;
    }
    return { error, details, status };
  }
  const message = err instanceof Error ? err.message : "Network error";
  return {
    error:
      "Could not reach server. Check that the backend is running and the URL is correct.",
    details: message,
    status: 0,
  };
}

export const api = {
  get baseUrl() {
    return getApiBaseUrl();
  },

  /**
   * Low-level request. Prefer auth methods or React Query for specific endpoints.
   */
  async request<T>(
    path: string,
    options: { method?: string; json?: object } = {}
  ): Promise<ApiResult<T>> {
    const { method = "GET", json } = options;
    try {
      const res = await apiClient.request<T>({
        url: path,
        method,
        data: json,
      });
      return {
        data: res.data,
        status: res.status,
      };
    } catch (err) {
      return normalizeError(err) as ApiResult<T>;
    }
  },

  // --- Auth (used by AuthContext; other data can use useQuery/useMutation + apiClient) ---

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

  async register(body: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) {
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

  // --- Profile (requires auth) ---

  async getProfile() {
    return this.request<{ id: string; fullName: string; email: string }>("/api/profile/");
  },

  async updateProfile(body: { fullName?: string; email?: string }) {
    return this.request<{ id: string; fullName: string; email: string }>("/api/profile/", {
      method: "PATCH",
      json: body,
    });
  },

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request<{ message: string }>("/api/profile/change-password/", {
      method: "POST",
      json: { current_password: currentPassword, new_password: newPassword },
    });
  },

  async deleteAccount(password: string) {
    return this.request<{ message: string }>("/api/profile/delete/", {
      method: "POST",
      json: { password },
    });
  },

  // --- Memory graph (requires auth) ---

  async getMemoryGraph(params?: {
    search?: string;
    date_range?: string;
    memory_type?: string;
    min_relevance?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set("search", params.search);
    if (params?.date_range) searchParams.set("date_range", params.date_range);
    if (params?.memory_type) searchParams.set("memory_type", params.memory_type);
    if (params?.min_relevance != null)
      searchParams.set("min_relevance", String(params.min_relevance));
    const qs = searchParams.toString();
    const path = `/api/memory/graph/${qs ? `?${qs}` : ""}`;
    return this.request<{ nodes: MemoryNodeApi[]; links: { source: string; target: string }[] }>(
      path
    );
  },

  // --- Dashboard (health unauthenticated; memory-activity requires auth) ---

  async getDashboardHealth() {
    return this.request<DashboardHealthApi>("/api/dashboard/health/");
  },

  async getDashboardMemoryActivity() {
    return this.request<DashboardMemoryActivityApi>("/api/dashboard/memory-activity/");
  },

  // --- Brain / Chat (requires auth) ---

  async getChats() {
    return this.request<BrainChatApi[]>("/api/brain/chats/");
  },

  async createChat(title?: string) {
    return this.request<BrainChatDetailApi>("/api/brain/chats/", {
      method: "POST",
      json: { title: title ?? "New Chat" },
    });
  },

  async getChat(chatId: number) {
    return this.request<BrainChatDetailApi>(`/api/brain/chats/${chatId}/`);
  },

  async updateChat(chatId: number, title: string) {
    return this.request<BrainChatDetailApi>(`/api/brain/chats/${chatId}/`, {
      method: "PATCH",
      json: { title },
    });
  },

  async deleteChat(chatId: number) {
    return this.request<void>(`/api/brain/chats/${chatId}/`, {
      method: "DELETE",
    });
  },

  async sendMessage(chatId: number, text: string, image?: string) {
    return this.request<BrainChatDetailApi>(`/api/brain/chats/${chatId}/send/`, {
      method: "POST",
      json: { text, image: image ?? "" },
    });
  },

  async getWorkflowErrors() {
    return this.request<WorkflowErrorApi[]>('/api/dashboard/workflow-errors/');
  },
  async getWorkflowError(id: string) {
    return this.request<WorkflowErrorApi>(`/api/dashboard/workflow-errors/${id}/`);
  },
};

export type DashboardHealthApi = {
  status: "ok" | "degraded";
  backend: string;
  database: string;
  allSystemsOperational: boolean;
};

export type DashboardMemoryActivityApi = {
  today_count: number;
  week_count: number;
  total_count: number;
  week_percentage: string;
  week_positive: boolean;
  heatmap: number[][];
};

export type MemoryNodeApi = {
  id: string;
  name: string;
  val: number;
  group: string;
  memory_type?: string;
  relevance?: number;
  created_at?: string | null;
};

export type BrainMessageApi = {
  id: string;
  role: string;
  type: "user" | "assistant";
  text?: string | null;
  image?: string | null;
  timestamp?: string | null;
};

export type BrainChatApi = {
  id: number;
  title: string;
  timestamp: string;
  messages: BrainMessageApi[];
};

export type BrainChatDetailApi = BrainChatApi;

export type WorkflowErrorDetailApi = {
  error_type: string;
  stack_trace: string | null;
  context: Record<string, unknown>;
  resolution: string | null;
  affected_requests: number;
  duration_ms: number | null;
};

export type WorkflowErrorApi = {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  component: string;
  timestamp: string;
  timestamp_relative: string;
  details: WorkflowErrorDetailApi;
};

// Re-export for team: use apiClient for custom requests + React Query
export { apiClient } from "./axios";
