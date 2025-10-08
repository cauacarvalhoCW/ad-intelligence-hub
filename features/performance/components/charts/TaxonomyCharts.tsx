"use client";

import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Skeleton } from "@/shared/ui/skeleton";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend, Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts";
import { parseTaxonomy, getCompanyColor, getFunnelStageColor, getDestinationColor } from "../../utils/taxonomy-parser";
import { getProductColor } from "../../utils/chart-colors";
import type { AdData, DimensionMode, Product } from "../../types";

interface TaxonomyChartsProps {
  data: AdData[];
  isLoading?: boolean;
  dimension: DimensionMode;
  position: "after-table1" | "after-table2";
  product?: Product; // Para cores dinâmicas
}

export function TaxonomyCharts({ data, isLoading, dimension, position, product }: TaxonomyChartsProps) {
  // Cor baseada no produto - usa cores diretas
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

  // Only show charts in "total" dimension mode
  if (dimension !== "total") {
    return null;
  }

  // Calculate aggregations
  const { 
    totalAds, 
    companyData, 
    funnelData, 
    destinationData,
    scaledAds,
    uniqueCombinations 
  } = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        totalAds: 0,
        companyData: [],
        funnelData: [],
        destinationData: [],
        scaledAds: [],
        uniqueCombinations: 0,
      };
    }

    // For position after-table1: count unique ads
    const uniqueAds = new Set(data.map(d => d.ad_name));
    const totalAds = uniqueAds.size;

    // For position after-table2: count unique ad+campaign combinations
    const uniqueCombos = new Set(
      data.map(d => `${d.ad_name}|||${d.campaign_name}`)
    );
    const uniqueCombinations = uniqueCombos.size;

    // Aggregate by taxonomy
    const companyMap = new Map<string, number>();
    const funnelMap = new Map<string, number>();
    const destinationMap = new Map<string, number>();
    const adCostMap = new Map<string, number>();

    data.forEach(row => {
      const taxonomy = parseTaxonomy(row.ad_name);
      const cost = row.cost || 0;

      // Company
      const company = taxonomy.company;
      companyMap.set(company, (companyMap.get(company) || 0) + cost);

      // Funnel
      const funnel = taxonomy.funnelStage;
      funnelMap.set(funnel, (funnelMap.get(funnel) || 0) + cost);

      // Destination
      const dest = taxonomy.destination;
      destinationMap.set(dest, (destinationMap.get(dest) || 0) + cost);

      // Ad cost (for scale ranking)
      const adName = row.ad_name || "UNKNOWN";
      adCostMap.set(adName, (adCostMap.get(adName) || 0) + cost);
    });

    // Convert to chart data
    const companyData = Array.from(companyMap.entries())
      .filter(([key]) => key !== "UNKNOWN")
      .map(([name, value]) => ({
        name,
        value,
        percentage: (value / data.reduce((sum, d) => sum + (d.cost || 0), 0)) * 100,
      }))
      .sort((a, b) => b.value - a.value);

    const funnelData = Array.from(funnelMap.entries())
      .filter(([key]) => key !== "UNKNOWN")
      .map(([name, value]) => ({
        name,
        value,
        percentage: (value / data.reduce((sum, d) => sum + (d.cost || 0), 0)) * 100,
      }))
      .sort((a, b) => b.value - a.value);

    const destinationData = Array.from(destinationMap.entries())
      .filter(([key]) => key !== "UNKNOWN")
      .map(([name, value]) => ({
        name,
        value,
        percentage: (value / data.reduce((sum, d) => sum + (d.cost || 0), 0)) * 100,
      }))
      .sort((a, b) => b.value - a.value);

    // Top scaled ads (highest cost) - MANTÉM NOME COMPLETO
    const scaledAds = Array.from(adCostMap.entries())
      .map(([name, cost]) => ({ 
        name, // Nome completo, sem truncar
        cost 
      }))
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 10); // Top 10 para o gráfico de barras

    return {
      totalAds,
      companyData,
      funnelData,
      destinationData,
      scaledAds,
      uniqueCombinations,
    };
  }, [data]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Charts for position after-table1
  if (position === "after-table1") {
    return (
      <div className="space-y-6">
        {/* Total Ads Counter */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{totalAds}</p>
              <p className="text-muted-foreground">Anúncios Únicos</p>
            </div>
          </CardContent>
        </Card>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Companies Chart */}
          {companyData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Categorias / Companies</CardTitle>
                <CardDescription>Distribuição por agência</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={companyData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {companyData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={getCompanyColor(entry.name as any)} 
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => 
                        new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(value)
                      }
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {companyData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: getCompanyColor(item.name as any) }}
                        />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <span className="text-muted-foreground">
                        {item.percentage.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Funnel Stage Chart */}
          {funnelData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>TOFU vs BOFU</CardTitle>
                <CardDescription>Distribuição por estágio do funil</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={funnelData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {funnelData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={getFunnelStageColor(entry.name as any)} 
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => 
                        new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(value)
                      }
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {funnelData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: getFunnelStageColor(item.name as any) }}
                        />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <span className="text-muted-foreground">
                        {item.percentage.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Scale Ranking - GRÁFICO DE BARRAS HORIZONTAL */}
          {scaledAds.length > 0 && (
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Escala (Top 10 - Quem Escalou)</CardTitle>
                <CardDescription>Anúncios que mais gastaram (gasto total)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={scaledAds}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis 
                      type="number"
                      tickFormatter={(value) => 
                        new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                          notation: "compact",
                          maximumFractionDigits: 0,
                        }).format(value)
                      }
                    />
                    <YAxis 
                      type="category"
                      dataKey="name"
                      width={300}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      formatter={(value: number) => 
                        new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(value)
                      }
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                      }}
                    />
                    <Bar 
                      dataKey="cost" 
                      fill={chartColor}
                      radius={[0, 4, 4, 0]}
                      label={{ 
                        position: 'right', 
                        formatter: (value: number) => 
                          new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                            notation: "compact",
                          }).format(value),
                        fontSize: 11,
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // Charts for position after-table2
  if (position === "after-table2") {
    return (
      <div className="space-y-6">
        {/* Total Combinations Counter */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{uniqueCombinations}</p>
              <p className="text-muted-foreground">Anúncios nas Campanhas</p>
              <p className="text-xs text-muted-foreground mt-1">
                (Combinações únicas Criativo + Campanha)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* APP vs WEB Chart */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {destinationData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>APP vs WEB_</CardTitle>
                <CardDescription>Distribuição por tipo de destino</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={destinationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {destinationData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={getDestinationColor(entry.name as any)} 
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => 
                        new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(value)
                      }
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {destinationData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: getDestinationColor(item.name as any) }}
                        />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <span className="text-muted-foreground">
                        {item.percentage.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Performance Metrics Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Métricas de Performance</CardTitle>
              <CardDescription>Agregado do período</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.length > 0 && (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">CTR Médio</p>
                      <p className="text-2xl font-bold">
                        {(
                          (data.reduce((sum, d) => sum + (d.clicks || 0), 0) /
                            data.reduce((sum, d) => sum + (d.impressions || 0), 0)) *
                          100
                        ).toFixed(2)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">CPC Médio</p>
                      <p className="text-2xl font-bold">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(
                          data.reduce((sum, d) => sum + (d.cost || 0), 0) /
                            data.reduce((sum, d) => sum + (d.clicks || 0), 0)
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">CPM Médio</p>
                      <p className="text-2xl font-bold">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(
                          data.reduce((sum, d) => sum + (d.cost || 0), 0) /
                            (data.reduce((sum, d) => sum + (d.impressions || 0), 0) / 1000)
                        )}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}

