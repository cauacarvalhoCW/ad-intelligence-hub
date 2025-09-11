"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
} from "recharts";
import { TrendingUp, Calendar, Activity, Percent } from "lucide-react";
import type { Ad } from "@/lib/types";

interface TrendAnalysisProps {
  ads: Ad[];
}

interface TrendData {
  date: string;
  count: number;
  rateAds: number;
  platforms: Record<string, number>;
}

interface RateTrend {
  rate: string;
  frequency: number;
  trend: "up" | "down" | "stable";
  change: number;
}

export function TrendAnalysis({ ads }: TrendAnalysisProps) {
  const { timelineTrends, rateTrends, platformTrends } = useMemo(() => {
    // Group ads by week for timeline analysis
    const weeklyData: Record<string, TrendData> = {};
    const rateFrequency: Record<string, number[]> = {};
    const platformData: Record<string, number[]> = {};

    ads.forEach((ad) => {
      const date = ad.start_date
        ? new Date(ad.start_date)
        : new Date(ad.created_at);
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
        };
      }

      weeklyData[weekKey].count += 1;

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

    const timelineTrends = Object.values(weeklyData)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-8); // Last 8 weeks

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
        avgPerWeek: Math.round(timestamps.length / 8),
      }))
      .sort((a, b) => b.count - a.count);

    return { timelineTrends, rateTrends, platformTrends };
  }, [ads]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Tendência Temporal (8 semanas)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={timelineTrends}>
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
                    value,
                    name === "count" ? "Total Anúncios" : "Com Taxas",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#8884d8"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="rateAds"
                  stroke="#82ca9d"
                  strokeWidth={2}
                />
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
                {Math.round(
                  timelineTrends.reduce((acc, week) => acc + week.count, 0) /
                    timelineTrends.length,
                )}
              </div>
              <p className="text-sm text-muted-foreground">Anúncios/semana</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-secondary">
                {Math.round(
                  timelineTrends.reduce((acc, week) => acc + week.rateAds, 0) /
                    timelineTrends.length,
                )}
              </div>
              <p className="text-sm text-muted-foreground">Com taxas/semana</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-accent">
                {rateTrends.filter((r) => r.trend === "up").length}
              </div>
              <p className="text-sm text-muted-foreground">Taxas em alta</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-muted-foreground">
                {platformTrends[0]?.platform || "N/A"}
              </div>
              <p className="text-sm text-muted-foreground">Plataforma líder</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
