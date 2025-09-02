"use client"

import { useTheme } from "@/components/theme-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getCompetitorsByTheme } from "@/lib/themes"
import { Palette, Building2, Globe, Calendar } from "lucide-react"

export function ThemeStatus() {
  const { currentTheme, themes, competitorScope } = useTheme()
  const theme = themes[currentTheme]

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Palette className="w-5 h-5" />
          Tema Ativo: {theme.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          {theme.logo && (
            <img 
              src={theme.logo} 
              alt={`${theme.name} logo`} 
              className="w-12 h-12 object-contain rounded-lg border p-1" 
            />
          )}
          <div className="flex-1">
            {theme.metadata?.description && (
              <p className="text-sm text-muted-foreground mb-2">
                {theme.metadata.description}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Badge 
                variant="secondary" 
                style={{ 
                  backgroundColor: theme.colors.primary, 
                  color: theme.colors.background,
                  border: `1px solid ${theme.colors.primary}20`
                }}
              >
                Primary
              </Badge>
              <Badge 
                variant="secondary"
                style={{ 
                  backgroundColor: theme.colors.secondary, 
                  color: theme.colors.background,
                  border: `1px solid ${theme.colors.secondary}20`
                }}
              >
                Secondary
              </Badge>
              <Badge 
                variant="secondary"
                style={{ 
                  backgroundColor: theme.colors.accent, 
                  color: theme.colors.background,
                  border: `1px solid ${theme.colors.accent}20`
                }}
              >
                Accent
              </Badge>
            </div>
          </div>
        </div>

        {theme.metadata?.industry && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="w-4 h-4" />
            <span>Indústria: {theme.metadata.industry}</span>
          </div>
        )}

        {theme.metadata?.websiteUrl && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Globe className="w-4 h-4" />
            <a 
              href={theme.metadata.websiteUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              {theme.metadata.websiteUrl}
            </a>
          </div>
        )}

        {competitorScope.length > 0 && (
          <div className="pt-3 border-t">
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Competidores Focados ({competitorScope.length})
            </h4>
            <div className="flex flex-wrap gap-1">
              {competitorScope.map((competitor) => (
                <Badge key={competitor} variant="outline" className="text-xs">
                  {competitor}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Filtros automáticos aplicados baseados no tema selecionado
            </p>
          </div>
        )}

        <div className="pt-3 border-t">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>Tema aplicado em {new Date().toLocaleString('pt-BR')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
