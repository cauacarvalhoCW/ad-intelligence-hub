# ⚠️ Problema: Dados de Conversão Ausentes no Supabase

**Data:** 3 de outubro de 2025  
**Prioridade:** 🔥 P0 (Crítico)  
**Status:** ⏳ Aguardando ETL/Pipeline de Dados

---

## 🐛 Problema Identificado

Os campos de **conversão** na tabela `mkt_ads_looker_growth` estão **NULL** para a maioria dos registros:

```sql
SELECT 
  date,
  product,
  platform,
  ad_name,
  cost,
  impressions,
  clicks,
  "tap signup",        -- ❌ NULL
  "tap activations",   -- ❌ NULL
  signup_web,          -- ❌ NULL
  activation_app,      -- ❌ NULL
  link_signup,         -- ❌ NULL
  link_activations,    -- ❌ NULL
  pos_sales,           -- ❌ NULL
  piselli_sales        -- ❌ NULL
FROM mkt_ads_looker_growth
WHERE date >= '2025-09-26'
LIMIT 100;
```

**Resultado dos logs:**
```javascript
// Amostra de dados brutos (primeiros 3 registros):
tap signup: null
tap activations: null
signup_web: null
activation_app: null
link_signup: null
link_activations: null
pos_sales: 0
piselli_sales: 0
```

---

## 💥 **Impacto:**

### 1. **KPIs Incorretos:**
- ✅ **Custo:** R$ 48.899,30 (OK)
- ✅ **Impressões:** 3.662.426 (OK)
- ✅ **Clicks:** 24.935 (OK)
- ❌ **Signups:** 78 (deveria ser milhares!)
- ❌ **Ativações:** 31 (deveria ser centenas!)
- ❌ **CAC:** Não pode ser calculado (precisa de ativações > 0)
- ❌ **CPA:** Não pode ser calculado (precisa de signups > 0)

### 2. **BestAds Vazio:**
- BestAds filtra por `ad.cac > 0`
- Nenhum anúncio tem CAC válido (porque `activations = 0`)
- Resultado: **"Nenhum dado disponível"** ❌

### 3. **Análise Incompleta:**
- Impossível identificar anúncios com melhor performance
- Impossível calcular ROI/ROAS
- Dashboard fica com métricas superficiais (apenas CTR, CPM)

---

## 🔍 **Causa Raiz (Possíveis):**

### **Opção 1: Pipeline de ETL Ausente**
- Os dados de conversão não estão sendo importados do sistema de origem (CRM, Analytics, etc.)
- Precisa configurar pipeline ETL para puxar dados de:
  - TAP Signup/Activations
  - LINK Signup/Activations
  - POS Sales
  - Piselli Sales
  - Web/App Signups
  - Installs

### **Opção 2: Join Incorreto na View**
- A view `mkt_ads_looker_growth` pode estar fazendo JOIN com tabela errada
- Ou o JOIN não está encontrando correspondência (`LEFT JOIN` retornando NULL)

### **Opção 3: Nomenclatura de Campos**
- Os campos têm **espaços** nos nomes (ex: `"tap signup"`)
- Isso pode causar problemas em queries/joins

---

## ✅ **Solução Temporária Implementada (Front-End):**

### **1. Fallback para Hook Rate quando CAC não existe:**
```typescript
// Se nenhum anúncio tem CAC válido, usar Hook Rate + CTR como proxy
if (adsWithCAC.length === 0) {
  return [...ads].sort((a, b) => {
    const scoreA = (a.hook_rate || 0) * 0.6 + (a.ctr || 0) * 0.4;
    const scoreB = (b.hook_rate || 0) * 0.6 + (b.ctr || 0) * 0.4;
    return scoreB - scoreA;
  });
}
```

### **2. Indicação Visual de "Sem dados":**
```tsx
{ad.cac > 0 ? (
  <span>R$ {ad.cac}</span>
) : (
  <span className="text-muted-foreground">Sem dados</span>
)}
```

### **3. Warnings no Console:**
```javascript
⚠️ [BestAds] Nenhum anúncio com CAC válido. Usando Hook Rate como fallback.
⚠️ [BestAds] Nenhum anúncio com signups válidos. Usando impressões como fallback.
```

---

## 🚀 **Solução Definitiva (Back-End):**

### **Passo 1: Verificar Pipeline ETL**
```bash
# Verificar se existem dados de conversão na origem
SELECT COUNT(*) 
FROM source_conversions_table 
WHERE date >= '2025-09-01';

# Verificar se o ETL está rodando
SELECT last_run, status 
FROM etl_jobs 
WHERE job_name = 'conversions_sync';
```

### **Passo 2: Corrigir View/Join**
```sql
-- Verificar se o JOIN está correto
SELECT 
  a.ad_id,
  a.date,
  a.cost,
  a.impressions,
  c."tap signup",        -- Dados de conversão
  c."tap activations"
FROM mkt_ads_looker_base a
LEFT JOIN conversions_table c 
  ON a.ad_id = c.ad_id 
  AND a.date = c.date    -- ← JOIN por data também?
WHERE a.date >= '2025-09-26'
LIMIT 10;
```

### **Passo 3: Renomear Campos (Remover Espaços)**
```sql
-- Melhor prática: Campos sem espaços
ALTER TABLE conversions_table 
  RENAME COLUMN "tap signup" TO tap_signup;

ALTER TABLE conversions_table 
  RENAME COLUMN "tap activations" TO tap_activations;

-- Etc...
```

---

## 📊 **Comparação: Com vs Sem Dados**

| Métrica | Com Dados (Esperado) | Sem Dados (Atual) |
|---------|----------------------|-------------------|
| Signups | 2.326 | 78 ❌ |
| Ativações | 932 | 31 ❌ |
| CAC | R$ 52,41 | NULL ❌ |
| CPA | R$ 21,23 | R$ 626,91 ❌ |
| BestAds | 3 winners | "Nenhum dado" ❌ |
| Análise | Completa | Superficial ❌ |

---

## 🎯 **Ação Necessária:**

**Para o time de Dados/Engenharia:**
1. ✅ Verificar pipeline ETL de conversões
2. ✅ Validar JOINs na view `mkt_ads_looker_growth`
3. ✅ Garantir que dados de conversão sejam populados
4. ✅ (Opcional) Renomear campos para remover espaços

**Enquanto isso (Front-End):**
- ✅ Fallback para Hook Rate está funcionando
- ✅ UI mostra "Sem dados" onde apropriado
- ✅ Dashboard continua funcional (com limitações)

---

## 🔗 **Links Úteis:**

- **Fase 2.7 Summary:** `features/performance/FASE_2_7_SUMMARY.md`
- **API Docs:** `features/performance/API_DOCUMENTATION.md`
- **Changelog:** `changelog/README.md`

---

**Status:** ⏳ **Aguardando correção do pipeline de dados no back-end**




