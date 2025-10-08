"use client";

import { Dialog, DialogContent } from "@/shared/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { ExternalLink } from "lucide-react";
import { AdData, PerformanceFilters } from "../types";
import { formatCurrency, formatPercentage, formatNumber } from "../utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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
  filters?: PerformanceFilters; // Para mostrar o período correto
}

export function WinnerModal({ ad, open, onClose, creativeLink, previewImage, filters }: WinnerModalProps) {
  if (!ad) return null;

  // Formatar período dos filtros
  const getPeriodText = () => {
    if (!filters) return null;
    
    if (filters.range === "custom" && filters.dateRange?.from && filters.dateRange?.to) {
      const from = format(filters.dateRange.from, "dd/MM/yyyy", { locale: ptBR });
      const to = format(filters.dateRange.to, "dd/MM/yyyy", { locale: ptBR });
      return `${from} a ${to}`;
    }
    
    const rangeLabels: Record<string, string> = {
      "7d": "Últimos 7 dias",
      "30d": "Últimos 30 dias",
      "90d": "Últimos 90 dias",
      "ytd": "Ano até hoje",
    };
    
    return rangeLabels[filters.range] || filters.range;
  };

  const periodText = getPeriodText();

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
      <DialogContent className="max-w-7xl w-[90vw] max-h-[95vh] overflow-y-auto p-6">
        <Card className="border-0 shadow-none w-full">
            <CardHeader>
              <div className="flex flex-col space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="font-semibold">
                    {ad.platform}
                  </Badge>
                  {ad.product && (
                    <Badge variant="outline" className="text-xs">
                      {ad.product}
                    </Badge>
                  )}
                  <Badge className="bg-amber-500 text-white">
                    🏆 Winner
                  </Badge>
                  {periodText && (
                    <Badge variant="secondary" className="text-xs font-medium">
                      📅 Período: {periodText}
                    </Badge>
                  )}
                </div>
                
                <div className="w-full">
                  <CardTitle className="text-xl md:text-2xl leading-tight break-words whitespace-normal">
                    {ad.ad_name || "Anúncio Winner"}
                  </CardTitle>
                  <p className="text-muted-foreground mt-2">
                    {ad.campaign_name || "—"}
                  </p>
                </div>

                {/* Explicação de Winner */}
                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                  <p className="text-sm text-amber-900 dark:text-amber-100">
                    <strong>🏆 Por que é Winner?</strong> Este anúncio foi selecionado por apresentar 
                    alto investimento combinado com bom CAC no período acima (algoritmo: custo × 1/CAC).
                    {periodText && (
                      <span className="block mt-1 font-medium">
                        📊 Dados agregados de: {periodText}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </CardHeader>

          <CardContent className="space-y-6 w-full">
            {/* Mídia Principal */}
            <div className="w-full">
              <h4 className="font-semibold mb-3 text-lg">🎬 Preview do Anúncio</h4>
              <div className="relative bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden w-full">
                {youtubeId ? (
                  // Google: YouTube Embed - Responsivo 16:9
                  <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
                    <iframe
                      src={`https://www.youtube.com/embed/${youtubeId}`}
                      className="absolute inset-0 w-full h-full border-0"
                      title={ad.ad_name || "YouTube Ad"}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : creativeLink && ad.platform?.toUpperCase() === "META" ? (
                  // Meta: Embedded Creative - Responsivo
                  <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
                    <iframe
                      src={creativeLink}
                      className="absolute inset-0 w-full h-full border-0"
                      title={ad.ad_name || "Meta Ad"}
                      allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                ) : previewImage ? (
                  // Meta: Image Preview - Auto height
                  <div className="w-full">
                    <img
                      src={previewImage}
                      alt={ad.ad_name || "Ad preview"}
                      className="w-full h-auto max-h-[600px] object-contain mx-auto"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                ) : ad.platform?.toUpperCase() === "TIKTOK" ? (
                  // TikTok: Placeholder
                  <div className="w-full h-80 flex items-center justify-center bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-900/20 dark:to-pink-800/20 rounded-lg">
                    <div className="text-center p-6">
                      <p className="text-lg font-semibold text-gray-600 dark:text-gray-400">TikTok Ad</p>
                      <p className="text-sm text-gray-500 mt-2">Preview em breve</p>
                    </div>
                  </div>
                ) : (
                  // Fallback
                  <div className="w-full h-80 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-lg">
                    <div className="text-center p-6">
                      <p className="text-sm text-gray-500">Mídia não disponível para visualização</p>
                      <p className="text-xs text-gray-400 mt-2">Use o botão abaixo para ver na biblioteca de anúncios</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Métricas de Performance */}
            <div className="w-full">
              <h4 className="font-semibold mb-3 text-lg">📊 Métricas de Performance</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 w-full">
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
