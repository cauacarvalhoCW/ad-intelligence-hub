/**
 * Performance Feature Types
 * Based on mkt_ads_looker table schema
 */

export type ProductType = 'POS' | 'TAP' | 'LINK' | 'JIM';
export type PlatformType = 'meta' | 'google' | 'tiktok';

/**
 * Performance Ad from mkt_ads_looker table
 */
export interface PerformanceAd {
  id: string;
  ad_id: number;
  ad_name: string | null;
  created_at: string;
  date: string | null;
  platform: string;
  campaign_id: number | null;
  campaign_name: string | null;
  
  // Metrics
  cost: number | null;
  impressions: number | null;
  clicks: number | null;
  video_3s: number | null;
  
  // TAP Conversions
  tap_signup: number | null;
  tap_activations: number | null;
  tap_5trx: number | null;
  tap_cnpj_signups: number | null;
  
  // POS Conversions
  pos_sales: number | null;
  piselli_sales: number | null;
  
  // JIM Conversions
  install: number | null;
  signup_web: number | null;
  activation_app: number | null;
  activation_web: number | null;
  
  // LINK Conversions
  link_signup: number | null;
  link_activations: number | null;
  
  // Metadata
  product: string | null;
  creative_link: string | null;
  creative_id: string | null;
}

/**
 * Calculated Performance Metrics
 */
export interface PerformanceMetrics {
  // Primary Metrics
  totalCost: number;
  totalImpressions: number;
  totalClicks: number;
  totalSignups: number;
  totalActivations: number;
  
  // Calculated KPIs
  cac: number;           // Customer Acquisition Cost
  cpm: number;           // Cost Per Mille (1000 impressions)
  cpa: number;           // Cost Per Activation
  ctr: number;           // Click Through Rate (%)
  hookRate: number;      // Video 3s / Impressions (%)
  
  // Conversion Metrics
  signupRate: number;    // Signups / Clicks (%)
  activationRate: number; // Activations / Signups (%)
}

/**
 * Performance Dashboard Data
 */
export interface PerformanceDashboardData {
  metrics: PerformanceMetrics;
  ads: PerformanceAd[];
  topAds: PerformanceAd[];
  costByPlatform: Array<{
    platform: string;
    cost: number;
  }>;
  costByProduct: Array<{
    product: string;
    cost: number;
  }>;
  timeSeriesData: Array<{
    date: string;
    cost: number;
    impressions: number;
    clicks: number;
    signups: number;
    activations: number;
  }>;
}

/**
 * Performance Query Params
 */
export interface PerformanceQueryParams {
  perspective: 'cloudwalk' | 'infinitepay' | 'jim' | 'default';
  product?: ProductType;
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string;   // YYYY-MM-DD
  platform?: PlatformType;
  limit?: number;
  page?: number;
}

/**
 * Product Configuration by Perspective
 */
export const PRODUCTS_BY_PERSPECTIVE: Record<string, ProductType[]> = {
  cloudwalk: ['POS', 'TAP', 'LINK', 'JIM'],
  infinitepay: ['POS', 'TAP', 'LINK'],
  jim: ['JIM'],
  default: ['POS', 'TAP', 'LINK', 'JIM'],
};

/**
 * Best Ad by Product
 */
export interface BestAdByProduct {
  product: ProductType;
  ad: PerformanceAd;
  metrics: {
    topMetric1: { label: string; value: string };
    topMetric2: { label: string; value: string };
    topMetric3: { label: string; value: string };
  };
}

