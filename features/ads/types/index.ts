export type { Ad, FilterState } from "@/lib/types";

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

export interface AdsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdsFilters {
  competitors?: string[];
  assetTypes?: string[];
  products?: string[];
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  platform?: string; // "GOOGLE" | "META"
}

export interface AdsRequestParams extends AdsFilters {
  page: number;
  limit: number;
  perspective: Perspective;
}

export interface AdsServiceResult {
  ads: Ad[];
  pagination: AdsPagination;
  perspective: Perspective;
  competitorIds: string[] | null;
}
