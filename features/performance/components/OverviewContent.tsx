"use client";

import { useState } from "react";
import { ProductTabs } from "./ProductTabs";
import { PerfFilters } from "./PerfFilters";
import { KpiRow } from "./KpiRow";
import { EfficiencyChart, CostByPlatformChart, CostByProductChart, FunnelChart } from "./charts";
import { usePerformanceData } from "../hooks";
import type { Perspective, Platform, RangePreset, DateRangeFilter } from "../types";

interface OverviewContentProps {
  perspective: Perspective;
}

export function OverviewContent({ perspective }: OverviewContentProps) {
  const [filters, setFilters] = useState<{
    platforms: Platform[];
    range: RangePreset;
    dateRange?: DateRangeFilter;
    searchQuery?: string;
  }>({
    platforms: ["META", "GOOGLE", "TIKTOK"],
    range: "7d",
  });

  // Fetch AGGREGATED data (ALL products) - no product filter
  const { 
    kpiMetrics, 
    efficiencyData,
    costByPlatformData,
    costByProductData,
    funnelData,
    isLoading 
  } = usePerformanceData({
    platforms: filters.platforms,
    product: undefined, // NO filter = aggregate ALL products
    range: filters.range,
    view: "day",
  });

  return (
    <div className="flex-1 space-y-8 px-4 py-8 md:px-8">
      <div className="space-y-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Performance Geral</h2>
          <p className="text-muted-foreground">
            Visão consolidada de todos os produtos
          </p>
        </div>

        {/* Filters */}
        <PerfFilters onFiltersChange={setFilters} />
      </div>

      {/* Product Tabs - Navigate to drilldown (no selection) */}
      <div className="flex justify-center">
        <ProductTabs perspective={perspective} />
      </div>

      {/* KPI Row - Aggregated metrics */}
      <KpiRow metrics={kpiMetrics} isLoading={isLoading} />

      {/* Charts Row 1: Efficiency + Cost by Platform */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EfficiencyChart data={efficiencyData} isLoading={isLoading} />
        <CostByPlatformChart data={costByPlatformData} isLoading={isLoading} />
      </div>

      {/* Charts Row 2: Cost by Product + Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CostByProductChart data={costByProductData} isLoading={isLoading} />
        <FunnelChart data={funnelData} isLoading={isLoading} />
      </div>
    </div>
  );
}
