'use client'

import { useState, useEffect, useCallback } from 'react'
import { Ad, FilterState } from '@/lib/types'

export type Perspective = 'infinitepay' | 'jim' | 'cloudwalk' | 'default'

interface UseAdsResult {
  ads: Ad[]
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  perspective: Perspective
  refetch: () => void
}

interface UseAdsOptions {
  perspective?: Perspective
  filters?: Partial<FilterState>
  page?: number
  limit?: number
}

export function useAds(options: UseAdsOptions = {}): UseAdsResult {
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: options.page || 1,
    limit: options.limit || 24,
    total: 0,
    totalPages: 0
  })

  const fetchAds = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Construir query params
      const params = new URLSearchParams({
        page: (options.page || 1).toString(),
        limit: (options.limit || 24).toString()
      })

      // Adicionar perspectiva
      if (options.perspective) {
        params.set('perspective', options.perspective)
      }

      // Adicionar filtros se existirem
      if (options.filters?.competitors?.length) {
        params.set('competitors', options.filters.competitors.join(','))
      }
      if (options.filters?.assetTypes?.length) {
        params.set('assetTypes', options.filters.assetTypes.join(','))
      }
      if (options.filters?.products?.length) {
        params.set('products', options.filters.products.join(','))
      }
      if (options.filters?.search) {
        params.set('search', options.filters.search)
      }
      if (options.filters?.dateRange?.start) {
        params.set('dateFrom', options.filters.dateRange.start.toISOString())
      }
      if (options.filters?.dateRange?.end) {
        params.set('dateTo', options.filters.dateRange.end.toISOString())
      }

      const response = await fetch(`/api/ads?${params.toString()}`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      setAds(data.ads || [])
      setPagination(data.pagination || pagination)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      console.error('Erro ao buscar anúncios:', err)
    } finally {
      setLoading(false)
    }
  }, [
    options.perspective,
    options.filters?.competitors,
    options.filters?.assetTypes,
    options.filters?.products,
    options.filters?.search,
    options.filters?.dateRange?.start,
    options.filters?.dateRange?.end,
    options.page,
    options.limit
  ])

  useEffect(() => {
    fetchAds()
  }, [fetchAds])

  return {
    ads,
    loading,
    error,
    pagination,
    perspective: options.perspective || 'default',
    refetch: fetchAds
  }
}
