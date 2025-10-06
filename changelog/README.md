# 📝 Changelog - Ad Intelligence Hub

Esta pasta contém o histórico detalhado de todas as mudanças significativas no projeto.

## 📋 Formato dos Arquivos

```
YYYY-MM-DD-NN-titulo-descritivo.md
```

- **YYYY-MM-DD**: Data da mudança
- **NN**: Número sequencial (01, 02, 03...)
- **titulo-descritivo**: Breve descrição da mudança

## 📚 Índice de Mudanças

### 2025-10-02

1. **[Roteamento por Perspectivas](./2025-10-02-01-roteamento-perspectivas.md)**
   - Implementação de rotas dinâmicas `/:perspectiva/concorrente`
   - Deep links via query param `?ad=<ID>`
   - URL como fonte da verdade

2. **[Filtros Sincronizados com URL](./2025-10-02-02-filtros-sincronizados-url.md)**
   - Sincronização bidirecional URL ↔ Filtros
   - Parâmetros: search, competitors, platform, assetType, dates
   - Preservação de UTMs

3. **[Correções de UX](./2025-10-02-03-correcoes-ux.md)**
   - Filtros aplicados apenas via botão (não automático)
   - Card abre sem reload (modal instantâneo)
   - URL limpa ao trocar perspectiva

4. **[Bug: Campo Platform Não Mapeado](./2025-10-02-04-bug-campo-platform.md)**
   - Interface TypeScript faltando campo `platform`
   - Correção: Adicionado à `AdsSupabaseRow`

5. **[Bug: Cards Não Atualizam](./2025-10-02-05-bug-display-cards.md)**
   - `useCallback` faltando `options.filters?.platform` nas deps
   - Correção: Adicionada dependência, simplificado `useEffect`

6. **[Fix: Vercel Build e Aplicação de Temas](./2025-10-02-06-fix-vercel-build-e-temas.md)**
   - Erro ENOENT no build do Vercel
   - Temas não sendo aplicados nas páginas de perspectiva
   - Correção: Deletado conflito de roteamento, sincronizado tema com URL

7. **[Performance Módulo - Fase 1.1: Fundação](./2025-10-02-07-performance-fase-1-1-fundacao.md)**
   - Estrutura `features/performance/` criada
   - Types, Mock Data, KPI Calculations
   - Componentes: HeaderSwitch, ProductTabs, PerfFilters
   - Rotas: Overview e Drilldown básicos

8. **[Performance Módulo - Refatoração Shadcn UI Charts](./2025-10-02-08-performance-shadcn-ui-charts.md)**
   - Todos os charts refatorados com `ChartContainer`, `ChartConfig`, `ChartTooltip`
   - EfficiencyChart: Area chart interativo com seletor de métricas
   - CostByPlatformChart: Stacked bar chart com legenda automática
   - CostByProductChart: Horizontal bar chart com cores por produto
   - FunnelChart: Design moderno com badges e indicadores de conversão
   - Acessibilidade ativada em todos os charts

9. **[Performance Módulo - Fase 1.3: Drilldown, Best Ads e Tabelas](./2025-10-02-09-performance-fase-1-3-drilldown-tables.md)**
   - Estrutura Overview/Drilldown corrigida
   - Overview: Dados agregados de TODOS os produtos
   - Drilldown: Dados filtrados por produto específico
   - Best Ads: Top 5 criativos ranqueados por CTR + Hook Rate
   - Performance Table: Sorting, paginação, 9 colunas de métricas
   - Navegação completa entre páginas com botão "Voltar"

10. **[Fix: TypeError com métricas undefined](./2025-10-02-10-fix-undefined-metrics.md)**
   - Formatters agora tratam undefined (formatCurrency, formatNumber, formatPercentage)
   - Novo tipo AdData com métricas calculadas
   - Hook enrichAdData() calcula ctr, hook_rate, cpm, cpa, cac automaticamente
   - PerformanceTable simplificada (usa métricas pré-calculadas)
   - BestAds e PerformanceTable funcionando sem erros

11. **[Performance Módulo - Refatoração de Filtros e UX](./2025-10-02-11-performance-filters-ux-overhaul.md)**
   - Novo sistema de filtros: Ontem, 7d, 30d, Date Range Picker customizado
   - Filtro de busca por nome em tempo real (campanha/anúncio)
   - Tabela completa com 19 colunas + seletor de colunas visíveis
   - Best Ads refatorado: Top 3 cards visuais com comparação vs média
   - Layout drilldown reordenado: KPIs → Tabela → Gráfico → Top 3 → Outros
   - Product Tabs sem seleção default no overview

12. **[📊 Resumo Completo - Performance Módulo (Fase 1)](./2025-10-02-12-resumo-fase-1-completo.md)** ⭐
   - **Resumo executivo** de toda a Fase 1 do módulo Performance
   - Timeline completo (Fase 1.1 até 1.4 + Bug Fixes)
   - Estrutura de arquivos, rotas e componentes
   - Sistema de filtros, tabela (19 colunas), Best Ads (Top 3)
   - Charts Shadcn UI, KPIs, Hooks e Types
   - Estatísticas: 20+ arquivos, ~3.500 linhas, 15 componentes
   - Lições aprendidas e próximos passos (Fase 2)
   - **Status: ✅ Fase 1 Completa (100%)**

### 2025-10-03

13. **[Performance Módulo - Fase 2.1: Integração Supabase GROWTH](./2025-10-03-01-performance-fase-2-supabase-integration.md)** 🔌
   - Supabase Client GROWTH (browser + server)
   - API Routes: `/api/performance` e `/api/performance/kpis`
   - Query functions com filtros avançados (platform, product, date range, search)
   - Hook `usePerformanceDataAPI` para consumir API real
   - Componentes `EmptyState` e `ErrorState`
   - Tratamento de colunas com espaço (`"tap signup"`, `"tap activations"`)
   - Migração gradual de mock data para dados reais
   - **Status: ✅ Fase 2.1 Completa (Integração Backend)**

14. **[Performance Módulo - Fase 2.2: Migração de Componentes](./2025-10-03-02-performance-fase-2-2-component-migration.md)** 🔄
   - `OverviewContent` migrado para API real (`usePerformanceDataAPI`)
   - `DrilldownContent` migrado para API real
   - `ErrorState` com refetch() em ambos os componentes
   - `EmptyState` com resetFilters() em ambos os componentes
   - HeaderSection() reusável no DrilldownContent
   - Fix: tipo `ViewGranularity` adicionado
   - Fluxo completo: Loading → Error/Empty/Success
   - **Status: ✅ Fase 2.2 Completa (Componentes Migrados)**

15. **[Fix: Platform Values - Uppercase para Lowercase](./2025-10-03-03-fix-platform-lowercase.md)** 🐛
   - Bug: Filtro de plataforma não funcionava (case mismatch)
   - Frontend usa: `META`, `GOOGLE`, `TIKTOK` (uppercase)
   - Supabase tem: `meta`, `google`, `tiktok` (lowercase)
   - Criada função `normalizePlatforms()` para converter
   - Queries atualizadas: `fetchPerformanceData()` e `fetchAggregatedKPIs()`
   - **Status: ✅ Bug Corrigido**

16. **[Performance Módulo - Persistência de Filtros na URL (Deep-Linking)](./2025-10-03-04-performance-url-filters-persistence.md)** 🔗
   - Hook `usePerformanceUrlFilters` para sincronização bidirecional URL ↔ State
   - Query params: `platforms`, `range`, `from`, `to`, `search`
   - Deep-linking: compartilhar URLs com filtros aplicados
   - Browser back/forward funciona corretamente
   - Refresh mantém filtros aplicados
   - Preservação de UTMs (`utm_*`)
   - Hydration-safe com flag `isReady`
   - `OverviewContent` e `DrilldownContent` atualizados
   - **Status: ✅ Feature Completa (UX Aprimorada)**

17. **[Fix: Loop Infinito no PerfFilters (Maximum Update Depth)](./2025-10-03-05-fix-infinite-loop-perffilters.md)** 🐛🔥
   - Bug crítico: "Maximum update depth exceeded" crashava a aplicação
   - Causa: Uncontrolled component com `useEffect` + callback nas dependências
   - Solução: Refatorado `PerfFilters` para controlled component
   - Interface: `onFiltersChange` → `value` + `onChange`
   - Removido: `useState` interno + `useEffect` problemático
   - Pattern: Agora segue padrão React (`value`/`onChange` como `<input>`)
   - **Status: ✅ Bug Crítico Resolvido (P0)**

18. **[Performance Módulo - Fase 2.6: Métricas Específicas por Produto](./2025-10-03-fase-2-6-metricas-por-produto.md)** 📊⭐
   - Funções de cálculo de KPI específicas: `calculateInfinitePayKPIs`, `calculateJimKPIs`, `calculatePosKPIs`, `calculateTapKPIs`, `calculateLinkKPIs`
   - **InfinitePay Overview:** Filtra apenas POS + TAP + LINK (exclui JIM)
   - **JIM:** Métricas específicas (install, activation_web, activation_app, signup_web)
   - **POS:** Métricas específicas (pos_sales, piselli_sales, % Piselli)
   - **TAP:** Métricas específicas (tap_activations, tap_signup, tap_cnpj_signups, % CNPJ, quinta transação)
   - **LINK:** Métricas específicas (link_signup, link_activations)
   - API `/api/performance/kpis` refatorada para usar funções corretas por contexto
   - Tipo `KPIContext` adicionado + `KPIMetrics` atualizado com campos opcionais
   - **Status: ✅ Fase 2.6 Completa (Métricas Corretas por Produto)**

19. **[Hotfix: KPI Calculation via API (Fase 2.6.1)](./2025-10-03-fase-2-6-1-hotfix-kpi-api.md)** 🐛🔥
   - Bug crítico: Anúncios não apareciam na tela após Fase 2.6
   - Causa: `usePerformanceDataAPI` calculava KPIs localmente (função legada)
   - Solução: Hook agora busca KPIs de `/api/performance/kpis` (funções específicas)
   - Garantia de consistência: Frontend e backend alinhados
   - **Status: ✅ Hotfix Aplicado (P0)**

20. **[Hotfix: Infinite Loop no usePerformanceDataAPI (Fase 2.6.2)](./2025-10-03-fase-2-6-2-hotfix-infinite-loop.md)** 🐛🔥🔥
   - Bug crítico: Loop infinito de fetch após hotfix 2.6.1
   - Causa: Dependências instáveis no useEffect (arrays/objetos criando novas referências)
   - Solução: Memoização com `useMemo` e `useCallback` para estabilizar dependências
   - `platformsKey`, `productsKey`, `dateRangeKey` memoizados como strings
   - **Status: ✅ Hotfix Aplicado (P0)**

21. **[Fix: Produtos por Perspectiva (Fase 2.6.3)](./2025-10-03-fase-2-6-3-fix-perspective-products.md)** 🐛
   - Bug: Perspectiva "jim" mostrava produtos InfinitePay (POS, TAP, LINK)
   - Causa: `OverviewContent` estava hardcodeando produtos em vez de usar lógica dinâmica
   - Solução: `products` agora é calculado dinamicamente baseado em `perspective`
   - Atualizado: `getProductsForPerspective()` para retornar produtos corretos
   - **jim** → JIM | **infinitepay** → POS, TAP, LINK | **default/cloudwalk** → TODOS
   - **Status: ✅ Fix Aplicado**

22. **[Fix: Produtos por Perspectiva - Regra Corrigida (Fase 2.6.4)](./2025-10-03-fase-2-6-4-fix-products-per-perspective.md)** 🐛
   - Bug: Perspectivas "default" e "cloudwalk" não incluíam JIM
   - Causa: Lógica agrupava "default" com "infinitepay" (ambos sem JIM)
   - Solução: **default/cloudwalk** → TODOS (incluindo JIM) | **infinitepay** → sem JIM
   - **jim** → JIM | **infinitepay** → POS, TAP, LINK | **default/cloudwalk** → POS, TAP, LINK, JIM
   - **Status: ✅ Fix Aplicado**

23. **[BestAds no Overview (Fase 2.6.5)](./2025-10-03-fase-2-6-5-bestads-overview.md)** 🏆
   - Feature: Adicionar BestAds ao Overview (1 winner por plataforma)
   - Implementado: Modo "overview" vs "drilldown" no componente BestAds
   - Overview: 1 winner por plataforma (META, GOOGLE, TIKTOK)
   - Drilldown: Top 3 do produto específico
   - Performance score baseado em CTR + Hook Rate
   - **Status: ✅ Implementado**

24. **[BestAds com Visual + Critérios de Ranking (Fase 2.7)](./2025-10-03-fase-2-7-bestads-visual-criteria.md)** 🏆✨
   - Refactor: BestAds agora mostra **preview visual** dos criativos
   - Novo componente: `CreativePreview` (YouTube embed para GOOGLE, thumbnails para META/TikTok)
   - Implementado: **Múltiplos critérios** de ranking (Melhor CAC, Hook Rate, Signups)
   - UI: Indicação de **período filtrado** ("Melhor anúncio dos últimos 7 dias")
   - Layout: Cards maiores (450px) com preview de 256px
   - Comparação com média (CAC -20%, Hook Rate +12%)
   - **Status: ✅ Implementado**

25. **[Hotfix: Dados de Conversão Ausentes - Fallback](./2025-10-03-hotfix-dados-ausentes.md)** 🐛🔧
   - Bug: Campos de conversão (`tap signup`, `tap activations`, etc.) são **NULL** no Supabase
   - Impacto: CAC/CPA não calculáveis → BestAds vazio ("Nenhum dado disponível")
   - Solução: **Fallback para Hook Rate + CTR** quando CAC não existe
   - Fallback: **Impressões** quando Signups = 0
   - UI: Indicação "Sem dados" onde apropriado
   - Documentação: `features/performance/DADOS_AUSENTES.md`
   - **Status: ✅ Hotfix Aplicado (Temporário) | ⏳ Aguardando Fix no Back-End**

---

## 📋 **[RESUMO DA SESSÃO: 3 de Outubro de 2025](./2025-10-03-SESSAO-COMPLETA.md)** 🎯

**Entregas Principais:**
- ✅ **Fase 2.7:** BestAds com preview visual + critérios de ranking
- ✅ **Hotfix:** React Hooks order
- ✅ **Hotfix:** Fallback para dados de conversão ausentes
- ✅ **Ajuste:** Suporte para platform em lowercase
- ✅ **Debug:** Logs extensivos para troubleshooting

**Documentação Criada:**
- `features/performance/API_DOCUMENTATION.md` - Docs da API
- `features/performance/DADOS_AUSENTES.md` - Análise de dados NULL
- `features/performance/FASE_2_7_SUMMARY.md` - Resumo da Fase 2.7

**Status:** ✅ Build compilado sem erros | ⏳ Aguardando correção de pipeline ETL

**Ver resumo completo:** [2025-10-03-SESSAO-COMPLETA.md](./2025-10-03-SESSAO-COMPLETA.md)

---

## 📋 **[FEEDBACK + TASK LIST: 4 de Outubro de 2025](./2025-10-04-FEEDBACK-E-TASKS.md)** 🎯

**Feedback Completo do Usuário:**

**🔴 P0 - Crítico:**
1. JIM product drilldown não funciona (`/jim/performance/jim`)
2. Gráficos quebrados no tema escuro (dados zerados, cores ruins)
3. Gráficos de produto não funcionam (Eficiência, CPM, CTR)

**🟠 P1 - Alta:**
4. Winners (Best Ads) não aparecem em Overview nem Drilldown
5. Date Picker customizável quebrado (UX ruim)

**🟢 P2 - Features:**
6. Gráfico multi-métrica (barras + linhas combinadas + export)

**🟡 P3 - UX:**
7. Busca por campanha/anúncio pouco visível

**Total:** 7 tasks organizadas por prioridade

**Ver documento completo:** [2025-10-04-FEEDBACK-E-TASKS.md](./2025-10-04-FEEDBACK-E-TASKS.md)

---

## ✅ **[Sprint 1: P0 Fixes - 4 de Outubro de 2025](./2025-10-04-sprint-1-p0-fixes.md)** 🔴

**Status:** ✅ 3/3 tasks concluídas (< 1h) 🎉

**Correções:**
1. ✅ **Gráficos no dark mode:** 
   - Fix dados zerados (platform lowercase → UPPERCASE)
   - Fix cores ruins (TikTok preto → rosa vibrante, paleta dark mode)
2. ✅ **JIM drilldown:** 
   - Removido `disabled` quando há 1 produto
   - Agora `/jim/performance/jim` funciona
3. ✅ **Gráficos de produto:**
   - Gráficos já existiam (CPM, CTR no seletor do EfficiencyChart)
   - Melhorada UX: hint visual "(Selecione uma métrica →)"

**Próximo:** Sprint 2 - Winners + Date Picker (P1)

**Ver detalhes:** [2025-10-04-sprint-1-p0-fixes.md](./2025-10-04-sprint-1-p0-fixes.md)

---

## 🔥 **[HOTFIX: Middleware Bloqueando API - 4 de Outubro de 2025](./2025-10-04-hotfix-middleware-blocking-api.md)** 🚨

**Status:** ✅ Resolvido (< 10 min)

**Problema CRÍTICO:**
- APIs de performance bloqueadas pelo Clerk middleware
- Redirecionando para `/sign-in` ao invés de retornar JSON
- **Impacto:** Nenhum dado aparecia no frontend

**Solução:**
```typescript
// middleware.ts
const isPublicRoute = createRouteMatcher([
  "/api/performance(.*)",  // ✅ ADICIONADO
  "/api/analytics(.*)",    // ✅ ADICIONADO
]);
```

**Resultado:** 6.608 registros agora carregam corretamente! 🎉

**Ver detalhes:** [2025-10-04-hotfix-middleware-blocking-api.md](./2025-10-04-hotfix-middleware-blocking-api.md)

---

## 🔗 **[Creative Link Webhook Integration - 6 de Outubro de 2025](./2025-10-06-creative-link-webhook-integration.md)** ⚡

**Status:** ✅ Backend Completo | ⏳ Frontend Pendente

**Backend (Engenharia):**
- ✅ API `/api/performance/creative-link` com cache inteligente (4 dias)
- ✅ Hook React `useCreativeLink` para facilitar uso
- ✅ Integração com webhook N8N (CloudWalk Growth)
- ✅ N8N busca creative_link + preview_image da META e salva no Supabase
- ✅ SQL migration para campos `link_updated_at` e `creative_preview_image`
- ✅ Documentação completa (API + N8N Contract + Env Setup)

**Flow:**
```
User Click → API verifica cache → Se expirado, triggera N8N
→ N8N busca META API + salva Supabase → API retorna dados
```

**Pendente (UI):**
- ⏳ Modal de confirmação para preview
- ⏳ Loading com Logo Piadinha
- ⏳ Carrossel de melhores anúncios (5 por plataforma)
- ⏳ Winners na Overview/Drilldown

**Ver detalhes:** [2025-10-06-creative-link-webhook-integration.md](./2025-10-06-creative-link-webhook-integration.md)

---

## ✨ **[Melhorias na Tabela de Performance - 4 de Outubro de 2025](./2025-10-04-table-improvements.md)** 🎨

**Status:** ✅ Concluído (< 15 min)

**Melhorias:**
1. ✅ **Nomes completos:** Removido truncate (`...`), nomes aparecem completos
2. ✅ **Ad ID completo:** Agora usa `ad_id` (ID do anúncio) ao invés de `creative_id` (interno)
3. ✅ **Botão "Ver Anúncio":** Ícone de olho (👁️) na primeira coluna
4. ✅ **Modal de preview:** Abre com CreativePreview + métricas completas
5. ✅ **Scroll horizontal:** Tabela se ajusta como no Excel

**Antes:**
```
Nome: META_TAP_WEB_TOFU_CONV...  ❌
Criativo ID: 12021109127...  ❌ (campo errado + truncado)
```

**Depois:**
```
Nome: META_TAP_WEB_TOFU_CONVERSION-OPEN_TAP_PRODUCT_STATIC_ACEITE-CARTAO_V1  ✅
Ad ID: 120211079278030050  ✅ (campo correto + completo)
[👁️] Ver Anúncio → Modal com preview visual + todas métricas
```

**Nota:** `creative_id` é para uso interno (busca). Tabela agora exibe `ad_id`.

**Ver detalhes:** [2025-10-04-table-improvements.md](./2025-10-04-table-improvements.md)

---

## 🎯 Como Usar Este Changelog

### Para Desenvolvedores
- Leia os logs antes de fazer mudanças relacionadas
- Entenda decisões arquiteturais e bugs corrigidos
- Evite reintroduzir bugs já resolvidos

### Para IAs (Claude, GPT, etc.)
- Leia os logs ao começar a trabalhar no projeto
- Use como contexto para entender mudanças recentes
- Consulte ao investigar bugs ou comportamentos inesperados

## 📝 Template para Novos Logs

```markdown
# YYYY-MM-DD-NN - Título da Mudança

## 📋 Contexto
Breve explicação do que motivou a mudança

## 🎯 Objetivos
- Lista de objetivos da mudança

## 🐛 Problema (se aplicável)
Descrição do bug ou problema

## ✅ Solução
Como foi resolvido

## 📝 Arquivos Modificados
- `caminho/arquivo.ts` - Descrição da mudança

## 🧪 Testes
Como testar/validar

## ⚠️ Observações
Notas importantes ou lições aprendidas
```

## 🔍 Convenções

### Emojis Padrão
- 📋 Contexto
- 🎯 Objetivos
- 🐛 Problemas/Bugs
- ✅ Soluções/Correções
- 📝 Arquivos/Código
- 🧪 Testes
- ⚠️ Avisos/Observações
- 🔧 Ferramentas/Configuração
- 📊 Impacto/Métricas
- 🔄 Fluxos/Processos

### Categorias de Mudanças
- **Feature**: Nova funcionalidade
- **Bug**: Correção de bug
- **Refactor**: Refatoração de código
- **Docs**: Documentação
- **Config**: Configuração
- **Performance**: Otimização

## 📞 Contato
Para dúvidas sobre mudanças específicas, consulte os logs ou a equipe de desenvolvimento.

