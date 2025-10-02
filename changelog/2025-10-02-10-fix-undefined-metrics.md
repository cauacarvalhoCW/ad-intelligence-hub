# Fix: TypeError com métricas undefined

**Data:** 2025-10-02  
**Tipo:** Bug Fix

## 🐛 Problema

```
TypeError: Cannot read properties of undefined (reading 'toFixed')
    at formatPercentage
    at BestAds
```

**Causa:**
- `BestAds` e `PerformanceTable` assumiam que `ctr`, `hook_rate`, e outras métricas calculadas existiam nos dados
- Mock data (`MktAdsLookerRow`) não incluía essas métricas calculadas
- `formatPercentage()` não tratava valores `undefined`

## ✅ Solução

### 1. **Formatters mais robustos** 🛡️

```typescript
// ANTES: Só tratava null
export const formatPercentage = (value: number | null, decimals = 2) => {
  if (value === null) return "—";
  return `${value.toFixed(decimals)}%`; // ❌ Error se undefined
};

// DEPOIS: Trata null, undefined e NaN
export const formatPercentage = (value: number | null | undefined, decimals = 2) => {
  if (value === null || value === undefined || isNaN(value)) return "—";
  return `${value.toFixed(decimals)}%`; // ✅ Safe
};
```

**Aplicado em:**
- ✅ `formatCurrency()`
- ✅ `formatNumber()`
- ✅ `formatPercentage()`

### 2. **Novo tipo `AdData`** 📦

```typescript
// Novo tipo com métricas calculadas
export interface AdData extends MktAdsLookerRow {
  // Calculated metrics
  ctr?: number | null;
  hook_rate?: number | null;
  cpm?: number | null;
  cpa?: number | null;
  cac?: number | null;
  signups?: number;
  activations?: number;
}
```

### 3. **Hook enriquece dados automaticamente** ⚡

```typescript
// features/performance/hooks/usePerformanceData.ts

function enrichAdData(row: MktAdsLookerRow): AdData {
  const impressions = row.impressions || 0;
  const clicks = row.clicks || 0;
  const video_3s = row.video_3s || 0;
  const cost = row.cost || 0;

  // Aggregate signups
  const signups = 
    (row["tap signup"] || 0) +
    (row.signup_web || 0) +
    (row.link_signup || 0);

  // Aggregate activations
  const activations =
    (row["tap activations"] || 0) +
    (row.activation_app || 0) +
    (row.activation_web || 0) +
    (row.link_activations || 0);

  return {
    ...row,
    ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
    hook_rate: impressions > 0 ? (video_3s / impressions) * 100 : 0,
    cpm: impressions > 0 ? (cost / impressions) * 1000 : 0,
    cpa: signups > 0 ? cost / signups : null,
    cac: activations > 0 ? cost / activations : null,
    signups,
    activations,
  };
}

// Usar no hook
const enrichedData = filtered.map(enrichAdData);
setRawData(enrichedData);
```

### 4. **PerformanceTable simplificada** 🧹

```typescript
// ANTES: Calculava CPA manualmente
{paginatedData.map((ad) => {
  const cpa = ad.signups > 0 ? ad.cost / ad.signups : 0; // ❌ Duplicado
  return <TableCell>{formatCurrency(cpa)}</TableCell>
})}

// DEPOIS: Usa valor já calculado
{paginatedData.map((ad) => {
  return <TableCell>{formatCurrency(ad.cpa)}</TableCell> // ✅ Já calculado
})}

// Sorting também simplificado
case "cpa":
  aValue = a.cpa ?? Infinity; // ✅ Usa null coalescing
  bValue = b.cpa ?? Infinity;
```

## 📁 Arquivos Modificados

```
✅ features/performance/utils/kpi-calculations.ts
   - formatCurrency: aceita undefined
   - formatNumber: aceita undefined
   - formatPercentage: aceita undefined

✅ features/performance/types/index.ts
   - Novo tipo AdData com métricas calculadas

✅ features/performance/hooks/usePerformanceData.ts
   - Nova função enrichAdData()
   - Enriquece dados antes de retornar rawData

✅ features/performance/components/PerformanceTable.tsx
   - Usa ad.cpa em vez de calcular
   - Usa ad.ctr em vez de ad.clicks/ad.impressions
   - Sorting simplificado
```

## ✅ Testado

- ✅ `BestAds` renderiza sem erros
- ✅ `PerformanceTable` renderiza e ordena corretamente
- ✅ Métricas calculadas aparecem corretamente
- ✅ Valores null/undefined exibem "—"
- ✅ Sem erros de lint

## 🎯 Benefícios

1. **Segurança de Tipos:** `AdData` documenta quais métricas estão disponíveis
2. **Cálculo Centralizado:** Uma única função `enrichAdData()`
3. **Performance:** Métricas calculadas uma vez, não a cada render
4. **Manutenibilidade:** Componentes não precisam saber como calcular métricas
5. **Robustez:** Formatters tratam todos os edge cases

## 💡 Próximas Melhorias

- [ ] Cache de dados enriquecidos
- [ ] Memoização de cálculos pesados
- [ ] Validação de schema com Zod
- [ ] Testes unitários para `enrichAdData()`

---

**Status:** ✅ Corrigido  
**Prioridade:** Alta (Quebrava a aplicação)

