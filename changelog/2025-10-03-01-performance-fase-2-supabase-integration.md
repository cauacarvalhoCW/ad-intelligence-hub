# Performance Módulo - Fase 2: Integração Supabase GROWTH

**Data:** 2025-10-03  
**Tipo:** Feature - Backend Integration  
**Status:** ✅ Concluído

## 📋 Contexto

Integração do módulo Performance com o banco de dados real do Supabase GROWTH. Migração de mock data para dados reais da tabela `mkt_ads_looker`.

**Objetivos:**
1. Conectar ao Supabase GROWTH via variáveis de ambiente
2. Criar API routes no Next.js para expor dados
3. Criar queries otimizadas para buscar dados filtrados
4. Criar novo hook para consumir a API
5. Adicionar estados de erro e empty state

---

## 🎯 Implementações

### 1. Supabase Client GROWTH

Criados clients específicos para o banco GROWTH:

```typescript
// features/performance/api/client.ts
export const supabaseGrowth = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL_GROWTH!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_GROWTH!
);

// features/performance/api/server.ts
export async function createSupabaseGrowthServer() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL_GROWTH!,
    process.env.SUPABASE_SERVICE_ROLE_KEY_GROWTH!,
    { /* cookies config */ }
  );
}
```

### 2. API Routes

#### `GET /api/performance`
Busca dados filtrados da tabela `mkt_ads_looker`

**Query Params:**
```
?perspective=default
&product=POS (opcional)
&products=POS,TAP,LINK (opcional)
&platforms=META,GOOGLE,TIKTOK (opcional)
&range=7d|30d|yesterday|custom
&from=2024-01-01 (se range=custom)
&to=2024-12-31 (se range=custom)
&search=black+friday (opcional)
```

**Response:**
```json
{
  "data": [/* MktAdsLookerRow[] */],
  "error": null,
  "count": 150
}
```

#### `GET /api/performance/kpis`
Busca apenas KPIs agregados (mais eficiente)

**Query Params:** Mesmos da rota principal

**Response:**
```json
{
  "data": {
    "cost": 150000,
    "impressions": 1000000,
    "clicks": 5000,
    /* ... todos os campos agregados */
  },
  "error": null
}
```

### 3. Queries Supabase

```typescript
// features/performance/api/queries.ts

// Calcula date range baseado no preset
export function calculateDateRange(range: string): { from: string; to: string }

// Busca dados filtrados
export async function fetchPerformanceData(params: PerformanceQueryParams)

// Busca KPIs agregados (soma de todos os campos)
export async function fetchAggregatedKPIs(params: PerformanceQueryParams)
```

**Features das queries:**
- ✅ Filtro por `product` ou `products[]`
- ✅ Filtro por `platforms[]`
- ✅ Filtro por date range (calculado ou customizado)
- ✅ Busca por `ad_name` ou `campaign_name` (case-insensitive)
- ✅ Ordenação por `date DESC`
- ✅ Tratamento de colunas com espaço (`"tap signup"`, `"tap activations"`, etc.)

### 4. Hook `usePerformanceDataAPI`

Novo hook que substitui `usePerformanceData` (mock data) para buscar dados reais:

```typescript
const {
  kpiMetrics,
  efficiencyData,
  costByPlatformData,
  costByProductData,
  funnelData,
  rawData,
  isLoading,
  error,
  refetch,  // <-- Novo: permite re-fetch manual
} = usePerformanceDataAPI({
  perspective: "default",
  platforms: ["META", "GOOGLE"],
  product: "POS",
  range: "7d",
  dateRange: { from: new Date(), to: new Date() },
  searchQuery: "black friday",
  enabled: true, // <-- Novo: controla quando buscar
});
```

**Diferenças do hook antigo:**
- ✅ Busca da API real (não mock data)
- ✅ Parâmetro `perspective` obrigatório
- ✅ Suporte a `dateRange` customizado
- ✅ Suporte a `searchQuery`
- ✅ Flag `enabled` para controlar fetching
- ✅ Função `refetch()` para retry manual

### 5. Componentes de Estado

#### `EmptyState`
Exibido quando não há dados para os filtros selecionados

```tsx
<EmptyState
  title="Nenhum dado encontrado"
  description="Não há dados para os filtros selecionados..."
  icon="no-results"
  action={{
    label: "Limpar Filtros",
    onClick: () => resetFilters(),
  }}
/>
```

**Props:**
- `title` (string)
- `description` (string)
- `icon` ("no-data" | "no-results" | "filter")
- `action` ({ label: string, onClick: () => void })

#### `ErrorState`
Exibido quando ocorre erro na busca

```tsx
<ErrorState
  title="Erro ao carregar dados"
  message={error.message}
  errorCode="QUERY_ERROR"
  onRetry={() => refetch()}
/>
```

**Props:**
- `title` (string)
- `message` (string)
- `errorCode` (string)
- `onRetry` (() => void)

---

## 📝 Estrutura de Arquivos Criados

```
features/performance/
├── api/
│   ├── client.ts           ✅ Supabase client browser
│   ├── server.ts           ✅ Supabase client server
│   ├── types.ts            ✅ API types (query params, response)
│   └── queries.ts          ✅ Query functions
├── hooks/
│   ├── usePerformanceData.ts       (mantido com mock data)
│   └── usePerformanceDataAPI.ts    ✅ Novo hook com API real
└── components/
    └── shared/
        ├── EmptyState.tsx   ✅
        ├── ErrorState.tsx   ✅
        └── index.ts         ✅

app/
└── api/
    └── performance/
        ├── route.ts         ✅ GET /api/performance
        └── kpis/
            └── route.ts     ✅ GET /api/performance/kpis
```

---

## 🔧 Variáveis de Ambiente

Já configuradas no `.env`:

```bash
## Growth Team Supabase
NEXT_PUBLIC_SUPABASE_URL_GROWTH=https://ynxiqusfachruvjioqgk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY_GROWTH=eyJ...
SUPABASE_SERVICE_ROLE_KEY_GROWTH=eyJ...
```

---

## 🔄 Migração para API Real

Para migrar um componente de mock data para API real:

**Antes (Mock Data):**
```tsx
import { usePerformanceData } from "@/features/performance/hooks";

const { kpiMetrics, isLoading } = usePerformanceData({
  platforms: filters.platforms,
  product: product,
  range: filters.range,
});
```

**Depois (API Real):**
```tsx
import { usePerformanceDataAPI } from "@/features/performance/hooks";

const { kpiMetrics, isLoading, error, refetch } = usePerformanceDataAPI({
  perspective: perspective,  // <-- Novo parâmetro obrigatório
  platforms: filters.platforms,
  product: product,
  range: filters.range,
  dateRange: filters.dateRange,  // <-- Novo parâmetro
  searchQuery: filters.searchQuery,  // <-- Novo parâmetro
});

// Tratar erro
if (error) {
  return <ErrorState message={error.message} onRetry={refetch} />;
}

// Tratar empty state
if (!isLoading && rawData.length === 0) {
  return <EmptyState />;
}
```

---

## ✅ Validações

### 1. API Routes
```bash
# Testar endpoint principal
curl "http://localhost:3000/api/performance?perspective=default&range=7d"

# Testar com filtros
curl "http://localhost:3000/api/performance?perspective=default&product=POS&platforms=META,GOOGLE&range=30d"

# Testar custom date range
curl "http://localhost:3000/api/performance?perspective=default&range=custom&from=2024-01-01&to=2024-12-31"

# Testar busca
curl "http://localhost:3000/api/performance?perspective=default&search=black%20friday"

# Testar KPIs
curl "http://localhost:3000/api/performance/kpis?perspective=default&range=7d"
```

### 2. Tratamento de Erros
- ✅ Missing `perspective` → 400 Bad Request
- ✅ Custom range sem `from/to` → 400 Bad Request
- ✅ Erro do Supabase → 500 Internal Server Error
- ✅ Query vazia → `{ data: [], count: 0 }`

### 3. Colunas com Espaço
- ✅ `"tap signup"` busca corretamente
- ✅ `"tap activations"` busca corretamente
- ✅ `"tap 5trx"` busca corretamente
- ✅ `"tap cnpj signups"` busca corretamente

---

## 🚀 Próximos Passos

### Migração Gradual
1. ⏳ Atualizar `OverviewContent` para usar `usePerformanceDataAPI`
2. ⏳ Atualizar `DrilldownContent` para usar `usePerformanceDataAPI`
3. ⏳ Adicionar tratamento de erro/empty state em todos os charts
4. ⏳ Adicionar loading states mais detalhados

### Otimizações Futuras
- [ ] React Query para cache e refetch automático
- [ ] Server-side pagination para tabelas grandes
- [ ] Debounce na busca por `searchQuery`
- [ ] Streaming de dados (Server-Sent Events)
- [ ] Edge caching para queries comuns

---

## 💡 Lições Aprendidas

### 1. Separação de Clients
Usar clients separados (GROWTH vs Moreno) evita conflitos e facilita manutenção.

### 2. API Routes vs Direct Client
API routes oferecem:
- Melhor segurança (não expõe service role key)
- Fácil debugging (logs no servidor)
- Fácil rate limiting
- Cache layer

### 3. Colunas com Espaço
Supabase trata colunas com espaço automaticamente quando usamos `.select()`, mas é importante documentar.

### 4. Agregações Client-Side
Supabase free tier não tem funções de agregação avançadas, então fazemos `SUM()` no cliente após buscar os dados.

### 5. Empty State vs Loading
Diferenciar claramente:
- `isLoading=true` → Skeleton
- `isLoading=false && data.length=0` → EmptyState
- `error !== null` → ErrorState

---

## 📊 Métricas

```
📁 Arquivos criados: 9
📝 Linhas de código: ~800
🔌 API endpoints: 2
🔍 Query functions: 3
🎣 Hooks: 1
🎨 Componentes: 2
⏱️ Tempo de desenvolvimento: 2h
```

---

## 🐛 Bugs Conhecidos

Nenhum bug conhecido no momento.

---

**Status:** ✅ Fase 2.1 (Supabase Integration) Concluída  
**Próxima Fase:** Fase 2.2 - Migração dos Componentes para API Real

---

**Arquivos Modificados:**
```
✅ features/performance/api/client.ts (NOVO)
✅ features/performance/api/server.ts (NOVO)
✅ features/performance/api/types.ts (NOVO)
✅ features/performance/api/queries.ts (NOVO)
✅ features/performance/hooks/usePerformanceDataAPI.ts (NOVO)
✅ features/performance/hooks/index.ts (atualizado)
✅ features/performance/components/shared/EmptyState.tsx (NOVO)
✅ features/performance/components/shared/ErrorState.tsx (NOVO)
✅ features/performance/components/shared/index.ts (NOVO)
✅ features/performance/components/index.ts (atualizado)
✅ app/api/performance/route.ts (NOVO)
✅ app/api/performance/kpis/route.ts (NOVO)
```


