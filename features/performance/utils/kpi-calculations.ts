// ============================================
// PERFORMANCE MODULE - KPI CALCULATIONS
// ============================================

import type { MktAdsLookerRow, KPIMetrics, Product } from "../types";

/**
 * Calculate CTR (Click-Through Rate)
 * CTR = clicks / impressions
 */
export const calculateCTR = (clicks: number, impressions: number): number => {
  if (impressions === 0) return 0;
  return (clicks / impressions) * 100;
};

/**
 * Calculate CPM (Cost Per Mille)
 * CPM = cost / impressions * 1000
 */
export const calculateCPM = (cost: number, impressions: number): number => {
  if (impressions === 0) return 0;
  return (cost / impressions) * 1000;
};

/**
 * Calculate Hook Rate
 * Hook Rate = video_3s / impressions
 */
export const calculateHookRate = (video3s: number, impressions: number): number => {
  if (impressions === 0) return 0;
  return (video3s / impressions) * 100;
};

/**
 * Calculate CPA (Cost Per Acquisition/Signup)
 * CPA = cost / signups
 */
export const calculateCPA = (cost: number, signups: number): number | null => {
  if (signups === 0) return null;
  return cost / signups;
};

/**
 * Calculate CAC (Customer Acquisition Cost)
 * CAC = cost / activations
 */
export const calculateCAC = (cost: number, activations: number): number | null => {
  if (activations === 0) return null;
  return cost / activations;
};

/**
 * Calculate Piselli Percentage
 * % Piselli = piselli_sales / pos_sales
 */
export const calculatePiselliPercentage = (
  piselliSales: number,
  posSales: number
): number | null => {
  if (posSales === 0) return null;
  return (piselliSales / posSales) * 100;
};

/**
 * Calculate total Signups from raw data
 * Signups = TAP(tap signup + tap cnpj signups) + LINK(link_signup) + JIM(signup_web)
 */
export const calculateSignups = (rows: MktAdsLookerRow[]): number => {
  return rows.reduce((sum, row) => {
    let signups = 0;

    if (row.product === "TAP") {
      signups += (row["tap signup"] || 0) + (row["tap cnpj signups"] || 0);
    } else if (row.product === "LINK") {
      signups += row.link_signup || 0;
    } else if (row.product === "JIM") {
      signups += row.signup_web || 0;
    }

    return sum + signups;
  }, 0);
};

/**
 * Calculate total Activations from raw data
 * Activations = TAP(tap activations) + LINK(link_activations) + JIM(activation_app + activation_web)
 */
export const calculateActivations = (rows: MktAdsLookerRow[]): number => {
  return rows.reduce((sum, row) => {
    let activations = 0;

    if (row.product === "TAP") {
      activations += row["tap activations"] || 0;
    } else if (row.product === "LINK") {
      activations += row.link_activations || 0;
    } else if (row.product === "JIM") {
      activations += (row.activation_app || 0) + (row.activation_web || 0);
    }

    return sum + activations;
  }, 0);
};

/**
 * Calculate aggregate KPIs from raw data
 */
export const calculateKPIMetrics = (
  rows: MktAdsLookerRow[],
  includeInstalls: boolean = false
): KPIMetrics => {
  const cost = rows.reduce((sum, row) => sum + (row.cost || 0), 0);
  const impressions = rows.reduce((sum, row) => sum + (row.impressions || 0), 0);
  const clicks = rows.reduce((sum, row) => sum + (row.clicks || 0), 0);
  const video3s = rows.reduce((sum, row) => sum + (row.video_3s || 0), 0);
  const posSales = rows.reduce((sum, row) => sum + (row.pos_sales || 0), 0);
  const piselliSales = rows.reduce((sum, row) => sum + (row.piselli_sales || 0), 0);
  const fifthTransaction = rows.reduce((sum, row) => sum + (row["tap 5trx"] || 0), 0);

  const signups = calculateSignups(rows);
  const activations = calculateActivations(rows);

  const metrics: KPIMetrics = {
    cost,
    impressions,
    clicks,
    signups,
    activations,
    pos_sales: posSales,
    piselli_sales: piselliSales,
    piselli_percentage: calculatePiselliPercentage(piselliSales, posSales),
    fifth_transaction: fifthTransaction,
    ctr: calculateCTR(clicks, impressions),
    cpm: calculateCPM(cost, impressions),
    hook_rate: calculateHookRate(video3s, impressions),
    cpa: calculateCPA(cost, signups),
    cac: calculateCAC(cost, activations),
  };

  // Add installs for JIM
  if (includeInstalls) {
    const installs = rows.reduce((sum, row) => sum + (row.install || 0), 0);
    metrics.installs = installs;
  }

  return metrics;
};

/**
 * Format currency (BRL)
 */
export const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

/**
 * Format number with thousand separators
 */
export const formatNumber = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) return "—";
  return new Intl.NumberFormat("pt-BR").format(Math.round(value));
};

/**
 * Format percentage
 */
export const formatPercentage = (value: number | null | undefined, decimals: number = 2): string => {
  if (value === null || value === undefined || isNaN(value)) return "—";
  return `${value.toFixed(decimals)}%`;
};

/**
 * Get products available for a perspective
 */
export const getProductsForPerspective = (perspective: string): Product[] => {
  switch (perspective) {
    case "infinitepay":
      return ["POS", "TAP", "LINK"];
    case "jim":
      return ["JIM"];
    case "cloudwalk":
    case "default":
    default:
      return ["POS", "TAP", "LINK", "JIM"];
  }
};

