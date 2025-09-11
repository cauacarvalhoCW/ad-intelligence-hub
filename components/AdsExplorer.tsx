"use client";

import { useState } from "react";
import { useAds, Perspective } from "@/hooks/useAds";
import { AdsGrid } from "./ads/AdsGrid";
import { PerspectiveSelector } from "./PerspectiveSelector";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

const RECENCY_ACTIVE_DAYS = 2;

export function AdsExplorer() {
  const [perspective, setPerspective] = useState<Perspective>("default");
  const [page, setPage] = useState(1);

  const { ads, loading, error, pagination, refetch } = useAds({
    perspective,
    page,
    limit: 24,
  });

  const handlePerspectiveChange = (newPerspective: Perspective) => {
    setPerspective(newPerspective);
    setPage(1); // Reset para primeira página
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Edge Intelligence Hub</h1>
          <p className="text-muted-foreground">
            Análise de anúncios de concorrentes em tempo real
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            disabled={loading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Controles */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Seletor de Perspectiva */}
          <div className="md:col-span-2">
            <PerspectiveSelector
              value={perspective}
              onChange={handlePerspectiveChange}
            />
          </div>

          {/* Estatísticas */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Estatísticas</label>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{pagination.total} anúncios</Badge>
              <Badge variant="outline">
                Página {pagination.page} de {pagination.totalPages}
              </Badge>
              <Badge variant="secondary">
                {
                  ads.filter((ad) => {
                    const isRecent = ad.start_date
                      ? new Date(ad.start_date) >=
                        new Date(
                          Date.now() -
                            RECENCY_ACTIVE_DAYS * 24 * 60 * 60 * 1000,
                        )
                      : false;
                    return isRecent;
                  }).length
                }{" "}
                ativos
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Grid de Anúncios */}
      <AdsGrid
        ads={ads}
        loading={loading}
        error={error}
        recencyActiveDays={RECENCY_ACTIVE_DAYS}
      />

      {/* Paginação */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1 || loading}
          >
            Anterior
          </Button>

          <div className="flex items-center gap-2">
            {Array.from(
              { length: Math.min(5, pagination.totalPages) },
              (_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage(pageNum)}
                    disabled={loading}
                  >
                    {pageNum}
                  </Button>
                );
              },
            )}
          </div>

          <Button
            variant="outline"
            onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
            disabled={page === pagination.totalPages || loading}
          >
            Próxima
          </Button>
        </div>
      )}
    </div>
  );
}
