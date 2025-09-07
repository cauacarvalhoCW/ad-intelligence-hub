import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

// Perspectivas e seus competidores
const PERSPECTIVE_COMPETITORS = {
  infinitepay: ['PagBank', 'Stone', 'Cora', 'Ton', 'Mercado Pago', 'Jeitto'],
  jim: ['Square', 'PayPal', 'Stripe', 'Venmo', 'SumUp'],
  cloudwalk: [], // todos
  default: [] // todos
} as const

export async function GET(request: NextRequest) {
  try {
    // Verificar se as variáveis de ambiente estão configuradas
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Supabase não configurado. Verifique as variáveis de ambiente no arquivo .env.local' },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    
    // Parâmetros de paginação
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '24')
    const offset = (page - 1) * limit

    // Parâmetros de filtro
    const perspective = searchParams.get('perspective') as keyof typeof PERSPECTIVE_COMPETITORS || 'default'
    const competitors = searchParams.get('competitors')?.split(',') || []
    const assetTypes = searchParams.get('assetTypes')?.split(',') || []
    const products = searchParams.get('products')?.split(',') || []
    const search = searchParams.get('search') || ''
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    // Resolver competidores da perspectiva
    let competitorIds: string[] = []
    const perspectiveCompetitors = PERSPECTIVE_COMPETITORS[perspective]
    
    if (perspectiveCompetitors.length > 0) {
      // Buscar UUIDs dos competidores da perspectiva
      const { data: competitorData, error: competitorError } = await supabaseServer
        .from('competitors')
        .select('id')
        .in('name', perspectiveCompetitors)

      if (competitorError) {
        console.error('Erro ao buscar competidores:', competitorError)
        return NextResponse.json(
          { error: `Erro ao buscar competidores: ${competitorError.message}` },
          { status: 500 }
        )
      }

      competitorIds = competitorData?.map(c => c.id) || []
    }

    // Construir query base
    let query = supabaseServer
      .from('ads')
      .select(`
        ad_id,
        competitor_id,
        source,
        asset_type,
        product,
        start_date,
        display_format,
        tags,
        image_description,
        transcription,
        ad_analysis,
        created_at,
        competitors!ads_competitor_id_fkey (
          name,
          home_url
        )
      `)

    // Aplicar filtros de validação (Marco 1)
    query = query
      .not('ad_analysis', 'is', null)
      .neq('ad_analysis', '{}')
      .in('asset_type', ['video', 'image'])

    // Filtro por perspectiva (competidores)
    if (competitorIds.length > 0) {
      query = query.in('competitor_id', competitorIds)
    }

    // Filtros adicionais
    if (competitors.length > 0) {
      query = query.in('competitor_id', competitors)
    }

    if (assetTypes.length > 0) {
      query = query.in('asset_type', assetTypes)
    }

    if (products.length > 0) {
      query = query.in('product', products)
    }

    if (search) {
      query = query.or(`tags.ilike.%${search}%,image_description.ilike.%${search}%,transcription.ilike.%${search}%,product.ilike.%${search}%`)
    }

    if (dateFrom) {
      query = query.gte('start_date', dateFrom)
    }

    if (dateTo) {
      query = query.lte('start_date', dateTo)
    }

    // Filtro de qualidade: pelo menos um campo de conteúdo não vazio
    query = query.or('transcription.neq.,image_description.neq.,tags.neq.')

    // Ordenação e paginação
    query = query
      .order('start_date', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: ads, error, count } = await query

    if (error) {
      console.error('Erro do Supabase:', error)
      return NextResponse.json(
        { error: `Erro ao buscar anúncios: ${error.message}` },
        { status: 500 }
      )
    }

    // Processar dados para o formato esperado
    const processedAds = (ads || []).map((ad: any) => ({
      ...ad,
      competitor: ad.competitors,
      variations_count: 0 // Será implementado depois se necessário
    }))

    return NextResponse.json({
      ads: processedAds,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      perspective,
      competitorIds: competitorIds.length > 0 ? competitorIds : null
    })

  } catch (error) {
    console.error('Erro na API de anúncios:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
