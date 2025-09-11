export type AdItem = {
  index?: number;
  title?: string;
  product?: string;
  adId?: string;
  assetType?: string;
  date?: string;
  link?: string;
  description?: string;
};

export type ParsedAds = {
  intro?: string;
  items: AdItem[];
  footer?: string;
};

const stripMd = (s: string) =>
  s
    .replace(/\*\*|__|`/g, "")
    .replace(/^\*+/, "")
    .replace(/\*+$/, "")
    .trim();

const isKV = (l: string) => /^\s*[-*•]?\s*[^:]+:\s*.+$/.test(l);
const parseKV = (l: string) => {
  const m = l
    .trim()
    .replace(/^[-*•]\s*/, "")
    .match(/^([^:]+):\s*(.+)$/);
  if (!m) return null;
  return { key: stripMd(m[1]).toLowerCase(), value: stripMd(m[2]) };
};

const isNumberLine = (l: string) => /^\s*\d+\.\s/.test(l);
const isBareNumber = (l: string) => /^\s*\d+\s*$/.test(l);
const isAnyNumberStart = (l: string) => isNumberLine(l) || isBareNumber(l);

const splitInlineNumbers = (line: string): string[] => {
  // Split when a number-dot-space appears and it isn't at the very start
  return line
    .split(/(?=\d+\.\s)/g)
    .map((s) => s.trim())
    .filter(Boolean);
};

const toFriendly = (v?: string) => {
  if (!v) return v;
  const s = v.trim();
  if (/^(error|erro|n[\/\\]?a|null|undefined)$/i.test(s)) return "Informação não disponível";
  return s;
};

export function parseAdsFromText(raw: string): ParsedAds {
  const lines: string[] = [];
  raw
    .replace(/\r\n/g, "\n")
    .split("\n")
    .forEach((l) => splitInlineNumbers(l).forEach((s) => lines.push(s)));

  // Normalize cases where numbering breaks across lines, e.g.,
  // line[k] === "1" and line[k+1] === "0. PagBank" -> "10. PagBank"
  for (let k = 0; k < lines.length - 1; k++) {
    const a = lines[k].trim();
    const b = lines[k + 1].trim();
    if (/^\d+$/.test(a)) {
      const m = b.match(/^(\d)\.\s*(.*)$/);
      if (m) {
        lines[k] = `${a}${m[1]}. ${m[2]}`;
        lines.splice(k + 1, 1);
      }
    }
  }

  // Intro text before first numbered item
  let i = 0;
  const introParts: string[] = [];
  while (i < lines.length && !isAnyNumberStart(lines[i])) {
    if (lines[i].trim()) introParts.push(stripMd(lines[i]));
    i++;
  }
  const intro = introParts.join("\n") || undefined;

  const items: AdItem[] = [];
  const helperLines: string[] = [];
  while (i < lines.length) {
    const line = lines[i];
    if (!isAnyNumberStart(line)) {
      i++;
      continue;
    }
    // Start new item
    const numMatch = line.match(/^(\d+)\.\s*(.*)$/);
    const bareMatch = !numMatch ? line.match(/^(\d+)\s*$/) : null;
    const index = numMatch
      ? parseInt(numMatch[1], 10)
      : bareMatch
        ? parseInt(bareMatch[1], 10)
        : undefined;
    const rest = stripMd(numMatch?.[2] || "");

    const item: AdItem = { index };

    // Try parse "key: value" in the same line
    const kvSame = parseKV(rest);
    if (kvSame) {
      if (
        ["ad id", "ad_id", "adid", "id do anuncio", "idanuncio"].includes(
          kvSame.key.replace(/[ _]/g, ""),
        )
      ) {
        item.adId = kvSame.value.replace(/[^0-9]/g, "");
      } else if (["product", "produto"].includes(kvSame.key)) {
        item.product = toFriendly(kvSame.value);
      } else if (["tipo", "type", "asset_type", "asset type"].includes(kvSame.key)) {
        item.assetType = toFriendly(kvSame.value);
      } else if (["data", "date"].includes(kvSame.key)) {
        item.date = toFriendly(kvSame.value);
      } else {
        // If no known key, treat as description/title
        item.title = rest;
      }
    } else if (rest) {
      // Inline markdown link in the same numbered line
      const inlineLink = rest.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (inlineLink) {
        const label = inlineLink[1].trim();
        const url = inlineLink[2].trim();
        item.title = label;
        item.link = url;
        const idm = url.match(/[?&]id=(\d{6,})/);
        if (idm) item.adId = idm[1];

        // Parse trailing metadata after ")" in the same line, e.g.:
        // "[Título](url) - Produto: X - Data: 10/09/2025"
        const tail = rest.slice(rest.indexOf(inlineLink[0]) + inlineLink[0].length).trim();
        if (tail) {
          // Split by " - " while keeping simple tokens
          tail
            .split(/\s+-\s+/)
            .map((seg) => seg.trim())
            .filter(Boolean)
            .forEach((seg) => {
              const kv = parseKV(seg);
              if (kv) {
                if (["product", "produto"].includes(kv.key)) item.product = toFriendly(kv.value);
                else if (["data", "date"].includes(kv.key)) item.date = toFriendly(kv.value);
                else if (["tipo", "type", "asset_type", "asset type"].includes(kv.key))
                  item.assetType = toFriendly(kv.value);
              } else {
                // Try plain date inside segment
                const dm = seg.match(/\b(\d{2}\/\d{2}\/\d{4})\b/);
                if (dm && !item.date) item.date = dm[1];
              }
            });
        }
      } else {
        item.title = rest;
      }
    }

    // Consume following lines until next numbered item
    i++;
    const desc: string[] = [];
    let currencyJoinActive = false;
    let pendingLinkLabel: string | null = null;
    while (i < lines.length && !isAnyNumberStart(lines[i])) {
      const l = lines[i];
      // Pattern: split markdown link across two lines
      const bracketOnly = l.trim().match(/^\[([^\]]+)\]\s*$/);
      if (bracketOnly) {
        pendingLinkLabel = stripMd(bracketOnly[1]);
        i++;
        continue;
      }
      const parenOnly = l.trim().match(/^\(([^)]+)\)\s*$/);
      if (parenOnly && pendingLinkLabel) {
        const url = parenOnly[1].trim();
        item.link = url;
        if (!item.title) item.title = pendingLinkLabel;
        const idm = url.match(/[?&]id=(\d{6,})/);
        if (idm) item.adId = idm[1];
        pendingLinkLabel = null;
        i++;
        continue;
      }
      const linkM = l.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkM) {
        const url = linkM[2].trim();
        item.link = url;
        const idm = url.match(/[?&]id=(\d{6,})/);
        if (idm) item.adId = idm[1];
        i++;
        continue;
      }
      const kv = parseKV(l);
      if (kv) {
        if (
          ["ad id", "ad_id", "adid", "id do anuncio", "idanuncio"].includes(
            kv.key.replace(/[ _]/g, ""),
          )
        ) {
          item.adId = kv.value.replace(/[^0-9]/g, "");
        } else if (["product", "produto"].includes(kv.key)) {
          item.product = toFriendly(kv.value);
        } else if (["tipo", "type", "asset_type", "asset type"].includes(kv.key)) {
          item.assetType = toFriendly(kv.value);
        } else if (["data", "date"].includes(kv.key)) {
          item.date = toFriendly(kv.value);
        } else {
          desc.push(stripMd(l));
        }
        i++;
        continue;
      }
      // Detect date plain
      const dm = l.match(/\b(\d{2}\/\d{2}\/\d{4})\b/);
      if (dm && !item.date) item.date = dm[1];
      // Detect asset type by tokens
      if (/\b(v[ií]deo|video)\b/i.test(l) && !item.assetType) item.assetType = "Vídeo";
      if (/\b(imagem|image)\b/i.test(l) && !item.assetType) item.assetType = "Imagem";

      // Currency join handling: if previous line had 'R$', join subsequent numeric fragments
      const s = stripMd(l);
      if (currencyJoinActive && /^[0-9.,]+$/.test(s)) {
        const last = desc.pop() || "";
        // append without spaces between numeric fragments
        const merged = last + s;
        desc.push(merged);
        i++;
        continue;
      }

      // Skip assistant helper phrases from description, but keep them to show as footer
      const lower = s.toLowerCase();
      const isHelper =
        lower.includes("se precisar de mais informa") ||
        lower.includes("estou a disposi") ||
        lower.includes("estou à disposi") ||
        lower.includes("posso ajudar em algo") ||
        lower.includes("me avise se precisar");

      if (s && !isHelper) {
        desc.push(s);
        if (s.includes("R$")) {
          currencyJoinActive = true;
        } else {
          currencyJoinActive = false;
        }
      } else if (s && isHelper) {
        helperLines.push(s);
      }
      i++;
    }

    // Final normalization
    // 1) Collapse whitespaces inside currency patterns like
    //    "R$ 3\n0\n0" -> "R$ 300"
    let description = desc.join("\n");
    description = description.replace(/R\$\s*([0-9\s\.,]+)/g, (_m, g1) => {
      const compact = g1.replace(/[\s\n]+/g, "");
      return `R$ ${compact}`;
    });
    // 2) Remove a trailing dot that belongs to the currency and isn't a decimal separator
    //    e.g., "R$ 300." -> "R$ 300"
    description = description.replace(/(R\$\s*\d[\d.]*)(\.)(?!\d)/g, "$1");
    // 3) Normalize spaces around currency
    description = description.replace(/R\$\s*(\d)/g, "R$ $1");
    item.description = description || item.description;

    if (!item.link && item.adId) {
      item.link = `https://www.facebook.com/ads/library/?id=${encodeURIComponent(item.adId)}`;
    }
    items.push(item);
  }

  // Compose footer from helper lines (dedup + join)
  const footer = Array.from(new Set(helperLines)).join(" ") || undefined;

  return { intro, items, footer };
}
