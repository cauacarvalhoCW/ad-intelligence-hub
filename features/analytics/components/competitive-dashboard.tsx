"use client";

import { useMemo } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";

import type { AnalyticsResponse } from "@/features/analytics/types";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Progress } from "@/shared/ui/progress";

interface CompetitiveDashboardProps {
  analyticsData?: AnalyticsResponse | null;
  loading?: boolean;
  error?: string | null;
}

export function CompetitiveDashboard({
  analyticsData,
  loading,
  error,
}: CompetitiveDashboardProps) {
  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-red-500 mb-2">❌ Erro ao carregar dados competitivos</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (loading || !analyticsData) {
    return (
      <Card>
        <CardHeader className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-8 bg-gray-200 rounded w-1/2" />
        </CardHeader>
      </Card>
    );
  }

  const competitorStats = useMemo(() => {
    const totals = analyticsData.metrics.by_competitor.reduce(
      (acc, item) => acc + item.count,
      0,
    );

    const distribution = analyticsData.metrics.by_competitor.map((item) => ({
      name: item.competitor_name,
      count: item.count,
      share: totals > 0 ? Math.round((item.count / totals) * 100) : 0,
    }));

    const topCompetitor = distribution[0];

    return {
      distribution,
      topCompetitor,
      totalCompetitors: distribution.length,
    };
  }, [analyticsData.metrics.by_competitor]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Liderança Competitiva
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {competitorStats.topCompetitor ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Top performer</p>
                <p className="text-lg font-semibold">
                  {competitorStats.topCompetitor.name}
                </p>
              </div>
              <Badge variant="secondary">
                {competitorStats.topCompetitor.share}% share
              </Badge>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Nenhum dado competitivo disponível.
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatBox
              icon={TrendingUp}
              label="Anúncios monitorados"
              value={analyticsData.metrics.total_ads}
            />
            <StatBox
              icon={Target}
              label="Competidores ativos"
              value={competitorStats.totalCompetitors}
            />
            <StatBox icon={Star} label="Tags relevantes" value={analyticsData.metrics.top_tags.length} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Participação por competidor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {competitorStats.distribution.map((item) => (
            <div key={item.name} className="flex items-center gap-4">
              <div className="w-40 text-sm text-muted-foreground">{item.name}</div>
              <div className="flex-1">
                <Progress value={item.share} />
              </div>
              <div className="w-16 text-right text-sm">{item.share}%</div>
            </div>
          ))}
          {competitorStats.distribution.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nenhum competidor encontrado com os filtros atuais.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Insights rápidos</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InsightTile
            icon={Zap}
            label="Taxas monitoradas"
            value={analyticsData.metrics.fees.length}
            helper="Categorias com comunicação ativa"
          />
          <InsightTile
            icon={AlertTriangle}
            label="Ofertas agressivas"
            value={analyticsData.metrics.offers.length}
            helper="Rendimentos acima de 30%"
          />
          <InsightTile
            icon={CheckCircle}
            label="Tags validadas"
            value={analyticsData.metrics.top_tags.length}
            helper="Utilizadas na comunicação"
          />
        </CardContent>
      </Card>
    </div>
  );
}

function StatBox({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof TrendingUp;
  label: string;
  value: number;
}) {
  return (
    <Card className="border-dashed">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Icon className="h-4 w-4" />
          {label}
        </div>
        <CardTitle className="text-2xl font-semibold">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}

function InsightTile({
  icon: Icon,
  label,
  value,
  helper,
}: {
  icon: typeof Zap;
  label: string;
  value: number;
  helper: string;
}) {
  return (
    <Card>
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Icon className="h-4 w-4" />
          {label}
        </div>
        <CardTitle className="text-xl font-semibold">{value}</CardTitle>
        <p className="text-xs text-muted-foreground">{helper}</p>
      </CardHeader>
    </Card>
  );
}
