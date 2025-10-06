"use client";

import { useEffect, useState } from "react";
import { AdData } from "../types";

// ============================================
// USE WINNERS CREATIVE LINKS
// ============================================
// Pré-carrega creative_links dos winners (META)
// Executado automaticamente quando winners são identificados
// ============================================

interface CreativeLinkCache {
  [ad_id: number]: {
    creative_link: string | null;
    image_preview_link: string | null;
    loading: boolean;
    error: string | null;
  };
}

export function useWinnersCreativeLinks(winners: AdData[]) {
  const [cache, setCache] = useState<CreativeLinkCache>({});

  useEffect(() => {
    // Filtrar apenas winners META que ainda não estão no cache
    const metaWinners = winners.filter(
      (winner) =>
        winner.platform?.toUpperCase() === "META" &&
        winner.ad_id &&
        !cache[winner.ad_id]
    );

    if (metaWinners.length === 0) return;

    console.log(`🔗 [useWinnersCreativeLinks] Pré-carregando ${metaWinners.length} creative links`);

    // Pré-carregar creative_links para todos os winners META
    metaWinners.forEach((winner) => {
      if (!winner.ad_id) return;

      // Marcar como loading
      setCache((prev) => ({
        ...prev,
        [winner.ad_id!]: {
          creative_link: null,
          image_preview_link: null,
          loading: true,
          error: null,
        },
      }));

      // Buscar creative_link
      fetch(`/api/performance/creative-link?ad_id=${winner.ad_id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            console.log(`✅ [useWinnersCreativeLinks] Loaded ad_id=${winner.ad_id}`);
            setCache((prev) => ({
              ...prev,
              [winner.ad_id!]: {
                creative_link: data.creative_link,
                image_preview_link: data.image_preview_link,
                loading: false,
                error: null,
              },
            }));
          } else {
            console.warn(`⚠️ [useWinnersCreativeLinks] Failed ad_id=${winner.ad_id}:`, data.error);
            setCache((prev) => ({
              ...prev,
              [winner.ad_id!]: {
                creative_link: null,
                image_preview_link: null,
                loading: false,
                error: data.error || "Failed to load",
              },
            }));
          }
        })
        .catch((error) => {
          console.error(`❌ [useWinnersCreativeLinks] Error ad_id=${winner.ad_id}:`, error);
          setCache((prev) => ({
            ...prev,
            [winner.ad_id!]: {
              creative_link: null,
              image_preview_link: null,
              loading: false,
              error: error.message,
            },
          }));
        });
    });
  }, [winners, cache]);

  return cache;
}
