import type { ThemeConfig, ThemeType } from "./types"

export const themes: Record<ThemeType, ThemeConfig> = {
  cloudwalk: {
    name: "CloudWalk",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQp2P4mt6JT8FAn2UxNDNFdEYDrDKXiZHJ5Gw&s",
    colors: {
      primary: "#ffffff",    // Branco (texto principal do site)
      secondary: "#f5f5f5",  // Cinza claro (navegação)
      accent: "#fbbf24",     // Dourado/amarelo (do gradiente)
      background: "#ffffff", // Branco
      foreground: "#000000", // Preto
    },
    metadata: {
      description: "Competidores BR + US (visão global)",
      websiteUrl: "https://cloudwalk.io",
      industry: "Fintech",
      competitorScope: [], // Todos os competidores
    },
  },
  infinitepay: {
    name: "InfinitePay",
    logo: "https://play-lh.googleusercontent.com/JCYKHXuu2Q6IzhmkW9N4bDX0S8_3XVYnlPtheNcdwlOaSr0TTKJljm3RVexsXkw3_ec",
    colors: {
      primary: "#9AFF00",    // Verde limão neon (botão principal)
      secondary: "#f8fafc",  // Branco/cinza muito claro
      accent: "#8b5cf6",     // Roxo (texto de destaque)
      background: "#ffffff", // Branco
      foreground: "#000000", // Preto
    },
    metadata: {
      description: "Competidores BR: PagBank, Stone, Cora, Ton, Mercado Pago, Jeitto",
      websiteUrl: "https://infinitepay.io",
      industry: "Fintech",
      competitorScope: ["PagBank", "Stone", "Cora", "Ton", "Mercado Pago", "Jeitto"],
    },
  },
  jim: {
    name: "JIM",
    logo: "/logos/competitors/jim.jpg",
    colors: {
      primary: "#8b5cf6",    // Roxo vibrante (botões)
      secondary: "#f9fafb",  // Cinza muito claro (background)
      accent: "#7c3aed",     // Roxo mais escuro
      background: "#ffffff", // Branco
      foreground: "#111827", // Texto escuro
    },
    metadata: {
      description: "Competidores US: Square, PayPal, Stripe, Venmo, SumUp",
      websiteUrl: "https://jim.com",
      industry: "Fintech",
      competitorScope: ["Square", "PayPal", "Stripe", "Venmo", "SumUp"],
    },
  },
  default: {
    name: "Edge Intelligence Hub",
    colors: {
      primary: "#111111",
      secondary: "#f1f5f9",
      accent: "#64748b",
      background: "#ffffff",
      foreground: "#0b0b0c",
    },
    metadata: {
      description: "Todos os competidores",
      competitorScope: [],
    },
  },

  dark: {
    name: "Modo Escuro",
    colors: {
      primary: "#ffffff",
      secondary: "#1e293b",
      accent: "#64748b",
      background: "#0f172a",
      foreground: "#f8fafc",
    },
    logo: "/logos/edge-hub-default.svg",
    metadata: {
      description: "Modo escuro elegante",
      competitorScope: [], // Todos os competidores
    },
  },

}

export function applyTheme(theme: ThemeType) {
  // Verificar se estamos no cliente
  if (typeof window === "undefined") return
  
  const config = themes[theme]
  
  // Usar requestAnimationFrame para evitar problemas de hidratação
  requestAnimationFrame(() => {
    // Remove previous theme classes
    document.body.classList.remove("theme-cloudwalk", "theme-infinitepay", "theme-jim", "theme-dark")
    
    // Apply new theme class if not default
    if (theme !== "default") {
      document.body.classList.add(`theme-${theme}`)
    }

    // Store current theme in localStorage for persistence
    localStorage.setItem("edge-intelligence-theme", theme)
  })
}

function adjustColorOpacity(color: string, opacity: number): string {
  // Convert hex to rgba with opacity
  const hex = color.replace("#", "")
  const r = Number.parseInt(hex.substr(0, 2), 16)
  const g = Number.parseInt(hex.substr(2, 2), 16)
  const b = Number.parseInt(hex.substr(4, 2), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

export function getSavedTheme(): ThemeType {
  if (typeof window === "undefined") return "default"

  const saved = localStorage.getItem("edge-intelligence-theme")
  if (saved && saved in themes) {
    return saved as ThemeType
  }
  return "default"
}

// Filtros por tema conforme especificado no prompt
export function getCompetitorsByTheme(theme: ThemeType): string[] {
  switch(theme) {
    case 'infinitepay': 
      return ['Mercado Pago', 'Stone', 'PagBank'] // Brasil
    case 'jim': 
      return ['Square', 'PayPal', 'Stripe'] // EUA  
    case 'cloudwalk': 
      return [] // Todos
    default: 
      return [] // Todos
  }
}

export async function extractColorsFromWebsite(url: string): Promise<Partial<ThemeConfig["colors"]>> {
  // This would integrate with a color extraction service in a real implementation
  // For now, return predefined colors based on known competitor URLs

  const colorMappings: Record<string, Partial<ThemeConfig["colors"]>> = {
    "cloudwalk.io": {
      primary: "#6366f1",
      secondary: "#8b5cf6",
      accent: "#06b6d4",
    },
    "infinitepay.io": {
      primary: "#10b981",
      secondary: "#059669",
      accent: "#f59e0b",
    },
    "jim.com.br": {
      primary: "#ef4444",
      secondary: "#dc2626",
      accent: "#f97316",
    },
  }

  const domain = new URL(url).hostname.replace("www.", "")
  return colorMappings[domain] || {}
}

export function createCustomTheme(name: string, extractedColors: Partial<ThemeConfig["colors"]>): ThemeConfig {
  return {
    name,
    colors: {
      primary: extractedColors.primary || "#0f172a",
      secondary: extractedColors.secondary || "#334155",
      accent: extractedColors.accent || "#64748b",
      background: extractedColors.background || "#ffffff",
      foreground: extractedColors.foreground || "#0f172a",
    },
  }
}

