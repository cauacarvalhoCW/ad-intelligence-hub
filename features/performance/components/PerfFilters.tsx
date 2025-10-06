"use client";

import { useState, useEffect } from "react";
import { DateRange } from "react-day-picker";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import { Filter, Search, X, Check } from "lucide-react";
import { DateRangePicker } from "./DateRangePicker";
import type { Platform, RangePreset, DateRangeFilter } from "../types";

interface PerfFiltersProps {
  // Controlled component - receive values as props
  value: {
    platforms: Platform[];
    range: RangePreset;
    dateRange?: DateRangeFilter;
    searchQuery?: string;
  };
  onChange: (filters: {
    platforms: Platform[];
    range: RangePreset;
    dateRange?: DateRangeFilter;
    searchQuery?: string;
  }) => void;
}

const PLATFORMS: Platform[] = ["META", "GOOGLE", "TIKTOK"];
const RANGES: { value: RangePreset; label: string }[] = [
  { value: "yesterday", label: "Ontem" },
  { value: "7d", label: "Últimos 7 dias" },
  { value: "30d", label: "Últimos 30 dias" },
  { value: "custom", label: "Período customizado" },
];

export function PerfFilters({ value, onChange }: PerfFiltersProps) {
  // Local state for temporary filters (before applying)
  const [tempPlatforms, setTempPlatforms] = useState<Platform[]>(value.platforms);
  const [tempRange, setTempRange] = useState<RangePreset>(value.range);
  const [tempDateRange, setTempDateRange] = useState<DateRangeFilter | undefined>(value.dateRange);
  const [tempSearchQuery, setTempSearchQuery] = useState<string>(value.searchQuery || "");

  // Sync with external value changes
  useEffect(() => {
    setTempPlatforms(value.platforms);
    setTempRange(value.range);
    setTempDateRange(value.dateRange);
    setTempSearchQuery(value.searchQuery || "");
  }, [value.platforms, value.range, value.dateRange, value.searchQuery]);

  // Check if there are pending changes
  const hasPendingChanges = 
    JSON.stringify(tempPlatforms) !== JSON.stringify(value.platforms) ||
    tempRange !== value.range ||
    JSON.stringify(tempDateRange) !== JSON.stringify(value.dateRange) ||
    tempSearchQuery !== (value.searchQuery || "");

  const togglePlatform = (platform: Platform) => {
    const newPlatforms = tempPlatforms.includes(platform)
      ? tempPlatforms.filter((p) => p !== platform)
      : [...tempPlatforms, platform];
    setTempPlatforms(newPlatforms);
  };

  const handleRangeChange = (range: RangePreset) => {
    setTempRange(range);
    if (range !== "custom") {
      setTempDateRange(undefined);
    }
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      setTempRange("custom");
      setTempDateRange({ from: range.from, to: range.to });
    } else {
      setTempDateRange(undefined);
    }
  };

  const handleSearchChange = (query: string) => {
    setTempSearchQuery(query);
  };

  const clearSearch = () => {
    setTempSearchQuery("");
  };

  // Apply filters button
  const applyFilters = () => {
    onChange({
      platforms: tempPlatforms,
      range: tempRange,
      dateRange: tempDateRange,
      searchQuery: tempSearchQuery.trim() || undefined,
    });
  };

  // Reset to current applied filters
  const resetFilters = () => {
    setTempPlatforms(value.platforms);
    setTempRange(value.range);
    setTempDateRange(value.dateRange);
    setTempSearchQuery(value.searchQuery || "");
  };

  const customDateRangeValue = tempDateRange
    ? { from: tempDateRange.from, to: tempDateRange.to }
    : undefined;

  return (
    <div className="space-y-4">
      {/* Primary Filters Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Platform Multi-Select */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Plataformas
              {tempPlatforms.length > 0 && tempPlatforms.length < PLATFORMS.length && (
                <Badge variant="secondary" className="ml-1">
                  {tempPlatforms.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel>Selecione as plataformas</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {PLATFORMS.map((platform) => (
              <DropdownMenuCheckboxItem
                key={platform}
                checked={tempPlatforms.includes(platform)}
                onCheckedChange={() => togglePlatform(platform)}
              >
                {platform}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Quick Range Buttons */}
        <div className="flex gap-2">
          {RANGES.filter((r) => r.value !== "custom").map((range) => (
            <Button
              key={range.value}
              variant={tempRange === range.value ? "default" : "outline"}
              size="sm"
              onClick={() => handleRangeChange(range.value)}
            >
              {range.label}
            </Button>
          ))}
        </div>

        {/* Custom Date Range */}
        <DateRangePicker
          value={customDateRangeValue}
          onChange={handleDateRangeChange}
        />

        {/* Search by Name */}
        <div className="relative flex-1 min-w-[250px] max-w-[400px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por campanha ou anúncio..."
            value={tempSearchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                applyFilters();
              }
            }}
            className="pl-9 pr-9"
          />
          {tempSearchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Apply Filters Button */}
        {hasPendingChanges && (
          <div className="flex gap-2">
            <Button
              onClick={applyFilters}
              size="default"
              className="gap-2 font-semibold"
            >
              <Check className="h-4 w-4" />
              Aplicar Filtros
            </Button>
            <Button
              onClick={resetFilters}
              variant="outline"
              size="default"
            >
              Cancelar
            </Button>
          </div>
        )}
      </div>

      {/* Active Filters Display */}
      <div className="flex flex-wrap items-center gap-2">
        {value.platforms.length > 0 && value.platforms.length < PLATFORMS.length && (
          <>
            <span className="text-sm text-muted-foreground">Plataformas:</span>
            {value.platforms.map((platform) => (
              <Badge key={platform} variant="secondary" className="gap-1">
                {platform}
                <button
                  onClick={() => {
                    const newPlatforms = value.platforms.filter((p) => p !== platform);
                    onChange({
                      ...value,
                      platforms: newPlatforms,
                    });
                  }}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </>
        )}

        {value.searchQuery && (
          <Badge variant="secondary" className="gap-1">
            <Search className="h-3 w-3" />
            "{value.searchQuery}"
            <button 
              onClick={() => onChange({ ...value, searchQuery: undefined })} 
              className="ml-1 hover:text-destructive"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}

        {hasPendingChanges && (
          <Badge variant="outline" className="text-amber-600 border-amber-600">
            ⚠️ Filtros não aplicados
          </Badge>
        )}
      </div>
    </div>
  );
}