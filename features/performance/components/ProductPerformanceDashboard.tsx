"use client";

import { useSearchParams } from "next/navigation";
import { useMetrics } from "../hooks";
import type { Perspective } from "@/lib/utils/url-params";
import type { ProductType } from "../types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Badge } from "@/shared/ui/badge";
import { DollarSign, Eye, MousePointer, Users, Zap, TrendingUp } from "lucide-react";
import { TimeSeriesChart, PlatformBarChart, ConversionFunnelChart } from "./charts";
import { PerformanceFilters } from "./PerformanceFilters";

interface ProductPerformanceDashboardProps {
  perspective: string;
  product: ProductType;
}

export function ProductPerformanceDashboard({
  perspective,
  product,
}: ProductPerformanceDashboardProps) {
  const searchParams = useSearchParams();
  
  const platform = searchParams.get('platform') as 'meta' | 'google' | 'tiktok' | null;
  const dateFrom = searchParams.get('dateFrom') || undefined;
  const dateTo = searchParams.get('dateTo') || undefined;

  const { data, isLoading, error } = useMetrics({
    perspective: perspective as Perspective,
    product,
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
        <Skeleton className="h-10 w-64" />
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
        <AlertDescription>Nenhum dado disponível para {product}.</AlertDescription>
      </Alert>
    );
  }

  const { metrics } = data;

  const productInfo = {
    POS: { name: 'InfinitePOS', icon: '🖥️', color: 'bg-blue-500' },
    TAP: { name: 'InfiniteTap', icon: '📱', color: 'bg-green-500' },
    LINK: { name: 'InfiniteLink', icon: '🔗', color: 'bg-purple-500' },
    JIM: { name: 'JIM', icon: '🟣', color: 'bg-violet-500' },
  };

  const info = productInfo[product];

  return (
    <div className="space-y-6">
      {/* Header com Badge do Produto */}
      <div className="flex items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight">
              {info.name}
            </h1>
            <Badge className={`${info.color} text-white`}>
              {info.icon} {product}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Performance específica de {info.name}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <PerformanceFilters />

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CAC</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {metrics.cac.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Custo de Aquisição</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPA</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {metrics.cpa.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Custo por Ativação</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CTR</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.ctr.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">Taxa de Cliques</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hook Rate</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.hookRate.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">Retenção 3s</p>
          </CardContent>
        </Card>
      </div>

      {/* Funil de Conversão */}
      <Card>
        <CardHeader>
          <CardTitle>Funil de Conversão</CardTitle>
          <CardDescription>Jornada do usuário para {product}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <div>
                <div className="font-medium">Impressões</div>
                <div className="text-2xl font-bold">{metrics.totalImpressions.toLocaleString('pt-BR')}</div>
              </div>
              <Eye className="h-6 w-6 text-muted-foreground" />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/40">
              <div>
                <div className="font-medium">Cliques</div>
                <div className="text-2xl font-bold">{metrics.totalClicks.toLocaleString('pt-BR')}</div>
                <div className="text-xs text-muted-foreground">CTR: {metrics.ctr.toFixed(2)}%</div>
              </div>
              <MousePointer className="h-6 w-6 text-muted-foreground" />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
              <div>
                <div className="font-medium">Signups</div>
                <div className="text-2xl font-bold">{metrics.totalSignups.toLocaleString('pt-BR')}</div>
                <div className="text-xs text-muted-foreground">Taxa: {metrics.signupRate.toFixed(2)}%</div>
              </div>
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10">
              <div>
                <div className="font-medium">Ativações</div>
                <div className="text-2xl font-bold">{metrics.totalActivations.toLocaleString('pt-BR')}</div>
                <div className="text-xs text-muted-foreground">Taxa: {metrics.activationRate.toFixed(2)}%</div>
              </div>
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Investimento */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Investimento Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              R$ {metrics.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              CPM: R$ {metrics.cpm.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Plataforma</CardTitle>
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
      </div>

      {/* Gráficos */}
      <TimeSeriesChart data={data.timeSeriesData} />

      <div className="grid gap-4 md:grid-cols-2">
        <PlatformBarChart data={data.costByPlatform} />
        <ConversionFunnelChart metrics={metrics} />
      </div>
    </div>
  );
}

