import { useState, useCallback } from "react";

// ============================================
// USE CREATIVE LINK HOOK
// ============================================
// Fetches creative preview link from /api/performance/creative-link
// Only works for META platform ads
// Implements cache logic (4 days validity)
// ============================================

interface CreativeLinkResponse {
  success: boolean;
  ad_id: number;
  creative_link: string | null;
  image_preview_link: string | null;
  cached: boolean;
  link_update_at: string | null;
  error?: string;
}

interface UseCreativeLinkReturn {
  creativeLink: string | null;
  previewImage: string | null;
  isLoading: boolean;
  error: string | null;
  isCached: boolean;
  fetchCreativeLink: (ad_id: number) => Promise<void>;
  reset: () => void;
}

/**
 * Hook to fetch creative preview links for META ads
 * 
 * @example
 * ```tsx
 * const { creativeLink, isLoading, fetchCreativeLink } = useCreativeLink();
 * 
 * // On user click
 * await fetchCreativeLink(ad.ad_id);
 * 
 * // Then render preview
 * {creativeLink && <CreativePreview link={creativeLink} />}
 * ```
 */
export function useCreativeLink(): UseCreativeLinkReturn {
  const [creativeLink, setCreativeLink] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCached, setIsCached] = useState(false);

  const fetchCreativeLink = useCallback(async (ad_id: number) => {
    setIsLoading(true);
    setError(null);
    setCreativeLink(null);
    setPreviewImage(null);

    try {
      console.log(`🔗 [useCreativeLink] Fetching creative data for ad_id: ${ad_id}`);
      
      const response = await fetch(`/api/performance/creative-link?ad_id=${ad_id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data: CreativeLinkResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch creative data");
      }

      console.log(`✅ [useCreativeLink] Fetched data (cached: ${data.cached})`);
      setCreativeLink(data.creative_link);
      setPreviewImage(data.image_preview_link);
      setIsCached(data.cached);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error("❌ [useCreativeLink] Error:", errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setCreativeLink(null);
    setPreviewImage(null);
    setIsLoading(false);
    setError(null);
    setIsCached(false);
  }, []);

  return {
    creativeLink,
    previewImage,
    isLoading,
    error,
    isCached,
    fetchCreativeLink,
    reset,
  };
}
