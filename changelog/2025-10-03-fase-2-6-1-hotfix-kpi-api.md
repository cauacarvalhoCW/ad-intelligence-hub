# Fase 2.6.1: Hotfix - KPI Calculation via API

**Data:** 03/10/2025  
**Tipo:** Bug Fix (Critical)  
**Status:** ✅ Concluído

---

## 🐛 Problema

Após implementar a Fase 2.6 (Métricas Específicas por Produto), os anúncios **não estavam aparecendo na tela**.

### **Causa Raiz:**

O hook `usePerformanceDataAPI` estava calculando KPIs **localmente** usando a função legada `calculateKPIMetrics()` em vez de buscar da API `/api/performance/kpis`, que usa as funções específicas por produto.

```typescript
// ❌ ANTES (ERRADO):
const metrics = calculateKPIMetrics(enrichedData, includeInstalls);
setKpiMetrics(metrics);
```

Isso causava:
- KPIs calculados incorretamente (não usava funções específicas)
- Dados não apareciam na tela
- Frontend e backend desalinhados

---

## ✅ Solução

Refatorado `usePerformanceDataAPI` para buscar KPIs da API:

```typescript
// ✅ DEPOIS (CORRETO):
// Fetch KPI metrics from API (uses product-specific calculations)
const kpiResponse = await fetch(`/api/performance/kpis?${params.toString()}`);

if (!kpiResponse.ok) {
  const kpiErrorData = await kpiResponse.json();
  throw new Error(kpiErrorData.error?.message || "Failed to fetch KPI metrics");
}

const { data: kpiData, error: kpiError } = await kpiResponse.json();

if (kpiError) {
  throw new Error(kpiError.message);
}

setKpiMetrics(kpiData);
```

### **Benefícios:**
1. ✅ KPIs calculados usando funções específicas por produto
2. ✅ Consistência entre frontend e backend
3. ✅ Anúncios aparecem na tela corretamente
4. ✅ Overview InfinitePay exclui JIM corretamente
5. ✅ Drilldowns mostram métricas específicas

---

## 📝 Arquivos Modificados

### **Modificado:**
- `features/performance/hooks/usePerformanceDataAPI.ts`
  - Linhas 158-172: Adicionado fetch para `/api/performance/kpis`
  - Removido cálculo local de KPIs
  - Agora usa KPIs retornados pela API

---

## 🧪 Como Testar

1. **Acesse o Overview:**
   ```
   http://localhost:3000/default/performance
   ```
   - Deve mostrar dados agregados de POS + TAP + LINK
   - NÃO deve incluir dados de JIM

2. **Acesse Drilldown JIM:**
   ```
   http://localhost:3000/default/performance/jim
   ```
   - Deve mostrar métricas de JIM (installs, activation_web, etc.)

3. **Verificar KPIs:**
   - Abrir DevTools → Console
   - Deve logar dados de debug (se `debugPerformanceData` estiver ativo)
   - KPIs devem corresponder aos dados retornados pelo backend

4. **Verificar Tabela:**
   - Tabela deve aparecer com anúncios
   - Colunas devem mostrar métricas calculadas

---

## 📊 Impacto

### **Antes (Bug):**
- ❌ Anúncios não apareciam
- ❌ KPIs incorretos
- ❌ Frontend e backend desalinhados

### **Depois (Corrigido):**
- ✅ Anúncios aparecem corretamente
- ✅ KPIs calculados com funções específicas
- ✅ Frontend e backend alinhados
- ✅ Overview exclui JIM
- ✅ Drilldowns funcionam perfeitamente

---

## 🔗 Relacionado

- **Fase 2.6:** Métricas Específicas por Produto
- **Fase 2.1:** Supabase Integration Backend
- **Fase 2.2:** Component Migration

---

## ⚠️ Lição Aprendida

**Sempre garantir que o frontend consuma a API correta!**

Quando criamos uma API route com lógica específica (`/api/performance/kpis`), o frontend deve **sempre** buscar dela, e não recalcular localmente. Isso garante:
- Consistência de dados
- Single source of truth
- Facilita debugging
- Melhor separação de responsabilidades

---

**Autor:** Claude + Cauã  
**Revisão:** ✅ Testado e Funcionando



