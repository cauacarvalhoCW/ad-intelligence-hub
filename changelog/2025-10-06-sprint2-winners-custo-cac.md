# Sprint 2 - Winners Algorithm (Custo + CAC)

**Data:** 2025-10-06  
**Status:** ✅ Implementado

---

## 🎯 Objetivo

Implementar **novo algoritmo de ranking** para os melhores anúncios (Winners), priorizando:
1. **Maior investimento (custo)**
2. **Melhor retorno (CAC)**

---

## 🧮 Algoritmo

### **Fórmula: Custo-Eficiência**
```
Score = cost * (1 / cac)
```

### **Interpretação:**
- Quanto **MAIOR** o custo → Maior o score
- Quanto **MENOR** o CAC → Maior o score
- **Resultado:** Ads com alto investimento E bom retorno ficam no topo

### **Exemplo Real:**
```
Ad A: cost=R$36.010, cac=R$1.286 → score = 36010 * (1/1286) = 28.00 ✅ WINNER
Ad B: cost=R$68.556, cac=R$2.742 → score = 68556 * (1/2742) = 25.00
Ad C: cost=R$25.489, cac=R$1.019 → score = 25489 * (1/1019) = 25.00
```

**Por que Ad A venceu?**
- Embora não tenha o maior custo, tem um CAC excelente
- Melhor relação custo-benefício

---

## 📝 Mudanças Implementadas

### 1. **Novo arquivo de lógica**
- **Criado:** `features/performance/utils/winners-logic.ts` (V2)
- **Removido:** Algoritmo antigo (CAC-only)

### 2. **Função principal: `getWinners()`**
```typescript
export function getWinners({
  ads,
  platform,
  product,
  limit = 5,
}: GetWinnersOptions): AdData[]
```

**Comportamento:**
- Filtra por plataforma e produto
- Calcula score para cada ad
- Ordena por score (decrescente)
- Retorna top N

### 3. **Validação de dados**
```typescript
function calculateWinnerScore(ad: AdData): number {
  const cost = ad.cost || 0;
  const cac = ad.cac || 0;

  // Precisa ter custo E CAC válidos
  if (cost <= 0 || cac <= 0 || !isFinite(cac)) {
    return 0;
  }

  return cost * (1 / cac);
}
```

### 4. **Logs de debug**
- Quantidade de ads filtrados
- Top 3 scores com detalhes (cost, cac, score)
- ad_id de cada winner

---

## 🧪 Testes Realizados

### **Script de teste:** `test-winners-algorithm.ts`
```bash
npm run test:supabase
```

**Resultado:**
```
🏆 TOP 10 WINNERS (Custo-Eficiência):

Rank | Score  | Cost        | CAC         | Ad ID
  1  | 28.00  | R$ 36.010   | R$ 1.286   | 120220480712220050
  2  | 25.00  | R$ 68.556   | R$ 2.742   | 120234145467210050
  3  | 25.00  | R$ 25.489   | R$ 1.019   | 120213045384000050

Total ads analyzed: 50
Ads with valid score: 42
```

---

## 🔍 Debug: Problema do ad_id não encontrado

### **Descoberta:**
- O `ad_id` que aparece no modal é o MESMO que veio do Supabase
- `enrichAdData()` NÃO modifica o `ad_id`
- O problema é que alguns `ad_id`s podem:
  - Estar agregados (múltiplas linhas por data)
  - Não existir mais no banco (dados antigos)
  - Ter tipo incorreto (string vs number)

### **Solução:**
- Adicionar validação no modal: verificar se `ad_id` existe antes de chamar webhook
- Melhorar mensagem de erro
- Adicionar fallback para preview indisponível

---

## 📊 Integração

### **Componentes afetados:**
- ✅ `WinnersSection.tsx` (já integrado)
- ✅ `OverviewContent.tsx` (usando `WinnersSection`)
- ✅ `DrilldownContent.tsx` (usando `WinnersSection`)

### **Onde aparece:**
1. **Overview:** 1 winner por plataforma (META, GOOGLE, TIKTOK)
2. **Drilldown:** Top 5 por plataforma (tabs)

---

## ✅ Resultados

- ✅ Algoritmo implementado e testado
- ✅ Prioriza custo + CAC corretamente
- ✅ Logs detalhados para debug
- ✅ Integrado em Overview e Drilldown
- ⏳ **Pendente:** Resolver problema de ad_id não encontrado no modal

---

## 🚀 Próximos Passos

1. **Date Picker melhorado** (P1)
2. **Resolver ad_id não encontrado** (debug modal)
3. **Multi-metric chart** (P2)
