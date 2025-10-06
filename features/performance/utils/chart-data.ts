// ============================================
// CHART DATA PREPARATION UTILITIES
// ============================================

import type { MktAdsLookerRow, ViewGranularity, ChartDataPoint, FunnelStage } from "../types";
import { calculateCTR, calculateCPM, calculateHookRate, calculateCAC, calculateCPA } from "./kpi-calculations";

/**
 * Group data by date bucket based on view granularity
 */
export function groupByTimeBucket(
  rows: MktAdsLookerRow[],
  view: ViewGranularity
): Map<string, MktAdsLookerRow[]> {
  const grouped = new Map<string, MktAdsLookerRow[]>();

  rows.forEach((row) => {
    if (!row.date) return;

    let bucket: string;
    const date = new Date(row.date);

    switch (view) {
      case "week":
        // Get week number
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        bucket = weekStart.toISOString().split("T")[0];
        break;
      case "month":
        bucket = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        break;
      case "alltime":
        bucket = "all";
        break;
      default: // day
        bucket = row.date;
    }

    if (!grouped.has(bucket)) {
      grouped.set(bucket, []);
    }
    grouped.get(bucket)!.push(row);
  });

  return grouped;
}

/**
 * Prepare efficiency chart data (CAC, CPM, CPA, CTR, Hook Rate over time)
 */
export function prepareEfficiencyChartData(
  rows: MktAdsLookerRow[],
  view: ViewGranularity
): ChartDataPoint[] {
  const grouped = groupByTimeBucket(rows, view);
  const data: ChartDataPoint[] = [];

  Array.from(grouped.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([date, bucketRows]) => {
      const cost = bucketRows.reduce((sum, r) => sum + (r.cost || 0), 0);
      const impressions = bucketRows.reduce((sum, r) => sum + (r.impressions || 0), 0);
      const clicks = bucketRows.reduce((sum, r) => sum + (r.clicks || 0), 0);
      const video3s = bucketRows.reduce((sum, r) => sum + (r.video_3s || 0), 0);

      // Calculate signups and activations
      let signups = 0;
      let activations = 0;

      bucketRows.forEach((r) => {
        if (r.product === "TAP") {
          signups += (r["tap signup"] || 0) + (r["tap cnpj signups"] || 0);
          activations += r["tap activations"] || 0;
        } else if (r.product === "LINK") {
          signups += r.link_signup || 0;
          activations += r.link_activations || 0;
        } else if (r.product === "JIM") {
          signups += r.signup_web || 0;
          activations += (r.activation_app || 0) + (r.activation_web || 0);
        }
      });

      data.push({
        date,
        cac: calculateCAC(cost, activations) || 0,
        cpm: calculateCPM(cost, impressions),
        cpa: calculateCPA(cost, signups) || 0,
        ctr: calculateCTR(clicks, impressions),
        hookRate: calculateHookRate(video3s, impressions),
      });
    });

  return data;
}

/**
 * Prepare cost by platform chart data (stacked bars)
 */
export function prepareCostByPlatformData(
  rows: MktAdsLookerRow[],
  view: ViewGranularity
): ChartDataPoint[] {
  const grouped = groupByTimeBucket(rows, view);
  const data: ChartDataPoint[] = [];

  Array.from(grouped.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([date, bucketRows]) => {
      const point: ChartDataPoint = { date };

      // Group by platform
      const platformCosts = {
        META: 0,
        GOOGLE: 0,
        TIKTOK: 0,
      };

      bucketRows.forEach((row) => {
        const platformKey = row.platform.toUpperCase() as keyof typeof platformCosts;
        if (platformKey in platformCosts) {
          platformCosts[platformKey] += row.cost || 0;
        }
      });

      point.META = platformCosts.META;
      point.GOOGLE = platformCosts.GOOGLE;
      point.TIKTOK = platformCosts.TIKTOK;

      data.push(point);
    });

  return data;
}

/**
 * Prepare cost by product chart data (grouped bars)
 */
export function prepareCostByProductData(
  rows: MktAdsLookerRow[]
): ChartDataPoint[] {
  const productCosts = new Map<string, number>();

  rows.forEach((row) => {
    if (!row.product) return;
    const current = productCosts.get(row.product) || 0;
    productCosts.set(row.product, current + (row.cost || 0));
  });

  return Array.from(productCosts.entries())
    .map(([product, cost]) => ({
      date: product,
      cost,
    }))
    .sort((a, b) => (b.cost as number) - (a.cost as number));
}

/**
 * Prepare funnel chart data
 */
export function prepareFunnelData(rows: MktAdsLookerRow[]): FunnelStage[] {
  const impressions = rows.reduce((sum, r) => sum + (r.impressions || 0), 0);
  const clicks = rows.reduce((sum, r) => sum + (r.clicks || 0), 0);

  let signups = 0;
  let activations = 0;

  rows.forEach((r) => {
    if (r.product === "TAP") {
      signups += (r["tap signup"] || 0) + (r["tap cnpj signups"] || 0);
      activations += r["tap activations"] || 0;
    } else if (r.product === "LINK") {
      signups += r.link_signup || 0;
      activations += r.link_activations || 0;
    } else if (r.product === "JIM") {
      signups += r.signup_web || 0;
      activations += (r.activation_app || 0) + (r.activation_web || 0);
    }
  });

  return [
    {
      name: "Impressões",
      value: impressions,
      percentage: 100,
    },
    {
      name: "Clicks",
      value: clicks,
      percentage: impressions > 0 ? (clicks / impressions) * 100 : 0,
    },
    {
      name: "Signups",
      value: signups,
      percentage: clicks > 0 ? (signups / clicks) * 100 : 0,
    },
    {
      name: "Ativações",
      value: activations,
      percentage: signups > 0 ? (activations / signups) * 100 : 0,
    },
  ];
}

