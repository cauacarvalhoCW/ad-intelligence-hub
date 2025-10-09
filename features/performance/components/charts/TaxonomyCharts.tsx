"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Skeleton } from "@/shared/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend, Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts";
import { parseTaxonomy, getCompanyColor, getFunnelStageColor, getDestinationColor } from "../../utils/taxonomy-parser";
import { getProductColor } from "../../utils/chart-colors";
import type { AdData, DimensionMode, Product } from "../../types";

// Tipos de métricas disponíveis
type MetricType = "cost" | "signups" | "activations" | "installs" | "cac" | "pos_sales" | "piselli_percentage";

interface MetricConfig {
  label: string;
  getValue: (row: AdData) => number;
  format: (value: number, product?: Product) => string;
  aggregationType: "sum" | "calculated"; // sum = soma direta, calculated = precisa cálculo especial
}

interface TaxonomyChartsProps {
  data: AdData[];
  isLoading?: boolean;
  dimension: DimensionMode;
  position: "after-table1" | "after-table2";
  product?: Product; // Para cores dinâmicas
}

export function TaxonomyCharts({ data, isLoading, dimension, position, product }: TaxonomyChartsProps) {
  // State para métrica selecionada POR CHART (cada chart independente)
  const [companyMetric, setCompanyMetric] = useState<MetricType>("cost");
  const [funnelMetric, setFunnelMetric] = useState<MetricType>("cost");
  const [destinationMetric, setDestinationMetric] = useState<MetricType>("cost");
  const [scaleMetric, setScaleMetric] = useState<MetricType>("cost");
  const [platformMetric, setPlatformMetric] = useState<MetricType>("cost");

  // Configuração de métricas (helper function)
  const getMetricConfig = (metricType: MetricType): MetricConfig => {
    const metricConfigs: Record<MetricType, MetricConfig> = {
      cost: {
        label: "Custo",
        getValue: (row) => row.cost || 0,
        format: (value, prod) => 
          new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: prod === "JIM" ? "USD" : "BRL",
          }).format(value),
        aggregationType: "sum",
      },
      signups: {
        label: "Signups",
        getValue: (row) => row.signups || 0,
        format: (value) => new Intl.NumberFormat("pt-BR").format(Math.round(value)),
        aggregationType: "sum",
      },
      activations: {
        label: "Ativações",
        getValue: (row) => row.activations || 0,
        format: (value) => new Intl.NumberFormat("pt-BR").format(Math.round(value)),
        aggregationType: "sum",
      },
      installs: {
        label: "Installs",
        getValue: (row) => row.install || 0,
        format: (value) => new Intl.NumberFormat("pt-BR").format(Math.round(value)),
        aggregationType: "sum",
      },
      cac: {
        label: "CAC",
        getValue: (row) => row.cac || 0,
        format: (value, prod) => 
          new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: prod === "JIM" ? "USD" : "BRL",
          }).format(value),
        aggregationType: "calculated",
      },
      pos_sales: {
        label: "Vendas POS",
        getValue: (row) => row.pos_sales || 0,
        format: (value) => new Intl.NumberFormat("pt-BR").format(Math.round(value)),
        aggregationType: "sum",
      },
      piselli_percentage: {
        label: "% Piselli",
        getValue: (row) => {
          const pos_sales = row.pos_sales || 0;
          const piselli_sales = row.piselli_sales || 0;
          return pos_sales > 0 ? (piselli_sales / pos_sales) * 100 : 0;
        },
        format: (value) => `${value.toFixed(2)}%`,
        aggregationType: "calculated",
      },
    };
    return metricConfigs[metricType];
  };

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

  // Helper function para agregar valores baseado na métrica
  const aggregateMetric = useCallback((rows: AdData[], metricType: MetricType): number => {
    const metricConfig = getMetricConfig(metricType);
    
    if (metricType === "cac") {
      // 🎯 CAC específico por produto
      const totalCost = rows.reduce((sum, r) => sum + (r.cost || 0), 0);
      
      // Para POS: CAC = cost / pos_sales
      if (product === "POS") {
        const totalPosSales = rows.reduce((sum, r) => sum + (r.pos_sales || 0), 0);
        return totalPosSales > 0 ? totalCost / totalPosSales : 0;
      }
      
      // Para outros produtos: CAC = cost / activations
      const totalActivations = rows.reduce((sum, r) => sum + (r.activations || 0), 0);
      return totalActivations > 0 ? totalCost / totalActivations : 0;
    } else if (metricType === "piselli_percentage") {
      // % Piselli = (piselli_sales / pos_sales) * 100
      const totalPosSales = rows.reduce((sum, r) => sum + (r.pos_sales || 0), 0);
      const totalPiselliSales = rows.reduce((sum, r) => sum + (r.piselli_sales || 0), 0);
      return totalPosSales > 0 ? (totalPiselliSales / totalPosSales) * 100 : 0;
    } else if (metricType === "activations" && product === "POS") {
      // 🎯 Para POS: "Ativações" = pos_sales
      return rows.reduce((sum, r) => sum + (r.pos_sales || 0), 0);
    } else {
      // Soma direta para outras métricas
      return rows.reduce((sum, r) => sum + metricConfig.getValue(r), 0);
    }
  }, [product]);

  // Calculate aggregations baseado em MÚLTIPLAS métricas (uma para cada chart)
  const { 
    totalAds, 
    companyData, 
    funnelData, 
    destinationData,
    platformData,
    scaledAds,
    uniqueCombinations 
  } = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        totalAds: 0,
        companyData: [],
        funnelData: [],
        destinationData: [],
        platformData: [],
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
    const companyMap = new Map<string, AdData[]>();
    const funnelMap = new Map<string, AdData[]>();
    const destinationMap = new Map<string, AdData[]>();
    const platformMap = new Map<string, AdData[]>();
    const adMetricMap = new Map<string, AdData[]>();

    data.forEach(row => {
      const taxonomy = parseTaxonomy(row.ad_name);

      // Company
      const company = taxonomy.company;
      if (!companyMap.has(company)) companyMap.set(company, []);
      companyMap.get(company)!.push(row);

      // Funnel
      const funnel = taxonomy.funnelStage;
      if (!funnelMap.has(funnel)) funnelMap.set(funnel, []);
      funnelMap.get(funnel)!.push(row);

      // Destination
      const dest = taxonomy.destination;
      if (!destinationMap.has(dest)) destinationMap.set(dest, []);
      destinationMap.get(dest)!.push(row);

      // Platform (META, GOOGLE, TIKTOK)
      const platform = (row.platform || "UNKNOWN").toUpperCase();
      if (!platformMap.has(platform)) platformMap.set(platform, []);
      platformMap.get(platform)!.push(row);

      // Ad (for scale ranking)
      const adName = row.ad_name || "UNKNOWN";
      if (!adMetricMap.has(adName)) adMetricMap.set(adName, []);
      adMetricMap.get(adName)!.push(row);
    });

    // Convert to chart data - CADA UM COM SUA MÉTRICA
    const companyTotalValue = aggregateMetric(data, companyMetric);
    const companyData = Array.from(companyMap.entries())
      .filter(([key]) => key !== "UNKNOWN")
      .map(([name, rows]) => {
        const value = aggregateMetric(rows, companyMetric);
        return {
          name,
          value,
          percentage: companyTotalValue > 0 ? (value / companyTotalValue) * 100 : 0,
        };
      })
      .sort((a, b) => b.value - a.value);

    const funnelTotalValue = aggregateMetric(data, funnelMetric);
    const funnelData = Array.from(funnelMap.entries())
      .filter(([key]) => key !== "UNKNOWN")
      .map(([name, rows]) => {
        const value = aggregateMetric(rows, funnelMetric);
        return {
          name,
          value,
          percentage: funnelTotalValue > 0 ? (value / funnelTotalValue) * 100 : 0,
        };
      })
      .sort((a, b) => b.value - a.value);

    const destinationTotalValue = aggregateMetric(data, destinationMetric);
    const destinationData = Array.from(destinationMap.entries())
      .filter(([key]) => key !== "UNKNOWN")
      .map(([name, rows]) => {
        const value = aggregateMetric(rows, destinationMetric);
        return {
          name,
          value,
          percentage: destinationTotalValue > 0 ? (value / destinationTotalValue) * 100 : 0,
        };
      })
      .sort((a, b) => b.value - a.value);

    // Platform data (META, GOOGLE, TIKTOK)
    const platformTotalValue = aggregateMetric(data, platformMetric);
    const platformData = Array.from(platformMap.entries())
      .filter(([key]) => key !== "UNKNOWN")
      .map(([name, rows]) => {
        const value = aggregateMetric(rows, platformMetric);
        return {
          name,
          value,
          percentage: platformTotalValue > 0 ? (value / platformTotalValue) * 100 : 0,
        };
      })
      .sort((a, b) => b.value - a.value);

    // Top scaled ads (highest metric value) - MANTÉM NOME COMPLETO
    const scaledAds = Array.from(adMetricMap.entries())
      .map(([name, rows]) => ({ 
        name, // Nome completo, sem truncar
        value: aggregateMetric(rows, scaleMetric)
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Top 10 para o gráfico de barras

    return {
      totalAds,
      companyData,
      funnelData,
      destinationData,
      platformData,
      scaledAds,
      uniqueCombinations,
    };
  }, [data, companyMetric, funnelMetric, destinationMetric, platformMetric, scaleMetric, aggregateMetric]);

  // Only show charts in "total" dimension mode (EARLY RETURN AFTER ALL HOOKS)
  if (dimension !== "total") {
    return null;
  }

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
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Categorias / Companies</CardTitle>
                    <CardDescription>Distribuição por {getMetricConfig(companyMetric).label}</CardDescription>
                  </div>
                  <Select value={companyMetric} onValueChange={(value) => setCompanyMetric(value as MetricType)}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cost">💰 Custo</SelectItem>
                      <SelectItem value="signups">📝 Signups</SelectItem>
                      <SelectItem value="activations">✅ Ativações</SelectItem>
                      {product === "JIM" && <SelectItem value="installs">📱 Installs</SelectItem>}
                      {product === "POS" && <SelectItem value="pos_sales">🛒 Vendas POS</SelectItem>}
                      {product === "POS" && <SelectItem value="piselli_percentage">🍕 % Piselli</SelectItem>}
                      <SelectItem value="cac">🎯 CAC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                      formatter={(value: number) => getMetricConfig(companyMetric).format(value, product)}
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
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>TOFU vs BOFU</CardTitle>
                    <CardDescription>Distribuição por {getMetricConfig(funnelMetric).label}</CardDescription>
                  </div>
                  <Select value={funnelMetric} onValueChange={(value) => setFunnelMetric(value as MetricType)}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cost">💰 Custo</SelectItem>
                      <SelectItem value="signups">📝 Signups</SelectItem>
                      <SelectItem value="activations">✅ Ativações</SelectItem>
                      {product === "JIM" && <SelectItem value="installs">📱 Installs</SelectItem>}
                      {product === "POS" && <SelectItem value="pos_sales">🛒 Vendas POS</SelectItem>}
                      {product === "POS" && <SelectItem value="piselli_percentage">🍕 % Piselli</SelectItem>}
                      <SelectItem value="cac">🎯 CAC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                      formatter={(value: number) => getMetricConfig(funnelMetric).format(value, product)}
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

          {/* Platform Chart (META, GOOGLE, TIKTOK) */}
          {platformData.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Plataformas</CardTitle>
                    <CardDescription>Distribuição por {getMetricConfig(platformMetric).label}</CardDescription>
                  </div>
                  <Select value={platformMetric} onValueChange={(value) => setPlatformMetric(value as MetricType)}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cost">💰 Custo</SelectItem>
                      <SelectItem value="signups">📝 Signups</SelectItem>
                      <SelectItem value="activations">✅ Ativações</SelectItem>
                      {product === "JIM" && <SelectItem value="installs">📱 Installs</SelectItem>}
                      {product === "POS" && <SelectItem value="pos_sales">🛒 Vendas POS</SelectItem>}
                      {product === "POS" && <SelectItem value="piselli_percentage">🍕 % Piselli</SelectItem>}
                      <SelectItem value="cac">🎯 CAC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={platformData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {platformData.map((entry, index) => {
                        // Cores específicas por plataforma
                        const platformColors: Record<string, string> = {
                          META: "hsl(221 83% 53%)", // Azul
                          GOOGLE: "hsl(4 90% 58%)",  // Vermelho
                          TIKTOK: "hsl(338 100% 48%)", // Rosa
                        };
                        return (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={platformColors[entry.name] || "hsl(var(--chart-1))"} 
                          />
                        );
                      })}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => getMetricConfig(platformMetric).format(value, product)}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {platformData.map((item) => {
                    const platformColors: Record<string, string> = {
                      META: "hsl(221 83% 53%)",
                      GOOGLE: "hsl(4 90% 58%)",
                      TIKTOK: "hsl(338 100% 48%)",
                    };
                    return (
                      <div key={item.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: platformColors[item.name] || "hsl(var(--chart-1))" }}
                          />
                          <span className="font-medium">{item.name}</span>
                        </div>
                        <span className="text-muted-foreground">
                          {item.percentage.toFixed(1)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Scale Ranking - GRÁFICO DE BARRAS HORIZONTAL */}
          {scaledAds.length > 0 && (
            <Card className="lg:col-span-3">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Escala (Top 10 - Ranking por {getMetricConfig(scaleMetric).label})</CardTitle>
                    <CardDescription>Anúncios com melhor desempenho em {getMetricConfig(scaleMetric).label}</CardDescription>
                  </div>
                  <Select value={scaleMetric} onValueChange={(value) => setScaleMetric(value as MetricType)}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cost">💰 Custo</SelectItem>
                      <SelectItem value="signups">📝 Signups</SelectItem>
                      <SelectItem value="activations">✅ Ativações</SelectItem>
                      {product === "JIM" && <SelectItem value="installs">📱 Installs</SelectItem>}
                      {product === "POS" && <SelectItem value="pos_sales">🛒 Vendas POS</SelectItem>}
                      {product === "POS" && <SelectItem value="piselli_percentage">🍕 % Piselli</SelectItem>}
                      <SelectItem value="cac">🎯 CAC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                      tickFormatter={(value) => {
                        if (scaleMetric === "cost" || scaleMetric === "cac") {
                          return new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: product === "JIM" ? "USD" : "BRL",
                            notation: "compact",
                            maximumFractionDigits: 0,
                          }).format(value);
                        } else {
                          return new Intl.NumberFormat("pt-BR", {
                            notation: "compact",
                          }).format(value);
                        }
                      }}
                    />
                    <YAxis 
                      type="category"
                      dataKey="name"
                      width={300}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      formatter={(value: number) => getMetricConfig(scaleMetric).format(value, product)}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                      }}
                    />
                    <Bar 
                      dataKey="value" 
                      fill={chartColor}
                      radius={[0, 4, 4, 0]}
                      label={{ 
                        position: 'right', 
                        formatter: (value: any) => {
                          const numValue = typeof value === 'number' ? value : 0;
                          if (scaleMetric === "cost" || scaleMetric === "cac") {
                            return new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: product === "JIM" ? "USD" : "BRL",
                              notation: "compact",
                            }).format(numValue);
                          } else {
                            return new Intl.NumberFormat("pt-BR", {
                              notation: "compact",
                            }).format(numValue);
                          }
                        },
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
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>APP vs WEB_</CardTitle>
                    <CardDescription>Distribuição por {getMetricConfig(destinationMetric).label}</CardDescription>
                  </div>
                  <Select value={destinationMetric} onValueChange={(value) => setDestinationMetric(value as MetricType)}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cost">💰 Custo</SelectItem>
                      <SelectItem value="signups">📝 Signups</SelectItem>
                      <SelectItem value="activations">✅ Ativações</SelectItem>
                      {product === "JIM" && <SelectItem value="installs">📱 Installs</SelectItem>}
                      {product === "POS" && <SelectItem value="pos_sales">🛒 Vendas POS</SelectItem>}
                      {product === "POS" && <SelectItem value="piselli_percentage">🍕 % Piselli</SelectItem>}
                      <SelectItem value="cac">🎯 CAC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                      formatter={(value: number) => getMetricConfig(destinationMetric).format(value, product)}
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

