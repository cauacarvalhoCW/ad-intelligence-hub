"use client";

import type { MktAdsLookerRow } from "../types";

/**
 * Debug utility to log Supabase data and calculations to console
 * USE: Call this in useEffect to see data breakdown
 * 
 * Shows:
 * - Total records from Supabase
 * - Totals (cost, impressions, clicks, signups, activations)
 * - Breakdown by product (POS, TAP, LINK, JIM)
 * - Breakdown by platform (META, GOOGLE, TIKTOK)
 */
export function debugPerformanceData(data: MktAdsLookerRow[], label: string = "Performance Data") {
  console.group(`🔍 DEBUG: ${label}`);
  console.log(`📊 Total records: ${data.length}`);
  
  if (data.length === 0) {
    console.warn("⚠️ NO DATA FOUND!");
    console.groupEnd();
    return;
  }

  // ============================================
  // TOTAIS GERAIS
  // ============================================
  console.group("💰 TOTAIS GERAIS");
  
  const totals = data.reduce((acc, row) => {
    acc.cost += row.cost || 0;
    acc.impressions += row.impressions || 0;
    acc.clicks += row.clicks || 0;
    acc.video_3s += row.video_3s || 0;
    
    // Signups (agregado de todas as fontes)
    acc.tap_signup += row["tap signup"] || 0;
    acc.tap_cnpj_signups += row["tap cnpj signups"] || 0;
    acc.signup_web += row.signup_web || 0;
    acc.link_signup += row.link_signup || 0;
    
    // Activations (agregado de todas as fontes)
    acc.tap_activations += row["tap activations"] || 0;
    acc.activation_app += row.activation_app || 0;
    acc.activation_web += row.activation_web || 0;
    acc.link_activations += row.link_activations || 0;
    
    // Sales
    acc.pos_sales += row.pos_sales || 0;
    acc.piselli_sales += row.piselli_sales || 0;
    
    // JIM specific
    acc.install += row.install || 0;
    
    // 5ª Transação
    acc.tap_5trx += row["tap 5trx"] || 0;
    
    return acc;
  }, {
    cost: 0,
    impressions: 0,
    clicks: 0,
    video_3s: 0,
    tap_signup: 0,
    tap_cnpj_signups: 0,
    signup_web: 0,
    link_signup: 0,
    tap_activations: 0,
    activation_app: 0,
    activation_web: 0,
    link_activations: 0,
    pos_sales: 0,
    piselli_sales: 0,
    install: 0,
    tap_5trx: 0,
  });

  const totalSignups = totals.tap_signup + totals.tap_cnpj_signups + totals.signup_web + totals.link_signup;
  const totalActivations = totals.tap_activations + totals.activation_app + totals.activation_web + totals.link_activations;
  
  const ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
  const hookRate = totals.impressions > 0 ? (totals.video_3s / totals.impressions) * 100 : 0;
  const cpm = totals.impressions > 0 ? (totals.cost / totals.impressions) * 1000 : 0;
  const cpa = totalSignups > 0 ? totals.cost / totalSignups : 0;
  const cac = totalActivations > 0 ? totals.cost / totalActivations : 0;

  console.table({
    "💵 Custo Total": `R$ ${totals.cost.toFixed(2)}`,
    "👁️ Impressões": totals.impressions.toLocaleString(),
    "👆 Clicks": totals.clicks.toLocaleString(),
    "📺 Video 3s": totals.video_3s.toLocaleString(),
    "📝 Signups TOTAL": totalSignups.toLocaleString(),
    "  ├─ TAP Signup": totals.tap_signup.toLocaleString(),
    "  ├─ TAP CNPJ": totals.tap_cnpj_signups.toLocaleString(),
    "  ├─ Web": totals.signup_web.toLocaleString(),
    "  └─ LINK": totals.link_signup.toLocaleString(),
    "✅ Ativações TOTAL": totalActivations.toLocaleString(),
    "  ├─ TAP": totals.tap_activations.toLocaleString(),
    "  ├─ App": totals.activation_app.toLocaleString(),
    "  ├─ Web": totals.activation_web.toLocaleString(),
    "  └─ LINK": totals.link_activations.toLocaleString(),
    "🛒 POS Sales": totals.pos_sales.toLocaleString(),
    "🍕 Piselli Sales": totals.piselli_sales.toLocaleString(),
    "📱 Installs (JIM)": totals.install.toLocaleString(),
    "🎯 5ª Transação": totals.tap_5trx.toLocaleString(),
    "---": "---",
    "📊 CTR": `${ctr.toFixed(2)}%`,
    "🪝 Hook Rate": `${hookRate.toFixed(2)}%`,
    "💰 CPM": `R$ ${cpm.toFixed(2)}`,
    "💵 CPA": `R$ ${cpa.toFixed(2)}`,
    "💸 CAC": `R$ ${cac.toFixed(2)}`,
  });
  
  console.groupEnd();

  // ============================================
  // POR PRODUTO
  // ============================================
  console.group("📦 POR PRODUTO");
  
  const byProduct = data.reduce((acc, row) => {
    const product = row.product || "UNKNOWN";
    if (!acc[product]) {
      acc[product] = {
        records: 0,
        cost: 0,
        impressions: 0,
        clicks: 0,
        signups: 0,
        activations: 0,
        pos_sales: 0,
        piselli_sales: 0,
        install: 0,
      };
    }
    
    acc[product].records++;
    acc[product].cost += row.cost || 0;
    acc[product].impressions += row.impressions || 0;
    acc[product].clicks += row.clicks || 0;
    
    // Signups por produto
    acc[product].signups += (row["tap signup"] || 0) + 
                             (row["tap cnpj signups"] || 0) + 
                             (row.signup_web || 0) + 
                             (row.link_signup || 0);
    
    // Activations por produto
    acc[product].activations += (row["tap activations"] || 0) + 
                                  (row.activation_app || 0) + 
                                  (row.activation_web || 0) + 
                                  (row.link_activations || 0);
    
    acc[product].pos_sales += row.pos_sales || 0;
    acc[product].piselli_sales += row.piselli_sales || 0;
    acc[product].install += row.install || 0;
    
    return acc;
  }, {} as Record<string, any>);

  Object.entries(byProduct).forEach(([product, stats]) => {
    const cpa = stats.signups > 0 ? stats.cost / stats.signups : 0;
    const cac = stats.activations > 0 ? stats.cost / stats.activations : 0;
    
    console.log(`\n🏷️ ${product}`);
    console.table({
      "Records": stats.records,
      "Custo": `R$ ${stats.cost.toFixed(2)}`,
      "Impressões": stats.impressions.toLocaleString(),
      "Clicks": stats.clicks.toLocaleString(),
      "Signups": stats.signups.toLocaleString(),
      "Ativações": stats.activations.toLocaleString(),
      "POS Sales": stats.pos_sales.toLocaleString(),
      "Piselli": stats.piselli_sales.toLocaleString(),
      "Installs": stats.install.toLocaleString(),
      "CPA": `R$ ${cpa.toFixed(2)}`,
      "CAC": `R$ ${cac.toFixed(2)}`,
    });
  });
  
  console.groupEnd();

  // ============================================
  // POR PLATAFORMA
  // ============================================
  console.group("🌐 POR PLATAFORMA");
  
  const byPlatform = data.reduce((acc, row) => {
    const platform = row.platform || "UNKNOWN";
    if (!acc[platform]) {
      acc[platform] = {
        records: 0,
        cost: 0,
        impressions: 0,
        clicks: 0,
        signups: 0,
        activations: 0,
      };
    }
    
    acc[platform].records++;
    acc[platform].cost += row.cost || 0;
    acc[platform].impressions += row.impressions || 0;
    acc[platform].clicks += row.clicks || 0;
    acc[platform].signups += (row["tap signup"] || 0) + 
                              (row["tap cnpj signups"] || 0) + 
                              (row.signup_web || 0) + 
                              (row.link_signup || 0);
    acc[platform].activations += (row["tap activations"] || 0) + 
                                   (row.activation_app || 0) + 
                                   (row.activation_web || 0) + 
                                   (row.link_activations || 0);
    
    return acc;
  }, {} as Record<string, any>);

  Object.entries(byPlatform).forEach(([platform, stats]) => {
    const ctr = stats.impressions > 0 ? (stats.clicks / stats.impressions) * 100 : 0;
    
    console.log(`\n📱 ${platform.toUpperCase()}`);
    console.table({
      "Records": stats.records,
      "Custo": `R$ ${stats.cost.toFixed(2)}`,
      "Impressões": stats.impressions.toLocaleString(),
      "Clicks": stats.clicks.toLocaleString(),
      "CTR": `${ctr.toFixed(2)}%`,
      "Signups": stats.signups.toLocaleString(),
      "Ativações": stats.activations.toLocaleString(),
    });
  });
  
  console.groupEnd();

  // ============================================
  // SAMPLE DE DADOS BRUTOS
  // ============================================
  console.group("📋 SAMPLE DE DADOS BRUTOS (primeiros 3 registros)");
  console.table(data.slice(0, 3).map(row => ({
    date: row.date,
    product: row.product,
    platform: row.platform,
    ad_name: row.ad_name?.substring(0, 30) + "...",
    cost: row.cost,
    impressions: row.impressions,
    clicks: row.clicks,
    "tap signup": row["tap signup"],
    "tap activations": row["tap activations"],
    signup_web: row.signup_web,
    activation_app: row.activation_app,
  })));
  console.groupEnd();

  console.groupEnd(); // End main group
}


