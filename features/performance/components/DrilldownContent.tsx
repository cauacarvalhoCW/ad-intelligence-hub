"use client";

import { useRouter } from "next/navigation";
import { ProductTabs } from "./ProductTabs";
import { PerfFilters } from "./PerfFilters";
import { KpiRow } from "./KpiRow";
import { PerformanceTable } from "./PerformanceTable";
import { CreativeTable } from "./CreativeTable";
import { CreativeCampaignTable } from "./CreativeCampaignTable";
import { WinnersSection } from "./WinnersSection";
import { EfficiencyChart, CostByPlatformChart, FunnelChart } from "./charts";
import { TaxonomyCharts } from "./charts/TaxonomyCharts";
import { EmptyState, ErrorState } from "./shared";
import { usePerformanceDataAPI, usePerformanceUrlFilters } from "../hooks";
import { Button } from "@/shared/ui/button";
import { ArrowLeft } from "lucide-react";
import type { Perspective, Product } from "../types";

interface DrilldownContentProps {
  perspective: Perspective;
  product: Product;
}

export function DrilldownContent({ perspective, product }: DrilldownContentProps) {
  const router = useRouter();
  
  // Sync filters with URL
  const { filters, setFilters, resetFilters, isReady } = usePerformanceUrlFilters({
    basePath: `/${perspective}/performance/${product.toLowerCase()}`,
  });

  // Fetch data filtered by THIS product only from API
  const {
    kpiMetrics,
    efficiencyData,
    costByPlatformData,
    funnelData,
    rawData,
    isLoading,
    error,
    refetch,
  } = usePerformanceDataAPI({
    perspective,
    platforms: filters.platforms,
    product, // Filter by this specific product
    range: filters.range,
    dateRange: filters.dateRange,
    searchQuery: filters.searchQuery,
    view: "day",
    enabled: isReady, // Wait for hydration
  });

  const showInstalls = product === "JIM";

  // Header component (reused in all states)
  const HeaderSection = () => (
    <>
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
      <ProductTabs perspective={perspective} activeProduct={product} />
      <PerfFilters value={filters} onChange={setFilters} />
    </>
  );

  // Error state
  if (error) {
    return (
      <div className="flex-1 space-y-8 px-4 py-8 md:px-8">
        <HeaderSection />
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
        <HeaderSection />
        <EmptyState
          title="Nenhum dado encontrado"
          description={`Não há dados de performance para ${product} com os filtros selecionados. Tente ajustar o período ou as plataformas.`}
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
      <HeaderSection />

      {/* 1. KPI Row */}
      <KpiRow metrics={kpiMetrics} isLoading={isLoading} showInstalls={showInstalls} product={product} />

      {/* 2. New Tables based on View Mode and Dimension */}
      {filters.viewMode === "ad" && (
        <>
          {/* Table 1: Creative-only aggregation */}
          <CreativeTable 
            data={rawData}
            isLoading={isLoading}
            product={product}
            dimension={filters.dimension || "total"}
          />
          
          {/* Taxonomy Charts after Table 1 (only for Soma Total) */}
          <TaxonomyCharts
            data={rawData}
            isLoading={isLoading}
            dimension={filters.dimension || "total"}
            position="after-table1"
          />
          
          {/* Table 2: Creative + Campaign aggregation */}
          <CreativeCampaignTable
            data={rawData}
            isLoading={isLoading}
            product={product}
            dimension={filters.dimension || "total"}
          />
          
          {/* Taxonomy Charts after Table 2 (only for Soma Total) */}
          <TaxonomyCharts
            data={rawData}
            isLoading={isLoading}
            dimension={filters.dimension || "total"}
            position="after-table2"
          />
        </>
      )}

      {/* 3. Original Performance Table (keeping for now, hidden) */}
      {false && (
        <PerformanceTable
          product={product}
          data={rawData}
          isLoading={isLoading}
          searchQuery={filters.searchQuery}
        />
      )}

      {/* 4. Main Chart (Performance over time) */}
      <EfficiencyChart data={efficiencyData} isLoading={isLoading} />

      {/* 5. Top 5 Winners por Plataforma */}
      <WinnersSection 
        ads={rawData} 
        mode="drilldown"
        product={product}
        isLoading={isLoading}
      />

      {/* 6. Other Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CostByPlatformChart data={costByPlatformData} isLoading={isLoading} />
        <FunnelChart data={funnelData} isLoading={isLoading} />
      </div>
    </div>
  );
}
