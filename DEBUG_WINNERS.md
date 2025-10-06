# 🔍 DEBUG: Como funciona a busca de Winners

## 📊 FLUXO ATUAL

### 1️⃣ **API `/api/performance` busca dados do Supabase**
```typescript
// app/api/performance/route.ts
const { data: rows } = await fetchPerformanceData(queryParams);
// rows = Array de MktAdsLookerRow[] direto do Supabase
```

### 2️⃣ **Hook `usePerformanceDataAPI` processa os dados**
```typescript
// features/performance/hooks/usePerformanceDataAPI.ts
const rawData = enrichAdData(rows); // Calcula signups, cac, ctr, etc
setRawData(rawData); // Armazena como AdData[]
```

### 3️⃣ **`WinnersSection` chama `getWinners()`**
```typescript
// features/performance/utils/winners-logic.ts
const winners = getWinners({
  ads: rawData,        // ← AdData[] do hook
  platform: "META",
  limit: 5,
  criteria: "best_cac" // ← ATUAL: Ordena por CAC (menor primeiro)
});
```

### 4️⃣ **Ranking atual (CAC-based)**
```typescript
function rankByCAC(ads: AdData[]): AdData[] {
  return ads
    .filter(ad => ad.cac > 0)
    .sort((a, b) => a.cac - b.cac); // Menor CAC = Melhor
}
```

---

## 🚨 PROBLEMA IDENTIFICADO

### ❌ Ad ID não encontrado
```
Ad ID no modal: 120231678130100160
Resultado no Supabase: 0 records found
```

### Possíveis causas:

1. **Dados agregados**: A API pode estar agrupando/somando dados de múltiplas linhas
2. **Ad ID incorreto**: O `ad_id` pode estar sendo modificado no processamento
3. **Dados antigos**: O ad pode ter sido deletado/arquivado no Supabase

---

## 🎯 NOVO ALGORITMO (CUSTO + CAC)

### Regra do usuário:
> "Pegar qual tem **mais custo** e depois ver qual tem o **CAC bom**.  
> Ordena na relação qual está melhor."

### Interpretação:
1. **Priorizar ads com MAIOR investimento (custo)**
2. **Dentre os de alto custo, pegar os de MELHOR CAC (menor)**
3. **Score combinado**: `custo * (1 / cac)` = Quanto maior o custo e menor o CAC, maior o score

### Fórmula proposta:
```typescript
// Exemplo:
// Ad A: cost=10000, cac=50  → score = 10000 * (1/50) = 200
// Ad B: cost=5000,  cac=30  → score = 5000 * (1/30) = 166.67
// Ad C: cost=8000,  cac=40  → score = 8000 * (1/40) = 200
// Winner: Ad A (maior investimento com bom CAC)

function calculateWinnerScore(ad: AdData): number {
  if (!ad.cost || !ad.cac || ad.cac <= 0) return 0;
  return ad.cost * (1 / ad.cac); // Custo-eficiência
}
```

---

## ✅ PRÓXIMOS PASSOS

1. **Debugar de onde vem o ad_id incorreto**
   - Adicionar logs no `enrichAdData`
   - Verificar se `ad_id` é modificado em algum lugar

2. **Implementar novo algoritmo de ranking**
   - Criar `rankByCostEfficiency()`
   - Usar `cost * (1/cac)` como score
   - Priorizar ads com alto investimento E bom retorno

3. **Adicionar validação de ad_id**
   - Verificar se `ad_id` existe antes de tentar preview
   - Mostrar erro mais claro se não encontrar

---

## 🔧 TESTES NECESSÁRIOS

1. Ver quais `ad_id`s realmente existem no período filtrado
2. Comparar com os `ad_id`s que aparecem nos Winners
3. Entender se há agregação/modificação dos dados
