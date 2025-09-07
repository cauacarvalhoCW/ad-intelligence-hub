"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExternalLink, BarChart3, TrendingUp, Target } from "lucide-react"
import { AdFilters, type FilterState } from "@/components/ad-filters"
import { AdAnalytics } from "@/components/ad-analytics"
import { CompetitiveAnalysis } from "@/components/competitive-analysis"
import { TrendAnalysis } from "@/components/trend-analysis"
import { RateExtractor } from "@/components/rate-extractor"
import { AdCard } from "@/components/ads/AdCard"
import { useAds } from "@/hooks/useAds"
import { useCompetitors } from "@/hooks/useCompetitors"
import { useTheme } from "@/components/theme-provider"
import type { Ad } from "@/lib/types"

// Função para formatar e limpar o ad_analysis
function formatAdAnalysis(analysis: string | any): React.ReactElement {
  // Se for objeto, converter para string
  let text = typeof analysis === 'string' ? analysis : JSON.stringify(analysis, null, 2)
  
  // Limpar formatação Markdown básica
  text = text
    // Remover asteriscos duplos (negrito)
    .replace(/\*\*(.*?)\*\*/g, '$1')
    // Remover asteriscos simples (itálico)
    .replace(/\*(.*?)\*/g, '$1')
    // Converter quebras de linha \n em <br>
    .replace(/\\n/g, '\n')
    // Limpar espaços extras
    .replace(/\s+/g, ' ')
    .trim()

  // Dividir em seções por números (1., 2., etc.)
  const sections = text.split(/(?=\d+\.\s)/).filter(Boolean)
  
  return (
    <div className="space-y-4">
      {sections.map((section, index) => {
        const lines = section.split('\n').filter(Boolean)
        const title = lines[0]?.replace(/^\d+\.\s*/, '').replace(/\*\*/g, '').trim()
        const content = lines.slice(1).join('\n').trim()
        
        return (
          <div key={index} className="space-y-2">
            {title && (
              <h5 className="font-medium text-primary">
                {index + 1}. {title}
              </h5>
            )}
            {content && (
              <div className="text-sm text-muted-foreground leading-relaxed">
                {content.split('\n').map((line, lineIndex) => {
                  const cleanLine = line.replace(/^\s*-\s*/, '• ').trim()
                  if (!cleanLine) return null
                  
                  return (
                    <p key={lineIndex} className="mb-1">
                      {cleanLine}
                    </p>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

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
  
  // Usar dados reais do Supabase
  const { currentTheme } = useTheme()
  const { ads, loading: adsLoading, error: adsError } = useAds({
    perspective: currentTheme as any,
    limit: 50
  })
  const { competitors, loading: competitorsLoading } = useCompetitors()

  const filteredAds = useMemo(() => {
    return ads.filter((ad) => {
      const searchText = filters.searchTerm.toLowerCase()
      const matchesSearch = !searchText || 
        ad.product?.toLowerCase().includes(searchText) ||
        ad.transcription?.toLowerCase().includes(searchText) ||
        ad.image_description?.toLowerCase().includes(searchText) ||
        ad.tags?.toLowerCase().includes(searchText)

      const matchesCompetitor = filters.selectedCompetitor === "all" || ad.competitor_id === filters.selectedCompetitor
      const matchesAssetType = filters.selectedAdType === "all" || ad.asset_type === filters.selectedAdType

      return matchesSearch && matchesCompetitor && matchesAssetType
    })
  }, [ads, filters])

  // Loading state
  if (adsLoading || competitorsLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando anúncios...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (adsError) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-red-500 mb-2">❌ Erro ao carregar anúncios</p>
            <p className="text-sm text-muted-foreground">{adsError}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Dashboard de Anúncios</h2>
          <p className="text-muted-foreground">Análise de anúncios de concorrentes em tempo real</p>
          <div className="flex items-center gap-4 mt-2">
            <Badge variant="secondary">
              {ads.length} anúncios
            </Badge>
            <Badge variant="outline">
              {competitors.length} competidores
            </Badge>
            <Badge variant="outline">
              Tema: {currentTheme}
            </Badge>
          </div>
        </div>
      </div>

      <AdFilters competitors={competitors} onFiltersChange={setFilters} />

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
                key={ad.ad_id} 
                ad={ad} 
                onClick={() => setSelectedAd(ad)} 
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
          <AdAnalytics ads={filteredAds} competitors={competitors} />
        </TabsContent>

        <TabsContent value="competitive">
          <CompetitiveAnalysis
            ads={filteredAds}
            competitors={competitors}
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
                  <CardTitle className="text-xl">{selectedAd.product || 'Anúncio'}</CardTitle>
                  <p className="text-muted-foreground mt-2">
                    {selectedAd.competitor?.name} • {selectedAd.asset_type} •{" "}
                    {selectedAd.start_date ? new Date(selectedAd.start_date).toLocaleDateString("pt-BR") : 'Data não disponível'}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedAd(null)}>
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Imagem/Vídeo Completo */}
              {selectedAd.source && (
                <div>
                  <h4 className="font-semibold mb-2">Mídia Original</h4>
                  <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                    {selectedAd.asset_type === 'video' && selectedAd.source.includes('.mp4') ? (
                      <video
                        controls
                        className="w-full max-h-96 object-contain"
                        poster="/placeholder.jpg"
                      >
                        <source src={selectedAd.source} type="video/mp4" />
                        Seu navegador não suporta vídeo.
                      </video>
                    ) : selectedAd.asset_type === 'image' && (selectedAd.source.includes('.jpg') || selectedAd.source.includes('.png') || selectedAd.source.includes('.jpeg')) ? (
                      <img
                        src={selectedAd.source}
                        alt={selectedAd.product || 'Anúncio'}
                        className="w-full max-h-96 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="w-full h-48 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <div className="text-center">
                          <p className="text-sm text-gray-500">
                            Mídia não disponível para visualização
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Use o botão abaixo para ver na Meta Ads Library
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Ad Analysis - Análise Completa */}
              {selectedAd.ad_analysis && (
                <div>
                  <h4 className="font-semibold mb-2">📊 Análise do Anúncio</h4>
                  <div className="bg-primary/5 dark:bg-primary/10 p-4 rounded-lg border-l-4 border-primary">
                    <div className="prose prose-sm max-w-none">
                      {formatAdAnalysis(selectedAd.ad_analysis)}
                    </div>
                  </div>
                </div>
              )}

              {selectedAd.transcription && (
                <div>
                  <h4 className="font-semibold mb-2">Transcrição</h4>
                  <p className="text-sm bg-muted p-3 rounded">{selectedAd.transcription}</p>
                </div>
              )}

              {selectedAd.image_description && (
                <div>
                  <h4 className="font-semibold mb-2">Descrição da Imagem</h4>
                  <p className="text-sm">{selectedAd.image_description}</p>
                </div>
              )}

              <div>
                <h4 className="font-semibold mb-2">Análise de Taxas</h4>
                <RateExtractor 
                  text={`${selectedAd.transcription || ''} ${selectedAd.image_description || ''}`} 
                  title={selectedAd.product || ''} 
                />
              </div>

              {selectedAd.tags && (
                <div>
                  <h4 className="font-semibold mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedAd.tags.split(/[,;]/).map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Button className="w-full" asChild>
                <a 
                  href={`https://www.facebook.com/ads/library/?id=${selectedAd.ad_id}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ver na Meta Ads Library
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}



