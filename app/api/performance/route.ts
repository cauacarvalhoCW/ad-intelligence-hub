import { NextRequest, NextResponse } from "next/server";
import { createSupabaseGrowthServer } from "@/lib/supabase/growth";
import {
  fetchPerformanceAds,
  parsePerformanceRequestParams,
} from "@/features/performance/server";

/**
 * GET /api/performance
 * Fetch performance ads with filtering and pagination
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
            "Supabase Growth environment variables are missing. Check NEXT_PUBLIC_SUPABASE_URL_GROWTH and SUPABASE_SERVICE_ROLE_KEY_GROWTH.",
        },
        { status: 500 }
      );
    }

    const supabase = await createSupabaseGrowthServer();
    const params = parsePerformanceRequestParams(request);

    const result = await fetchPerformanceAds({ supabase }, params);

    const duration = Date.now() - startTime;
    console.info("[api/performance] request completed", {
      page: params.page,
      limit: params.limit,
      perspective: params.perspective,
      product: params.product,
      platform: params.platform,
      dateFrom: params.dateFrom,
      dateTo: params.dateTo,
      total: result.total,
      durationMs: duration,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[api/performance] unexpected error", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        message: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

