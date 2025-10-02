"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Badge } from "@/shared/ui/badge";
import { Skeleton } from "@/shared/ui/skeleton";
import { Button } from "@/shared/ui/button";
import { ArrowUpDown, ChevronLeft, ChevronRight, Settings2 } from "lucide-react";
import type { AdData, Product } from "../types";
import { formatNumber, formatPercentage, formatCurrency } from "../utils";

interface PerformanceTableProps {
  product: Product;
  data: AdData[];
  isLoading?: boolean;
  searchQuery?: string;
}

type ColumnKey =
  | "date"
  | "creative_id"
  | "ad_name"
  | "campaign_name"
  | "platform"
  | "cost"
  | "impressions"
  | "clicks"
  | "ctr"
  | "hook_rate"
  | "video_3s"
  | "signups"
  | "activations"
  | "cpa"
  | "cac"
  | "cpm"
  | "pos_sales"
  | "piselli_sales"
  | "fifth_transaction";

type SortDirection = "asc" | "desc";

interface ColumnConfig {
  key: ColumnKey;
  label: string;
  defaultVisible: boolean;
  sortable: boolean;
  format?: (value: any) => string;
}

const COLUMNS: ColumnConfig[] = [
  { key: "date", label: "Data", defaultVisible: true, sortable: true },
  { key: "creative_id", label: "Criativo ID", defaultVisible: true, sortable: false },
  { key: "ad_name", label: "Nome do Anúncio", defaultVisible: true, sortable: true },
  { key: "campaign_name", label: "Campanha", defaultVisible: true, sortable: true },
  { key: "platform", label: "Plataforma", defaultVisible: true, sortable: true },
  { key: "cost", label: "Custo", defaultVisible: true, sortable: true, format: formatCurrency },
  { key: "impressions", label: "Impressões", defaultVisible: true, sortable: true, format: formatNumber },
  { key: "clicks", label: "Clicks", defaultVisible: true, sortable: true, format: formatNumber },
  { key: "ctr", label: "CTR", defaultVisible: true, sortable: true, format: formatPercentage },
  { key: "hook_rate", label: "Hook Rate", defaultVisible: false, sortable: true, format: formatPercentage },
  { key: "video_3s", label: "Video 3s", defaultVisible: false, sortable: true, format: formatNumber },
  { key: "signups", label: "Signups", defaultVisible: true, sortable: true, format: formatNumber },
  { key: "activations", label: "Ativações", defaultVisible: false, sortable: true, format: formatNumber },
  { key: "cpa", label: "CPA", defaultVisible: true, sortable: true, format: formatCurrency },
  { key: "cac", label: "CAC", defaultVisible: false, sortable: true, format: formatCurrency },
  { key: "cpm", label: "CPM", defaultVisible: false, sortable: true, format: formatCurrency },
  { key: "pos_sales", label: "Vendas POS", defaultVisible: false, sortable: true, format: formatNumber },
  { key: "piselli_sales", label: "Piselli", defaultVisible: false, sortable: true, format: formatNumber },
  { key: "fifth_transaction", label: "5ª Transação", defaultVisible: false, sortable: true, format: formatNumber },
];

export function PerformanceTable({ product, data, isLoading, searchQuery }: PerformanceTableProps) {
  const [sortKey, setSortKey] = useState<ColumnKey>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleColumns, setVisibleColumns] = useState<Set<ColumnKey>>(
    new Set(COLUMNS.filter((c) => c.defaultVisible).map((c) => c.key))
  );
  const itemsPerPage = 10;

  // Filter data by search query (MUST be before early return!)
  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    const query = searchQuery.toLowerCase();
    return data.filter(
      (ad) =>
        ad.ad_name?.toLowerCase().includes(query) ||
        ad.campaign_name?.toLowerCase().includes(query)
    );
  }, [data, searchQuery]);

  // Sort data (MUST be before early return!)
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      let aValue: any = a[sortKey];
      let bValue: any = b[sortKey];

      // Handle null/undefined
      if (aValue === null || aValue === undefined) aValue = sortDirection === "asc" ? Infinity : -Infinity;
      if (bValue === null || bValue === undefined) bValue = sortDirection === "asc" ? Infinity : -Infinity;

      // String comparison
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      // Number comparison
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    });
  }, [filteredData, sortKey, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  // Early return for loading state (AFTER all hooks!)
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tabela Detalhada</CardTitle>
          <CardDescription>Performance por criativo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleSort = (key: ColumnKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("desc");
    }
    setCurrentPage(1);
  };

  const toggleColumn = (columnKey: ColumnKey) => {
    const newVisible = new Set(visibleColumns);
    if (newVisible.has(columnKey)) {
      newVisible.delete(columnKey);
    } else {
      newVisible.add(columnKey);
    }
    setVisibleColumns(newVisible);
  };

  const visibleColumnConfigs = COLUMNS.filter((c) => visibleColumns.has(c.key));

  const SortButton = ({ column }: { column: ColumnConfig }) => {
    if (!column.sortable) return <span>{column.label}</span>;

    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleSort(column.key)}
        className="gap-1 h-8 px-2 hover:bg-muted -ml-2"
      >
        {column.label}
        <ArrowUpDown className="h-3 w-3" />
      </Button>
    );
  };

  const renderCellValue = (ad: AdData, column: ColumnConfig) => {
    const value = ad[column.key];

    // Special rendering for specific columns
    if (column.key === "creative_id") {
      return (
        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
          {value?.toString().slice(0, 12) || "N/A"}...
        </code>
      );
    }

    if (column.key === "platform") {
      return <Badge variant="outline">{value}</Badge>;
    }

    if (column.key === "ad_name" || column.key === "campaign_name") {
      return (
        <div className="max-w-[200px] truncate" title={value?.toString()}>
          {value || "—"}
        </div>
      );
    }

    if (column.key === "ctr") {
      return (
        <span className="text-green-600 dark:text-green-400">
          {column.format ? column.format(value) : value || "—"}
        </span>
      );
    }

    // Default formatting
    return column.format ? column.format(value) : value || "—";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Tabela Detalhada - {product}</CardTitle>
            <CardDescription>
              {sortedData.length} criativos • Página {currentPage} de {totalPages || 1}
              {searchQuery && ` • Buscando por "${searchQuery}"`}
            </CardDescription>
          </div>
          
          {/* Column Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Settings2 className="h-4 w-4" />
                Colunas ({visibleColumns.size})
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Colunas Visíveis</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {COLUMNS.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.key}
                  checked={visibleColumns.has(column.key)}
                  onCheckedChange={() => toggleColumn(column.key)}
                >
                  {column.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {visibleColumnConfigs.map((column) => (
                  <TableHead key={column.key} className={column.sortable ? "cursor-pointer" : ""}>
                    <SortButton column={column} />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((ad, idx) => (
                <TableRow key={`${ad.creative_id}-${ad.date}-${idx}`}>
                  {visibleColumnConfigs.map((column) => (
                    <TableCell key={column.key} className={column.key === "cost" || column.key === "cpa" || column.key === "cac" ? "font-medium" : ""}>
                      {renderCellValue(ad, column)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, sortedData.length)}{" "}
            de {sortedData.length} resultados
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <div className="text-sm font-medium">
              {currentPage} / {totalPages || 1}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              Próxima
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
