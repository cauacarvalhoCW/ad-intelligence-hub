"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useMetrics } from "../hooks";
import type { Perspective } from "@/lib/utils/url-params";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { TrendingUp, TrendingDown, DollarSign, Eye, MousePointer, Users, Zap, ArrowUpRight } from "lucide-react";
import { TimeSeriesChart, PlatformBarChart, ProductPieChart, ConversionFunnelChart } from "./charts";
import { PerformanceFilters } from "./PerformanceFilters";

export function PerformanceDashboard() {
  const params = useParams();
  const searchParams = useSearchParams();
  
  const perspective = (params.perspectiva || 'default') as Perspective;
  const platform = searchParams.get('platform') as 'meta' | 'google' | 'tiktok' | null;
  const dateFrom = searchParams.get('dateFrom') || undefined;
  const dateTo = searchParams.get('dateTo') || undefined;

  const { data, isLoading, error } = useMetrics({
    perspective,
    platform: platform || undefined,
    dateFrom,
    dateTo,
  });

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Erro ao carregar dados de performance: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <Alert>
        <AlertDescription>Nenhum dado disponível para o período selecionado.</AlertDescription>
      </Alert>
    );
  }

  const { metrics } = data;

  const kpiCards = [
    {
      title: "CAC",
      description: "Custo de Aquisição",
      value: `R$ ${metrics.cac.toFixed(2)}`,
      icon: DollarSign,
      trend: metrics.cac < 50 ? 'up' : 'down', // Exemplo de lógica
    },
    {
      title: "CPM",
      description: "Custo por Mil",
      value: `R$ ${metrics.cpm.toFixed(2)}`,
      icon: Eye,
      trend: metrics.cpm < 20 ? 'up' : 'down',
    },
    {
      title: "CTR",
      description: "Taxa de Cliques",
      value: `${metrics.ctr.toFixed(2)}%`,
      icon: MousePointer,
      trend: metrics.ctr > 2 ? 'up' : 'down',
    },
    {
      title: "Hook Rate",
      description: "Taxa de Retenção (3s)",
      value: `${metrics.hookRate.toFixed(2)}%`,
      icon: Zap,
      trend: metrics.hookRate > 25 ? 'up' : 'down',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard de Performance</h1>
        <p className="text-muted-foreground mt-1">
          Visão geral das métricas de marketing e conversão
        </p>
      </div>

      {/* Filtros */}
      <PerformanceFilters />

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          const TrendIcon = kpi.trend === 'up' ? TrendingUp : TrendingDown;
          const trendColor = kpi.trend === 'up' ? 'text-green-600' : 'text-red-600';

          return (
            <Card key={kpi.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {kpi.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendIcon className={`h-3 w-3 ${trendColor}`} />
                  <span>{kpi.description}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Métricas Adicionais */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total de Impressões</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.totalImpressions.toLocaleString('pt-BR')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total de Signups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.totalSignups.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Taxa: {metrics.signupRate.toFixed(2)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total de Ativações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.totalActivations.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Taxa: {metrics.activationRate.toFixed(2)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribuição de Custo */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Custo por Plataforma</CardTitle>
            <CardDescription>Distribuição de investimento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.costByPlatform.map((item) => (
                <div key={item.platform} className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">{item.platform}</span>
                  <span className="text-sm text-muted-foreground">
                    R$ {item.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Custo por Produto</CardTitle>
            <CardDescription>Investimento por linha</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.costByProduct.map((item) => (
                <div key={item.product} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.product}</span>
                  <span className="text-sm text-muted-foreground">
                    R$ {item.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <TimeSeriesChart data={data.timeSeriesData} />

      <div className="grid gap-4 md:grid-cols-2">
        <PlatformBarChart data={data.costByPlatform} />
        <ProductPieChart data={data.costByProduct} />
      </div>

      <ConversionFunnelChart metrics={metrics} />
    </div>
  );
}

