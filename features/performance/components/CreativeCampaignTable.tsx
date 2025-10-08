"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/shared/ui/table";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Eye, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from "lucide-react";
import { aggregateByCreativeAndCampaign, type AggregatedRow } from "../utils/aggregation-v2";
import { getProductMetrics, formatMetricValue, type MetricKey } from "../utils/product-metrics";
import { AdPreviewModal } from "./AdPreviewModal";
import type { AdData, Product, DimensionMode } from "../types";

interface CreativeCampaignTableProps {
  data: AdData[];
  isLoading?: boolean;
  product: Product;
  dimension: DimensionMode;
}

type SortKey = MetricKey | "ad_name" | "campaign_name" | "date" | "days_active";
type SortOrder = "asc" | "desc";

export function CreativeCampaignTable({ data, isLoading, product, dimension }: CreativeCampaignTableProps) {
  const [previewAd, setPreviewAd] = useState<AdData | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("cost");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Get valid metrics for this product
  const productMetrics = useMemo(() => {
    return getProductMetrics(product);
  }, [product]);

  // Aggregate data by creative + campaign
  const aggregatedData = useMemo(() => {
    if (isLoading || data.length === 0) return [];
    return aggregateByCreativeAndCampaign(data, dimension);
  }, [data, dimension, isLoading]);

  // Sort aggregated data
  const sortedData = useMemo(() => {
    if (aggregatedData.length === 0) return [];

    return [...aggregatedData].sort((a, b) => {
      let aVal = a[sortKey as keyof AggregatedRow];
      let bVal = b[sortKey as keyof AggregatedRow];

      // Handle nulls
      if (aVal === null || aVal === undefined) aVal = sortOrder === "desc" ? -Infinity : Infinity;
      if (bVal === null || bVal === undefined) bVal = sortOrder === "desc" ? -Infinity : Infinity;

      // Compare
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortOrder === "desc" 
          ? bVal.localeCompare(aVal) 
          : aVal.localeCompare(bVal);
      }

      return sortOrder === "desc" ? (bVal as number) - (aVal as number) : (aVal as number) - (bVal as number);
    });
  }, [aggregatedData, sortKey, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, itemsPerPage]);

  // Calculate totals for visible rows
  const visibleTotals = useMemo(() => {
    return paginatedData.reduce((acc, row) => {
      acc.cost += row.cost || 0;
      acc.impressions += row.impressions || 0;
      acc.clicks += row.clicks || 0;
      acc.signups += row.signups || 0;
      acc.activations += row.activations || 0;
      acc.video_3s += row.video_3s || 0;
      acc.install += row.install || 0; // JIM
      acc.pos_sales += row.pos_sales || 0; // POS
      acc.piselli_sales += row.piselli_sales || 0; // POS
      acc.tap_cnpj_signups += row.tap_cnpj_signups || 0; // TAP
      acc.tap_5trx += row.tap_5trx || 0; // TAP
      return acc;
    }, {
      cost: 0,
      impressions: 0,
      clicks: 0,
      signups: 0,
      activations: 0,
      video_3s: 0,
      install: 0,
      pos_sales: 0,
      piselli_sales: 0,
      tap_cnpj_signups: 0,
      tap_5trx: 0,
    });
  }, [paginatedData]);

  // Reset to page 1 when data changes
  useMemo(() => {
    setCurrentPage(1);
  }, [sortedData.length, itemsPerPage]);

  // Toggle sort
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      setSortKey(key);
      setSortOrder("desc");
    }
  };

  // Render sort icon
  const renderSortIcon = (key: SortKey) => {
    if (sortKey !== key) return <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />;
    return sortOrder === "desc" 
      ? <ArrowDown className="ml-2 h-4 w-4" />
      : <ArrowUp className="ml-2 h-4 w-4" />;
  };

  // Convert aggregated row to AdData for preview modal
  const handlePreview = (row: AggregatedRow) => {
    const adData: AdData = {
      id: `agg-${row.ad_id}`,
      ad_id: row.ad_id || 0,
      ad_name: row.ad_name,
      campaign_id: row.campaign_id,
      campaign_name: row.campaign_name,
      platform: row.platform as any,
      product: row.product as any,
      date: row.last_date,
      created_at: "",
      cost: row.cost,
      impressions: row.impressions,
      clicks: row.clicks,
      video_3s: row.video_3s,
      "tap signup": row.tap_signup,
      "tap activations": row.tap_activations,
      "tap 5trx": row.tap_5trx,
      "tap cnpj signups": row.tap_cnpj_signups,
      pos_sales: row.pos_sales,
      piselli_sales: row.piselli_sales,
      install: row.install,
      signup_web: row.signup_web,
      activation_app: row.activation_app,
      activation_web: row.activation_web,
      link_signup: row.link_signup,
      link_activations: row.link_activations,
      creative_link: row.creative_link,
      creative_id: row.creative_id,
      image_preview_link: row.image_preview_link,
      link_update_at: row.link_update_at,
      ctr: row.ctr,
      hook_rate: row.hook_rate,
      cpm: row.cpm,
      cpa: row.cpa,
      cac: row.cac,
      signups: row.signups,
      activations: row.activations,
    };
    setPreviewAd(adData);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>📊 Tabela 2 - Anúncio + Campanha</CardTitle>
          <CardDescription>Carregando dados...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (sortedData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>📊 Tabela 2 - Anúncio + Campanha</CardTitle>
          <CardDescription>Nenhum dado disponível</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Não há dados para exibir com os filtros atuais.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Build table headers based on dimension and product metrics
  const headers: { key: SortKey; label: string; align?: "left" | "center" | "right" }[] = [
    { key: "ad_name", label: "Anúncio (Criativo)", align: "left" },
    { key: "campaign_name", label: "Campanha", align: "left" },
  ];

  // Add date column if diarized
  if (dimension === "daily") {
    headers.push({ key: "date", label: "Data", align: "left" });
  } else {
    headers.push({ key: "days_active", label: "Dias", align: "center" });
  }

  // Add product-specific metrics (same as CreativeTable)
  let metricsToShow: MetricKey[];
  
  if (product === "JIM") {
    // JIM: Installs primeiro, depois métricas específicas
    metricsToShow = ["cost", "impressions", "clicks", "installs", "signups", "activations", "ctr", "hook_rate", "cpc", "cpm", "cvr", "cac"];
  } else if (product === "POS") {
    metricsToShow = ["cost", "impressions", "clicks", "signups", "activations", "ctr", "hook_rate", "cpc", "cpm", "cvr", "cac", "pos_sales", "piselli_percentage"];
  } else if (product === "TAP") {
    metricsToShow = ["cost", "impressions", "clicks", "signups", "activations", "ctr", "hook_rate", "cpc", "cpm", "cvr", "cac", "tap_cnpj_signups", "cnpj_percentage", "tap_5trx"];
  } else {
    // LINK ou padrão
    metricsToShow = ["cost", "impressions", "clicks", "signups", "activations", "ctr", "hook_rate", "cpc", "cpm", "cvr", "cac"];
  }

  const validMetrics = metricsToShow.filter(m => 
    productMetrics.some(pm => pm.key === m)
  );

  validMetrics.forEach(metric => {
    const config = productMetrics.find(m => m.key === metric);
    if (config) {
      headers.push({ 
        key: metric, 
        label: config.label, 
        align: "right" 
      });
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>📊 Tabela 2 - Anúncio + Campanha</CardTitle>
        <CardDescription>
          {dimension === "daily" 
            ? "Agregado por Criativo + Campanha + Dia • Soma apenas linhas com mesmo anúncio E campanha no mesmo dia"
            : `Agregado por Criativo + Campanha • ${sortedData.length} combinações únicas • Período completo`
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px] text-center">Preview</TableHead>
                {headers.map(header => (
                  <TableHead 
                    key={header.key}
                    className={`cursor-pointer ${
                      header.align === "center" ? "text-center" : 
                      header.align === "right" ? "text-right" : ""
                    }`}
                    onClick={() => handleSort(header.key)}
                  >
                    <div className={`flex items-center ${
                      header.align === "center" ? "justify-center" : 
                      header.align === "right" ? "justify-end" : ""
                    }`}>
                      {header.label}
                      {renderSortIcon(header.key)}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((row, index) => (
                <TableRow key={`${row.key}-${index}`}>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePreview(row)}
                      className="h-8 w-8 p-0"
                      title="Ver anúncio"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="min-w-[180px] whitespace-normal break-words" title={row.ad_name}>
                      {row.ad_name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="min-w-[150px] whitespace-normal break-words" title={row.campaign_name}>
                      {row.campaign_name}
                    </div>
                  </TableCell>
                  
                  {dimension === "daily" ? (
                    <TableCell>
                      {row.date ? new Date(row.date).toLocaleDateString("pt-BR") : "—"}
                    </TableCell>
                  ) : (
                    <TableCell className="text-center">
                      <span className="text-xs text-muted-foreground" title={`${row.first_date} → ${row.last_date}`}>
                        {row.days_active}d
                      </span>
                    </TableCell>
                  )}
                  
                  {validMetrics.map(metric => (
                    <TableCell key={metric} className="text-right">
                      {formatMetricValue(
                        row[metric as keyof AggregatedRow] as number, 
                        metric, 
                        product
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3} className="font-bold">
                  TOTAL (página atual)
                </TableCell>
                {dimension === "daily" ? (
                  <TableCell />
                ) : (
                  <TableCell />
                )}
                {validMetrics.map(metric => {
                  const value = visibleTotals[metric as keyof typeof visibleTotals];
                  return (
                    <TableCell key={metric} className="text-right font-bold">
                      {formatMetricValue(value as number, metric, product)}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableFooter>
          </Table>
        </div>

        {/* Pagination Controls */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Mostrando {(currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, sortedData.length)} de {sortedData.length} resultados
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Itens por página:</span>
              <Select
                value={String(itemsPerPage)}
                onValueChange={(v) => setItemsPerPage(Number(v))}
              >
                <SelectTrigger className="w-[80px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Platform indicator */}
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <span>Plataformas:</span>
          {["META", "GOOGLE", "TIKTOK"].map(platform => {
            const count = sortedData.filter(r => r.platform === platform).length;
            if (count === 0) return null;
            return (
              <Badge key={platform} variant="outline">
                {platform}: {count}
              </Badge>
            );
          })}
        </div>

        {/* Preview Modal */}
        <AdPreviewModal ad={previewAd} onClose={() => setPreviewAd(null)} product={product} />
      </CardContent>
    </Card>
  );
}
