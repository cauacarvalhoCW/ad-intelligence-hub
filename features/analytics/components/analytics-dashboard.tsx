"use client";

import { Eye, Tag, Target, TrendingUp, Users } from "lucide-react";

import type { AnalyticsResponse } from "@/features/analytics/types";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Progress } from "@/shared/ui/progress";

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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
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
                Período: {analyticsData.applied.date_from} - {" "}
                {analyticsData.applied.date_to}
              </Badge>
            )}
            {analyticsData.applied.ad_types.length > 0 && (
              <Badge variant="outline">
                Tipos: {analyticsData.applied.ad_types.join(", ")}
              </Badge>
            )}
            {analyticsData.applied.competitors.length > 0 && (
              <Badge variant="outline">
                Competidores: {analyticsData.applied.competitors.length}
              </Badge>
            )}
            {analyticsData.applied.q && (
              <Badge variant="outline">Busca: {analyticsData.applied.q}</Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={TrendingUp}
          label="Anúncios totais"
          value={metrics.total_ads}
        />
        <MetricCard
          icon={Users}
          label="Competidores"
          value={metrics.by_competitor.length}
        />
        <MetricCard
          icon={Eye}
          label="Tipos de asset"
          value={metrics.by_asset_type.length}
        />
        <MetricCard icon={Tag} label="Tags mapeadas" value={metrics.top_tags.length} />
      </div>

      <SectionCard title="Distribuição por competidor">
        <div className="space-y-3">
          {metrics.by_competitor.map((item) => (
            <DistributionRow
              key={item.competitor_name}
              label={item.competitor_name}
              value={item.count}
              total={metrics.total_ads}
            />
          ))}
          {metrics.by_competitor.length === 0 && (
            <EmptyState message="Nenhum competidor encontrado para os filtros." />
          )}
        </div>
      </SectionCard>

      <SectionCard title="Distribuição por tipo de asset">
        <div className="space-y-3">
          {metrics.by_asset_type.map((item) => (
            <DistributionRow
              key={item.asset_type}
              label={item.asset_type}
              value={item.count}
              total={metrics.total_ads}
            />
          ))}
          {metrics.by_asset_type.length === 0 && (
            <EmptyState message="Nenhum tipo de asset encontrado." />
          )}
        </div>
      </SectionCard>

      <SectionCard title="Tags em destaque">
        <div className="flex flex-wrap gap-2">
          {metrics.top_tags.map((tag) => (
            <Badge key={tag.tag} variant="secondary">
              {tag.tag} · {tag.count}
            </Badge>
          ))}
          {metrics.top_tags.length === 0 && (
            <EmptyState message="Nenhuma tag encontrada." />
          )}
        </div>
      </SectionCard>

      <SectionCard title="Ofertas e taxas">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ComparisonList
            title="Taxas em destaque"
            items={metrics.fees.map((fee) => ({
              label: fee.label,
              value: fee.matches,
              subtitle: `Mín: ${fee.min} · Mediana: ${fee.median} · Máx: ${fee.max}`,
            }))}
          />
          <ComparisonList
            title="Ofertas populares"
            items={metrics.offers.map((offer) => ({
              label: offer.label,
              value: offer.matches,
              subtitle: `Mín: ${offer.min} · Mediana: ${offer.median} · Máx: ${offer.max}`,
            }))}
          />
        </div>
      </SectionCard>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Target;
  label: string;
  value: number;
}) {
  return (
    <Card>
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

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">{children}</CardContent>
    </Card>
  );
}

function DistributionRow({
  label,
  value,
  total,
}: {
  label: string;
  value: number;
  total: number;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-40 text-sm text-muted-foreground">{label}</div>
      <div className="flex-1">
        <Progress value={(value / Math.max(total, 1)) * 100} />
      </div>
      <div className="w-12 text-right text-sm">{value}</div>
    </div>
  );
}

function ComparisonList({
  title,
  items,
}: {
  title: string;
  items: Array<{ label: string; value: number; subtitle?: string }>;
}) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
      {items.length > 0 ? (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.label} className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-sm">
                <span>{item.label}</span>
                <Badge variant="outline">{item.value}</Badge>
              </div>
              {item.subtitle && (
                <p className="text-xs text-muted-foreground">{item.subtitle}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState message="Nenhum dado disponível." />
      )}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return <p className="text-sm text-muted-foreground">{message}</p>;
}
