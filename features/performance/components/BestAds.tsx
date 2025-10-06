"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Skeleton } from "@/shared/ui/skeleton";
import { Button } from "@/shared/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Trophy, TrendingUp, Eye, MousePointer, DollarSign, Zap, Users, Target } from "lucide-react";
import { CreativePreview } from "./CreativePreview";
import type { AdData, Product, RangePreset } from "../types";
import { formatNumber, formatPercentage, formatCurrency } from "../utils";

type RankingCriteria = "best_cac" | "best_hook" | "most_signups";

interface BestAdsProps {
  product: Product;
  data: AdData[];
  isLoading?: boolean;
  mode?: "overview" | "drilldown"; // overview: 1 por plataforma, drilldown: Top 3 do produto
  range?: RangePreset; // Para indicar período na UI
}

export function BestAds({ product, data, isLoading, mode = "drilldown", range = "7d" }: BestAdsProps) {
  const isOverviewMode = mode === "overview";
  const [criteria, setCriteria] = useState<RankingCriteria>("best_cac");

  // Get period label for UI
  const getPeriodLabel = (range: RangePreset): string => {
    switch (range) {
      case "yesterday":
        return "de ontem";
      case "7d":
        return "dos últimos 7 dias";
      case "30d":
        return "dos últimos 30 dias";
      case "custom":
        return "do período selecionado";
      default:
        return "dos últimos 7 dias";
    }
  };

  // Calculate average metrics for comparison (MUST be before early returns!)
  const avgCAC = useMemo(() => {
    const validCACs = data.filter(ad => ad.cac !== null && ad.cac !== undefined && ad.cac > 0);
    if (validCACs.length === 0) return 0;
    return validCACs.reduce((sum, ad) => sum + (ad.cac || 0), 0) / validCACs.length;
  }, [data]);

  const avgHookRate = useMemo(() => {
    return data.reduce((sum, ad) => sum + (ad.hook_rate || 0), 0) / (data.length || 1);
  }, [data]);

  // Ranking functions based on criteria
  const rankByCriteria = (ads: AdData[], criteria: RankingCriteria): AdData[] => {
    switch (criteria) {
      case "best_cac":
        // Melhor CAC (menor é melhor, filtrar CAC válidos)
        const adsWithCAC = [...ads].filter(ad => ad.cac !== null && ad.cac !== undefined && ad.cac > 0);
        
        if (adsWithCAC.length > 0) {
          // Se houver anúncios com CAC, usar CAC
          return adsWithCAC.sort((a, b) => (a.cac || Infinity) - (b.cac || Infinity));
        } else {
          // FALLBACK: Se nenhum anúncio tem CAC, usar Hook Rate + CTR como proxy
          console.warn("⚠️ [BestAds] Nenhum anúncio com CAC válido. Usando Hook Rate como fallback.");
          return [...ads].sort((a, b) => {
            const scoreA = (a.hook_rate || 0) * 0.6 + (a.ctr || 0) * 0.4;
            const scoreB = (b.hook_rate || 0) * 0.6 + (b.ctr || 0) * 0.4;
            return scoreB - scoreA;
          });
        }
      
      case "best_hook":
        // Melhor Hook Rate (maior é melhor)
        return [...ads].sort((a, b) => (b.hook_rate || 0) - (a.hook_rate || 0));
      
      case "most_signups":
        // Mais Signups (maior é melhor)
        const adsWithSignups = [...ads].filter(ad => (ad.signups || 0) > 0);
        
        if (adsWithSignups.length > 0) {
          return adsWithSignups.sort((a, b) => (b.signups || 0) - (a.signups || 0));
        } else {
          // FALLBACK: Se nenhum anúncio tem signups, usar impressões como proxy
          console.warn("⚠️ [BestAds] Nenhum anúncio com signups válidos. Usando impressões como fallback.");
          return [...ads].sort((a, b) => (b.impressions || 0) - (a.impressions || 0));
        }
      
      default:
        return ads;
    }
  };

  // Get top ads based on mode and criteria
  const topAds = useMemo(() => {
    console.log("🏆 [BestAds] Calculating topAds:", {
      dataLength: data.length,
      isOverviewMode,
      criteria,
      sampleAd: data[0],
    });

    let result: AdData[];

    if (isOverviewMode) {
      // Overview Mode: 1 winner por plataforma (META, GOOGLE, TIKTOK)
      const platforms = ["META", "GOOGLE", "TIKTOK"] as const;
      result = platforms
        .map(platform => {
          const platformAds = data.filter(ad => ad.platform === platform);
          console.log(`🔍 [BestAds] Platform ${platform}:`, {
            totalAds: platformAds.length,
            adsWithCAC: platformAds.filter(ad => ad.cac && ad.cac > 0).length,
            criteria,
          });
          
          if (platformAds.length === 0) return null;
          
          // Sort by criteria and get the best one
          const ranked = rankByCriteria(platformAds, criteria);
          console.log(`✅ [BestAds] Best ${platform} ad:`, {
            ad_name: ranked[0]?.ad_name,
            cac: ranked[0]?.cac,
            hook_rate: ranked[0]?.hook_rate,
            ctr: ranked[0]?.ctr,
            creative_id: ranked[0]?.creative_id,
            creative_link: ranked[0]?.creative_link,
            platform: ranked[0]?.platform,
          });
          return ranked[0] || null;
        })
        .filter((ad): ad is AdData => ad !== null);
    } else {
      // Drilldown Mode: Top 3 do produto
      const ranked = rankByCriteria(data, criteria);
      result = ranked.slice(0, 3);
    }

    console.log("🎯 [BestAds] Final topAds:", {
      count: result.length,
      ads: result.map(ad => ({ ad_name: ad.ad_name, cac: ad.cac, platform: ad.platform })),
    });

    return result;
  }, [data, isOverviewMode, criteria]);

  // NOW we can do early returns (after all hooks)
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <h3 className="text-lg font-semibold">
              {isOverviewMode ? "Top Winners por Plataforma" : "Top 3 Criativos Winners"}
            </h3>
          </div>
          <Skeleton className="h-10 w-[180px]" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[450px] w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (topAds.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <h3 className="text-lg font-semibold">
            {isOverviewMode ? "Top Winners por Plataforma" : "Top 3 Criativos Winners"}
          </h3>
        </div>
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground">
              <Trophy className="h-12 w-12 mb-2 opacity-20" />
              <p>Nenhum dado disponível{isOverviewMode ? "" : ` para ${product}`}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return "🥇";
      case 1:
        return "🥈";
      case 2:
        return "🥉";
      default:
        return "🏆";
    }
  };

  const getRankColor = (index: number) => {
    switch (index) {
      case 0:
        return "from-yellow-500/20 to-yellow-600/20 border-yellow-500/50";
      case 1:
        return "from-gray-400/20 to-gray-500/20 border-gray-400/50";
      case 2:
        return "from-orange-600/20 to-orange-700/20 border-orange-600/50";
      default:
        return "from-primary/20 to-accent/20 border-primary/50";
    }
  };

  // Get criteria label and icon
  const getCriteriaInfo = (criteria: RankingCriteria) => {
    switch (criteria) {
      case "best_cac":
        return { label: "Melhor CAC", icon: Target };
      case "best_hook":
        return { label: "Melhor Hook Rate", icon: Zap };
      case "most_signups":
        return { label: "Mais Signups", icon: Users };
    }
  };

  const criteriaInfo = getCriteriaInfo(criteria);
  const CriteriaIcon = criteriaInfo.icon;

  return (
    <div className="space-y-4">
      {/* Header with criteria selector */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <div>
            <h3 className="text-lg font-semibold">
              {isOverviewMode 
                ? "Top Winners por Plataforma" 
                : `Top 3 Criativos Winners - ${product}`}
            </h3>
            <p className="text-sm text-muted-foreground">
              {criteriaInfo.label} {getPeriodLabel(range)}
            </p>
          </div>
        </div>
        
        {/* Criteria Selector */}
        <Select value={criteria} onValueChange={(value) => setCriteria(value as RankingCriteria)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="best_cac">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <span>Melhor CAC</span>
              </div>
            </SelectItem>
            <SelectItem value="best_hook">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span>Melhor Hook Rate</span>
              </div>
            </SelectItem>
            <SelectItem value="most_signups">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Mais Signups</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Winners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {topAds.map((ad, index) => {
          // Calculate comparison with average
          const cacDiff = avgCAC > 0 && ad.cac ? ((ad.cac - avgCAC) / avgCAC * 100) : 0;
          const hookRateDiff = avgHookRate > 0 ? ((ad.hook_rate || 0) - avgHookRate) / avgHookRate * 100 : 0;

          return (
            <Card
              key={`${ad.creative_id}-${index}`}
              className={`relative overflow-hidden border-2 bg-gradient-to-br ${getRankColor(index)} cursor-pointer hover:shadow-lg transition-shadow`}
              onClick={() => {
                // TODO: Open modal with full ad details
                console.log("Ad clicked:", ad);
              }}
            >
              {/* Rank Badge */}
              <div className="absolute top-4 right-4 text-4xl opacity-50 z-10">
                {getRankIcon(index)}
              </div>

              {/* Creative Preview */}
              <div className="relative h-64 overflow-hidden bg-black">
                <CreativePreview
                  creativeId={ad.creative_id}
                  creativeLink={ad.creative_link}
                  platform={ad.platform || "UNKNOWN"}
                  adName={ad.ad_name}
                />
              </div>

              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-12">
                    <CardTitle className="text-base line-clamp-2">
                      {ad.ad_name || ad.creative_id}
                    </CardTitle>
                    <CardDescription className="mt-1 line-clamp-1">
                      {ad.campaign_name || "Sem campanha"}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    {ad.platform}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {ad.date}
                  </Badge>
                  {ad.product && (
                    <Badge variant="default" className="text-xs">
                      {ad.product}
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Why is Winner Section */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <CriteriaIcon className="h-3 w-3" />
                    Por que é Winner?
                  </p>
                  
                  <div className="space-y-1.5">
                    {/* CAC */}
                    {ad.cac !== null && ad.cac !== undefined && ad.cac > 0 ? (
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1.5">
                          <Target className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                          <span className="text-xs">CAC:</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-blue-600 dark:text-blue-400">
                            {formatCurrency(ad.cac)}
                          </span>
                          {criteria === "best_cac" && cacDiff !== 0 && (
                            <Badge variant={cacDiff < 0 ? "default" : "destructive"} className="text-xs">
                              {cacDiff > 0 ? "+" : ""}{cacDiff.toFixed(0)}%
                            </Badge>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1.5">
                          <Target className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs">CAC:</span>
                        </div>
                        <span className="text-xs text-muted-foreground">Sem dados</span>
                      </div>
                    )}

                    {/* Hook Rate */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1.5">
                        <Zap className="h-3.5 w-3.5 text-yellow-600 dark:text-yellow-400" />
                        <span className="text-xs">Hook Rate:</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                          {formatPercentage(ad.hook_rate)}
                        </span>
                        {criteria === "best_hook" && hookRateDiff !== 0 && (
                          <Badge variant={hookRateDiff > 0 ? "default" : "secondary"} className="text-xs">
                            {hookRateDiff > 0 ? "+" : ""}{hookRateDiff.toFixed(0)}%
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Signups */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1.5">
                        <Users className={`h-3.5 w-3.5 ${(ad.signups || 0) > 0 ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`} />
                        <span className="text-xs">Signups:</span>
                      </div>
                      {(ad.signups || 0) > 0 ? (
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          {formatNumber(ad.signups)}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Sem dados</span>
                      )}
                    </div>

                    {/* CTR */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1.5">
                        <MousePointer className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs">CTR:</span>
                      </div>
                      <span className="font-medium">{formatPercentage(ad.ctr)}</span>
                    </div>

                    {/* Impressions */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1.5">
                        <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs">Impressões:</span>
                      </div>
                      <span className="font-medium">{formatNumber(ad.impressions)}</span>
                    </div>

                    {/* Cost */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs">Custo:</span>
                      </div>
                      <span className="font-medium">{formatCurrency(ad.cost)}</span>
                    </div>
                  </div>
                </div>

                {/* Performance Badge */}
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3" />
                    <span>Top {index + 1} - {criteriaInfo.label}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Average Stats */}
      <Card className="bg-muted/30">
        <CardContent className="py-4">
          <div className="flex items-center justify-around text-sm flex-wrap gap-4">
            {avgCAC > 0 && (
              <>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">CAC Médio</p>
                  <p className="font-semibold">{formatCurrency(avgCAC)}</p>
                </div>
                <div className="h-8 w-px bg-border hidden sm:block" />
              </>
            )}
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Hook Rate Médio</p>
              <p className="font-semibold">{formatPercentage(avgHookRate)}</p>
            </div>
            <div className="h-8 w-px bg-border hidden sm:block" />
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Total de Criativos</p>
              <p className="font-semibold">{data.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
