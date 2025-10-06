# Winners UI Upgrade - Cards Estilo Concorrentes

**Data:** 2025-10-06  
**Status:** ✅ Implementado

---

## 🎨 Objetivo

Melhorar a UI dos WinnerCards para ficar **igual aos cards dos concorrentes**, com:
- **Preview embedado direto no card** (não precisa clicar)
- **YouTube embed** para Google ads
- **Thumbnail** para Meta ads (via webhook)
- **Modal expandido** com métricas completas

---

## ✨ Features Implementadas

### 1. **WinnerCard V2 - Rich UI**

#### **Preview Visual Grande (264px)**
```typescript
<div className="relative bg-gray-100 dark:bg-gray-900 h-64 overflow-hidden">
  {youtubeId && <iframe .../>}       // Google: YouTube embed
  {previewImage && <img .../>}       // Meta: Thumbnail
  {loadingCreative && <Loader2 .../>} // Loading state
</div>
```

#### **Badges e Rankings**
- Rank badge (#1, #2, #3...)
- Winner badge (destaque amber)
- Platform badge
- Product badge

#### **Métricas em Grid**
- CAC (destacado em verde)
- Hook Rate
- Signups
- CTR
- Investimento
- Impressões

#### **Botão "Ver detalhes"**
- Overlay no preview
- Abre modal expandido

---

### 2. **WinnerModal - Expandido (Estilo Concorrentes)**

Similar ao modal de `ad-dashboard.tsx`:

#### **Preview Grande (500px)**
```typescript
// Google: YouTube embed
<iframe src={`https://www.youtube.com/embed/${youtubeId}`} className="h-[500px]" />

// Meta: Embedded creative (se disponível)
<iframe src={creativeLink} className="h-[500px]" />

// Meta: Image preview (fallback)
<img src={previewImage} className="max-h-[500px]" />

// TikTok: Placeholder (futuro)
<div>TikTok Ad - Preview em breve</div>
```

#### **Seções Organizadas**
1. **📊 Métricas de Performance** (grid 2x4)
   - Investimento, CAC, Impressões, Clicks
   - CTR, Hook Rate, Signups, Ativações
   - CPM, CPA

2. **ℹ️ Informações do Anúncio**
   - Ad ID, Campaign ID
   - Data, Plataforma, Produto

3. **Link Externo**
   - "Ver na Meta Ads Library" (botão grande)

---

### 3. **useWinnersCreativeLinks Hook**

**Pré-carrega creative_links automaticamente:**

```typescript
// Quando winners são calculados:
const allWinners = [...META, ...GOOGLE, ...TIKTOK];

// Hook faz fetch automático (só META):
useWinnersCreativeLinks(allWinners);
```

**Comportamento:**
1. Filtra winners META
2. Para cada um, chama `/api/performance/creative-link?ad_id=X`
3. Armazena em cache local (state)
4. Disponibiliza `creative_link`, `image_preview_link`, `loading`, `error`

**Cache structure:**
```typescript
{
  [ad_id]: {
    creative_link: string | null,
    image_preview_link: string | null,
    loading: boolean,
    error: string | null
  }
}
```

---

### 4. **WinnersSection - Integração**

**Overview:** 1 winner por plataforma com preview embedado
```typescript
const { creativeLink, previewImage, loading } = getCreativeData(winner);

<WinnerCard
  ad={winner}
  badge="META Winner"
  creativeLink={creativeLink}
  previewImage={previewImage}
  loadingCreative={loading}
/>
```

**Drilldown:** Top 5 em tabs com preview
```typescript
{winners.META.map((ad, index) => {
  const { creativeLink, previewImage, loading } = getCreativeData(ad);
  return <WinnerCard ... />;
})}
```

---

## 🎯 Comportamento por Plataforma

### **META**
✅ Pré-carrega `creative_link` via webhook automaticamente  
✅ Mostra `image_preview_link` (thumbnail) no card  
✅ Loading state enquanto busca  
✅ Modal com iframe embedado (se `creative_link` disponível)  

### **GOOGLE**
✅ Extrai YouTube ID de `creative_link`  
✅ Embeda YouTube direto no card  
✅ Modal com YouTube em tela cheia  

### **TIKTOK**
⏳ Placeholder preparado  
⏳ Preview em breve (aguardando API)  

---

## 📊 Loading States

### **Card Loading:**
```
┌─────────────────────────┐
│ #1  [Winner Badge]      │
├─────────────────────────┤
│                         │
│    [Spinner Icon]       │
│  Carregando preview...  │
│                         │
├─────────────────────────┤
│ Métricas (grid 2x3)     │
└─────────────────────────┘
```

### **Modal Loading:**
- Skeleton para métricas
- Spinner para preview

---

## 🎨 Design System

### **Colors:**
```typescript
META:   border-blue-500/30   bg-blue-500/5
GOOGLE: border-green-500/30  bg-green-500/5
TIKTOK: border-pink-500/30   bg-pink-500/5
```

### **Badges:**
- Rank: `secondary` (gray)
- Winner: `amber-500` (golden)
- Platform: `outline` (border)

### **Metrics:**
- Background: `background/80` or `background/40` (dark)
- Highlight: `text-green-600` (CAC)

---

## 📝 Arquivos Criados/Modificados

### **Novos:**
```
features/performance/
├── hooks/useWinnersCreativeLinks.ts  (pré-carrega creative links)
└── components/
    └── WinnerModal.tsx               (modal expandido)
```

### **Modificados:**
```
features/performance/components/
├── WinnerCard.tsx          (UI rica + preview embedado)
└── WinnersSection.tsx      (integra hook + passa props)
```

---

## ✅ Resultados

✅ Cards com preview embedado (igual concorrentes)  
✅ YouTube funciona direto no card (Google)  
✅ Meta pré-carrega creative_link automaticamente  
✅ Loading states elegantes  
✅ Modal expandido com métricas completas  
✅ Design responsivo (grid adaptativo)  
✅ Dark mode support  

---

## 🚀 Como Testar

1. **Abrir Overview:**
   ```
   http://localhost:3000/default/performance
   ```

2. **Ver Winners:**
   - 3 cards grandes com preview embedado
   - Meta: Thumbnail ou loading
   - Google: YouTube direto
   - TikTok: Placeholder

3. **Clicar "Ver detalhes":**
   - Modal expandido abre
   - Preview grande (500px)
   - Métricas completas
   - Link para Meta Ads Library

4. **Abrir Drilldown:**
   ```
   http://localhost:3000/default/performance/tap
   ```
   - Top 5 em tabs
   - Previews embedados em todos

---

## 📊 Performance

**Pré-carregamento:**
- Apenas winners META (5 max no Overview, 15 max no Drilldown)
- Fetch paralelo (todos ao mesmo tempo)
- Cache local evita re-fetch

**Exemplo de logs:**
```
🔗 [useWinnersCreativeLinks] Pré-carregando 3 creative links
✅ [useWinnersCreativeLinks] Loaded ad_id=120220480712220050
✅ [useWinnersCreativeLinks] Loaded ad_id=120234145467210050
⚠️ [useWinnersCreativeLinks] Failed ad_id=120231678130100160: Ad not found
```

---

## 🐛 Known Issues

⚠️ **Ad not found:** Alguns `ad_id`s podem não existir no Supabase (dados agregados/antigos)  
✅ **Solução:** Hook trata erro graciosamente, mostra placeholder  

⏳ **TikTok:** API não disponível ainda  
✅ **Solução:** Placeholder preparado para futuro  

---

## 🎯 Próximos Passos

1. ✅ ~~Winners UI rica~~
2. ⏳ Date Picker melhorado (P1)
3. ⏳ Resolver validação de ad_id
4. ⏳ TikTok preview API
