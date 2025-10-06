import { NextRequest, NextResponse } from "next/server";
import { fetchPerformanceData } from "@/features/performance/api/queries";
import type { PerformanceQueryParams } from "@/features/performance/api/types";
import type { Platform, Product, RangePreset, Perspective } from "@/features/performance/types";

/**
 * GET /api/performance
 * 
 * Query params:
 * - perspective: default | cloudwalk | infinitepay | jim
 * - product: POS | TAP | LINK | JIM (optional, filters by single product)
 * - products: POS,TAP,LINK (optional, filters by multiple products)
 * - platforms: META,GOOGLE,TIKTOK (optional, comma-separated)
 * - range: yesterday | 7d | 30d | custom (default: 7d)
 * - from: YYYY-MM-DD (required if range=custom)
 * - to: YYYY-MM-DD (required if range=custom)
 * - search: search query for ad_name or campaign_name (optional)
 * 
 * Returns: Array of MktAdsLookerRow
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
    const search = searchParams.get("search");
    
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
      search: search || undefined,
    };
    
    // Fetch data from Supabase
    const result = await fetchPerformanceData(queryParams);
    
    return NextResponse.json({
      data: result.data,
      error: null,
      count: result.count,
    });
  } catch (error: any) {
    console.error("API /performance error:", error);
    
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


