import type { Platform, Product, RangePreset, Perspective } from "../types";

/**
 * Query parameters for Performance API endpoints
 */
export interface PerformanceQueryParams {
  perspective: Perspective;
  product?: Product;
  products?: Product[];
  platforms?: Platform[];
  range?: RangePreset;
  dateFrom?: string; // ISO date (YYYY-MM-DD)
  dateTo?: string;   // ISO date (YYYY-MM-DD)
  search?: string;   // Search in ad_name or campaign_name
}

/**
 * Response from Performance API endpoints
 */
export interface PerformanceAPIResponse<T = any> {
  data: T | null;
  error: {
    message: string;
    code?: string;
  } | null;
  count?: number;
}


