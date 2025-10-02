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

