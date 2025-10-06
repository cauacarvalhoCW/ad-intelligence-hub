// ============================================
// PERFORMANCE MODULE - TYPE DEFINITIONS
// ============================================

export type Platform = "META" | "GOOGLE" | "TIKTOK";
export type Product = "POS" | "TAP" | "LINK" | "JIM";
export type Perspective = "default" | "cloudwalk" | "infinitepay" | "jim";
export type RangePreset = "yesterday" | "7d" | "30d" | "custom";
export type ViewGranularity = "day" | "week" | "month" | "alltime";
export type KPIContext = "overview" | "pos" | "tap" | "link" | "jim";

// Date range for custom filters
export interface DateRangeFilter {
  from: Date;
  to: Date;
}

// Raw data from mkt_ads_looker table
export interface MktAdsLookerRow {
  id: string;
  ad_id: number;
  ad_name: string | null;
  created_at: string;
  date: string | null;
  platform: Platform;
  campaign_id: number | null;
  campaign_name: string | null;
  cost: number | null;
  impressions: number | null;
  clicks: number | null;
  video_3s: number | null;
  "tap signup": number | null;
  "tap activations": number | null;
  "tap 5trx": number | null;
  "tap cnpj signups": number | null;
  pos_sales: number | null;
  piselli_sales: number | null;
  install: number | null;
  signup_web: number | null;
  activation_app: number | null;
  activation_web: number | null;
  link_signup: number | null;
  link_activations: number | null;
  product: Product | null;
  creative_link: string | null;
  creative_id: string | null;
  link_update_at: string | null; // Timestamp when creative_link was last fetched (for cache)
  image_preview_link: string | null; // Preview image/thumbnail URL from N8N
}

// AdData with calculated metrics (used in components)
export interface AdData extends MktAdsLookerRow {
  // Calculated metrics
  ctr?: number | null;
  hook_rate?: number | null;
  cpm?: number | null;
  cpa?: number | null;
  cac?: number | null;
  signups?: number;
  activations?: number;
}

// Aggregated KPIs
export interface KPIMetrics {
  cost: number;
  impressions: number;
  clicks: number;
  signups: number;
  activations: number;
  // POS-specific
  pos_sales?: number;
  piselli_sales?: number;
  piselli_percentage?: number | null;
  // TAP-specific
  tap_cnpj_signups?: number;
  cnpj_percentage?: number | null;
  fifth_transaction?: number;
  // JIM-specific
  installs?: number;
  // Calculated metrics
  ctr: number;
  cpm: number;
  hook_rate: number;
  cpa: number | null;
  cac: number | null;
}

// Chart data point
export interface ChartDataPoint {
  date: string;
  [key: string]: number | string;
}

// Best ad by product
export interface BestAd {
  product: Product;
  ad_id: number;
  ad_name: string;
  creative_link: string | null;
  creative_id: string | null;
  platform: Platform;
  cac: number | null;
  ctr: number;
  video_3s: number | null;
  cost: number;
  signups: number;
  activations: number;
}

// Most scaled ad
export interface ScaledAd {
  ad_id: number;
  ad_name: string;
  platform: Platform;
  cost: number;
  impressions: number;
  clicks: number;
  ctr: number;
  signups: number;
  activations: number;
  cpa: number | null;
  cac: number | null;
  pos_sales: number;
  piselli_sales: number;
  piselli_percentage: number | null;
  fifth_transaction: number;
  creative_link: string | null;
  creative_id: string | null;
}

// Product drilldown table row
export interface ProductTableRow {
  ad_id: number;
  ad_name: string;
  campaign_id?: number;
  campaign_name?: string;
  date?: string; // For diarized mode
  platform: Platform;
  cost: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpm: number;
  signups: number;
  activations: number;
  cpa: number | null;
  cac: number | null;
  hook_rate: number;
  pos_sales: number;
  piselli_sales: number;
  piselli_percentage: number | null;
  fifth_transaction: number;
  installs?: number; // Only for JIM
}

// Filters state
export interface PerformanceFilters {
  platforms: Platform[];
  range: RangePreset;
  view: ViewGranularity;
  product?: Product; // For drilldown pages
}

// Table modes
export type TableMode = "by_ad" | "diarized" | "by_campaign";

// Funnel stage
export interface FunnelStage {
  name: string;
  value: number;
  percentage: number;
}

