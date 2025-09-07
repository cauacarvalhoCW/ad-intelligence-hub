'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, ExternalLink, Play, Image as ImageIcon } from 'lucide-react'
import { Ad } from '@/lib/types'

interface AdCardProps {
  ad: Ad
  recencyActiveDays?: number
  onClick?: (ad: Ad) => void
}

export function AdCard({ ad, recencyActiveDays = 2, onClick }: AdCardProps) {
  const [imageError, setImageError] = useState(false)
  const [videoError, setVideoError] = useState(false)

  // Calcular se o anúncio é recente/ativo
  const isRecent = ad.start_date 
    ? new Date(ad.start_date) >= new Date(Date.now() - recencyActiveDays * 24 * 60 * 60 * 1000)
    : false

  // Gerar slug do competidor para logo
  const competitorSlug = ad.competitor?.name
    ?.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')

  // Processar tags
  const tags = ad.tags
    ?.split(/[,;]/)
    .map((tag: string) => tag.trim())
    .filter(Boolean)
    .slice(0, 3) || []

  // Gerar título com fallbacks
  const getTitle = () => {
    if (ad.product) return ad.product
    
    if (ad.transcription) {
      return ad.transcription.split(' ').slice(0, 10).join(' ') + '...'
    }
    
    if (ad.image_description) {
      return ad.image_description.split(' ').slice(0, 10).join(' ') + '...'
    }
    
    return 'Anúncio sem título'
  }

  // Verificar se source é mídia direta
  const isDirectMedia = (url: string) => {
    return url.includes('.mp4') || url.includes('.mov') || url.includes('.webm') ||
           url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png') || url.includes('.webp')
  }

  // Verificar se é plataforma Meta
  const isMetaPlatform = ad.source?.includes('facebook') || ad.source?.includes('meta')

  // Formatar data
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '–'
    return new Date(dateString).toLocaleDateString('pt-BR', {
      timeZone: 'America/Sao_Paulo'
    })
  }

  // URL para Meta Ads Library
  const metaAdsUrl = `https://www.facebook.com/ads/library/?id=${ad.ad_id}`

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      onClick={() => onClick?.(ad)}
    >
      {/* Header com Logo e Info */}
      <div className="p-4 border-b">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <img
              src={`/logos/competitors/${competitorSlug}.jpg`}
              alt={ad.competitor?.name || 'Competidor'}
            className="w-8 h-8 rounded"
              onError={(e) => {
                e.currentTarget.src = '/placeholder-logo.svg'
              }}
            />
            <div>
              <h3 className="font-semibold text-sm">{ad.competitor?.name}</h3>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                {formatDate(ad.start_date)}
              </div>
            </div>
          </div>
          
          {/* Badges */}
          <div className="flex flex-col gap-1">
            <Badge variant="outline" className="text-xs">
              {ad.asset_type === 'video' ? (
                <><Play className="w-3 h-3 mr-1" /> Vídeo</>
              ) : (
                <><ImageIcon className="w-3 h-3 mr-1" /> Imagem</>
              )}
            </Badge>
            {isMetaPlatform && (
              <Badge variant="secondary" className="text-xs">Meta</Badge>
            )}
            {isRecent && (
              <Badge variant="default" className="text-xs bg-green-500">Ativo</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Mídia - Tamanho padronizado */}
      <div className="relative bg-gray-100 aspect-video h-48">
        {ad.asset_type === 'video' && isRecent && ad.source && isDirectMedia(ad.source) && !videoError ? (
          <video
            controls
            className="w-full h-full object-cover"
            onError={() => setVideoError(true)}
            poster="/placeholder.jpg"
          >
            <source src={ad.source} type="video/mp4" />
            Seu navegador não suporta vídeo.
          </video>
        ) : ad.asset_type === 'image' && ad.source && isDirectMedia(ad.source) && !imageError ? (
          <img
            src={ad.source}
            alt={getTitle()}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="text-center">
              {ad.asset_type === 'video' ? (
                <Play className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              ) : (
                <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              )}
              <p className="text-sm text-gray-500">
                {ad.asset_type === 'video' ? 'Vídeo' : 'Imagem'} não disponível
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-4">
        {/* Título */}
        <h4 className="font-medium text-sm mb-2 line-clamp-2">
          {getTitle()}
        </h4>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {tags.map((tag: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {ad.tags && ad.tags.split(/[,;]/).length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{ad.tags.split(/[,;]/).length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Botão Meta Ads Library */}
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={(e) => {
            e.stopPropagation()
            window.open(metaAdsUrl, '_blank')
          }}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Ver na Meta Ads Library
        </Button>
      </div>
    </Card>
  )
}