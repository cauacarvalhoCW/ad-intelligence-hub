export interface Ad {
  id: string
  competitor_id: string
  title: string
  description: string
  image_url?: string
  landing_page_url?: string
  platform: "facebook" | "google" | "instagram" | "linkedin" | "tiktok"
  ad_type: "image" | "video" | "carousel" | "text"
  detected_rates?: string[]
  extracted_text?: string
  tags: string[]
  created_at: string
  updated_at: string
  competitor?: Competitor
}

export interface Competitor {
  id: string
  name: string
  website_url?: string
  industry: string
  description?: string
  logo_url?: string
  primary_color?: string
  secondary_color?: string
  created_at: string
  updated_at: string
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
