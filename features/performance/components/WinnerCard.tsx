"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { ExternalLink, TrendingUp, Maximize2, Loader2 } from "lucide-react";
import { AdData, Platform } from "../types";
import { formatCurrency, formatPercentage, formatNumber } from "../utils";
import { WinnerModal } from "./WinnerModal";

// ============================================
// WINNER CARD V2 - RICH UI SIMILAR TO COMPETITORS
// ============================================
// Shows ad preview embedded (YouTube for Google, thumbnail for Meta)
// Click to expand full modal with details
// ============================================

interface WinnerCardProps {
  ad: AdData;
  rank?: number;
  badge?: string;
  creativeLink?: string | null;
  previewImage?: string | null;
  loadingCreative?: boolean;
}

export function WinnerCard({ 
  ad, 
  rank, 
  badge = "Winner",
  creativeLink,
  previewImage,
  loadingCreative,
}: WinnerCardProps) {
  const [showModal, setShowModal] = useState(false);

  const platformColors: Record<Platform, string> = {
    META: "border-blue-500/30 bg-blue-500/5",
    GOOGLE: "border-green-500/30 bg-green-500/5",
    TIKTOK: "border-pink-500/30 bg-pink-500/5",
  };

  const platformColor = platformColors[ad.platform as Platform] || "border-border bg-card";

  // Extract YouTube ID for Google ads
  const getYouTubeVideoId = (url: string | null): string | null => {
    if (!url) return null;
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const youtubeId = ad.platform?.toUpperCase() === "GOOGLE" ? getYouTubeVideoId(ad.creative_link) : null;

  return (
    <>
      <Card className={`relative overflow-hidden border-2 ${platformColor} hover:shadow-lg transition-shadow`}>
        {/* Rank Badge */}
        {rank && (
          <div className="absolute top-3 left-3 z-10">
            <Badge variant="secondary" className="font-bold text-sm px-3 py-1">
              #{rank}
            </Badge>
          </div>
        )}

        {/* Winner Badge */}
        <div className="absolute top-3 right-3 z-10">
          <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-semibold">
            <TrendingUp className="h-3 w-3 mr-1" />
            {badge}
          </Badge>
        </div>

        <CardContent className="p-0">
          {/* Preview Visual - Main Feature */}
          <div className="relative bg-gray-100 dark:bg-gray-900 h-64 overflow-hidden">
            {loadingCreative ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground">Carregando preview...</p>
                </div>
              </div>
            ) : youtubeId ? (
              // Google: YouTube Embed
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}`}
                className="w-full h-full border-0"
                title={ad.ad_name || "YouTube Ad"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : previewImage ? (
              // Meta: Thumbnail Image
              <img
                src={previewImage}
                alt={ad.ad_name || "Ad preview"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.parentElement!.innerHTML = `
                    <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                      <p class="text-sm text-gray-500">Preview não disponível</p>
                    </div>
                  `;
                }}
              />
            ) : ad.platform?.toUpperCase() === "TIKTOK" ? (
              // TikTok: Placeholder (futuro)
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-900/20 dark:to-pink-800/20">
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">TikTok Ad</p>
                  <p className="text-xs text-gray-500 mt-1">Preview em breve</p>
                </div>
              </div>
            ) : (
              // Fallback: Placeholder
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Preview não disponível</p>
                  <p className="text-xs text-gray-400 mt-1">Clique para ver detalhes</p>
                </div>
              </div>
            )}

            {/* Expand Button Overlay */}
            <Button
              variant="secondary"
              size="sm"
              className="absolute bottom-2 right-2 opacity-80 hover:opacity-100"
              onClick={() => setShowModal(true)}
            >
              <Maximize2 className="h-3 w-3 mr-1" />
              Ver detalhes
            </Button>
          </div>

          {/* Ad Info */}
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-semibold">
                {ad.platform}
              </Badge>
              {ad.product && (
                <Badge variant="outline" className="text-xs">
                  {ad.product}
                </Badge>
              )}
            </div>

            <div>
              <h3 className="font-semibold text-sm line-clamp-2 mb-1" title={ad.ad_name || ""}>
                {ad.ad_name || "Sem nome"}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-1" title={ad.campaign_name || ""}>
                {ad.campaign_name || "—"}
              </p>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 gap-2">
              {ad.cac && ad.cac > 0 && (
                <MetricItem label="CAC" value={formatCurrency(ad.cac)} highlight />
              )}
              {ad.hook_rate && ad.hook_rate > 0 && (
                <MetricItem label="Hook Rate" value={formatPercentage(ad.hook_rate)} />
              )}
              {ad.signups && ad.signups > 0 && (
                <MetricItem label="Signups" value={formatNumber(ad.signups)} />
              )}
              {ad.ctr && ad.ctr > 0 && (
                <MetricItem label="CTR" value={formatPercentage(ad.ctr)} />
              )}
              {ad.cost && ad.cost > 0 && (
                <MetricItem label="Investimento" value={formatCurrency(ad.cost)} />
              )}
              {ad.impressions && ad.impressions > 0 && (
                <MetricItem label="Impressões" value={formatNumber(ad.impressions)} />
              )}
            </div>

            {/* Action Button */}
            {ad.platform?.toUpperCase() === "META" && ad.ad_id && (
              <Button variant="outline" size="sm" className="w-full" asChild>
                <a
                  href={`https://www.facebook.com/ads/library/?id=${ad.ad_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Ver na Meta Ads Library
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Expanded Modal */}
      <WinnerModal
        ad={ad}
        open={showModal}
        onClose={() => setShowModal(false)}
        creativeLink={creativeLink}
        previewImage={previewImage}
      />
    </>
  );
}

function MetricItem({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="bg-background/80 dark:bg-background/40 rounded-md p-2 border border-border/50">
      <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
      <div className={`text-sm font-semibold ${highlight ? "text-green-600 dark:text-green-400" : ""}`}>
        {value}
      </div>
    </div>
  );
}