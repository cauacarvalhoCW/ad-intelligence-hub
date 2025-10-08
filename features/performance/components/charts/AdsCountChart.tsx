"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Skeleton } from "@/shared/ui/skeleton";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { AdData, Product } from "../../types";

interface AdsCountChartProps {
  data: AdData[];
  isLoading?: boolean;
  products: Product[];
}

// Cores para cada produto
const PRODUCT_COLORS: Record<Product, string> = {
  POS: "hsl(24 100% 50%)",   // Laranja
  TAP: "hsl(142 71% 45%)",   // Verde
  LINK: "hsl(221 83% 53%)",  // Azul
  JIM: "hsl(270 70% 60%)",   // Roxo
};

export function AdsCountChart({ data, isLoading, products }: AdsCountChartProps) {
  // Calcular evolução de anúncios únicos por dia e por produto
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Agrupar por data e produto
    const dateProductMap = new Map<string, Map<Product, Set<string>>>();

    data.forEach((row) => {
      if (!row.date || !row.product || !row.ad_id) return;

      const date = row.date;
      const product = row.product as Product;
      const adId = String(row.ad_id);

      if (!dateProductMap.has(date)) {
        dateProductMap.set(date, new Map());
      }

      const productMap = dateProductMap.get(date)!;
      if (!productMap.has(product)) {
        productMap.set(product, new Set());
      }

      productMap.get(product)!.add(adId);
    });

    // Converter para array de chart data
    const result = Array.from(dateProductMap.entries())
      .map(([date, productMap]) => {
        const entry: any = { date };
        
        products.forEach((product) => {
          entry[product] = productMap.get(product)?.size || 0;
        });

        return entry;
      })
      .sort((a, b) => a.date.localeCompare(b.date));

    return result;
  }, [data, products]);

  // Calcular totais por produto
  const totalsByProduct = useMemo(() => {
    if (!data || data.length === 0) return {};

    const productAdSets = new Map<Product, Set<string>>();

    data.forEach((row) => {
      if (!row.product || !row.ad_id) return;
      
      const product = row.product as Product;
      const adId = String(row.ad_id);

      if (!productAdSets.has(product)) {
        productAdSets.set(product, new Set());
      }

      productAdSets.get(product)!.add(adId);
    });

    const totals: Record<string, number> = {};
    products.forEach((product) => {
      totals[product] = productAdSets.get(product)?.size || 0;
    });

    return totals;
  }, [data, products]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Big Numbers Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((product) => (
            <Card key={product}>
              <CardContent className="pt-6">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Chart Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Big Numbers - Quantidade de Anúncios por Produto */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <Card key={product}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{product}</p>
                  <p className="text-3xl font-bold">{totalsByProduct[product] || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">anúncios únicos</p>
                </div>
                <div
                  className="w-3 h-12 rounded-full"
                  style={{ backgroundColor: PRODUCT_COLORS[product] }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráfico de Evolução */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução de Anúncios ao Longo do Tempo</CardTitle>
          <CardDescription>
            Quantidade de anúncios únicos por produto por dia
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => {
                  try {
                    return format(new Date(value), "dd/MM", { locale: ptBR });
                  } catch {
                    return value;
                  }
                }}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                label={{ value: "Anúncios", angle: -90, position: "insideLeft", fontSize: 12 }}
              />
              <Tooltip
                labelFormatter={(value) => {
                  try {
                    return format(new Date(value), "dd 'de' MMMM", { locale: ptBR });
                  } catch {
                    return value;
                  }
                }}
                formatter={(value: number, name: string) => [
                  `${value} anúncios`,
                  name,
                ]}
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
              />
              <Legend />
              {products.map((product) => (
                <Line
                  key={product}
                  type="monotone"
                  dataKey={product}
                  stroke={PRODUCT_COLORS[product]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

