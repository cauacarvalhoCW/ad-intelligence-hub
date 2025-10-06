"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Badge } from "@/shared/ui/badge";
import { Trophy, TrendingUp } from "lucide-react";
import { AdData, Product } from "../types";
import { getWinnersByPlatform, getTop5ByPlatform } from "../utils/winners-logic";
import { WinnerCard } from "./WinnerCard";
import { useWinnersCreativeLinks } from "../hooks/useWinnersCreativeLinks";

// ============================================
// WINNERS SECTION - BEST ADS SHOWCASE
// ============================================
// Overview mode: 1 winner per platform
// Drilldown mode: Top 5 per platform (tabs)
// ============================================

interface WinnersSectionProps {
  ads: AdData[];
  mode: "overview" | "drilldown";
  product?: Product;
  isLoading?: boolean;
}

export function WinnersSection({ ads, mode, product, isLoading }: WinnersSectionProps) {
  const winners = useMemo(() => {
    if (ads.length === 0) return null;

    return mode === "overview"
      ? getWinnersByPlatform(ads, product)
      : getTop5ByPlatform(ads, product);
  }, [ads, mode, product]);

  // Pré-carregar creative_links para winners META
  const allWinners = useMemo(() => {
    if (!winners) return [];
    return [...winners.META, ...winners.GOOGLE, ...winners.TIKTOK];
  }, [winners]);

  const creativeCache = useWinnersCreativeLinks(allWinners);

  // Helper para obter creative_link e preview do cache
  const getCreativeData = (ad: AdData) => {
    if (!ad.ad_id) return { creativeLink: null, previewImage: null, loading: false };
    const cached = creativeCache[ad.ad_id];
    return {
      creativeLink: cached?.creative_link || ad.creative_link || null,
      previewImage: cached?.image_preview_link || ad.image_preview_link || null,
      loading: cached?.loading || false,
    };
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            <CardTitle>Melhores Anúncios</CardTitle>
          </div>
          <CardDescription>Carregando winners...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!winners || (winners.META.length === 0 && winners.GOOGLE.length === 0 && winners.TIKTOK.length === 0)) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            <CardTitle>Melhores Anúncios</CardTitle>
          </div>
          <CardDescription>Nenhum anúncio disponível no período selecionado</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (mode === "overview") {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            <CardTitle>Melhores Anúncios por Plataforma</CardTitle>
          </div>
          <CardDescription>
            Top performer de cada plataforma baseado em CAC, Hook Rate e Signups
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* META Winner */}
            {winners.META.length > 0 ? (() => {
              const { creativeLink, previewImage, loading } = getCreativeData(winners.META[0]);
              return (
                <WinnerCard 
                  ad={winners.META[0]} 
                  badge="META Winner" 
                  creativeLink={creativeLink}
                  previewImage={previewImage}
                  loadingCreative={loading}
                />
              );
            })() : (
              <EmptyPlatformCard platform="META" />
            )}

            {/* GOOGLE Winner */}
            {winners.GOOGLE.length > 0 ? (() => {
              const { creativeLink, previewImage, loading } = getCreativeData(winners.GOOGLE[0]);
              return (
                <WinnerCard 
                  ad={winners.GOOGLE[0]} 
                  badge="GOOGLE Winner" 
                  creativeLink={creativeLink}
                  previewImage={previewImage}
                  loadingCreative={loading}
                />
              );
            })() : (
              <EmptyPlatformCard platform="GOOGLE" />
            )}

            {/* TIKTOK Winner */}
            {winners.TIKTOK.length > 0 ? (() => {
              const { creativeLink, previewImage, loading } = getCreativeData(winners.TIKTOK[0]);
              return (
                <WinnerCard 
                  ad={winners.TIKTOK[0]} 
                  badge="TIKTOK Winner" 
                  creativeLink={creativeLink}
                  previewImage={previewImage}
                  loadingCreative={loading}
                />
              );
            })() : (
              <EmptyPlatformCard platform="TIKTOK" />
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Drilldown mode: Top 5 per platform with tabs
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          <CardTitle>Top 5 Anúncios por Plataforma</CardTitle>
        </div>
        <CardDescription>
          {product ? `Melhores anúncios de ${product}` : "Melhores anúncios"} em cada plataforma
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="meta" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="meta" className="flex items-center gap-2">
              <Badge variant="outline" className="text-blue-600 dark:text-blue-400">
                META
              </Badge>
              <span className="text-xs">({winners.META.length})</span>
            </TabsTrigger>
            <TabsTrigger value="google" className="flex items-center gap-2">
              <Badge variant="outline" className="text-green-600 dark:text-green-400">
                GOOGLE
              </Badge>
              <span className="text-xs">({winners.GOOGLE.length})</span>
            </TabsTrigger>
            <TabsTrigger value="tiktok" className="flex items-center gap-2">
              <Badge variant="outline" className="text-pink-600 dark:text-pink-400">
                TIKTOK
              </Badge>
              <span className="text-xs">({winners.TIKTOK.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="meta" className="mt-4">
            {winners.META.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {winners.META.map((ad, index) => {
                  const { creativeLink, previewImage, loading } = getCreativeData(ad);
                  return (
                    <WinnerCard 
                      key={`meta-${ad.ad_id}-${ad.date || index}`} 
                      ad={ad} 
                      rank={index + 1} 
                      badge="META"
                      creativeLink={creativeLink}
                      previewImage={previewImage}
                      loadingCreative={loading}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Nenhum anúncio META encontrado
              </div>
            )}
          </TabsContent>

          <TabsContent value="google" className="mt-4">
            {winners.GOOGLE.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {winners.GOOGLE.map((ad, index) => {
                  const { creativeLink, previewImage, loading } = getCreativeData(ad);
                  return (
                    <WinnerCard 
                      key={`google-${ad.ad_id}-${ad.date || index}`} 
                      ad={ad} 
                      rank={index + 1} 
                      badge="GOOGLE"
                      creativeLink={creativeLink}
                      previewImage={previewImage}
                      loadingCreative={loading}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Nenhum anúncio GOOGLE encontrado
              </div>
            )}
          </TabsContent>

          <TabsContent value="tiktok" className="mt-4">
            {winners.TIKTOK.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {winners.TIKTOK.map((ad, index) => {
                  const { creativeLink, previewImage, loading } = getCreativeData(ad);
                  return (
                    <WinnerCard 
                      key={`tiktok-${ad.ad_id}-${ad.date || index}`} 
                      ad={ad} 
                      rank={index + 1} 
                      badge="TIKTOK"
                      creativeLink={creativeLink}
                      previewImage={previewImage}
                      loadingCreative={loading}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Nenhum anúncio TIKTOK encontrado
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function EmptyPlatformCard({ platform }: { platform: string }) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center h-64 text-center p-4">
        <TrendingUp className="h-8 w-8 text-muted-foreground/50 mb-2" />
        <p className="text-sm text-muted-foreground">Nenhum anúncio {platform}</p>
        <p className="text-xs text-muted-foreground mt-1">no período selecionado</p>
      </CardContent>
    </Card>
  );
}
