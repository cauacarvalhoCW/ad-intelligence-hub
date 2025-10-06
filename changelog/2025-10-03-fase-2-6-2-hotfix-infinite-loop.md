# Fase 2.6.2: Hotfix - Infinite Loop no usePerformanceDataAPI

**Data:** 03/10/2025  
**Tipo:** Bug Fix (Critical P0)  
**Status:** ✅ Concluído

---

## 🐛 Problema

Após o hotfix 2.6.1, a página de Performance entrava em **loop infinito de fetch**, causando:
- ❌ Milhares de requisições à API
- ❌ Loading infinito na tela
- ❌ Performance degradada
- ❌ Logs se repetindo infinitamente

### **Causa Raiz:**

O `useEffect` no hook `usePerformanceDataAPI` tinha **dependências instáveis**:

```typescript
// ❌ ANTES (CAUSAVA LOOP):
useEffect(() => {
  fetchData();
}, [
  perspective,
  platforms,     // ❌ Array - nova referência a cada render
  products,      // ❌ Array - nova referência a cada render
  range,
  product,
  view,
  dateRange,     // ❌ Objeto - nova referência a cada render
  searchQuery,
  enabled,
  refetchTrigger,
]);
```

**Como arrays e objetos sempre criam novas referências**, o `useEffect` detectava mudança a cada render, disparando um novo fetch, que causava um novo render, que disparava outro fetch... **LOOP INFINITO!**

---

## ✅ Solução

Implementado **memoization** com `useMemo` e `useCallback` para estabilizar as dependências:

```typescript
// ✅ DEPOIS (SEM LOOP):

// 1. Memoizar arrays como strings
const platformsKey = useMemo(
  () => platforms?.join(',') || '', 
  [platforms]
);

const productsKey = useMemo(
  () => products?.join(',') || '', 
  [products]
);

// 2. Memoizar dateRange como string
const dateRangeKey = useMemo(() => {
  if (!dateRange?.from || !dateRange?.to) return null;
  return `${dateRange.from.toISOString()}-${dateRange.to.toISOString()}`;
}, [dateRange?.from, dateRange?.to]);

// 3. Usar useCallback para estabilizar fetchData
const fetchData = useCallback(async () => {
  // ... fetch logic ...
}, [
  perspective,
  platformsKey,    // ✅ String estável
  productsKey,     // ✅ String estável
  range,
  product,
  view,
  dateRangeKey,    // ✅ String estável
  searchQuery,
  enabled,
  refetchTrigger,
]);

// 4. useEffect agora tem dependência estável
useEffect(() => {
  fetchData();
}, [fetchData]);
```

---

## 📝 Arquivos Modificados

### **Modificado:**
- `features/performance/hooks/usePerformanceDataAPI.ts`
  - Adicionado: `useMemo`, `useCallback` nos imports
  - Linhas 103-110: Memoização de `dateRangeKey`, `platformsKey`, `productsKey`
  - Linha 112: `fetchData` envolvido em `useCallback`
  - Linhas 215-226: Dependências do `useCallback` usando keys memoizadas
  - Linhas 228-230: `useEffect` simplificado com apenas `fetchData` como dependência
  - Linha 232: `refetch` envolvido em `useCallback`

---

## 🧪 Como Testar

1. **Acesse o Performance:**
   ```
   http://localhost:3000/default/performance
   ```

2. **Verifique o Console:**
   - Deve mostrar **apenas 1 fetch** por ação
   - NÃO deve ficar repetindo logs infinitamente

3. **Teste mudanças de filtro:**
   - Mude plataforma → deve fazer 1 fetch
   - Mude período → deve fazer 1 fetch
   - Busque por nome → deve fazer 1 fetch

4. **Verifique Network Tab:**
   - Deve mostrar **apenas 2 requisições** por ação:
     - `/api/performance`
     - `/api/performance/kpis`

---

## 📊 Impacto

### **Antes (Bug):**
- ❌ Loop infinito de fetch
- ❌ Centenas de requisições por segundo
- ❌ Loading infinito
- ❌ Performance degradada

### **Depois (Corrigido):**
- ✅ 1 fetch por mudança de filtro
- ✅ Dados aparecem na tela
- ✅ Performance normal
- ✅ UX fluida

---

## 🔗 Relacionado

- **Fase 2.6:** Métricas Específicas por Produto
- **Fase 2.6.1:** KPI Calculation via API
- **Fase 2.5:** Infinite Loop Fix (PerfFilters)

---

## ⚠️ Lição Aprendida

**Sempre estabilizar dependências de objetos/arrays em `useEffect`!**

Quando `useEffect` depende de arrays ou objetos:
1. ✅ Use `useMemo` para memoizar valores derivados
2. ✅ Use `useCallback` para memoizar funções
3. ✅ Converta arrays/objetos em strings (keys) quando possível
4. ❌ **NUNCA** coloque arrays/objetos diretamente nas dependências se eles forem recriados a cada render

---

**Autor:** Claude + Cauã  
**Revisão:** ✅ Testado e Funcionando



