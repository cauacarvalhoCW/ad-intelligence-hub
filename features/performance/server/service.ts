/**
 * Performance Service Layer
 * Handles data fetching and metrics calculation
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  PerformanceAd,
  PerformanceQueryParams,
  PerformanceMetrics,
  PerformanceDashboardData,
  ProductType,
} from "../types";
import { PRODUCTS_BY_PERSPECTIVE } from "../types";
import { METRICS_DEFAULTS } from "./constants";

interface FetchPerformanceAdsResult {
  ads: PerformanceAd[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Fetch performance ads from mkt_ads_looker table
 */
export async function fetchPerformanceAds(
  { supabase }: { supabase: SupabaseClient },
  params: PerformanceQueryParams
): Promise<FetchPerformanceAdsResult> {
  let query = supabase.from("mkt_ads_looker").select("*", { count: "exact" });

  // Filter by product (if specified)
  if (params.product) {
    query = query.eq("product", params.product);
  } else {
    // Filter by perspective's products
    const products = PRODUCTS_BY_PERSPECTIVE[params.perspective];
    if (products && products.length > 0) {
      query = query.in("product", products);
    }
  }

  // Filter by platform
  if (params.platform) {
    query = query.eq("platform", params.platform);
  }

  // Filter by date range
  if (params.dateFrom) {
    query = query.gte("date", params.dateFrom);
  }
  if (params.dateTo) {
    query = query.lte("date", params.dateTo);
  }

  // Pagination
  const page = params.page || 1;
  const limit = params.limit || 24;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  query = query.range(from, to).order("date", { ascending: false });

  const { data, error, count } = await query;

  if (error) {
    console.error("[fetchPerformanceAds] error:", error);
    throw new Error(`Failed to fetch performance ads: ${error.message}`);
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / limit);

  return {
    ads: (data as PerformanceAd[]) || [],
    total,
    page,
    limit,
    totalPages,
  };
}

/**
 * Calculate aggregated performance metrics
 */
export function calculateMetrics(ads: PerformanceAd[]): PerformanceMetrics {
  // Aggregate totals
  const totals = ads.reduce(
    (acc, ad) => ({
      cost: acc.cost + (ad.cost || 0),
      impressions: acc.impressions + (ad.impressions || 0),
      clicks: acc.clicks + (ad.clicks || 0),
      video3s: acc.video3s + (ad.video_3s || 0),
      signups: acc.signups + getTotalSignups(ad),
      activations: acc.activations + getTotalActivations(ad),
    }),
    { cost: 0, impressions: 0, clicks: 0, video3s: 0, signups: 0, activations: 0 }
  );

  // Calculate KPIs
  const cac = totals.signups > 0 
    ? totals.cost / totals.signups 
    : 0;

  const cpm = totals.impressions >= METRICS_DEFAULTS.minImpressions
    ? (totals.cost / totals.impressions) * 1000
    : 0;

  const cpa = totals.activations > 0
    ? totals.cost / totals.activations
    : 0;

  const ctr = totals.impressions >= METRICS_DEFAULTS.minImpressions
    ? (totals.clicks / totals.impressions) * 100
    : 0;

  const hookRate = totals.impressions >= METRICS_DEFAULTS.minImpressions
    ? (totals.video3s / totals.impressions) * 100
    : 0;

  const signupRate = totals.clicks > 0
    ? (totals.signups / totals.clicks) * 100
    : 0;

  const activationRate = totals.signups > 0
    ? (totals.activations / totals.signups) * 100
    : 0;

  return {
    totalCost: totals.cost,
    totalImpressions: totals.impressions,
    totalClicks: totals.clicks,
    totalSignups: totals.signups,
    totalActivations: totals.activations,
    cac: Number(cac.toFixed(2)),
    cpm: Number(cpm.toFixed(2)),
    cpa: Number(cpa.toFixed(2)),
    ctr: Number(ctr.toFixed(2)),
    hookRate: Number(hookRate.toFixed(2)),
    signupRate: Number(signupRate.toFixed(2)),
    activationRate: Number(activationRate.toFixed(2)),
  };
}

/**
 * Get total signups from all conversion channels
 */
function getTotalSignups(ad: PerformanceAd): number {
  return (
    (ad.tap_signup || 0) +
    (ad.tap_cnpj_signups || 0) +
    (ad.signup_web || 0) +
    (ad.link_signup || 0)
  );
}

/**
 * Get total activations from all conversion channels
 */
function getTotalActivations(ad: PerformanceAd): number {
  return (
    (ad.tap_activations || 0) +
    (ad.tap_5trx || 0) +
    (ad.pos_sales || 0) +
    (ad.piselli_sales || 0) +
    (ad.activation_app || 0) +
    (ad.activation_web || 0) +
    (ad.link_activations || 0) +
    (ad.install || 0)
  );
}

/**
 * Get cost distribution by platform
 */
export function getCostByPlatform(ads: PerformanceAd[]): Array<{ platform: string; cost: number }> {
  const platformCosts = ads.reduce((acc, ad) => {
    const platform = ad.platform || 'unknown';
    acc[platform] = (acc[platform] || 0) + (ad.cost || 0);
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(platformCosts)
    .map(([platform, cost]) => ({ platform, cost: Number(cost.toFixed(2)) }))
    .sort((a, b) => b.cost - a.cost);
}

/**
 * Get cost distribution by product
 */
export function getCostByProduct(ads: PerformanceAd[]): Array<{ product: string; cost: number }> {
  const productCosts = ads.reduce((acc, ad) => {
    const product = ad.product || 'unknown';
    acc[product] = (acc[product] || 0) + (ad.cost || 0);
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(productCosts)
    .map(([product, cost]) => ({ product, cost: Number(cost.toFixed(2)) }))
    .sort((a, b) => b.cost - a.cost);
}

/**
 * Get time series data (aggregated by date)
 */
export function getTimeSeriesData(ads: PerformanceAd[]): Array<{
  date: string;
  cost: number;
  impressions: number;
  clicks: number;
  signups: number;
  activations: number;
}> {
  const dataByDate = ads.reduce((acc, ad) => {
    const date = ad.date || 'unknown';
    
    if (!acc[date]) {
      acc[date] = {
        date,
        cost: 0,
        impressions: 0,
        clicks: 0,
        signups: 0,
        activations: 0,
      };
    }

    acc[date].cost += ad.cost || 0;
    acc[date].impressions += ad.impressions || 0;
    acc[date].clicks += ad.clicks || 0;
    acc[date].signups += getTotalSignups(ad);
    acc[date].activations += getTotalActivations(ad);

    return acc;
  }, {} as Record<string, any>);

  return Object.values(dataByDate)
    .map((item: any) => ({
      ...item,
      cost: Number(item.cost.toFixed(2)),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Get top performing ads
 */
export function getTopAds(ads: PerformanceAd[], limit: number = 5): PerformanceAd[] {
  return [...ads]
    .sort((a, b) => {
      const costA = a.cost || 0;
      const costB = b.cost || 0;
      const impA = a.impressions || 1;
      const impB = b.impressions || 1;
      
      // Sort by efficiency (cost per impression)
      return (costA / impA) - (costB / impB);
    })
    .slice(0, limit);
}

/**
 * Get complete dashboard data
 */
export async function getPerformanceDashboardData(
  { supabase }: { supabase: SupabaseClient },
  params: PerformanceQueryParams
): Promise<PerformanceDashboardData> {
  const result = await fetchPerformanceAds({ supabase }, params);
  
  return {
    metrics: calculateMetrics(result.ads),
    ads: result.ads,
    topAds: getTopAds(result.ads, 5),
    costByPlatform: getCostByPlatform(result.ads),
    costByProduct: getCostByProduct(result.ads),
    timeSeriesData: getTimeSeriesData(result.ads),
  };
}

