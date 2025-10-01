/**
 * Performance Query Params Parser
 */

import { NextRequest } from "next/server";
import type { PerformanceQueryParams, ProductType } from "../types";
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, DATE_PRESETS, type DatePreset } from "./constants";

/**
 * Parse URL search params to PerformanceQueryParams
 */
export function parsePerformanceRequestParams(
  request: NextRequest
): PerformanceQueryParams {
  const { searchParams } = new URL(request.url);

  const perspective = (searchParams.get("perspective") || "default") as PerformanceQueryParams["perspective"];
  const product = searchParams.get("product")?.toUpperCase() as ProductType | undefined;
  const platform = searchParams.get("platform") as "meta" | "google" | "tiktok" | undefined;
  
  // Pagination
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, parseInt(searchParams.get("limit") || String(DEFAULT_PAGE_SIZE), 10))
  );

  // Date filters
  let dateFrom = searchParams.get("dateFrom") || undefined;
  let dateTo = searchParams.get("dateTo") || undefined;

  // Handle date presets
  const preset = searchParams.get("preset") as DatePreset | null;
  if (preset && Object.values(DATE_PRESETS).includes(preset as DatePreset)) {
    const dates = getDateRangeFromPreset(preset as DatePreset);
    dateFrom = dates.from;
    dateTo = dates.to;
  }

  return {
    perspective,
    product,
    platform,
    dateFrom,
    dateTo,
    page,
    limit,
  };
}

/**
 * Convert date preset to actual date range
 */
function getDateRangeFromPreset(preset: DatePreset): { from: string; to: string } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  let from: Date;
  let to: Date = today;

  switch (preset) {
    case 'today':
      from = today;
      break;
    
    case 'yesterday':
      from = new Date(today);
      from.setDate(from.getDate() - 1);
      to = from;
      break;
    
    case 'last_7_days':
      from = new Date(today);
      from.setDate(from.getDate() - 7);
      break;
    
    case 'last_30_days':
      from = new Date(today);
      from.setDate(from.getDate() - 30);
      break;
    
    case 'last_90_days':
      from = new Date(today);
      from.setDate(from.getDate() - 90);
      break;
    
    case 'this_week':
      from = new Date(today);
      from.setDate(from.getDate() - from.getDay()); // Sunday
      break;
    
    case 'this_month':
      from = new Date(today.getFullYear(), today.getMonth(), 1);
      break;
    
    case 'last_month':
      from = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      to = new Date(today.getFullYear(), today.getMonth(), 0); // Last day of previous month
      break;
    
    default:
      from = new Date(today);
      from.setDate(from.getDate() - 30); // Default to last 30 days
  }

  return {
    from: formatDate(from),
    to: formatDate(to),
  };
}

/**
 * Format date as YYYY-MM-DD
 */
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

