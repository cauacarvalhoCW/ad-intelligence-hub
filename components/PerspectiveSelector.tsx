"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Badge } from "@/shared/ui/badge";
import type { Perspective } from "@/features/ads/types";

interface PerspectiveSelectorProps {
  value: Perspective;
  onChange: (perspective: Perspective) => void;
}

const PERSPECTIVES = [
  {
    id: "default" as const,
    name: "Todos os Competidores",
    description: "Visualização completa",
    competitors: "Todos",
    icon: "🌍",
  },
  {
    id: "infinitepay" as const,
    name: "InfinitePay",
    description: "Perspectiva Brasil",
    competitors: "PagBank, Stone, Cora, Ton, Mercado Pago, Jeitto",
    icon: "💜",
  },
  {
    id: "jim" as const,
    name: "JIM",
    description: "Perspectiva Internacional",
    competitors: "Square, PayPal, Stripe, Venmo, SumUp",
    icon: "🔵",
  },
  {
    id: "cloudwalk" as const,
    name: "CloudWalk",
    description: "Perspectiva Global",
    competitors: "Todos os mercados",
    icon: "☁️",
  },
];

export function PerspectiveSelector({
  value,
  onChange,
}: PerspectiveSelectorProps) {
  const currentPerspective =
    PERSPECTIVES.find((p) => p.id === value) || PERSPECTIVES[0];

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Perspectiva</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue>
            <div className="flex items-center gap-2">
              <span>{currentPerspective.icon}</span>
              <span>{currentPerspective.name}</span>
              <Badge variant="outline" className="text-xs">
                {currentPerspective.description}
              </Badge>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {PERSPECTIVES.map((perspective) => (
            <SelectItem key={perspective.id} value={perspective.id}>
              <div className="flex items-start gap-3 py-2">
                <span className="text-lg">{perspective.icon}</span>
                <div className="flex-1">
                  <div className="font-medium">{perspective.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {perspective.description}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    <strong>Competidores:</strong> {perspective.competitors}
                  </div>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
