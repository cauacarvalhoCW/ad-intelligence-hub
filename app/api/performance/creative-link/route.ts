import { NextRequest, NextResponse } from "next/server";
import { createSupabaseGrowthServer } from "@/features/performance/api/server";

// ============================================
// CREATIVE LINK WEBHOOK API (SIMPLIFIED)
// ============================================
// Purpose: Trigger N8N webhook to fetch and save creative data for META ads
// N8N handles: Fetch creative_link + preview_image + Save to Supabase
// This API: Just triggers webhook and returns data from Supabase
// ============================================

const CACHE_VALIDITY_DAYS = 4;
const N8N_WEBHOOK_URL = process.env.N8N_CREATIVE_LINK_WEBHOOK_URL || "";

interface CreativeLinkResponse {
  success: boolean;
  ad_id: number;
  creative_link: string | null;
  image_preview_link: string | null;
  cached: boolean;
  link_update_at: string | null;
  error?: string;
}

/**
 * GET /api/performance/creative-link?ad_id=123
 * 
 * Flow:
 * 1. Check if cached link is valid (< 4 days)
 * 2. If valid → return from Supabase
 * 3. If not → call N8N webhook (N8N saves to Supabase)
 * 4. Re-fetch from Supabase and return
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ad_id = searchParams.get("ad_id");

    if (!ad_id) {
      return NextResponse.json(
        { success: false, error: "Missing ad_id parameter" },
        { status: 400 }
      );
    }

    // Get ad from Supabase
    const supabase = await createSupabaseGrowthServer();
    
    console.log(`🔍 [Creative Link API] Searching for ad_id: ${ad_id} (type: ${typeof ad_id})`);
    
    // Try with numeric conversion
    const numericAdId = Number(ad_id);
    
    const { data: ad, error: fetchError } = await supabase
      .from("mkt_ads_looker")
      .select("id, ad_id, ad_name, platform, creative_link, image_preview_link, link_update_at")
      .eq("ad_id", numericAdId)
      .limit(1)
      .single();

    if (fetchError || !ad) {
      console.error("❌ [Creative Link API] Ad not found:", {
        ad_id,
        numericAdId,
        error: fetchError,
        message: fetchError?.message,
        code: fetchError?.code,
      });
      
      // Try to check if ad exists at all
      const { count } = await supabase
        .from("mkt_ads_looker")
        .select("*", { count: "exact", head: true })
        .eq("ad_id", numericAdId);
      
      console.log(`🔍 [Creative Link API] Ad count for ad_id=${numericAdId}: ${count}`);
      
      return NextResponse.json(
        { success: false, error: `Ad not found (searched for ad_id=${numericAdId})` },
        { status: 404 }
      );
    }
    
    console.log(`✅ [Creative Link API] Found ad:`, {
      id: ad.id,
      ad_id: ad.ad_id,
      ad_name: ad.ad_name,
      platform: ad.platform,
    });

    // Only works for META
    if (ad.platform.toUpperCase() !== "META") {
      return NextResponse.json(
        { 
          success: false, 
          error: "Creative link webhook only available for META platform" 
        },
        { status: 400 }
      );
    }

    // Check if cached link is still valid
    const isCacheValid = isLinkCacheValid(ad.link_update_at);

    if (ad.creative_link && isCacheValid) {
      console.log("✅ [Creative Link API] Using cached data for ad:", ad_id);
      return NextResponse.json({
        success: true,
        ad_id: ad.ad_id,
        creative_link: ad.creative_link,
        image_preview_link: ad.image_preview_link,
        cached: true,
        link_update_at: ad.link_update_at,
      } as CreativeLinkResponse);
    }

    // Trigger N8N webhook to fetch and save
    console.log("🔄 [Creative Link API] Triggering N8N webhook for ad:", ad_id);
    const webhookSuccess = await triggerN8NWebhook(ad.ad_id);

    if (!webhookSuccess) {
      console.error("❌ [Creative Link API] N8N webhook failed");
      return NextResponse.json(
        { 
          success: false, 
          error: "Failed to fetch creative data from N8N" 
        },
        { status: 500 }
      );
    }

    // N8N saved to Supabase, now fetch the updated data
    console.log("✅ [Creative Link API] N8N webhook completed, fetching updated data...");
    const { data: updatedAd, error: refetchError } = await supabase
      .from("mkt_ads_looker")
      .select("ad_id, creative_link, image_preview_link, link_update_at")
      .eq("ad_id", ad_id)
      .limit(1)
      .single();

    if (refetchError || !updatedAd) {
      console.error("❌ [Creative Link API] Failed to fetch updated data");
      return NextResponse.json(
        { 
          success: false, 
          error: "Failed to retrieve updated creative data" 
        },
        { status: 500 }
      );
    }

    console.log("✅ [Creative Link API] Successfully fetched and returned new data for ad:", ad_id);
    return NextResponse.json({
      success: true,
      ad_id: updatedAd.ad_id,
      creative_link: updatedAd.creative_link,
      image_preview_link: updatedAd.image_preview_link,
      cached: false,
      link_update_at: updatedAd.link_update_at,
    } as CreativeLinkResponse);

  } catch (error) {
    console.error("❌ [Creative Link API] Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Check if cached link is still valid (< 4 days old)
 */
function isLinkCacheValid(link_update_at: string | null): boolean {
  if (!link_update_at) return false;

  const updatedAt = new Date(link_update_at);
  const now = new Date();
  const diffInMs = now.getTime() - updatedAt.getTime();
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

  return diffInDays < CACHE_VALIDITY_DAYS;
}

/**
 * Trigger N8N webhook to fetch and save creative data
 * N8N is responsible for:
 * 1. Fetching creative_link from META
 * 2. Fetching image_preview_link
 * 3. Saving both to Supabase (mkt_ads_looker)
 * 4. Updating link_update_at timestamp
 */
async function triggerN8NWebhook(ad_id: number): Promise<boolean> {
  if (!N8N_WEBHOOK_URL) {
    console.error("❌ [N8N Webhook] N8N_CREATIVE_LINK_WEBHOOK_URL not configured");
    return false;
  }

  try {
    console.log(`🔗 [N8N Webhook] Calling: ${N8N_WEBHOOK_URL} with ad_id=${ad_id}`);
    
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ad_id }),
    });

    if (!response.ok) {
      console.error(`❌ [N8N Webhook] HTTP ${response.status}: ${response.statusText}`);
      return false;
    }

    const data = await response.json();
    console.log("✅ [N8N Webhook] Response:", data);

    // N8N should return success confirmation
    return data.success === true || response.ok;

  } catch (error) {
    console.error("❌ [N8N Webhook] Fetch error:", error);
    return false;
  }
}
