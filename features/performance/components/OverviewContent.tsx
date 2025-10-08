"use client";

import { useEffect, useMemo } from "react";
import { ProductTabs } from "./ProductTabs";
import { PerfFilters } from "./PerfFilters";
import { FiltersSummary } from "./FiltersSummary";
import { KpiRow } from "./KpiRow";
import { WinnersSection } from "./WinnersSection";
import { EfficiencyChart, CostByPlatformChart, CostByProductChart, FunnelChart } from "./charts";
import { AdsCountChart } from "./charts/AdsCountChart";
import { EmptyState, ErrorState } from "./shared";
import { usePerformanceDataAPI, usePerformanceUrlFilters } from "../hooks";
import { debugPerformanceData } from "../utils/debug-data";
import type { Perspective, Product } from "../types";

interface OverviewContentProps {
  perspective: Perspective;
}

export function OverviewContent({ perspective }: OverviewContentProps) {
  // Sync filters with URL
  const { filters, setFilters, resetFilters, isReady } = usePerformanceUrlFilters({
    basePath: `/${perspective}/performance`,
  });

  // Determine products based on perspective
  const products = useMemo(() => {
    switch (perspective) {
      case "jim":
        return ["JIM"] as Product[]; // Apenas JIM
      case "infinitepay":
        return ["POS", "TAP", "LINK"] as Product[]; // InfinitePay (sem JIM)
      case "default":
      case "cloudwalk":
      default:
        return ["POS", "TAP", "LINK", "JIM"] as Product[]; // Todos os produtos
    }
  }, [perspective]);

  // Fetch AGGREGATED data from API
  const {
    kpiMetrics,
    efficiencyData,
    costByPlatformData,
    costByProductData,
    funnelData,
    rawData,
    isLoading,
    error,
    refetch,
  } = usePerformanceDataAPI({
    perspective,
    platforms: filters.platforms,
    products, // Dynamic: JIM for jim perspective, POS+TAP+LINK for others
    range: filters.range,
    dateRange: filters.dateRange,
    searchQuery: filters.searchQuery,
    view: "day",
    enabled: isReady, // Wait for hydration
  });

  // 🔍 DEBUG: Log data to console for validation
  useEffect(() => {
    console.log("🎯 [OverviewContent] State:", {
      isLoading,
      hasError: !!error,
      rawDataLength: rawData.length,
      hasKpiMetrics: !!kpiMetrics,
      kpiMetrics,
    });
    
    if (!isLoading && rawData.length > 0) {
      debugPerformanceData(
        rawData, 
        `📊 OVERVIEW - ${perspective.toUpperCase()} - ${filters.range.toUpperCase()} - ${filters.platforms.join(", ")}`
      );
    }
  }, [rawData, isLoading, perspective, filters.range, filters.platforms, error, kpiMetrics]);

  // Error state
  if (error) {
    return (
      <div className="flex-1 space-y-8 px-4 py-8 md:px-8">
        <div className="space-y-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Performance Geral</h2>
            <p className="text-muted-foreground">
              Visão consolidada de todos os produtos
            </p>
          </div>
          <PerfFilters value={filters} onChange={setFilters} />
        </div>
        <ErrorState
          title="Erro ao carregar dados de performance"
          message={error.message}
          onRetry={refetch}
        />
      </div>
    );
  }

  // Empty state
  if (!isLoading && rawData.length === 0) {
    return (
      <div className="flex-1 space-y-8 px-4 py-8 md:px-8">
        <div className="space-y-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Performance Geral</h2>
            <p className="text-muted-foreground">
              Visão consolidada de todos os produtos
            </p>
          </div>
          <PerfFilters value={filters} onChange={setFilters} />
        </div>
        <EmptyState
          title="Nenhum dado encontrado"
          description="Não há dados de performance para os filtros selecionados. Tente ajustar o período ou as plataformas."
          icon="no-results"
          action={{
            label: "Resetar Filtros",
            onClick: resetFilters,
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-8 px-4 py-8 md:px-8">
      <div className="space-y-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Performance Geral</h2>
          <p className="text-muted-foreground">
            Visão consolidada de todos os produtos
          </p>
        </div>

        {/* Filters - Hide View/Dimension (only for drilldown) */}
        <PerfFilters value={filters} onChange={setFilters} hideViewMode={true} />
      </div>

      {/* Product Tabs - Navigate to drilldown (no selection) */}
      <div className="flex justify-center">
        <ProductTabs perspective={perspective} />
      </div>

      {/* Resumo dos filtros aplicados */}
      <FiltersSummary filters={filters} />

      {/* Título explicativo dos KPIs */}
      <div className="bg-primary/5 border-l-4 border-primary rounded-r-lg p-4">
        <h3 className="text-lg font-semibold mb-1">
          📊 Métricas Consolidadas de Todos os Produtos
        </h3>
        <p className="text-sm text-muted-foreground">
          Os números abaixo representam a <strong>soma total</strong> de todos os produtos 
          (POS, TAP, LINK, JIM) no período e filtros selecionados. Cada card mostra o valor agregado.
        </p>
      </div>

      {/* KPI Row - Aggregated metrics */}
      <KpiRow metrics={kpiMetrics} isLoading={isLoading} />

      {/* Winners por Plataforma (Top 1 de cada) */}
      <WinnersSection 
        ads={rawData} 
        mode="overview"
        isLoading={isLoading}
        filters={filters}
      />

      {/* Ads Count - Big Numbers + Evolution Chart */}
      <AdsCountChart data={rawData} isLoading={isLoading} products={products} />

      {/* Charts Row 1: Efficiency + Cost by Platform */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EfficiencyChart data={efficiencyData} isLoading={isLoading} product={undefined} />
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
