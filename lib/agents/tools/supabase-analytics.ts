/**
 * ads_analytics tool — calls Supabase RPCs for full-text searches and aggregations.
 */

import { z } from "zod";
import { BaseTool, ToolResult } from "./base";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServer } from "@/lib/supabase/server";

const DatePresetEnum = z.enum([
  "all_time",
  "today",
  "yesterday",
  "last_7_days",
  "last_30_days",
  "this_week",
  "this_month",
  "date_range",
]);

const AdsAnalyticsSchema = z.object({
  action: z.enum([
    "search_fulltext",
    "count_by_asset_type",
    "top_competitors",
    "ads_by_day",
    "total_count",
    "count_per_competitor",
    "ads_by_week",
  ]),
  query: z.string().optional().describe("Termo para busca full-text"),
  competitor: z.string().optional(),
  date_preset: DatePresetEnum.default("all_time"),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  period_text: z
    .string()
    .optional()
    .describe("Texto natural do período (ex.: 'ontem', 'últimos 7 dias')"),
  limit: z.number().min(1).max(100).default(10).optional(),
});

type AdsAnalyticsInput = z.infer<typeof AdsAnalyticsSchema>;

type AdMinimalRow = {
  ad_id: string;
  competitor_id: string;
  asset_type: string;
  product: string | null;
  start_date: string | null;
};
type CountPerCompetitor = { empresa: string; total: number };
type TopCompetitor = { empresa: string; total_anuncios: number };
type AssetTypeCounts = {
  empresa: string;
  total_anuncios: number;
  total_videos: number;
  total_imagens: number;
};
type AdsByDay = { dia: string; total_anuncios: number };
type AdsByWeek = { semana_inicio: string; total_anuncios: number };

export class SupabaseAdsAnalyticsTool extends BaseTool {
  name = "ads_analytics";
  description =
    "Análises agregadas e busca textual sobre anúncios.\n" +
    "Ações:\n" +
    "- search_fulltext(query,date_preset|date_range,competitor?): busca em tags, image_description, transcription, ad_analysis.\n" +
    "- count_by_asset_type(date_preset|date_range,competitor?): total, total_videos, total_imagens por competidor.\n" +
    "- top_competitors(date_preset|date_range,limit?): ranking por volume de anúncios.\n" +
    "- ads_by_day(date_preset|date_range,competitor?): série diária (dia,total_anuncios).\n" +
    "- total_count(date_preset|date_range?): total absoluto de anúncios (usa count exato no banco).\n" +
    "- count_per_competitor(date_preset|date_range?): total por competidor (usa count exato por empresa).\n" +
    "Esquema base (Somente): competitors(id,name,...), ads(ad_id,competitor_id,source,asset_type,product,...), variations(...). Sempre priorize retornar dados com contexto (empresa/ad_id/start_date/asset_type/source).";
  schema = AdsAnalyticsSchema;

  async execute(input: AdsAnalyticsInput): Promise<ToolResult> {
    const start = Date.now();
    try {
      const supabase = await createSupabaseServer();
      const interpreted = interpretPeriod(input);
      const { fromIso, toIso } = resolveDateRange({ ...input, ...interpreted });

      // Resolver competidor -> ids
      let competitorIds: string[] | undefined;
      const normalizedComp = normalizeCompetitor(input.competitor);
      if (normalizedComp && normalizedComp.trim()) {
        const { data: comps, error: compErr } = await supabase
          .from("competitors")
          .select("id,name")
          .ilike("name", `%${normalizedComp}%`);
        if (compErr) throw compErr;
        const compRows = (comps ?? []) as Array<{ id: string }>;
        competitorIds = compRows.map((c) => c.id);
        if (competitorIds.length === 0) {
          return {
            success: true,
            data: [],
            metadata: {
              executionTime: Date.now() - start,
              toolName: this.name,
              period: { fromIso, toIso, timezone: TZ },
            },
          };
        }
      }

      // Base query
      const base = supabase.from("ads");
      const baseFiltered = (cols: string) => {
        let q = base.select(cols);
        if (competitorIds) q = q.in("competitor_id", competitorIds);
        if (fromIso) q = q.gte("start_date", fromIso);
        if (toIso) q = q.lte("start_date", toIso);
        return q;
      };

      switch (input.action) {
        case "search_fulltext": {
          if (!input.query || input.query.trim() === "") {
            return {
              success: true,
              data: [],
              metadata: {
                executionTime: Date.now() - start,
                toolName: this.name,
              },
            };
          }
          // Tenta full-text via filtro FTS
          let q = baseFiltered(
            "ad_id, competitor_id, asset_type, product, start_date",
          );
          try {
            // PostgREST suporta operador fts; supabase-js: .filter(col, 'fts', query)
            q = q
              .filter("search_vector", "fts", input.query)
              .limit(input.limit ?? 50)
              .order("start_date", { ascending: false });
            const { data, error } = await q;
            if (error) throw error;
            return {
              success: true,
              data: data || [],
              metadata: {
                executionTime: Date.now() - start,
                toolName: this.name,
                period: { fromIso, toIso, timezone: TZ },
              },
            };
          } catch {
            // Fallback: ILIKE em campos textuais (mais lento, mas compatível)
            const q2 = baseFiltered(
              "ad_id, competitor_id, asset_type, product, start_date",
            )
              .or(
                `tags.ilike.%${input.query}%,image_description.ilike.%${input.query}%,transcription.ilike.%${input.query}%,product.ilike.%${input.query}%`,
              )
              .limit(input.limit ?? 50)
              .order("start_date", { ascending: false });
            const { data, error } = await q2;
            if (error) throw error;
            return {
              success: true,
              data: (data ?? []) as unknown as AdMinimalRow[],
              metadata: {
                executionTime: Date.now() - start,
                toolName: this.name,
                period: { fromIso, toIso, timezone: TZ },
              },
            };
          }
        }
        case "count_by_asset_type": {
          // Exato e determinístico: contar por competidor usando head+count
          const comps = await listCompetitors(supabase, input.competitor);
          const results: AssetTypeCounts[] = [];
          for (const c of comps) {
            const total = await countAds(supabase, {
              competitor_id: c.id,
              fromIso,
              toIso,
            });
            if (total === 0) continue;
            const total_videos = await countAds(supabase, {
              competitor_id: c.id,
              fromIso,
              toIso,
              asset_type: "video",
            });
            const total_imagens = await countAds(supabase, {
              competitor_id: c.id,
              fromIso,
              toIso,
              asset_type: "image",
            });
            results.push({
              empresa: c.name,
              total_anuncios: total,
              total_videos,
              total_imagens,
            });
          }
          results.sort((a, b) => b.total_anuncios - a.total_anuncios);
          return {
            success: true,
            data: results,
            metadata: {
              executionTime: Date.now() - start,
              toolName: this.name,
              period: { fromIso, toIso, timezone: TZ },
            },
          };
        }
        case "top_competitors": {
          const comps = await listCompetitors(supabase, input.competitor);
          const arr: TopCompetitor[] = [];
          for (const c of comps) {
            const total = await countAds(supabase, {
              competitor_id: c.id,
              fromIso,
              toIso,
            });
            if (total > 0) arr.push({ empresa: c.name, total_anuncios: total });
          }
          arr.sort((a, b) => b.total_anuncios - a.total_anuncios);
          return {
            success: true,
            data: arr.slice(0, input.limit ?? 10),
            metadata: {
              executionTime: Date.now() - start,
              toolName: this.name,
              period: { fromIso, toIso, timezone: TZ },
            },
          };
        }
        case "ads_by_day": {
          // Determinístico: contar por dia com head+count (30-60 queries máx.)
          const days = enumerateDays(fromIso, toIso, "America/Sao_Paulo");
          const arr: AdsByDay[] = [];
          for (const day of days) {
            const startDay = new Date(
              `${day}T00:00:00.000-03:00`,
            ).toISOString();
            const endDay = new Date(`${day}T23:59:59.999-03:00`).toISOString();
            let q = base.select("ad_id", { count: "exact", head: true });
            if (competitorIds) q = q.in("competitor_id", competitorIds);
            q = q.gte("start_date", startDay).lte("start_date", endDay);
            const { count, error } = await q;
            if (error) throw error;
            arr.push({ dia: day, total_anuncios: count || 0 });
          }
          arr.sort((a, b) => (a.dia < b.dia ? 1 : -1));
          return {
            success: true,
            data: arr,
            metadata: {
              executionTime: Date.now() - start,
              toolName: this.name,
              period: { fromIso, toIso, timezone: TZ },
            },
          };
        }
        case "ads_by_week": {
          const weeks = enumerateWeeks(fromIso, toIso, TZ);
          const series: AdsByWeek[] = [];
          for (const w of weeks) {
            const startW = new Date(`${w}T00:00:00.000-03:00`).toISOString();
            const endW = new Date(
              new Date(startW).getTime() + 6 * 24 * 60 * 60 * 1000,
            ).toISOString();
            let q = base.select("ad_id", { count: "exact", head: true });
            if (competitorIds) q = q.in("competitor_id", competitorIds);
            q = q.gte("start_date", startW).lte("start_date", endW);
            const { count, error } = await q;
            if (error) throw error;
            series.push({ semana_inicio: w, total_anuncios: count || 0 });
          }
          const media = series.length
            ? Math.round(
                (series.reduce((a, b) => a + b.total_anuncios, 0) /
                  series.length) *
                  100,
              ) / 100
            : 0;
          return {
            success: true,
            data: { series, media },
            metadata: {
              executionTime: Date.now() - start,
              toolName: this.name,
              period: { fromIso, toIso, timezone: TZ },
            },
          };
        }
        case "total_count": {
          const total = await countAds(supabase, { fromIso, toIso });
          return {
            success: true,
            data: { total },
            metadata: {
              executionTime: Date.now() - start,
              toolName: this.name,
              period: { fromIso, toIso, timezone: TZ },
            },
          };
        }
        case "count_per_competitor": {
          const comps = await listCompetitors(supabase, input.competitor);
          const arr: CountPerCompetitor[] = [];
          for (const c of comps) {
            const total = await countAds(supabase, {
              competitor_id: c.id,
              fromIso,
              toIso,
            });
            if (total > 0) arr.push({ empresa: c.name, total });
          }
          arr.sort((a, b) => b.total - a.total);
          return {
            success: true,
            data: arr,
            metadata: {
              executionTime: Date.now() - start,
              toolName: this.name,
              period: { fromIso, toIso, timezone: TZ },
            },
          };
        }
        default:
          return {
            success: false,
            data: null,
            error: "Ação não suportada",
            metadata: {
              executionTime: Date.now() - start,
              toolName: this.name,
            },
          };
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Erro desconhecido nas análises de anúncios";
      return {
        success: false,
        data: null,
        error: msg,
        metadata: { executionTime: Date.now() - start, toolName: this.name },
      };
    }
  }
}

const TZ = "America/Sao_Paulo";

function resolveDateRange(input: {
  date_preset?: string;
  date_from?: string;
  date_to?: string;
}) {
  const tz = TZ;
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
    case "all_time":
      return {};
    case "today":
      return { fromIso: fmt(toStartOfDay(now)), toIso: fmt(toEndOfDay(now)) };
    case "yesterday": {
      const y = new Date(now);
      y.setDate(now.getDate() - 1);
      return { fromIso: fmt(toStartOfDay(y)), toIso: fmt(toEndOfDay(y)) };
    }
    case "last_7_days":
      return {
        fromIso: fmt(
          toStartOfDay(new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000)),
        ),
        toIso: fmt(toEndOfDay(now)),
      };
    case "last_30_days":
      return {
        fromIso: fmt(
          toStartOfDay(new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000)),
        ),
        toIso: fmt(toEndOfDay(now)),
      };
    case "this_week": {
      const d = new Date(now);
      const day = d.getDay();
      const diffToMon = (day + 6) % 7;
      const monday = new Date(d);
      monday.setDate(d.getDate() - diffToMon);
      return {
        fromIso: fmt(toStartOfDay(monday)),
        toIso: fmt(toEndOfDay(now)),
      };
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
      return {
        fromIso: fmt(toStartOfDay(startMonth)),
        toIso: fmt(toEndOfDay(now)),
      };
    }
    case "date_range": {
      if (input.date_from && input.date_to) {
        return {
          fromIso: new Date(
            `${input.date_from}T00:00:00.000-03:00`,
          ).toISOString(),
          toIso: new Date(`${input.date_to}T23:59:59.999-03:00`).toISOString(),
        };
      }
      return {};
    }
    default:
      return {};
  }
}

function interpretPeriod(input: {
  period_text?: string;
  date_preset?: string;
  date_from?: string;
  date_to?: string;
}) {
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

async function listCompetitors(
  supabase: SupabaseClient,
  nameFilter?: string,
): Promise<Array<{ id: string; name: string }>> {
  let q = supabase.from("competitors").select("id,name");
  if (nameFilter && nameFilter.trim()) q = q.ilike("name", `%${nameFilter}%`);
  const { data, error } = await q;
  if (error) return [];
  return data || [];
}

async function countAds(
  supabase: SupabaseClient,
  params: {
    competitor_id?: string;
    fromIso?: string;
    toIso?: string;
    asset_type?: "video" | "image";
  },
): Promise<number> {
  let q = supabase.from("ads").select("ad_id", { head: true, count: "exact" });
  if (params.competitor_id) q = q.eq("competitor_id", params.competitor_id);
  if (params.asset_type) q = q.eq("asset_type", params.asset_type);
  if (params.fromIso) q = q.gte("start_date", params.fromIso);
  if (params.toIso) q = q.lte("start_date", params.toIso);
  const { count } = await q;
  return count || 0;
}

function enumerateDays(
  fromIso?: string,
  toIso?: string,
  tz = "America/Sao_Paulo",
): string[] {
  // Se não informado, usa últimos 7 dias
  const now = new Date();
  const from = fromIso
    ? new Date(fromIso)
    : new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
  const to = toIso ? new Date(toIso) : now;
  const list: string[] = [];
  // Normaliza para timezone alvo
  const toKey = (d: Date) => {
    const local = new Date(
      new Date(d.toLocaleString("en-US", { timeZone: tz })).setHours(
        0,
        0,
        0,
        0,
      ),
    );
    return local.toISOString().slice(0, 10);
  };
  let cursor = new Date(from);
  while (cursor <= to) {
    list.push(toKey(cursor));
    cursor = new Date(cursor.getTime() + 24 * 60 * 60 * 1000);
  }
  return list;
}

function enumerateWeeks(fromIso?: string, toIso?: string, tz = TZ): string[] {
  // ISO weeks starting Monday in Sao Paulo TZ
  const now = new Date();
  const from = fromIso
    ? new Date(fromIso)
    : new Date(now.getTime() - 27 * 24 * 60 * 60 * 1000);
  const to = toIso ? new Date(toIso) : now;
  const toMonday = (d: Date) => {
    const local = new Date(
      new Date(d.toLocaleString("en-US", { timeZone: tz })).setHours(
        0,
        0,
        0,
        0,
      ),
    );
    const day = local.getDay(); // 0=Sun
    const diffToMon = (day + 6) % 7; // Monday as start
    const mon = new Date(local);
    mon.setDate(local.getDate() - diffToMon);
    return mon;
  };
  const format = (d: Date) => d.toISOString().slice(0, 10);
  const list: string[] = [];
  let cursor = toMonday(from);
  const end = toMonday(to);
  while (cursor <= end) {
    list.push(format(cursor));
    cursor = new Date(cursor.getTime() + 7 * 24 * 60 * 60 * 1000);
  }
  return list;
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

export const adsAnalyticsTool = new SupabaseAdsAnalyticsTool();
