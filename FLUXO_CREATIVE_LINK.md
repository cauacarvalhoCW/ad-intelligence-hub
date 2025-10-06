# 🔄 Fluxo Creative Link - Simplificado

## 📊 Cenário 1: BestAds (Winners) - 5 Melhores META

```
1. Frontend carrega página
   ↓
2. Identifica 5 melhores anúncios META (por CAC/Hook Rate)
   ↓
3. Para cada ad_id:
   a) Chama: GET /api/performance/creative-link?ad_id=123
   b) API verifica cache (link_updated_at < 4 dias?)
   c) Se cache válido → retorna do Supabase ✅
   d) Se cache expirado → chama N8N webhook
      ↓
   e) N8N workflow:
      - Busca META API
      - Obtém creative_link + image_link
      - SALVA no Supabase:
        UPDATE mkt_ads_looker
        SET creative_link = '...',
            creative_preview_image = '...',
            link_updated_at = NOW()
        WHERE ad_id = 123
      - Retorna success: true
      ↓
   f) API busca dados atualizados do Supabase
   g) Retorna para Frontend:
      {
        creative_link: "...",
        creative_preview_image: "...",
        cached: false
      }
   ↓
4. Frontend renderiza 5 cards com:
   - Imagem: creative_preview_image
   - Link: creative_link
   - Métricas do anúncio
```

---

## 📊 Cenário 2: Clique na Tabela - "Ver Anúncio"

```
1. User clica no botão 👁️ (Ver Anúncio) na tabela
   ↓
2. Frontend abre modal de confirmação:
   "Deseja carregar o preview deste anúncio?"
   [Cancelar] [Sim, ver preview]
   ↓
3. User clica "Sim"
   ↓
4. Frontend mostra loading (Logo Piadinha animado)
   ↓
5. Chama: GET /api/performance/creative-link?ad_id=123
   ↓
6. Mesmo fluxo do Cenário 1:
   - Verifica cache
   - Se expirado, chama N8N
   - N8N salva no Supabase
   - API busca e retorna
   ↓
7. Frontend renderiza modal com:
   - Preview do criativo (creative_preview_image)
   - Link para ver completo (creative_link)
   - Todas as métricas do anúncio
```

---

## 🗄️ Campos no Supabase (JÁ EXISTEM)

**Tabela:** `mkt_ads_looker`

| Campo | Tipo | Preenchido por | Uso |
|-------|------|----------------|-----|
| `ad_id` | BIGINT | Sistema | ID do anúncio |
| `creative_link` | TEXT | N8N | URL embedável do anúncio |
| `creative_preview_image` | TEXT | N8N | URL da imagem (thumbnail) |
| `link_updated_at` | TIMESTAMPTZ | N8N | Timestamp para cache |

**Exemplo de dados:**
```
ad_id: 120211079278030050
creative_link: https://www.facebook.com/ads/library/?id=123456789
creative_preview_image: https://scontent.xx.fbcdn.net/v/t45.1600-4/...
link_updated_at: 2025-10-06 14:30:00+00
```

---

## ⚡ Cache (4 dias)

**Por que 4 dias?**
- Links META expiram em ~7 dias
- 4 dias dá margem de segurança
- Reduz chamadas à META API (rate limits)

**Como funciona:**
```javascript
const isCacheValid = link_updated_at && (NOW() - link_updated_at) < 4 dias;

if (isCacheValid) {
  return cached_data;  // ✅ Rápido (~50ms)
} else {
  trigger_n8n();       // ⏳ Lento (~2s)
}
```

---

## 🎨 Componentes Frontend (a criar)

### **1. BestAds / Winners Component**
```tsx
// 5 melhores anúncios por plataforma
<BestAds mode="overview" />
// → Mostra 1 winner de cada: META, GOOGLE, TIKTOK

<BestAds mode="drilldown" product="TAP" />
// → Mostra top 5 de TAP, separado por plataforma
```

### **2. AdPreviewModal Component**
```tsx
// Modal que abre ao clicar "Ver Anúncio"
<AdPreviewModal
  ad={selectedAd}
  onClose={() => setSelectedAd(null)}
/>
```

**Dentro do modal:**
- Confirmação ("Deseja ver preview?")
- Loading (Logo Piadinha)
- Preview visual (creative_preview_image)
- Link externo (creative_link)
- Métricas completas

---

## 🧪 Teste Rápido

```bash
# 1. Pegar ad_id válido
# SQL no Supabase:
SELECT ad_id FROM mkt_ads_looker WHERE platform = 'meta' LIMIT 1;

# 2. Testar API
curl "http://localhost:3000/api/performance/creative-link?ad_id=SEU_AD_ID"

# 3. Verificar resposta
# Deve retornar creative_link e creative_preview_image
```

---

## ✅ Checklist

- [x] API `/api/performance/creative-link` criada
- [x] Hook `useCreativeLink` criado
- [x] Cache de 4 dias implementado
- [x] Webhook N8N configurado
- [x] Documentação completa
- [ ] Componente BestAds/Winners
- [ ] Modal de preview
- [ ] Loading state (Logo Piadinha)
- [ ] Integration com tabela

---

**Próximo:** Criar componentes visuais para renderizar os criativos! 🎨
