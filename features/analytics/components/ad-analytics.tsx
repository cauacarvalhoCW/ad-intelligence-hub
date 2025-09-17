"use client";

import { useMemo } from "react";
import { BarChart3, Eye, Target, TrendingUp } from "lucide-react";

import type { Ad } from "@/features/ads/types";
import type { AnalyticsResponse } from "@/features/analytics/types";
import type { Competitor } from "@/lib/types";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Progress } from "@/shared/ui/progress";

interface AdAnalyticsProps {
  ads: Ad[];
  competitors: Competitor[];
  analyticsData?: AnalyticsResponse | null;
  loading?: boolean;
  error?: string | null;
}

interface AnalyticsData {
  totalAds: number;
  platformDistribution: Record<string, number>;
  competitorDistribution: Record<string, { count: number; name: string }>;
  adTypeDistribution: Record<string, number>;
  topTags: Array<{ tag: string; count: number }>;
  rateAnalysis: {
    adsWithRates: number;
    commonRates: Array<{ rate: string; count: number }>;
  };
}

export function AdAnalytics({
  ads,
  competitors,
  analyticsData,
  loading,
  error,
}: AdAnalyticsProps) {
  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-red-500 mb-2">❌ Erro ao carregar analytics</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-8 bg-gray-200 rounded w-1/2" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  const analytics = useMemo((): AnalyticsData => {
    const platformDist: Record<string, number> = {};
    const competitorDist: Record<string, { count: number; name: string }> = {};
    const adTypeDist: Record<string, number> = {};
    const tagCount: Record<string, number> = {};
    const rateCount: Record<string, number> = {};

    let adsWithRates = 0;

    ads.forEach((ad) => {
      const platform =
        ad.source?.includes("facebook") || ad.source?.includes("meta")
          ? "Meta"
          : "Outros";
      platformDist[platform] = (platformDist[platform] || 0) + 1;

      const competitor =
        ad.competitor || competitors.find((c) => c.id === ad.competitor_id);
      if (competitor) {
        competitorDist[ad.competitor_id] = {
          count: (competitorDist[ad.competitor_id]?.count || 0) + 1,
          name: competitor.name,
        };
      }

      adTypeDist[ad.asset_type] = (adTypeDist[ad.asset_type] || 0) + 1;

      if (ad.tags) {
        ad.tags.split(/[,;]/).forEach((tag) => {
          const cleanTag = tag.trim();
          if (cleanTag) {
            tagCount[cleanTag] = (tagCount[cleanTag] || 0) + 1;
          }
        });
      }

      const textContent = `${ad.transcription || ""} ${ad.image_description || ""}`;
      const rateMatches = textContent.match(
        /\d+[,.]?\d*%|\d+[,.]?\d*\s*reais?/gi,
      );
      if (rateMatches?.length) {
        adsWithRates++;
        rateMatches.forEach((rate) => {
          rateCount[rate] = (rateCount[rate] || 0) + 1;
        });
      }
    });

    const topTags = Object.entries(tagCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));

    const commonRates = Object.entries(rateCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([rate, count]) => ({ rate, count }));

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
    };
  }, [ads, competitors]);

  const perspectiveSummary = analyticsData
    ? {
        perspective: analyticsData.applied.perspective,
        competitors: analyticsData.applied.competitors,
        platform: analyticsData.applied.platform,
        date_from: analyticsData.applied.date_from,
        date_to: analyticsData.applied.date_to,
      }
    : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Resumo Geral
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <SummaryTile
              icon={Eye}
              label="Total de anúncios"
              value={analytics.totalAds.toString()}
            />
            <SummaryTile
              icon={Target}
              label="Competidores analisados"
              value={Object.keys(analytics.competitorDistribution).length.toString()}
            />
            <SummaryTile
              icon={TrendingUp}
              label="Anúncios com taxas"
              value={`${analytics.rateAnalysis.adsWithRates}`}
            />
            <SummaryTile
              icon={BarChart3}
              label="Dados oficiais"
              value={`${analyticsData?.metrics.total_ads ?? analytics.totalAds}`}
              helper="Retornados pelo Supabase"
            />
          </div>
        </CardContent>
      </Card>

      {perspectiveSummary && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Filtros aplicados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">
                Perspectiva: {perspectiveSummary.perspective}
              </Badge>
              {perspectiveSummary.platform && (
                <Badge variant="outline">
                  Plataforma: {perspectiveSummary.platform}
                </Badge>
              )}
              {perspectiveSummary.date_from && (
                <Badge variant="outline">
                  Período: {perspectiveSummary.date_from} - {perspectiveSummary.date_to}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Distribuição por plataforma</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {Object.entries(analytics.platformDistribution).map(([platform, count]) => (
            <div key={platform} className="flex items-center gap-4">
              <div className="w-32 text-sm text-muted-foreground">{platform}</div>
              <div className="flex-1">
                <Progress value={(count / analytics.totalAds) * 100} />
              </div>
              <div className="w-12 text-right text-sm">{count}</div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Principais tags detectadas</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {analytics.topTags.map((tag) => (
            <Badge key={tag.tag} variant="secondary">
              {tag.tag} · {tag.count}
            </Badge>
          ))}
          {analytics.topTags.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nenhuma tag detectada para os filtros atuais.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Taxas e valores recorrentes</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.rateAnalysis.commonRates.length > 0 ? (
            <div className="space-y-2">
              {analytics.rateAnalysis.commonRates.map((rate) => (
                <div key={rate.rate} className="flex items-center justify-between">
                  <span className="text-sm">{rate.rate}</span>
                  <Badge variant="outline">{rate.count}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Nenhum valor recorrente detectado.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryTile({
  icon: Icon,
  label,
  value,
  helper,
}: {
  icon: typeof BarChart3;
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <Card className="border-dashed">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Icon className="h-4 w-4" />
          {label}
        </div>
        <CardTitle className="text-2xl font-semibold">{value}</CardTitle>
        {helper && <p className="text-xs text-muted-foreground">{helper}</p>}
      </CardHeader>
    </Card>
  );
}
