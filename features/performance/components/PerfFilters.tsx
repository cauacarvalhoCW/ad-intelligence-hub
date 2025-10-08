"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/shared/ui/card";
import { Label } from "@/shared/ui/label";
import { Input } from "@/shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/toggle-group";
import { Search, X, Check, AlertTriangle, Calendar as CalendarIcon, Eye, Layers3 } from "lucide-react";
import { DateRangePicker } from "./DateRangePicker";
import { DateRange } from "react-day-picker";
import type { PerformanceFilters, Platform, RangePreset, DateRangeFilter, ViewMode, DimensionMode } from "../types";

interface PerfFiltersProps {
  value: PerformanceFilters;
  onChange: (filters: PerformanceFilters) => void;
  hidePlatformFilter?: boolean; // For overview page (since we show all platforms)
  hideViewMode?: boolean; // Hide view mode selector if needed
}

const RANGE_OPTIONS: { value: RangePreset; label: string }[] = [
  { value: "yesterday", label: "Ontem" },
  { value: "7d", label: "Últimos 7 dias" },
  { value: "30d", label: "Últimos 30 dias" },
  { value: "custom", label: "Período Customizado" },
];

const PLATFORM_OPTIONS: { value: Platform; label: string }[] = [
  { value: "META", label: "Meta" },
  { value: "GOOGLE", label: "Google" },
  { value: "TIKTOK", label: "TikTok" },
];

export function PerfFilters({ value, onChange, hidePlatformFilter = false, hideViewMode = false }: PerfFiltersProps) {
  // Local state for pending changes
  const [localFilters, setLocalFilters] = useState(value);

  // Check if filters have pending changes (not applied yet)
  const isDirty = useMemo(() => {
    return JSON.stringify(localFilters) !== JSON.stringify(value);
  }, [localFilters, value]);

  // Sync local state with prop changes (when filters are applied externally)
  useEffect(() => {
    setLocalFilters(value);
  }, [value]);

  // Apply filters
  const applyFilters = () => {
    console.log("🔍 [PerfFilters] Applying filters:", localFilters);
    onChange(localFilters);
  };

  // Cancel changes
  const cancelFilters = () => {
    console.log("🔍 [PerfFilters] Cancelling filter changes");
    setLocalFilters(value);
  };

  // Handle range change
  const handleRangeChange = (range: RangePreset) => {
    setLocalFilters((prev) => ({
      ...prev,
      range,
      dateRange: range === "custom" ? prev.dateRange : undefined,
    }));
  };

  // Handle date range change (for custom range)
  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (!range || !range.from || !range.to) {
      setLocalFilters((prev) => ({
        ...prev,
        dateRange: undefined,
      }));
      return;
    }
    
    const dateRange: DateRangeFilter = {
      from: range.from,
      to: range.to,
    };
    
    setLocalFilters((prev) => ({
      ...prev,
      dateRange,
    }));
  };

  // Handle platform toggle
  const handlePlatformToggle = (platform: Platform) => {
    setLocalFilters((prev) => {
      const currentPlatforms = prev.platforms || [];
      const isSelected = currentPlatforms.includes(platform);

      // Toggle platform
      const newPlatforms = isSelected
        ? currentPlatforms.filter((p) => p !== platform)
        : [...currentPlatforms, platform];

      return {
        ...prev,
        platforms: newPlatforms.length > 0 ? newPlatforms : [],
      };
    });
  };

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setLocalFilters((prev) => ({
      ...prev,
      searchQuery: value || undefined,
    }));
  };

  // Clear search
  const handleClearSearch = () => {
    setLocalFilters((prev) => ({
      ...prev,
      searchQuery: undefined,
    }));
  };

  // Handle view mode change
  const handleViewModeChange = (viewMode: ViewMode) => {
    setLocalFilters((prev) => ({
      ...prev,
      viewMode,
    }));
  };

  // Handle dimension change
  const handleDimensionChange = (dimension: DimensionMode) => {
    setLocalFilters((prev) => ({
      ...prev,
      dimension,
    }));
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-6">
          {/* Row 1: View Mode + Dimension (NEW!) */}
          {!hideViewMode && (
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <Label>View</Label>
                </div>
                <ToggleGroup
                  type="single"
                  value={localFilters.viewMode || "ad"}
                  onValueChange={(v) => v && handleViewModeChange(v as ViewMode)}
                  className="justify-start"
                >
                  <ToggleGroupItem value="ad" aria-label="View por Anúncio">
                    Anúncios (Ad)
                  </ToggleGroupItem>
                  <ToggleGroupItem value="campaign" aria-label="View por Campanha" disabled>
                    Campanhas
                    <Badge variant="outline" className="ml-2 text-xs">Em breve</Badge>
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Layers3 className="h-4 w-4 text-muted-foreground" />
                  <Label>Dimensão</Label>
                </div>
                <ToggleGroup
                  type="single"
                  value={localFilters.dimension || "total"}
                  onValueChange={(v) => v && handleDimensionChange(v as DimensionMode)}
                  className="justify-start"
                >
                  <ToggleGroupItem value="total" aria-label="Soma Total">
                    Soma Total
                  </ToggleGroupItem>
                  <ToggleGroupItem value="daily" aria-label="Diarizada">
                    Diarizada
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>
          )}

          {/* Row 2: Range Selector + Date Range */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="range-select">Período</Label>
              <Select
                value={localFilters.range || "7d"}
                onValueChange={(v) => handleRangeChange(v as RangePreset)}
              >
                <SelectTrigger id="range-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RANGE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Picker (only show if custom range) */}
            {localFilters.range === "custom" && (
              <div className="flex-1 space-y-2">
                <Label>Data Início → Data Fim</Label>
                <DateRangePicker
                  value={localFilters.dateRange ? {
                    from: localFilters.dateRange.from,
                    to: localFilters.dateRange.to
                  } : undefined}
                  onChange={handleDateRangeChange}
                />
              </div>
            )}
          </div>

          {/* Row 3: Platform Filter (if not hidden) */}
          {!hidePlatformFilter && (
            <div className="space-y-2">
              <Label>Plataformas</Label>
              <div className="flex flex-wrap gap-2">
                {PLATFORM_OPTIONS.map((platform) => {
                  const isSelected = localFilters.platforms?.includes(platform.value);
                  return (
                    <Badge
                      key={platform.value}
                      variant={isSelected ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary/80 transition-colors"
                      onClick={() => handlePlatformToggle(platform.value)}
                    >
                      {platform.label}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* Row 4: Search Input */}
          <div className="space-y-2">
            <Label htmlFor="search-input">
              Buscar Anúncio ou Campanha
              {localFilters.searchQuery && (
                <span className="ml-2 text-xs text-primary font-semibold">
                  (🔍 Filtrando toda a página)
                </span>
              )}
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search-input"
                type="text"
                placeholder="Buscar por campanha ou anúncio..."
                value={localFilters.searchQuery || ""}
                onChange={handleSearchChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && isDirty) {
                    applyFilters();
                  }
                }}
                className="pl-9 pr-9"
              />
              {localFilters.searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSearch}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                  title="Limpar busca"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {localFilters.searchQuery && (
              <p className="text-xs text-muted-foreground">
                💡 Este filtro afeta <strong>toda a página</strong>: KPIs, tabelas, charts e análises.
              </p>
            )}
          </div>

          {/* Apply/Cancel Buttons (only show when dirty) */}
          {isDirty && (
            <div className="flex items-center gap-3 pt-2 border-t">
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                Filtros não aplicados
              </Badge>
              <div className="flex-1" />
              <Button variant="outline" size="sm" onClick={cancelFilters}>
                Cancelar
              </Button>
              <Button size="sm" onClick={applyFilters}>
                <Check className="h-4 w-4 mr-2" />
                Aplicar Filtros
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}