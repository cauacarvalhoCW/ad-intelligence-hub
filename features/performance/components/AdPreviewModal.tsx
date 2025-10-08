"use client";

import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent } from "@/shared/ui/card";
import { ExternalLink, Loader2, Youtube, Facebook } from "lucide-react";
import { useCreativeLink } from "../hooks/useCreativeLink";
import { AdData, Product } from "../types";
import { formatCurrency, formatNumber, formatPercentage } from "../utils";

interface AdPreviewModalProps {
  ad: AdData | null;
  onClose: () => void;
  product?: Product;
}

export function AdPreviewModal({ ad, onClose, product }: AdPreviewModalProps) {
  const [showConfirmation, setShowConfirmation] = useState(true);
  const { creativeLink, previewImage, isLoading, error, fetchCreativeLink } = useCreativeLink();

  const platform = ad?.platform?.toUpperCase();
  const isMeta = platform === "META";
  const isGoogle = platform === "GOOGLE";
  const isSupported = isMeta || isGoogle;

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
        <DialogContent className="w-[90vw] max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-lg flex items-center gap-2">
              <Youtube className="h-5 w-5 text-red-600 flex-shrink-0" />
              <span className="truncate">{ad.ad_name || "Preview do Anúncio"}</span>
            </DialogTitle>
            <DialogDescription className="mt-2">
              <p className="text-sm">Campanha: {ad.campaign_name || "—"}</p>
              <p className="text-xs mt-1">
                Ad ID: {ad.ad_id} • <Badge variant="outline" className="inline">GOOGLE</Badge> • {ad.date}
              </p>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 overflow-y-auto flex-1 pr-2">
            {youtubeId ? (
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
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
          </div>

          <div className="flex justify-end pt-4 border-t flex-shrink-0">
            <Button onClick={handleClose}>Fechar</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={!!ad} onOpenChange={handleClose}>
      <DialogContent className="w-[90vw] max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-lg flex items-center gap-2">
            <Facebook className="h-5 w-5 text-blue-600 flex-shrink-0" />
            <span className="truncate">{ad.ad_name || "Preview do Anúncio"}</span>
          </DialogTitle>
          <DialogDescription className="mt-2">
            <p className="text-sm">Campanha: {ad.campaign_name || "—"}</p>
            <p className="text-xs mt-1">
              Ad ID: {ad.ad_id} • <Badge variant="outline" className="inline">META</Badge> • {ad.date}
            </p>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          {showConfirmation && (
            <div className="space-y-4">
              <div className="bg-muted/30 rounded-lg p-6 text-center space-y-4">
                <div className="text-sm text-muted-foreground">
                  Deseja carregar o preview visual deste anúncio?
                </div>
                <div className="text-xs text-muted-foreground">
                  Isso buscará dados da META API através do N8N.
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleClose}>Cancelar</Button>
                <Button onClick={handleConfirm}>Sim, ver preview</Button>
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
            <div className="space-y-4">
              {/* Se tiver creative_link, mostrar o embed do vídeo META */}
              {creativeLink ? (
                <div className="bg-black rounded-lg overflow-hidden">
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
                // Se não tiver embed, mostrar apenas a imagem
                <div className="bg-muted/30 rounded-lg overflow-hidden">
                  <img
                    src={previewImage}
                    alt={ad.ad_name || "Preview"}
                    className="w-full h-auto object-contain max-h-[500px]"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                </div>
              ) : null}
              
              {/* Link para META Ads Library */}
              {creativeLink && (
                <div className="flex justify-center">
                  <Button asChild variant="outline" size="sm">
                    <a href={creativeLink} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Ver anúncio completo na META Ads Library
                    </a>
                  </Button>
                </div>
              )}
              
              <MetricsGrid ad={ad} product={product} />
            </div>
          )}
        </div>

        {!showConfirmation && !isLoading && !error && (creativeLink || previewImage) && (
          <div className="flex justify-end pt-4 border-t flex-shrink-0">
            <Button onClick={handleClose}>Fechar</Button>
          </div>
        )}
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
          <MetricCard label="CPC" value={formatCurrency(ad.cpc, product)} />
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
