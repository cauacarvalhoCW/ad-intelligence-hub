"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Badge } from "@/shared/ui/badge";
import { Calendar, Filter, X } from "lucide-react";

const DATE_PRESETS = [
  { value: "last_7_days", label: "Últimos 7 dias" },
  { value: "last_30_days", label: "Últimos 30 dias" },
  { value: "last_90_days", label: "Últimos 90 dias" },
  { value: "this_month", label: "Este mês" },
  { value: "last_month", label: "Mês passado" },
];

const PLATFORMS = [
  { value: "all", label: "Todas as plataformas" },
  { value: "meta", label: "Meta" },
  { value: "google", label: "Google" },
  { value: "tiktok", label: "TikTok" },
];

export function PerformanceFilters() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const [localFilters, setLocalFilters] = useState({
    platform: searchParams.get("platform") || "all",
    dateFrom: searchParams.get("dateFrom") || "",
    dateTo: searchParams.get("dateTo") || "",
    preset: searchParams.get("preset") || "custom",
  });

  const [appliedFilters, setAppliedFilters] = useState({ ...localFilters });

  const hasActiveFilters =
    appliedFilters.platform !== "all" ||
    appliedFilters.dateFrom !== "" ||
    appliedFilters.dateTo !== "" ||
    (appliedFilters.preset !== "custom" && appliedFilters.preset !== "");

  const hasUnappliedChanges =
    JSON.stringify(localFilters) !== JSON.stringify(appliedFilters);

  const applyFilters = () => {
    const newParams = new URLSearchParams();

    // Manter parâmetros da URL atual que não são filtros
    searchParams.forEach((value, key) => {
      if (!["platform", "dateFrom", "dateTo", "preset"].includes(key)) {
        newParams.set(key, value);
      }
    });

    // Aplicar novos filtros
    if (localFilters.platform !== "all") {
      newParams.set("platform", localFilters.platform);
    }

    if (localFilters.preset && localFilters.preset !== "custom") {
      newParams.set("preset", localFilters.preset);
    } else {
      if (localFilters.dateFrom) newParams.set("dateFrom", localFilters.dateFrom);
      if (localFilters.dateTo) newParams.set("dateTo", localFilters.dateTo);
    }

    const perspectiva = params.perspectiva as string;
    const produto = params.produto as string | undefined;
    
    const basePath = produto 
      ? `/${perspectiva}/performance/${produto}`
      : `/${perspectiva}/performance`;

    const newPath = newParams.toString()
      ? `${basePath}?${newParams.toString()}`
      : basePath;

    router.push(newPath);
    setAppliedFilters({ ...localFilters });
  };

  const clearFilters = () => {
    const clearedFilters = {
      platform: "all",
      dateFrom: "",
      dateTo: "",
      preset: "custom",
    };
    setLocalFilters(clearedFilters);
    setAppliedFilters(clearedFilters);

    const perspectiva = params.perspectiva as string;
    const produto = params.produto as string | undefined;
    
    const basePath = produto 
      ? `/${perspectiva}/performance/${produto}`
      : `/${perspectiva}/performance`;

    router.push(basePath);
  };

  // Sincronizar com URL quando mudar externamente
  useEffect(() => {
    const newFilters = {
      platform: searchParams.get("platform") || "all",
      dateFrom: searchParams.get("dateFrom") || "",
      dateTo: searchParams.get("dateTo") || "",
      preset: searchParams.get("preset") || "custom",
    };
    setLocalFilters(newFilters);
    setAppliedFilters(newFilters);
  }, [searchParams]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              Limpar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Plataforma */}
        <div>
          <label className="text-sm font-medium mb-2 block">Plataforma</label>
          <Select
            value={localFilters.platform}
            onValueChange={(value) =>
              setLocalFilters({ ...localFilters, platform: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma plataforma" />
            </SelectTrigger>
            <SelectContent>
              {PLATFORMS.map((platform) => (
                <SelectItem key={platform.value} value={platform.value}>
                  {platform.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Período - Presets */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Período (Preset)
          </label>
          <Select
            value={localFilters.preset}
            onValueChange={(value) =>
              setLocalFilters({ 
                ...localFilters, 
                preset: value,
                dateFrom: value !== "custom" ? "" : localFilters.dateFrom, // Só limpar datas ao usar preset real
                dateTo: value !== "custom" ? "" : localFilters.dateTo,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="custom">Personalizado</SelectItem>
              {DATE_PRESETS.map((preset) => (
                <SelectItem key={preset.value} value={preset.value}>
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Datas Customizadas (só aparecem se preset for "custom") */}
        {localFilters.preset === "custom" && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Data Inicial
              </label>
              <Input
                type="date"
                value={localFilters.dateFrom}
                onChange={(e) =>
                  setLocalFilters({ ...localFilters, dateFrom: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Data Final
              </label>
              <Input
                type="date"
                value={localFilters.dateTo}
                onChange={(e) =>
                  setLocalFilters({ ...localFilters, dateTo: e.target.value })
                }
              />
            </div>
          </div>
        )}

        {/* Aplicar Filtros */}
        <div className="flex gap-2 pt-4 border-t">
          <Button
            onClick={applyFilters}
            disabled={!hasUnappliedChanges}
            className="flex-1"
          >
            {hasUnappliedChanges ? "Aplicar Filtros" : "Filtros Aplicados"}
          </Button>
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters} className="px-4">
              Limpar
            </Button>
          )}
        </div>

        {/* Filtros Ativos */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            {appliedFilters.platform !== "all" && (
              <Badge variant="secondary" className="gap-1">
                {PLATFORMS.find((p) => p.value === appliedFilters.platform)?.label}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => {
                    setLocalFilters({ ...localFilters, platform: "all" });
                    applyFilters();
                  }}
                />
              </Badge>
            )}
            {appliedFilters.preset && appliedFilters.preset !== "custom" && (
              <Badge variant="secondary" className="gap-1">
                {DATE_PRESETS.find((p) => p.value === appliedFilters.preset)?.label}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => {
                    setLocalFilters({ ...localFilters, preset: "custom" });
                    applyFilters();
                  }}
                />
              </Badge>
            )}
            {appliedFilters.dateFrom && appliedFilters.preset === "custom" && (
              <Badge variant="secondary" className="gap-1">
                De: {new Date(appliedFilters.dateFrom).toLocaleDateString('pt-BR')}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => {
                    setLocalFilters({ ...localFilters, dateFrom: "" });
                    applyFilters();
                  }}
                />
              </Badge>
            )}
            {appliedFilters.dateTo && appliedFilters.preset === "custom" && (
              <Badge variant="secondary" className="gap-1">
                Até: {new Date(appliedFilters.dateTo).toLocaleDateString('pt-BR')}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => {
                    setLocalFilters({ ...localFilters, dateTo: "" });
                    applyFilters();
                  }}
                />
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

