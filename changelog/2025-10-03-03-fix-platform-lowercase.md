# Fix: Platform Values - Uppercase para Lowercase

**Data:** 2025-10-03  
**Tipo:** Bug Fix  
**Status:** ✅ Concluído

## 🐛 Problema

O código estava usando valores em **UPPERCASE** para plataformas (`META`, `GOOGLE`, `TIKTOK`), mas o Supabase armazena esses valores em **lowercase** (`meta`, `google`, `tiktok`).

Isso causava queries que não retornavam resultados ao filtrar por plataforma.

---

## ✅ Solução

Criada função `normalizePlatforms()` que converte os valores para lowercase antes de enviar para o Supabase.

### Código Adicionado

```typescript
/**
 * Convert platform values to lowercase for Supabase queries
 * Frontend uses: META, GOOGLE, TIKTOK
 * Supabase has: meta, google, tiktok
 */
function normalizePlatforms(platforms: string[]): string[] {
  return platforms.map(p => p.toLowerCase());
}
```

### Queries Atualizadas

**Antes:**
```typescript
// ❌ Enviava: ["META", "GOOGLE", "TIKTOK"]
if (params.platforms && params.platforms.length > 0) {
  query = query.in("platform", params.platforms);
}
```

**Depois:**
```typescript
// ✅ Envia: ["meta", "google", "tiktok"]
if (params.platforms && params.platforms.length > 0) {
  query = query.in("platform", normalizePlatforms(params.platforms));
}
```

---

## 📝 Arquivos Modificados

```
✅ features/performance/api/queries.ts
   - Adicionada função normalizePlatforms()
   - Linha 83: fetchPerformanceData() atualizada
   - Linha 161: fetchAggregatedKPIs() atualizada
```

---

## 🧪 Como Testar

### Teste 1: Query com Platform Filter
```bash
# Antes (retornava vazio):
curl "http://localhost:3000/api/performance?perspective=default&platforms=META,GOOGLE&range=7d"

# Depois (retorna dados):
curl "http://localhost:3000/api/performance?perspective=default&platforms=META,GOOGLE&range=7d"
```

### Teste 2: No Navegador
```typescript
// Use os filtros de plataforma na UI
// Selecione: META, GOOGLE
// Resultado: Dados devem aparecer corretamente filtrados
```

### Teste 3: Verificar Logs
```typescript
// No terminal do servidor, você deve ver:
// Query com: ["meta", "google"] (não ["META", "GOOGLE"])
```

---

## 📊 Impacto

**Antes do fix:**
- ❌ Filtro de plataforma não funcionava
- ❌ Queries retornavam vazio ou todos os dados
- ❌ UX quebrada para filtros

**Depois do fix:**
- ✅ Filtro de plataforma funciona corretamente
- ✅ Queries retornam dados filtrados
- ✅ UX funcional

---

## 💡 Lições Aprendidas

### 1. Case Sensitivity em Queries
Sempre verificar o case (maiúscula/minúscula) dos valores no banco de dados antes de fazer queries.

### 2. Normalização de Dados
Criar funções helper para normalizar dados antes de enviar para APIs/databases.

### 3. Tipos vs Valores
No TypeScript, os **tipos** podem ser maiúsculos (`Platform = "META"`), mas os **valores no banco** podem ser minúsculos. É importante ter uma camada de transformação.

### 4. Convenção
**Frontend (Types):** `META`, `GOOGLE`, `TIKTOK` (constantes)  
**Backend (DB):** `meta`, `google`, `tiktok` (valores reais)  
**Transformação:** Função `normalizePlatforms()` faz a ponte

---

## 🔍 Outras Colunas para Verificar

Verificar se outras colunas também precisam de normalização:

- ✅ `platform`: lowercase (CORRIGIDO)
- ❓ `product`: Verificar se é `POS` ou `pos` no Supabase
- ❓ `ad_name`, `campaign_name`: Case-insensitive via `.ilike()`

**Nota:** Se `product` também for lowercase, criar função `normalizeProducts()` similar.

---

## 🚀 Próximos Passos

Se houver mais inconsistências de case, considerar:

1. **Criar camada de transformação centralizada:**
```typescript
// features/performance/api/transformers.ts
export function toSupabaseFilters(filters: Filters) {
  return {
    platforms: filters.platforms.map(p => p.toLowerCase()),
    products: filters.products.map(p => p.toLowerCase()),
    // ... outras transformações
  };
}
```

2. **Ou ajustar os tipos:**
```typescript
// Ajustar tipos para refletir a realidade do banco
type PlatformDB = "meta" | "google" | "tiktok";
type Platform = Uppercase<PlatformDB>; // "META" | "GOOGLE" | "TIKTOK"
```

---

**Status:** ✅ Bug Corrigido  
**Prioridade:** ALTA (quebrava funcionalidade principal)  
**Revisão:** Necessária para outras colunas

---

**Agradecimentos:** @cauacarvalho por identificar o problema! 🎯


