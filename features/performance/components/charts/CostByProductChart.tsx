"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  type ChartConfig 
} from "@/shared/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts";
import type { ChartDataPoint } from "../../types";
import { Package } from "lucide-react";

interface CostByProductChartProps {
  data: ChartDataPoint[];
  isLoading?: boolean;
}

const PRODUCT_COLORS: Record<string, string> = {
  POS: "hsl(var(--chart-1))",
  TAP: "hsl(var(--chart-2))",
  LINK: "hsl(var(--chart-3))",
  JIM: "hsl(var(--chart-4))",
};

const chartConfig = {
  cost: {
    label: "Investimento",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export function CostByProductChart({ data, isLoading }: CostByProductChartProps) {
  if (isLoading || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Custo por Produto</CardTitle>
          <CardDescription>Investimento por linha de produto</CardDescription>
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
        <CardTitle>Custo por Produto</CardTitle>
        <CardDescription>Comparação de investimento entre produtos</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart accessibilityLayer data={data} layout="vertical">
            <CartesianGrid horizontal={false} />
            <XAxis
              type="number"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
            />
            <YAxis
              type="category"
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="cost" radius={[0, 8, 8, 0]}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={PRODUCT_COLORS[entry.date] || "hsl(var(--primary))"} 
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
        <div className="flex items-center gap-2 pt-4 text-sm text-muted-foreground">
          <Package className="h-4 w-4" />
          Distribuição de investimento ordenada por produto
        </div>
      </CardContent>
    </Card>
  );
}

