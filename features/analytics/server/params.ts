import type { NextRequest } from "next/server";

import {
  DEFAULT_PERSPECTIVE,
  isPerspective,
  type AnalyticsRequestParams,
} from "@/features/analytics/types";

function parseList(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseAnalyticsRequestParams(
  request: NextRequest,
): AnalyticsRequestParams {
  const { searchParams } = new URL(request.url);

  const perspectiveValue = searchParams.get("perspective");
  const perspective = isPerspective(perspectiveValue)
    ? perspectiveValue
    : DEFAULT_PERSPECTIVE;

  return {
    perspective,
    search: searchParams.get("search") || undefined,
    competitors: parseList(searchParams.get("competitors")),
    assetTypes: parseList(searchParams.get("adTypes")),
    platform: searchParams.get("platform") || undefined,
    dateFrom: searchParams.get("dateFrom") || undefined,
    dateTo: searchParams.get("dateTo") || undefined,
  };
}
