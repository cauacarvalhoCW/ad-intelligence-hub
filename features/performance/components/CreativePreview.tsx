"use client";

import { useState } from "react";
import { Play, ExternalLink } from "lucide-react";
import { Button } from "@/shared/ui/button";

interface CreativePreviewProps {
  creativeId: string | null;
  creativeLink: string | null;
  platform: string;
  adName?: string | null;
}

/**
 * Component to display creative preview (video/image) based on platform
 * - GOOGLE: YouTube embed (if creative_link is YouTube URL)
 * - META: Thumbnail from Meta's redirect URL
 * - TIKTOK: Placeholder (no preview yet)
 */
export function CreativePreview({ creativeId, creativeLink, platform, adName }: CreativePreviewProps) {
  const [showVideo, setShowVideo] = useState(false);
  const [imageError, setImageError] = useState(false);

  // 🔍 DEBUG: Log props
  console.log("🎬 [CreativePreview] Render:", {
    creativeId,
    creativeLink,
    platform,
    adName: adName?.slice(0, 50),
  });

  // Extract YouTube video ID from creative_link
  const getYouTubeVideoId = (url: string | null): string | null => {
    if (!url) {
      console.log("❌ [CreativePreview] No URL provided");
      return null;
    }
    
    // Try to match various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/, // Direct video ID
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        console.log("✅ [CreativePreview] YouTube ID extracted:", match[1], "from:", url);
        return match[1];
      }
    }

    console.log("❌ [CreativePreview] Could not extract YouTube ID from:", url);
    return null;
  };

  // Get Meta thumbnail URL (Meta redirects to actual image)
  const getMetaThumbnailUrl = (creativeLink: string | null): string | null => {
    if (!creativeLink) return null;
    
    // Meta creative links are typically in format:
    // https://facebook.com/ads/creative/?id=123456
    // We can try to fetch the redirect URL or use a placeholder
    return creativeLink; // For now, return as-is (Meta handles redirect)
  };

  // No creative link available
  if (!creativeLink) {
    console.log("❌ [CreativePreview] No creative link provided");
    return (
      <div className="w-full h-full bg-muted flex items-center justify-center">
        <div className="text-center text-muted-foreground text-sm">
          <p>📭</p>
          <p className="mt-2">Sem preview</p>
        </div>
      </div>
    );
  }

  // Normalize platform to uppercase for comparison
  const normalizedPlatform = platform.toUpperCase();

  // GOOGLE: YouTube embed
  if (normalizedPlatform === "GOOGLE") {
    const videoId = getYouTubeVideoId(creativeLink);
    
    console.log("📺 [CreativePreview] GOOGLE ad:", {
      creativeLink,
      extractedVideoId: videoId,
    });
    
    if (videoId) {
      return (
        <div className="relative w-full h-full bg-black">
          {showVideo ? (
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
              title={adName || "YouTube video"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <button
              type="button"
              className="relative w-full h-full group"
              onClick={(e) => {
                e.stopPropagation();
                setShowVideo(true);
              }}
              aria-label="Reproduzir vídeo"
            >
              {/* YouTube thumbnail */}
              <img
                src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                alt="YouTube thumbnail"
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to medium quality thumbnail
                  (e.currentTarget as HTMLImageElement).src = 
                    `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
                }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="rounded-full bg-red-600/90 p-3 shadow-lg group-hover:bg-red-600 transition-colors">
                  <Play className="w-7 h-7 text-white" fill="white" />
                </div>
              </div>
            </button>
          )}
        </div>
      );
    }
  }

  // META: Try to load thumbnail (Meta redirects)
  if (normalizedPlatform === "META") {
    const thumbnailUrl = getMetaThumbnailUrl(creativeLink);
    
    if (thumbnailUrl && !imageError) {
      return (
        <div className="relative w-full h-full bg-muted">
          <img
            src={thumbnailUrl}
            alt={adName || "Meta creative"}
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
          {/* Overlay with link */}
          <a
            href={creativeLink}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-2 right-2 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <Button size="sm" variant="secondary" className="gap-2">
              <ExternalLink className="h-3 w-3" />
              Ver no Meta
            </Button>
          </a>
        </div>
      );
    }
  }

  // TIKTOK: Placeholder (no preview yet)
  if (normalizedPlatform === "TIKTOK") {
    return (
      <div className="w-full h-full bg-gradient-to-br from-pink-500/20 to-blue-500/20 flex flex-col items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p className="text-4xl mb-2">🎵</p>
          <p className="text-sm font-medium">TikTok</p>
          <p className="text-xs mt-1">Preview em breve</p>
        </div>
        {/* Link to TikTok */}
        <a
          href={creativeLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4"
          onClick={(e) => e.stopPropagation()}
        >
          <Button size="sm" variant="outline" className="gap-2">
            <ExternalLink className="h-3 w-3" />
            Ver no TikTok
          </Button>
        </a>
      </div>
    );
  }

  // Fallback: Generic link button
  console.log("⚠️ [CreativePreview] Using fallback for platform:", normalizedPlatform, "with link:", creativeLink);
  
  return (
    <div className="w-full h-full bg-muted flex flex-col items-center justify-center">
      <div className="text-center text-muted-foreground text-sm mb-4">
        <p>📄</p>
        <p className="mt-2">{normalizedPlatform}</p>
      </div>
      <a
        href={creativeLink}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
      >
        <Button size="sm" variant="outline" className="gap-2">
          <ExternalLink className="h-3 w-3" />
          Ver Anúncio
        </Button>
      </a>
    </div>
  );
}

