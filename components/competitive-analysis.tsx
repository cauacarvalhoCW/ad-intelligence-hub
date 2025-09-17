"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Progress } from "@/shared/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import {
  TrendingUp,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import type { Ad, Competitor } from "@/lib/types";

interface CompetitiveAnalysisProps {
  ads: Ad[];
  competitors: Competitor[];
  selectedCompetitor?: string;
}

interface CompetitorInsights {
  id: string;
  name: string;
  totalAds: number;
  avgRatesOffered: number;
  topStrategies: string[];
  sentimentScore: number;
  marketPosition: "aggressive" | "conservative" | "balanced";
  rateCompetitiveness: "high" | "medium" | "low";
  contentThemes: Array<{ theme: string; frequency: number }>;
}

export function CompetitiveAnalysis({
  ads,
  competitors,
  selectedCompetitor,
}: CompetitiveAnalysisProps) {
  const competitorInsights = useMemo((): CompetitorInsights[] => {
    return competitors.map((competitor) => {
      const competitorAds = ads.filter(
        (ad) => ad.competitor_id === competitor.id,
      );

      // Calculate sentiment score based on keywords
      const positiveKeywords = [
        "grátis",
        "gratuito",
        "sem taxa",
        "cashback",
        "desconto",
        "promoção",
        "bonus",
      ];
      const aggressiveKeywords = [
        "melhor",
        "maior",
        "único",
        "exclusivo",
        "revolucionário",
      ];

      let sentimentScore = 0;
      let aggressiveScore = 0;

      competitorAds.forEach((ad) => {
        const text =
          `${ad.product || ""} ${ad.transcription || ""} ${ad.image_description || ""}`.toLowerCase();
        positiveKeywords.forEach((keyword) => {
          if (text.includes(keyword)) sentimentScore += 1;
        });
        aggressiveKeywords.forEach((keyword) => {
          if (text.includes(keyword)) aggressiveScore += 1;
        });
      });

      // Analyze content themes
      const themeCount: Record<string, number> = {};
      competitorAds.forEach((ad) => {
        if (ad.tags) {
          ad.tags.split(/[,;]/).forEach((tag) => {
            const cleanTag = tag.trim();
            if (cleanTag) {
              themeCount[cleanTag] = (themeCount[cleanTag] || 0) + 1;
            }
          });
        }
      });

      const contentThemes = Object.entries(themeCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([theme, frequency]) => ({ theme, frequency }));

      // Determine market position
      let marketPosition: CompetitorInsights["marketPosition"] = "balanced";
      if (aggressiveScore > competitorAds.length * 0.3)
        marketPosition = "aggressive";
      else if (sentimentScore > competitorAds.length * 0.5)
        marketPosition = "conservative";

      // Rate competitiveness analysis
      const ratesOffered: string[] = [];
      competitorAds.forEach((ad) => {
        const textContent = `${ad.transcription || ""} ${ad.image_description || ""}`;
        const rateMatches = textContent.match(
          /\d+[,.]?\d*%|\d+[,.]?\d*\s*reais?/gi,
        );
        if (rateMatches) {
          ratesOffered.push(...rateMatches);
        }
      });

      const hasZeroRates = ratesOffered.some(
        (rate) => rate.includes("0%") || rate.includes("zero"),
      );
      const hasCashback = ratesOffered.some((rate) =>
        rate.includes("cashback"),
      );

      let rateCompetitiveness: CompetitorInsights["rateCompetitiveness"] =
        "medium";
      if (hasZeroRates || hasCashback) rateCompetitiveness = "high";
      else if (ratesOffered.length < competitorAds.length * 0.3)
        rateCompetitiveness = "low";

      return {
        id: competitor.id,
        name: competitor.name,
        totalAds: competitorAds.length,
        avgRatesOffered:
          ratesOffered.length / Math.max(competitorAds.length, 1),
        topStrategies: contentThemes.slice(0, 3).map((t) => t.theme),
        sentimentScore: Math.round(
          (sentimentScore / Math.max(competitorAds.length, 1)) * 100,
        ),
        marketPosition,
        rateCompetitiveness,
        contentThemes,
      };
    });
  }, [ads, competitors]);

  const selectedInsights = selectedCompetitor
    ? competitorInsights.find((c) => c.id === selectedCompetitor)
    : null;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="positioning">Posicionamento</TabsTrigger>
          <TabsTrigger value="strategies">Estratégias</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {competitorInsights.map((insights) => (
              <CompetitorCard key={insights.id} insights={insights} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="positioning" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Matriz de Posicionamento Competitivo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {["aggressive", "balanced", "conservative"].map((position) => (
                  <div key={position} className="space-y-2">
                    <h4 className="font-medium capitalize">
                      {position === "aggressive"
                        ? "Agressivo"
                        : position === "balanced"
                          ? "Equilibrado"
                          : "Conservador"}
                    </h4>
                    <div className="space-y-2">
                      {competitorInsights
                        .filter((c) => c.marketPosition === position)
                        .map((competitor) => (
                          <Badge
                            key={competitor.id}
                            variant="outline"
                            className="w-full justify-center"
                          >
                            {competitor.name}
                          </Badge>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strategies" className="space-y-4">
          {selectedInsights ? (
            <SelectedCompetitorAnalysis insights={selectedInsights} />
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">
                  Selecione um concorrente nos filtros para ver análise
                  detalhada de estratégias.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CompetitorCard({ insights }: { insights: CompetitorInsights }) {
  const getPositionColor = (position: CompetitorInsights["marketPosition"]) => {
    switch (position) {
      case "aggressive":
        return "text-red-600";
      case "conservative":
        return "text-green-600";
      default:
        return "text-blue-600";
    }
  };

  const getCompetitivenessIcon = (
    level: CompetitorInsights["rateCompetitiveness"],
  ) => {
    switch (level) {
      case "high":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "low":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{insights.name}</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{insights.totalAds} anúncios</Badge>
          <Badge
            variant="outline"
            className={getPositionColor(insights.marketPosition)}
          >
            {insights.marketPosition === "aggressive"
              ? "Agressivo"
              : insights.marketPosition === "balanced"
                ? "Equilibrado"
                : "Conservador"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Sentiment Score</span>
            <span className="text-sm text-muted-foreground">
              {insights.sentimentScore}%
            </span>
          </div>
          <Progress value={insights.sentimentScore} className="h-2" />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium">
              Competitividade de Taxas
            </span>
            {getCompetitivenessIcon(insights.rateCompetitiveness)}
          </div>
          <p className="text-xs text-muted-foreground">
            {insights.avgRatesOffered.toFixed(1)} taxas por anúncio em média
          </p>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Top Estratégias</h4>
          <div className="flex flex-wrap gap-1">
            {insights.topStrategies.map((strategy) => (
              <Badge key={strategy} variant="outline" className="text-xs">
                {strategy}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SelectedCompetitorAnalysis({
  insights,
}: {
  insights: CompetitorInsights;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Análise de Conteúdo - {insights.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-3">Temas Mais Frequentes</h4>
            <div className="space-y-2">
              {insights.contentThemes.map(({ theme, frequency }) => (
                <div key={theme} className="flex items-center justify-between">
                  <span className="text-sm">{theme}</span>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={(frequency / insights.totalAds) * 100}
                      className="w-20 h-2"
                    />
                    <span className="text-xs text-muted-foreground">
                      {frequency}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Insights Estratégicos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="p-3 bg-muted rounded-lg">
              <h5 className="font-medium text-sm mb-1">
                Posicionamento de Mercado
              </h5>
              <p className="text-xs text-muted-foreground">
                {insights.marketPosition === "aggressive"
                  ? "Estratégia agressiva com foco em diferenciação e ofertas exclusivas"
                  : insights.marketPosition === "conservative"
                    ? "Abordagem conservadora priorizando benefícios e segurança"
                    : "Estratégia equilibrada entre agressividade e conservadorismo"}
              </p>
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <h5 className="font-medium text-sm mb-1">
                Competitividade de Taxas
              </h5>
              <p className="text-xs text-muted-foreground">
                {insights.rateCompetitiveness === "high"
                  ? "Ofertas muito competitivas com taxas zero ou cashback"
                  : insights.rateCompetitiveness === "low"
                    ? "Poucas ofertas de taxas, foco em outros benefícios"
                    : "Competitividade moderada nas ofertas de taxas"}
              </p>
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <h5 className="font-medium text-sm mb-1">Score de Sentiment</h5>
              <p className="text-xs text-muted-foreground">
                {insights.sentimentScore > 70
                  ? "Alto uso de palavras positivas e ofertas atrativas"
                  : insights.sentimentScore > 40
                    ? "Uso moderado de linguagem promocional"
                    : "Comunicação mais técnica, menos promocional"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
