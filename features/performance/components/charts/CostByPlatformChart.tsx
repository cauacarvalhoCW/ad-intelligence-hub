"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig 
} from "@/shared/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { ChartDataPoint } from "../../types";
import { DollarSign } from "lucide-react";

interface CostByPlatformChartProps {
  data: ChartDataPoint[];
  isLoading?: boolean;
}

const chartConfig = {
  META: {
    label: "Meta",
    color: "hsl(var(--chart-1))",
    theme: {
      light: "hsl(221, 83%, 53%)", // #1877F2
      dark: "hsl(206, 100%, 65%)",  // Azul vibrante para dark
    },
  },
  GOOGLE: {
    label: "Google",
    color: "hsl(var(--chart-2))",
    theme: {
      light: "hsl(217, 89%, 61%)", // #4285F4
      dark: "hsl(142, 71%, 45%)",  // Verde Google vibrante
    },
  },
  TIKTOK: {
    label: "TikTok",
    color: "hsl(var(--chart-3))",
    theme: {
      light: "hsl(0, 0%, 0%)",     // Preto
      dark: "hsl(348, 83%, 65%)",  // Rosa TikTok vibrante
    },
  },
} satisfies ChartConfig;

export function CostByPlatformChart({ data, isLoading }: CostByPlatformChartProps) {
  if (isLoading || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Custo por Plataforma</CardTitle>
          <CardDescription>META, GOOGLE, TIKTOK ao longo do tempo</CardDescription>
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
        <CardTitle>Custo por Plataforma</CardTitle>
        <CardDescription>Distribuição de investimento empilhado</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <BarChart accessibilityLayer data={data}>
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
              tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar 
              dataKey="META" 
              stackId="a" 
              fill="var(--color-META)" 
              radius={[0, 0, 0, 0]}
            />
            <Bar 
              dataKey="GOOGLE" 
              stackId="a" 
              fill="var(--color-GOOGLE)" 
              radius={[0, 0, 0, 0]}
            />
            <Bar 
              dataKey="TIKTOK" 
              stackId="a" 
              fill="var(--color-TIKTOK)" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
        <div className="flex items-center gap-2 pt-4 text-sm text-muted-foreground">
          <DollarSign className="h-4 w-4" />
          Visualização empilhada do investimento por plataforma ao longo do tempo
        </div>
      </CardContent>
    </Card>
  );
}

