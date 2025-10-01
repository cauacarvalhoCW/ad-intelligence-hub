/**
 * usePerformanceData Hook
 * Fetch performance ads data
 */

import { useQuery } from "@tanstack/react-query";
import type { PerformanceQueryParams } from "../types";

interface UsePerformanceDataOptions extends Partial<PerformanceQueryParams> {
  enabled?: boolean;
}

async function fetchPerformanceData(params: PerformanceQueryParams) {
  const queryParams = new URLSearchParams();
  
  queryParams.set("perspective", params.perspective);
  
  if (params.product) queryParams.set("product", params.product);
  if (params.platform) queryParams.set("platform", params.platform);
  if (params.dateFrom) queryParams.set("dateFrom", params.dateFrom);
  if (params.dateTo) queryParams.set("dateTo", params.dateTo);
  if (params.page) queryParams.set("page", String(params.page));
  if (params.limit) queryParams.set("limit", String(params.limit));

  const response = await fetch(`/api/performance?${queryParams.toString()}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch performance data: ${response.statusText}`);
  }
  
  return response.json();
}

export function usePerformanceData(options: UsePerformanceDataOptions) {
  const {
    perspective = "default",
    product,
    platform,
    dateFrom,
    dateTo,
    page = 1,
    limit = 24,
    enabled = true,
  } = options;

  return useQuery({
    queryKey: ["performance", perspective, product, platform, dateFrom, dateTo, page, limit],
    queryFn: () =>
      fetchPerformanceData({
        perspective,
        product,
        platform,
        dateFrom,
        dateTo,
        page,
        limit,
      }),
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

