import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  AnalyticsMetrics,
  AnalyticsRequestParams,
  AnalyticsResponse,
  Perspective,
} from "@/features/analytics/types";
import {
  ANALYTICS_PERSPECTIVE_COMPETITORS,
  ANALYTICS_TAG_STOPWORDS,
} from "./constants";

interface FetchAnalyticsDependencies {
  supabase: SupabaseClient;
}

interface AnalyticsSupabaseRow {
  ad_id: string;
  competitor_id: string;
  asset_type: string;
  product?: string | null;
  tags?: string | null;
  image_description?: string | null;
  transcription?: string | null;
  ad_analysis?: Record<string, any> | null;
  source?: string | null;
  start_date?: string | null;
  competitors?: {
    id?: string;
    name?: string;
  } | null;
}

function normalizeDateBoundary(value?: string | null, end = false): string | undefined {
  if (!value) return undefined;
  const suffix = end ? "T23:59:59.999-03:00" : "T00:00:00.000-03:00";
  return new Date(`${value}${suffix}`).toISOString();
}

async function resolvePerspectiveCompetitors(
  supabase: SupabaseClient,
  perspective: Perspective,
): Promise<string[]> {
  const competitorNames = ANALYTICS_PERSPECTIVE_COMPETITORS[perspective] ?? [];
  if (competitorNames.length === 0) return [];

  const { data, error } = await supabase
    .from("competitors")
    .select("id, name")
    .in("name", competitorNames);

  if (error) {
    throw new Error(`Failed to resolve perspective competitors: ${error.message}`);
  }

  return data?.map((entry) => entry.id) ?? [];
}

function buildBaseQuery(
  supabase: SupabaseClient,
  competitorIds: string[],
  params: AnalyticsRequestParams,
) {
  let query = supabase
    .from("ads")
    .select(
      `
        ad_id,
        competitor_id,
        asset_type,
        product,
        tags,
        image_description,
        transcription,
        ad_analysis,
        source,
        start_date,
        competitors:competitors!ads_competitor_id_fkey (
          id,
          name
        )
      `,
      { count: "exact" },
    )
    .not("ad_analysis", "is", null)
    .neq("ad_analysis", "{}")
    .in("asset_type", ["video", "image"])
    .or("transcription.neq.,image_description.neq.,tags.neq.");

  if (competitorIds.length > 0) {
    query = query.in("competitor_id", competitorIds);
  }

  if (params.competitors?.length) {
    query = query.in("competitor_id", params.competitors);
  }

  if (params.platform === "meta") {
    query = query.or(
      "source.ilike.%facebook%,source.ilike.%fbcdn%,source.ilike.%meta%",
    );
  }

  if (params.assetTypes?.length) {
    query = query.in("asset_type", params.assetTypes);
  }

  const fromDate = normalizeDateBoundary(params.dateFrom, false);
  if (fromDate) {
    query = query.gte("start_date", fromDate);
  }

  const toDate = normalizeDateBoundary(params.dateTo, true);
  if (toDate) {
    query = query.lte("start_date", toDate);
  }

  if (params.search) {
    const searchTerm = `%${params.search}%`;
    query = query.or(
      `tags.ilike.${searchTerm},image_description.ilike.${searchTerm},transcription.ilike.${searchTerm},product.ilike.${searchTerm}`,
    );
  }

  return query;
}

function getWeekStart(date: Date): string {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = copy.getDate() - day;
  copy.setDate(diff);
  return copy.toISOString().split("T")[0];
}

function extractAndCleanTags(rows: AnalyticsSupabaseRow[]) {
  const counters: Record<string, number> = {};

  rows.forEach((row) => {
    if (!row.tags) return;

    row.tags
      .toLowerCase()
      .split(/[,;]/)
      .map((tag) => tag.trim())
      .filter((tag) => tag && !ANALYTICS_TAG_STOPWORDS.has(tag))
      .forEach((tag) => {
        counters[tag] = (counters[tag] || 0) + 1;
      });
  });

  return Object.entries(counters)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

function extractFeesAndOffers(rows: AnalyticsSupabaseRow[]) {
  const feeBuckets: Record<string, number[]> = {
    credito: [],
    debito: [],
    pix: [],
    antecipacao: [],
    mensalidade: [],
  };

  const offerValues: number[] = [];
  const adsWithOffers = new Set<string>();

  rows.forEach((row) => {
    if (row.ad_analysis?.rates) {
      const { credit, debit, pix } = row.ad_analysis.rates;
      const parsedRates: Array<[string, string | undefined]> = [
        ["credito", credit],
        ["debito", debit],
        ["pix", pix],
      ];

      parsedRates.forEach(([bucket, value]) => {
        if (!value || value === "0%") return;
        const parsed = parseFloat(value.replace(/[%,]/g, "."));
        if (!Number.isFinite(parsed) || parsed > 30) return;
        feeBuckets[bucket].push(parsed);
      });
      return;
    }

    const text = `${row.transcription || ""} ${row.image_description || ""} ${
      row.tags || ""
    }`.toLowerCase();
    const matches = text.match(/(\d{1,2}(?:[.,]\d{1,2})?)\s*%/g) || [];

    matches.forEach((match) => {
      const matchIndex = text.indexOf(match);
      const context = text.substring(
        Math.max(0, matchIndex - 40),
        Math.min(text.length, matchIndex + match.length + 40),
      );
      const percent = parseFloat(match.replace("%", "").replace(",", "."));
      if (!Number.isFinite(percent)) return;

      if (context.match(/(cdi|rend|cashback|cdb|poupan|por cento do cdi)/)) {
        if (percent > 30 && percent <= 200) {
          offerValues.push(percent);
          adsWithOffers.add(row.ad_id);
        }
        return;
      }

      if (percent > 30) return;

      if (context.match(/(cr[eé]dito|credito)/)) {
        feeBuckets.credito.push(percent);
      } else if (context.match(/(d[eé]bito|debito)/)) {
        feeBuckets.debito.push(percent);
      } else if (context.match(/\bpix\b/)) {
        feeBuckets.pix.push(percent);
      } else if (context.match(/antecip/)) {
        feeBuckets.antecipacao.push(percent);
      } else if (context.match(/mensal/)) {
        feeBuckets.mensalidade.push(percent);
      }
    });
  });

  const fees = Object.entries(feeBuckets)
    .filter(([, values]) => values.length > 0)
    .map(([label, values]) => {
      const sorted = [...values].sort((a, b) => a - b);
      return {
        label,
        ads_com_taxa: sorted.length,
        matches: sorted.length,
        min: sorted[0],
        median: sorted[Math.floor(sorted.length / 2)],
        max: sorted[sorted.length - 1],
      };
    });

  const offers =
    offerValues.length > 0
      ? [
          {
            label: "rendimento",
            ads_com_taxa: adsWithOffers.size,
            matches: offerValues.length,
            min: Math.min(...offerValues),
            median: [...offerValues].sort((a, b) => a - b)[
              Math.floor(offerValues.length / 2)
            ],
            max: Math.max(...offerValues),
          },
        ]
      : [];

  return { fees, offers };
}

function calculateMetrics(
  rows: AnalyticsSupabaseRow[],
  params: AnalyticsRequestParams,
  total: number,
): AnalyticsMetrics {
  const byCompetitorMap = new Map<string, number>();
  const byAssetTypeMap = new Map<string, number>();
  const weeklyMap = new Map<string, number>();

  rows.forEach((row) => {
    const competitorName = row.competitors?.name || "Desconhecido";
    byCompetitorMap.set(
      competitorName,
      (byCompetitorMap.get(competitorName) ?? 0) + 1,
    );

    const assetType = row.asset_type?.toLowerCase() || "unknown";
    byAssetTypeMap.set(assetType, (byAssetTypeMap.get(assetType) ?? 0) + 1);

    if (row.start_date) {
      const weekStart = getWeekStart(new Date(row.start_date));
      weeklyMap.set(weekStart, (weeklyMap.get(weekStart) ?? 0) + 1);
    }
  });

  const by_competitor = Array.from(byCompetitorMap.entries())
    .map(([competitor_name, count]) => ({ competitor_name, count }))
    .sort((a, b) => b.count - a.count);

  const by_asset_type = Array.from(byAssetTypeMap.entries()).map(
    ([asset_type, count]) => ({ asset_type, count }),
  );

  const weekly = Array.from(weeklyMap.entries())
    .map(([week_start, total]) => ({ week_start, total }))
    .sort((a, b) => a.week_start.localeCompare(b.week_start));

  const top_tags = extractAndCleanTags(rows).slice(0, 20);
  const { fees, offers } = extractFeesAndOffers(rows);

  const platform = [{ label: params.platform ?? "Meta", value: total }];

  return {
    total_ads: total,
    by_competitor,
    by_asset_type,
    weekly,
    top_tags,
    fees,
    offers,
    platform,
  };
}

export async function fetchAnalytics(
  { supabase }: FetchAnalyticsDependencies,
  params: AnalyticsRequestParams,
): Promise<AnalyticsResponse> {
  const perspectiveIds = await resolvePerspectiveCompetitors(
    supabase,
    params.perspective,
  );

  const query = buildBaseQuery(supabase, perspectiveIds, params).limit(2000);

  const { data, error, count } = await query.returns<AnalyticsSupabaseRow[]>();

  if (error) {
    throw new Error(`Failed to fetch analytics data: ${error.message}`);
  }

  const rows = data ?? [];
  const total = count ?? rows.length;
  const metrics = calculateMetrics(rows, params, total);

  return {
    applied: {
      perspective: params.perspective,
      competitors: params.competitors ?? [],
      platform: params.platform,
      ad_types: params.assetTypes ?? [],
      date_from: params.dateFrom,
      date_to: params.dateTo,
      q: params.search,
    },
    metrics,
    base_ads_count: total,
  };
}
