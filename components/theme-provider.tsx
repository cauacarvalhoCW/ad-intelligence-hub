"use client"

import type * as React from "react"
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes"
import { createContext, useContext, useState, useEffect } from "react"
import type { ThemeType } from "@/lib/types"
import { applyTheme, getSavedTheme, themes } from "@/lib/themes" // Added themes import
import { useThemeAnalytics } from "@/hooks/use-theme-analytics"

interface CorporateThemeContextType {
  corporateTheme: ThemeType
  setCorporateTheme: (theme: ThemeType) => void
  isLoading: boolean
}

const CorporateThemeContext = createContext<CorporateThemeContextType | undefined>(undefined)

export function useCorporateTheme() {
  const context = useContext(CorporateThemeContext)
  if (!context) {
    throw new Error("useCorporateTheme must be used within a CorporateThemeProvider")
  }
  return context
}

export function useTheme() {
  const { corporateTheme, setCorporateTheme, isLoading } = useCorporateTheme()

  // Obter escopo de competidores baseado no tema atual
  const competitorScope = themes[corporateTheme]?.metadata?.competitorScope || []

  return {
    currentTheme: corporateTheme,
    setTheme: setCorporateTheme,
    themes,
    isLoading,
    competitorScope,
  }
}

function CorporateThemeProvider({ children }: { children: React.ReactNode }) {
  // Inicializar com null para evitar hidratação mismatch
  const [corporateTheme, setCorporateThemeState] = useState<ThemeType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { trackThemeChange } = useThemeAnalytics()

  useEffect(() => {
    // Só executar no cliente
    const savedTheme = getSavedTheme()
    setCorporateThemeState(savedTheme)
    applyTheme(savedTheme)
    setIsLoading(false)
  }, [])

  // Se ainda não carregou, usar tema padrão
  const currentTheme = corporateTheme || "default"

  const setCorporateTheme = (theme: ThemeType) => {
    setCorporateThemeState(theme)
    applyTheme(theme)
    trackThemeChange(theme)
  }

  return (
    <CorporateThemeContext.Provider value={{ corporateTheme: currentTheme, setCorporateTheme, isLoading }}>
      {children}
    </CorporateThemeContext.Provider>
  )
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <CorporateThemeProvider>{children}</CorporateThemeProvider>
    </NextThemesProvider>
  )
}
