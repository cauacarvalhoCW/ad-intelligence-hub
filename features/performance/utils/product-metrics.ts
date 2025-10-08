// ============================================
// PRODUCT METRICS CONFIGURATION
// ============================================
// Define quais métricas são relevantes para cada produto

import type { Product } from "../types";

export type MetricKey = 
  | "cost"
  | "impressions"
  | "clicks"
  | "ctr"
  | "cpc"
  | "cpm"
  | "video_3s"
  | "hook_rate"
  | "signups"
  | "activations"
  | "cpa"
  | "cac"
  | "cvr"
  | "pos_sales"
  | "piselli_sales"
  | "piselli_percentage"
  | "tap_cnpj_signups"
  | "cnpj_percentage"
  | "tap_5trx"
  | "installs"
  | "revenue"
  | "roas";

export interface MetricConfig {
  key: MetricKey;
  label: string;
  format: "currency" | "number" | "percentage";
  decimals?: number;
  formula?: string;
}

// Métricas base (comuns a todos os produtos)
const BASE_METRICS: MetricConfig[] = [
  { key: "cost", label: "Custo", format: "currency" },
  { key: "impressions", label: "Impressões", format: "number" },
  { key: "clicks", label: "Cliques", format: "number" },
  { key: "ctr", label: "CTR", format: "percentage", decimals: 2, formula: "clicks / impressions * 100" },
  { key: "cpc", label: "CPC", format: "currency", formula: "cost / clicks" },
  { key: "cpm", label: "CPM", format: "currency", formula: "cost / (impressions / 1000)" },
];

// Métricas de vídeo (META/TIKTOK)
const VIDEO_METRICS: MetricConfig[] = [
  { key: "video_3s", label: "Vídeo 3s", format: "number" },
  { key: "hook_rate", label: "Hook Rate", format: "percentage", decimals: 2, formula: "video_3s / impressions * 100" },
];

// Métricas de conversão
const CONVERSION_METRICS: MetricConfig[] = [
  { key: "signups", label: "Signups", format: "number" },
  { key: "activations", label: "Ativações", format: "number" },
  { key: "cpa", label: "CPA", format: "currency", formula: "cost / signups" },
  { key: "cac", label: "CAC", format: "currency", formula: "cost / activations" },
  { key: "cvr", label: "CVR", format: "percentage", decimals: 2, formula: "activations / clicks * 100" },
];

// Configuração por produto
const PRODUCT_METRICS: Record<Product, MetricConfig[]> = {
  POS: [
    ...BASE_METRICS,
    ...VIDEO_METRICS,
    ...CONVERSION_METRICS,
    { key: "pos_sales", label: "Vendas POS", format: "number" },
    { key: "piselli_sales", label: "Vendas Piselli", format: "number" },
    { key: "piselli_percentage", label: "% Piselli", format: "percentage", decimals: 1, formula: "piselli_sales / pos_sales * 100" },
  ],
  
  TAP: [
    ...BASE_METRICS,
    ...VIDEO_METRICS,
    ...CONVERSION_METRICS,
    { key: "tap_cnpj_signups", label: "Signups CNPJ", format: "number" },
    { key: "cnpj_percentage", label: "% CNPJ", format: "percentage", decimals: 1, formula: "tap_cnpj_signups / signups * 100" },
    { key: "tap_5trx", label: "5ª Transação", format: "number" },
  ],
  
  LINK: [
    ...BASE_METRICS,
    ...VIDEO_METRICS,
    ...CONVERSION_METRICS,
  ],
  
  JIM: [
    ...BASE_METRICS,
    ...VIDEO_METRICS,
    { key: "installs", label: "Instalações", format: "number" },
    { key: "signups", label: "Signups", format: "number" },
    { key: "activations", label: "Ativações", format: "number" },
    { key: "cpa", label: "CPI", format: "currency", decimals: 2, formula: "cost / installs" }, // Cost Per Install
    { key: "cac", label: "CAC", format: "currency", decimals: 2, formula: "cost / activations" },
    { key: "cvr", label: "CVR", format: "percentage", decimals: 2, formula: "activations / installs * 100" },
  ],
};

/**
 * Get metrics configuration for a specific product
 */
export function getProductMetrics(product: Product): MetricConfig[] {
  return PRODUCT_METRICS[product] || BASE_METRICS;
}

/**
 * Check if a metric is valid for a product
 */
export function isMetricValidForProduct(metric: MetricKey, product: Product): boolean {
  const productMetrics = getProductMetrics(product);
  return productMetrics.some(m => m.key === metric);
}

/**
 * Get metric configuration
 */
export function getMetricConfig(metric: MetricKey, product: Product): MetricConfig | null {
  const productMetrics = getProductMetrics(product);
  return productMetrics.find(m => m.key === metric) || null;
}

/**
 * Format metric value based on its configuration
 */
export function formatMetricValue(
  value: number | null | undefined, 
  metric: MetricKey, 
  product: Product
): string {
  if (value === null || value === undefined || !isFinite(value)) {
    return "—";
  }

  const config = getMetricConfig(metric, product);
  if (!config) return String(value);

  switch (config.format) {
    case "currency":
      // 🇺🇸 JIM uses USD ($), others use BRL (R$)
      const isJIM = product === "JIM";
      return new Intl.NumberFormat(isJIM ? "en-US" : "pt-BR", {
        style: "currency",
        currency: isJIM ? "USD" : "BRL",
        minimumFractionDigits: 2,
      }).format(value);
    
    case "percentage":
      return `${value.toFixed(config.decimals || 2)}%`;
    
    case "number":
    default:
      return new Intl.NumberFormat("pt-BR", {
        minimumFractionDigits: config.decimals || 0,
        maximumFractionDigits: config.decimals || 0,
      }).format(value);
  }
}

/**
 * Calculate metric value with protection against division by zero
 */
export function calculateMetric(
  metric: MetricKey,
  data: Record<string, number | null>
): number | null {
  switch (metric) {
    case "ctr":
      return data.impressions && data.impressions > 0 
        ? (data.clicks || 0) / data.impressions * 100 
        : null;
    
    case "cpc":
      return data.clicks && data.clicks > 0 
        ? (data.cost || 0) / data.clicks 
        : null;
    
    case "cpm":
      return data.impressions && data.impressions > 0 
        ? (data.cost || 0) / (data.impressions / 1000) 
        : null;
    
    case "hook_rate":
      return data.impressions && data.impressions > 0 
        ? (data.video_3s || 0) / data.impressions * 100 
        : null;
    
    case "cpa":
      // For JIM, CPA is actually CPI (Cost Per Install)
      const divisor = data.installs || data.signups;
      return divisor && divisor > 0 
        ? (data.cost || 0) / divisor 
        : null;
    
    case "cac":
      return data.activations && data.activations > 0 
        ? (data.cost || 0) / data.activations 
        : null;
    
    case "cvr":
      // For JIM: activations / installs
      // For others: activations / clicks
      const denominator = data.installs || data.clicks;
      return denominator && denominator > 0 
        ? (data.activations || 0) / denominator * 100 
        : null;
    
    case "piselli_percentage":
      return data.pos_sales && data.pos_sales > 0 
        ? (data.piselli_sales || 0) / data.pos_sales * 100 
        : null;
    
    case "cnpj_percentage":
      return data.signups && data.signups > 0 
        ? (data.tap_cnpj_signups || 0) / data.signups * 100 
        : null;
    
    default:
      return data[metric] || null;
  }
}
