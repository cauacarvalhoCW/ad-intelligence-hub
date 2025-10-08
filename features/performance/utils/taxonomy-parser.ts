// ============================================
// TAXONOMY PARSER
// ============================================
// Extrai informações estruturadas do nome do anúncio
// Preserva a taxonomia EXATA como vem da fonte

export type Company = "SAMY" | "ENGAJA" | "AMPLIFY" | "INTERNO" | "UNKNOWN";
export type FunnelStage = "TOFU" | "BOFU" | "UNKNOWN";
export type Destination = "_APP_" | "_WEB_" | "UNKNOWN";

export interface TaxonomyData {
  company: Company;
  funnelStage: FunnelStage;
  destination: Destination;
  platform: string | null;
  adType: string | null;
  rawName: string;
}

/**
 * Parse company (agência) from ad name
 * Busca por: SAMY, ENGAJA, AMPLIFY, ou assume INTERNO
 */
function parseCompany(adName: string): Company {
  const upper = adName.toUpperCase();
  
  // Buscar exatamente como vem (com Y)
  if (upper.includes("SAMY")) return "SAMY";
  if (upper.includes("ENGAJA")) return "ENGAJA";
  if (upper.includes("AMPLIFY")) return "AMPLIFY";
  
  // Se tem META/GOOGLE/TIKTOK mas não tem agência conhecida = INTERNO
  if (upper.includes("META") || upper.includes("GOOGLE") || upper.includes("TIKTOK")) {
    return "INTERNO";
  }
  
  return "UNKNOWN";
}

/**
 * Parse funnel stage from ad name
 * Busca por: TOFU ou BOFU (literalmente)
 */
function parseFunnelStage(adName: string): FunnelStage {
  const upper = adName.toUpperCase();
  
  if (upper.includes("TOFU")) return "TOFU";
  if (upper.includes("BOFU")) return "BOFU";
  
  return "UNKNOWN";
}

/**
 * Parse destination from ad name
 * Busca por: _WEB_ ou _APP_ (com underscores antes E depois)
 */
function parseDestination(adName: string): Destination {
  const upper = adName.toUpperCase();
  
  // Buscar _WEB_ e _APP_ com underscores antes E depois
  if (upper.includes("_WEB_")) return "_WEB_";
  if (upper.includes("_APP_")) return "_APP_";
  
  return "UNKNOWN";
}

/**
 * Parse platform from ad name
 * Busca por: META, GOOGLE, TIKTOK
 */
function parsePlatform(adName: string): string | null {
  const upper = adName.toUpperCase();
  
  if (upper.includes("META")) return "META";
  if (upper.includes("GOOGLE")) return "GOOGLE";
  if (upper.includes("TIKTOK")) return "TIKTOK";
  
  return null;
}

/**
 * Parse ad type from ad name
 * Busca por: VIDEO, IMAGE, CAROUSEL, etc.
 */
function parseAdType(adName: string): string | null {
  const upper = adName.toUpperCase();
  
  if (upper.includes("VIDEO")) return "VIDEO";
  if (upper.includes("IMAGE")) return "IMAGE";
  if (upper.includes("CAROUSEL")) return "CAROUSEL";
  if (upper.includes("STATIC")) return "STATIC";
  
  return null;
}

/**
 * Main parser function
 * Extrai todas as informações de taxonomia do nome do anúncio
 */
export function parseTaxonomy(adName: string | null): TaxonomyData {
  if (!adName) {
    return {
      company: "UNKNOWN",
      funnelStage: "UNKNOWN",
      destination: "UNKNOWN",
      platform: null,
      adType: null,
      rawName: "",
    };
  }

  return {
    company: parseCompany(adName),
    funnelStage: parseFunnelStage(adName),
    destination: parseDestination(adName),
    platform: parsePlatform(adName),
    adType: parseAdType(adName),
    rawName: adName,
  };
}

/**
 * Get display label for company
 */
export function getCompanyLabel(company: Company): string {
  return company; // Já vem em CAIXA ALTA
}

/**
 * Get display label for funnel stage
 */
export function getFunnelStageLabel(stage: FunnelStage): string {
  return stage; // Já vem em CAIXA ALTA
}

/**
 * Get display label for destination
 */
export function getDestinationLabel(destination: Destination): string {
  return destination; // Preserva exatamente como vem (WEB_ com underscore)
}

/**
 * Get color for company (for charts)
 */
export function getCompanyColor(company: Company): string {
  const colors: Record<Company, string> = {
    SAMY: "hsl(var(--chart-1))", // Laranja/Roxo
    ENGAJA: "hsl(var(--chart-2))", // Azul/Verde
    AMPLIFY: "hsl(var(--chart-3))", // Azul escuro/Amarelo
    INTERNO: "hsl(var(--chart-4))", // Amarelo/Rosa
    UNKNOWN: "hsl(var(--muted))", // Cinza
  };
  return colors[company];
}

/**
 * Get color for funnel stage (for charts)
 */
export function getFunnelStageColor(stage: FunnelStage): string {
  const colors: Record<FunnelStage, string> = {
    TOFU: "hsl(var(--chart-1))",
    BOFU: "hsl(var(--chart-2))",
    UNKNOWN: "hsl(var(--muted))",
  };
  return colors[stage];
}

/**
 * Get color for destination (for charts)
 */
export function getDestinationColor(destination: Destination): string {
  const colors: Record<Destination, string> = {
    "_APP_": "hsl(var(--chart-1))",
    "_WEB_": "hsl(var(--chart-2))",
    UNKNOWN: "hsl(var(--muted))",
  };
  return colors[destination];
}
