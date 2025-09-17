"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Progress } from "@/shared/ui/progress";
import { BarChart3, TrendingUp, Target, Eye, Users, Tag } from "lucide-react";

interface AnalyticsResponse {
  applied: {
    perspective: string;
    competitors: string[];
    platform?: string;
    ad_types: string[];
    date_from?: string;
    date_to?: string;
    q?: string;
  };
  metrics: {
    total_ads: number;
    by_competitor: Array<{ competitor_name: string; count: number }>;
    by_asset_type: Array<{ asset_type: string; count: number }>;
    weekly: Array<{ week_start: string; total: number }>;
    top_tags: Array<{ tag: string; count: number }>;
    fees: Array<{
      label: string;
      ads_com_taxa: number;
      matches: number;
      min: number;
      median: number;
      max: number;
    }>;
    offers: Array<{
      label: string;
      ads_com_taxa: number;
      matches: number;
      min: number;
      median: number;
      max: number;
    }>;
    platform: Array<{ label: string; value: number }>;
  };
  base_ads_count: number;
}

interface AnalyticsDashboardProps {
  analyticsData?: AnalyticsResponse | null;
  loading?: boolean;
  error?: string | null;
}

export function AnalyticsDashboard({
  analyticsData,
  loading,
  error,
}: AnalyticsDashboardProps) {
  // Se há erro, mostrar mensagem
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

  // Se está carregando, mostrar skeleton
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">
            Nenhum dado de analytics disponível
          </p>
        </CardContent>
      </Card>
    );
  }

  const { metrics } = analyticsData;

  return (
    <div className="space-y-6">
      {/* Header com informações do filtro aplicado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analytics - {metrics.total_ads} anúncios filtrados
          </CardTitle>
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">
              Perspectiva: {analyticsData.applied.perspective}
            </Badge>
            {analyticsData.applied.platform && (
              <Badge variant="outline">
                Plataforma: {analyticsData.applied.platform}
              </Badge>
            )}
            {analyticsData.applied.date_from && (
              <Badge variant="outline">
                Período: {analyticsData.applied.date_from} -{" "}
                {analyticsData.applied.date_to}
              </Badge>
            )}
            {analyticsData.applied.q && (
              <Badge variant="outline">
                Busca: "{analyticsData.applied.q}"
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Cards principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total de Anúncios */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Anúncios
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.total_ads.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Conjunto filtrado completo
            </p>
          </CardContent>
        </Card>

        {/* Competidores Ativos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Competidores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.by_competitor.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Competidores com anúncios
            </p>
          </CardContent>
        </Card>

        {/* Tipos de Anúncio */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tipos de Mídia
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.by_asset_type.length}
            </div>
            <div className="space-y-1">
              {metrics.by_asset_type.map((type) => (
                <div
                  key={type.asset_type}
                  className="flex justify-between text-xs"
                >
                  <span className="capitalize">{type.asset_type}</span>
                  <span>{type.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tags Principais */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tags Principais
            </CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.top_tags.length}</div>
            <div className="space-y-1 max-h-20 overflow-y-auto">
              {metrics.top_tags.slice(0, 3).map((tag) => (
                <div key={tag.tag} className="flex justify-between text-xs">
                  <span>{tag.tag}</span>
                  <span>{tag.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribuição por Competidor */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Competidor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.by_competitor.map((competitor) => {
              const percentage = (competitor.count / metrics.total_ads) * 100;
              return (
                <div key={competitor.competitor_name} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">
                      {competitor.competitor_name}
                    </span>
                    <span className="text-muted-foreground">
                      {competitor.count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Plataformas */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Plataforma</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.platform.map((platform) => {
              const percentage = (platform.value / metrics.total_ads) * 100;
              return (
                <div key={platform.label} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{platform.label}</span>
                    <span className="text-muted-foreground">
                      {platform.value} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Fees (Taxas de Transação) */}
      {metrics.fees.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Taxas de Transação (Fees)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.fees.map((fee) => (
                <div key={fee.label} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium capitalize">{fee.label}</span>
                    <span className="text-muted-foreground">
                      {fee.ads_com_taxa} anúncios
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Min: {fee.min}%</span>
                    <span>Mediana: {fee.median}%</span>
                    <span>Max: {fee.max}%</span>
                  </div>
                  <div className="text-xs">
                    {fee.matches} menções encontradas
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Offers (Rendimento/Cashback) */}
      {metrics.offers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ofertas de Rendimento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.offers.map((offer) => (
                <div key={offer.label} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium capitalize">
                      {offer.label}
                    </span>
                    <span className="text-muted-foreground">
                      {offer.ads_com_taxa} anúncios
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Min: {offer.min}%</span>
                    <span>Mediana: {offer.median}%</span>
                    <span>Max: {offer.max}%</span>
                  </div>
                  <div className="text-xs">
                    {offer.matches} menções encontradas
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tags Detalhadas */}
      {metrics.top_tags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tags Mais Frequentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {metrics.top_tags.slice(0, 12).map((tag) => (
                <Badge
                  key={tag.tag}
                  variant="secondary"
                  className="justify-between"
                >
                  <span>{tag.tag}</span>
                  <span className="ml-2 text-xs">{tag.count}</span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
