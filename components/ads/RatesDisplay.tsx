"use client";

import { Badge } from "@/shared/ui/badge";
import {
  extractRatesFromAd,
  formatRateForDisplay,
} from "@/lib/utils/ratesExtractor";
import type { Ad } from "@/lib/types";

interface RatesDisplayProps {
  ad: Ad;
}

export function RatesDisplay({ ad }: RatesDisplayProps) {
  const rates = extractRatesFromAd(ad);

  const rateItems = [
    {
      label: "Crédito",
      value: rates.credit_pos,
      color: "bg-orange-100 text-orange-800 border-orange-200",
      icon: "💳",
    },
    {
      label: "Débito",
      value: rates.debit_pos,
      color: "bg-green-100 text-green-800 border-green-200",
      icon: "💰",
    },
    {
      label: "PIX",
      value: rates.pix,
      color: "bg-blue-100 text-blue-800 border-blue-200",
      icon: "⚡",
    },
    {
      label: "Mensalidade",
      value: rates.monthly_fee,
      color: "bg-purple-100 text-purple-800 border-purple-200",
      icon: "📅",
    },
  ].filter((item) => item.value);

  if (rateItems.length === 0) {
    return (
      <div className="text-center p-3 bg-muted/50 rounded-lg">
        <span className="text-sm text-muted-foreground">
          Taxas não identificadas
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-foreground mb-2">
        💰 Taxas Identificadas
      </h4>
      <div className="grid grid-cols-2 gap-2">
        {rateItems.map((item) => (
          <div
            key={item.label}
            className="text-center p-2 bg-secondary/50 rounded-lg border"
          >
            <div className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1">
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
            <Badge
              variant="secondary"
              className={`font-bold text-xs ${item.color}`}
            >
              {formatRateForDisplay(item.value)}
            </Badge>
          </div>
        ))}
      </div>

      {rates.anticipation && (
        <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="text-xs text-amber-700 flex items-center gap-1">
            <span>⏰</span>
            <span>
              Antecipação: <strong>{rates.anticipation}</strong>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
