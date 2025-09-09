"use client"

import { useState, useEffect } from "react"
import { useTheme } from "@/components/theme-provider"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "./theme-toggle"
import { 
  SignedIn, 
  SignedOut, 
  SignInButton, 
  SignUpButton, 
  UserButton,
  useUser 
} from "@clerk/nextjs"

export function Header() {
  const { currentTheme, setTheme, themes, isLoading } = useTheme()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  // Durante a hidratação, usar tema padrão para evitar mismatch
  const safeTheme = isMounted ? currentTheme : "default"
  const currentThemeConfig = themes[safeTheme]
  
  const themeOptions = [
    { id: 'default', name: 'Padrão', icon: '🏠', config: themes.default },
    { id: 'cloudwalk', name: 'CloudWalk', icon: '🌍', config: themes.cloudwalk },
    { id: 'infinitepay', name: 'InfinitePay', icon: '💚', config: themes.infinitepay },
    { id: 'jim', name: 'JIM', icon: '🟣', config: themes.jim },
  ]

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between">
        
        {/* Logo Clicável - PRINCIPAL conforme prompt */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity p-2 rounded-lg hover:bg-secondary/50"
          >
            {isMounted && currentThemeConfig.logo ? (
              <img 
                src={currentThemeConfig.logo} 
                alt={currentThemeConfig.name}
                className="h-8 w-8 object-contain rounded"
              />
            ) : (
              <div className="h-8 w-8 bg-muted rounded flex items-center justify-center text-xs">
                🏠
              </div>
            )}
            <div className="text-left">
              <h1 className="font-semibold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {currentThemeConfig.name}
              </h1>
              <p className="text-xs text-muted-foreground">
                {currentThemeConfig.metadata?.description || 'Análise de Anúncios'}
              </p>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>

          {/* Dropdown de Temas conforme prompt */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50">
              <div className="p-2">
                <div className="text-sm font-medium p-2 text-gray-600 dark:text-gray-300">
                  🎯 Escolher perspectiva:
                </div>
                {themeOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      setTheme(option.id as any)
                      setIsDropdownOpen(false)
                    }}
                    className={`
                      w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors
                      ${safeTheme === option.id ? 'bg-primary/10 border border-primary/20' : ''}
                    `}
                  >
                    {isMounted && option.config.logo ? (
                      <img 
                        src={option.config.logo} 
                        alt={option.name}
                        className="h-6 w-6 object-contain rounded"
                      />
                    ) : (
                      <div className="h-6 w-6 bg-muted rounded flex items-center justify-center text-xs">
                        {option.icon}
                      </div>
                    )}
                    <div className="text-left flex-1">
                      <div className="font-medium">{option.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {option.config.metadata?.description || 'Tema padrão'}
                      </div>
                    </div>
                    <span className="text-lg">{option.icon}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Status Indicators, Toggle and Authentication */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
            <span>Tema ativo:</span>
            <div className="flex items-center gap-1">
              <div 
                className="w-3 h-3 rounded-full border-2 border-foreground" 
                style={{ backgroundColor: currentThemeConfig.colors.primary }}
              />
              <span className="font-medium">{currentThemeConfig.name}</span>
            </div>
          </div>

          {/* Toggle Dark/Light - em TODOS os temas */}
          <div className="ml-4">
            <ThemeToggle />
          </div>

          {/* Clerk Authentication */}
          <div className="flex items-center gap-3 ml-4 border-l border-border/40 pl-4">
            <SignedOut>
              <SignInButton mode="redirect">
                <Button variant="ghost" size="sm">
                  Entrar
                </Button>
              </SignInButton>
              <SignUpButton mode="redirect">
                <Button size="sm">
                  Cadastrar
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton 
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-8 h-8",
                    userButtonPopoverCard: "shadow-lg border",
                    userButtonPopoverActionButton: "hover:bg-accent",
                  }
                }}
                afterSignOutUrl="/"
              />
            </SignedIn>
          </div>

        </div>
      </div>
      
      {/* Overlay para fechar dropdown */}
      {isDropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </header>
  )
}
