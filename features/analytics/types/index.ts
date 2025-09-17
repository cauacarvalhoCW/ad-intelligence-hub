import type { ThemeAnalytics, ThemeType } from "@/lib/types";

export type Perspective = "infinitepay" | "jim" | "cloudwalk" | "default";
export const DEFAULT_PERSPECTIVE: Perspective = "default";
export const PERSPECTIVE_VALUES: Perspective[] = [
  "infinitepay",
  "jim",
  "cloudwalk",
  "default",
];

export function isPerspective(value: string | null): value is Perspective {
  return value !== null && PERSPECTIVE_VALUES.includes(value as Perspective);
}

export interface AnalyticsFilters {
  search?: string;
  competitors?: string[];
  assetTypes?: string[];
  dateFrom?: string;
  dateTo?: string;
  platform?: string;
}

export interface AnalyticsRequestParams extends AnalyticsFilters {
  perspective: Perspective;
}

export interface AnalyticsMetrics {
  total_ads: number;
  by_competitor: Array<{ competitor_name: string; count: number }>;
  by_asset_type: Array<{ asset_type: string; count: number }>;
  weekly: Array<{ week_start: string; total: number }>;
  top_tags: Array<{ tag: string; count: number }>;
  fees: Array<{
    label: string;
    ads_com_taxa: number;
    matches: number;
    min: number;
    median: number;
    max: number;
  }>;
  offers: Array<{
    label: string;
    ads_com_taxa: number;
    matches: number;
    min: number;
    median: number;
    max: number;
  }>;
  platform: Array<{ label: string; value: number }>;
}

export interface AnalyticsResponse {
  applied: {
    perspective: Perspective;
    competitors: string[];
    platform?: string;
    ad_types: string[];
    date_from?: string;
    date_to?: string;
    q?: string;
  };
  metrics: AnalyticsMetrics;
  base_ads_count: number;
}

export interface AnalyticsServiceResult {
  applied: AnalyticsResponse["applied"];
  metrics: AnalyticsMetrics;
  base_ads_count: number;
}

export interface AnalyticsOptions {
  perspective?: Perspective;
  filters?: {
    search?: string;
    competitors?: string[];
    assetTypes?: string[];
    dateRange?: {
      start: Date | null;
      end: Date | null;
    };
  };
}

export { ThemeAnalytics, ThemeType };
