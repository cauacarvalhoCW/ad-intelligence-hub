"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import type { FunnelStage } from "../../types";
import { formatNumber, formatPercentage } from "../../utils";
import { ArrowDown, TrendingDown } from "lucide-react";

interface FunnelChartProps {
  data: FunnelStage[];
  isLoading?: boolean;
}

const STAGE_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
];

export function FunnelChart({ data, isLoading }: FunnelChartProps) {
  if (isLoading || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Funil de Conversão</CardTitle>
          <CardDescription>Impressões → Clicks → Signups → Ativações</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">
              {isLoading ? "Carregando..." : "Sem dados"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Funil de Conversão</CardTitle>
        <CardDescription>Taxa de passagem entre cada etapa do funil</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {data.map((stage, index) => {
          const width = Math.max(stage.percentage, 10); // Min 10% for visibility
          const nextStage = data[index + 1];
          const conversionRate = nextStage 
            ? (nextStage.value / stage.value) * 100 
            : null;
          const stageColor = STAGE_COLORS[index % STAGE_COLORS.length];

          return (
            <div key={stage.name} className="space-y-3">
              {/* Funnel Stage */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: stageColor }}
                    />
                    <span className="font-medium">{stage.name}</span>
                  </div>
                  <Badge variant="secondary">
                    {formatPercentage(stage.percentage, 1)} do total
                  </Badge>
                </div>
                <div 
                  className="h-14 rounded-lg flex items-center justify-between px-4 transition-all hover:opacity-90 shadow-sm"
                  style={{ 
                    width: `${width}%`,
                    backgroundColor: stageColor,
                    opacity: 0.8
                  }}
                >
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-white">
                      {formatNumber(stage.value)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Conversion Rate to next stage */}
              {conversionRate !== null && (
                <div className="flex items-center justify-center gap-2 py-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
                    <TrendingDown className="h-3.5 w-3.5" />
                    <span className="font-medium">
                      {formatPercentage(conversionRate, 1)} converteu
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

