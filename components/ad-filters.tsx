"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Search, Filter, X } from "lucide-react";
import type { Competitor } from "@/lib/types";

interface AdFiltersProps {
  competitors: Competitor[];
  onFiltersChange: (filters: FilterState) => void;
  className?: string;
  currentPerspective?: string; // Adicionar perspectiva atual
}

export interface FilterState {
  searchTerm: string;
  selectedCompetitors: string[]; // Mudança: array em vez de string
  selectedPlatform: string;
  selectedAdType: string;
  dateRange: string;
  dateFrom: string;
  dateTo: string;
  tags: string[];
}

const platforms = [
  { value: "meta", label: "Meta" },
  // { value: "instagram", label: "Instagram" },
  // { value: "google", label: "Google" },
  // { value: "linkedin", label: "LinkedIn" },
  // { value: "tiktok", label: "TikTok" },
];

const adTypes = [
  { value: "image", label: "Imagem" },
  { value: "video", label: "Vídeo" },
  // { value: "carousel", label: "Carrossel" },
  // { value: "text", label: "Texto" },
];

const dateRanges = [
  { value: "7d", label: "Últimos 7 dias" },
  { value: "30d", label: "Últimos 30 dias" },
  { value: "90d", label: "Últimos 90 dias" },
  { value: "all", label: "Todo período" },
];

// Mapeamento de perspectivas para competidores
const PERSPECTIVE_COMPETITORS: Record<string, string[]> = {
  infinitepay: ["PagBank", "Stone", "Cora", "Ton", "Mercado Pago", "Jeitto"],
  jim: ["Square", "PayPal", "Stripe", "Venmo", "SumUp"],
  cloudwalk: [], // todos
  default: [], // todos
};

export function AdFilters({
  competitors,
  onFiltersChange,
  className,
  currentPerspective = "default",
}: AdFiltersProps) {
  // Estado local - o que o usuário está preenchendo
  const [localFilters, setLocalFilters] = useState<FilterState>({
    searchTerm: "",
    selectedCompetitors: [], // Array vazio
    selectedPlatform: "all",
    selectedAdType: "all",
    dateRange: "all",
    dateFrom: "",
    dateTo: "",
    tags: [],
  });

  // Estado aplicado - o que foi enviado para a API
  const [appliedFilters, setAppliedFilters] = useState<FilterState>({
    searchTerm: "",
    selectedCompetitors: [], // Array vazio
    selectedPlatform: "all",
    selectedAdType: "all",
    dateRange: "all",
    dateFrom: "",
    dateTo: "",
    tags: [],
  });

  const updateLocalFilters = (newFilters: Partial<FilterState>) => {
    setLocalFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const applyFilters = () => {
    setAppliedFilters(localFilters);
    onFiltersChange(localFilters);
  };

  const clearFilters = () => {
    const clearedFilters: FilterState = {
      searchTerm: "",
      selectedCompetitors: [], // Array vazio
      selectedPlatform: "all",
      selectedAdType: "all",
      dateRange: "all",
      dateFrom: "",
      dateTo: "",
      tags: [],
    };
    setLocalFilters(clearedFilters);
    setAppliedFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters =
    appliedFilters.searchTerm !== "" ||
    appliedFilters.selectedCompetitors.length > 0 || // Mudança: verificar array
    appliedFilters.selectedPlatform !== "all" ||
    appliedFilters.selectedAdType !== "all" ||
    appliedFilters.dateRange !== "all" ||
    appliedFilters.dateFrom !== "" ||
    appliedFilters.dateTo !== "" ||
    appliedFilters.tags.length > 0;

  const hasUnappliedChanges =
    JSON.stringify(localFilters) !== JSON.stringify(appliedFilters);

  // Filtrar competidores baseado na perspectiva atual
  const perspectiveCompetitorNames =
    PERSPECTIVE_COMPETITORS[
      currentPerspective as keyof typeof PERSPECTIVE_COMPETITORS
    ] || [];
  const filteredCompetitors =
    perspectiveCompetitorNames.length > 0
      ? competitors.filter((comp: { id: string; name: string }) =>
          perspectiveCompetitorNames.includes(comp.name),
        )
      : competitors;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Análise
          </CardTitle>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              Limpar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div>
          <label className="text-sm font-medium mb-2 block">Buscar</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por título, descrição, taxa ou palavra-chave..."
              value={localFilters.searchTerm}
              onChange={(e) =>
                updateLocalFilters({ searchTerm: e.target.value })
              }
              className="pl-10"
            />
          </div>
        </div>

        {/* Filter Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Competitor - Multi-Select */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Concorrentes ({localFilters.selectedCompetitors.length}{" "}
              selecionados)
            </label>
            <div className="border rounded-md p-2 max-h-32 overflow-y-auto space-y-1">
              {filteredCompetitors.map((competitor) => (
                <label
                  key={competitor.id}
                  className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-secondary/50 p-1 rounded"
                >
                  <input
                    type="checkbox"
                    checked={localFilters.selectedCompetitors.includes(
                      competitor.id,
                    )}
                    onChange={(e) => {
                      const newCompetitors = e.target.checked
                        ? [...localFilters.selectedCompetitors, competitor.id]
                        : localFilters.selectedCompetitors.filter(
                            (id) => id !== competitor.id,
                          );
                      updateLocalFilters({
                        selectedCompetitors: newCompetitors,
                      });
                    }}
                    className="rounded border-gray-300"
                  />
                  <span>{competitor.name}</span>
                </label>
              ))}
              {filteredCompetitors.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Nenhum competidor disponível
                </p>
              )}
            </div>
          </div>

          {/* Platform */}
          <div>
            <label className="text-sm font-medium mb-2 block">Plataforma</label>
            <Select
              value={localFilters.selectedPlatform}
              onValueChange={(value) =>
                updateLocalFilters({ selectedPlatform: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as plataformas</SelectItem>
                {platforms.map((platform) => (
                  <SelectItem key={platform.value} value={platform.value}>
                    {platform.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ad Type */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Tipo de Anúncio
            </label>
            <Select
              value={localFilters.selectedAdType}
              onValueChange={(value) =>
                updateLocalFilters({ selectedAdType: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {adTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range - Datas Específicas */}
          <div className="space-y-3">
            <label className="text-sm font-medium block">Período</label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Data Inicial
                </label>
                <Input
                  type="date"
                  value={localFilters.dateFrom}
                  onChange={(e) =>
                    updateLocalFilters({ dateFrom: e.target.value })
                  }
                  className="text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Data Final
                </label>
                <Input
                  type="date"
                  value={localFilters.dateTo}
                  onChange={(e) =>
                    updateLocalFilters({ dateTo: e.target.value })
                  }
                  className="text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Apply Filters Button */}
        <div className="flex gap-2 pt-4 border-t">
          <Button
            onClick={applyFilters}
            disabled={!hasUnappliedChanges}
            className="flex-1"
          >
            {hasUnappliedChanges ? "Aplicar Filtros" : "Filtros Aplicados"}
          </Button>
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters} className="px-4">
              Limpar
            </Button>
          )}
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            {appliedFilters.searchTerm && (
              <Badge variant="secondary" className="gap-1">
                Busca: {appliedFilters.searchTerm}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => {
                    const updated = { ...appliedFilters, searchTerm: "" };
                    setAppliedFilters(updated);
                    setLocalFilters(updated);
                    onFiltersChange(updated);
                  }}
                />
              </Badge>
            )}
            {appliedFilters.selectedCompetitors.length > 0 && (
              <Badge variant="secondary" className="gap-1">
                {appliedFilters.selectedCompetitors.length} competidor(es)
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => {
                    const updated = {
                      ...appliedFilters,
                      selectedCompetitors: [],
                    };
                    setAppliedFilters(updated);
                    setLocalFilters(updated);
                    onFiltersChange(updated);
                  }}
                />
              </Badge>
            )}
            {appliedFilters.selectedPlatform !== "all" && (
              <Badge variant="secondary" className="gap-1">
                {
                  platforms.find(
                    (p) => p.value === appliedFilters.selectedPlatform,
                  )?.label
                }
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => {
                    const updated = {
                      ...appliedFilters,
                      selectedPlatform: "all",
                    };
                    setAppliedFilters(updated);
                    setLocalFilters(updated);
                    onFiltersChange(updated);
                  }}
                />
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
