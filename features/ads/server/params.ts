import type { NextRequest } from "next/server";

import {
  DEFAULT_PERSPECTIVE,
  isPerspective,
  type AdsRequestParams,
  type Perspective,
} from "@/features/ads/types";

function parseNumber(value: string | null, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseList(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parsePerspective(value: string | null): Perspective {
  return isPerspective(value) ? value : DEFAULT_PERSPECTIVE;
}

export function parseAdsRequestParams(request: NextRequest): AdsRequestParams {
  const { searchParams } = new URL(request.url);

  const page = parseNumber(searchParams.get("page"), 1);
  const limit = parseNumber(searchParams.get("limit"), 24);
  const perspective = parsePerspective(searchParams.get("perspective"));

  return {
    page,
    limit,
    perspective,
    competitors: parseList(searchParams.get("competitors")),
    assetTypes: parseList(searchParams.get("assetTypes")),
    products: parseList(searchParams.get("products")),
    search: searchParams.get("search") || "",
    dateFrom: searchParams.get("dateFrom") || undefined,
    dateTo: searchParams.get("dateTo") || undefined,
  };
}
