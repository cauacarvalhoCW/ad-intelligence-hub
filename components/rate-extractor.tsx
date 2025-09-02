"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Percent, DollarSign } from "lucide-react"

interface RateExtractionResult {
  rates: string[]
  percentages: string[]
  prices: string[]
  keywords: string[]
}

interface RateExtractorProps {
  text: string
  title?: string
}

export function RateExtractor({ text, title }: RateExtractorProps) {
  const [extractedData, setExtractedData] = useState<RateExtractionResult>({
    rates: [],
    percentages: [],
    prices: [],
    keywords: [],
  })

  useEffect(() => {
    const fullText = `${title || ""} ${text}`.toLowerCase()

    // Extract percentages (e.g., "2%", "0%", "taxa zero")
    const percentageRegex = /(\d+(?:\.\d+)?%|taxa\s+zero|zero\s+taxa|sem\s+taxa|gratuito|grátis)/gi
    const percentages = Array.from(new Set(fullText.match(percentageRegex) || []))

    // Extract monetary values (e.g., "R$ 10", "$5", "10 reais")
    const priceRegex = /(r\$\s*\d+(?:\.\d+)?|\$\s*\d+(?:\.\d+)?|\d+\s*reais?)/gi
    const prices = Array.from(new Set(fullText.match(priceRegex) || []))

    // Extract rate-related keywords
    const rateKeywords = [
      "cashback",
      "desconto",
      "promoção",
      "oferta",
      "sem anuidade",
      "sem tarifa",
      "gratuito",
      "grátis",
      "bonus",
      "bônus",
      "rendimento",
      "juros",
      "taxa",
      "fee",
      "comissão",
    ]
    const keywords = rateKeywords.filter((keyword) => fullText.includes(keyword.toLowerCase()))

    // Combine all rate-related findings
    const allRates = [...percentages, ...prices, ...keywords]

    setExtractedData({
      rates: Array.from(new Set(allRates)),
      percentages,
      prices,
      keywords,
    })
  }, [text, title])

  if (extractedData.rates.length === 0) {
    return null
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <TrendingUp className="h-4 w-4" />
          Análise de Taxas e Ofertas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {extractedData.percentages.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Percent className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Percentuais</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {extractedData.percentages.map((percentage, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {percentage}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {extractedData.prices.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Valores</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {extractedData.prices.map((price, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {price}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {extractedData.keywords.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Palavras-chave</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {extractedData.keywords.map((keyword, index) => (
                <Badge key={index} variant="default" className="text-xs">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
