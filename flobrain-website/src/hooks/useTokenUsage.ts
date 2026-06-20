import { useQuery } from "@/hooks/useApi";
import {
  fetchDailyUsage,
  fetchQuota,
  fetchUsageSummary,
  type DailyUsageItemApi,
  type UsageQuotaApi,
  type UsageSummaryApi,
} from "@/lib/api/usage";

export function useTokenUsage(days = 7) {
  const summaryQuery = useQuery({
    queryKey: ["usage", "summary", days],
    queryFn: async (): Promise<UsageSummaryApi> => {
      const period = days <= 7 ? "7d" : "30d";
      const result = await fetchUsageSummary(period);
      if (result.error || result.status >= 400) {
        throw new Error(result.error ?? "Failed to load usage summary");
      }
      return result.data!;
    },
    refetchInterval: 60_000,
  });

  const dailyQuery = useQuery({
    queryKey: ["usage", "daily", days],
    queryFn: async (): Promise<DailyUsageItemApi[]> => {
      const result = await fetchDailyUsage(days);
      if (result.error || result.status >= 400) {
        throw new Error(result.error ?? "Failed to load daily usage");
      }
      return result.data!.data;
    },
    refetchInterval: 60_000,
  });

  const quotaQuery = useQuery({
    queryKey: ["usage", "quota"],
    queryFn: async (): Promise<UsageQuotaApi> => {
      const result = await fetchQuota();
      if (result.error || result.status >= 400) {
        throw new Error(result.error ?? "Failed to load quota");
      }
      return result.data!;
    },
    refetchInterval: 60_000,
  });

  return {
    summary: summaryQuery.data,
    daily: dailyQuery.data,
    quota: quotaQuery.data,
    isLoading: summaryQuery.isLoading || dailyQuery.isLoading,
    error: summaryQuery.error ?? dailyQuery.error ?? quotaQuery.error,
  };
}
