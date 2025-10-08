// ============================================
// AGGREGATION UTILITIES V2
// ============================================
// Agregação com suporte a View + Dimensão

import type { AdData, ViewMode, DimensionMode } from "../types";
import { calculateMetric } from "./product-metrics";

export interface AggregationKey {
  ad_name?: string;
  campaign_name?: string;
  date?: string;
}

export interface AggregatedRow {
  // Keys
  key: string; // Unique identifier for the group
  ad_name?: string;
  campaign_name?: string;
  date?: string;
  
  // Aggregated data
  platform: string;
  product: string | null;
  
  // IDs (from first occurrence)
  ad_id: number | null;
  campaign_id: number | null;
  creative_link: string | null;
  creative_id: string | null;
  image_preview_link: string | null;
  link_update_at: string | null;
  
  // Date range
  first_date: string;
  last_date: string;
  days_active: number;
  
  // Aggregated metrics (sum)
  cost: number;
  impressions: number;
  clicks: number;
  video_3s: number;
  signups: number;
  activations: number;
  
  // Product-specific metrics (sum)
  tap_signup: number;
  tap_activations: number;
  tap_5trx: number;
  tap_cnpj_signups: number;
  pos_sales: number;
  piselli_sales: number;
  install: number;
  signup_web: number;
  activation_app: number;
  activation_web: number;
  link_signup: number;
  link_activations: number;
  
  // Calculated metrics
  ctr: number | null;
  hook_rate: number | null;
  cpm: number | null;
  cpc: number | null;
  cpa: number | null;
  cac: number | null;
  cvr: number | null;
  piselli_percentage: number | null;
  cnpj_percentage: number | null;
  
  // Meta
  row_count: number; // Number of raw rows aggregated
}

/**
 * Build aggregation key based on view mode and dimension
 */
function buildAggregationKey(
  row: AdData,
  viewMode: ViewMode,
  dimension: DimensionMode
): AggregationKey {
  const key: AggregationKey = {};
  
  // View mode determines primary grouping
  if (viewMode === "ad") {
    key.ad_name = row.ad_name || "UNKNOWN";
  } else if (viewMode === "campaign") {
    key.campaign_name = row.campaign_name || "UNKNOWN";
  }
  
  // Dimension adds date grouping
  if (dimension === "daily") {
    key.date = row.date || "";
  }
  
  return key;
}

/**
 * Convert aggregation key to string for Map usage
 */
function keyToString(key: AggregationKey): string {
  const parts: string[] = [];
  
  if (key.ad_name) parts.push(`ad:${key.ad_name}`);
  if (key.campaign_name) parts.push(`campaign:${key.campaign_name}`);
  if (key.date) parts.push(`date:${key.date}`);
  
  return parts.join("|||");
}

/**
 * Main aggregation function
 * Supports different view modes and dimensions
 */
export function aggregateData(
  ads: AdData[],
  viewMode: ViewMode = "ad",
  dimension: DimensionMode = "total"
): AggregatedRow[] {
  // 🔍 DEBUG: Produtos nos dados ANTES da agregação
  const products = Array.from(new Set(ads.map(a => a.product).filter(Boolean)));
  console.log(`📊 [aggregateData] PRODUTOS: [${products.join(", ")}], Linhas: ${ads.length}, View: ${viewMode}, Dimensão: ${dimension}`);

  // Group by key
  const groups = new Map<string, AdData[]>();

  for (const ad of ads) {
    const key = buildAggregationKey(ad, viewMode, dimension);
    const keyStr = keyToString(key);
    
    if (!groups.has(keyStr)) {
      groups.set(keyStr, []);
    }
    groups.get(keyStr)!.push(ad);
  }

  console.log(`📊 [aggregateData] Found ${groups.size} unique groups`);

  // Aggregate each group
  const aggregated: AggregatedRow[] = [];

  for (const [keyStr, groupAds] of groups.entries()) {
    // Sort by date to get first/last
    const sortedByDate = [...groupAds].sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateA - dateB;
    });

    const firstAd = sortedByDate[0];
    const lastAd = sortedByDate[sortedByDate.length - 1];

    // Sum all numeric metrics
    const summed = {
      cost: 0,
      impressions: 0,
      clicks: 0,
      video_3s: 0,
      tap_signup: 0,
      tap_activations: 0,
      tap_5trx: 0,
      tap_cnpj_signups: 0,
      pos_sales: 0,
      piselli_sales: 0,
      install: 0,
      signup_web: 0,
      activation_app: 0,
      activation_web: 0,
      link_signup: 0,
      link_activations: 0,
    };

    for (const ad of groupAds) {
      summed.cost += ad.cost || 0;
      summed.impressions += ad.impressions || 0;
      summed.clicks += ad.clicks || 0;
      summed.video_3s += ad.video_3s || 0;
      summed.tap_signup += ad["tap signup"] || 0;
      summed.tap_activations += ad["tap activations"] || 0;
      summed.tap_5trx += ad["tap 5trx"] || 0;
      summed.tap_cnpj_signups += ad["tap cnpj signups"] || 0;
      summed.pos_sales += ad.pos_sales || 0;
      summed.piselli_sales += ad.piselli_sales || 0;
      summed.install += ad.install || 0;
      summed.signup_web += ad.signup_web || 0;
      summed.activation_app += ad.activation_app || 0;
      summed.activation_web += ad.activation_web || 0;
      summed.link_signup += ad.link_signup || 0;
      summed.link_activations += ad.link_activations || 0;
    }

    // Calculate signups & activations
    const signups = summed.tap_signup + summed.signup_web + summed.link_signup;
    const activations = summed.tap_activations + summed.activation_app + 
                       summed.activation_web + summed.link_activations;

    // Calculate days active
    const firstDate = firstAd.date || "";
    const lastDate = lastAd.date || "";
    let daysActive = 1;
    if (firstDate && lastDate && dimension === "total") {
      const diffTime = new Date(lastDate).getTime() - new Date(firstDate).getTime();
      daysActive = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
    }

    // Build data object for metric calculations
    const dataForCalc = {
      ...summed,
      signups,
      activations,
      installs: summed.install,
    };

    // Create aggregated row
    const row: AggregatedRow = {
      // Key
      key: keyStr,
      
      // Conditional fields based on view mode
      ...(viewMode === "ad" && { ad_name: firstAd.ad_name || "UNKNOWN" }),
      ...(viewMode === "campaign" && { campaign_name: firstAd.campaign_name || "UNKNOWN" }),
      ...(dimension === "daily" && { date: firstAd.date || "" }),
      
      // Common fields
      platform: firstAd.platform,
      product: firstAd.product,
      
      // IDs (from first occurrence)
      ad_id: firstAd.ad_id,
      campaign_id: firstAd.campaign_id,
      creative_link: firstAd.creative_link,
      creative_id: firstAd.creative_id,
      image_preview_link: firstAd.image_preview_link,
      link_update_at: firstAd.link_update_at,
      
      // Date range
      first_date: firstDate,
      last_date: lastDate,
      days_active: daysActive,
      
      // Summed metrics
      cost: summed.cost,
      impressions: summed.impressions,
      clicks: summed.clicks,
      video_3s: summed.video_3s,
      signups,
      activations,
      tap_signup: summed.tap_signup,
      tap_activations: summed.tap_activations,
      tap_5trx: summed.tap_5trx,
      tap_cnpj_signups: summed.tap_cnpj_signups,
      pos_sales: summed.pos_sales,
      piselli_sales: summed.piselli_sales,
      install: summed.install,
      signup_web: summed.signup_web,
      activation_app: summed.activation_app,
      activation_web: summed.activation_web,
      link_signup: summed.link_signup,
      link_activations: summed.link_activations,
      
      // Calculated metrics
      ctr: calculateMetric("ctr", dataForCalc),
      hook_rate: calculateMetric("hook_rate", dataForCalc),
      cpm: calculateMetric("cpm", dataForCalc),
      cpc: calculateMetric("cpc", dataForCalc),
      cpa: calculateMetric("cpa", dataForCalc),
      cac: calculateMetric("cac", dataForCalc),
      cvr: calculateMetric("cvr", dataForCalc),
      piselli_percentage: calculateMetric("piselli_percentage", dataForCalc),
      cnpj_percentage: calculateMetric("cnpj_percentage", dataForCalc),
      
      // Meta
      row_count: groupAds.length,
    };

    aggregated.push(row);
  }

  // Sort by cost descending (highest spend first)
  aggregated.sort((a, b) => b.cost - a.cost);

  console.log(`✅ [aggregateData] Aggregated ${aggregated.length} rows`);

  return aggregated;
}

/**
 * Special aggregation for Table 1: By Creative only (ignores campaign)
 */
export function aggregateByCreative(
  ads: AdData[],
  dimension: DimensionMode = "total"
): AggregatedRow[] {
  // 🔍 DEBUG LOG
  const products = Array.from(new Set(ads.map(a => a.product).filter(Boolean)));
  console.log(`📊 [TABLE 1 - Criativo] Produtos: [${products.join(", ")}], ${ads.length} linhas, Dimensão: ${dimension}`);
  
  // For creative-only aggregation, we use ad view mode
  return aggregateData(ads, "ad", dimension);
}

/**
 * Special aggregation for Table 2: By Creative + Campaign
 */
export function aggregateByCreativeAndCampaign(
  ads: AdData[],
  dimension: DimensionMode = "total"
): AggregatedRow[] {
  // 🔍 DEBUG LOG
  const products = Array.from(new Set(ads.map(a => a.product).filter(Boolean)));
  console.log(`📊 [TABLE 2 - Criativo+Campanha] Produtos: [${products.join(", ")}], ${ads.length} linhas, Dimensão: ${dimension}`);
  
  // For creative+campaign, we need custom grouping
  const groups = new Map<string, AdData[]>();
  
  for (const ad of ads) {
    // Build key based on ad_name + campaign_name (+ date if daily)
    const keyParts = [
      `ad:${ad.ad_name || "UNKNOWN"}`,
      `campaign:${ad.campaign_name || "UNKNOWN"}`,
    ];
    
    if (dimension === "daily") {
      keyParts.push(`date:${ad.date || ""}`);
    }
    
    const key = keyParts.join("|||");
    
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(ad);
  }
  
  // Now aggregate using same logic
  const aggregated: AggregatedRow[] = [];
  
  for (const [keyStr, groupAds] of groups.entries()) {
    // (same aggregation logic as main function)
    const sortedByDate = [...groupAds].sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateA - dateB;
    });

    const firstAd = sortedByDate[0];
    const lastAd = sortedByDate[sortedByDate.length - 1];

    // Sum metrics
    const summed = {
      cost: 0,
      impressions: 0,
      clicks: 0,
      video_3s: 0,
      tap_signup: 0,
      tap_activations: 0,
      tap_5trx: 0,
      tap_cnpj_signups: 0,
      pos_sales: 0,
      piselli_sales: 0,
      install: 0,
      signup_web: 0,
      activation_app: 0,
      activation_web: 0,
      link_signup: 0,
      link_activations: 0,
    };

    for (const ad of groupAds) {
      summed.cost += ad.cost || 0;
      summed.impressions += ad.impressions || 0;
      summed.clicks += ad.clicks || 0;
      summed.video_3s += ad.video_3s || 0;
      summed.tap_signup += ad["tap signup"] || 0;
      summed.tap_activations += ad["tap activations"] || 0;
      summed.tap_5trx += ad["tap 5trx"] || 0;
      summed.tap_cnpj_signups += ad["tap cnpj signups"] || 0;
      summed.pos_sales += ad.pos_sales || 0;
      summed.piselli_sales += ad.piselli_sales || 0;
      summed.install += ad.install || 0;
      summed.signup_web += ad.signup_web || 0;
      summed.activation_app += ad.activation_app || 0;
      summed.activation_web += ad.activation_web || 0;
      summed.link_signup += ad.link_signup || 0;
      summed.link_activations += ad.link_activations || 0;
    }

    const signups = summed.tap_signup + summed.signup_web + summed.link_signup;
    const activations = summed.tap_activations + summed.activation_app + 
                       summed.activation_web + summed.link_activations;

    const firstDate = firstAd.date || "";
    const lastDate = lastAd.date || "";
    let daysActive = 1;
    if (firstDate && lastDate && dimension === "total") {
      const diffTime = new Date(lastDate).getTime() - new Date(firstDate).getTime();
      daysActive = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
    }

    const dataForCalc = {
      ...summed,
      signups,
      activations,
      installs: summed.install,
    };

    aggregated.push({
      key: keyStr,
      ad_name: firstAd.ad_name || "UNKNOWN",
      campaign_name: firstAd.campaign_name || "UNKNOWN",
      ...(dimension === "daily" && { date: firstAd.date || "" }),
      
      platform: firstAd.platform,
      product: firstAd.product,
      
      ad_id: firstAd.ad_id,
      campaign_id: firstAd.campaign_id,
      creative_link: firstAd.creative_link,
      creative_id: firstAd.creative_id,
      image_preview_link: firstAd.image_preview_link,
      link_update_at: firstAd.link_update_at,
      
      first_date: firstDate,
      last_date: lastDate,
      days_active: daysActive,
      
      cost: summed.cost,
      impressions: summed.impressions,
      clicks: summed.clicks,
      video_3s: summed.video_3s,
      signups,
      activations,
      tap_signup: summed.tap_signup,
      tap_activations: summed.tap_activations,
      tap_5trx: summed.tap_5trx,
      tap_cnpj_signups: summed.tap_cnpj_signups,
      pos_sales: summed.pos_sales,
      piselli_sales: summed.piselli_sales,
      install: summed.install,
      signup_web: summed.signup_web,
      activation_app: summed.activation_app,
      activation_web: summed.activation_web,
      link_signup: summed.link_signup,
      link_activations: summed.link_activations,
      
      ctr: calculateMetric("ctr", dataForCalc),
      hook_rate: calculateMetric("hook_rate", dataForCalc),
      cpm: calculateMetric("cpm", dataForCalc),
      cpc: calculateMetric("cpc", dataForCalc),
      cpa: calculateMetric("cpa", dataForCalc),
      cac: calculateMetric("cac", dataForCalc),
      cvr: calculateMetric("cvr", dataForCalc),
      piselli_percentage: calculateMetric("piselli_percentage", dataForCalc),
      cnpj_percentage: calculateMetric("cnpj_percentage", dataForCalc),
      
      row_count: groupAds.length,
    });
  }
  
  // Sort by cost
  aggregated.sort((a, b) => b.cost - a.cost);
  
  return aggregated;
}
