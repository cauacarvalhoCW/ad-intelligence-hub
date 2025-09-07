#!/bin/bash

echo "🧪 TESTE MANUAL DA API - Edge Intelligence Hub"
echo "=============================================="

BASE_URL="http://localhost:3000/api"

echo ""
echo "📊 TESTE 1: API Básica (sem filtros)"
echo "------------------------------------"
curl -s "$BASE_URL/ads?perspective=infinitepay&page=1&limit=3" | jq -r '
if .pagination then 
  "✅ Total: \(.pagination.total) anúncios | Página: \(.pagination.page) | Retornados: \(.ads | length)"
else 
  "❌ Erro: \(.error // "Resposta inválida")"
end'

echo ""
echo "📅 TESTE 2: Filtro de Data Específica"
echo "------------------------------------"
curl -s "$BASE_URL/ads?perspective=infinitepay&dateFrom=2025-09-05&dateTo=2025-09-05&page=1&limit=2" | jq -r '
if .pagination then 
  "✅ Data 2025-09-05: \(.pagination.total) anúncios | Retornados: \(.ads | length)"
else 
  "❌ Erro: \(.error // "Resposta inválida")"
end'

echo ""
echo "🏢 TESTE 3: Diferentes Perspectivas"
echo "----------------------------------"
echo "InfinitePay:"
curl -s "$BASE_URL/ads?perspective=infinitepay&page=1&limit=1" | jq -r '
if .pagination then 
  "✅ InfinitePay: \(.pagination.total) anúncios"
else 
  "❌ Erro: \(.error // "Resposta inválida")"
end'

echo "JIM:"
curl -s "$BASE_URL/ads?perspective=jim&page=1&limit=1" | jq -r '
if .pagination then 
  "✅ JIM: \(.pagination.total) anúncios"
else 
  "❌ Erro: \(.error // "Resposta inválida")"
end'

echo ""
echo "🔍 TESTE 4: Filtro de Busca"
echo "--------------------------"
curl -s "$BASE_URL/ads?perspective=infinitepay&search=taxa&page=1&limit=2" | jq -r '
if .pagination then 
  "✅ Busca \"taxa\": \(.pagination.total) anúncios | Retornados: \(.ads | length)"
else 
  "❌ Erro: \(.error // "Resposta inválida")"
end'

echo ""
echo "👥 TESTE 5: API de Competidores"
echo "------------------------------"
curl -s "$BASE_URL/competitors" | jq -r '
if .competitors then 
  "✅ Competidores: \(.total) encontrados | Primeiro: \(.competitors[0].name)"
else 
  "❌ Erro: \(.error // "Resposta inválida")"
end'

echo ""
echo "🔗 TESTE 6: Filtros Combinados"
echo "-----------------------------"
curl -s "$BASE_URL/ads?perspective=infinitepay&search=pix&dateFrom=2025-09-01&dateTo=2025-09-30&page=1&limit=1" | jq -r '
if .pagination then 
  "✅ Combinado (PIX + Setembro): \(.pagination.total) anúncios"
else 
  "❌ Erro: \(.error // "Resposta inválida")"
end'

echo ""
echo "=============================================="
echo "🎯 RESUMO: Todos os testes concluídos!"
