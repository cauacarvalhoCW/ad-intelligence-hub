"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProductTabs } from "./ProductTabs";
import { PerfFilters } from "./PerfFilters";
import { KpiRow } from "./KpiRow";
import { PerformanceTable } from "./PerformanceTable";
import { EfficiencyChart, CostByPlatformChart, FunnelChart } from "./charts";
import { BestAds } from "./BestAds";
import { usePerformanceData } from "../hooks";
import { Button } from "@/shared/ui/button";
import { ArrowLeft } from "lucide-react";
import type { Perspective, Product, Platform, RangePreset, DateRangeFilter } from "../types";

interface DrilldownContentProps {
  perspective: Perspective;
  product: Product;
}

export function DrilldownContent({ perspective, product }: DrilldownContentProps) {
  const router = useRouter();
  const [filters, setFilters] = useState<{
    platforms: Platform[];
    range: RangePreset;
    dateRange?: DateRangeFilter;
    searchQuery?: string;
  }>({
    platforms: ["META", "GOOGLE", "TIKTOK"],
    range: "7d",
  });

  // Fetch data filtered by THIS product only
  const {
    kpiMetrics,
    efficiencyData,
    costByPlatformData,
    funnelData,
    isLoading,
    rawData,
  } = usePerformanceData({
    platforms: filters.platforms,
    product, // Filter by this specific product
    range: filters.range,
    view: "day", // Default view for charts
  });

  const showInstalls = product === "JIM";

  return (
    <div className="flex-1 space-y-8 px-4 py-8 md:px-8">
      {/* Header with back button */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/${perspective}/performance`)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div className="h-6 w-px bg-border" />
            <h2 className="text-3xl font-bold tracking-tight">{product}</h2>
          </div>
          <p className="text-muted-foreground pl-[88px]">
            Análise detalhada de performance
          </p>
        </div>
      </div>

      {/* Product Tabs - Small version for navigation */}
      <ProductTabs perspective={perspective} activeProduct={product} />

      {/* Filters */}
      <PerfFilters onFiltersChange={setFilters} />

      {/* 1. KPI Row */}
      <KpiRow metrics={kpiMetrics} isLoading={isLoading} showInstalls={showInstalls} />

      {/* 2. Performance Table (moved up, after KPIs) */}
      <PerformanceTable
        product={product}
        data={rawData}
        isLoading={isLoading}
        searchQuery={filters.searchQuery}
      />

      {/* 3. Main Chart (Performance over time) */}
      <EfficiencyChart data={efficiencyData} isLoading={isLoading} />

      {/* 4. Top 3 Best Ads (moved here) */}
      <BestAds product={product} data={rawData} isLoading={isLoading} />

      {/* 5. Other Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CostByPlatformChart data={costByPlatformData} isLoading={isLoading} />
        <FunnelChart data={funnelData} isLoading={isLoading} />
      </div>
    </div>
  );
}
