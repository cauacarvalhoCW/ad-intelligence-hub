"use client"

import type * as React from "react"
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
  // Inicializar com tema padrão para evitar hidratação mismatch
  const [corporateTheme, setCorporateThemeState] = useState<ThemeType>("default")
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const { trackThemeChange } = useThemeAnalytics()

  useEffect(() => {
    // Marcar como montado
    setIsMounted(true)
    
    // Só executar no cliente após montagem
    const savedTheme = getSavedTheme()
    setCorporateThemeState(savedTheme)
    
    // Aplicar tema apenas após a hidratação
    setTimeout(() => {
      applyTheme(savedTheme)
      setIsLoading(false)
    }, 0)
  }, [])

  const setCorporateTheme = (theme: ThemeType) => {
    if (!isMounted) return // Não aplicar se ainda não montou
    
    setCorporateThemeState(theme)
    applyTheme(theme)
    trackThemeChange(theme)
  }

  return (
    <CorporateThemeContext.Provider value={{ corporateTheme, setCorporateTheme, isLoading }}>
      {children}
    </CorporateThemeContext.Provider>
  )
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <CorporateThemeProvider>{children}</CorporateThemeProvider>
  )
}
