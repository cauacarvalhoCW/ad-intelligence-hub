import { NextRequest, NextResponse } from "next/server";
import { fetchPerformanceData } from "@/features/performance/api/queries";
import {
  calculateInfinitePayKPIs,
  calculateJimKPIs,
  calculatePosKPIs,
  calculateTapKPIs,
  calculateLinkKPIs,
} from "@/features/performance/utils/kpi-calculations";
import type { PerformanceQueryParams } from "@/features/performance/api/types";
import type { Platform, Product, RangePreset, Perspective, MktAdsLookerRow } from "@/features/performance/types";

/**
 * GET /api/performance/kpis
 * 
 * Query params: Same as /api/performance
 * 
 * Returns: Aggregated KPI metrics (totals, not individual rows)
 * Uses product-specific calculation functions
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse query parameters
    const perspective = searchParams.get("perspective") as Perspective;
    const product = searchParams.get("product") as Product | null;
    const productsParam = searchParams.get("products");
    const platformsParam = searchParams.get("platforms");
    const range = (searchParams.get("range") as RangePreset) || "7d";
    const dateFrom = searchParams.get("from");
    const dateTo = searchParams.get("to");
    
    // Validate required params
    if (!perspective) {
      return NextResponse.json(
        {
          data: null,
          error: { message: "Missing required parameter: perspective" },
        },
        { status: 400 }
      );
    }
    
    // Validate custom date range
    if (range === "custom" && (!dateFrom || !dateTo)) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: "Custom range requires 'from' and 'to' parameters",
          },
        },
        { status: 400 }
      );
    }
    
    // Parse arrays
    const products = productsParam
      ? (productsParam.split(",") as Product[])
      : undefined;
    const platforms = platformsParam
      ? (platformsParam.split(",") as Platform[])
      : undefined;
    
    // Build query params
    const queryParams: PerformanceQueryParams = {
      perspective,
      product: product || undefined,
      products,
      platforms,
      range,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    };
    
    // Fetch raw data from Supabase
    console.log("🔍 [API /performance/kpis] Query params:", queryParams);
    const { data: rows } = await fetchPerformanceData(queryParams);
    console.log(`📊 [API /performance/kpis] Fetched ${rows.length} rows from Supabase`);
    
    // Calculate KPIs using product-specific functions
    let kpiMetrics;
    
    if (product) {
      // Single product drilldown
      switch (product) {
        case "JIM":
          kpiMetrics = calculateJimKPIs(rows as MktAdsLookerRow[]);
          break;
        case "POS":
          kpiMetrics = calculatePosKPIs(rows as MktAdsLookerRow[]);
          break;
        case "TAP":
          kpiMetrics = calculateTapKPIs(rows as MktAdsLookerRow[]);
          break;
        case "LINK":
          kpiMetrics = calculateLinkKPIs(rows as MktAdsLookerRow[]);
          break;
        default:
          kpiMetrics = calculateInfinitePayKPIs(rows as MktAdsLookerRow[]);
      }
    } else if (products && products.length > 0) {
      // Multiple products (e.g., InfinitePay Overview: POS + TAP + LINK)
      const isInfinitePay = products.includes("POS") || products.includes("TAP") || products.includes("LINK");
      const includesJim = products.includes("JIM");
      
      if (isInfinitePay && !includesJim) {
        // InfinitePay only (no JIM)
        kpiMetrics = calculateInfinitePayKPIs(rows as MktAdsLookerRow[]);
      } else {
        // Fallback to InfinitePay calculation
        kpiMetrics = calculateInfinitePayKPIs(rows as MktAdsLookerRow[]);
      }
    } else {
      // No filter (all products) - default to InfinitePay
      kpiMetrics = calculateInfinitePayKPIs(rows as MktAdsLookerRow[]);
    }
    
    console.log("✅ [API /performance/kpis] Calculated KPIs:", kpiMetrics);
    
    return NextResponse.json({
      data: kpiMetrics,
      error: null,
    });
  } catch (error: any) {
    console.error("API /performance/kpis error:", error);
    
    return NextResponse.json(
      {
        data: null,
        error: {
          message: error.message || "Internal server error",
          code: error.code || "UNKNOWN_ERROR",
        },
      },
      { status: 500 }
    );
  }
}


