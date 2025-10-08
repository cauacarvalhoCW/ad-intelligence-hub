"use client";

import { Badge } from "@/shared/ui/badge";
import { Calendar, Filter, Search } from "lucide-react";
import type { PerformanceFilters, Product } from "../types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface FiltersSummaryProps {
  filters: PerformanceFilters;
  product?: Product;
}

export function FiltersSummary({ filters, product }: FiltersSummaryProps) {
  // Formatar período
  const getPeriodText = () => {
    if (filters.range === "custom" && filters.dateRange?.from && filters.dateRange?.to) {
      const from = format(filters.dateRange.from, "dd/MM/yyyy", { locale: ptBR });
      const to = format(filters.dateRange.to, "dd/MM/yyyy", { locale: ptBR });
      return `${from} a ${to}`;
    }
    
    const rangeLabels: Record<string, string> = {
      "7d": "Últimos 7 dias",
      "30d": "Últimos 30 dias",
      "90d": "Últimos 90 dias",
      "ytd": "Ano até hoje",
    };
    
    return rangeLabels[filters.range] || filters.range;
  };

  // Dimensão
  const dimensionText = filters.dimension === "daily" ? "Diarizada" : "Soma Total";

  // Plataformas
  const platformsText = filters.platforms.length === 3 
    ? "Todas as plataformas"
    : filters.platforms.join(", ");

  return (
    <div className="bg-muted/30 border rounded-lg p-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* Período */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{getPeriodText()}</span>
        </div>

        <div className="h-4 w-px bg-border" />

        {/* Dimensão */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Dimensão:</span>
          <Badge variant="secondary">{dimensionText}</Badge>
        </div>

        <div className="h-4 w-px bg-border" />

        {/* Plataformas */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Plataformas:</span>
          {filters.platforms.length === 3 ? (
            <Badge variant="outline">{platformsText}</Badge>
          ) : (
            <div className="flex gap-1">
              {filters.platforms.map((platform) => (
                <Badge key={platform} variant="outline" className="text-xs">
                  {platform}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Busca ativa */}
        {filters.searchQuery && (
          <>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Busca:</span>
              <Badge variant="default" className="max-w-[200px] truncate">
                {filters.searchQuery}
              </Badge>
            </div>
          </>
        )}

        {/* Produto (se drilldown) */}
        {product && (
          <>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Produto:</span>
              <Badge variant="default">{product}</Badge>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

