"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExternalLink, BarChart3, TrendingUp, Target, Eye, MousePointer } from "lucide-react"
import { mockAds, mockCompetitors } from "@/lib/mock-data"
import { AdFilters, type FilterState } from "@/components/ad-filters"
import { AdAnalytics } from "@/components/ad-analytics"
import { CompetitiveAnalysis } from "@/components/competitive-analysis"
import { TrendAnalysis } from "@/components/trend-analysis"
import { RateExtractor } from "@/components/rate-extractor"
import { AdCard } from "@/components/ads/AdCard"
import { useFilteredAds, useThemeStats } from "@/hooks/useFilteredAds"
import type { Ad } from "@/lib/types"

export function AdDashboard() {
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: "",
    selectedCompetitor: "all",
    selectedPlatform: "all",
    selectedAdType: "all",
    dateRange: "all",
    tags: [],
  })

  const [selectedAd, setSelectedAd] = useState<Ad | null>(null)
  
  // Usar ads filtrados por tema
  const themeFilteredAds = useFilteredAds()
  const themeStats = useThemeStats()

  const filteredAds = useMemo(() => {
    return themeFilteredAds.filter((ad) => {
      const matchesSearch =
        ad.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        ad.description.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        ad.extracted_text?.toLowerCase().includes(filters.searchTerm.toLowerCase())

      const matchesCompetitor = filters.selectedCompetitor === "all" || ad.competitor_id === filters.selectedCompetitor
      const matchesPlatform = filters.selectedPlatform === "all" || ad.platform === filters.selectedPlatform
      const matchesAdType = filters.selectedAdType === "all" || ad.ad_type === filters.selectedAdType

      return matchesSearch && matchesCompetitor && matchesPlatform && matchesAdType
    })
  }, [themeFilteredAds, filters])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{themeStats.themeName} - Dashboard</h2>
          <p className="text-muted-foreground">{themeStats.themeDescription}</p>
          <div className="flex items-center gap-4 mt-2">
            <Badge variant="secondary">
              {themeStats.totalAds} anúncios
            </Badge>
            <Badge variant="outline">
              {themeStats.competitorsCount} competidores
            </Badge>
          </div>
        </div>
      </div>

      <AdFilters competitors={mockCompetitors} onFiltersChange={setFilters} />

      <Tabs defaultValue="ads" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ads">Anúncios ({filteredAds.length})</TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="competitive">
            <Target className="h-4 w-4 mr-2" />
            Competitivo
          </TabsTrigger>
          <TabsTrigger value="trends">
            <TrendingUp className="h-4 w-4 mr-2" />
            Tendências
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ads" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAds.map((ad) => (
              <AdCard 
                key={ad.id} 
                ad={ad} 
                onClick={() => setSelectedAd(ad)} 
                isSelected={selectedAd?.id === ad.id} 
              />
            ))}
          </div>

          {filteredAds.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">Nenhum anúncio encontrado com os filtros aplicados.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics">
          <AdAnalytics ads={filteredAds} competitors={mockCompetitors} />
        </TabsContent>

        <TabsContent value="competitive">
          <CompetitiveAnalysis
            ads={filteredAds}
            competitors={mockCompetitors}
            selectedCompetitor={filters.selectedCompetitor !== "all" ? filters.selectedCompetitor : undefined}
          />
        </TabsContent>

        <TabsContent value="trends">
          <TrendAnalysis ads={filteredAds} />
        </TabsContent>
      </Tabs>

      {selectedAd && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedAd(null)}
        >
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl">{selectedAd.title}</CardTitle>
                  <p className="text-muted-foreground mt-2">
                    {selectedAd.competitor?.name} • {selectedAd.platform} •{" "}
                    {new Date(selectedAd.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedAd(null)}>
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">Descrição Completa</h4>
                <p className="text-sm">{selectedAd.description}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Análise de Taxas</h4>
                <RateExtractor text={selectedAd.description} title={selectedAd.title} />
              </div>

              {selectedAd.extracted_text && (
                <div>
                  <h4 className="font-semibold mb-2">Texto Extraído</h4>
                  <p className="text-sm bg-muted p-3 rounded">{selectedAd.extracted_text}</p>
                </div>
              )}

              <div>
                <h4 className="font-semibold mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedAd.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {selectedAd.landing_page_url && (
                <Button className="w-full" asChild>
                  <a href={selectedAd.landing_page_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ver Landing Page
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}


