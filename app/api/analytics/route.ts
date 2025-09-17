import { NextRequest, NextResponse } from "next/server";

import { fetchAnalytics, parseAnalyticsRequestParams } from "@/features/analytics/server";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const startedAt = Date.now();

  try {
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      return NextResponse.json(
        { error: "Supabase configuration missing" },
        { status: 500 },
      );
    }

    const supabase = await createSupabaseServer();
    const params = parseAnalyticsRequestParams(request);

    const payload = await fetchAnalytics({ supabase }, params);

    console.info("[api/analytics] request completed", {
      perspective: params.perspective,
      competitors: params.competitors,
      platform: params.platform,
      assetTypes: params.assetTypes,
      dateFrom: params.dateFrom,
      dateTo: params.dateTo,
      search: params.search,
      durationMs: Date.now() - startedAt,
    });

    return NextResponse.json(payload);
  } catch (error) {
    console.error("[api/analytics] unexpected error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
