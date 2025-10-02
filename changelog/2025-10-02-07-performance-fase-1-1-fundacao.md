# 2025-10-02-07 - Performance Módulo - Fase 1.1: Fundação

## 📋 Contexto

Início da implementação do módulo de **Performance** conforme especificação do `prompt-v3-performance.md`. 

**Estratégia de desenvolvimento:**
1. ✅ **Fase 1**: Frontend completo com mock data (para validar design/UX)
2. ⏳ **Fase 2**: Integração Supabase GROWTH (dados reais)

Esta é a **Fase 1.1** - Fundação básica do módulo.

## 🎯 Objetivos da Fase 1.1

- [x] Criar estrutura de pastas `features/performance/`
- [x] Definir tipos TypeScript baseados no schema `mkt_ads_looker`
- [x] Criar mock data realista
- [x] Implementar funções de cálculo de KPIs
- [x] Criar componentes de navegação básicos
- [x] Criar rotas principais (overview e drilldown)

## 📝 Arquivos Criados

### Estrutura de Pastas
```
features/
  performance/
    types/
      index.ts          # Tipos TypeScript
    components/
      HeaderSwitch.tsx  # Toggle Performance ↔ Concorrentes
      ProductTabs.tsx   # Tabs de produtos (POS/TAP/LINK/JIM)
      PerfFilters.tsx   # Filtros (Platform, Range, View)
      index.ts          # Exports
    utils/
      kpi-calculations.ts  # Funções de cálculo de métricas
      index.ts             # Exports
    mock-data.ts        # Dados mock realistas

app/
  [perspectiva]/
    performance/
      page.tsx          # Overview da empresa
      [produto]/
        page.tsx        # Drilldown por produto
```

### 1. Types (`features/performance/types/index.ts`)

**Tipos principais:**
- `MktAdsLookerRow` - Mapeia exatamente o schema da tabela
- `KPIMetrics` - Métricas agregadas calculadas
- `BestAd`, `ScaledAd`, `ProductTableRow` - Para tabelas
- `PerformanceFilters` - Estado dos filtros
- `TableMode` - Modos da tabela (by_ad, diarized, by_campaign)

**Enums:**
- `Platform`: META | GOOGLE | TIKTOK
- `Product`: POS | TAP | LINK | JIM
- `Perspective`: default | cloudwalk | infinitepay | jim
- `RangePreset`: 7d | 30d | alltime
- `ViewGranularity`: day | week | month | alltime

### 2. Mock Data (`features/performance/mock-data.ts`)

**Função `generateMockData()`:**
- Gera 30 dias de dados
- Todas as combinações de Platform × Product × Date
- Métricas realistas com variação estatística
- Colunas específicas por produto:
  - TAP: `tap signup`, `tap activations`, `tap 5trx`, `tap cnpj signups`
  - LINK: `link_signup`, `link_activations`
  - JIM: `install`, `signup_web`, `activation_app`, `activation_web`
  - POS: `pos_sales`, `piselli_sales`

**Função `filterMockData()`:**
- Filtra por platforms, products, range, dates
- Usada para simular queries

### 3. KPI Calculations (`features/performance/utils/kpi-calculations.ts`)

**Métricas implementadas:**
- `calculateCTR()` - clicks / impressions
- `calculateCPM()` - cost / impressions * 1000
- `calculateHookRate()` - video_3s / impressions
- `calculateCPA()` - cost / signups (retorna null se divisor = 0)
- `calculateCAC()` - cost / activations (retorna null se divisor = 0)
- `calculatePiselliPercentage()` - piselli_sales / pos_sales

**Agregações:**
- `calculateSignups()` - Soma correta por produto
- `calculateActivations()` - Soma correta por produto
- `calculateKPIMetrics()` - Agrega todas as métricas

**Formatters:**
- `formatCurrency()` - BRL com "—" para null
- `formatNumber()` - Separador de milhares
- `formatPercentage()` - % com decimais

**Helpers:**
- `getProductsForPerspective()` - Retorna produtos disponíveis por perspectiva

### 4. HeaderSwitch (`features/performance/components/HeaderSwitch.tsx`)

**Funcionalidade:**
- Toggle entre "Performance" e "Concorrentes"
- Extrai perspectiva da URL
- Navega para `/:perspective/performance` ou `/:perspective/concorrente`
- Ícones: BarChart3 (Performance) | Users (Concorrentes)
- Estado ativo visual (variant="default")

### 5. ProductTabs (`features/performance/components/ProductTabs.tsx`)

**Funcionalidade:**
- Tabs para POS | TAP | LINK | JIM
- Produtos disponíveis baseados na perspectiva:
  - `infinitepay`: POS, TAP, LINK
  - `jim`: JIM (única tab, desabilitada)
  - `cloudwalk/default`: POS, TAP, LINK, JIM

**Dois modos:**
- `overview`: Tabs mudam contexto via callback (não muda rota)
- `drilldown`: Tabs mudam rota para `/:perspective/performance/:product`

### 6. PerfFilters (`features/performance/components/PerfFilters.tsx`)

**Filtros:**
- **Platform Multi-Select**: META, GOOGLE, TIKTOK (todos selecionados por padrão)
- **Range Presets**: 7d (default), 30d, alltime
- **View**: day, week, month, alltime

**Sincronização com URL:**
- Query params: `?platforms=META,GOOGLE&range=7d&view=day`
- Lê da URL na inicialização
- Atualiza URL ao mudar (sem scroll)
- Callback `onFiltersChange` para notificar pai

**UX:**
- DropdownMenu para platforms
- Select para range e view
- Badges mostrando plataformas selecionadas
- Badge com contador no botão de plataformas

### 7. Rotas

**Overview (`app/[perspectiva]/performance/page.tsx`):**
- Header com título dinâmico da perspectiva
- HeaderSwitch no canto superior direito
- ProductTabs (modo overview) + PerfFilters
- Grid de KPI Cards (placeholders)
- Grid de Charts (placeholders)
- Card "Em Desenvolvimento"

**Drilldown (`app/[perspectiva]/performance/[produto]/page.tsx`):**
- Header com título: Perspectiva – Performance – PRODUTO
- HeaderSwitch no canto superior direito
- ProductTabs (modo drilldown) + PerfFilters
- Grid de KPI Cards específicos do produto
- Tabela detalhada (placeholder)
- Charts específicos do produto (placeholders)

## 🧪 Como Testar

### Acessar as páginas:

**Overview:**
- http://localhost:3000/default/performance
- http://localhost:3000/cloudwalk/performance
- http://localhost:3000/infinitepay/performance
- http://localhost:3000/jim/performance

**Drilldown:**
- http://localhost:3000/default/performance/pos
- http://localhost:3000/infinitepay/performance/tap
- http://localhost:3000/jim/performance/jim

### Testar funcionalidades:

1. **HeaderSwitch**: Clicar em "Concorrentes" deve navegar para `/:perspective/concorrente`
2. **ProductTabs**: 
   - No overview: Tabs devem estar clicáveis (ainda sem efeito)
   - No drilldown: Tabs devem mudar a rota
3. **Filtros**:
   - Selecionar plataformas deve atualizar badges
   - Mudar range/view deve atualizar URL
   - Recarregar página deve preservar filtros da URL
4. **Perspectivas**:
   - InfinitePay deve mostrar apenas POS, TAP, LINK
   - JIM deve mostrar apenas JIM (tab única desabilitada)
   - Default/CloudWalk devem mostrar todos os produtos

## ⚠️ Observações

### O que está funcionando:
- ✅ Estrutura de pastas organizada
- ✅ Tipos TypeScript completos
- ✅ Mock data realista (30 dias)
- ✅ Funções de cálculo de KPIs
- ✅ Navegação básica (HeaderSwitch, ProductTabs)
- ✅ Filtros com sincronização de URL
- ✅ Rotas acessíveis (overview + drilldown)

### O que ainda NÃO está pronto:
- ⏳ KPI Cards com dados reais
- ⏳ Charts (Recharts + shadcn)
- ⏳ Tabelas (TanStack Table)
- ⏳ Best Ad Cards
- ⏳ Loading/Empty/Error states
- ⏳ Responsividade completa
- ⏳ Dark mode refinado

## 🔄 Próximos Passos

### Fase 1.2: KPI Row + Charts
- [ ] Componente KpiRow com cards de métricas
- [ ] EfficiencyChart (linha/área)
- [ ] CostByPlatformChart (barras empilhadas)
- [ ] CostByProductChart (barras agrupadas)
- [ ] FunnelChart (funil)
- [ ] Integrar com mock data

### Fase 1.3: Cards e Tabelas do Overview
- [ ] BestAdCard por produto
- [ ] MostScaledTable com paginação
- [ ] Deep-link para `/concorrente/ad/:creativeId`

### Fase 1.4: Drilldown Completo
- [ ] ProductTable com 3 modos
- [ ] Charts específicos do produto
- [ ] Column visibility, sorting, pagination
- [ ] CSV export

### Fase 1.5: Polish
- [ ] Skeletons
- [ ] Empty/Error states
- [ ] Responsividade
- [ ] Dark mode
- [ ] Acessibilidade

## 📊 Status

**Fase 1.1: ✅ Completa (20% do total)**

Fundação sólida criada. Pronto para validação visual e continuação do desenvolvimento.

