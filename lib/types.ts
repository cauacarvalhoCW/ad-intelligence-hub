export interface Ad {
  ad_id: string; // PK do Supabase
  competitor_id: string; // FK para competitors
  source?: string | null; // URL externa (pode ficar indisponível)
  asset_type: "video" | "image"; // Tipo do asset
  product?: string | null; // Produto sendo anunciado
  ad_analysis?: any | null; // JSONB com análise
  start_date?: string | null; // Data real do Facebook (ISO string)
  year?: number | null;
  week?: number | null;
  display_format?: string | null; // "video", "DCO", etc.
  tags?: string | null; // Tags separadas por vírgula
  image_description?: string | null; // Descrição da imagem/vídeo
  transcription?: string | null; // Transcrição do áudio
  video_image_preview?: string | null; // URL da imagem de preview para vídeos
  platform?: string | null; // "Google" ou "Meta"
  created_at: string;
  updated_at?: string;

  // Dados relacionados (joins)
  competitor?: Competitor;
  variations_count?: number;
}

export interface Competitor {
  id: string; // UUID do Supabase
  name: string; // Nome único do competidor
  home_url: string; // URL da página do Facebook
  created_at: string;
  updated_at?: string;
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
  created_at: string;
}

export interface AdTag {
  ad_id: string;
  tag_id: string;
}

export type ThemeType =
  | "cloudwalk"
  | "infinitepay"
  | "jim"
  | "default"
  | "dark";

export interface ThemeConfig {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
  };
  logo?: string;
  metadata?: {
    description?: string;
    websiteUrl?: string;
    industry?: string;
    lastUpdated?: string;
    competitorScope?: string[];
  };
}

export interface ThemeAnalytics {
  themeUsage: Record<ThemeType, number>;
  mostPopularTheme: ThemeType;
  themeChangeFrequency: number;
  lastThemeChange: string;
}

export interface FilterState {
  competitors?: string[]; // UUIDs dos competidores selecionados
  dateRange?: {
    start: Date | null;
    end: Date | null;
  };
  assetTypes?: string[]; // Tipos de asset
  products?: string[]; // Produtos específicos
  search?: string; // Busca full-text
  hasVariations?: boolean; // Apenas anúncios com variações
  hasAnalysis?: boolean; // Apenas anúncios com ad_analysis
}

// ========================================
// PERFORMANCE & INTERNAL ADS TYPES
// ========================================

export type ProductType = "pos" | "tap" | "link" | "jim";

export interface MktAdLooker {
  id: string; // PK
  ad_id: number;
  ad_name: string | null;
  created_at: string;
  date: string | null; // date (ISO string)
  platform: string; // "Meta", "Google", etc.
  campaign_id: number | null;
  campaign_name: string | null;
  cost: number | null;
  impressions: number | null;
  clicks: number | null;
  video_3s: number | null;
  tap_signup: number | null;
  tap_activations: number | null;
  tap_5trx: number | null;
  tap_cnpj_signups: number | null;
  pos_sales: number | null;
  piselli_sales: number | null;
  install: number | null;
  signup_web: number | null;
  activation_app: number | null;
  activation_web: number | null;
  link_signup: number | null;
  link_activations: number | null;
  product: string | null; // "POS", "TAP", "LINK", "JIM"
  creative_link: string | null;
  creative_id: string | null;
}

// Métricas calculadas
export interface PerformanceMetrics {
  // Métricas brutas
  totalCost: number;
  totalImpressions: number;
  totalClicks: number;
  totalSignups: number;
  totalActivations: number;

  // Métricas calculadas
  cac: number; // Cost per Acquisition (custo / ativações)
  cpm: number; // Cost per Mille (custo / impressões * 1000)
  cpa: number; // Cost per Action (custo / signups)
  ctr: number; // Click Through Rate (clicks / impressões * 100)
  hookRate: number; // (video_3s / impressões * 100)
  conversionRate: number; // (ativações / signups * 100)
}

// Evolução temporal de métricas
export interface MetricsTimeSeries {
  date: string;
  cost: number;
  impressions: number;
  clicks: number;
  cac: number;
  cpm: number;
  cpa: number;
  ctr: number;
  hookRate: number;
}

// Overview por produto
export interface ProductOverview {
  product: ProductType;
  metrics: PerformanceMetrics;
  costByPlatform: { platform: string; cost: number }[];
  topAds: TopPerformingAd[];
  scaledCreatives: ScaledCreative[];
  timeSeries: MetricsTimeSeries[];
}

// Top performing ad
export interface TopPerformingAd {
  ad_id: number;
  ad_name: string | null;
  creative_link: string | null;
  creative_id: string | null;
  metrics: {
    impressions: number;
    clicks: number;
    cost: number;
    ctr: number;
    cac: number;
    cpm: number;
  };
  topReasons: string[]; // Top 3 motivos de destaque
}

// Criativo escalado
export interface ScaledCreative {
  creative_id: string;
  creative_link: string | null;
  totalSpend: number;
  totalImpressions: number;
  performance: {
    ctr: number;
    cac: number;
    cpm: number;
  };
  daysActive: number;
}

// Filtros de performance
export interface PerformanceFilters {
  dateRange?: {
    start: Date | null;
    end: Date | null;
  };
  products?: ProductType[];
  platforms?: string[];
  campaigns?: string[];
}
