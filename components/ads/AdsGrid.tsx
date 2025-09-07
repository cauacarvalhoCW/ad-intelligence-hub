'use client'

import { AdCard } from './AdCard'
import { Ad } from '@/lib/types'
import { Skeleton } from '@/components/ui/skeleton'

interface AdsGridProps {
  ads: Ad[]
  loading?: boolean
  error?: string | null
  recencyActiveDays?: number
}

export function AdsGrid({ ads, loading, error, recencyActiveDays = 2 }: AdsGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-2">❌ Erro ao carregar anúncios</div>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    )
  }

  if (ads.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground mb-2">📭 Nenhum anúncio encontrado</div>
        <p className="text-sm text-muted-foreground">
          Tente ajustar os filtros ou a perspectiva selecionada.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {ads.map((ad) => (
        <AdCard
          key={ad.ad_id}
          ad={ad}
          recencyActiveDays={recencyActiveDays}
        />
      ))}
    </div>
  )
}
