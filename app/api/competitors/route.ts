import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    // Verificar se as variáveis de ambiente estão configuradas
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Supabase não configurado. Verifique as variáveis de ambiente no arquivo .env.local' },
        { status: 500 }
      )
    }

    // Buscar todos os competidores
    const { data: competitors, error } = await supabaseServer
      .from('competitors')
      .select('id, name, home_url, created_at')
      .order('name')

    if (error) {
      console.error('Erro do Supabase:', error)
      return NextResponse.json(
        { error: `Erro ao buscar competidores: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      competitors: competitors || [],
      total: competitors?.length || 0
    })

  } catch (error) {
    console.error('Erro na API de competidores:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
