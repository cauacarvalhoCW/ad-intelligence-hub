# 📋 Plano de Implementação - Novas Rotas

**Data**: 1 de Outubro de 2025  
**Objetivo**: Implementar sistema de rotas conforme especificação em `rotas.md`

---

## 📊 Análise: Estado Atual vs Objetivo

### 🟢 Estado Atual (CLAUDE.md)

**Rotas Existentes**:
```
/ → redirect para /default/concorrente
/[perspectiva]/concorrente
  - perspectivas: cloudwalk, infinitepay, jim, default
  - Query params: ?ad=<ID> (para modal de anúncio)
  - Query params: filtros (platform, search, etc.)
```

**Funcionalidades**:
- ✅ Sistema de perspectivas (4 temas)
- ✅ Dashboard de anúncios de concorrentes
- ✅ Filtros avançados
- ✅ Analytics de concorrentes
- ✅ Chat com LangGraph
- ✅ Modal de anúncio via query param

---

### 🎯 Objetivo (rotas.md)

**Nova Estrutura de Rotas**:

```
📁 Rotas Raiz
├── / → redirect /default/performance
└── /[perspectiva] → redirect /[perspectiva]/performance

📁 Rotas de Concorrentes (JÁ EXISTENTE - ajustar)
├── /[perspectiva]/concorrentes (plural!)
│   └── ?filtros (query params)

📁 Rotas de Performance (NOVO!)
├── /[perspectiva]/performance
│   ├── Overview geral dos produtos próprios
│   ├── Gráficos: custo, impressões, clicks, signup, ativação
│   ├── Métricas: CAC, CPM, CPA, CTR, Hook Rate
│   ├── Melhor ad de cada produto (cards com métricas)
│   ├── Filtros de tempo
│   ├── Criativos mais escalados
│   └── Tabs por produto (POS, TAP, LINK, JIM)
│
└── /[perspectiva]/performance/[produto]
    ├── Dashboard específico por produto
    ├── Mesmas métricas, mas focado no produto
    └── Top 3 melhores ads do produto
```

**Produtos por Perspectiva**:
- **CloudWalk**: POS, TAP, LINK, JIM
- **InfinitePay**: POS, TAP, LINK
- **JIM**: JIM

---

## 🔍 Gap Analysis

### 1. Rotas a CRIAR
- [ ] `/[perspectiva]/performance` (overview geral)
- [ ] `/[perspectiva]/performance/[produto]` (produto específico)
- [ ] Layout para rotas de performance

### 2. Rotas a MODIFICAR
- [ ] `/` → Mudar redirect de `/default/concorrente` para `/default/performance`
- [ ] `/[perspectiva]` → Criar e redirecionar para `/[perspectiva]/performance`
- [ ] `/[perspectiva]/concorrente` → Renomear para `/[perspectiva]/concorrentes` (plural)

### 3. Dados Necessários (rotas.md - Schema DB)
**Nova tabela Supabase**: `mkt_ads_looker`
- `ad_id`, `ad_name`, `date`, `platform`
- `campaign_id`, `campaign_name`
- **Métricas**: `cost`, `impressions`, `clicks`, `video_3s`
- **Conversões TAP**: `tap_signup`, `tap_activations`, `tap_5trx`, `tap_cnpj_signups`
- **Conversões POS**: `pos_sales`, `piselli_sales`
- **JIM**: `install`, `signup_web`, `activation_app`, `activation_web`
- **LINK**: `link_signup`, `link_activations`
- **Metadata**: `product`, `creative_link`, `creative_id`

### 4. Componentes a CRIAR
- [ ] Performance Dashboard (overview)
- [ ] Product Dashboard (produto específico)
- [ ] Metrics Cards (CAC, CPM, CPA, CTR, Hook Rate)
- [ ] Time Series Charts (evolução temporal)
- [ ] Top Ads Cards (melhores anúncios)
- [ ] Product Tabs (POS, TAP, LINK, JIM)
- [ ] Time Filters (filtro de período)

---

## 🎯 Plano de Implementação

### Fase 1: Estrutura de Rotas ✅
**Objetivo**: Criar estrutura básica sem quebrar rotas existentes

#### 1.1 Ajustes em Rotas Existentes
```
✅ MANTER: /[perspectiva]/concorrente (não mudar agora)
❓ AVALIAR: Mudar para /concorrentes depois ou junto?

Decisão: Manter /concorrente por enquanto
```

#### 1.2 Criar Novas Rotas
```
📁 app/[perspectiva]/performance/
├── page.tsx (overview geral)
├── layout.tsx (layout compartilhado)
└── [produto]/
    └── page.tsx (produto específico)

📁 app/page.tsx
└── Mudar redirect: /default/performance

📁 app/[perspectiva]/page.tsx (CRIAR)
└── Redirect para /[perspectiva]/performance
```

### Fase 2: Integração com Dados 📊
**Objetivo**: Conectar com nova tabela `mkt_ads_looker`

#### 2.1 Types e Interfaces
```typescript
// lib/types.ts (adicionar)
interface PerformanceAd {
  ad_id: number;
  ad_name: string;
  date: Date;
  platform: string;
  campaign_id: number;
  campaign_name: string;
  cost: number;
  impressions: number;
  clicks: number;
  video_3s: number;
  // ... todas as métricas
  product: string; // 'POS' | 'TAP' | 'LINK' | 'JIM'
  creative_link: string;
  creative_id: string;
}

interface PerformanceMetrics {
  cac: number;
  cpm: number;
  cpa: number;
  ctr: number;
  hookRate: number;
  totalCost: number;
  totalImpressions: number;
  totalClicks: number;
  totalSignups: number;
  totalActivations: number;
}
```

#### 2.2 Service Layer
```typescript
// features/performance/server/service.ts
export async function fetchPerformanceData(params: {
  perspective: Perspective;
  product?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<PerformanceAd[]> {
  // Query mkt_ads_looker table
}

export async function calculateMetrics(
  ads: PerformanceAd[]
): Promise<PerformanceMetrics> {
  // Calcular CAC, CPM, CPA, CTR, Hook Rate
}
```

#### 2.3 API Routes
```typescript
// app/api/performance/route.ts
GET /api/performance?perspective=cloudwalk&product=TAP&dateFrom=...

// app/api/performance/metrics/route.ts
GET /api/performance/metrics?...
```

### Fase 3: Componentes UI 🎨
**Objetivo**: Criar dashboards de performance

#### 3.1 Performance Overview
```typescript
// components/performance/PerformanceDashboard.tsx
- KPI Cards (custo total, impressões, clicks, signups, ativações)
- Time Series Charts (evolução temporal de métricas)
- Platform Distribution Chart (custo por plataforma)
- Product Distribution Chart (custo por produto)
- Best Ads Cards (melhor ad de cada produto)
- Product Tabs (alternar entre POS, TAP, LINK, JIM)
```

#### 3.2 Product Dashboard
```typescript
// components/performance/ProductDashboard.tsx
- Product-specific KPIs
- Focused metrics for single product
- Top 3 Ads (melhores anúncios do produto)
- Scaled Creatives (criativos mais escalados)
```

#### 3.3 Shared Components
```typescript
// components/performance/MetricCard.tsx
// components/performance/AdPerformanceCard.tsx
// components/performance/TimeRangeFilter.tsx
// components/performance/ProductTabs.tsx
```

### Fase 4: Validação e Testes ✅
**Objetivo**: Garantir que tudo funciona

#### 4.1 Testes de Rotas
- [ ] `/` → `/default/performance` ✓
- [ ] `/cloudwalk` → `/cloudwalk/performance` ✓
- [ ] `/cloudwalk/performance` carrega overview ✓
- [ ] `/cloudwalk/performance/tap` carrega dashboard TAP ✓
- [ ] `/cloudwalk/concorrente` ainda funciona ✓

#### 4.2 Testes de Dados
- [ ] API `/api/performance` retorna dados
- [ ] Métricas calculadas corretamente
- [ ] Filtros de tempo funcionam
- [ ] Produtos filtrados por perspectiva

#### 4.3 Testes de UI
- [ ] Gráficos renderizam
- [ ] Cards de métricas exibem valores corretos
- [ ] Tabs de produto funcionam
- [ ] Filtros aplicam corretamente

---

## 📐 Estrutura de Pastas (Proposta)

```
app/
├── page.tsx (redirect /default/performance)
├── [perspectiva]/
│   ├── page.tsx (redirect /[perspectiva]/performance)
│   ├── layout.tsx (layout compartilhado)
│   ├── concorrente/  (EXISTENTE - manter)
│   │   └── page.tsx
│   └── performance/  (NOVO!)
│       ├── page.tsx (overview)
│       ├── layout.tsx
│       └── [produto]/
│           └── page.tsx

features/
├── ads/ (EXISTENTE)
└── performance/ (NOVO!)
    ├── components/
    │   ├── PerformanceDashboard.tsx
    │   ├── ProductDashboard.tsx
    │   ├── MetricCard.tsx
    │   └── AdPerformanceCard.tsx
    ├── hooks/
    │   ├── usePerformanceData.ts
    │   └── useMetrics.ts
    ├── server/
    │   ├── service.ts
    │   ├── params.ts
    │   └── constants.ts
    └── types/
        └── index.ts

components/
├── performance/ (componentes compartilhados)
│   ├── TimeRangeFilter.tsx
│   ├── ProductTabs.tsx
│   └── ChartWrapper.tsx
```

---

## ⚠️ Pontos de Atenção

### 1. Nome da Rota de Concorrentes
**Decisão necessária**:
- Manter `/concorrente` (singular) ✓ Não quebra nada
- Mudar para `/concorrentes` (plural) ✓ Alinha com rotas.md

**Recomendação**: Mudar para `/concorrentes` junto com a implementação

### 2. Produtos por Perspectiva
```typescript
const PRODUCTS_BY_PERSPECTIVE = {
  cloudwalk: ['POS', 'TAP', 'LINK', 'JIM'],
  infinitepay: ['POS', 'TAP', 'LINK'],
  jim: ['JIM'],
  default: ['POS', 'TAP', 'LINK', 'JIM'] // todos
};
```

### 3. Métricas Calculadas
**CAC** = cost / (signups + activations)  
**CPM** = (cost / impressions) * 1000  
**CPA** = cost / (signups + activations)  
**CTR** = (clicks / impressions) * 100  
**Hook Rate** = (video_3s / impressions) * 100  

### 4. Tabela Supabase
Precisa verificar se `mkt_ads_looker` já existe no Supabase ou se precisa criar.

---

## 🚀 Ordem de Execução (Recomendada)

### Sprint 1: Estrutura
1. ✅ Criar estrutura de pastas (`features/performance/`, `app/[perspectiva]/performance/`)
2. ✅ Criar types básicos
3. ✅ Criar rotas e redirects
4. ✅ Validar roteamento funciona

### Sprint 2: Dados
1. ✅ Verificar/criar tabela `mkt_ads_looker` no Supabase
2. ✅ Criar service layer (`features/performance/server/`)
3. ✅ Criar API routes (`/api/performance`)
4. ✅ Criar hooks (`usePerformanceData`, `useMetrics`)
5. ✅ Validar dados fluem corretamente

### Sprint 3: UI
1. ✅ Criar componentes base (MetricCard, Charts)
2. ✅ Criar PerformanceDashboard (overview)
3. ✅ Criar ProductDashboard (produto específico)
4. ✅ Criar filtros e tabs
5. ✅ Validar UI renderiza corretamente

### Sprint 4: Integração
1. ✅ Integrar tudo
2. ✅ Testes end-to-end
3. ✅ Ajustes finais
4. ✅ Deploy

---

## ❓ Questões para Decisão

### 1. **Renomear `/concorrente` para `/concorrentes`?**
   - [ ] Sim, renomear agora
   - [ ] Não, manter `/concorrente`
   - [ ] Criar `/concorrentes` e manter `/concorrente` como alias

### 2. **Tabela `mkt_ads_looker` existe no Supabase?**
   - [ ] Sim, já existe
   - [ ] Não, precisa criar
   - [ ] Precisa verificar

### 3. **Prioridade de implementação?**
   - [ ] Sprint 1 (rotas) primeiro
   - [ ] Sprint 2 (dados) primeiro
   - [ ] Tudo junto

### 4. **Dados de performance são reais ou mock?**
   - [ ] Usar dados reais do Supabase
   - [ ] Criar mock data primeiro
   - [ ] Híbrido (mock enquanto não tem dados reais)

---

## 📝 Próximos Passos Imediatos

**Aguardando decisões do usuário**:
1. Validar se o plano está correto
2. Confirmar renomear `/concorrente` → `/concorrentes`
3. Verificar se tabela `mkt_ads_looker` existe
4. Definir prioridade de implementação

**Depois das decisões**:
- Começar implementação pela Sprint escolhida
- Criar branch de desenvolvimento
- Implementar feature by feature
- Validar cada etapa

---

**Status**: 📋 **PLANO CRIADO - AGUARDANDO APROVAÇÃO**

