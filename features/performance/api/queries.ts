import { createSupabaseGrowthServer } from "./server";
import type { PerformanceQueryParams } from "./types";
import type { MktAdsLookerRow } from "../types";

/**
 * Convert platform values to lowercase for Supabase queries
 * Frontend uses: META, GOOGLE, TIKTOK
 * Supabase has: meta, google, tiktok
 */
function normalizePlatforms(platforms: string[]): string[] {
  return platforms.map(p => p.toLowerCase());
}

/**
 * Calculate date range based on preset
 */
export function calculateDateRange(range: string = "7d"): { from: string; to: string } {
  const now = new Date();
  const to = now.toISOString().split("T")[0]; // YYYY-MM-DD
  
  let from: Date;
  switch (range) {
    case "yesterday":
      from = new Date(now);
      from.setDate(now.getDate() - 1);
      break;
    case "7d":
      from = new Date(now);
      from.setDate(now.getDate() - 7);
      break;
    case "30d":
      from = new Date(now);
      from.setDate(now.getDate() - 30);
      break;
    case "alltime":
      from = new Date("2020-01-01"); // Far past
      break;
    default:
      from = new Date(now);
      from.setDate(now.getDate() - 7);
  }
  
  return {
    from: from.toISOString().split("T")[0],
    to,
  };
}

/**
 * Fetch performance data from mkt_ads_looker table
 * 
 * Note: Columns with spaces need quotes in SQL, but Supabase handles this automatically
 * when we use .select() with proper syntax
 */
export async function fetchPerformanceData(params: PerformanceQueryParams) {
  const supabase = await createSupabaseGrowthServer();
  
  // Calculate date range
  let dateFrom = params.dateFrom;
  let dateTo = params.dateTo;
  
  if (!dateFrom || !dateTo) {
    const range = calculateDateRange(params.range);
    dateFrom = range.from;
    dateTo = range.to;
  }
  
  // Build query
  let query = supabase
    .from("mkt_ads_looker")
    .select("*")
    .gte("date", dateFrom)
    .lte("date", dateTo);
  
  // Filter by product(s)
  if (params.product) {
    query = query.eq("product", params.product);
  } else if (params.products && params.products.length > 0) {
    query = query.in("product", params.products);
  }
  
  // Filter by platform(s) - Convert to lowercase for Supabase
  if (params.platforms && params.platforms.length > 0) {
    query = query.in("platform", normalizePlatforms(params.platforms));
  }
  
  // Search in ad_name or campaign_name
  if (params.search) {
    query = query.or(
      `ad_name.ilike.%${params.search}%,campaign_name.ilike.%${params.search}%`
    );
  }
  
  // Order by date desc
  query = query.order("date", { ascending: false });
  
  // ⚠️ IMPORTANTE: Remover limite de 1000 registros padrão do Supabase
  // Buscar TODOS os registros usando paginação
  let allData: MktAdsLookerRow[] = [];
  let hasMore = true;
  let offset = 0;
  const PAGE_SIZE = 1000;
  
  while (hasMore) {
    const { data, error } = await query.range(offset, offset + PAGE_SIZE - 1);
    
    if (error) {
      console.error("Supabase query error:", error);
      throw new Error(`Failed to fetch performance data: ${error.message}`);
    }
    
    if (data && data.length > 0) {
      allData = allData.concat(data as MktAdsLookerRow[]);
      offset += PAGE_SIZE;
      
      // Se retornou menos que PAGE_SIZE, não há mais dados
      if (data.length < PAGE_SIZE) {
        hasMore = false;
      }
    } else {
      hasMore = false;
    }
  }
  
  // Cast to our type (Supabase returns generic Record<string, any>)
  return {
    data: allData,
    count: allData.length,
  };
}

/**
 * Fetch aggregated KPIs for a given filter set
 * This is more efficient than fetching all rows and calculating on client
 */
export async function fetchAggregatedKPIs(params: PerformanceQueryParams) {
  const supabase = await createSupabaseGrowthServer();
  
  // Calculate date range
  let dateFrom = params.dateFrom;
  let dateTo = params.dateTo;
  
  if (!dateFrom || !dateTo) {
    const range = calculateDateRange(params.range);
    dateFrom = range.from;
    dateTo = range.to;
  }
  
  // Build base query with filters
  let query = supabase
    .from("mkt_ads_looker")
    .select(`
      cost,
      impressions,
      clicks,
      video_3s,
      "tap signup",
      "tap activations",
      "tap 5trx",
      "tap cnpj signups",
      pos_sales,
      piselli_sales,
      install,
      signup_web,
      activation_app,
      activation_web,
      link_signup,
      link_activations
    `)
    .gte("date", dateFrom)
    .lte("date", dateTo);
  
  // Filter by product(s)
  if (params.product) {
    query = query.eq("product", params.product);
  } else if (params.products && params.products.length > 0) {
    query = query.in("product", params.products);
  }
  
  // Filter by platform(s) - Convert to lowercase for Supabase
  if (params.platforms && params.platforms.length > 0) {
    query = query.in("platform", normalizePlatforms(params.platforms));
  }
  
  // ⚠️ IMPORTANTE: Buscar TODOS os registros para agregação precisa
  let allData: any[] = [];
  let hasMore = true;
  let offset = 0;
  const PAGE_SIZE = 1000;
  
  while (hasMore) {
    const { data, error } = await query.range(offset, offset + PAGE_SIZE - 1);
    
    if (error) {
      console.error("Supabase aggregation error:", error);
      throw new Error(`Failed to fetch aggregated KPIs: ${error.message}`);
    }
    
    if (data && data.length > 0) {
      allData = allData.concat(data);
      offset += PAGE_SIZE;
      
      if (data.length < PAGE_SIZE) {
        hasMore = false;
      }
    } else {
      hasMore = false;
    }
  }
  
  // Aggregate on client (Supabase free tier doesn't support aggregate functions easily)
  const aggregated = allData.reduce(
    (acc, row) => {
      acc.cost += row.cost || 0;
      acc.impressions += row.impressions || 0;
      acc.clicks += row.clicks || 0;
      acc.video_3s += row.video_3s || 0;
      acc.tap_signup += row["tap signup"] || 0;
      acc.tap_activations += row["tap activations"] || 0;
      acc.tap_5trx += row["tap 5trx"] || 0;
      acc.tap_cnpj_signups += row["tap cnpj signups"] || 0;
      acc.pos_sales += row.pos_sales || 0;
      acc.piselli_sales += row.piselli_sales || 0;
      acc.install += row.install || 0;
      acc.signup_web += row.signup_web || 0;
      acc.activation_app += row.activation_app || 0;
      acc.activation_web += row.activation_web || 0;
      acc.link_signup += row.link_signup || 0;
      acc.link_activations += row.link_activations || 0;
      return acc;
    },
    {
      cost: 0,
      impressions: 0,
      clicks: 0,
      video_3s: 0,
      tap_signup: 0,
      tap_activations: 0,
      tap_5trx: 0,
      tap_cnpj_signups: 0,
      pos_sales: 0,
      piselli_sales: 0,
      install: 0,
      signup_web: 0,
      activation_app: 0,
      activation_web: 0,
      link_signup: 0,
      link_activations: 0,
    }
  );
  
  return aggregated;
}


