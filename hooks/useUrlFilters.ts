"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { FilterState } from "@/components/ad-filters";

interface UseUrlFiltersOptions {
  perspectiva: string;
  creativeId?: string;
  searchParams?: { [key: string]: string | string[] | undefined };
}

interface UseUrlFiltersReturn {
  filters: FilterState;
  updateFilters: (newFilters: Partial<FilterState>) => void;
  applyFilters: (filters: FilterState) => void;
  openAd: (adId: string) => void;
  closeAd: () => void;
  clearFilters: () => void;
}

const DEFAULT_FILTERS: FilterState = {
  searchTerm: "",
  selectedCompetitors: [],
  selectedPlatform: "all",
  selectedAdType: "all",
  dateRange: "all",
  dateFrom: "",
  dateTo: "",
  tags: [],
};

export function useUrlFilters({
  perspectiva,
  creativeId,
  searchParams: initialSearchParams,
}: UseUrlFiltersOptions): UseUrlFiltersReturn {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Parse filters from URL on mount
  const parseFiltersFromUrl = useCallback((): FilterState => {
    const params = searchParams || new URLSearchParams();
    
    return {
      searchTerm: params.get("search") || "",
      selectedCompetitors: params.get("competitors")
        ? params.get("competitors")!.split(",").filter(Boolean)
        : [],
      selectedPlatform: params.get("platform") || "all",
      selectedAdType: params.get("assetType") || "all",
      dateRange: "all",
      dateFrom: params.get("dateFrom") || "",
      dateTo: params.get("dateTo") || "",
      tags: params.get("tags") 
        ? params.get("tags")!.split(",").filter(Boolean)
        : [],
    };
  }, [searchParams]);

  const [filters, setFilters] = useState<FilterState>(() => parseFiltersFromUrl());
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // Re-parse filters when URL changes
  useEffect(() => {
    console.log("🔄 URL mudou, parseando filtros...");
    const newFilters = parseFiltersFromUrl();
    console.log("📥 Novos filtros da URL:", newFilters);
    console.log("📦 Filtros atuais:", filters);
    
    // Only update if filters actually changed to avoid unnecessary re-renders
    if (JSON.stringify(newFilters) !== JSON.stringify(filters)) {
      console.log("✅ Filtros mudaram! Atualizando estado...");
      setFilters(newFilters);
    } else {
      console.log("⏭️ Filtros iguais, pulando atualização");
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // Build URL with filters and UTMs preserved
  const buildUrl = useCallback(
    (
      newFilters: FilterState,
      adId?: string | null
    ): string => {
      const params = new URLSearchParams();
      
      // Preserve UTM parameters
      const currentParams = searchParams || new URLSearchParams();
      currentParams.forEach((value, key) => {
        if (key.startsWith("utm_")) {
          params.set(key, value);
        }
      });

      // Add ad parameter if present
      if (adId !== undefined && adId !== null) {
        params.set("ad", adId);
      }

      // Add filters
      if (newFilters.searchTerm) {
        params.set("search", newFilters.searchTerm);
      }
      if (newFilters.selectedCompetitors.length > 0) {
        params.set("competitors", newFilters.selectedCompetitors.join(","));
      }
      if (newFilters.selectedPlatform !== "all") {
        params.set("platform", newFilters.selectedPlatform);
      }
      if (newFilters.selectedAdType !== "all") {
        params.set("assetType", newFilters.selectedAdType);
      }
      if (newFilters.dateFrom) {
        params.set("dateFrom", newFilters.dateFrom);
      }
      if (newFilters.dateTo) {
        params.set("dateTo", newFilters.dateTo);
      }
      if (newFilters.tags.length > 0) {
        params.set("tags", newFilters.tags.join(","));
      }

      // Build path (always just /perspectiva/concorrente)
      const path = `/${perspectiva}/concorrente`;
      const queryString = params.toString();
      return queryString ? `${path}?${queryString}` : path;
    },
    [perspectiva, searchParams]
  );

  // Update filters locally (does NOT apply to URL/API)
  const updateFilters = useCallback(
    (newFilters: Partial<FilterState>) => {
      setFilters((prev) => ({ ...prev, ...newFilters }));
    },
    []
  );

  // Apply filters to URL (triggers API call)
  const applyFilters = useCallback(
    (filtersToApply: FilterState) => {
      console.log("🚀 Aplicando filtros:", filtersToApply);
      const url = buildUrl(filtersToApply, creativeId);
      console.log("🔗 Nova URL:", url);
      router.replace(url, { scroll: false });
      // Note: filters state will be updated by useEffect when URL changes
    },
    [buildUrl, creativeId, router]
  );

  // Open ad detail (use replace to avoid reload)
  const openAd = useCallback(
    (adId: string) => {
      const url = buildUrl(filters, adId);
      router.replace(url, { scroll: false });
    },
    [buildUrl, filters, router]
  );

  // Close ad detail (use replace to avoid reload)
  const closeAd = useCallback(() => {
    const url = buildUrl(filters, null);
    router.replace(url, { scroll: false });
  }, [buildUrl, filters, router]);

  // Clear all filters (applies immediately)
  const clearFilters = useCallback(() => {
    const url = buildUrl(DEFAULT_FILTERS, creativeId);
    router.replace(url, { scroll: false });
    // Note: filters state will be updated by useEffect when URL changes
  }, [buildUrl, creativeId, router]);

  // No need for compatibility redirect anymore - we only use ?ad= now

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  return {
    filters,
    updateFilters,
    applyFilters,
    openAd,
    closeAd,
    clearFilters,
  };
}

