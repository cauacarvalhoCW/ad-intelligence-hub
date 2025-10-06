"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { ExternalLink, Loader2 } from "lucide-react";
import { useCreativeLink } from "../hooks/useCreativeLink";
import { AdData } from "../types";

// ============================================
// AD PREVIEW MODAL - META ADS ONLY
// ============================================
// Shows confirmation → loading → preview with metrics
// ============================================

interface AdPreviewModalProps {
  ad: AdData | null;
  onClose: () => void;
}

export function AdPreviewModal({ ad, onClose }: AdPreviewModalProps) {
  const [showConfirmation, setShowConfirmation] = useState(true);
  const { creativeLink, previewImage, isLoading, error, fetchCreativeLink } = useCreativeLink();

  // Only works for META
  const isMeta = ad?.platform?.toUpperCase() === "META";

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

  if (!isMeta) {
    return (
      <Dialog open={!!ad} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Preview não disponível</DialogTitle>
            <DialogDescription>
              Preview visual está disponível apenas para anúncios META (Facebook/Instagram).
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={handleClose}>Fechar</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={!!ad} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">
            {ad.ad_name || "Preview do Anúncio"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-1 mb-4">
          <p className="text-sm text-muted-foreground">
            Campanha: {ad.campaign_name || "—"}
          </p>
          <p className="text-xs text-muted-foreground">
            Ad ID: {ad.ad_id} • Plataforma: <Badge variant="outline">META</Badge> • Data: {ad.date}
          </p>
        </div>

        {/* Confirmation Step */}
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
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button onClick={handleConfirm}>
                Sim, ver preview
              </Button>
            </div>
          </div>
        )}

        {/* Loading Step */}
        {!showConfirmation && isLoading && (
          <div className="space-y-4">
            <div className="bg-muted/30 rounded-lg p-12 flex flex-col items-center justify-center gap-4">
              {/* Logo Piadinha Loading */}
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

        {/* Error Step */}
        {!showConfirmation && error && (
          <div className="space-y-4">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center space-y-2">
              <div className="text-sm font-medium text-destructive">
                Erro ao carregar preview
              </div>
              <div className="text-xs text-muted-foreground">
                {error}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>
                Fechar
              </Button>
              <Button onClick={handleConfirm}>
                Tentar novamente
              </Button>
            </div>
          </div>
        )}

        {/* Preview Step */}
        {!showConfirmation && !isLoading && !error && (creativeLink || previewImage) && (
          <div className="space-y-4">
            {/* Preview Image */}
            {previewImage && (
              <div className="bg-muted/30 rounded-lg overflow-hidden">
                <img
                  src={previewImage}
                  alt={ad.ad_name || "Preview"}
                  className="w-full h-auto object-contain max-h-[500px]"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* Creative Link */}
            {creativeLink && (
              <div className="flex justify-center">
                <Button asChild variant="outline" size="sm">
                  <a href={creativeLink} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ver anúncio completo na META
                  </a>
                </Button>
              </div>
            )}

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t">
              <MetricCard label="Custo" value={`R$ ${ad.cost?.toFixed(2) || "0.00"}`} />
              <MetricCard label="Impressões" value={ad.impressions?.toLocaleString() || "0"} />
              <MetricCard label="Clicks" value={ad.clicks?.toLocaleString() || "0"} />
              <MetricCard label="CTR" value={ad.ctr ? `${(ad.ctr * 100).toFixed(2)}%` : "—"} />
              <MetricCard label="Hook Rate" value={ad.hook_rate ? `${(ad.hook_rate * 100).toFixed(2)}%` : "—"} />
              <MetricCard label="Signups" value={ad.signups?.toString() || "0"} />
              <MetricCard label="Ativações" value={ad.activations?.toString() || "0"} />
              <MetricCard label="CAC" value={ad.cac ? `R$ ${ad.cac.toFixed(2)}` : "—"} />
            </div>

            <div className="flex justify-end">
              <Button onClick={handleClose}>Fechar</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
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
