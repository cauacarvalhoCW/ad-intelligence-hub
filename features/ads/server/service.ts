import type { SupabaseClient } from "@supabase/supabase-js";

import {
  type Ad,
  type AdsRequestParams,
  type AdsServiceResult,
  type Perspective,
} from "@/features/ads/types";
import { PERSPECTIVE_COMPETITORS } from "./constants";

interface AdsSupabaseRow {
  ad_id: string;
  competitor_id: string;
  source?: string | null;
  asset_type: "video" | "image";
  product?: string | null;
  start_date?: string | null;
  display_format?: string | null;
  tags?: string | null;
  image_description?: string | null;
  transcription?: string | null;
  ad_analysis?: unknown;
  created_at: string;
  updated_at?: string | null;
  competitors?: {
    id?: string;
    name?: string;
    home_url?: string | null;
  } | null;
}

interface FetchAdsDependencies {
  supabase: SupabaseClient;
}

function parseDateBoundary(value?: string | null, end = false): string | undefined {
  if (!value) return undefined;
  const suffix = end ? "T23:59:59.999-03:00" : "T00:00:00.000-03:00";
  const iso = new Date(`${value}${suffix}`).toISOString();
  return iso;
}

async function resolvePerspectiveCompetitors(
  supabase: SupabaseClient,
  perspective: Perspective,
): Promise<string[]> {
  const competitorNames = PERSPECTIVE_COMPETITORS[perspective] ?? [];
  if (competitorNames.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("competitors")
    .select("id, name")
    .in("name", competitorNames);

  if (error) {
    throw new Error(`Failed to fetch competitors: ${error.message}`);
  }

  return data?.map((competitor) => competitor.id) ?? [];
}

function mapRowToAd(row: AdsSupabaseRow): Ad {
  const {
    competitors,
    ...rest
  } = row;

  const competitor = competitors
    ? {
        id: competitors.id ?? rest.competitor_id,
        name: competitors.name ?? "",
        home_url: competitors.home_url ?? "",
        created_at: rest.created_at,
        updated_at: rest.updated_at ?? undefined,
      }
    : undefined;

  return {
    ...rest,
    competitor,
    variations_count: 0,
  };
}

export async function fetchAds(
  { supabase }: FetchAdsDependencies,
  params: AdsRequestParams,
): Promise<AdsServiceResult> {
  const { page, limit } = params;
  const offset = (page - 1) * limit;

  const perspectiveIds = await resolvePerspectiveCompetitors(
    supabase,
    params.perspective,
  );

  let query = supabase
    .from("ads")
    .select(
      `
        ad_id,
        competitor_id,
        source,
        asset_type,
        product,
        start_date,
        display_format,
        tags,
        image_description,
        transcription,
        ad_analysis,
        created_at,
        updated_at,
        competitors:competitors!ads_competitor_id_fkey (
          id,
          name,
          home_url
        )
      `,
      { count: "exact" },
    )
    .not("ad_analysis", "is", null)
    .neq("ad_analysis", "{}")
    .in("asset_type", ["video", "image"]);

  if (perspectiveIds.length > 0) {
    query = query.in("competitor_id", perspectiveIds);
  }

  if (params.competitors?.length) {
    query = query.in("competitor_id", params.competitors);
  }

  if (params.assetTypes?.length) {
    query = query.in("asset_type", params.assetTypes);
  }

  if (params.products?.length) {
    query = query.in("product", params.products);
  }

  if (params.search) {
    query = query.or(
      `tags.ilike.%${params.search}%,image_description.ilike.%${params.search}%,transcription.ilike.%${params.search}%,product.ilike.%${params.search}%`,
    );
  }

  const fromDate = parseDateBoundary(params.dateFrom, false);
  if (fromDate) {
    query = query.gte("start_date", fromDate);
  }

  const toDate = parseDateBoundary(params.dateTo, true);
  if (toDate) {
    query = query.lte("start_date", toDate);
  }

  query = query
    .or("transcription.neq.,image_description.neq.,tags.neq.")
    .order("start_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query.returns<AdsSupabaseRow[]>();

  if (error) {
    throw new Error(`Failed to fetch ads: ${error.message}`);
  }

  const ads = (data ?? []).map((row) => mapRowToAd(row));

  return {
    ads,
    pagination: {
      page,
      limit,
      total: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / limit),
    },
    perspective: params.perspective,
    competitorIds: perspectiveIds.length > 0 ? perspectiveIds : null,
  };
}
