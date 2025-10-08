"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  type ChartConfig 
} from "@/shared/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { ChartDataPoint, Product } from "../../types";
import { getProductColor } from "../../utils/chart-colors";
import { TrendingUp } from "lucide-react";

interface EfficiencyChartProps {
  data: ChartDataPoint[];
  isLoading?: boolean;
  product?: Product; // Para cores dinâmicas
}

type MetricType = "cac" | "cpm" | "cpa" | "ctr" | "hookRate";

const METRICS: { value: MetricType; label: string }[] = [
  { value: "cac", label: "CAC (Custo por Ativação)" },
  { value: "cpm", label: "CPM (Custo por Mil)" },
  { value: "cpa", label: "CPA (Custo por Signup)" },
  { value: "ctr", label: "CTR (%)" },
  { value: "hookRate", label: "Hook Rate (%)" },
];

export function EfficiencyChart({ data, isLoading, product }: EfficiencyChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>("cac");

  // Cor baseada no produto - usa CSS variables com fallback
  const getColor = () => {
    if (!product) return "hsl(var(--chart-1))";
    
    switch (product) {
      case "JIM":
        return "hsl(270 70% 60%)"; // Roxo
      case "POS":
      case "TAP":
      case "LINK":
        return "hsl(142 71% 50%)"; // Verde InfinitePay
      default:
        return "hsl(var(--chart-1))";
    }
  };

  const chartColor = getColor();

  const chartConfig = {
    cac: {
      label: "CAC",
      color: chartColor,
    },
    cpm: {
      label: "CPM",
      color: chartColor,
    },
    cpa: {
      label: "CPA",
      color: chartColor,
    },
    ctr: {
      label: "CTR",
      color: chartColor,
    },
    hookRate: {
      label: "Hook Rate",
      color: chartColor,
    },
  } satisfies ChartConfig;

  const currentMetric = METRICS.find((m) => m.value === selectedMetric)!;

  if (isLoading || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Eficiência no Tempo</CardTitle>
          <CardDescription>Selecione uma métrica para visualizar</CardDescription>
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
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <CardTitle>Eficiência ao Longo do Tempo</CardTitle>
              <span className="text-xs text-muted-foreground font-normal">
                (Selecione uma métrica →)
              </span>
            </div>
            <CardDescription>
              Evolução de {currentMetric.label} ao longo do período
            </CardDescription>
          </div>
          <Select value={selectedMetric} onValueChange={(v) => setSelectedMetric(v as MetricType)}>
            <SelectTrigger className="w-[240px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {METRICS.map((metric) => (
                <SelectItem key={metric.value} value={metric.value}>
                  {metric.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <AreaChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 5)}
            />
            <YAxis
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              dataKey={selectedMetric}
              type="monotone"
              fill={`var(--color-${selectedMetric})`}
              fillOpacity={0.4}
              stroke={`var(--color-${selectedMetric})`}
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
        <div className="flex items-center gap-2 pt-4 text-sm text-muted-foreground">
          <TrendingUp className="h-4 w-4" />
          Tendência de {currentMetric.label.toLowerCase()} no período selecionado
        </div>
      </CardContent>
    </Card>
  );
}

