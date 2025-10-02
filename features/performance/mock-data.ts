// ============================================
// PERFORMANCE MODULE - MOCK DATA
// Realistic data based on mkt_ads_looker schema
// ============================================

import type { MktAdsLookerRow, Platform, Product } from "./types";

// Helper to generate dates
const generateDates = (days: number): string[] => {
  const dates: string[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split("T")[0]);
  }
  return dates;
};

// Mock creative IDs and links
const creatives = [
  {
    id: "creative_001",
    link: "https://example.com/creative1.mp4",
    name: "Black Friday - POS Terminal 50% OFF",
  },
  {
    id: "creative_002",
    link: "https://example.com/creative2.mp4",
    name: "Tap to Pay - Sem Maquininha",
  },
  {
    id: "creative_003",
    link: "https://example.com/creative3.jpg",
    name: "Link de Pagamento Grátis",
  },
  {
    id: "creative_004",
    link: "https://example.com/creative4.mp4",
    name: "JIM - Conta Digital Completa",
  },
  {
    id: "creative_005",
    link: "https://example.com/creative5.jpg",
    name: "POS + Piselli - Combo Exclusivo",
  },
  {
    id: "creative_006",
    link: "https://example.com/creative6.mp4",
    name: "Tap Sem Taxa - Promoção Limitada",
  },
];

// Generate mock data for 30 days
export const generateMockData = (): MktAdsLookerRow[] => {
  const data: MktAdsLookerRow[] = [];
  const dates = generateDates(30);
  const platforms: Platform[] = ["META", "GOOGLE", "TIKTOK"];
  const products: Product[] = ["POS", "TAP", "LINK", "JIM"];

  let idCounter = 1;

  dates.forEach((date, dateIndex) => {
    platforms.forEach((platform) => {
      products.forEach((product) => {
        // Skip some combinations for realism
        if (Math.random() > 0.7) return;

        const creative = creatives[Math.floor(Math.random() * creatives.length)];
        const adId = Math.floor(100000 + Math.random() * 900000);
        const campaignId = Math.floor(10000 + Math.random() * 90000);

        // Base metrics with some variation
        const impressions = Math.floor(5000 + Math.random() * 50000);
        const clicks = Math.floor(impressions * (0.01 + Math.random() * 0.05));
        const cost = Math.floor(500 + Math.random() * 5000);
        const video3s = platform === "META" || platform === "TIKTOK"
          ? Math.floor(impressions * (0.15 + Math.random() * 0.25))
          : null;

        // Product-specific metrics
        let tapSignup = 0;
        let tapActivations = 0;
        let tap5trx = 0;
        let tapCnpjSignups = 0;
        let linkSignup = 0;
        let linkActivations = 0;
        let signupWeb = 0;
        let activationApp = 0;
        let activationWeb = 0;
        let install = 0;
        let posSales = 0;
        let piselliSales = 0;

        if (product === "TAP") {
          tapSignup = Math.floor(clicks * (0.1 + Math.random() * 0.3));
          tapCnpjSignups = Math.floor(tapSignup * (0.2 + Math.random() * 0.3));
          tapActivations = Math.floor(tapSignup * (0.3 + Math.random() * 0.4));
          tap5trx = Math.floor(tapActivations * (0.1 + Math.random() * 0.2));
        } else if (product === "LINK") {
          linkSignup = Math.floor(clicks * (0.15 + Math.random() * 0.35));
          linkActivations = Math.floor(linkSignup * (0.4 + Math.random() * 0.5));
        } else if (product === "JIM") {
          install = Math.floor(clicks * (0.2 + Math.random() * 0.4));
          signupWeb = Math.floor(clicks * (0.1 + Math.random() * 0.2));
          activationApp = Math.floor(install * (0.3 + Math.random() * 0.4));
          activationWeb = Math.floor(signupWeb * (0.4 + Math.random() * 0.5));
        } else if (product === "POS") {
          posSales = Math.floor(clicks * (0.02 + Math.random() * 0.08));
          piselliSales = Math.floor(posSales * (0.3 + Math.random() * 0.5));
        }

        data.push({
          id: `mock_${idCounter++}`,
          ad_id: adId,
          ad_name: `${creative.name} - ${platform}`,
          created_at: new Date(date).toISOString(),
          date,
          platform,
          campaign_id: campaignId,
          campaign_name: `Campaign ${product} ${platform} Q4 2025`,
          cost,
          impressions,
          clicks,
          video_3s: video3s,
          "tap signup": tapSignup || null,
          "tap activations": tapActivations || null,
          "tap 5trx": tap5trx || null,
          "tap cnpj signups": tapCnpjSignups || null,
          pos_sales: posSales || null,
          piselli_sales: piselliSales || null,
          install: install || null,
          signup_web: signupWeb || null,
          activation_app: activationApp || null,
          activation_web: activationWeb || null,
          link_signup: linkSignup || null,
          link_activations: linkActivations || null,
          product,
          creative_link: creative.link,
          creative_id: creative.id,
        });
      });
    });
  });

  return data;
};

// Export pre-generated mock data
export const MOCK_ADS_DATA: MktAdsLookerRow[] = generateMockData();

// Helper to filter mock data
export const filterMockData = (
  data: MktAdsLookerRow[],
  filters: {
    platforms?: Platform[];
    products?: Product[];
    range?: "7d" | "30d" | "alltime";
    startDate?: string;
    endDate?: string;
  }
): MktAdsLookerRow[] => {
  let filtered = [...data];

  if (filters.platforms && filters.platforms.length > 0) {
    filtered = filtered.filter((row) => filters.platforms!.includes(row.platform));
  }

  if (filters.products && filters.products.length > 0) {
    filtered = filtered.filter((row) =>
      row.product ? filters.products!.includes(row.product) : false
    );
  }

  if (filters.range) {
    const today = new Date();
    let cutoffDate: Date;

    if (filters.range === "7d") {
      cutoffDate = new Date(today);
      cutoffDate.setDate(today.getDate() - 7);
    } else if (filters.range === "30d") {
      cutoffDate = new Date(today);
      cutoffDate.setDate(today.getDate() - 30);
    } else {
      cutoffDate = new Date(0); // All time
    }

    filtered = filtered.filter((row) => {
      if (!row.date) return false;
      return new Date(row.date) >= cutoffDate;
    });
  }

  if (filters.startDate) {
    filtered = filtered.filter((row) => {
      if (!row.date) return false;
      return row.date >= filters.startDate!;
    });
  }

  if (filters.endDate) {
    filtered = filtered.filter((row) => {
      if (!row.date) return false;
      return row.date <= filters.endDate!;
    });
  }

  return filtered;
};

