"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { calculateKPIMetrics } from "../utils";
import {
  prepareEfficiencyChartData,
  prepareCostByPlatformData,
  prepareCostByProductData,
  prepareFunnelData,
} from "../utils/chart-data";
import type {
  KPIMetrics,
  Platform,
  Product,
  RangePreset,
  ViewGranularity,
  ChartDataPoint,
  FunnelStage,
  AdData,
  MktAdsLookerRow,
  DateRangeFilter,
  Perspective,
} from "../types";

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

  const enriched = {
    ...row,
    ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
    hook_rate: impressions > 0 ? (video_3s / impressions) * 100 : 0,
    cpm: impressions > 0 ? (cost / impressions) * 1000 : 0,
    cpa: signups > 0 ? cost / signups : null,
    cac: activations > 0 ? cost / activations : null,
    signups,
    activations,
  };

  // 🔍 DEBUG: Log enriched data occasionally
  if (Math.random() < 0.01) { // Log 1% of rows
    console.log("🔧 [enrichAdData] Sample:", {
      ad_name: row.ad_name?.slice(0, 30),
      platform: row.platform,
      cost,
      impressions,
      clicks,
      "tap signup": row["tap signup"],
      signup_web: row.signup_web,
      link_signup: row.link_signup,
      calculatedSignups: signups,
      "tap activations": row["tap activations"],
      activation_app: row.activation_app,
      activation_web: row.activation_web,
      link_activations: row.link_activations,
      calculatedActivations: activations,
      cac: enriched.cac,
      creative_link: row.creative_link,
    });
  }

  return enriched;
}

interface UsePerformanceDataAPIProps {
  perspective: Perspective;
  platforms?: Platform[];
  products?: Product[];
  range?: RangePreset;
  product?: Product; // For drilldown pages
  view?: ViewGranularity; // For charts
  dateRange?: DateRangeFilter; // For custom date range
  searchQuery?: string; // For searching ads/campaigns
  enabled?: boolean; // To control when to fetch (default: true)
}

interface UsePerformanceDataAPIReturn {
  kpiMetrics: KPIMetrics | null;
  efficiencyData: ChartDataPoint[];
  costByPlatformData: ChartDataPoint[];
  costByProductData: ChartDataPoint[];
  funnelData: FunnelStage[];
  rawData: AdData[]; // Raw filtered data for tables/best ads
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function usePerformanceDataAPI({
  perspective,
  platforms,
  products,
  range = "7d",
  product,
  view = "day",
  dateRange,
  searchQuery,
  enabled = true,
}: UsePerformanceDataAPIProps): UsePerformanceDataAPIReturn {
  const [kpiMetrics, setKpiMetrics] = useState<KPIMetrics | null>(null);
  const [efficiencyData, setEfficiencyData] = useState<ChartDataPoint[]>([]);
  const [costByPlatformData, setCostByPlatformData] = useState<ChartDataPoint[]>([]);
  const [costByProductData, setCostByProductData] = useState<ChartDataPoint[]>([]);
  const [funnelData, setFunnelData] = useState<FunnelStage[]>([]);
  const [rawData, setRawData] = useState<AdData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  // Memoize dateRange to prevent infinite loop
  const dateRangeKey = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return null;
    return `${dateRange.from.toISOString()}-${dateRange.to.toISOString()}`;
  }, [dateRange?.from, dateRange?.to]);

  // Memoize platforms and products arrays to prevent infinite loop
  const platformsKey = useMemo(() => platforms?.join(',') || '', [platforms]);
  const productsKey = useMemo(() => products?.join(',') || '', [products]);

  const fetchData = useCallback(async () => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      console.log("🔍 [usePerformanceDataAPI] Starting fetch with:", {
        perspective,
        platformsKey,
        productsKey,
        product,
        range,
        dateRangeKey,
        searchQuery,
      });
        
        // Build query params
        const params = new URLSearchParams();
        params.append("perspective", perspective);

        if (product) {
          params.append("product", product);
        } else if (products && products.length > 0) {
          params.append("products", products.join(","));
        }

        if (platforms && platforms.length > 0) {
          params.append("platforms", platforms.join(","));
        }

        params.append("range", range);

        if (range === "custom" && dateRange?.from && dateRange?.to) {
          params.append("from", dateRange.from.toISOString().split("T")[0]);
          params.append("to", dateRange.to.toISOString().split("T")[0]);
        }

        if (searchQuery) {
          params.append("search", searchQuery);
        }

        // Fetch from API
        console.log("🌐 [usePerformanceDataAPI] Fetching /api/performance:", params.toString());
        const response = await fetch(`/api/performance?${params.toString()}`);

        if (!response.ok) {
          const errorData = await response.json();
          console.error("❌ [usePerformanceDataAPI] /api/performance error:", errorData);
          throw new Error(errorData.error?.message || "Failed to fetch performance data");
        }

        const { data: apiData, error: apiError } = await response.json();

        if (apiError) {
          console.error("❌ [usePerformanceDataAPI] API error:", apiError);
          throw new Error(apiError.message);
        }
        
        console.log(`✅ [usePerformanceDataAPI] Fetched ${apiData?.length || 0} rows from /api/performance`);

        // Enrich data with calculated metrics
        const enrichedData = (apiData || []).map(enrichAdData);

        // Store enriched data
        setRawData(enrichedData);

        // Fetch KPI metrics from API (uses product-specific calculations)
        console.log("🌐 [usePerformanceDataAPI] Fetching /api/performance/kpis:", params.toString());
        const kpiResponse = await fetch(`/api/performance/kpis?${params.toString()}`);
        
        if (!kpiResponse.ok) {
          const kpiErrorData = await kpiResponse.json();
          console.error("❌ [usePerformanceDataAPI] /api/performance/kpis error:", kpiErrorData);
          throw new Error(kpiErrorData.error?.message || "Failed to fetch KPI metrics");
        }

        const { data: kpiData, error: kpiError } = await kpiResponse.json();
        
        if (kpiError) {
          console.error("❌ [usePerformanceDataAPI] KPI API error:", kpiError);
          throw new Error(kpiError.message);
        }

        console.log("✅ [usePerformanceDataAPI] KPI metrics:", kpiData);
        setKpiMetrics(kpiData);

        // Prepare chart data
        setEfficiencyData(prepareEfficiencyChartData(enrichedData, view));
        setCostByPlatformData(prepareCostByPlatformData(enrichedData, view));
        setCostByProductData(prepareCostByProductData(enrichedData));
        setFunnelData(prepareFunnelData(enrichedData));
        
        console.log("✅ [usePerformanceDataAPI] All data processed successfully");
      } catch (err) {
        console.error("❌ [usePerformanceDataAPI] Error:", err);
        setError(err as Error);
      } finally {
        console.log("🏁 [usePerformanceDataAPI] Setting isLoading = false");
        setIsLoading(false);
      }
    }, [
    perspective,
    platformsKey,
    productsKey,
    range,
    product,
    view,
    dateRangeKey,
    searchQuery,
    enabled,
    refetchTrigger,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    setRefetchTrigger((prev) => prev + 1);
  }, []);

  return {
    kpiMetrics,
    efficiencyData,
    costByPlatformData,
    costByProductData,
    funnelData,
    rawData,
    isLoading,
    error,
    refetch,
  };
}

