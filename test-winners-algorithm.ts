import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Load environment variables
config();

// Simulando o algoritmo de Winners V2
function calculateWinnerScore(cost: number, cac: number): number {
  if (cost <= 0 || cac <= 0 || !isFinite(cac)) return 0;
  return cost * (1 / cac);
}

async function testWinnersAlgorithm() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL_GROWTH!,
    process.env.SUPABASE_SERVICE_ROLE_KEY_GROWTH!
  );

  console.log("\n🏆 TESTING WINNERS ALGORITHM (Custo + CAC)");
  console.log("=".repeat(80));

  // Buscar ads META dos últimos 7 dias
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const dateFrom = sevenDaysAgo.toISOString().split("T")[0];

  console.log(`📅 Fetching META ads from ${dateFrom} to today`);
  console.log("=".repeat(80));

  const { data: ads, error } = await supabase
    .from("mkt_ads_looker")
    .select(`
      ad_id, 
      ad_name, 
      platform, 
      date, 
      cost, 
      impressions, 
      clicks, 
      signup_web, 
      activation_web, 
      "tap signup", 
      "tap activations"
    `)
    .eq("platform", "meta")
    .gte("date", dateFrom)
    .order("cost", { ascending: false })
    .limit(50);

  if (error) {
    console.error("❌ Error:", error.message);
    return;
  }

  if (!ads || ads.length === 0) {
    console.log("❌ No ads found");
    return;
  }

  console.log(`\n✅ Found ${ads.length} META ads\n`);

  // Calcular CAC e Score para cada ad
  const adsWithScores = ads
    .map((ad) => {
      // Calcular signups (signup_web + tap signup)
      const signups = (ad.signup_web || 0) + (ad["tap signup"] || 0);
      
      // Calcular activations (activation_web + tap activations)
      const activations = (ad.activation_web || 0) + (ad["tap activations"] || 0);
      
      // Calcular CAC
      const cac = activations > 0 ? (ad.cost || 0) / activations : null;
      
      // Calcular Score
      const score = cac ? calculateWinnerScore(ad.cost || 0, cac) : 0;

      return {
        ad_id: ad.ad_id,
        ad_name: ad.ad_name,
        date: ad.date,
        cost: ad.cost,
        impressions: ad.impressions,
        clicks: ad.clicks,
        signups,
        activations,
        cac,
        score,
      };
    })
    .filter((ad) => ad.score > 0) // Apenas ads com score válido
    .sort((a, b) => b.score - a.score); // Ordenar por score (maior = melhor)

  console.log(`\n🏆 TOP 10 WINNERS (Custo-Eficiência):\n`);
  console.log("Rank | Score    | Cost      | CAC       | Ad ID               | Ad Name");
  console.log("-".repeat(100));

  adsWithScores.slice(0, 10).forEach((ad, i) => {
    const rank = (i + 1).toString().padStart(4);
    const score = ad.score.toFixed(2).padStart(8);
    const cost = `R$ ${ad.cost?.toFixed(2)}`.padStart(10);
    const cac = ad.cac ? `R$ ${ad.cac.toFixed(2)}`.padStart(10) : "N/A".padStart(10);
    const adId = ad.ad_id?.toString().padEnd(20) || "N/A".padEnd(20);
    const adName = ad.ad_name?.slice(0, 40) || "N/A";

    console.log(`${rank} | ${score} | ${cost} | ${cac} | ${adId} | ${adName}`);
  });

  console.log("\n" + "=".repeat(80));
  console.log(`\n📊 STATISTICS:`);
  console.log(`Total ads analyzed: ${ads.length}`);
  console.log(`Ads with valid score: ${adsWithScores.length}`);
  console.log(`Winner ad_id: ${adsWithScores[0]?.ad_id || "N/A"}`);
  console.log(`Winner score: ${adsWithScores[0]?.score.toFixed(2) || "N/A"}`);
  console.log("\n💡 TIP: Use the winner ad_id to test the preview modal!\n");
}

testWinnersAlgorithm().catch(console.error);
