"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, X } from "lucide-react"
import type { Competitor } from "@/lib/types"

interface AdFiltersProps {
  competitors: Competitor[]
  onFiltersChange: (filters: FilterState) => void
  className?: string
}

export interface FilterState {
  searchTerm: string
  selectedCompetitor: string
  selectedPlatform: string
  selectedAdType: string
  dateRange: string
  tags: string[]
}

const platforms = [
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "google", label: "Google" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "tiktok", label: "TikTok" },
]

const adTypes = [
  { value: "image", label: "Imagem" },
  { value: "video", label: "Vídeo" },
  { value: "carousel", label: "Carrossel" },
  { value: "text", label: "Texto" },
]

const dateRanges = [
  { value: "7d", label: "Últimos 7 dias" },
  { value: "30d", label: "Últimos 30 dias" },
  { value: "90d", label: "Últimos 90 dias" },
  { value: "all", label: "Todo período" },
]

export function AdFilters({ competitors, onFiltersChange, className }: AdFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: "",
    selectedCompetitor: "all",
    selectedPlatform: "all",
    selectedAdType: "all",
    dateRange: "all",
    tags: [],
  })

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updated = { ...filters, ...newFilters }
    setFilters(updated)
    onFiltersChange(updated)
  }

  const clearFilters = () => {
    const clearedFilters: FilterState = {
      searchTerm: "",
      selectedCompetitor: "all",
      selectedPlatform: "all",
      selectedAdType: "all",
      dateRange: "all",
      tags: [],
    }
    setFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  const hasActiveFilters =
    filters.searchTerm !== "" ||
    filters.selectedCompetitor !== "all" ||
    filters.selectedPlatform !== "all" ||
    filters.selectedAdType !== "all" ||
    filters.dateRange !== "all" ||
    filters.tags.length > 0

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
              value={filters.searchTerm}
              onChange={(e) => updateFilters({ searchTerm: e.target.value })}
              className="pl-10"
            />
          </div>
        </div>

        {/* Filter Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Competitor */}
          <div>
            <label className="text-sm font-medium mb-2 block">Concorrente</label>
            <Select
              value={filters.selectedCompetitor}
              onValueChange={(value) => updateFilters({ selectedCompetitor: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os concorrentes</SelectItem>
                {competitors.map((competitor) => (
                  <SelectItem key={competitor.id} value={competitor.id}>
                    {competitor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Platform */}
          <div>
            <label className="text-sm font-medium mb-2 block">Plataforma</label>
            <Select
              value={filters.selectedPlatform}
              onValueChange={(value) => updateFilters({ selectedPlatform: value })}
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
            <label className="text-sm font-medium mb-2 block">Tipo de Anúncio</label>
            <Select value={filters.selectedAdType} onValueChange={(value) => updateFilters({ selectedAdType: value })}>
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

          {/* Date Range */}
          <div>
            <label className="text-sm font-medium mb-2 block">Período</label>
            <Select value={filters.dateRange} onValueChange={(value) => updateFilters({ dateRange: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Todo período" />
              </SelectTrigger>
              <SelectContent>
                {dateRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            {filters.searchTerm && (
              <Badge variant="secondary" className="gap-1">
                Busca: {filters.searchTerm}
                <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilters({ searchTerm: "" })} />
              </Badge>
            )}
            {filters.selectedCompetitor !== "all" && (
              <Badge variant="secondary" className="gap-1">
                {competitors.find((c) => c.id === filters.selectedCompetitor)?.name}
                <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilters({ selectedCompetitor: "all" })} />
              </Badge>
            )}
            {filters.selectedPlatform !== "all" && (
              <Badge variant="secondary" className="gap-1">
                {platforms.find((p) => p.value === filters.selectedPlatform)?.label}
                <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilters({ selectedPlatform: "all" })} />
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
