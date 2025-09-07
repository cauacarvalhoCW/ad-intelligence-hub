import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

// Perspectivas e seus competidores
const PERSPECTIVE_COMPETITORS = {
  infinitepay: ['PagBank', 'Stone', 'Cora', 'Ton', 'Mercado Pago', 'Jeitto'],
  jim: ['Square', 'PayPal', 'Stripe', 'Venmo', 'SumUp'],
  cloudwalk: [], // todos
  default: [] // todos
} as const

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    console.log('\n🔍 ===== NOVA REQUISIÇÃO API /ads =====')
    console.log(`⏰ Timestamp: ${new Date().toISOString()}`)
    
    // Verificar se as variáveis de ambiente estão configuradas
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log('❌ ERRO: Variáveis de ambiente não configuradas')
      return NextResponse.json(
        { error: 'Supabase não configurado. Verifique as variáveis de ambiente no arquivo .env.local' },
        { status: 500 }
      )
    }

    // Criar cliente Supabase
    const supabase = await createSupabaseServer()
    console.log('✅ Cliente Supabase criado')

    const { searchParams } = new URL(request.url)
    console.log('📋 URL completa:', request.url)
    
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
    console.log('--------------------------------')  
    console.log('📊 PARÂMETROS RECEBIDOS:')
    console.log(`   📄 Página: ${page}, Limite: ${limit}, Offset: ${offset}`)
    console.log(`   🎯 Perspectiva: ${perspective}`)
    console.log(`   👥 Competidores: ${competitors.length > 0 ? competitors.join(', ') : 'TODOS'}`)
    console.log(`   🎨 Tipos de Asset: ${assetTypes.length > 0 ? assetTypes.join(', ') : 'TODOS'}`)
    console.log(`   📦 Produtos: ${products.length > 0 ? products.join(', ') : 'TODOS'}`)
    console.log(`   🔍 Busca: ${search || 'NENHUMA'}`)
    console.log(`   📅 Data De: ${dateFrom || 'NENHUMA'}`)
    console.log(`   📅 Data Até: ${dateTo || 'NENHUMA'}`)

    // Resolver competidores da perspectiva
    let competitorIds: string[] = []
    const perspectiveCompetitors = PERSPECTIVE_COMPETITORS[perspective]
    
    console.log('🏢 RESOLVENDO PERSPECTIVA:')
    console.log(`   📋 Perspectiva: ${perspective}`)
    console.log(`   👥 Competidores da perspectiva: ${perspectiveCompetitors.length > 0 ? perspectiveCompetitors.join(', ') : 'TODOS (sem filtro)'}`)
    
    if (perspectiveCompetitors.length > 0) {
      // Buscar UUIDs dos competidores da perspectiva
      const { data: competitorData, error: competitorError } = await supabase
        .from('competitors')
        .select('id, name')
        .in('name', perspectiveCompetitors)

      if (competitorError) {
        console.error('❌ Erro ao buscar competidores:', competitorError)
        return NextResponse.json(
          { error: `Erro ao buscar competidores: ${competitorError.message}` },
          { status: 500 }
        )
      }

      competitorIds = competitorData?.map(c => c.id) || []
      console.log(`   ✅ UUIDs encontrados: ${competitorIds.length} competidores`)
      console.log(`   📝 Detalhes:`, competitorData?.map(c => `${c.name} (${c.id})`).join(', '))
    } else {
      console.log('   ℹ️  Sem filtro de perspectiva - buscando TODOS os competidores')
    }

    // Construir query base
    let query = supabase
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
      `, { count: 'exact' })

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
      // Converter YYYY-MM-DD para início do dia em São Paulo (UTC-3)
      const fromDate = new Date(`${dateFrom}T00:00:00.000-03:00`).toISOString()
      query = query.gte('start_date', fromDate)
    }

    if (dateTo) {
      // Converter YYYY-MM-DD para fim do dia em São Paulo (UTC-3)
      const toDate = new Date(`${dateTo}T23:59:59.999-03:00`).toISOString()
      query = query.lte('start_date', toDate)
    }

    // Filtro de qualidade: pelo menos um campo de conteúdo não vazio
    query = query.or('transcription.neq.,image_description.neq.,tags.neq.')

    // Ordenação e paginação
    query = query
      .order('start_date', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    console.log('🔍 EXECUTANDO QUERY NO SUPABASE...')
    
    const { data: ads, error, count } = await query

    if (error) {
      console.error('❌ ERRO DO SUPABASE:', error)
      return NextResponse.json(
        { error: `Erro ao buscar anúncios: ${error.message}` },
        { status: 500 }
      )
    }

    const endTime = Date.now()
    const duration = endTime - startTime

    console.log('📊 RESULTADO DA QUERY:')
    console.log(`   ✅ Total no banco (count): ${count || 0}`)
    console.log(`   📄 Anúncios retornados: ${ads?.length || 0}`)
    console.log(`   📄 Página atual: ${page} de ${Math.ceil((count || 0) / limit)}`)
    console.log(`   ⏱️  Tempo de execução: ${duration}ms`)
    
    if (ads && ads.length > 0) {
      console.log('📋 PRIMEIROS 3 ANÚNCIOS:')
      ads.slice(0, 3).forEach((ad, index) => {
        console.log(`   ${index + 1}. ID: ${ad.ad_id} | Competidor: ${(ad.competitors as any)?.name} | Data: ${ad.start_date}`)
      })
    } else {
      console.log('⚠️  NENHUM ANÚNCIO RETORNADO!')
    }

    // Processar dados para o formato esperado
    const processedAds = (ads || []).map((ad: any) => ({
      ...ad,
      competitor: ad.competitors,
      variations_count: 0 // Será implementado depois se necessário
    }))

    console.log('🏁 ===== FIM DA REQUISIÇÃO =====\n')

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
