import { api } from "@/lib/api";

export type UsageSummaryApi = {
  total_tokens: number;
  change_percent: number;
  period_start: string;
  period_end: string;
  breakdown_by_model: { model: string; total: number }[];
};

export type DailyUsageItemApi = {
  date: string;
  total_tokens: number;
  request_count: number;
};

export type UsageQuotaApi = {
  plan: string;
  limit_tokens: number | null;
  limit_requests: number | null;
  used_tokens: number;
  used_requests: number;
  remaining_tokens: number | null;
  remaining_requests: number | null;
  reset_at: string;
};

export async function fetchUsageSummary(period: "7d" | "30d" | "month" = "7d") {
  return api.request<UsageSummaryApi>(`/api/usage/summary/?period=${period}`);
}

export async function fetchDailyUsage(days = 7) {
  return api.request<{ data: DailyUsageItemApi[] }>(`/api/usage/daily/?days=${days}`);
}

export async function fetchQuota() {
  return api.request<UsageQuotaApi>("/api/usage/quota/");
}
