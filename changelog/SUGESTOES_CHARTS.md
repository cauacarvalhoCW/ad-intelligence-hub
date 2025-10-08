# 📊 Sugestões de Charts - Performance Module

**Data:** 2025-10-06  
**Status:** 💡 Planejamento

---

## 🎯 VISÃO GERAL

### **Charts Atuais:**
✅ Efficiency Chart (linha - métricas ao longo do tempo)  
✅ Cost by Platform (barras)  
✅ Cost by Product (barras)  
✅ Funnel Chart (funil de conversão)  

---

## 📊 SUGESTÕES PARA **OVERVIEW**

### **1. 🎯 ROI Comparison by Platform (Barras Horizontais Comparativas)**
**O que mostra:**
- ROI de cada plataforma lado a lado
- Fórmula: `(Ativações * Ticket Médio - Custo) / Custo * 100`

**Por que é útil:**
✅ Mostra qual plataforma dá mais retorno  
✅ Decisão rápida: onde investir mais  
✅ Visual claro (barras coloridas)  

**Exemplo:**
```
META    ████████████ 45% ROI
GOOGLE  ██████ 23% ROI
TIKTOK  ████ 12% ROI
```

---

### **2. 📈 CAC vs CPA Trend (Linha Dupla)**
**O que mostra:**
- 2 linhas: CAC e CPA ao longo do tempo
- Mostra se está ficando mais caro ativar/converter

**Por que é útil:**
✅ Identifica tendências de custo  
✅ Alerta se CAC está subindo muito  
✅ Compara custo de signup vs ativação  

**Exemplo:**
```
R$ 100 ┐      CAC ────
       │     /    \
R$ 50  │    /      \___
       │   /   CPA ─────
R$ 0   └─────────────────
       Jan  Fev  Mar  Abr
```

---

### **3. 🎨 Creative Performance Matrix (Scatter Plot)**
**O que mostra:**
- Eixo X: Hook Rate
- Eixo Y: CTR
- Tamanho da bolha: Investimento
- Cor: Plataforma

**Por que é útil:**
✅ Identifica "sweet spots" (alto hook + alto CTR)  
✅ Mostra criativos que prendem atenção  
✅ Visual para encontrar padrões  

**Exemplo:**
```
CTR 5% ┐     ⚪ (grande)
       │   ⚫  ⚪
CTR 3% │ ⚫    ⚪⚫
       │⚪  ⚫
CTR 1% └────────────────
       2%  4%  6%  8%
       Hook Rate
```

---

### **4. 📊 Budget Distribution & Performance (Donut + Barras)**
**O que mostra:**
- Donut: % de investimento por plataforma
- Barras ao lado: Performance (signups) de cada

**Por que é útil:**
✅ Mostra se investimento = resultado  
✅ Identifica desbalanceamentos  
✅ Exemplo: 60% do budget em META, mas só 30% dos signups  

**Exemplo:**
```
    META 50%        Signups: ████ 40%
    ╱─────╲         
   ╱ GOOGLE ╲       Signups: ████████ 45%
  │  30%     │      
   ╲ TIKTOK ╱       Signups: ██ 15%
    ╲─────╱  20%
```

---

### **5. ⏰ Best Time to Advertise (Heatmap)**
**O que mostra:**
- Eixo X: Hora do dia
- Eixo Y: Dia da semana
- Cor: CTR ou Conversão Rate

**Por que é útil:**
✅ Otimiza horários de veiculação  
✅ Identifica quando público está mais engajado  
✅ Pode ajustar budget por horário  

**Exemplo:**
```
Seg │░░██░░░░
Ter │░███████░
Qua │░░██████
...
    └─────────
     0h  12h  23h
    
██ = Alto CTR
░░ = Baixo CTR
```

---

### **6. 💰 Cost Efficiency Score (Gauge/Medidor)**
**O que mostra:**
- Score de 0-100 de eficiência geral
- Combina: CAC, Hook Rate, Conversion Rate, ROI

**Por que é útil:**
✅ Métrica única de "saúde" das campanhas  
✅ Fácil de entender para stakeholders  
✅ Benchmark histórico  

**Exemplo:**
```
   ╱─────╲
  │  85   │  Excelente
  │ ─┬─   │  
   ╲─────╱
   
0-60: Precisa melhorar
60-80: Bom
80-100: Excelente
```

---

## 📊 SUGESTÕES PARA **DRILLDOWN POR PRODUTO**

### **7. 🎯 Product-Specific Funnel (Funil Detalhado)**
**O que mostra:**
- Funil específico do produto (ex: POS, TAP, LINK, JIM)
- Etapas específicas: Impressão → Click → Signup → Ativação → 5 Transações

**Por que é útil:**
✅ Mostra gargalos específicos do produto  
✅ TAP pode ter funil diferente de POS  
✅ Otimiza cada etapa  

---

### **8. 📈 Campaign Performance Ranking (Tabela + Sparklines)**
**O que mostra:**
- Lista de campanhas do produto
- Colunas: Nome, Custo, Signups, CAC
- Última coluna: Mini-gráfico de tendência

**Por que é útil:**
✅ Vê performance de cada campanha  
✅ Sparklines mostram se está melhorando/piorando  
✅ Identifica campanhas para pausar/escalar  

**Exemplo:**
```
Campanha          | Custo  | CAC    | Trend
──────────────────┼────────┼────────┼──────
POS_TOFU_Jan     │ R$10k  │ R$45   │ ╱─╲
POS_MOFU_Promo   │ R$ 8k  │ R$52   │ ╲──
POS_BOFU_Retar   │ R$ 5k  │ R$38   │ ─╱─
```

---

### **9. 🔄 Retention Cohort (Heatmap por Cohort)**
**O que mostra:**
- Ativações por semana/mês
- Retenção ao longo do tempo

**Por que é útil:**
✅ Mostra se usuários ficam  
✅ Identifica cohorts melhores  
✅ Valida se CAC vale a pena  

---

### **10. 🎨 Ad Creative Breakdown (Grid de Imagens + Métricas)**
**O que mostra:**
- Grid visual dos melhores criativos do produto
- Cada card: Thumbnail + CTR + Hook Rate + Custo

**Por que é útil:**
✅ Visual rápido dos criativos  
✅ Identifica padrões visuais que funcionam  
✅ Inspira novos criativos  

---

### **11. 📊 Cost vs Signups Scatter (Dispersão)**
**O que mostra:**
- Eixo X: Custo por campanha
- Eixo Y: Signups gerados
- Linha diagonal: "Eficiência ideal"

**Por que é útil:**
✅ Campanhas acima da linha = eficientes  
✅ Abaixo da linha = gastando muito, convertendo pouco  
✅ Identifica outliers  

**Exemplo:**
```
Signups
  100 │    ⚫ (eficiente)
      │  ⚪
   50 │     ⚫⚫ 
      │ ⚪      ⚪ (ineficiente)
    0 └──────────────
      R$1k  R$5k  R$10k
           Custo
```

---

### **12. ⚡ Activation Rate by Source (Sankey Diagram)**
**O que mostra:**
- Fluxo: Plataforma → Tipo de Anúncio → Signup → Ativação
- Espessura do fluxo = volume

**Por que é útil:**
✅ Mostra todo o caminho do usuário  
✅ Identifica melhores combinações  
✅ Exemplo: "META + Video → Alta ativação"  

---

### **13. 📉 Drop-off Analysis (Funil Invertido)**
**O que mostra:**
- Onde usuários desistem no funil
- % de drop em cada etapa

**Por que é útil:**
✅ Foco em melhorar etapa com maior drop  
✅ Otimiza recursos  
✅ Validação de hipóteses  

---

### **14. 🎯 Target Audience Performance (Barras Agrupadas)**
**O que mostra:**
- Performance por segmento de público
- Grupos: 18-24, 25-34, 35-44, etc.

**Por que é útil:**
✅ Identifica melhor público para o produto  
✅ TAP pode funcionar melhor para 25-34  
✅ POS para 35+  

---

## 🌟 **CHARTS "ADVANCED" (P2/P3)**

### **15. 🤖 Predictive CAC (Machine Learning)**
**O que mostra:**
- Predição de CAC futuro baseado em tendências
- Intervalo de confiança

**Por que é útil:**
✅ Planejamento de orçamento  
✅ Alerta precoce de problemas  
✅ Decisões data-driven  

---

### **16. 🔥 Attribution Model (Sunburst Chart)**
**O que mostra:**
- Caminho de atribuição (primeiro clique, último clique, multi-touch)
- Crédito por cada touchpoint

**Por que é útil:**
✅ Entende jornada completa  
✅ Otimiza mix de canais  
✅ Valida estratégia de retargeting  

---

### **17. 💡 A/B Test Results (Boxplot Comparativo)**
**O que mostra:**
- Distribuição de performance de variantes
- Confiança estatística

**Por que é útil:**
✅ Valida testes  
✅ Mostra variabilidade  
✅ Decisões baseadas em dados  

---

## 🎯 PRIORIZAÇÃO SUGERIDA

### **SPRINT 3 - Quick Wins:**
1. ✅ **CAC vs CPA Trend** (rápido, útil)
2. ✅ **Campaign Performance Ranking** (rápido, actionable)
3. ✅ **ROI Comparison by Platform** (estratégico)

### **SPRINT 4 - Medium Priority:**
4. ⏳ **Creative Performance Matrix** (requer dados de hook rate)
5. ⏳ **Budget Distribution & Performance** (visual impactante)
6. ⏳ **Product-Specific Funnel** (crítico para drilldown)

### **SPRINT 5 - Advanced:**
7. ⏳ **Cost vs Signups Scatter** (insights profundos)
8. ⏳ **Best Time to Advertise** (otimização)
9. ⏳ **Ad Creative Breakdown** (visual rico)

---

## 📊 IMPLEMENTAÇÃO

### **Tecnologias:**
- **Recharts** (já usamos) - barras, linhas, áreas
- **Nivo** (considerar) - heatmaps, sankey, sunburst
- **D3.js** (advanced) - customizações complexas

### **Dados Necessários:**
✅ **Já temos:**
- cost, impressions, clicks, signups, activations
- platform, product, date, campaign

⏳ **Precisamos adicionar:**
- Hora do dia (timestamp)
- Segmento de público (audience_segment)
- Tipo de criativo (creative_type: video/image/carousel)
- Retention data (requer tracking adicional)

---

## 💡 RECOMENDAÇÃO FINAL

**Comece com os "Quick Wins":**
1. CAC vs CPA Trend → Mostra problemas rapidamente
2. Campaign Ranking → Decisões diárias
3. ROI by Platform → Estratégia de budget

**Dados são power:**
- 80% dos charts já podem ser feitos com dados atuais
- 20% requerem novos campos no Supabase

**Foco em actionable insights:**
- Cada chart deve responder: "O que devo fazer?"
- Evitar "vanity metrics"
- Priorizar decisões de orçamento e criativo

---

**🚀 Pronto para escolher os próximos charts?**

