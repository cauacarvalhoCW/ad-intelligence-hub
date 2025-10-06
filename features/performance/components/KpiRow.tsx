"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { KPIMetrics } from "../types";
import { formatCurrency, formatNumber, formatPercentage } from "../utils";

interface KpiRowProps {
  metrics: KPIMetrics | null;
  isLoading?: boolean;
  showInstalls?: boolean; // For JIM product
}

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  isLoading?: boolean;
}

function KpiCard({ title, value, subtitle, trend, isLoading }: KpiCardProps) {
  if (isLoading) {
    return (
      <Card className="border-border/40">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardDescription className="text-sm font-medium">{title}</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-7 w-20 mb-2" />
          <Skeleton className="h-4 w-32" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/40">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardDescription className="text-sm font-medium">{title}</CardDescription>
        {trend && (
          <div className={`flex items-center gap-0.5 text-xs font-medium ${trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {trend.isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span>{trend.isPositive ? '+' : ''}{trend.value}%</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

export function KpiRow({ metrics, isLoading, showInstalls }: KpiRowProps) {
  console.log("🎯 [KpiRow] Render state:", { isLoading, hasMetrics: !!metrics, metrics });
  
  if (isLoading || !metrics) {
    console.log("🎯 [KpiRow] Showing loading state:", { isLoading, metrics });
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <KpiCard key={i} title="Loading..." value="—" isLoading />
        ))}
      </div>
    );
  }
  
  console.log("🎯 [KpiRow] Rendering metrics:", metrics);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {/* Cost */}
      <KpiCard
        title="Custo Total"
        value={formatCurrency(metrics.cost)}
        subtitle={`CPM: ${formatCurrency(metrics.cpm)}`}
      />

      {/* Impressions */}
      <KpiCard
        title="Impressões"
        value={formatNumber(metrics.impressions)}
        subtitle={`Hook Rate: ${formatPercentage(metrics.hook_rate)}`}
      />

      {/* Clicks */}
      <KpiCard
        title="Clicks"
        value={formatNumber(metrics.clicks)}
        subtitle={`CTR: ${formatPercentage(metrics.ctr)}`}
      />

      {/* Signups */}
      <KpiCard
        title="Signups"
        value={formatNumber(metrics.signups)}
        subtitle={`CPA: ${formatCurrency(metrics.cpa)}`}
      />

      {/* Activations */}
      <KpiCard
        title="Ativações"
        value={formatNumber(metrics.activations)}
        subtitle={`CAC: ${formatCurrency(metrics.cac)}`}
      />

      {/* POS Sales (if has data) */}
      {metrics.pos_sales > 0 && (
        <KpiCard
          title="Vendas POS"
          value={formatNumber(metrics.pos_sales)}
          subtitle={`Piselli: ${formatNumber(metrics.piselli_sales)}`}
        />
      )}

      {/* Piselli % (if applicable) */}
      {metrics.piselli_percentage !== null && (
        <KpiCard
          title="% Piselli"
          value={formatPercentage(metrics.piselli_percentage)}
          subtitle={`${formatNumber(metrics.piselli_sales)} de ${formatNumber(metrics.pos_sales)}`}
        />
      )}

      {/* 5th Transaction (if has data) */}
      {metrics.fifth_transaction > 0 && (
        <KpiCard
          title="5ª Transação"
          value={formatNumber(metrics.fifth_transaction)}
          subtitle="TAP 5trx"
        />
      )}

      {/* Installs (JIM only) */}
      {showInstalls && metrics.installs !== undefined && (
        <KpiCard
          title="Instalações"
          value={formatNumber(metrics.installs)}
          subtitle="JIM App"
        />
      )}
    </div>
  );
}

