/**
 * ads_query tool — queries ads in Supabase (list/count/search)
 * Designed for V0: simple, direct and fast, without depending on embeddings.
 */

import { z } from "zod";
import { BaseTool, ToolResult } from "./base";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServer } from "@/lib/supabase/server";

const AdsQuerySchema = z.object({
  action: z
    .enum(["list_ads", "count_ads", "search_text"])
    .describe("Tipo de operação desejada"),
  competitor: z
    .string()
    .optional()
    .describe("Nome do competidor (ex: 'Mercado Pago')"),
  asset_type: z
    .enum(["image", "video"])
    .optional()
    .describe("Filtrar por tipo de asset"),
  sort: z
    .enum(["newest", "oldest"])
    .default("newest")
    .describe(
      "Ordenação por data de início: 'newest' (mais recentes) ou 'oldest' (mais antigos)",
    ),
  date_preset: z
    .enum([
      "all_time",
      "today",
      "yesterday",
      "last_7_days",
      "last_30_days",
      "this_week",
      "this_month",
      "date_range",
    ]) // simples p/ V0
    .default("all_time")
    .describe("Janela temporal comum"),
  date_from: z
    .string()
    .optional()
    .describe("YYYY-MM-DD quando usar date_range"),
  date_to: z.string().optional().describe("YYYY-MM-DD quando usar date_range"),
  period_text: z
    .string()
    .optional()
    .describe("Texto natural do período (ex.: 'ontem', 'últimos 7 dias')"),
  search: z
    .string()
    .optional()
    .describe("Termo para busca textual simples (ilike)"),
  limit: z
    .number()
    .min(1)
    .max(100)
    .default(20)
    .describe("Máximo de itens a listar (list_ads/search_text)"),
});

type AdsQueryInput = z.infer<typeof AdsQuerySchema>;

type CompetitorRow = { id: string; name: string };
type AdRow = {
  ad_id: string;
  competitor_id: string;
  asset_type: string;
  product: string | null;
  start_date: string | null;
  created_at?: string | null;
  tags?: string | null;
  image_description?: string | null;
  transcription?: string | null;
  competitors?: { name?: string | null } | null;
};

export class SupabaseAdsTool extends BaseTool {
  name = "ads_query";
  description =
    "Consulta anúncios no Supabase: listar, contar e buscar por texto.\n" +
    "Esquema: competitors(id,name,home_url,created_at,updated_at); ads(ad_id,competitor_id,source,asset_type,product,year,week,start_date,display_format,tags,image_description,transcription); variations(variation_id,parent_ad_id,title,description,button_label,button_url,competitor_id).\n" +
    "Regras: sempre inclua ad_id e use apenas o link do Ads Library (facebook_url); não exiba links do campo source. Ordenação: use 'sort=oldest' para mais antigos. Campos retornados por item: ad_id, competitor (nome), asset_type, product, start_date, date_br, facebook_url.";
  schema = AdsQuerySchema;

  async execute(input: AdsQueryInput): Promise<ToolResult> {
    const start = Date.now();
    try {
      const supabase: SupabaseClient = await createSupabaseServer();

      // Resolve period (interprets natural language text if provided)
      const interpreted = interpretPeriod(input);
      const { fromIso, toIso } = resolveDateRange({ ...input, ...interpreted });

      // Resolve competitor (by name -> ids)
      let competitorIds: string[] | undefined = undefined;
      const normalizedComp = normalizeCompetitor(input.competitor);
      if (normalizedComp && normalizedComp.trim().length > 0) {
        const { data: comps, error: compErr } = await supabase
          .from("competitors")
          .select("id,name")
          .ilike("name", `%${normalizedComp}%`);
        if (compErr) throw compErr;
        const compsData = (comps ?? []) as CompetitorRow[];
        competitorIds = compsData.map((c) => c.id);
        if (competitorIds.length === 0) {
          return {
            success: true,
            data: {
              info: `Nenhum competidor encontrado contendo '${normalizedComp}'.`,
              count: 0,
              items: [],
            },
            metadata: {
              executionTime: Date.now() - start,
              toolName: this.name,
              period: { fromIso, toIso, timezone: "America/Sao_Paulo" },
            },
          };
        }
      }

      // Base select
      let select = supabase
        .from("ads")
        .select(
          `ad_id, competitor_id, asset_type, product, start_date, created_at, tags, image_description, transcription, competitors!ads_competitor_id_fkey (name)`,
          { count: "exact" },
        );

      // Common filters
      if (competitorIds) select = select.in("competitor_id", competitorIds);
      if (input.asset_type) select = select.eq("asset_type", input.asset_type);
      if (fromIso) select = select.gte("start_date", fromIso);
      if (toIso) select = select.lte("start_date", toIso);

      // At least some content
      select = select.or("transcription.neq.,image_description.neq.,tags.neq.");

      // Branch by action
      if (input.action === "count_ads") {
        // For count, we don't need range/pagination
        const { error, count } = await select.limit(1);
        if (error) throw error;
        return {
          success: true,
          data: { count: count || 0 },
          metadata: { executionTime: Date.now() - start, toolName: this.name },
        };
      }

      if (input.action === "search_text" && input.search) {
        select = select.or(
          `tags.ilike.%${input.search}%,image_description.ilike.%${input.search}%,transcription.ilike.%${input.search}%,product.ilike.%${input.search}%`,
        );
      }

      // Sorting and limit for listings
      const ascending = input.sort === "oldest";
      select = select
        .order("start_date", { ascending, nullsFirst: false })
        .order("created_at", { ascending })
        .limit(input.limit ?? 20);

      const { data, error, count } = await select;
      if (error) throw error;

      const rows = (data ?? []) as AdRow[];
      const items = rows.map((ad) => ({
        ad_id: ad.ad_id,
        competitor: ad.competitors?.name,
        asset_type: ad.asset_type,
        product: ad.product,
        start_date: ad.start_date,
        date_br: formatDateBR(ad.start_date),
        facebook_url: ad.ad_id
          ? `https://www.facebook.com/ads/library/?id=${ad.ad_id}`
          : null,
      }));

      return {
        success: true,
        data: {
          count: count || items.length,
          returned: items.length,
          has_more: (count || 0) > items.length,
          items,
        },
        metadata: {
          executionTime: Date.now() - start,
          toolName: this.name,
          period: { fromIso, toIso, timezone: "America/Sao_Paulo" },
        },
      };
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Erro desconhecido ao consultar anúncios";
      return {
        success: false,
        data: null,
        error: msg,
        metadata: { executionTime: Date.now() - start, toolName: this.name },
      };
    }
  }
}

function resolveDateRange(input: AdsQueryInput): {
  fromIso?: string;
  toIso?: string;
} {
  const tz = "America/Sao_Paulo";
  const now = new Date();

  const toStartOfDay = (d: Date) =>
    new Date(
      new Date(d.toLocaleString("en-US", { timeZone: tz })).setHours(
        0,
        0,
        0,
        0,
      ),
    );
  const toEndOfDay = (d: Date) =>
    new Date(
      new Date(d.toLocaleString("en-US", { timeZone: tz })).setHours(
        23,
        59,
        59,
        999,
      ),
    );

  const fmt = (d: Date) => d.toISOString();

  switch (input.date_preset) {
    case "all_time": {
      return {};
    }
    case "today": {
      const f = toStartOfDay(now);
      const t = toEndOfDay(now);
      return { fromIso: fmt(f), toIso: fmt(t) };
    }
    case "yesterday": {
      const y = new Date(now);
      y.setDate(now.getDate() - 1);
      const f = toStartOfDay(y);
      const t = toEndOfDay(y);
      return { fromIso: fmt(f), toIso: fmt(t) };
    }
    case "last_7_days": {
      const f = toStartOfDay(new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000));
      const t = toEndOfDay(now);
      return { fromIso: fmt(f), toIso: fmt(t) };
    }
    case "last_30_days": {
      const f = toStartOfDay(
        new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000),
      );
      const t = toEndOfDay(now);
      return { fromIso: fmt(f), toIso: fmt(t) };
    }
    case "this_week": {
      const d = new Date(now);
      const day = d.getDay(); // 0=Dom
      const diffToMon = (day + 6) % 7; // segunda como início
      const monday = new Date(d);
      monday.setDate(d.getDate() - diffToMon);
      const f = toStartOfDay(monday);
      const t = toEndOfDay(now);
      return { fromIso: fmt(f), toIso: fmt(t) };
    }
    case "this_month": {
      const d = new Date(now);
      const local = new Date(
        new Date(d.toLocaleString("en-US", { timeZone: tz })).setHours(
          0,
          0,
          0,
          0,
        ),
      );
      const startMonth = new Date(local.getFullYear(), local.getMonth(), 1);
      const f = toStartOfDay(startMonth);
      const t = toEndOfDay(now);
      return { fromIso: fmt(f), toIso: fmt(t) };
    }
    case "date_range": {
      if (input.date_from && input.date_to) {
        const f = new Date(
          `${input.date_from}T00:00:00.000-03:00`,
        ).toISOString();
        const t = new Date(`${input.date_to}T23:59:59.999-03:00`).toISOString();
        return { fromIso: f, toIso: t };
      }
      return {};
    }
    default:
      return {};
  }
}

export const adsQueryTool = new SupabaseAdsTool();

function interpretPeriod(input: { period_text?: string }): {
  date_preset?: AdsQueryInput["date_preset"];
} {
  const t = (input.period_text || "").toLowerCase();
  if (!t) return {};
  if (/(ontem|yesterday)/.test(t)) return { date_preset: "yesterday" };
  if (/(hoje|today)/.test(t)) return { date_preset: "today" };
  if (/(últimos|ultimos)\s*7\s*dias/.test(t))
    return { date_preset: "last_7_days" };
  if (/(últimos|ultimos)\s*30\s*dias/.test(t))
    return { date_preset: "last_30_days" };
  if (/(esta|essa)\s*semana|this\s*week/.test(t))
    return { date_preset: "this_week" };
  if (/(este|esse)\s*m[eê]s|this\s*month/.test(t))
    return { date_preset: "this_month" };
  return {};
}

function normalizeCompetitor(name?: string): string | undefined {
  if (!name) return name;
  const n = name.trim().toLowerCase();
  const map: Record<string, string> = {
    mp: "Mercado Pago",
    "mercado pago": "Mercado Pago",
    mercadopago: "Mercado Pago",
    pagbank: "PagBank",
    "pag bank": "PagBank",
    infinitepay: "InfinitePay",
    "infinite pay": "InfinitePay",
    sumup: "SumUp",
    stone: "Stone",
    ton: "Ton",
    paypal: "PayPal",
    stripe: "Stripe",
    square: "Square",
    cora: "Cora",
    jeitto: "Jeitto",
  };
  return map[n] || name;
}

function formatDateBR(dateIso?: string | null): string | null {
  if (!dateIso) return null;
  const d = new Date(dateIso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}
