export interface Ad {
  ad_id: string                    // PK do Supabase
  competitor_id: string            // FK para competitors
  source?: string | null           // URL externa (pode ficar indisponível)
  asset_type: 'video' | 'image'    // Tipo do asset
  product?: string | null          // Produto sendo anunciado
  ad_analysis?: any | null         // JSONB com análise
  start_date?: string | null       // Data real do Facebook (ISO string)
  year?: number | null
  week?: number | null
  display_format?: string | null   // "video", "DCO", etc.
  tags?: string | null             // Tags separadas por vírgula
  image_description?: string | null // Descrição da imagem/vídeo
  transcription?: string | null    // Transcrição do áudio
  created_at: string
  updated_at?: string
  
  // Dados relacionados (joins)
  competitor?: Competitor
  variations_count?: number
}

export interface Competitor {
  id: string                       // UUID do Supabase
  name: string                     // Nome único do competidor
  home_url: string                 // URL da página do Facebook
  created_at: string
  updated_at?: string
}

export interface Tag {
  id: string
  name: string
  color?: string
  created_at: string
}

export interface AdTag {
  ad_id: string
  tag_id: string
}

export type ThemeType = "cloudwalk" | "infinitepay" | "jim" | "default" | "dark"

export interface ThemeConfig {
  name: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    foreground: string
  }
  logo?: string
  metadata?: {
    description?: string
    websiteUrl?: string
    industry?: string
    lastUpdated?: string
    competitorScope?: string[]
  }
}

export interface ThemeAnalytics {
  themeUsage: Record<ThemeType, number>
  mostPopularTheme: ThemeType
  themeChangeFrequency: number
  lastThemeChange: string
}

export interface FilterState {
  competitors?: string[]           // UUIDs dos competidores selecionados
  dateRange?: {
    start: Date | null
    end: Date | null
  }
  assetTypes?: string[]           // Tipos de asset
  products?: string[]             // Produtos específicos
  search?: string                 // Busca full-text
  hasVariations?: boolean         // Apenas anúncios com variações
  hasAnalysis?: boolean           // Apenas anúncios com ad_analysis
}
