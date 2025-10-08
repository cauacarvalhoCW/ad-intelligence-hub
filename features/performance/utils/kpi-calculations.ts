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
 * Calculate CNPJ Percentage (TAP)
 * % CNPJ = tap_cnpj_signups / tap_signup
 */
export const calculateCNPJPercentage = (
  cnpjSignups: number,
  totalSignups: number
): number | null => {
  if (totalSignups === 0) return null;
  return (cnpjSignups / totalSignups) * 100;
};

// ============================================
// PRODUCT-SPECIFIC KPI CALCULATIONS
// ============================================

/**
 * Calculate KPIs for InfinitePay Overview (POS + TAP + LINK only, NO JIM)
 */
export const calculateInfinitePayKPIs = (rows: MktAdsLookerRow[]): KPIMetrics => {
  const cost = rows.reduce((sum, row) => sum + (row.cost || 0), 0);
  const impressions = rows.reduce((sum, row) => sum + (row.impressions || 0), 0);
  const clicks = rows.reduce((sum, row) => sum + (row.clicks || 0), 0);
  const video3s = rows.reduce((sum, row) => sum + (row.video_3s || 0), 0);

  // Signups: TAP (tap signup + tap cnpj signups) + LINK (link_signup)
  // NÃO incluir signup_web (JIM)
  const tapSignups = rows.reduce((sum, row) => {
    if (row.product === "TAP") {
      return sum + (row["tap signup"] || 0) + (row["tap cnpj signups"] || 0);
    }
    return sum;
  }, 0);

  const linkSignups = rows.reduce((sum, row) => {
    if (row.product === "LINK") {
      return sum + (row.link_signup || 0);
    }
    return sum;
  }, 0);

  const signups = tapSignups + linkSignups;

  // Activations: TAP (tap activations) + LINK (link_activations)
  // NÃO incluir activation_web/activation_app (JIM)
  const tapActivations = rows.reduce((sum, row) => {
    if (row.product === "TAP") {
      return sum + (row["tap activations"] || 0);
    }
    return sum;
  }, 0);

  const linkActivations = rows.reduce((sum, row) => {
    if (row.product === "LINK") {
      return sum + (row.link_activations || 0);
    }
    return sum;
  }, 0);

  const activations = tapActivations + linkActivations;

  // POS Sales
  const posSales = rows.reduce((sum, row) => {
    if (row.product === "POS") {
      return sum + (row.pos_sales || 0);
    }
    return sum;
  }, 0);

  const piselliSales = rows.reduce((sum, row) => {
    if (row.product === "POS") {
      return sum + (row.piselli_sales || 0);
    }
    return sum;
  }, 0);

  // Fifth Transaction (TAP only)
  const fifthTransaction = rows.reduce((sum, row) => {
    if (row.product === "TAP") {
      return sum + (row["tap 5trx"] || 0);
    }
    return sum;
  }, 0);

  return {
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
};

/**
 * Calculate KPIs for JIM
 */
export const calculateJimKPIs = (rows: MktAdsLookerRow[]): KPIMetrics => {
  const cost = rows.reduce((sum, row) => sum + (row.cost || 0), 0);
  const impressions = rows.reduce((sum, row) => sum + (row.impressions || 0), 0);
  const clicks = rows.reduce((sum, row) => sum + (row.clicks || 0), 0);
  const video3s = rows.reduce((sum, row) => sum + (row.video_3s || 0), 0);

  // JIM metrics
  const installs = rows.reduce((sum, row) => sum + (row.install || 0), 0);
  const signupWeb = rows.reduce((sum, row) => sum + (row.signup_web || 0), 0);
  const activationApp = rows.reduce((sum, row) => sum + (row.activation_app || 0), 0);
  const activationWeb = rows.reduce((sum, row) => sum + (row.activation_web || 0), 0);

  const signups = signupWeb;
  const activations = activationApp + activationWeb;

  return {
    cost,
    impressions,
    clicks,
    signups,
    activations,
    installs,
    ctr: calculateCTR(clicks, impressions),
    cpm: calculateCPM(cost, impressions),
    hook_rate: calculateHookRate(video3s, impressions),
    cpa: calculateCPA(cost, signups),
    cac: calculateCAC(cost, activations),
  };
};

/**
 * Calculate KPIs for POS
 */
export const calculatePosKPIs = (rows: MktAdsLookerRow[]): KPIMetrics => {
  const cost = rows.reduce((sum, row) => sum + (row.cost || 0), 0);
  const impressions = rows.reduce((sum, row) => sum + (row.impressions || 0), 0);
  const clicks = rows.reduce((sum, row) => sum + (row.clicks || 0), 0);
  const video3s = rows.reduce((sum, row) => sum + (row.video_3s || 0), 0);

  const posSales = rows.reduce((sum, row) => sum + (row.pos_sales || 0), 0);
  const piselliSales = rows.reduce((sum, row) => sum + (row.piselli_sales || 0), 0);

  return {
    cost,
    impressions,
    clicks,
    signups: 0, // POS não tem signups diretos
    activations: 0, // POS não tem activations diretos
    pos_sales: posSales,
    piselli_sales: piselliSales,
    piselli_percentage: calculatePiselliPercentage(piselliSales, posSales),
    ctr: calculateCTR(clicks, impressions),
    cpm: calculateCPM(cost, impressions),
    hook_rate: calculateHookRate(video3s, impressions),
    cpa: null,
    cac: null,
  };
};

/**
 * Calculate KPIs for TAP
 */
export const calculateTapKPIs = (rows: MktAdsLookerRow[]): KPIMetrics => {
  const cost = rows.reduce((sum, row) => sum + (row.cost || 0), 0);
  const impressions = rows.reduce((sum, row) => sum + (row.impressions || 0), 0);
  const clicks = rows.reduce((sum, row) => sum + (row.clicks || 0), 0);
  const video3s = rows.reduce((sum, row) => sum + (row.video_3s || 0), 0);

  const tapSignup = rows.reduce((sum, row) => sum + (row["tap signup"] || 0), 0);
  const tapCnpjSignups = rows.reduce((sum, row) => sum + (row["tap cnpj signups"] || 0), 0);
  const tapActivations = rows.reduce((sum, row) => sum + (row["tap activations"] || 0), 0);
  const fifthTransaction = rows.reduce((sum, row) => sum + (row["tap 5trx"] || 0), 0);

  const signups = tapSignup + tapCnpjSignups;
  const activations = tapActivations;

  return {
    cost,
    impressions,
    clicks,
    signups,
    activations,
    tap_cnpj_signups: tapCnpjSignups,
    cnpj_percentage: calculateCNPJPercentage(tapCnpjSignups, tapSignup),
    fifth_transaction: fifthTransaction,
    ctr: calculateCTR(clicks, impressions),
    cpm: calculateCPM(cost, impressions),
    hook_rate: calculateHookRate(video3s, impressions),
    cpa: calculateCPA(cost, signups),
    cac: calculateCAC(cost, activations),
  };
};

/**
 * Calculate KPIs for LINK
 */
export const calculateLinkKPIs = (rows: MktAdsLookerRow[]): KPIMetrics => {
  const cost = rows.reduce((sum, row) => sum + (row.cost || 0), 0);
  const impressions = rows.reduce((sum, row) => sum + (row.impressions || 0), 0);
  const clicks = rows.reduce((sum, row) => sum + (row.clicks || 0), 0);
  const video3s = rows.reduce((sum, row) => sum + (row.video_3s || 0), 0);

  const linkSignup = rows.reduce((sum, row) => sum + (row.link_signup || 0), 0);
  const linkActivations = rows.reduce((sum, row) => sum + (row.link_activations || 0), 0);

  return {
    cost,
    impressions,
    clicks,
    signups: linkSignup,
    activations: linkActivations,
    ctr: calculateCTR(clicks, impressions),
    cpm: calculateCPM(cost, impressions),
    hook_rate: calculateHookRate(video3s, impressions),
    cpa: calculateCPA(cost, linkSignup),
    cac: calculateCAC(cost, linkActivations),
  };
};

// ============================================
// LEGACY / GENERIC CALCULATION (fallback)
// ============================================

/**
 * Calculate total Signups from raw data (LEGACY - use product-specific functions instead)
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
 * Calculate total Activations from raw data (LEGACY - use product-specific functions instead)
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
 * Calculate aggregate KPIs from raw data (LEGACY - use product-specific functions instead)
 * @deprecated Use product-specific functions instead
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

// ============================================
// FORMATTING UTILITIES
// ============================================

/**
 * Format currency (BRL for BR products, USD for JIM)
 * @param value - Value to format
 * @param product - Product name (optional, defaults to BRL)
 */
export const formatCurrency = (value: number | null | undefined, product?: Product): string => {
  if (value === null || value === undefined || isNaN(value)) return "—";
  
  // 🇺🇸 JIM uses USD ($), others use BRL (R$)
  const isJIM = product === "JIM";
  
  return new Intl.NumberFormat(isJIM ? "en-US" : "pt-BR", {
    style: "currency",
    currency: isJIM ? "USD" : "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
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
 * - jim: apenas JIM
 * - infinitepay: POS + TAP + LINK (sem JIM)
 * - default / cloudwalk: todos (POS + TAP + LINK + JIM)
 */
export const getProductsForPerspective = (perspective: string): Product[] => {
  switch (perspective) {
    case "jim":
      return ["JIM"];
    case "infinitepay":
      return ["POS", "TAP", "LINK"];
    case "default":
    case "cloudwalk":
    default:
      return ["POS", "TAP", "LINK", "JIM"]; // Todos os produtos
  }
};

/**
 * Get InfinitePay products (excludes JIM)
 */
export const getInfinitePayProducts = (): Product[] => {
  return ["POS", "TAP", "LINK"];
};
