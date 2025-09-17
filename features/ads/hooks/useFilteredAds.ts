"use client";

import { useMemo } from "react";
import { useTheme } from "@/components/theme-provider";
import { mockAds } from "@/lib/mock-data";
import type { Ad } from "@/features/ads/types";

// Hook que filtra anúncios baseado no tema atual
export function useFilteredAds() {
  const { competitorScope } = useTheme();

  const filteredAds = useMemo(() => {
    if (competitorScope.length === 0) {
      return mockAds; // Tema padrão ou CloudWalk - mostra todos
    }

    return mockAds.filter((ad) =>
      competitorScope.includes(ad.competitor?.name || ""),
    );
  }, [competitorScope]);

  return filteredAds;
}

// Hook para obter competidores filtrados baseado no tema
export function useFilteredCompetitors() {
  const { competitorScope } = useTheme();

  const filteredCompetitors = useMemo(() => {
    if (competitorScope.length === 0) {
      return []; // Retorna array vazio para indicar "todos"
    }

    return competitorScope;
  }, [competitorScope]);

  return filteredCompetitors;
}

// Hook para estatísticas baseadas no tema
export function useThemeStats() {
  const filteredAds = useFilteredAds();
  const { currentTheme, themes } = useTheme();

  const stats = useMemo(() => {
    const totalAds = filteredAds.length;
    const competitorsCount = new Set(
      filteredAds.map((ad) => ad.competitor?.name),
    ).size;
    const themeName = themes[currentTheme]?.name || "Padrão";
    const themeDescription =
      themes[currentTheme]?.metadata?.description || "Todos os competidores";

    return {
      totalAds,
      competitorsCount,
      themeName,
      themeDescription,
    };
  }, [filteredAds, currentTheme, themes]);

  return stats;
}
