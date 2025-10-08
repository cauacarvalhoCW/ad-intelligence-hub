import { AdData, Platform, Product } from "../types";

// ============================================
// WINNERS LOGIC V3 - AGREGAÇÃO + CUSTO-EFICIÊNCIA
// ============================================
// CORREÇÃO CRÍTICA: Agregar métricas por período ANTES de ranquear!
// 1. Agrupar por ad_id (mesmo anúncio em múltiplos dias)
// 2. SOMAR métricas (cost, clicks, impressions, signups, activations)
// 3. RECALCULAR métricas derivadas (CAC, CTR, CPM, etc.)
// 4. DEPOIS ranquear por score = custo * (1 / cac)
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
 * ✅ AGREGAÇÃO DE MÉTRICAS POR PERÍODO
 * 
 * Problema: Cada ad pode ter múltiplas linhas (uma por dia)
 * Solução: Agrupar por ad_id e SOMAR todas as métricas
 * 
 * Exemplo:
 * Input (3 linhas, mesmo ad em 3 dias):
 *   Day 1: cost=100, clicks=50, activations=2
 *   Day 2: cost=150, clicks=80, activations=3
 *   Day 3: cost=120, clicks=60, activations=2
 * 
 * Output (1 linha agregada):
 *   Total: cost=370, clicks=190, activations=7
 *   CAC calculado = 370/7 = 52.86
 */
function aggregateAdsByPeriod(ads: AdData[]): AdData[] {
  const aggregated = new Map<string, AdData>();

  ads.forEach((ad) => {
    const key = ad.ad_id || ad.ad_name || `${ad.platform}-${ad.campaign_name}`;
    
    if (!aggregated.has(key)) {
      // Primeira ocorrência - inicializar com clone
      aggregated.set(key, {
        ...ad,
        // Garantir que métricas numéricas estejam zeradas se null
        cost: ad.cost || 0,
        impressions: ad.impressions || 0,
        clicks: ad.clicks || 0,
        signups: ad.signups || 0,
        activations: ad.activations || 0,
        installs: ad.installs || 0,
        video_3s: ad.video_3s || 0,
        pos_sales: ad.pos_sales || 0,
        piselli_sales: ad.piselli_sales || 0,
        fifth_transaction: ad.fifth_transaction || 0,
      });
    } else {
      // Já existe - SOMAR métricas
      const existing = aggregated.get(key)!;
      
      existing.cost = (existing.cost || 0) + (ad.cost || 0);
      existing.impressions = (existing.impressions || 0) + (ad.impressions || 0);
      existing.clicks = (existing.clicks || 0) + (ad.clicks || 0);
      existing.signups = (existing.signups || 0) + (ad.signups || 0);
      existing.activations = (existing.activations || 0) + (ad.activations || 0);
      existing.installs = (existing.installs || 0) + (ad.installs || 0);
      existing.video_3s = (existing.video_3s || 0) + (ad.video_3s || 0);
      existing.pos_sales = (existing.pos_sales || 0) + (ad.pos_sales || 0);
      existing.piselli_sales = (existing.piselli_sales || 0) + (ad.piselli_sales || 0);
      existing.fifth_transaction = (existing.fifth_transaction || 0) + (ad.fifth_transaction || 0);
      
      // Manter creative_link se não existir
      if (!existing.creative_link && ad.creative_link) {
        existing.creative_link = ad.creative_link;
      }
      if (!existing.image_preview_link && ad.image_preview_link) {
        existing.image_preview_link = ad.image_preview_link;
      }
    }
  });

  // Recalcular métricas derivadas
  const result = Array.from(aggregated.values()).map((ad) => {
    const cost = ad.cost || 0;
    const impressions = ad.impressions || 0;
    const clicks = ad.clicks || 0;
    const signups = ad.signups || 0;
    const activations = ad.activations || 0;
    const video_3s = ad.video_3s || 0;

    return {
      ...ad,
      // Recalcular CTR
      ctr: impressions > 0 ? clicks / impressions : 0,
      // Recalcular CPM
      cpm: impressions > 0 ? (cost / impressions) * 1000 : 0,
      // Recalcular CPC
      cpc: clicks > 0 ? cost / clicks : 0,
      // Recalcular Hook Rate
      hook_rate: impressions > 0 ? video_3s / impressions : 0,
      // Recalcular CPA
      cpa: signups > 0 ? cost / signups : null,
      // Recalcular CAC
      cac: activations > 0 ? cost / activations : null,
    };
  });

  console.log(`📊 [Aggregation] Agregou ${ads.length} linhas em ${result.length} anúncios únicos`);
  
  return result;
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

  console.log(`📊 [Winners V3] Ranking ${validAds.length} AGGREGATED ads by cost-efficiency`);

  // Ordenar por score (maior = melhor)
  const ranked = validAds.sort((a, b) => {
    const scoreA = calculateWinnerScore(a);
    const scoreB = calculateWinnerScore(b);
    return scoreB - scoreA; // Decrescente
  });

  // Log top 3 for debugging
  if (ranked.length > 0) {
    console.log(`🏆 [Winners V3] Top 3 scores (MÉTRICAS AGREGADAS):`);
    ranked.slice(0, 3).forEach((ad, i) => {
      const score = calculateWinnerScore(ad);
      console.log(`  ${i + 1}. Score=${score.toFixed(2)} | Cost TOTAL=R$${ad.cost?.toFixed(2)} | CAC CALC=R$${ad.cac?.toFixed(2)} | ${ad.ad_name?.slice(0, 40)}`);
    });
  }

  return ranked;
}

/**
 * Get winners (best ads) with flexible filtering
 * V3: NOW AGGREGATES METRICS BY PERIOD FIRST!
 */
export function getWinners({
  ads,
  platform,
  product,
  limit = 5,
}: GetWinnersOptions): AdData[] {
  console.log(`🏆 [Winners V3] Getting winners:`, { 
    platform, 
    product, 
    limit, 
    totalAds: ads.length 
  });

  // ✅ PASSO 1: AGREGAR métricas por período (SOMA)
  const aggregatedAds = aggregateAdsByPeriod(ads);

  // PASSO 2: Filter by platform
  let filtered = platform
    ? aggregatedAds.filter((ad) => ad.platform?.toUpperCase() === platform.toUpperCase())
    : aggregatedAds;

  // PASSO 3: Filter by product
  if (product) {
    filtered = filtered.filter((ad) => ad.product?.toUpperCase() === product.toUpperCase());
  }

  console.log(`🔍 [Winners V3] Filtered ads (AGGREGATED): ${filtered.length}`);

  // Debug: Log sample aggregated ads
  if (filtered.length > 0) {
    console.log(`📋 [Winners V3] Sample AGGREGATED ads:`, filtered.slice(0, 3).map(ad => ({
      ad_id: ad.ad_id,
      ad_name: ad.ad_name?.slice(0, 30),
      cost_TOTAL: ad.cost,
      cac_RECALC: ad.cac,
    })));
  }

  // PASSO 4: Rank by cost-efficiency (usando métricas AGREGADAS)
  const ranked = rankByCostEfficiency(filtered);

  // PASSO 5: Take top N
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
