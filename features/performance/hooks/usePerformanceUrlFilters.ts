"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Platform, RangePreset, DateRangeFilter } from "../types";

export interface PerformanceFilters {
  platforms: Platform[];
  range: RangePreset;
  dateRange?: DateRangeFilter;
  searchQuery?: string;
  viewMode?: "ad" | "campaign"; // View: Ad (default) or Campaign
  dimension?: "total" | "daily"; // Dimension: total (default) or daily
}

interface UsePerformanceUrlFiltersOptions {
  basePath: string; // e.g., "/default/performance" or "/default/performance/pos"
  initialFilters?: Partial<PerformanceFilters>;
}

interface UsePerformanceUrlFiltersReturn {
  filters: PerformanceFilters;
  setFilters: (filters: PerformanceFilters) => void;
  resetFilters: () => void;
  isReady: boolean; // False during hydration
}

const DEFAULT_FILTERS: PerformanceFilters = {
  platforms: ["META", "GOOGLE", "TIKTOK"],
  range: "7d",
  dateRange: undefined,
  searchQuery: "",
  viewMode: "ad", // Default: View = Ad
  dimension: "total", // Default: Dimension = Soma Total
};

/**
 * Hook to sync Performance filters with URL query params
 * 
 * Features:
 * - Bidirectional sync (URL ↔ State)
 * - Deep-linking support
 * - Preserves UTM parameters
 * - Browser back/forward support
 * - No page reload (router.replace)
 * 
 * Query params:
 * - platforms: META,GOOGLE,TIKTOK
 * - range: 7d | 30d | yesterday | custom
 * - from: YYYY-MM-DD (if range=custom)
 * - to: YYYY-MM-DD (if range=custom)
 * - search: query string
 */
export function usePerformanceUrlFilters({
  basePath,
  initialFilters,
}: UsePerformanceUrlFiltersOptions): UsePerformanceUrlFiltersReturn {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isReady, setIsReady] = useState(false);

  // Parse filters from URL
  const parseFiltersFromUrl = useCallback((): PerformanceFilters => {
    if (!searchParams) return { ...DEFAULT_FILTERS, ...initialFilters };

    const platformsParam = searchParams.get("platforms");
    const rangeParam = searchParams.get("range");
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");
    const searchParam = searchParams.get("search");
    const viewModeParam = searchParams.get("viewMode") as "ad" | "campaign";
    const dimensionParam = searchParams.get("dimension") as "total" | "daily";

    const platforms = platformsParam
      ? (platformsParam.split(",") as Platform[])
      : DEFAULT_FILTERS.platforms;

    const range = (rangeParam as RangePreset) || DEFAULT_FILTERS.range;

    let dateRange: DateRangeFilter | undefined;
    if (range === "custom" && fromParam && toParam) {
      dateRange = {
        from: new Date(fromParam),
        to: new Date(toParam),
      };
    }

    const searchQuery = searchParam || "";
    const viewMode = viewModeParam || DEFAULT_FILTERS.viewMode || "ad";
    const dimension = dimensionParam || DEFAULT_FILTERS.dimension || "total";

    return {
      platforms,
      range,
      dateRange,
      searchQuery,
      viewMode,
      dimension,
      ...initialFilters,
    };
  }, [searchParams, initialFilters]);

  const [filters, setFiltersState] = useState<PerformanceFilters>(() =>
    parseFiltersFromUrl()
  );

  // Re-parse when URL changes (browser back/forward)
  useEffect(() => {
    const newFilters = parseFiltersFromUrl();
    
    // Only update if different
    if (JSON.stringify(newFilters) !== JSON.stringify(filters)) {
      setFiltersState(newFilters);
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // Mark as ready after hydration
  useEffect(() => {
    setIsReady(true);
  }, []);

  // Build URL with filters
  const buildUrl = useCallback(
    (newFilters: PerformanceFilters): string => {
      const params = new URLSearchParams();

      // Preserve UTM parameters
      if (searchParams) {
        searchParams.forEach((value, key) => {
          if (key.startsWith("utm_")) {
            params.set(key, value);
          }
        });
      }

      // Add platforms (only if not all)
      if (
        newFilters.platforms.length > 0 &&
        newFilters.platforms.length < 3
      ) {
        params.set("platforms", newFilters.platforms.join(","));
      }

      // Add range
      if (newFilters.range !== "7d") {
        params.set("range", newFilters.range);
      }

      // Add custom date range
      if (
        newFilters.range === "custom" &&
        newFilters.dateRange?.from &&
        newFilters.dateRange?.to
      ) {
        params.set(
          "from",
          newFilters.dateRange.from.toISOString().split("T")[0]
        );
        params.set(
          "to",
          newFilters.dateRange.to.toISOString().split("T")[0]
        );
      }

      // Add search query
      if (newFilters.searchQuery) {
        params.set("search", newFilters.searchQuery);
      }

      const queryString = params.toString();
      return queryString ? `${basePath}?${queryString}` : basePath;
    },
    [basePath, searchParams]
  );

  // Update filters and sync with URL
  const setFilters = useCallback(
    (newFilters: PerformanceFilters) => {
      setFiltersState(newFilters);
      const url = buildUrl(newFilters);
      router.replace(url, { scroll: false });
    },
    [buildUrl, router]
  );

  // Reset to default filters
  const resetFilters = useCallback(() => {
    const defaultFilters = { ...DEFAULT_FILTERS, ...initialFilters };
    setFiltersState(defaultFilters);
    const url = buildUrl(defaultFilters);
    router.replace(url, { scroll: false });
  }, [buildUrl, router, initialFilters]);

  return {
    filters,
    setFilters,
    resetFilters,
    isReady,
  };
}


