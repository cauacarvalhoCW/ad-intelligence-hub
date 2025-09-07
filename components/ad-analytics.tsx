"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart3, TrendingUp, Target, Eye } from "lucide-react"
import type { Ad, Competitor } from "@/lib/types"

interface AdAnalyticsProps {
  ads: Ad[]
  competitors: Competitor[]
}

interface AnalyticsData {
  totalAds: number
  platformDistribution: Record<string, number>
  competitorDistribution: Record<string, { count: number; name: string }>
  adTypeDistribution: Record<string, number>
  topTags: Array<{ tag: string; count: number }>
  rateAnalysis: {
    adsWithRates: number
    commonRates: Array<{ rate: string; count: number }>
  }
}

export function AdAnalytics({ ads, competitors }: AdAnalyticsProps) {
  const analytics = useMemo((): AnalyticsData => {
    const platformDist: Record<string, number> = {}
    const competitorDist: Record<string, { count: number; name: string }> = {}
    const adTypeDist: Record<string, number> = {}
    const tagCount: Record<string, number> = {}
    const rateCount: Record<string, number> = {}

    let adsWithRates = 0

    ads.forEach((ad) => {
      // Platform distribution (usando Meta como padrão)
      const platform = ad.source?.includes('facebook') || ad.source?.includes('meta') ? 'Meta' : 'Outros'
      platformDist[platform] = (platformDist[platform] || 0) + 1

      // Competitor distribution
      const competitor = ad.competitor || competitors.find((c) => c.id === ad.competitor_id)
      if (competitor) {
        competitorDist[ad.competitor_id] = {
          count: (competitorDist[ad.competitor_id]?.count || 0) + 1,
          name: competitor.name,
        }
      }

      // Ad type distribution (usando asset_type)
      adTypeDist[ad.asset_type] = (adTypeDist[ad.asset_type] || 0) + 1

      // Tag analysis (processando string de tags)
      if (ad.tags) {
        ad.tags.split(/[,;]/).forEach((tag) => {
          const cleanTag = tag.trim()
          if (cleanTag) {
            tagCount[cleanTag] = (tagCount[cleanTag] || 0) + 1
          }
        })
      }

      // Rate analysis (extraindo de transcription e image_description)
      const textContent = `${ad.transcription || ''} ${ad.image_description || ''}`
      const rateMatches = textContent.match(/\d+[,.]?\d*%|\d+[,.]?\d*\s*reais?/gi)
      if (rateMatches && rateMatches.length > 0) {
        adsWithRates++
        rateMatches.forEach((rate) => {
          rateCount[rate] = (rateCount[rate] || 0) + 1
        })
      }
    })

    const topTags = Object.entries(tagCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }))

    const commonRates = Object.entries(rateCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([rate, count]) => ({ rate, count }))

    return {
      totalAds: ads.length,
      platformDistribution: platformDist,
      competitorDistribution: competitorDist,
      adTypeDistribution: adTypeDist,
      topTags,
      rateAnalysis: {
        adsWithRates,
        commonRates,
      },
    }
  }, [ads, competitors])

  const getPercentage = (value: number, total: number) => (total > 0 ? Math.round((value / total) * 100) : 0)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Overview Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Visão Geral
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{analytics.totalAds}</div>
            <p className="text-sm text-muted-foreground">Total de Anúncios</p>
          </div>

          <div className="text-center">
            <div className="text-2xl font-semibold text-secondary">{analytics.rateAnalysis.adsWithRates}</div>
            <p className="text-sm text-muted-foreground">Com Taxas Detectadas</p>
            <Progress value={getPercentage(analytics.rateAnalysis.adsWithRates, analytics.totalAds)} className="mt-2" />
          </div>
        </CardContent>
      </Card>

      {/* Platform Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Distribuição por Plataforma
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(analytics.platformDistribution).map(([platform, count]) => (
            <div key={platform} className="flex items-center justify-between">
              <span className="text-sm capitalize">{platform}</span>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{count}</Badge>
                <span className="text-xs text-muted-foreground">{getPercentage(count, analytics.totalAds)}%</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Competitor Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Análise de Concorrentes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(analytics.competitorDistribution).map(([id, data]) => (
            <div key={id} className="flex items-center justify-between">
              <span className="text-sm">{data.name}</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{data.count}</Badge>
                <span className="text-xs text-muted-foreground">{getPercentage(data.count, analytics.totalAds)}%</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Top Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Tags Mais Frequentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {analytics.topTags.map(({ tag, count }) => (
              <Badge key={tag} variant="secondary" className="gap-1">
                {tag}
                <span className="text-xs opacity-70">({count})</span>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rate Analysis */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Análise de Taxas Mais Comuns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {analytics.rateAnalysis.commonRates.map(({ rate, count }) => (
              <div key={rate} className="text-center p-3 bg-muted rounded-lg">
                <div className="font-semibold text-sm">{rate}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {count} anúncios ({getPercentage(count, analytics.totalAds)}%)
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
