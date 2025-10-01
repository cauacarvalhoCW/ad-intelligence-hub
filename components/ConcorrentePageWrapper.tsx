"use client";

import { useEffect, useCallback } from "react";
import { useRouter, useSearchParams, useParams, usePathname } from "next/navigation";
import { AdDashboard } from "@/components/ad-dashboard";
import { useTheme } from "@/components/theme-provider";
import type { FilterState } from "@/components/ad-filters";
import {
  parseFiltersFromURL,
  buildFilterQuery,
  type Perspective,
} from "@/lib/utils/url-params";

export function ConcorrentePageWrapper() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const searchParams = useSearchParams();
  const { setTheme, currentTheme } = useTheme();

  // Extrair perspectiva da URL
  const perspective = params.perspectiva as Perspective;
  
  // Extrair ad ID do query param ?ad=
  const selectedAdId = searchParams.get('ad');

  // Sync tema com perspectiva da URL
  useEffect(() => {
    if (currentTheme !== perspective) {
      setTheme(perspective);
    }
  }, [perspective, currentTheme, setTheme]);

  // Parse filtros da URL (sempre do searchParams atual)
  const filters = parseFiltersFromURL(searchParams);

  // Handler: Mudança de filtros → Atualizar URL
  const handleFiltersChange = useCallback(
    (newFilters: FilterState) => {
      const currentAd = searchParams.get('ad');
      const query = buildFilterQuery(newFilters, searchParams);
      
      // Se tem anúncio aberto, preservar ?ad=
      const params = new URLSearchParams(query);
      if (currentAd) {
        params.set('ad', currentAd);
      }
      
      const newPath = params.toString() 
        ? `/${perspective}/concorrente?${params.toString()}`
        : `/${perspective}/concorrente`;
      
      router.push(newPath);
    },
    [perspective, searchParams, router]
  );

  // Handler: Seleção de anúncio → Atualizar URL com ?ad=<ID>
  const handleAdSelect = useCallback(
    (adId: string | null) => {
      const query = buildFilterQuery(filters, searchParams);
      const params = new URLSearchParams(query);
      
      if (adId) {
        params.set('ad', adId);
      } else {
        params.delete('ad');
      }

      const newPath = params.toString()
        ? `/${perspective}/concorrente?${params.toString()}`
        : `/${perspective}/concorrente`;
      
      // Usar replace para não adicionar ao histórico
      router.replace(newPath, { scroll: false });
    },
    [perspective, filters, searchParams, router]
  );

  return (
    <AdDashboard
      externalPerspective={perspective}
      externalFilters={filters}
      externalSelectedAdId={selectedAdId || null}
      onFiltersChange={handleFiltersChange}
      onAdSelect={handleAdSelect}
    />
  );
}
