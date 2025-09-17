"use client";

import { useCallback, useEffect, useState } from "react";

import type {
  AnalyticsOptions,
  AnalyticsResponse,
} from "@/features/analytics/types";

function buildSearchParams(options: AnalyticsOptions): URLSearchParams {
  const params = new URLSearchParams();

  if (options.perspective) {
    params.set("perspective", options.perspective);
  }

  const filters = options.filters;
  if (!filters) return params;

  if (filters.search) {
    params.set("search", filters.search);
  }

  if (filters.competitors?.length) {
    params.set("competitors", filters.competitors.join(","));
  }

  if (filters.assetTypes?.length) {
    params.set("adTypes", filters.assetTypes.join(","));
  }

  if (filters.dateRange?.start) {
    params.set(
      "dateFrom",
      filters.dateRange.start.toISOString().split("T")[0],
    );
  }

  if (filters.dateRange?.end) {
    params.set(
      "dateTo",
      filters.dateRange.end.toISOString().split("T")[0],
    );
  }

  // Platform currently hardcoded to Meta while we expand coverage
  params.set("platform", "meta");

  return params;
}

export function useAnalytics(options: AnalyticsOptions = {}) {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const serializedOptions = JSON.stringify(options);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/analytics?${buildSearchParams(options)}`);

      if (!response.ok) {
        throw new Error(`Analytics API error: ${response.status}`);
      }

      const analyticsData: AnalyticsResponse = await response.json();
      setData(analyticsData);
    } catch (err) {
      console.error("Failed to load analytics", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [serializedOptions]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    data,
    loading,
    error,
    refetch: fetchAnalytics,
  };
}
