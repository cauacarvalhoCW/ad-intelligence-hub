import { AdData, Platform, Product } from "../types";

// ============================================
// WINNERS LOGIC V2 - CUSTO + CAC RANKING
// ============================================
// Nova regra: Prioriza MAIOR CUSTO + MELHOR CAC
// Score = custo * (1 / cac) = custo-eficiência
// ============================================

interface GetWinnersOptions {
  ads: AdData[];
  platform?: Platform;
  product?: Product;
  limit?: number;
}

interface WinnersByPlatform {
  META: AdData[];
  GOOGLE: AdData[];
  TIKTOK: AdData[];
}

/**
 * 🎯 NOVO ALGORITMO: CUSTO-EFICIÊNCIA
 * 
 * Regra: "Pegar qual tem mais custo e depois ver qual tem o CAC bom"
 * 
 * Score = cost * (1 / cac)
 * - Quanto MAIOR o custo, maior o score
 * - Quanto MENOR o CAC, maior o score
 * 
 * Exemplo:
 * Ad A: cost=R$10.000, cac=R$50  → score = 10000 * (1/50) = 200
 * Ad B: cost=R$ 5.000, cac=R$30  → score =  5000 * (1/30) = 166.67
 * Ad C: cost=R$ 8.000, cac=R$40  → score =  8000 * (1/40) = 200
 * 
 * Winner: Ad A (maior investimento com bom CAC)
 */
function calculateWinnerScore(ad: AdData): number {
  const cost = ad.cost || 0;
  const cac = ad.cac || 0;

  // Precisa ter custo E CAC válidos
  if (cost <= 0 || cac <= 0 || !isFinite(cac)) {
    return 0;
  }

  // Score = custo-eficiência
  const score = cost * (1 / cac);

  return score;
}

/**
 * Rank ads by Cost-Efficiency (Custo + CAC)
 */
function rankByCostEfficiency(ads: AdData[]): AdData[] {
  // Filtrar apenas ads com dados válidos
  const validAds = ads.filter((ad) => {
    const score = calculateWinnerScore(ad);
    return score > 0;
  });

  console.log(`📊 [Winners V2] Ranking ${validAds.length} ads by cost-efficiency`);

  // Ordenar por score (maior = melhor)
  const ranked = validAds.sort((a, b) => {
    const scoreA = calculateWinnerScore(a);
    const scoreB = calculateWinnerScore(b);
    return scoreB - scoreA; // Decrescente
  });

  // Log top 3 for debugging
  if (ranked.length > 0) {
    console.log(`🏆 [Winners V2] Top 3 scores:`);
    ranked.slice(0, 3).forEach((ad, i) => {
      const score = calculateWinnerScore(ad);
      console.log(`  ${i + 1}. Score=${score.toFixed(2)} | Cost=R$${ad.cost?.toFixed(2)} | CAC=R$${ad.cac?.toFixed(2)} | ${ad.ad_name?.slice(0, 40)}`);
    });
  }

  return ranked;
}

/**
 * Get winners (best ads) with flexible filtering
 * Now uses Cost-Efficiency algorithm
 */
export function getWinners({
  ads,
  platform,
  product,
  limit = 5,
}: GetWinnersOptions): AdData[] {
  console.log(`🏆 [Winners V2] Getting winners:`, { 
    platform, 
    product, 
    limit, 
    totalAds: ads.length 
  });

  // Filter by platform
  let filtered = platform
    ? ads.filter((ad) => ad.platform?.toUpperCase() === platform.toUpperCase())
    : ads;

  // Filter by product
  if (product) {
    filtered = filtered.filter((ad) => ad.product?.toUpperCase() === product.toUpperCase());
  }

  console.log(`🔍 [Winners V2] Filtered ads: ${filtered.length}`);

  // Debug: Log sample ad_ids
  if (filtered.length > 0) {
    console.log(`📋 [Winners V2] Sample ad_ids:`, filtered.slice(0, 3).map(ad => ({
      ad_id: ad.ad_id,
      ad_name: ad.ad_name?.slice(0, 30),
      cost: ad.cost,
      cac: ad.cac,
    })));
  }

  // Rank by cost-efficiency
  const ranked = rankByCostEfficiency(filtered);

  // Take top N
  const winners = ranked.slice(0, limit);

  console.log(`✅ [Winners V2] Found ${winners.length} winners`);
  
  // Log final winners with ad_ids
  winners.forEach((winner, i) => {
    console.log(`  ${i + 1}. ad_id=${winner.ad_id} | ${winner.ad_name?.slice(0, 40)}`);
  });

  return winners;
}

/**
 * Get winners grouped by platform
 * Returns 1 winner per platform for Overview
 */
export function getWinnersByPlatform(ads: AdData[], product?: Product): WinnersByPlatform {
  console.log(`🏆 [Winners V2] Getting winners by platform:`, { product, totalAds: ads.length });

  return {
    META: getWinners({ ads, platform: "META", product, limit: 1 }),
    GOOGLE: getWinners({ ads, platform: "GOOGLE", product, limit: 1 }),
    TIKTOK: getWinners({ ads, platform: "TIKTOK", product, limit: 1 }),
  };
}

/**
 * Get top 5 winners per platform for Drilldown
 */
export function getTop5ByPlatform(ads: AdData[], product?: Product): WinnersByPlatform {
  console.log(`🏆 [Winners V2] Getting top 5 by platform:`, { product, totalAds: ads.length });

  return {
    META: getWinners({ ads, platform: "META", product, limit: 5 }),
    GOOGLE: getWinners({ ads, platform: "GOOGLE", product, limit: 5 }),
    TIKTOK: getWinners({ ads, platform: "TIKTOK", product, limit: 5 }),
  };
}

/**
 * Check if ad has valid data for ranking
 */
export function isValidWinner(ad: AdData): boolean {
  return (
    !!ad.ad_id &&
    !!ad.ad_name &&
    !!ad.platform &&
    (ad.cost || 0) > 0 &&
    (ad.cac || 0) > 0 &&
    isFinite(ad.cac || 0)
  );
}
