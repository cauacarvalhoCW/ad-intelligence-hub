import { NextRequest, NextResponse } from "next/server";

import { fetchAds, parseAdsRequestParams } from "@/features/ads/server";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      return NextResponse.json(
        {
          error:
            "Supabase environment variables are missing. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
        },
        { status: 500 },
      );
    }

    const supabase = await createSupabaseServer();
    const params = parseAdsRequestParams(request);

    const result = await fetchAds({ supabase }, params);

    const duration = Date.now() - startTime;
    console.info("[api/ads] request completed", {
      page: params.page,
      limit: params.limit,
      perspective: params.perspective,
      competitors: params.competitors,
      assetTypes: params.assetTypes,
      products: params.products,
      search: params.search,
      dateFrom: params.dateFrom,
      dateTo: params.dateTo,
      durationMs: duration,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[api/ads] unexpected error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
