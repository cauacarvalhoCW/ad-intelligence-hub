"use client";

import { Badge } from "@/shared/ui/badge";
import { extractProductFromAd } from "@/lib/utils/ratesExtractor";
import type { Ad } from "@/lib/types";

interface ProductBadgeProps {
  ad: Ad;
}

export function ProductBadge({ ad }: ProductBadgeProps) {
  const product = extractProductFromAd(ad);
  const assetIcon =
    ad.ad_type === "video"
      ? "🎥"
      : ad.ad_type === "image"
        ? "📸"
        : ad.ad_type === "carousel"
          ? "🎠"
          : "📄";

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Badge variant="outline" className="text-xs font-medium">
        <span className="mr-1">{assetIcon}</span>
        {product}
      </Badge>

      <Badge variant="secondary" className="text-xs">
        {ad.platform}
      </Badge>

      {ad.tags && ad.tags.length > 0 && (
        <Badge variant="outline" className="text-xs text-muted-foreground">
          +{ad.tags.length} tags
        </Badge>
      )}
    </div>
  );
}
