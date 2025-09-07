import { useState, useEffect, useCallback } from 'react'

interface AnalyticsOptions {
  perspective?: string
  filters?: {
    search?: string
    competitors?: string[]
    assetTypes?: string[]
    dateRange?: {
      start: Date | null
      end: Date | null
    }
  }
}

interface AnalyticsMetrics {
  total_ads: number
  by_competitor: Array<{ competitor_name: string; count: number }>
  by_asset_type: Array<{ asset_type: string; count: number }>
  weekly: Array<{ week_start: string; total: number }>
  top_tags: Array<{ tag: string; count: number }>
  fees: Array<{ label: string; ads_com_taxa: number; matches: number; min: number; median: number; max: number }>
  offers: Array<{ label: string; ads_com_taxa: number; matches: number; min: number; median: number; max: number }>
  platform: Array<{ label: string; value: number }>
}

interface AnalyticsResponse {
  applied: {
    perspective: string
    competitors: string[]
    platform?: string
    ad_types: string[]
    date_from?: string
    date_to?: string
    q?: string
  }
  metrics: AnalyticsMetrics
  base_ads_count: number
}

export function useAnalytics(options: AnalyticsOptions = {}) {
  const [data, setData] = useState<AnalyticsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      
      if (options.perspective) {
        params.set('perspective', options.perspective)
      }
      
      if (options.filters?.search) {
        params.set('search', options.filters.search)
      }
      
      if (options.filters?.competitors && options.filters.competitors.length > 0) {
        params.set('competitors', options.filters.competitors.join(','))
      }
      
      if (options.filters?.assetTypes && options.filters.assetTypes.length > 0) {
        params.set('adTypes', options.filters.assetTypes.join(','))
      }
      
      if (options.filters?.dateRange?.start) {
        const startDate = options.filters.dateRange.start.toISOString().split('T')[0]
        params.set('dateFrom', startDate)
      }
      
      if (options.filters?.dateRange?.end) {
        const endDate = options.filters.dateRange.end.toISOString().split('T')[0]
        params.set('dateTo', endDate)
      }

      // Sempre filtrar por Meta por enquanto
      params.set('platform', 'meta')

      console.log('📊 Buscando analytics com parâmetros:', Object.fromEntries(params))

      const response = await fetch(`/api/analytics?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`)
      }
      
      const analyticsData = await response.json()
      console.log('📊 Analytics recebidos:', analyticsData)
      
      setData(analyticsData)
    } catch (err) {
      console.error('❌ Erro ao buscar analytics:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }, [
    options.perspective,
    options.filters?.search,
    options.filters?.competitors?.join(','),
    options.filters?.assetTypes?.join(','),
    options.filters?.dateRange?.start?.toISOString(),
    options.filters?.dateRange?.end?.toISOString()
  ])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  return {
    data,
    loading,
    error,
    refetch: fetchAnalytics
  }
}
