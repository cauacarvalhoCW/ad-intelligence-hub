// lib/utils/ratesExtractor.ts
// Extração de taxas dos textos dos anúncios conforme especificado no prompt

export interface ExtractedRates {
  credit_pos?: string;
  debit_pos?: string;
  pix?: string;
  monthly_fee?: string;
  anticipation?: string;
}

export function extractRatesFromAd(ad: any): ExtractedRates {
  const rates: ExtractedRates = {};

  // 1. Primeiro, tentar extrair do ad_analysis (JSONB)
  if (ad.ad_analysis?.rates) {
    return ad.ad_analysis.rates;
  }

  // 2. Extrair da transcrição, descrição e tags
  const text =
    `${ad.description || ""} ${ad.extracted_text || ""} ${ad.tags?.join(" ") || ""}`.toLowerCase();

  // Padrões de taxa
  const patterns = {
    credit:
      /(?:crédito|credit).*?(\d+[,.]?\d*%|\d+[,.]?\d*\s*\+\s*\$?\d+[,.]?\d*)/gi,
    debit: /(?:débito|debit).*?(\d+[,.]?\d*%|zero|grátis|gratuito|free)/gi,
    pix: /pix.*?(\d+[,.]?\d*%|zero|grátis|gratuito|free)/gi,
    monthly:
      /(?:mensalidade|mensal|monthly).*?(r\$\s*\d+[,.]?\d*|\$\d+[,.]?\d*|\d+[,.]?\d*|zero|grátis|gratuito|free)/gi,
    anticipation: /(?:antecipação|antecip|advance).*?(\d+[,.]?\d*%)/gi,
  };

  // Taxa zero patterns - casos especiais
  if (
    text.includes("taxa zero") ||
    text.includes("sem taxa") ||
    text.includes("no fees")
  ) {
    if (text.includes("débito") || text.includes("debit")) {
      rates.debit_pos = "0%";
    }
    if (text.includes("pix")) {
      rates.pix = "0%";
    }
  }

  // Sem mensalidade patterns
  if (text.includes("sem mensalidade") || text.includes("no monthly fee")) {
    rates.monthly_fee = "Grátis";
  }

  // Extrair taxas específicas usando regex
  Object.entries(patterns).forEach(([key, pattern]) => {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      // Pegar a primeira match que contenha números ou palavras-chave
      const match = matches.find(
        (m) => /\d/.test(m) || /zero|grátis|gratuito|free/i.test(m),
      );

      if (match) {
        // Extrair apenas a parte da taxa
        const rateMatch = match.match(
          /(\d+[,.]?\d*%|\d+[,.]?\d*\s*\+\s*\$?\d+[,.]?\d*|zero|grátis|gratuito|free|r\$\s*\d+[,.]?\d*|\$\d+[,.]?\d*)/i,
        );
        if (rateMatch) {
          const rateKey =
            key === "credit"
              ? "credit_pos"
              : key === "debit"
                ? "debit_pos"
                : key === "monthly"
                  ? "monthly_fee"
                  : key;
          rates[rateKey as keyof ExtractedRates] = rateMatch[1];
        }
      }
    }
  });

  // Limpeza e padronização
  Object.keys(rates).forEach((key) => {
    const value = rates[key as keyof ExtractedRates];
    if (value) {
      // Padronizar valores
      const cleanValue = value
        .toLowerCase()
        .replace(/grátis|gratuito|free/gi, "Grátis")
        .replace(/zero/gi, "0%")
        .replace(/\s+/g, " ")
        .trim();

      rates[key as keyof ExtractedRates] = cleanValue;
    }
  });

  return rates;
}

// Função para formatar taxas para exibição
export function formatRateForDisplay(rate: string | undefined): string {
  if (!rate) return "N/A";

  if (rate.toLowerCase().includes("grátis") || rate === "0%") {
    return "Grátis";
  }

  return rate;
}

// Função para extrair produto do anúncio
export function extractProductFromAd(ad: any): string {
  const text = `${ad.title || ""} ${ad.description || ""}`.toLowerCase();

  // Produtos conhecidos
  const products = [
    { keywords: ["point", "mercado pago"], name: "Mercado Pago Point" },
    { keywords: ["ton", "stone"], name: "Stone Ton" },
    { keywords: ["pagbank", "pos"], name: "PagBank POS" },
    { keywords: ["square", "reader"], name: "Square Reader" },
    { keywords: ["paypal", "business"], name: "PayPal Business" },
    { keywords: ["stripe", "connect"], name: "Stripe Connect" },
    { keywords: ["venmo", "business"], name: "Venmo Business" },
    { keywords: ["cora", "conta"], name: "Cora Conta Digital" },
    { keywords: ["jim", "cartão"], name: "Cartão JIM" },
    { keywords: ["infinitepay"], name: "InfinitePay" },
  ];

  for (const product of products) {
    if (product.keywords.some((keyword) => text.includes(keyword))) {
      return product.name;
    }
  }

  return "Produto não identificado";
}

// Função para extrair comunicação principal
export function extractMainMessage(ad: any): string {
  const text = ad.description || ad.extracted_text || ad.title || "";

  // Padrões de comunicação principal
  const patterns = [
    /taxa zero.*?(?:\.|$)/gi,
    /sem mensalidade.*?(?:\.|$)/gi,
    /\d+[,.]?\d*%.*?(?:\.|$)/gi,
    /grátis.*?(?:\.|$)/gi,
    /aceite.*?(?:\.|$)/gi,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[0]) {
      return match[0].trim().replace(/\.$/, "");
    }
  }

  // Fallback: primeira frase
  const firstSentence = text.split(".")[0];
  return firstSentence.length > 100
    ? firstSentence.substring(0, 100) + "..."
    : firstSentence;
}
