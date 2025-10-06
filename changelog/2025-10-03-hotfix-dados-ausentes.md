# Hotfix: Dados de Conversão Ausentes - Fallback para Hook Rate 🐛🔧

**Data:** 3 de outubro de 2025  
**Tipo:** Hotfix / Workaround  
**Prioridade:** 🔥 P0 (Crítico)  
**Status:** ✅ Solução Temporária Aplicada | ⏳ Aguardando Fix no Back-End

---

## 🐛 Problema Identificado

Os campos de **conversão** na tabela `mkt_ads_looker_growth` estão **NULL** para a maioria dos registros:

```javascript
// Dados brutos do Supabase:
tap signup: null        // ❌
tap activations: null   // ❌
signup_web: null        // ❌
activation_app: null    // ❌
link_signup: null       // ❌
link_activations: null  // ❌
pos_sales: 0            // ❌
piselli_sales: 0        // ❌
```

**Impacto:**
- `signups = 0` → CAC/CPA não podem ser calculados
- BestAds filtra por `cac > 0` → Nenhum anúncio tem CAC válido
- Resultado: **"Nenhum dado disponível"** ❌

---

## ✅ Solução Temporária (Front-End)

### **1. Fallback para Hook Rate quando CAC não existe**

```typescript
// Antes (❌):
return [...ads]
  .filter(ad => ad.cac > 0)  // ← Nenhum anúncio passa!
  .sort((a, b) => a.cac - b.cac);

// Depois (✅):
const adsWithCAC = [...ads].filter(ad => ad.cac > 0);

if (adsWithCAC.length > 0) {
  // Se houver anúncios com CAC, usar CAC
  return adsWithCAC.sort((a, b) => a.cac - b.cac);
} else {
  // FALLBACK: Usar Hook Rate + CTR como proxy
  console.warn("⚠️ Nenhum anúncio com CAC válido. Usando Hook Rate como fallback.");
  return [...ads].sort((a, b) => {
    const scoreA = (a.hook_rate || 0) * 0.6 + (a.ctr || 0) * 0.4;
    const scoreB = (b.hook_rate || 0) * 0.6 + (b.ctr || 0) * 0.4;
    return scoreB - scoreA;
  });
}
```

### **2. Fallback para Impressões quando Signups = 0**

```typescript
// Critério "Mais Signups":
const adsWithSignups = [...ads].filter(ad => (ad.signups || 0) > 0);

if (adsWithSignups.length > 0) {
  return adsWithSignups.sort((a, b) => b.signups - a.signups);
} else {
  // FALLBACK: Usar impressões como proxy de escala
  console.warn("⚠️ Nenhum anúncio com signups válidos. Usando impressões como fallback.");
  return [...ads].sort((a, b) => b.impressions - a.impressions);
}
```

### **3. Indicação Visual de "Sem dados"**

```tsx
{/* CAC */}
{ad.cac > 0 ? (
  <span className="font-semibold text-blue-600">
    {formatCurrency(ad.cac)}
  </span>
) : (
  <span className="text-muted-foreground">Sem dados</span>
)}

{/* Signups */}
{ad.signups > 0 ? (
  <span className="font-semibold text-green-600">
    {formatNumber(ad.signups)}
  </span>
) : (
  <span className="text-muted-foreground">Sem dados</span>
)}
```

---

## 📊 Resultado

### **Antes (Fase 2.7):**
```
┌─────────────────────────────┐
│  🏆 Top Winners por         │
│      Plataforma             │
├─────────────────────────────┤
│                             │
│  🏆 Nenhum dado disponível  │
│                             │
└─────────────────────────────┘
```

### **Depois (Hotfix):**
```
┌─────────────────────────────────┐
│  🏆 Top Winners por Plataforma  │
│  ⚠️ Usando Hook Rate (Fallback) │
├─────────────────────────────────┤
│  🥇 GOOGLE                      │
│  Hook Rate: 40.99%              │
│  CAC: Sem dados                 │
│  Signups: Sem dados             │
│  CTR: 1.07%                     │
│  Impressões: 1,681              │
├─────────────────────────────────┤
│  🥈 META                        │
│  Hook Rate: 73.98%              │
│  ...                            │
└─────────────────────────────────┘
```

---

## 🎯 Critérios de Ranking (Atualizados)

| Critério | Lógica Principal | Fallback |
|----------|------------------|----------|
| **Melhor CAC** | `sort by CAC (asc)` | `Hook Rate * 0.6 + CTR * 0.4` |
| **Melhor Hook Rate** | `sort by Hook Rate (desc)` | Nenhum (sempre disponível) |
| **Mais Signups** | `sort by Signups (desc)` | `sort by Impressões (desc)` |

---

## 📝 Arquivos Modificados

- `features/performance/components/BestAds.tsx` - Adicionado fallback e indicação "Sem dados"
- `features/performance/DADOS_AUSENTES.md` - Documentação do problema (NOVO)
- `changelog/2025-10-03-hotfix-dados-ausentes.md` - Este arquivo

---

## ⚠️ Limitações da Solução Temporária

1. **Não é ideal:** Hook Rate não é um proxy perfeito para CAC
2. **Dados incompletos:** UI mostra "Sem dados" onde apropriado
3. **Análise limitada:** Impossível calcular ROI/ROAS real sem conversões

---

## 🚀 Ação Necessária (Back-End)

**Para o time de Dados/Engenharia:**

### **Passo 1: Verificar Pipeline ETL**
```sql
-- Verificar se existem dados de conversão na tabela de origem
SELECT 
  COUNT(*) as total_records,
  COUNT("tap signup") as tap_signups_count,
  COUNT("tap activations") as tap_activations_count
FROM source_conversions_table 
WHERE date >= '2025-09-01';
```

### **Passo 2: Validar VIEW/JOIN**
```sql
-- Verificar se o JOIN está correto
SELECT 
  a.ad_id,
  a.date,
  a.cost,
  c."tap signup",        -- ← Deve vir da tabela de conversões
  c."tap activations"
FROM mkt_ads_looker_base a
LEFT JOIN conversions_table c 
  ON a.ad_id = c.ad_id 
  AND a.date = c.date    -- ← JOIN por data também?
WHERE a.date >= '2025-09-26'
LIMIT 10;
```

### **Passo 3: Popular Dados Ausentes**
- Rodar backfill do ETL para datas recentes
- Garantir que pipeline está sincronizando conversões diariamente

---

## 🔗 Links Úteis

- **Documentação do Problema:** `features/performance/DADOS_AUSENTES.md`
- **API Docs:** `features/performance/API_DOCUMENTATION.md`
- **Fase 2.7:** `changelog/2025-10-03-fase-2-7-bestads-visual-criteria.md`

---

## 🎯 Status Final

- ✅ **Front-End:** Fallback implementado, UI funcional
- ⏳ **Back-End:** Aguardando correção do pipeline de dados
- 📊 **Dashboard:** Funcional com limitações (mostra "Sem dados" onde apropriado)

**Commit sugerido:** `hotfix(performance): add fallback for missing conversion data in BestAds`




