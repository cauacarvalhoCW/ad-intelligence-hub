/**
 * ============================================
 * CHART COLORS - Dynamic colors by product and theme
 * ============================================
 * 
 * Sistema de cores para gráficos baseado em:
 * - Produto (JIM, POS, TAP, LINK, CloudWalk)
 * - Tema (claro/escuro)
 */

import type { Product } from "../types";

/**
 * Cores primárias por produto
 * Retorna cores em formato HSL para suporte a dark mode
 */
export function getProductColor(product: Product | "cloudwalk"): {
  light: string;
  dark: string;
} {
  switch (product) {
    case "JIM":
      return {
        light: "hsl(270, 70%, 50%)", // Roxo vibrante
        dark: "hsl(270, 70%, 65%)",  // Roxo mais claro no dark
      };
    
    case "POS":
    case "TAP":
    case "LINK":
      // InfinitePay (verde)
      return {
        light: "hsl(142, 71%, 45%)", // Verde InfinitePay
        dark: "hsl(142, 71%, 55%)",  // Verde mais claro no dark
      };
    
    case "cloudwalk":
      return {
        light: "hsl(24, 100%, 50%)", // Laranja CloudWalk
        dark: "hsl(24, 100%, 60%)",  // Laranja mais claro no dark
      };
    
    default:
      // Fallback: usa cor do tema (preto/branco)
      return {
        light: "hsl(0, 0%, 9%)",    // Quase preto
        dark: "hsl(0, 0%, 98%)",    // Quase branco
      };
  }
}

/**
 * Cor padrão do tema (quando não há produto específico)
 */
export function getThemeColor(): {
  light: string;
  dark: string;
} {
  return {
    light: "hsl(0, 0%, 9%)",    // Preto
    dark: "hsl(0, 0%, 98%)",    // Branco
  };
}

/**
 * Retorna a cor apropriada para o tema atual
 * Para uso em CSS variables ou inline styles
 */
export function getProductChartColor(
  product: Product | "cloudwalk",
  theme: "light" | "dark" = "light"
): string {
  const colors = getProductColor(product);
  return colors[theme];
}

/**
 * Retorna configuração de cores para uso com ChartConfig (shadcn/ui)
 */
export function getChartConfig(product: Product | "cloudwalk") {
  const colors = getProductColor(product);
  
  return {
    primary: {
      label: product === "cloudwalk" ? "CloudWalk" : product,
      color: `var(--product-color)`, // CSS variable definida dinamicamente
      theme: {
        light: colors.light,
        dark: colors.dark,
      },
    },
  };
}

/**
 * Paleta de cores para múltiplas séries em um gráfico
 * Usa as cores do shadcn/ui chart com suporte a dark mode
 */
export const CHART_COLORS = {
  chart1: "hsl(var(--chart-1))", // Laranja/Roxo
  chart2: "hsl(var(--chart-2))", // Azul/Verde
  chart3: "hsl(var(--chart-3))", // Azul escuro/Amarelo
  chart4: "hsl(var(--chart-4))", // Amarelo/Rosa
  chart5: "hsl(var(--chart-5))", // Rosa/Cyan
} as const;

/**
 * Cores específicas para plataformas
 */
export const PLATFORM_COLORS = {
  META: {
    light: "hsl(221, 83%, 53%)", // Azul Meta (#1877F2)
    dark: "hsl(206, 100%, 65%)", // Azul vibrante para dark
  },
  GOOGLE: {
    light: "hsl(217, 89%, 61%)", // Azul Google (#4285F4)
    dark: "hsl(142, 71%, 45%)",  // Verde Google vibrante
  },
  TIKTOK: {
    light: "hsl(0, 0%, 0%)",      // Preto
    dark: "hsl(348, 83%, 65%)",   // Rosa TikTok vibrante
  },
} as const;

/**
 * Hook para detectar tema atual (client-side only)
 * Retorna 'light' ou 'dark'
 */
export function useTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  
  const isDark = document.documentElement.classList.contains("dark");
  return isDark ? "dark" : "light";
}

