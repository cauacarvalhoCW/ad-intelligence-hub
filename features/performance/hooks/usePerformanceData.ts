"use client";

import { useState, useEffect } from "react";
import { MOCK_ADS_DATA, filterMockData } from "../mock-data";
import { calculateKPIMetrics } from "../utils";
import {
  prepareEfficiencyChartData,
  prepareCostByPlatformData,
  prepareCostByProductData,
  prepareFunnelData,
} from "../utils/chart-data";
import type { KPIMetrics, Platform, Product, RangePreset, ViewGranularity, ChartDataPoint, FunnelStage, AdData, MktAdsLookerRow } from "../types";

// Helper to calculate metrics for each ad
function enrichAdData(row: MktAdsLookerRow): AdData {
  const impressions = row.impressions || 0;
  const clicks = row.clicks || 0;
  const video_3s = row.video_3s || 0;
  const cost = row.cost || 0;

  // Calculate signups (aggregate from different sources)
  const signups = 
    (row["tap signup"] || 0) +
    (row.signup_web || 0) +
    (row.link_signup || 0);

  // Calculate activations
  const activations =
    (row["tap activations"] || 0) +
    (row.activation_app || 0) +
    (row.activation_web || 0) +
    (row.link_activations || 0);

  return {
    ...row,
    ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
    hook_rate: impressions > 0 ? (video_3s / impressions) * 100 : 0,
    cpm: impressions > 0 ? (cost / impressions) * 1000 : 0,
    cpa: signups > 0 ? cost / signups : null,
    cac: activations > 0 ? cost / activations : null,
    signups,
    activations,
  };
}

interface UsePerformanceDataProps {
  platforms?: Platform[];
  products?: Product[];
  range?: RangePreset;
  product?: Product; // For drilldown pages
  view?: ViewGranularity; // For charts
}

interface UsePerformanceDataReturn {
  kpiMetrics: KPIMetrics | null;
  efficiencyData: ChartDataPoint[];
  costByPlatformData: ChartDataPoint[];
  costByProductData: ChartDataPoint[];
  funnelData: FunnelStage[];
  rawData: AdData[]; // Raw filtered data for tables/best ads
  isLoading: boolean;
  error: Error | null;
}

export function usePerformanceData({
  platforms,
  products,
  range = "7d",
  product,
  view = "day",
}: UsePerformanceDataProps = {}): UsePerformanceDataReturn {
  const [kpiMetrics, setKpiMetrics] = useState<KPIMetrics | null>(null);
  const [efficiencyData, setEfficiencyData] = useState<ChartDataPoint[]>([]);
  const [costByPlatformData, setCostByPlatformData] = useState<ChartDataPoint[]>([]);
  const [costByProductData, setCostByProductData] = useState<ChartDataPoint[]>([]);
  const [funnelData, setFunnelData] = useState<FunnelStage[]>([]);
  const [rawData, setRawData] = useState<AdData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Simulate async data fetching
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Filter mock data
        const filtered = filterMockData(MOCK_ADS_DATA, {
          platforms,
          products: product ? [product] : products,
          range,
        });

        // Enrich data with calculated metrics
        const enrichedData = filtered.map(enrichAdData);

        // Store enriched data
        setRawData(enrichedData);

        // Calculate metrics
        const includeInstalls = product === "JIM" || products?.includes("JIM");
        const metrics = calculateKPIMetrics(filtered, includeInstalls);
        setKpiMetrics(metrics);

        // Prepare chart data
        setEfficiencyData(prepareEfficiencyChartData(filtered, view));
        setCostByPlatformData(prepareCostByPlatformData(filtered, view));
        setCostByProductData(prepareCostByProductData(filtered));
        setFunnelData(prepareFunnelData(filtered));
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [platforms, products, range, product, view]);

  return {
    kpiMetrics,
    efficiencyData,
    costByPlatformData,
    costByProductData,
    funnelData,
    rawData,
    isLoading,
    error,
  };
}

