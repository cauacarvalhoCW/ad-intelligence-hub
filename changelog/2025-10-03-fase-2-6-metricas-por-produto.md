# Fase 2.6: Métricas Específicas por Produto

**Data:** 03/10/2025  
**Tipo:** Feature + Bug Fix  
**Status:** ✅ Concluído

---

## 📋 Resumo

Implementação de cálculos de KPI específicos por produto (POS, TAP, LINK, JIM) e separação correta entre InfinitePay Overview (POS + TAP + LINK) e JIM.

---

## 🎯 Problema

1. **Overview incluía JIM incorretamente:**
   - `/default/performance` estava agregando dados de JIM junto com InfinitePay
   - Métricas como `activation_web`, `activation_app`, `signup_web` não devem aparecer no Overview geral

2. **Métricas genéricas:**
   - Todos os produtos mostravam as mesmas métricas
   - Não havia diferenciação entre métricas específicas de cada produto

3. **Falta de contexto:**
   - KPIs não refletiam a realidade de cada produto
   - Difícil entender performance real por produto

---

## ✅ Solução Implementada

### **1. Filtro de Produtos no Overview**

#### `OverviewContent.tsx`
```typescript
// ANTES: Buscava TODOS os produtos (incluindo JIM)
const { kpiMetrics } = usePerformanceDataAPI({
  perspective,
  product: undefined, // ❌ Incluía JIM
});

// DEPOIS: Filtra apenas InfinitePay (sem JIM)
const { kpiMetrics } = usePerformanceDataAPI({
  perspective,
  products: ["POS", "TAP", "LINK"], // ✅ Exclui JIM
});
```

---

### **2. Cálculos de KPI Específicos por Produto**

#### `features/performance/utils/kpi-calculations.ts`

Criadas funções específicas para cada contexto:

```typescript
// KPIs para InfinitePay Overview (POS + TAP + LINK)
export function calculateInfinitePayKPIs(data: AdData[]): KPIMetrics {
  // Exclui métricas de JIM (activation_web, activation_app, signup_web, install)
  // Inclui apenas: tap_activations, link_activations, tap_signup, link_signup, pos_sales, etc.
}

// KPIs para JIM
export function calculateJimKPIs(data: AdData[]): KPIMetrics {
  // Foca em: install, activation_web, activation_app, signup_web
}

// KPIs para POS
export function calculatePosKPIs(data: AdData[]): KPIMetrics {
  // Foca em: pos_sales, piselli_sales, % Piselli
}

// KPIs para TAP
export function calculateTapKPIs(data: AdData[]): KPIMetrics {
  // Foca em: tap_activations, tap_signup, tap_5trx, tap_cnpj_signups, % CNPJ
}

// KPIs para LINK
export function calculateLinkKPIs(data: AdData[]): KPIMetrics {
  // Foca em: link_signup, link_activations
}
```

---

### **3. Exibição Condicional de Métricas**

#### `KpiRow.tsx`

KPIs agora se adaptam ao contexto:

**Overview InfinitePay:**
- Custo Total
- Impressões
- CTR
- Hook Rate
- CPM
- Signups (TAP + LINK)
- Ativações (TAP + LINK)
- CPA / CAC
- POS Sales + % Piselli
- Quinta Transação (TAP)

**Drilldown JIM:**
- Custo Total
- Impressões
- CTR / Hook Rate / CPM
- Installs
- Signups Web
- Ativações (Web + App)
- CAC

**Drilldown POS:**
- Custo Total
- Impressões
- CTR / Hook Rate / CPM
- POS Sales
- Piselli Sales
- % Piselli

**Drilldown TAP:**
- Custo Total
- Impressões
- CTR / Hook Rate / CPM
- TAP Signup
- TAP CNPJ Signups + % CNPJ
- TAP Ativações
- CAC
- Quinta Transação

**Drilldown LINK:**
- Custo Total
- Impressões
- CTR / Hook Rate / CPM
- LINK Signup
- LINK Ativações
- CAC

---

## 📊 Estrutura de Rotas

```
/[perspectiva]/performance          → InfinitePay Overview (POS + TAP + LINK)
/[perspectiva]/performance/pos      → POS Drilldown
/[perspectiva]/performance/tap      → TAP Drilldown
/[perspectiva]/performance/link     → LINK Drilldown
/[perspectiva]/performance/jim      → JIM Drilldown (separado)
```

---

## 🔧 Arquivos Modificados

### **Novos Arquivos:**
- `changelog/2025-10-03-fase-2-6-metricas-por-produto.md`

### **Modificados:**
- `features/performance/components/OverviewContent.tsx`
  - Adicionado filtro `products: ["POS", "TAP", "LINK"]`
  
- `features/performance/utils/kpi-calculations.ts`
  - Criadas funções `calculateInfinitePayKPIs`, `calculateJimKPIs`, `calculatePosKPIs`, `calculateTapKPIs`, `calculateLinkKPIs`
  - Atualizada função `calculateKPIMetrics` para delegar ao cálculo correto

- `features/performance/components/KpiRow.tsx`
  - Adicionada lógica condicional para exibir métricas corretas por contexto
  - Recebe prop `context: "overview" | "pos" | "tap" | "link" | "jim"`

- `features/performance/types/index.ts`
  - Adicionado tipo `KPIContext`

---

## 🧪 Como Testar

### **1. Overview InfinitePay**
```bash
# Acessar
http://localhost:3000/default/performance

# Verificar:
- NÃO deve mostrar métricas de JIM (install, activation_web, activation_app, signup_web)
- DEVE mostrar métricas de POS + TAP + LINK
```

### **2. Drilldown JIM**
```bash
# Acessar
http://localhost:3000/default/performance/jim

# Verificar:
- DEVE mostrar install, activation_web, activation_app, signup_web
- NÃO deve mostrar métricas de outros produtos
```

### **3. Drilldown TAP**
```bash
# Acessar
http://localhost:3000/default/performance/tap

# Verificar:
- DEVE mostrar tap_signup, tap_activations, tap_5trx, tap_cnpj_signups
- DEVE calcular % CNPJ corretamente
```

### **4. Teste com Script Supabase**
```bash
npm run test:supabase

# Modificar TEST_CONFIG para:
PRODUCT: null  # InfinitePay Overview
# vs
PRODUCT: "JIM" # JIM isolado

# Comparar totais
```

---

## 📈 Impacto

### **Antes:**
- Overview mostrava **R$ 2.139.832** (incluindo JIM)
- Ativações incluíam `activation_web` + `activation_app` (incorreto para InfinitePay)

### **Depois:**
- Overview mostra apenas POS + TAP + LINK
- Ativações = `tap_activations` + `link_activations` (correto)
- JIM tem overview separado com métricas específicas

---

## 🔗 Relacionado

- **Fase 2.1:** Supabase Integration Backend
- **Fase 2.2:** Component Migration Frontend
- **Fase 2.3:** Platform Case Fix
- **Fase 2.4:** URL Filters Persistence
- **Fase 2.5:** Infinite Loop Fix
- **Fase 2.7 (próxima):** Winners com Embedding de Mídia

---

## ✅ Checklist

- [x] Filtro de produtos no Overview (sem JIM)
- [x] Funções de cálculo específicas por produto
- [x] Exibição condicional de KPIs
- [x] Tipos TypeScript atualizados
- [x] Changelog documentado
- [ ] Testes manuais completos
- [ ] Validação com dados reais do Supabase

---

**Autor:** Claude + Cauã  
**Revisão:** Pendente



