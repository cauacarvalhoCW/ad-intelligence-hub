'use client'

import { useState, useEffect, useCallback } from 'react'
import { Competitor } from '@/lib/types'

interface UseCompetitorsResult {
  competitors: Competitor[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useCompetitors(): UseCompetitorsResult {
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCompetitors = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/competitors')
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      setCompetitors(data.competitors || [])
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      console.error('Erro ao buscar competidores:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCompetitors()
  }, [fetchCompetitors])

  return {
    competitors,
    loading,
    error,
    refetch: fetchCompetitors
  }
}
