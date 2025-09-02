"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Eye, MousePointer } from "lucide-react"
import { RatesDisplay } from "./RatesDisplay"
import { ProductBadge } from "./ProductBadge"
import { extractMainMessage } from "@/lib/utils/ratesExtractor"
import type { Ad } from "@/lib/types"

interface AdCardProps {
  ad: Ad
  onClick?: (ad: Ad) => void
  isSelected?: boolean
}

export function AdCard({ ad, onClick, isSelected = false }: AdCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const mainMessage = extractMainMessage(ad)

  return (
    <Card 
      className={`
        h-full ad-card transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer
        ${isHovered ? 'scale-[1.02] shadow-xl' : ''}
        ${isSelected ? 'ring-2 ring-primary shadow-lg' : ''}
        border-2 hover:border-primary/50 relative overflow-hidden
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick?.(ad)}
    >
      {/* Header com Competidor e Data */}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {ad.competitor?.logo_url && (
                <img 
                  src={ad.competitor.logo_url} 
                  alt={`${ad.competitor.name} logo`}
                  className="w-6 h-6 object-contain rounded"
                />
              )}
              <h3 className="font-semibold text-lg text-foreground">
                {ad.competitor?.name || 'Competidor'}
              </h3>
            </div>
            <ProductBadge ad={ad} />
          </div>
          
          <div className="flex flex-col items-end gap-1">
            <Badge variant="outline" className="text-xs">
              {new Date(ad.created_at).toLocaleDateString('pt-BR')}
            </Badge>
            {isHovered && (
              <div className="opacity-100 transition-opacity">
                <Eye className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Conteúdo Principal */}
      <CardContent className="space-y-4">
        {/* Título do Anúncio */}
        <div>
          <h4 className="font-medium text-primary mb-2 line-clamp-2">
            {ad.title}
          </h4>
        </div>

        {/* Taxas - Destaque Principal */}
        <RatesDisplay ad={ad} />

        {/* Comunicação Principal */}
        <div className="p-3 bg-accent/10 rounded-lg border-l-4 border-accent">
          <p className="text-sm font-medium text-accent-foreground">
            💬 "{mainMessage}"
          </p>
        </div>

        {/* Descrição */}
        <div>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {ad.description}
          </p>
        </div>

        {/* Tags */}
        {ad.tags && ad.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {ad.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
            {ad.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{ad.tags.length - 3} mais
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      {/* Footer com Ações */}
      <div className="p-4 pt-0 flex items-center justify-between border-t mt-auto">
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <MousePointer className="h-3 w-3" />
          Clique para expandir
        </span>
        
        {ad.landing_page_url && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-6 px-2 hover:bg-primary/10"
            onClick={(e) => {
              e.stopPropagation()
              window.open(ad.landing_page_url, "_blank")
            }}
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Ver
          </Button>
        )}
      </div>

      {/* Hover Overlay com Gradiente do Tema */}
      {isHovered && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-lg pointer-events-none" />
      )}
    </Card>
  )
}
