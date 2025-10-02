"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Skeleton } from "@/shared/ui/skeleton";
import { Trophy, TrendingUp, Eye, MousePointer, DollarSign, Zap } from "lucide-react";
import type { AdData, Product } from "../types";
import { formatNumber, formatPercentage, formatCurrency } from "../utils";

interface BestAdsProps {
  product: Product;
  data: AdData[];
  isLoading?: boolean;
}

export function BestAds({ product, data, isLoading }: BestAdsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <h3 className="text-lg font-semibold">Top 3 Criativos Winners</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[280px] w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Calculate average metrics for comparison
  const avgCTR = data.reduce((sum, ad) => sum + (ad.ctr || 0), 0) / data.length;
  const avgHookRate = data.reduce((sum, ad) => sum + (ad.hook_rate || 0), 0) / data.length;

  // Sort by performance score (CTR + Hook Rate)
  const topAds = [...data]
    .sort((a, b) => {
      const scoreA = (a.ctr || 0) * 0.5 + (a.hook_rate || 0) * 0.5;
      const scoreB = (b.ctr || 0) * 0.5 + (b.hook_rate || 0) * 0.5;
      return scoreB - scoreA;
    })
    .slice(0, 3);

  if (topAds.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <h3 className="text-lg font-semibold">Top 3 Criativos Winners</h3>
        </div>
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground">
              <Trophy className="h-12 w-12 mb-2 opacity-20" />
              <p>Nenhum dado disponível para {product}</p>
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

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Trophy className="h-5 w-5 text-yellow-500" />
        <h3 className="text-lg font-semibold">Top 3 Criativos Winners - {product}</h3>
        <Badge variant="secondary" className="ml-2">
          Ranqueados por CTR + Hook Rate
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {topAds.map((ad, index) => {
          const ctrDiff = avgCTR > 0 ? ((ad.ctr || 0) - avgCTR) / avgCTR * 100 : 0;
          const hookRateDiff = avgHookRate > 0 ? ((ad.hook_rate || 0) - avgHookRate) / avgHookRate * 100 : 0;

          return (
            <Card
              key={`${ad.creative_id}-${index}`}
              className={`relative overflow-hidden border-2 bg-gradient-to-br ${getRankColor(index)}`}
            >
              {/* Rank Badge */}
              <div className="absolute top-4 right-4 text-4xl opacity-50">
                {getRankIcon(index)}
              </div>

              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base line-clamp-2 pr-12">
                      {ad.ad_name || ad.creative_id}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {ad.campaign_name || "Sem campanha"}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {ad.platform}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {ad.date}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Why is Winner Section */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <Trophy className="h-3 w-3" />
                    Por que é Winner?
                  </p>
                  
                  <div className="space-y-1.5">
                    {/* CTR */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1.5">
                        <MousePointer className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                        <span className="text-xs">CTR:</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          {formatPercentage(ad.ctr)}
                        </span>
                        {ctrDiff !== 0 && (
                          <Badge variant={ctrDiff > 0 ? "default" : "destructive"} className="text-xs">
                            {ctrDiff > 0 ? "+" : ""}{ctrDiff.toFixed(0)}%
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Hook Rate */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1.5">
                        <Zap className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                        <span className="text-xs">Hook Rate:</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          {formatPercentage(ad.hook_rate)}
                        </span>
                        {hookRateDiff !== 0 && (
                          <Badge variant={hookRateDiff > 0 ? "default" : "destructive"} className="text-xs">
                            {hookRateDiff > 0 ? "+" : ""}{hookRateDiff.toFixed(0)}%
                          </Badge>
                        )}
                      </div>
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
                    <span>Top {index + 1} em Performance</span>
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
          <div className="flex items-center justify-around text-sm">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">CTR Médio</p>
              <p className="font-semibold">{formatPercentage(avgCTR)}</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Hook Rate Médio</p>
              <p className="font-semibold">{formatPercentage(avgHookRate)}</p>
            </div>
            <div className="h-8 w-px bg-border" />
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
