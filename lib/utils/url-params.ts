import type { FilterState } from "@/components/ad-filters";
import type { ThemeType } from "@/lib/types";

/**
 * Perspectivas válidas conforme regras de negócio
 */
export const VALID_PERSPECTIVES = [
  "default",
  "cloudwalk",
  "infinitepay",
  "jim",
] as const;

export type Perspective = (typeof VALID_PERSPECTIVES)[number];

/**
 * Valida se um slug é uma perspectiva válida
 */
export function isValidPerspective(slug: string): slug is Perspective {
  return VALID_PERSPECTIVES.includes(slug as Perspective);
}

/**
 * Parse filtros da query string para FilterState
 */
export function parseFiltersFromURL(
  searchParams: URLSearchParams | Record<string, string | string[] | undefined>
): FilterState {
  // Normalizar para objeto simples
  const params: Record<string, string | undefined> = {};
  
  if (searchParams instanceof URLSearchParams) {
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
  } else {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined) {
        params[key] = Array.isArray(value) ? value[0] : value;
      }
    });
  }

  return {
    searchTerm: params.search || "",
    selectedCompetitors: params.competitors
      ? params.competitors.split(",").filter(Boolean)
      : [],
    selectedPlatform: params.platform || "all",
    selectedAdType: params.type || "all",
    dateRange: "all",
    dateFrom: params.dateFrom || "",
    dateTo: params.dateTo || "",
    tags: params.tags ? params.tags.split(",").filter(Boolean) : [],
  };
}

/**
 * Converte FilterState para query string, preservando UTMs
 */
export function buildFilterQuery(
  filters: FilterState,
  preserveUTMs?: URLSearchParams
): string {
  const params = new URLSearchParams();

  // Preservar UTMs existentes
  if (preserveUTMs) {
    preserveUTMs.forEach((value, key) => {
      if (key.startsWith("utm_")) {
        params.set(key, value);
      }
    });
  }

  // Adicionar filtros (apenas não-default)
  if (filters.searchTerm) {
    params.set("search", filters.searchTerm);
  }

  if (filters.selectedCompetitors.length > 0) {
    params.set("competitors", filters.selectedCompetitors.join(","));
  }

  if (filters.selectedPlatform && filters.selectedPlatform !== "all") {
    params.set("platform", filters.selectedPlatform);
  }

  if (filters.selectedAdType && filters.selectedAdType !== "all") {
    params.set("type", filters.selectedAdType);
  }

  if (filters.dateFrom) {
    params.set("dateFrom", filters.dateFrom);
  }

  if (filters.dateTo) {
    params.set("dateTo", filters.dateTo);
  }

  if (filters.tags.length > 0) {
    params.set("tags", filters.tags.join(","));
  }

  return params.toString();
}

/**
 * Preserva parâmetros UTM ao construir nova URL
 */
export function preserveUTMParams(
  currentParams: URLSearchParams,
  newParams: Record<string, string>
): URLSearchParams {
  const result = new URLSearchParams(newParams);

  // Copiar todos os utm_*
  currentParams.forEach((value, key) => {
    if (key.startsWith("utm_")) {
      result.set(key, value);
    }
  });

  return result;
}

/**
 * Extrai todos os parâmetros UTM de uma URLSearchParams
 */
export function extractUTMParams(
  searchParams: URLSearchParams
): Record<string, string> {
  const utms: Record<string, string> = {};

  searchParams.forEach((value, key) => {
    if (key.startsWith("utm_")) {
      utms[key] = value;
    }
  });

  return utms;
}
