import type { Perspective } from "@/features/analytics/types";

export const ANALYTICS_PERSPECTIVE_COMPETITORS: Record<Perspective, readonly string[]> = {
  infinitepay: [
    "PagBank",
    "Stone",
    "Cora",
    "Ton",
    "Mercado Pago",
    "Jeitto",
  ],
  jim: ["Square", "PayPal", "Stripe", "Venmo", "SumUp"],
  cloudwalk: [],
  default: [],
};

export const ANALYTICS_TAG_STOPWORDS = new Set<string>([
  "mercado pago",
  "pagbank",
  "stone",
  "ton",
  "sumup",
  "square",
  "paypal",
  "stripe",
  "venmo",
  "cora",
  "jeitto",
]);
