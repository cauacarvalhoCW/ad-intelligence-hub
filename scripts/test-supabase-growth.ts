/**
 * Test Supabase Growth Connection
 * Verifica conexão com mkt_ads_looker table
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL_GROWTH;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY_GROWTH;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não encontradas:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL_GROWTH:', !!supabaseUrl);
  console.error('   SUPABASE_SERVICE_ROLE_KEY_GROWTH:', !!supabaseKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔍 Testando conexão com Supabase Growth...\n');

  try {
    // Test 1: Count total records
    const { count, error: countError } = await supabase
      .from('mkt_ads_looker')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Erro ao contar registros:', countError);
      return;
    }

    console.log(`✅ Conexão OK! Total de registros: ${count}\n`);

    // Test 2: Fetch sample records
    const { data, error } = await supabase
      .from('mkt_ads_looker')
      .select('*')
      .limit(5);

    if (error) {
      console.error('❌ Erro ao buscar dados:', error);
      return;
    }

    console.log('📊 Amostra de dados (5 registros):');
    console.table(data?.map(ad => ({
      id: ad.id,
      ad_name: ad.ad_name?.substring(0, 30) + '...' || 'N/A',
      product: ad.product,
      platform: ad.platform,
      date: ad.date,
      cost: ad.cost,
      impressions: ad.impressions,
      clicks: ad.clicks,
    })));

    // Test 3: Check available products
    const { data: products } = await supabase
      .from('mkt_ads_looker')
      .select('product')
      .not('product', 'is', null);

    const uniqueProducts = [...new Set(products?.map(p => p.product))];
    console.log('\n📦 Produtos disponíveis:', uniqueProducts);

    // Test 4: Check date range
    const { data: dateRange } = await supabase
      .from('mkt_ads_looker')
      .select('date')
      .not('date', 'is', null)
      .order('date', { ascending: true })
      .limit(1);

    const { data: latestDate } = await supabase
      .from('mkt_ads_looker')
      .select('date')
      .not('date', 'is', null)
      .order('date', { ascending: false })
      .limit(1);

    console.log('\n📅 Período dos dados:');
    console.log('   Primeiro registro:', dateRange?.[0]?.date);
    console.log('   Último registro:', latestDate?.[0]?.date);

    console.log('\n✅ Todos os testes passaram!');
  } catch (err) {
    console.error('❌ Erro inesperado:', err);
  }
}

testConnection();

