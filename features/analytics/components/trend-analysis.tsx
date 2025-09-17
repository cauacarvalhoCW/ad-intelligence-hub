"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { TrendingUp, Calendar, Activity, Percent } from "lucide-react";
import type { Ad } from "@/features/ads/types";
import { themes } from "@/lib/themes";

interface TrendAnalysisProps {
  ads: Ad[];
  currentTheme?: string;
}

interface TrendData {
  date: string;
  count: number;
  rateAds: number;
  platforms: Record<string, number>;
  competitors: Record<string, number>; // Adicionar dados por competidor
}

interface RateTrend {
  rate: string;
  frequency: number;
  trend: "up" | "down" | "stable";
  change: number;
}

export function TrendAnalysis({ ads, currentTheme = "default" }: TrendAnalysisProps) {
  const { timelineTrends, chartData, allCompetitors, rateTrends, platformTrends, weeklyMetrics } = useMemo(() => {
    // Group ads by week for timeline analysis
    const weeklyData: Record<string, TrendData> = {};
    const rateFrequency: Record<string, number[]> = {};
    const platformData: Record<string, number[]> = {};

    ads.forEach((ad) => {
      // Usar APENAS start_date (anúncios válidos já têm start_date obrigatório)
      if (!ad.start_date) return; // Skip se não tiver start_date
      
      const date = new Date(ad.start_date);
      const weekStart = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() - date.getDay(),
      );
      const weekKey = weekStart.toISOString().split("T")[0];

      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = {
          date: weekKey,
          count: 0,
          rateAds: 0,
          platforms: {},
          competitors: {}, // Inicializar dados por competidor
        };
      }

      weeklyData[weekKey].count += 1;

      // Contar por competidor
      const competitorName = ad.competitors?.name || "Outros";
      weeklyData[weekKey].competitors[competitorName] = 
        (weeklyData[weekKey].competitors[competitorName] || 0) + 1;

      // Platform baseado no source
      const platform =
        ad.source?.includes("facebook") || ad.source?.includes("meta")
          ? "Meta"
          : "Outros";
      weeklyData[weekKey].platforms[platform] =
        (weeklyData[weekKey].platforms[platform] || 0) + 1;

      // Extrair taxas do conteúdo
      const textContent = `${ad.transcription || ""} ${ad.image_description || ""}`;
      const rateMatches = textContent.match(
        /\d+[,.]?\d*%|\d+[,.]?\d*\s*reais?/gi,
      );

      if (rateMatches && rateMatches.length > 0) {
        weeklyData[weekKey].rateAds += 1;

        rateMatches.forEach((rate) => {
          if (!rateFrequency[rate]) rateFrequency[rate] = [];
          rateFrequency[rate].push(date.getTime());
        });
      }

      if (!platformData[platform]) platformData[platform] = [];
      platformData[platform].push(date.getTime());
    });

    // Garantir que temos dados suficientes para mostrar uma linha
    const allWeeks = Object.values(weeklyData)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Debug detalhado para verificar dados reais
    console.log("📊 DADOS REAIS DOS ANÚNCIOS:", {
      totalAds: ads.length,
      totalWeeks: allWeeks.length,
      dadosPorSemana: allWeeks.map(w => ({
        semana: w.date,
        total: w.count,
        competidores: Object.keys(w.competitors).length,
        detalhes: w.competitors
      })),
      competidoresUnicos: Array.from(new Set(ads.map(ad => ad.competitors?.name).filter(Boolean))),
      datasUnicas: Array.from(new Set(ads.map(ad => ad.start_date).filter(Boolean))).sort()
    });
    
    // Se temos poucas semanas, criar semanas vazias para completar 12
    const now = new Date();
    const last12Weeks = [];
    
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7) - now.getDay());
      const weekKey = weekStart.toISOString().split("T")[0];
      
      const existingWeek = weeklyData[weekKey];
      if (existingWeek) {
        last12Weeks.push(existingWeek);
      } else {
        // Criar semana vazia
        last12Weeks.push({
          date: weekKey,
          count: 0,
          rateAds: 0,
          platforms: {},
          competitors: {}
        });
      }
    }
    
    const timelineTrends = last12Weeks;

    // Obter TODOS os competidores da perspectiva atual (não apenas os que têm anúncios)
    const themeConfig = themes[currentTheme as keyof typeof themes];
    const allCompetitors = themeConfig?.metadata?.competitorScope || 
      Array.from(new Set(ads.map(ad => ad.competitors?.name).filter(Boolean)));
    
    console.log("🎯 COMPETIDORES DA PERSPECTIVA:", {
      tema: currentTheme,
      competidoresEsperados: allCompetitors,
      competidoresComAnuncios: Array.from(new Set(ads.map(ad => ad.competitors?.name).filter(Boolean)))
    });

    // Processar dados para o gráfico com uma linha por competidor
    const chartData = timelineTrends.map(week => {
      const weekData: any = {
        date: week.date,
        total: week.count
      };
      
      // Adicionar dados de cada competidor para esta semana
      allCompetitors.forEach(competitor => {
        weekData[competitor] = week.competitors[competitor] || 0;
      });
      
      return weekData;
    });

    // Calculate rate trends
    const rateTrends: RateTrend[] = Object.entries(rateFrequency)
      .map(([rate, timestamps]) => {
        const sortedTimes = timestamps.sort((a, b) => a - b);
        const midPoint = Math.floor(sortedTimes.length / 2);
        const firstHalf = sortedTimes.slice(0, midPoint).length;
        const secondHalf = sortedTimes.slice(midPoint).length;

        let trend: RateTrend["trend"] = "stable";
        let change = 0;

        if (secondHalf > firstHalf * 1.2) {
          trend = "up";
          change = Math.round(((secondHalf - firstHalf) / firstHalf) * 100);
        } else if (firstHalf > secondHalf * 1.2) {
          trend = "down";
          change = Math.round(((firstHalf - secondHalf) / secondHalf) * 100);
        }

        return {
          rate,
          frequency: timestamps.length,
          trend,
          change: Math.abs(change),
        };
      })
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);

    // Platform trends
    const platformTrends = Object.entries(platformData)
      .map(([platform, timestamps]) => ({
        platform,
        count: timestamps.length,
        avgPerWeek: Math.round(timestamps.length / Math.max(timelineTrends.length, 1)),
      }))
      .sort((a, b) => b.count - a.count);

    // Calcular métricas reais para o resumo semanal
    const totalAdsInPeriod = timelineTrends.reduce((acc, week) => acc + week.count, 0);
    const totalRateAdsInPeriod = timelineTrends.reduce((acc, week) => acc + week.rateAds, 0);
    const avgAdsPerWeek = Math.round(totalAdsInPeriod / Math.max(timelineTrends.length, 1));
    const avgRateAdsPerWeek = Math.round(totalRateAdsInPeriod / Math.max(timelineTrends.length, 1));
    const ratesInUpTrend = rateTrends.filter((r) => r.trend === "up").length;
    const leadingPlatform = platformTrends[0]?.platform || "Meta";

    return { 
      timelineTrends, 
      chartData,
      allCompetitors,
      rateTrends, 
      platformTrends,
      weeklyMetrics: {
        avgAdsPerWeek,
        avgRateAdsPerWeek,
        ratesInUpTrend,
        leadingPlatform
      }
    };
  }, [ads]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Tendência Temporal (12 semanas)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString("pt-BR", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("pt-BR")
                  }
                  formatter={(value, name) => [
                    `${value} anúncios`,
                    name === "total" ? "Total Anúncios" : name,
                  ]}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  formatter={(value) => `${value}`}
                />
                {/* Linha para cada competidor */}
                {allCompetitors.map((competitor, index) => {
                  const colors = [
                    "#8884d8", "#82ca9d", "#ffc658", "#ff7c7c", 
                    "#8dd1e1", "#d084d0", "#ffb347", "#87ceeb"
                  ];
                  return (
                    <Line
                      key={competitor}
                      name={competitor} // Nome para a legenda
                      type="monotone"
                      dataKey={competitor}
                      stroke={colors[index % colors.length]}
                      strokeWidth={2}
                      dot={{ fill: colors[index % colors.length], strokeWidth: 1, r: 3 }}
                      activeDot={{ r: 5, stroke: colors[index % colors.length], strokeWidth: 2 }}
                      connectNulls={true}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Platform Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Distribuição por Plataforma
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={platformTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="platform" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Rate Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5" />
            Tendências de Taxas e Ofertas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rateTrends.map((rateTrend) => (
              <div key={rateTrend.rate} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{rateTrend.rate}</span>
                  <Badge
                    variant={
                      rateTrend.trend === "up"
                        ? "default"
                        : rateTrend.trend === "down"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {rateTrend.trend === "up"
                      ? "↗"
                      : rateTrend.trend === "down"
                        ? "↘"
                        : "→"}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    {rateTrend.frequency} ocorrências
                  </p>
                  {rateTrend.change > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {rateTrend.trend === "up" ? "Crescimento" : "Queda"} de{" "}
                      {rateTrend.change}%
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Resumo Semanal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {weeklyMetrics.avgAdsPerWeek}
              </div>
              <p className="text-sm text-muted-foreground">Anúncios/semana</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-secondary">
                {weeklyMetrics.avgRateAdsPerWeek}
              </div>
              <p className="text-sm text-muted-foreground">Com taxas/semana</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-accent">
                {weeklyMetrics.ratesInUpTrend}
              </div>
              <p className="text-sm text-muted-foreground">Taxas em alta</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-muted-foreground">
                {weeklyMetrics.leadingPlatform}
              </div>
              <p className="text-sm text-muted-foreground">Plataforma líder</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
