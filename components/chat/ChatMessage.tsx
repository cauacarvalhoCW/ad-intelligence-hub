/**
 * Displays individual chat messages with formatting and accessibility features
 * Handles both user and assistant messages with proper ARIA labels
 */

"use client";

import React, { memo } from "react";
import { User, Bot, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { parseAdsFromText } from "@/lib/chat/adsParser";
import AdList from "./AdList";
import { ChatMessage as ChatMessageType } from "@/lib/types/chat";

interface ChatMessageProps {
  message: ChatMessageType;
  isLast?: boolean;
  className?: string;
}

// Message formatting utilities for rich text rendering

function formatTime(date: Date): string {
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMessageContent(content: string): React.ReactNode {
  // Split into lines
  // Pre-process lines and also split cases where multiple numbered items are on the same line
  const splitMultiInlineItems = (s: string): string[] => {
    const pattern = /\d+\.\s*(?:[-*•]\s*)?(?:\*\*)?[^:]+(?:\*\*)?\s*:\s*\S+/g;
    const matches = Array.from(s.matchAll(pattern));
    if (matches.length === 0) return [s];
    const out: string[] = [];
    // Add head segment before first match if any
    const firstIdx = matches[0].index ?? 0;
    if (firstIdx > 0) out.push(s.slice(0, firstIdx).trim());
    for (let i = 0; i < matches.length; i++) {
      const start = matches[i].index ?? 0;
      const end = i + 1 < matches.length ? (matches[i + 1].index ?? s.length) : s.length;
      out.push(s.slice(start, end).trim());
    }
    return out.filter((seg) => seg.length > 0);
  };

  const rawLines = content.split("\n");
  const lines: string[] = [];
  for (const rl of rawLines) {
    const segs = splitMultiInlineItems(rl);
    for (const seg of segs) lines.push(seg);
  }

  return lines.map((line, index) => {
    // Empty line
    if (line.trim() === "") {
      return <br key={index} />;
    }

    // Detect and link ad IDs inside the text (e.g., "ad id: 123456789012345")
    const renderWithAdIdLinks = (text: string): React.ReactNode => {
      // Lone numeric line that looks like an Ad ID
      if (/^\d{8,20}$/.test(text.trim())) {
        const id = text.trim();
        return (
          <a
            key={`adid-${index}`}
            href={`https://www.facebook.com/ads/library/?id=${encodeURIComponent(id)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline hover:no-underline"
          >
            {id}
          </a>
        );
      }

      const re = /(ad[ _-]?id\s*[:#-]?\s*)(\d{8,20})/gi;
      const out: React.ReactNode[] = [];
      let lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = re.exec(text)) !== null) {
        const [full, prefix, id] = m;
        if (m.index > lastIndex) out.push(text.slice(lastIndex, m.index));
        out.push(
          <React.Fragment key={`adidfrag-${index}-${m.index}`}>
            {prefix}
            <a
              href={`https://www.facebook.com/ads/library/?id=${encodeURIComponent(id)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline hover:no-underline"
            >
              {id}
            </a>
          </React.Fragment>,
        );
        lastIndex = m.index + full.length;
      }
      if (lastIndex === 0) return null; // nothing matched
      if (lastIndex < text.length) out.push(text.slice(lastIndex));
      return <>{out}</>;
    };

    const maybeAdLinked = renderWithAdIdLinks(line);
    if (maybeAdLinked) return <div key={index}>{maybeAdLinked}</div>;

    // Helper to render inline formatting (markdown links, bold, code) and auto ad-id links
    const renderInline = (text: string): React.ReactNode => {
      const adLinked = renderWithAdIdLinks(text);
      if (adLinked) return adLinked;

      // Markdown [text](url)
      const mdLink = /\[([^\]]+)\]\(([^)]+)\)/g;
      if (mdLink.test(text)) {
        const parts = text.split(mdLink);
        const out: React.ReactNode[] = [];
        for (let i = 0; i < parts.length; i++) {
          if (i % 3 === 0) {
            // plain text
            if (parts[i]) out.push(parts[i]);
          } else if (i % 3 === 1) {
            const label = parts[i];
            const url = parts[i + 1];
            out.push(
              <a
                key={`md-${index}-${i}`}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline hover:no-underline"
              >
                {label}
              </a>,
            );
            i++; // skip url segment
          }
        }
        return <>{out}</>;
      }

      // Plain URL links
      const linkRegex = /(https?:\/\/[^\s]+)/g;
      if (linkRegex.test(text)) {
        const parts = text.split(linkRegex);
        return (
          <>
            {parts.map((part, idx) =>
              part.match(linkRegex) ? (
                <a
                  key={`lnk-${index}-${idx}`}
                  href={part}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline hover:no-underline"
                >
                  {part}
                </a>
              ) : (
                <React.Fragment key={`txt-${index}-${idx}`}>{part}</React.Fragment>
              ),
            )}
          </>
        );
      }

      // Inline bold **text**
      const boldRegex = /\*\*(.*?)\*\*/g;
      if (boldRegex.test(text)) {
        const parts = text.split(boldRegex);
        return (
          <>
            {parts.map((part, i2) =>
              i2 % 2 === 1 ? (
                <strong key={`b-${index}-${i2}`} className="font-semibold">
                  {part}
                </strong>
              ) : (
                <React.Fragment key={`t-${index}-${i2}`}>{part}</React.Fragment>
              ),
            )}
          </>
        );
      }

      // Inline code `...`
      const codeRegex = /`([^`]+)`/g;
      if (codeRegex.test(text)) {
        const parts = text.split(codeRegex);
        return (
          <>
            {parts.map((part, i2) =>
              i2 % 2 === 1 ? (
                <code
                  key={`c-${index}-${i2}`}
                  className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono"
                >
                  {part}
                </code>
              ) : (
                <React.Fragment key={`p-${index}-${i2}`}>{part}</React.Fragment>
              ),
            )}
          </>
        );
      }

      return text;
    };

    // Detect bullet lists
    if (line.match(/^[-*•]\s/)) {
      const inner = line.substring(2);
      return (
        <div key={index} className="ml-4 flex items-start gap-2">
          <span className="text-primary mt-1">•</span>
          <div>{renderInline(inner)}</div>
        </div>
      );
    }

    // Detect numbered lists
    if (line.match(/^\d+\.\s/)) {
      const match = line.match(/^(\d+)\.\s(.*)/);
      if (match) {
        return (
          <div key={index} className="ml-4 flex items-start gap-2">
            <span className="text-primary font-medium mt-1">{match[1]}.</span>
            <div>{renderInline(match[2])}</div>
          </div>
        );
      }
    }

    // Detect bold titles with **text**
    if (line.match(/^\*\*(.*)\*\*$/)) {
      return (
        <div key={index} className="font-semibold text-foreground">
          {line.replace(/^\*\*(.*)\*\*$/, "$1")}
        </div>
      );
    }

    // Fallback inline rendering for normal lines
    return <div key={index}>{renderInline(line)}</div>;
  });
}

// Try to render structured blocks like:
// Intro paragraph(s) at top, followed by items of ads with number/title/fields.
// Supports forms:
// 1. Ad ID: 12345
// key: value
// [Ver anúncio](url)
// And tolerant variations for keys/naming.
function tryRenderStructuredBlocks(content: string): React.ReactNode | null {
  const lines = content.split("\n");
  type Field = { key: string; value?: string; url?: string; linkText?: string };
  type Item = {
    number?: string;
    title?: string;
    description?: string;
    fields: Field[];
  };

  const items: Item[] = [];
  let i = 0;

  const stripMd = (s: string) =>
    s
      .replace(/\*\*|__|`/g, "")
      .replace(/^\*+/, "")
      .replace(/\*+$/, "")
      .replace(/^"|"$/g, "")
      .trim();

  // Accept lines like:
  // - key: value, key: **value**, - **key**: value, or without dash
  const parseKV = (raw: string): { key: string; value: string } | null => {
    const l = raw.trim().replace(/^[-•]\s*/, "");
    const m = l.match(/^\s*\*?\*?([^:]+?)\*?\*?\s*:\s*(.+)$/);
    if (!m) return null;
    const key = stripMd(m[1]);
    const value = stripMd(m[2]);
    if (!key || !value) return null;
    return { key, value };
  };

  // Accept - [text](url) or [text](url)
  const parseLink = (raw: string): { text: string; url: string } | null => {
    const l = raw.trim().replace(/^[-•]\s*/, "");
    const m = l.match(/^\[([^\]]+)\]\(([^\)]+)\)/);
    if (!m) return null;
    return { text: stripMd(m[1]), url: m[2].trim() };
  };

  const isNumberLine = (l: string) => /^\s*\d+\.\s*$/.test(l.trim());
  const numberPrefix = (raw: string): { n: string; rest: string } | null => {
    const m = raw.match(/^\s*(\d+)\.\s*(.*)$/);
    if (!m) return null;
    return { n: m[1], rest: m[2] || "" };
  };
  const isBoldTitle = (l: string) => /^\s*\*\*.*\*\*\s*$/.test(l.trim());
  const numberInlineKV = (raw: string): { n: string; key: string; value: string } | null => {
    // Accept markdown/bullets around the key, e.g., "2. **Ad ID**: 123" or "2. - ad_id: 123"
    const m = raw.match(/^\s*(\d+)\.\s*(?:[-*•]\s*)?(?:\*\*)?([^:]+?)(?:\*\*)?\s*:\s*(.+)$/i);
    if (!m) return null;
    return { n: m[1], key: stripMd(m[2]), value: stripMd(m[3]) };
  };

  const isNonEmptyText = (raw: string) => raw && raw.trim().length > 0;
  const isGenericHelperLine = (t: string) => {
    const s = stripMd(t).toLowerCase();
    return (
      s.includes("se precisar de mais informa") ||
      s.includes("posso ajudar em algo") ||
      s.includes("estou aqui para ajudar") ||
      s.includes("me avise se precisar")
    );
  };

  // Find the first index that starts an item
  const isPotentialItemStart = (raw: string) =>
    !!(numberInlineKV(raw) || numberPrefix(raw) || isNumberLine(raw) || parseKV(raw));

  let preItemDesc: string | undefined;
  let intro = "";
  let startIdx = 0;
  for (; startIdx < lines.length; startIdx++) {
    if (isPotentialItemStart(lines[startIdx])) break;
  }
  // If there is a plain line immediately before the first item, treat it as description of item 1
  if (startIdx > 0) {
    const prev = lines[startIdx - 1];
    if (isNonEmptyText(prev) && !parseKV(prev) && !parseLink(prev) && !isNumberLine(prev)) {
      preItemDesc = stripMd(prev);
      startIdx -= 1; // exclude this line from intro
    }
  }
  // Build intro from 0..startIdx-1
  for (let k = 0; k < startIdx; k++) {
    if (isNonEmptyText(lines[k])) {
      intro += (intro ? "\n" : "") + stripMd(lines[k]);
    }
  }
  i = startIdx;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Pattern A: numbered line with inline key:value (e.g., "1. Ad ID: 123...")
    const inline = numberInlineKV(trimmed);
    if (inline) {
      const fields: Field[] = [{ key: inline.key, value: inline.value }];
      let title: string | undefined;
      const descriptionParts: string[] = [];
      // If this is the first item and we captured a previous plain description, attach it
      if (preItemDesc && items.length === 0) {
        descriptionParts.push(preItemDesc);
        preItemDesc = undefined;
      }
      // Also collect subsequent description, KV, and link lines for this item
      let j = i + 1;
      while (j < lines.length) {
        const cur = lines[j];
        const kv = parseKV(cur);
        const link = parseLink(cur);
        if (kv) {
          fields.push({ key: kv.key, value: kv.value });
          j++;
          continue;
        }
        if (link) {
          fields.push({ key: "link", linkText: link.text, url: link.url });
          j++;
          continue;
        }
        // Stop if next item starts
        if (numberInlineKV(cur) || numberPrefix(cur) || isNumberLine(cur)) break;
        // Plain text line -> treat as description (skip helper lines)
        const text = stripMd(cur);
        if (text && !isGenericHelperLine(text)) descriptionParts.push(text);
        j++;
      }
      const description = descriptionParts.join("\n").trim() || undefined;
      items.push({ number: inline.n, title, description, fields });
      i = j;
      continue;
    }

    // Pattern A2: numbered line without explicit key:value, but starts a new item
    const np = numberPrefix(trimmed);
    if (np) {
      const fields: Field[] = [];
      const descriptionParts: string[] = [];
      // Try to parse the rest as KV first; if not, treat as description
      const restKV = parseKV(np.rest);
      const restLink = parseLink(np.rest);
      if (restKV) fields.push({ key: restKV.key, value: restKV.value });
      else if (!isGenericHelperLine(np.rest) && np.rest) descriptionParts.push(stripMd(np.rest));
      if (restLink)
        fields.push({
          key: "link",
          linkText: restLink.text,
          url: restLink.url,
        });

      let j = i + 1;
      while (j < lines.length) {
        const cur = lines[j];
        const kv = parseKV(cur);
        const link = parseLink(cur);
        if (kv) {
          fields.push({ key: kv.key, value: kv.value });
          j++;
          continue;
        }
        if (link) {
          fields.push({ key: "link", linkText: link.text, url: link.url });
          j++;
          continue;
        }
        // Stop if next item starts
        if (numberInlineKV(cur) || isNumberLine(cur) || numberPrefix(cur)) break;
        const text = stripMd(cur);
        if (text && !isGenericHelperLine(text)) descriptionParts.push(text);
        j++;
      }
      const description = descriptionParts.join("\n").trim() || undefined;
      items.push({ number: np.n, fields, description });
      i = j;
      continue;
    }

    // Pattern B: number line + optional bold title + following kv/link block
    // (legacy structured block)
    // Pattern 1: number line + optional bold title + kv/link block
    if (isNumberLine(trimmed)) {
      const number = trimmed.replace(/\D/g, "");
      let title: string | undefined;
      let j = i + 1;
      if (j < lines.length && isBoldTitle(lines[j])) {
        title = stripMd(lines[j]);
        j++;
      }
      const fields: Field[] = [];
      const descriptionParts: string[] = [];
      let consumedAny = false;
      while (j < lines.length) {
        const kv = parseKV(lines[j]);
        const link = parseLink(lines[j]);
        if (kv) {
          fields.push({ key: kv.key, value: kv.value });
          consumedAny = true;
          j++;
          continue;
        }
        if (link) {
          fields.push({ key: "link", linkText: link.text, url: link.url });
          consumedAny = true;
          j++;
          continue;
        }
        // Stop if next item starts
        if (numberInlineKV(lines[j]) || numberPrefix(lines[j]) || isNumberLine(lines[j])) break;
        const text = stripMd(lines[j]);
        if (text && !isGenericHelperLine(text)) descriptionParts.push(text);
        j++;
      }
      if (consumedAny) {
        const description = descriptionParts.join("\n").trim() || undefined;
        items.push({ number, title, description, fields });
        i = j;
        continue;
      }
    }

    // Pattern C: consecutive kv/link lines without explicit number/title
    const startKV = parseKV(trimmed);
    if (startKV) {
      const fields: Field[] = [{ key: startKV.key, value: startKV.value }];
      let j = i + 1;
      while (j < lines.length) {
        const kv = parseKV(lines[j]);
        const link = parseLink(lines[j]);
        if (!kv && !link) break;
        if (kv) fields.push({ key: kv.key, value: kv.value });
        if (link) fields.push({ key: "link", linkText: link.text, url: link.url });
        j++;
      }
      if (fields.length >= 2) {
        items.push({ fields });
        i = j;
        continue;
      }
    }

    i++;
  }

  if (items.length === 0 && !intro) return null;

  const renderItem = (item: Item, idx: number) => {
    // Extract commonly used fields for nicer presentation
    const normalizeKey = (s: string) =>
      s
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .replace(/[^a-z0-9]+/g, "")
        .trim();

    const matchKey = (key: string, candidates: string[]) => {
      const nk = normalizeKey(key);
      return candidates.some((c) => nk === normalizeKey(c));
    };

    const getVal = (...keys: string[]) => {
      const field = item.fields.find((f) => matchKey(f.key, keys));
      return field?.value;
    };

    const assetRaw = getVal("asset_type", "asset type", "tipo", "type");
    const dateRaw = getVal("data", "date", "publicado em", "publicado", "publication date");
    let product = getVal("product", "produto");
    const adId = getVal(
      "ad_id",
      "ad id",
      "adid",
      "id do anuncio",
      "id do anuncio",
      "idanuncio",
      "idanuncio",
    );
    const link = item.fields.find((f) => f.key === "link");

    // Fallback CTA from ad_id if no explicit link present
    const adIdClean = adId ? adId.replace(/[^0-9]/g, "") : undefined;
    const adLink =
      link?.url ||
      (adIdClean
        ? `https://www.facebook.com/ads/library/?id=${encodeURIComponent(adIdClean)}`
        : undefined);
    const adLinkText = link?.linkText || (adIdClean ? "Ver anúncio" : undefined);

    // Friendly value for missing/error payloads
    const toFriendly = (v?: string) => {
      if (!v) return v;
      const s = v.trim();
      if (/^(error|erro|n[\/\\]?a|null|undefined)$/i.test(s)) return "Informação não disponível";
      return s;
    };
    const asset = toFriendly(assetRaw);
    const date = toFriendly(dateRaw);
    product = toFriendly(product);

    return (
      <div key={idx} className="rounded-xl border bg-muted/30 p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {item.number && (
                <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs px-2 font-medium">
                  {item.number}
                </span>
              )}
              {item.title && (
                <div className="font-semibold text-foreground">{toFriendly(item.title)}</div>
              )}
            </div>
            {(product || adId) && (
              <div className="text-sm text-muted-foreground">{product || adId}</div>
            )}
            {/* Description text (from plain lines) */}
            {item.description && (
              <div className="text-sm text-foreground/90 whitespace-pre-line">
                {item.description}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {asset && (
              <Badge variant="secondary" className="text-xs capitalize">
                {asset}
              </Badge>
            )}
            {date && (
              <Badge variant="outline" className="text-xs">
                {date}
              </Badge>
            )}
          </div>
        </div>

        {/* Key/Value grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
          {item.fields
            .filter(
              (f) =>
                !(
                  matchKey(f.key, ["link"]) ||
                  matchKey(f.key, ["asset_type", "asset type", "tipo", "type"]) ||
                  matchKey(f.key, [
                    "data",
                    "date",
                    "publicado em",
                    "publicado",
                    "publication date",
                  ]) ||
                  matchKey(f.key, ["product", "produto"]) ||
                  matchKey(f.key, ["ad_id", "ad id", "adid", "id do anuncio", "idanuncio"])
                ),
            )
            .map((f, i2) => (
              <div key={i2} className="text-sm">
                <span className="font-medium mr-1">{f.key.replaceAll("_", " ")}:</span>
                <span className="text-muted-foreground break-all">
                  {toFriendly(stripMd(f.value || ""))}
                </span>
              </div>
            ))}
        </div>

        {adLink && (
          <div>
            <a
              href={adLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary underline hover:no-underline"
            >
              {adLinkText}
            </a>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {intro && (
        <div className="rounded-xl border bg-muted/20 px-4 py-3">
          <div className="text-sm font-medium">{intro}</div>
        </div>
      )}
      {items.map(renderItem)}
    </div>
  );
}

// Detect summary lines like "Total de anúncios: 4.525" and a numbered ranking like
// "1. Mercado Pago: 597 vídeos, 627 imagens" and render a compact dashboard.
function tryRenderTotalsAndRanking(content: string): React.ReactNode | null {
  const lines = content
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l !== "");
  if (lines.length === 0) return null;

  const stripMd = (s: string) => s.replace(/\*\*|__|`/g, "").trim();

  const totalRE = /^total\s+de\s+(.+?):\s*([\d\.,]+)/i;
  const rankRE = /^(\d+)\.\s*([^:]+):\s*(.+)$/i;

  type Total = { label: string; value: string };
  type Rank = {
    n: number;
    name: string;
    videos?: string;
    images?: string;
    raw: string;
  };

  const totals: Total[] = [];
  const ranking: Rank[] = [];

  for (const raw of lines) {
    const l = stripMd(raw);
    const tm = l.match(totalRE);
    if (tm) {
      totals.push({ label: tm[1], value: tm[2] });
      continue;
    }
    const rm = l.match(rankRE);
    if (rm) {
      const [, nStr, name, tail] = rm;
      let videos: string | undefined;
      let images: string | undefined;
      // Extract counts tolerant to accents
      const vidM = tail.match(/([\d\.,]+)\s*(vídeos|videos)/i);
      const imgM = tail.match(/([\d\.,]+)\s*(imagens?|images?)/i);
      if (vidM) videos = vidM[1];
      if (imgM) images = imgM[1];
      ranking.push({
        n: parseInt(nStr, 10),
        name: name.trim(),
        videos,
        images,
        raw: tail,
      });
    }
  }

  // Only consider ranking items that actually have at least one metric
  const validRanking = ranking.filter((r) => r.videos || r.images);
  // Require at least 2 totals to show totals, or at least 2 valid ranking entries
  if (totals.length < 2 && validRanking.length < 2) return null;

  return (
    <div className="space-y-3">
      {totals.length >= 2 && (
        <div className="rounded-xl border bg-muted/30 px-4 py-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {totals.map((t, i) => (
              <div key={i} className="flex items-baseline justify-between">
                <span className="text-sm font-medium capitalize">{t.label}</span>
                <span className="text-sm text-muted-foreground tabular-nums">{t.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {validRanking.length >= 2 && (
        <div className="rounded-xl border bg-muted/20 p-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {validRanking
              .sort((a, b) => a.n - b.n)
              .map((r) => (
                <div
                  key={r.n}
                  className="rounded-lg border bg-background/60 px-3 py-2 flex items-start justify-between gap-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs px-2 font-medium">
                      {r.n}
                    </span>
                    <span className="font-medium">{r.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {r.videos && (
                      <span className="inline-flex items-center gap-1">
                        <span className="font-medium">Vídeos:</span>
                        <span className="tabular-nums">{r.videos}</span>
                      </span>
                    )}
                    {r.images && (
                      <span className="inline-flex items-center gap-1">
                        <span className="font-medium">Imagens:</span>
                        <span className="tabular-nums">{r.images}</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Main component with memoization for performance

export const ChatMessage = memo<ChatMessageProps>(({ message, isLast = false, className }) => {
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";
  const isSystem = message.role === "system";

  // Render system message
  if (isSystem) {
    return (
      <div className={cn("flex items-center justify-center py-2", className)}>
        <div className="flex items-center gap-2 bg-muted/50 rounded-full px-3 py-1.5">
          <AlertTriangle className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{message.content}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex gap-3 group animate-in fade-in-0 slide-in-from-bottom-2 duration-300",
        isUser ? "justify-end" : "justify-start",
        className,
      )}
      role="article"
      aria-label={`Mensagem de ${isUser ? "usuário" : "assistente"}`}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          "ring-2 ring-background transition-all duration-200",
          isUser
            ? "bg-primary text-primary-foreground order-2 group-hover:ring-primary/20"
            : "bg-muted text-muted-foreground group-hover:ring-muted-foreground/20",
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* Message content */}
      <div className={cn("max-w-[85%] space-y-1", isUser ? "order-1" : "order-2")}>
        {/* Message bubble */}
        <div
          className={cn(
            "rounded-2xl px-4 py-3 break-words transition-all duration-200",
            "shadow-sm hover:shadow-md",
            isUser
              ? "bg-primary text-primary-foreground rounded-br-md"
              : "bg-muted text-foreground rounded-bl-md border",
          )}
        >
          {/* Formatted content */}
          <div
            className={cn(
              "text-sm leading-relaxed",
              isUser ? "text-primary-foreground" : "text-foreground",
            )}
          >
            {
              // Prefer a simple, robust ad list renderer first
              (() => {
                const parsed = parseAdsFromText(message.content);
                if (parsed.items.length > 0) {
                  return <AdList data={parsed} />;
                }
                return formatMessageContent(message.content);
              })()
            }
          </div>
        </div>

        {/* Timestamp and status */}
        <div
          className={cn(
            "flex items-center gap-2 text-xs text-muted-foreground",
            "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
            isUser ? "justify-end" : "justify-start",
          )}
        >
          <time dateTime={message.timestamp.toISOString()}>{formatTime(message.timestamp)}</time>

          {/* Latest message indicator */}
          {isLast && isAssistant && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
              Latest
            </Badge>
          )}

          {/* Delivery indicator (for user messages) */}
          {isLast && isUser && (
            <span className="text-primary" aria-label="Message sent">
              ✓
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

ChatMessage.displayName = "ChatMessage";

export default ChatMessage;
