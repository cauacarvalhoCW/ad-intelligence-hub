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

  // Extrair perspectiva e creativeId da URL
  const perspective = params.perspectiva as Perspective;
  const creativeId = params.creativeId as string | undefined;

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
      const query = buildFilterQuery(newFilters, searchParams);
      
      // Preservar rota atual (com ou sem /ad/:id)
      const basePath = pathname;

      const newPath = query ? `${basePath}?${query}` : basePath;
      router.push(newPath);
    },
    [pathname, searchParams, router]
  );

  // Handler: Seleção de anúncio → Atualizar URL sem reload
  const handleAdSelect = useCallback(
    (adId: string | null) => {
      const query = buildFilterQuery(filters, searchParams);
      const basePath = adId
        ? `/${perspective}/concorrente/ad/${adId}`
        : `/${perspective}/concorrente`;

      const newPath = query ? `${basePath}?${query}` : basePath;
      
      // Usar replace em vez de push para evitar reload e não adicionar ao histórico
      router.replace(newPath, { scroll: false });
    },
    [perspective, filters, searchParams, router]
  );

  return (
    <AdDashboard
      externalPerspective={perspective}
      externalFilters={filters}
      externalSelectedAdId={creativeId || null}
      onFiltersChange={handleFiltersChange}
      onAdSelect={handleAdSelect}
    />
  );
}
