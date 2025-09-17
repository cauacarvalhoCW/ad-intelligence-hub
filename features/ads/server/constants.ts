import type { Perspective } from "@/features/ads/types";

export const PERSPECTIVE_COMPETITORS: Record<Perspective, readonly string[]> = {
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
