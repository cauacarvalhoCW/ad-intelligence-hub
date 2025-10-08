# 🔧 Correções Urgentes - Performance Module

**Data:** 2025-10-07  
**Status:** ✅ Parcialmente implementado

---

## ✅ CORREÇÕES IMPLEMENTADAS

### 1. **Instalações (JIM) agora aparecem nas tabelas**
- Antes: Instalações não eram exibidas
- Agora: Coluna "Instalações" aparece corretamente em tabelas do JIM
- Ordem: Custo → Impressões → Clicks → **Instalações** → Signups → Ativações

### 2. **Totalizadores completos**
- Adicionados ao footer das tabelas:
  - ✅ Custo, Impressões, Clicks, Signups, Ativações
  - ✅ Instalações (JIM)
  - ✅ Vendas POS/Piselli (POS)
  - ✅ CNPJ Signups, 5ª Transação (TAP)

### 3. **Filtros View/Dimensão removidos do Overview**
- **Antes:** Apareciam no Overview (errado)
- **Agora:** Só aparecem nas páginas de produto (drilldown)
- Overview mostra apenas: Período, Plataformas, Busca

### 4. **Métricas organizadas por produto**
**JIM:**
- Custo, Impressões, Clicks, **Instalações**, Signups, Ativações
- CTR, Hook Rate, CPC, CPM, CVR, CAC

**POS:**
- Custo, Impressões, Clicks, Signups, Ativações
- CTR, Hook Rate, CPC, CPM, CVR, CAC
- Vendas POS, % Piselli

**TAP:**
- Custo, Impressões, Clicks, Signups, Ativações
- CTR, Hook Rate, CPC, CPM, CVR, CAC
- Signups CNPJ, % CNPJ, 5ª Transação

---

## ⚠️ PROBLEMAS REPORTADOS (AINDA NÃO CORRIGIDOS)

### 1. **Anúncios fantasma / Dados inválidos**
**Problema:** Aparecendo anúncios de datas que não existem (ex: dia 30/09)
**Possíveis causas:**
- Dados incorretos no Supabase
- Falta de validação de data na query
- Agregação incorreta

**Ação necessária:**
```sql
-- Verificar no Supabase:
SELECT date, COUNT(*) 
FROM mkt_ads_looker 
WHERE date IS NULL OR date > CURRENT_DATE
GROUP BY date;
```

### 2. **Signup e Ativação não aparecem no Overview de JIM**
**Problema:** Overview da perspectiva JIM não mostra Signup/Ativação nos KPIs
**Solução:** Verificar `KpiRow.tsx` para garantir que essas métricas aparecem

### 3. **Soma/Agregação não funciona como pedido**
**Problema:** User mencionou que "não está somando" corretamente
**Verificar:**
- Se a agregação em `aggregation-v2.ts` está correta
- Se os totais do footer refletem a soma real
- Se há algum filtro sendo aplicado incorretamente

---

## 🚧 PENDÊNCIAS

### 1. **Charts simples no Overview** (CRÍTICO)
**O que fazer:**
Adicionar 4 charts de linha simples no Overview:
- **CTR ao longo do tempo**
- **CPM ao longo do tempo**
- **CVR ao longo do tempo**
- **Hook Rate ao longo do tempo**

**Onde:** `components/OverviewContent.tsx`

**Exemplo de código:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <SimpleMetricChart data={efficiencyData} metric="ctr" label="CTR" />
  <SimpleMetricChart data={efficiencyData} metric="cpm" label="CPM" />
  <SimpleMetricChart data={efficiencyData} metric="cvr" label="CVR" />
  <SimpleMetricChart data={efficiencyData} metric="hook_rate" label="Hook Rate" />
</div>
```

### 2. **Validação de datas**
Adicionar filtro para remover dados com datas inválidas:
```typescript
// Em aggregation-v2.ts ou queries.ts
const validAds = ads.filter(ad => {
  if (!ad.date) return false;
  const date = new Date(ad.date);
  const now = new Date();
  return date <= now && date >= new Date('2020-01-01');
});
```

### 3. **Debug de dados fantasma**
Adicionar logging para identificar origem dos dados inválidos:
```typescript
console.log('🔍 [DEBUG] Ads with invalid dates:', 
  ads.filter(ad => !ad.date || new Date(ad.date) > new Date())
);
```

---

## 📊 ESTRUTURA ATUAL

### **Overview (Visão Geral)**
```
┌─────────────────────────────────┐
│ 📊 Performance Geral            │
├─────────────────────────────────┤
│ Filtros:                        │
│ - Período (7d, 30d, custom)     │
│ - Plataformas (META, GOOGLE)    │
│ - Busca (ad/campanha)           │
├─────────────────────────────────┤
│ KPIs Agregados                  │
│ Winners por Plataforma          │
│ Charts:                         │
│ - Efficiency (linha)            │
│ - Cost by Platform (barras)     │
│ - Cost by Product (barras)      │
│ - Funnel (funil)                │
└─────────────────────────────────┘

🚧 FALTAM: Charts CTR, CPM, CVR, Hook Rate
```

### **Produto (Drilldown)**
```
┌─────────────────────────────────┐
│ 📊 POS / TAP / LINK / JIM       │
├─────────────────────────────────┤
│ Filtros:                        │
│ - Período                       │
│ - Plataformas                   │
│ - Busca                         │
│ - ✅ View (Ad/Campaign)         │
│ - ✅ Dimensão (Total/Diarizada) │
├─────────────────────────────────┤
│ KPIs Específicos                │
│ Tabela 1 (por Criativo)         │
│ ├─ Footer com TOTAL             │
│ └─ Paginação (20 itens)         │
│                                 │
│ Charts Taxonomia (se Total)     │
│                                 │
│ Tabela 2 (Criativo+Campanha)    │
│ ├─ Footer com TOTAL             │
│ └─ Paginação (20 itens)         │
│                                 │
│ Charts Performance              │
│ Winners por Plataforma          │
└─────────────────────────────────┘
```

---

## 🧪 PARA TESTAR

```bash
# 1. Iniciar servidor
npm run dev

# 2. Testar JIM Overview
http://localhost:3000/jim/performance
# Verificar: Signup e Ativação aparecem nos KPIs?

# 3. Testar JIM Drilldown
http://localhost:3000/jim/performance/jim
# Verificar: Coluna "Instalações" aparece na tabela?

# 4. Verificar totalizadores
# Em qualquer produto, ir até o final da tabela
# Verificar: Footer mostra "TOTAL (página atual)" com todas as métricas?

# 5. Verificar Overview
http://localhost:3000/default/performance
# Verificar: Filtros View/Dimensão NÃO aparecem (apenas Período/Plataformas/Busca)?
```

---

## 📝 PRÓXIMOS PASSOS

1. **Criar `SimpleMetricChart.tsx`** para charts do Overview
2. **Adicionar validação de datas** na query do Supabase
3. **Verificar KPIs de JIM** no Overview
4. **Investigar dados fantasma** (dia 30/09)
5. **Testar soma/agregação** em todas as perspectivas

---

**🔥 CRÍTICO:** Implementar charts simples no Overview (CTR, CPM, CVR, Hook Rate)

