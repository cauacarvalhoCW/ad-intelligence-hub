# 📚 API de Performance - Documentação

**Última Atualização:** 3 de outubro de 2025  
**Versão:** 2.6.5

---

## 🎯 Visão Geral

A API de Performance fornece dados agregados e detalhados de anúncios, permitindo análise por **perspectiva**, **produto**, **plataforma** e **período**.

---

## 🔗 Endpoints Disponíveis

### 1. **GET `/api/performance`**

Retorna **lista detalhada de anúncios** (raw data) com todas as métricas calculadas.

#### **Query Parameters:**

| Parâmetro | Tipo | Obrigatório | Descrição | Exemplo |
|-----------|------|-------------|-----------|---------|
| `perspective` | `string` | ✅ | Perspectiva (default, cloudwalk, infinitepay, jim) | `default` |
| `product` | `string` | ❌ | Produto específico (POS, TAP, LINK, JIM) | `POS` |
| `products` | `string` | ❌ | Lista de produtos (separados por vírgula) | `POS,TAP,LINK` |
| `platforms` | `string` | ❌ | Plataformas (separadas por vírgula) | `META,GOOGLE` |
| `range` | `string` | ❌ | Preset de período (yesterday, 7d, 30d, custom) | `7d` |
| `from` | `string` | ❌* | Data inicial (YYYY-MM-DD) - obrigatório se `range=custom` | `2025-10-01` |
| `to` | `string` | ❌* | Data final (YYYY-MM-DD) - obrigatório se `range=custom` | `2025-10-03` |
| `search` | `string` | ❌ | Busca por nome de campanha ou anúncio | `black friday` |

#### **Response (Success - 200):**

```json
{
  "data": [
    {
      // Dados originais do Supabase
      "date": "2025-10-03",
      "platform": "META",
      "product": "POS",
      "campaign_name": "Campanha Black Friday",
      "ad_name": "Anúncio Teste",
      "creative_id": "123456789",
      "creative_link": "https://example.com/creative/123",
      "cost": 1500.50,
      "impressions": 50000,
      "clicks": 2500,
      "video_3s": 8000,
      "pos_sales": 120,
      "piselli_sales": 30,
      "tap signup": 45,
      "tap activations": 30,
      "tap cnpj signups": 10,
      "tap 5trx": 8,
      "link_signup": 20,
      "link_activations": 15,
      "signup_web": 5,
      "activation_web": 3,
      "activation_app": 2,
      "install": 10,
      
      // Métricas calculadas (enrichAdData)
      "ctr": 5.0,           // (clicks / impressions) * 100
      "hook_rate": 16.0,    // (video_3s / impressions) * 100
      "cpm": 30.01,         // (cost / impressions) * 1000
      "cpa": 21.43,         // cost / signups
      "cac": 31.51,         // cost / activations
      "signups": 70,        // tap signup + signup_web + link_signup
      "activations": 50     // tap activations + activation_web + activation_app + link_activations
    }
    // ... mais anúncios
  ],
  "error": null
}
```

#### **Response (Error - 400/500):**

```json
{
  "data": null,
  "error": {
    "code": "INVALID_PARAMETERS",
    "message": "Missing required parameter: perspective"
  }
}
```

---

### 2. **GET `/api/performance/kpis`**

Retorna **KPIs agregados** (soma de todas as métricas) calculados com **funções específicas por produto**.

#### **Query Parameters:**

Mesmos parâmetros de `/api/performance`.

#### **Response (Success - 200):**

```json
{
  "data": {
    // Métricas básicas (sempre presentes)
    "cost": 45000.00,
    "impressions": 1500000,
    "clicks": 75000,
    "signups": 2100,
    "activations": 1500,
    
    // Métricas calculadas
    "ctr": 5.0,           // (clicks / impressions) * 100
    "cpm": 30.0,          // (cost / impressions) * 1000
    "hook_rate": 12.5,    // (video_3s / impressions) * 100
    "cpa": 21.43,         // cost / signups (null se signups = 0)
    "cac": 30.0,          // cost / activations (null se activations = 0)
    
    // Métricas específicas por produto (podem ser null/undefined)
    "pos_sales": 3500,              // Apenas POS
    "piselli_sales": 890,           // Apenas POS
    "piselli_percentage": 25.43,    // (piselli_sales / pos_sales) * 100
    "tap_cnpj_signups": 450,        // Apenas TAP
    "cnpj_percentage": 21.43,       // (tap_cnpj_signups / tap signup) * 100
    "fifth_transaction": 120,       // Apenas TAP (tap 5trx)
    "installs": 340                 // Apenas JIM
  },
  "error": null
}
```

#### **Contexto de Cálculo (baseado no `product` ou `products`):**

| Contexto | Função Utilizada | Métricas Incluídas |
|----------|------------------|--------------------|
| **InfinitePay Overview** (POS + TAP + LINK) | `calculateInfinitePayKPIs()` | cost, impressions, clicks, signups (tap+link), activations (tap+link), pos_sales, piselli_sales, piselli_percentage, tap_cnpj_signups, cnpj_percentage, fifth_transaction |
| **JIM Drilldown** | `calculateJimKPIs()` | cost, impressions, clicks, signups (web), activations (web+app), installs |
| **POS Drilldown** | `calculatePosKPIs()` | cost, impressions, clicks, signups (tap+link), activations (tap+link), pos_sales, piselli_sales, piselli_percentage |
| **TAP Drilldown** | `calculateTapKPIs()` | cost, impressions, clicks, signups (tap), activations (tap), tap_cnpj_signups, cnpj_percentage, fifth_transaction |
| **LINK Drilldown** | `calculateLinkKPIs()` | cost, impressions, clicks, signups (link), activations (link) |

---

## 🧮 Regras de Negócio (Back-End)

### **1. Filtro de Produtos por Perspectiva**

**Implementado em:** `features/performance/api/queries.ts` → `fetchPerformanceData()`

| Perspectiva | Produtos Incluídos | Lógica Aplicada |
|-------------|-------------------|-----------------|
| `jim` | JIM | `WHERE product = 'JIM'` |
| `infinitepay` | POS, TAP, LINK | `WHERE product IN ('POS', 'TAP', 'LINK')` |
| `default` | POS, TAP, LINK, JIM | Sem filtro de produto |
| `cloudwalk` | POS, TAP, LINK, JIM | Sem filtro de produto |

### **2. Cálculo de Signups (por produto)**

**Implementado em:** `features/performance/utils/kpi-calculations.ts`

```typescript
// InfinitePay (POS, TAP, LINK)
signups = tap_signup + link_signup

// JIM
signups = signup_web

// POS (agregado)
signups = tap_signup + link_signup

// TAP (específico)
signups = tap_signup

// LINK (específico)
signups = link_signup
```

### **3. Cálculo de Activations (por produto)**

```typescript
// InfinitePay (POS, TAP, LINK)
activations = tap_activations + link_activations

// JIM
activations = activation_web + activation_app

// POS (agregado)
activations = tap_activations + link_activations

// TAP (específico)
activations = tap_activations

// LINK (específico)
activations = link_activations
```

### **4. Filtro de Data (Range)**

**Implementado em:** `features/performance/api/queries.ts`

| Range | Lógica SQL |
|-------|-----------|
| `yesterday` | `WHERE date = CURRENT_DATE - INTERVAL '1 day'` |
| `7d` | `WHERE date >= CURRENT_DATE - INTERVAL '7 days'` |
| `30d` | `WHERE date >= CURRENT_DATE - INTERVAL '30 days'` |
| `custom` | `WHERE date BETWEEN :from AND :to` |

---

## 🎨 Front-End (O que falta implementar)

### **❌ Problemas Atuais:**

1. **BestAds não usa critérios corretos:**
   - Atualmente: Performance Score = `(CTR * 0.5) + (Hook Rate * 0.5)`
   - **Deveria ser:** Priorizar **melhor CAC**, considerar Hook Rate e Signups

2. **BestAds não mostra visual do anúncio:**
   - Não está usando `creative_link` para exibir o criativo
   - Deveria ser similar aos cards de concorrentes (com imagem/vídeo)

3. **BestAds não permite interação:**
   - Quando clica no card, não mostra detalhes do anúncio
   - Deveria abrir um modal/drawer com todas as métricas daquele criativo

4. **Filtros de data não aplicam aos BestAds:**
   - BestAds deveria mostrar o melhor criativo **do período filtrado**
   - Exemplo: Se filtro = "ontem", mostrar melhor anúncio de ontem

### **✅ O que funciona:**

1. ✅ API retorna `creative_link` em cada anúncio
2. ✅ Filtros de data aplicam corretamente aos dados brutos
3. ✅ KPIs agregados calculados por produto
4. ✅ Regras de negócio no back-end (perspectiva → produtos)

---

## 🔧 Próximos Passos (Sugestões)

### **Fase 2.7: Refatorar BestAds (Winners)**

1. **Critérios de Ranking:**
   - Criar múltiplos critérios: "Melhor CAC", "Melhor Hook Rate", "Mais Signups"
   - Permitir alternar entre critérios na UI

2. **Visual dos Criativos:**
   - Usar `creative_link` para embedding (YouTube para GOOGLE, thumbnails para META/TikTok)
   - Layout similar aos cards de concorrentes

3. **Interação (Modal de Detalhes):**
   - Ao clicar no card, abrir modal com:
     - Visual do criativo (vídeo/imagem)
     - Todas as métricas do anúncio
     - Gráfico de performance ao longo do tempo (opcional)

4. **Filtros Aplicados:**
   - BestAds deve respeitar os filtros de data/plataforma
   - Indicar período na UI ("Melhor anúncio dos últimos 7 dias")

---

## 📊 Exemplo de Fluxo Completo

### **Cenário: Usuário acessa `/default/performance` (InfinitePay Overview)**

1. **Front-End:**
   - Detecta `perspective = "default"`
   - Determina `products = ["POS", "TAP", "LINK", "JIM"]`
   - Lê filtros da URL (`range = 7d`, `platforms = META,GOOGLE`)

2. **API Request:**
   ```
   GET /api/performance?perspective=default&products=POS,TAP,LINK,JIM&platforms=META,GOOGLE&range=7d
   ```

3. **Back-End:**
   - Executa query no Supabase:
     ```sql
     SELECT * FROM mkt_ads_looker_growth
     WHERE product IN ('POS', 'TAP', 'LINK', 'JIM')
       AND platform IN ('META', 'GOOGLE')
       AND date >= CURRENT_DATE - INTERVAL '7 days'
     ```
   - Retorna ~500 anúncios

4. **Front-End:**
   - Chama `/api/performance/kpis` para obter KPIs agregados
   - Renderiza:
     - KPI Row (métricas agregadas)
     - BestAds (1 winner por plataforma)
     - Gráficos (tendências)

---

## 🐛 Problemas Conhecidos

1. **Tabela com métricas erradas:**
   - **Causa provável:** `enrichAdData()` está calculando errado ou dados do Supabase estão inconsistentes
   - **Solução:** Logs de debug adicionados para investigar

2. **BestAds não aparecia no Overview:**
   - **Status:** ✅ Corrigido (Fase 2.6.5)

3. **Perspectivas com produtos errados:**
   - **Status:** ✅ Corrigido (Fase 2.6.4)

---

## 📞 Contato / Dúvidas

Se algo não está claro ou precisa ser ajustado, me avise! 🚀

---

**Resumo:**
- ✅ API retorna dados brutos (`/api/performance`)
- ✅ API retorna KPIs agregados (`/api/performance/kpis`)
- ✅ Regras de negócio no back-end (perspectiva → produtos)
- ❌ BestAds precisa ser refatorado (critérios + visual + interação)
- ❌ Tabela com métricas precisa ser validada




