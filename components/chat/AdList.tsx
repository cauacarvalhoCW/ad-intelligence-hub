"use client";

import React from "react";
import { Badge } from "@/shared/ui/badge";
import type { ParsedAds, AdItem } from "@/lib/chat/adsParser";

function AdCard({ item }: { item: AdItem }) {
  // Normalize title/link if title contains markdown link or is a URL
  let titleLabel = item.title || "";
  let href = item.link || "";
  const md = titleLabel.match(/\[([^\]]+)\]\(([^)]+)\)/);
  if (md) {
    titleLabel = md[1].trim();
    href = href || md[2].trim();
  } else if (/^https?:\/\//i.test(titleLabel)) {
    href = href || titleLabel.trim();
    titleLabel = "Ver anúncio";
  }
  const adIdFromHref = href.match(/[?&]id=(\d{6,})/);
  const fallbackAdId = adIdFromHref ? adIdFromHref[1] : undefined;
  const finalAdId = item.adId || fallbackAdId;
  return (
    <div className="rounded-xl border bg-muted/30 p-4 space-y-3 border-border dark:border-white/20">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {typeof item.index !== "undefined" && (
              <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs px-2 font-medium">
                {item.index}
              </span>
            )}
            {titleLabel &&
              (href ? (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-primary underline hover:no-underline"
                >
                  {titleLabel}
                </a>
              ) : (
                <div className="font-semibold text-foreground">{titleLabel}</div>
              ))}
          </div>
          {item.product && <div className="text-sm text-muted-foreground">{item.product}</div>}
          {item.description && (
            <div className="text-sm text-foreground/90 whitespace-pre-line">{item.description}</div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {item.assetType && (
            <Badge variant="secondary" className="text-xs capitalize">
              {item.assetType}
            </Badge>
          )}
          {item.date && (
            <Badge variant="outline" className="text-xs dark:border-white/20">
              {item.date}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
        {finalAdId && (
          <div className="text-sm">
            <span className="font-medium mr-1">Ad ID:</span>
            <span className="text-muted-foreground break-all">{finalAdId}</span>
          </div>
        )}
      </div>

      {href && !titleLabel.startsWith("Ver anúncio") && (
        <div>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-primary underline hover:no-underline"
          >
            Ver anúncio
          </a>
        </div>
      )}
    </div>
  );
}

export function AdList({ data }: { data: ParsedAds }) {
  return (
    <div className="space-y-4">
      {data.intro && (
        <div className="text-sm text-muted-foreground px-1">{data.intro}</div>
      )}
      {data.items.map((item, idx) => (
        <AdCard key={`${item.adId || "item"}-${idx}`} item={item} />
      ))}
      {data.footer && (
        <div className="text-sm text-muted-foreground px-1">{data.footer}</div>
      )}
    </div>
  );
}

export default AdList;
