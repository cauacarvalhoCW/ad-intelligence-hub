"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Progress } from "@/shared/ui/progress";
import {
  TrendingUp,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle,
  Trophy,
  Star,
} from "lucide-react";

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

interface CompetitiveDashboardProps {
  analyticsData?: AnalyticsResponse | null;
  loading?: boolean;
  error?: string | null;
}

interface CompetitorScore {
  name: string;
  count: number;
  marketShare: number;
  aggressiveness: number;
  positioning: "agressivo" | "equilibrado" | "conservador";
  strategies: string[];
  score: number;
  rank: number;
}

export function CompetitiveDashboard({
  analyticsData,
  loading,
  error,
}: CompetitiveDashboardProps) {
  // Se há erro, mostrar mensagem
  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-red-500 mb-2">
            ❌ Erro ao carregar análise competitiva
          </p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  // Se está carregando, mostrar skeleton
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            Nenhum dado competitivo disponível
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calcular scores dos competidores
  const competitorScores = useMemo((): CompetitorScore[] => {
    const { metrics } = analyticsData;

    const scores = metrics.by_competitor.map((competitor, index) => {
      const marketShare = (competitor.count / metrics.total_ads) * 100;

      // Calcular agressividade baseada em market share e posição
      const aggressiveness = Math.min(100, marketShare * 2 + (5 - index) * 10);

      // Determinar posicionamento
      let positioning: "agressivo" | "equilibrado" | "conservador";
      if (aggressiveness >= 67) positioning = "agressivo";
      else if (aggressiveness >= 34) positioning = "equilibrado";
      else positioning = "conservador";

      // Estratégias baseadas no posicionamento e market share
      const strategies = [];
      if (marketShare > 25) strategies.push("liderança_mercado");
      if (aggressiveness > 70) strategies.push("preco_agressivo");
      if (competitor.count > 100) strategies.push("volume_alto");
      if (index === 0) strategies.push("market_leader");
      if (marketShare < 10) strategies.push("nicho_especializado");

      // Score geral (combinação de market share, agressividade e consistência)
      const score = Math.round(
        marketShare * 0.4 +
          aggressiveness * 0.4 +
          (competitor.count * 0.2) / 10,
      );

      return {
        name: competitor.competitor_name,
        count: competitor.count,
        marketShare,
        aggressiveness,
        positioning,
        strategies,
        score: Math.min(100, score),
        rank: index + 1,
      };
    });

    return scores.sort((a, b) => b.score - a.score);
  }, [analyticsData]);

  const topCompetitor = competitorScores[0];
  const totalAds = analyticsData.metrics.total_ads;

  return (
    <div className="space-y-6">
      {/* Header com informações gerais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Análise Competitiva - {totalAds} anúncios analisados
          </CardTitle>
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">
              Líder: {topCompetitor?.name} (
              {topCompetitor?.marketShare.toFixed(1)}%)
            </Badge>
            <Badge variant="outline">
              {competitorScores.length} competidores ativos
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Ranking de Competidores */}
      <Card>
        <CardHeader>
          <CardTitle>Ranking Competitivo</CardTitle>
          <p className="text-sm text-muted-foreground">
            Baseado em market share, agressividade e volume de anúncios
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {competitorScores.map((competitor, index) => (
              <div key={competitor.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {index === 0 && (
                        <Trophy className="h-4 w-4 text-yellow-500" />
                      )}
                      {index === 1 && (
                        <Star className="h-4 w-4 text-gray-400" />
                      )}
                      {index === 2 && (
                        <Target className="h-4 w-4 text-amber-600" />
                      )}
                      <span className="font-medium">#{competitor.rank}</span>
                    </div>
                    <div>
                      <div className="font-semibold">{competitor.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {competitor.count} anúncios •{" "}
                        {competitor.marketShare.toFixed(1)}% market share
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{competitor.score}</div>
                    <div className="text-xs text-muted-foreground">Score</div>
                  </div>
                </div>

                {/* Barra de progresso do score */}
                <Progress value={competitor.score} className="h-2" />

                {/* Badges de posicionamento e estratégias */}
                <div className="flex flex-wrap gap-1">
                  <Badge
                    variant={
                      competitor.positioning === "agressivo"
                        ? "destructive"
                        : competitor.positioning === "equilibrado"
                          ? "default"
                          : "secondary"
                    }
                    className="text-xs"
                  >
                    {competitor.positioning}
                  </Badge>
                  {competitor.strategies.slice(0, 2).map((strategy) => (
                    <Badge key={strategy} variant="outline" className="text-xs">
                      {strategy.replace(/_/g, " ")}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Análise de Agressividade */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Agressividade por Competidor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {competitorScores.map((competitor) => (
                <div key={competitor.name} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{competitor.name}</span>
                    <span className="text-muted-foreground">
                      {competitor.aggressiveness.toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={competitor.aggressiveness} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Distribuição de Posicionamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {["agressivo", "equilibrado", "conservador"].map(
                (positioning) => {
                  const count = competitorScores.filter(
                    (c) => c.positioning === positioning,
                  ).length;
                  const percentage = (count / competitorScores.length) * 100;
                  return (
                    <div key={positioning} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium capitalize">
                          {positioning}
                        </span>
                        <span className="text-muted-foreground">
                          {count} competidores ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                },
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights Estratégicos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Insights Estratégicos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Market Leader</h4>
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="font-medium text-green-800">
                  {topCompetitor?.name}
                </div>
                <div className="text-sm text-green-600">
                  {topCompetitor?.count} anúncios • Score {topCompetitor?.score}
                </div>
                <div className="text-xs text-green-500 mt-1">
                  Posicionamento: {topCompetitor?.positioning}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm">
                Competidor Mais Agressivo
              </h4>
              {(() => {
                const mostAggressive = competitorScores.reduce(
                  (prev, current) =>
                    prev.aggressiveness > current.aggressiveness
                      ? prev
                      : current,
                );
                return (
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="font-medium text-red-800">
                      {mostAggressive.name}
                    </div>
                    <div className="text-sm text-red-600">
                      Agressividade: {mostAggressive.aggressiveness.toFixed(0)}%
                    </div>
                    <div className="text-xs text-red-500 mt-1">
                      {mostAggressive.strategies.join(", ").replace(/_/g, " ")}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
