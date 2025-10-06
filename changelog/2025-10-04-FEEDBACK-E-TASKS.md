# 🎯 Feedback do Usuário + Task List - 4 de Outubro de 2025

**Data:** 4 de outubro de 2025  
**Status:** 📋 Planejamento

---

## 📝 Transcrição do Feedback

### 1. **JIM Product Drilldown Não Funciona** 🔴 P0
**Problema:**
- Ao clicar em "JIM" na página de overview, não abre a visão de produto
- Rota esperada: `/jim/performance/jim`
- Atualmente não renderiza nada

**Comportamento Esperado:**
- Manter JIM como produto (pode escalar para outros produtos da JIM no futuro)
- Mostrar drilldown completo (KPIs, Gráficos, Winners, Tabela)

---

### 2. **Gráficos Quebrados no Tema Escuro** 🔴 P0
**Problemas:**
- Gráficos ficam "apagados" e esquisitos no dark mode
- "Custo por Plataforma" mostra **zerado** mesmo com dados
- "Custo por Produto" também afetado
- Cores não seguem identidade visual do InfinitePay

**Comportamento Esperado:**
- Gráficos devem ser legíveis em **ambos os temas**
- Cores do dark mode devem seguir paleta do InfinitePay
- Dados devem aparecer corretamente (não zerados)

**Escopo:**
- Afeta: InfinitePay, Default, JIM (todas as perspectivas)
- Gráficos: Custo por Plataforma, Custo por Produto, Eficiência ao Longo do Tempo

---

### 3. **Winners (Best Ads) Não Aparecem** 🟠 P1
**Problemas:**
- **Overview:** Não mostra winners por plataforma (Meta, Google, TikTok)
- **Drilldown de Produto:** Não mostra winners do produto

**Comportamento Esperado:**

#### **Opção A: 1 Winner por Plataforma**
- Grid de 3 cards
- Cada card mostra o melhor anúncio da plataforma
- Logo da plataforma (Meta, Google, TikTok)

#### **Opção B: Top 3 por Plataforma (Carrossel)**
- Grid de 3 cards (1 por plataforma)
- Cards **giram/alternam** entre os top 3 de cada plataforma
- Navegação: Setas ou dots

**User Preference:** Deixar flexível (talvez um toggle?)

**Localização:**
- Overview (InfinitePay, JIM, Default)
- Drilldown de cada produto (POS, TAP, LINK, JIM)

---

### 4. **Tabela Está OK** ✅
**Status:** Funcionando corretamente
- Métricas corretas
- Nenhuma ação necessária

---

### 5. **Gráficos de Produto Não Funcionam** 🔴 P0
**Problemas:**
- **"Eficiência ao Longo do Tempo":** Não funciona
- **CPM:** Não funciona
- **CTA/CTR:** Não funciona

**Localização:**
- Drilldown de produto (ex: `/infinitepay/performance/pos`)

**Comportamento Esperado:**
- Gráficos devem renderizar com dados reais
- Seguir mesma estrutura dos gráficos do overview

---

### 6. **Gráfico Multi-Métrica (NOVO)** 🟢 Feature
**Descrição:**
- Gráfico de **barras + linhas** no mesmo chart
- Mostrar múltiplas métricas simultaneamente:
  - **Exemplo 1:** Custo (barra) + CAC (linha) + Impressões (linha)
  - **Exemplo 2:** Cliques (barra) + CTR (linha) + Hook Rate (linha)

**Features Solicitadas:**
1. **Seletor de Métricas:** Dropdown para escolher quais métricas exibir
2. **Granularidade:** Toggle para "por dia" / "por semana" / "por mês"
3. **Export:** Botão para baixar dados do gráfico (CSV/Excel)

**Inspiração:**
> "Você tem um gráfico de barra, mas dentro você tem outros gráficos, tipo assim, no mesmo gráfico, você vai ter o custo, o CAC, e quanto que tem de impressão ou de clique."

**Localização:**
- Nova seção na página (Overview e Drilldown?)
- Sugestão: "Análise Comparativa" ou "Métricas Combinadas"

---

### 7. **Date Picker Customizável Quebrado** 🟠 P1
**Problemas:**
- Calendário customizável está "muito feio"
- Não funciona bem
- UX confusa

**Solução Sugerida pelo Usuário:**
- **Remover:** Calendar popup único
- **Adicionar:** Dois campos separados:
  - 📅 **Data Início:** `__/__/____`
  - 📅 **Data Fim:** `__/__/____`

**Alternativa:**
- Manter presets (Ontem, 7d, 30d, 90d)
- Adicionar dois date pickers lado a lado para custom range

---

### 8. **Busca por Campanha/Anúncio Pouco Visível** 🟡 P2
**Problema:**
- Quando usuário busca por campanha/anúncio específico, não fica claro que há um filtro ativo
- Difícil saber se a busca está funcionando

**Solução Sugerida:**
- **Indicador Visual:** Badge ou chip mostrando termo buscado
  - Exemplo: `🔍 Buscando: "META_TAP_CONVERSION"`
- **Clear Button:** Botão para limpar busca rapidamente
- **Highlight na Tabela:** Linhas que correspondem à busca em destaque

---

## 🎯 Task List Priorizada

### 🔴 **P0 - Crítico (Bloqueador de UX)**

#### **Task 1: Fix JIM Product Drilldown Route**
- [ ] **Investigar:** Por que `/jim/performance/jim` não renderiza
- [ ] **Verificar:** Routing em `app/[perspectiva]/performance/[product]/page.tsx`
- [ ] **Corrigir:** Lógica de produtos por perspectiva
- [ ] **Testar:** Navegação JIM overview → JIM product

**Arquivos:**
- `app/[perspectiva]/performance/[product]/page.tsx`
- `features/performance/utils/kpi-calculations.ts` (getProductsForPerspective)

---

#### **Task 2: Fix Dark Theme Charts**
- [ ] **Diagnosticar:** Por que gráficos mostram dados zerados
- [ ] **Implementar:** Tema escuro consistente para todos os charts
- [ ] **Aplicar:** Paleta de cores InfinitePay no dark mode
- [ ] **Testar:** Toggle light/dark em todas as perspectivas

**Arquivos:**
- `features/performance/components/charts/*`
- `lib/themes.ts` (se existir)
- `tailwind.config.js` (dark mode colors)

**Gráficos Afetados:**
- CostByPlatform
- CostByProduct
- EfficiencyOverTime
- CPM, CTR charts

---

#### **Task 3: Fix Product Drilldown Charts**
- [ ] **Eficiência ao Longo do Tempo:** Implementar/corrigir
- [ ] **CPM Chart:** Implementar/corrigir
- [ ] **CTR/CTA Chart:** Implementar/corrigir
- [ ] **Validar dados:** Garantir que API retorna dados corretos

**Arquivos:**
- `features/performance/components/DrilldownContent.tsx`
- `features/performance/components/charts/*`

---

### 🟠 **P1 - Alta Prioridade**

#### **Task 4: Implement Winners Display**
**Subtask 4.1: Overview Winners**
- [ ] **Criar componente:** `WinnersByPlatform.tsx`
- [ ] **Layout:** Grid de 3 cards (META, GOOGLE, TIKTOK)
- [ ] **Dados:** 1 melhor ad por plataforma (ou top 3 com carrossel)
- [ ] **Visual:** Logo da plataforma + preview do criativo
- [ ] **Adicionar em:** OverviewContent.tsx

**Subtask 4.2: Product Drilldown Winners**
- [ ] **Reutilizar:** WinnersByPlatform com filtro de produto
- [ ] **Adicionar em:** DrilldownContent.tsx

**Arquivos:**
- `features/performance/components/WinnersByPlatform.tsx` (NOVO)
- `features/performance/components/OverviewContent.tsx`
- `features/performance/components/DrilldownContent.tsx`

**Design:**
```
┌────────────────────────────────────────────────────────┐
│ 🏆 Melhores Anúncios por Plataforma (Últimos 7 dias)   │
├──────────────┬──────────────┬──────────────────────────┤
│   [META]     │   [GOOGLE]   │      [TIKTOK]            │
│  📷 Preview  │  🎥 Preview  │   📱 Preview             │
│  CAC: R$500  │  CAC: R$450  │   CAC: R$600             │
│  Hook: 15%   │  Hook: 18%   │   Hook: 12%              │
│  ← 1/3 →     │  ← 1/3 →     │   ← 1/3 →                │
└──────────────┴──────────────┴──────────────────────────┘
```

---

#### **Task 5: Improve Date Picker UX**
**Opção A: Dois Date Inputs Separados**
- [ ] **Remover:** Calendar popup atual
- [ ] **Adicionar:** Dois `<input type="date">` lado a lado
- [ ] **Labels:** "Data Início" e "Data Fim"

**Opção B: Melhorar Calendar Existente**
- [ ] **Biblioteca:** Usar `react-day-picker` ou `@shadcn/ui calendar`
- [ ] **Layout:** Melhorar visual (mais espaçado, cores claras)
- [ ] **Validação:** Data fim >= Data início

**Arquivos:**
- `features/performance/components/PerfFilters.tsx`

---

### 🟢 **P2 - Features Novas**

#### **Task 6: Multi-Metric Combined Chart**
- [ ] **Pesquisar:** Biblioteca para charts compostos (Recharts, Chart.js)
- [ ] **Criar componente:** `MultiMetricChart.tsx`
- [ ] **Features:**
  - Seletor de métricas (multi-select)
  - Toggle de granularidade (dia/semana/mês)
  - Export CSV/Excel
- [ ] **Layout:** Barra (Custo) + Linha (CAC, Impressões)

**Arquivos:**
- `features/performance/components/charts/MultiMetricChart.tsx` (NOVO)
- `features/performance/components/OverviewContent.tsx` (adicionar seção)
- `features/performance/components/DrilldownContent.tsx` (adicionar seção)

**Mockup:**
```
┌─────────────────────────────────────────────────────────┐
│ 📊 Análise Comparativa                                   │
│ Métricas: [✓ Custo] [✓ CAC] [✓ Impressões]              │
│ Período: (•) Dia ( ) Semana ( ) Mês         [📥 Export] │
├─────────────────────────────────────────────────────────┤
│                                                          │
│     ████       ████                  ████                │
│     ████  ●────●───────●       ████                      │
│     ████            ●──●       ████                      │
│ ────────────────────────────────────────────────────────│
│   01/10   02/10   03/10   04/10   05/10                 │
│                                                          │
│ ─ Custo (R$)  ─ CAC (R$)  ─ Impressões (k)             │
└─────────────────────────────────────────────────────────┘
```

---

### 🟡 **P3 - Melhorias de UX**

#### **Task 7: Search/Filter Visual Indicator**
- [ ] **Badge:** Mostrar termo buscado acima da tabela
  - Exemplo: `🔍 Buscando: "META_TAP" × (clear)`
- [ ] **Highlight:** Realçar linhas que correspondem à busca
- [ ] **Empty State:** Mensagem amigável se busca não encontrar nada

**Arquivos:**
- `features/performance/components/PerfFilters.tsx`
- `features/performance/components/PerformanceTable.tsx`

---

## 📋 Resumo Executivo

| Categoria | Quantidade | Prioridade |
|-----------|------------|------------|
| **Bugs Críticos** | 3 | 🔴 P0 |
| **Features Pendentes** | 2 | 🟠 P1 |
| **Features Novas** | 1 | 🟢 P2 |
| **Melhorias de UX** | 1 | 🟡 P3 |
| **Total de Tasks** | **7** | - |

---

## 🎨 Design System Considerations

### **Paleta Dark Mode (InfinitePay)**
```css
/* Sugestão de cores para gráficos no dark mode */
--chart-meta: #00D9FF      /* Azul ciano vibrante */
--chart-google: #FF6B6B    /* Vermelho suave */
--chart-tiktok: #A78BFA    /* Roxo suave */
--chart-background: #1E293B  /* Slate-800 */
--chart-grid: #334155      /* Slate-700 */
--chart-text: #F1F5F9      /* Slate-100 */
```

### **Hierarquia Visual**
1. **Winners:** Destaque máximo (cards grandes, preview visual)
2. **KPIs:** Destaque alto (cards com ícones, cores)
3. **Gráficos:** Destaque médio (ocupa espaço, mas não compete com KPIs)
4. **Tabela:** Destaque baixo (dados detalhados para quem quer se aprofundar)

---

## 🔄 Ordem de Execução Sugerida

### **Sprint 1: Fixes Críticos (P0)** 🔴
1. ✅ Task 2: Fix Dark Theme Charts (bloqueia tudo)
2. ✅ Task 1: Fix JIM Drilldown Route (navegação quebrada)
3. ✅ Task 3: Fix Product Charts (funcionalidade core)

**Estimativa:** 1-2 dias

---

### **Sprint 2: Winners + Date Picker (P1)** 🟠
4. ✅ Task 4: Implement Winners Display
5. ✅ Task 5: Improve Date Picker UX

**Estimativa:** 1-2 dias

---

### **Sprint 3: Features Novas (P2 + P3)** 🟢
6. ✅ Task 6: Multi-Metric Combined Chart
7. ✅ Task 7: Search Visual Indicator

**Estimativa:** 2-3 dias

---

## 📝 Notas Adicionais

### **Sobre JIM:**
> "Eu deixo só a JIM, mas por exemplo, quando eu clico não aparece o JIM... pode escalar e ter outros produtos para a JIN, e pode ter uma outra visão."

- Manter arquitetura flexível para múltiplos produtos JIM no futuro
- Não hardcodar produtos

### **Sobre Winners:**
> "Coloca tipo o logo, Google, Meta e TikTok, os melhores winners por plataforma ali, beleza?"

- Logos das plataformas são essenciais
- Preview do criativo é crucial (YouTube embed, thumbnails)

### **Sobre Gráficos Multi-Métrica:**
> "No mesmo gráfico, você vai ter o custo, o CAC, e quanto que tem de impressão, ou de clique... você consegue mudar essa visão de acordo com o dia."

- Inspiração: Looker Studio, Google Analytics
- Permitir customização pelo usuário

### **Sobre Date Picker:**
> "Pode, eu acho que é melhor você colocar um período, tipo assim, dois gráficos, igual tem, tipo, quando começa e quando termina."

- Usuário prefere dois inputs separados
- Mais familiar e funcional

---

## 🚀 Próximos Passos

1. **Revisar task list** com o usuário
2. **Priorizar** tasks (confirmar P0, P1, P2)
3. **Estimar** tempo de cada task
4. **Começar com Sprint 1** (P0 - Fixes críticos)

---

**Aguardando confirmação para iniciar! 🚀**


