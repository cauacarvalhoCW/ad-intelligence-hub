import { NextRequest, NextResponse } from "next/server";
import { createSupabaseGrowthServer } from "@/lib/supabase/growth";
import {
  getPerformanceDashboardData,
  parsePerformanceRequestParams,
} from "@/features/performance/server";

/**
 * GET /api/performance/metrics
 * Get complete dashboard data with calculated metrics
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Check environment variables
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL_GROWTH ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY_GROWTH
    ) {
      return NextResponse.json(
        {
          error:
            "Supabase Growth environment variables are missing.",
        },
        { status: 500 }
      );
    }

    const supabase = await createSupabaseGrowthServer();
    const params = parsePerformanceRequestParams(request);

    const dashboardData = await getPerformanceDashboardData({ supabase }, params);

    const duration = Date.now() - startTime;
    console.info("[api/performance/metrics] request completed", {
      perspective: params.perspective,
      product: params.product,
      platform: params.platform,
      dateFrom: params.dateFrom,
      dateTo: params.dateTo,
      totalAds: dashboardData.ads.length,
      totalCost: dashboardData.metrics.totalCost,
      durationMs: duration,
    });

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error("[api/performance/metrics] unexpected error", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        message: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

