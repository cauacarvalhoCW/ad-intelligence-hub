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
import { Filter, Search, X } from "lucide-react";
import { DateRangePicker } from "./DateRangePicker";
import type { Platform, RangePreset, DateRangeFilter } from "../types";

interface PerfFiltersProps {
  onFiltersChange?: (filters: {
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

export function PerfFilters({ onFiltersChange }: PerfFiltersProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([...PLATFORMS]);
  const [selectedRange, setSelectedRange] = useState<RangePreset>("7d");
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>();
  const [searchQuery, setSearchQuery] = useState("");

  // Notify parent when filters change
  useEffect(() => {
    const dateRange = customDateRange?.from && customDateRange?.to
      ? { from: customDateRange.from, to: customDateRange.to }
      : undefined;

    onFiltersChange?.({
      platforms: selectedPlatforms,
      range: selectedRange,
      dateRange,
      searchQuery: searchQuery.trim() || undefined,
    });
  }, [selectedPlatforms, selectedRange, customDateRange, searchQuery, onFiltersChange]);

  const togglePlatform = (platform: Platform) => {
    setSelectedPlatforms((prev) => {
      if (prev.includes(platform)) {
        return prev.filter((p) => p !== platform);
      } else {
        return [...prev, platform];
      }
    });
  };

  const handleRangeChange = (range: RangePreset) => {
    setSelectedRange(range);
    if (range !== "custom") {
      setCustomDateRange(undefined);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

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
              {selectedPlatforms.length > 0 && selectedPlatforms.length < PLATFORMS.length && (
                <Badge variant="secondary" className="ml-1">
                  {selectedPlatforms.length}
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
                checked={selectedPlatforms.includes(platform)}
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
              variant={selectedRange === range.value ? "default" : "outline"}
              size="sm"
              onClick={() => handleRangeChange(range.value)}
            >
              {range.label}
            </Button>
          ))}
        </div>

        {/* Custom Date Range */}
        <DateRangePicker
          value={customDateRange}
          onChange={(range) => {
            setCustomDateRange(range);
            if (range?.from && range?.to) {
              setSelectedRange("custom");
            }
          }}
        />

        {/* Search by Name */}
        <div className="relative flex-1 min-w-[250px] max-w-[400px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por campanha ou anúncio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchQuery && (
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
      </div>

      {/* Active Filters Display */}
      <div className="flex flex-wrap items-center gap-2">
        {selectedPlatforms.length > 0 && selectedPlatforms.length < PLATFORMS.length && (
          <>
            <span className="text-sm text-muted-foreground">Plataformas:</span>
            {selectedPlatforms.map((platform) => (
              <Badge key={platform} variant="secondary" className="gap-1">
                {platform}
                <button
                  onClick={() => togglePlatform(platform)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </>
        )}

        {searchQuery && (
          <Badge variant="secondary" className="gap-1">
            <Search className="h-3 w-3" />
            "{searchQuery}"
            <button onClick={clearSearch} className="ml-1 hover:text-destructive">
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}
      </div>
    </div>
  );
}
