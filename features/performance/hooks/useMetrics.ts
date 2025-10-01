/**
 * useMetrics Hook
 * Fetch complete dashboard data with calculated metrics
 */

import { useQuery } from "@tanstack/react-query";
import type { PerformanceQueryParams, PerformanceDashboardData } from "../types";

interface UseMetricsOptions extends Partial<PerformanceQueryParams> {
  enabled?: boolean;
}

async function fetchMetricsData(params: PerformanceQueryParams): Promise<PerformanceDashboardData> {
  const queryParams = new URLSearchParams();
  
  queryParams.set("perspective", params.perspective);
  
  if (params.product) queryParams.set("product", params.product);
  if (params.platform) queryParams.set("platform", params.platform);
  if (params.dateFrom) queryParams.set("dateFrom", params.dateFrom);
  if (params.dateTo) queryParams.set("dateTo", params.dateTo);

  const response = await fetch(`/api/performance/metrics?${queryParams.toString()}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch metrics: ${response.statusText}`);
  }
  
  return response.json();
}

export function useMetrics(options: UseMetricsOptions) {
  const {
    perspective = "default",
    product,
    platform,
    dateFrom,
    dateTo,
    enabled = true,
  } = options;

  return useQuery({
    queryKey: ["performance-metrics", perspective, product, platform, dateFrom, dateTo],
    queryFn: () =>
      fetchMetricsData({
        perspective,
        product,
        platform,
        dateFrom,
        dateTo,
      }),
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

