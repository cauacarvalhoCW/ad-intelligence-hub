"use client";

import { Dialog, DialogContent } from "@/shared/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { ExternalLink } from "lucide-react";
import { AdData } from "../types";
import { formatCurrency, formatPercentage, formatNumber } from "../utils";

// ============================================
// WINNER MODAL - EXPANDED VIEW
// ============================================
// Modal expandido similar aos concorrentes
// Mostra preview grande + métricas completas
// ============================================

interface WinnerModalProps {
  ad: AdData | null;
  open: boolean;
  onClose: () => void;
  creativeLink?: string | null;
  previewImage?: string | null;
}

export function WinnerModal({ ad, open, onClose, creativeLink, previewImage }: WinnerModalProps) {
  if (!ad) return null;

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

  const youtubeId = ad.platform?.toUpperCase() === "GOOGLE" ? getYouTubeVideoId(ad.creative_link || creativeLink) : null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <Card className="border-0 shadow-none">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="font-semibold">
                    {ad.platform}
                  </Badge>
                  {ad.product && (
                    <Badge variant="outline" className="text-xs">
                      {ad.product}
                    </Badge>
                  )}
                  <Badge className="bg-amber-500 text-white">
                    Winner
                  </Badge>
                </div>
                <CardTitle className="text-2xl">{ad.ad_name || "Anúncio Winner"}</CardTitle>
                <p className="text-muted-foreground mt-2">
                  {ad.campaign_name || "—"}
                  {ad.date && ` • ${new Date(ad.date).toLocaleDateString("pt-BR")}`}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                ✕
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Mídia Principal */}
            <div>
              <h4 className="font-semibold mb-3 text-lg">Preview do Anúncio</h4>
              <div className="relative bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden">
                {youtubeId ? (
                  // Google: YouTube Embed
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubeId}`}
                    className="w-full h-[500px] border-0"
                    title={ad.ad_name || "YouTube Ad"}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : creativeLink && ad.platform?.toUpperCase() === "META" ? (
                  // Meta: Embedded Creative
                  <iframe
                    src={creativeLink}
                    className="w-full h-[500px] border-0"
                    title={ad.ad_name || "Meta Ad"}
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : previewImage ? (
                  // Meta: Image Preview
                  <img
                    src={previewImage}
                    alt={ad.ad_name || "Ad preview"}
                    className="w-full max-h-[500px] object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : ad.platform?.toUpperCase() === "TIKTOK" ? (
                  // TikTok: Placeholder
                  <div className="w-full h-64 flex items-center justify-center bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-900/20 dark:to-pink-800/20">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-600 dark:text-gray-400">TikTok Ad</p>
                      <p className="text-sm text-gray-500 mt-2">Preview em breve</p>
                    </div>
                  </div>
                ) : (
                  // Fallback
                  <div className="w-full h-64 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Mídia não disponível para visualização</p>
                      <p className="text-xs text-gray-400 mt-1">Use o botão abaixo para ver na biblioteca de anúncios</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Métricas de Performance */}
            <div>
              <h4 className="font-semibold mb-3 text-lg">📊 Métricas de Performance</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {ad.cost && ad.cost > 0 && (
                  <MetricCard label="Investimento" value={formatCurrency(ad.cost)} />
                )}
                {ad.cac && ad.cac > 0 && (
                  <MetricCard label="CAC" value={formatCurrency(ad.cac)} highlight />
                )}
                {ad.impressions && ad.impressions > 0 && (
                  <MetricCard label="Impressões" value={formatNumber(ad.impressions)} />
                )}
                {ad.clicks && ad.clicks > 0 && (
                  <MetricCard label="Clicks" value={formatNumber(ad.clicks)} />
                )}
                {ad.ctr && ad.ctr > 0 && (
                  <MetricCard label="CTR" value={formatPercentage(ad.ctr)} />
                )}
                {ad.hook_rate && ad.hook_rate > 0 && (
                  <MetricCard label="Hook Rate" value={formatPercentage(ad.hook_rate)} />
                )}
                {ad.signups && ad.signups > 0 && (
                  <MetricCard label="Signups" value={formatNumber(ad.signups)} />
                )}
                {ad.activations && ad.activations > 0 && (
                  <MetricCard label="Ativações" value={formatNumber(ad.activations)} />
                )}
                {ad.cpm && ad.cpm > 0 && (
                  <MetricCard label="CPM" value={formatCurrency(ad.cpm)} />
                )}
                {ad.cpa && ad.cpa > 0 && (
                  <MetricCard label="CPA" value={formatCurrency(ad.cpa)} />
                )}
              </div>
            </div>

            {/* Ad Info */}
            <div>
              <h4 className="font-semibold mb-3 text-lg">ℹ️ Informações do Anúncio</h4>
              <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ad ID:</span>
                  <code className="bg-background px-2 py-0.5 rounded">{ad.ad_id || "N/A"}</code>
                </div>
                {ad.campaign_id && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Campaign ID:</span>
                    <code className="bg-background px-2 py-0.5 rounded">{ad.campaign_id}</code>
                  </div>
                )}
                {ad.date && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Data:</span>
                    <span className="font-medium">{new Date(ad.date).toLocaleDateString("pt-BR")}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plataforma:</span>
                  <Badge variant="outline">{ad.platform}</Badge>
                </div>
                {ad.product && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Produto:</span>
                    <Badge variant="outline">{ad.product}</Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Link Externo */}
            {ad.platform?.toUpperCase() === "META" && ad.ad_id && (
              <Button className="w-full" size="lg" asChild>
                <a
                  href={`https://www.facebook.com/ads/library/?id=${ad.ad_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ver na Meta Ads Library
                </a>
              </Button>
            )}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}

function MetricCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="bg-card border rounded-lg p-3">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className={`text-lg font-bold ${highlight ? "text-green-600 dark:text-green-400" : ""}`}>
        {value}
      </div>
    </div>
  );
}
