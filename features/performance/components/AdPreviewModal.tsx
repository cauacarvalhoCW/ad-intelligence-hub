"use client";

import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent } from "@/shared/ui/card";
import { ExternalLink, Loader2, Youtube, Facebook } from "lucide-react";
import { useCreativeLink } from "../hooks/useCreativeLink";
import { AdData, Product, PerformanceFilters } from "../types";
import { formatCurrency, formatNumber, formatPercentage } from "../utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AdPreviewModalProps {
  ad: AdData | null;
  onClose: () => void;
  product?: Product;
  filters?: PerformanceFilters; // Para mostrar período correto
}

export function AdPreviewModal({ ad, onClose, product, filters }: AdPreviewModalProps) {
  const [showConfirmation, setShowConfirmation] = useState(true);
  const { creativeLink, previewImage, isLoading, error, fetchCreativeLink } = useCreativeLink();

  const platform = ad?.platform?.toUpperCase();
  const isMeta = platform === "META";
  const isGoogle = platform === "GOOGLE";
  const isSupported = isMeta || isGoogle;

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

  const youtubeId = useMemo(() => {
    if (!isGoogle || !ad?.creative_link) return null;
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/,
      /youtube\.com\/embed\/([^&\s?]+)/,
      /youtube\.com\/v\/([^&\s?]+)/
    ];
    for (const pattern of patterns) {
      const match = ad.creative_link.match(pattern);
      if (match && match[1]) return match[1];
    }
    return null;
  }, [isGoogle, ad?.creative_link]);

  const handleConfirm = async () => {
    if (!ad?.ad_id) return;
    setShowConfirmation(false);
    await fetchCreativeLink(ad.ad_id);
  };

  const handleClose = () => {
    setShowConfirmation(true);
    onClose();
  };

  if (!ad) return null;

  if (!isSupported) {
    return (
      <Dialog open={!!ad} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Preview não disponível</DialogTitle>
            <DialogDescription>
              Preview visual está disponível apenas para anúncios <strong>META</strong> e <strong>GOOGLE</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={handleClose}>Fechar</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (isGoogle) {
    return (
      <Dialog open={!!ad} onOpenChange={handleClose}>
        <DialogContent className="w-[98vw] max-w-[1800px] h-auto max-h-none overflow-y-auto p-4 md:p-8">
          <div className="w-full space-y-4 overflow-x-hidden">
            <DialogHeader>
              <DialogTitle className="text-base md:text-lg flex items-center gap-2 break-words pr-8">
                <Youtube className="h-4 w-4 md:h-5 md:w-5 text-red-600 flex-shrink-0" />
                <span className="break-words leading-tight">{ad.ad_name || "Preview do Anúncio"}</span>
              </DialogTitle>
              <DialogDescription className="mt-2">
                <p className="text-xs md:text-sm break-words">Campanha: {ad.campaign_name || "—"}</p>
                <p className="text-xs mt-1 break-words">
                  Ad ID: {ad.ad_id} • <Badge variant="outline" className="inline text-xs">GOOGLE</Badge>
                  {periodText && ` • Período: ${periodText}`}
                </p>
              </DialogDescription>
            </DialogHeader>

            {youtubeId ? (
              <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeId}?rel=0`}
                  title={ad.ad_name || "YouTube video"}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Youtube className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Link do vídeo não disponível</p>
                  {ad.creative_link && (
                    <Button asChild variant="outline" size="sm" className="mt-4">
                      <a href={ad.creative_link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Abrir link original
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
            
            <MetricsGrid ad={ad} product={product} />

            <div className="flex justify-end pt-4 border-t">
              <Button onClick={handleClose} size="sm">Fechar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={!!ad} onOpenChange={handleClose}>
      <DialogContent className="w-[98vw] max-w-[1800px] h-auto max-h-none overflow-y-auto p-4 md:p-8">
        <div className="w-full space-y-4 overflow-x-hidden">
          <DialogHeader>
            <DialogTitle className="text-base md:text-lg flex items-center gap-2 break-words pr-8">
              <Facebook className="h-4 w-4 md:h-5 md:w-5 text-blue-600 flex-shrink-0" />
              <span className="break-words leading-tight">{ad.ad_name || "Preview do Anúncio"}</span>
            </DialogTitle>
            <DialogDescription className="mt-2">
              <p className="text-xs md:text-sm break-words">Campanha: {ad.campaign_name || "—"}</p>
              <p className="text-xs mt-1 break-words">
                Ad ID: {ad.ad_id} • <Badge variant="outline" className="inline text-xs">META</Badge>
                {periodText && ` • Período: ${periodText}`}
              </p>
            </DialogDescription>
          </DialogHeader>
          {showConfirmation && (
            <div className="space-y-4">
              <div className="bg-muted/30 rounded-lg p-4 md:p-6 text-center space-y-4">
                <div className="text-xs md:text-sm text-muted-foreground">
                  Deseja carregar o preview visual deste anúncio?
                </div>
                <div className="text-xs text-muted-foreground">
                  Isso buscará dados da META API através do N8N.
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleClose} size="sm">Cancelar</Button>
                <Button onClick={handleConfirm} size="sm">Sim, ver preview</Button>
              </div>
            </div>
          )}

          {!showConfirmation && isLoading && (
            <div className="space-y-4">
              <div className="bg-muted/30 rounded-lg p-12 flex flex-col items-center justify-center gap-4">
                <div className="relative">
                  <Loader2 className="h-16 w-16 animate-spin text-primary" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-8 w-8 rounded-full bg-primary/20 animate-pulse" />
                  </div>
                </div>
                <div className="text-sm text-muted-foreground text-center">
                  Carregando preview do anúncio...
                </div>
                <div className="text-xs text-muted-foreground">
                  Buscando dados da META API
                </div>
              </div>
            </div>
          )}

          {!showConfirmation && error && (
            <div className="space-y-4">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center space-y-2">
                <div className="text-sm font-medium text-destructive">Erro ao carregar preview</div>
                <div className="text-xs text-muted-foreground">{error}</div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleClose}>Fechar</Button>
                <Button onClick={handleConfirm}>Tentar novamente</Button>
              </div>
            </div>
          )}

          {!showConfirmation && !isLoading && !error && (creativeLink || previewImage) && (
            <>
              {creativeLink ? (
                <div className="w-full bg-black rounded-lg overflow-hidden">
                  <div className="aspect-video w-full">
                    <iframe
                      src={creativeLink}
                      title={ad.ad_name || "META Ad Preview"}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                      style={{ border: 'none' }}
                    />
                  </div>
                </div>
              ) : previewImage ? (
                <div className="w-full bg-muted/30 rounded-lg overflow-hidden">
                  <img
                    src={previewImage}
                    alt={ad.ad_name || "Preview"}
                    className="w-full h-auto object-contain max-h-[400px] md:max-h-[500px]"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                </div>
              ) : null}
              
              <MetricsGrid ad={ad} product={product} />
              
              {ad.platform?.toUpperCase() === "META" && ad.ad_id && (
                <Button asChild className="w-full" size="sm">
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
            </>
          )}

          <div className="flex justify-end pt-4 border-t">
            <Button onClick={handleClose} size="sm">Fechar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MetricsGrid({ ad, product }: { ad: AdData; product?: Product }) {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-sm font-semibold mb-4">Métricas de Performance</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard label="Custo" value={formatCurrency(ad.cost, product)} />
          <MetricCard label="Impressões" value={formatNumber(ad.impressions)} />
          <MetricCard label="Clicks" value={formatNumber(ad.clicks)} />
          <MetricCard label="CTR" value={formatPercentage(ad.ctr)} />
          <MetricCard label="Hook Rate" value={formatPercentage(ad.hook_rate)} />
          <MetricCard label="CPM" value={formatCurrency(ad.cpm, product)} />
          <MetricCard label="CPC" value={formatCurrency((ad as any).cpc || 0, product)} />
          <MetricCard label="Signups" value={formatNumber(ad.signups)} />
          <MetricCard label="Ativações" value={formatNumber(ad.activations)} />
          <MetricCard label="CAC" value={formatCurrency(ad.cac, product)} />
          {ad.install !== undefined && ad.install !== null && (
            <MetricCard label="Instalações" value={formatNumber(ad.install)} />
          )}
          {ad.pos_sales !== undefined && ad.pos_sales !== null && ad.pos_sales > 0 && (
            <MetricCard label="Vendas POS" value={formatNumber(ad.pos_sales)} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted/30 rounded-lg p-3">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}
