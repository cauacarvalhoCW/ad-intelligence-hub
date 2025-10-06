# 🔗 Creative Link Webhook Integration - 6 de Outubro de 2025

**Status:** ✅ Parte Backend Completa  
**Prioridade:** 🔥 P0 (Core Feature)  
**Tempo:** ~45 min

---

## 📋 Resumo

Implementada integração com webhook N8N para buscar creative links e preview images de anúncios META, com sistema de cache inteligente (4 dias).

**Arquitetura:**
- Next.js API → N8N Webhook → Supabase
- N8N faz TUDO: busca dados da META + salva no Supabase
- API Next.js apenas: verifica cache + triggera webhook + retorna dados

---

## 🎯 Problema Resolvido

**Antes:**
- ❌ Sem preview visual dos anúncios META
- ❌ Impossível ver o criativo sem sair da plataforma
- ❌ Dados de preview não persistidos

**Depois:**
- ✅ Preview visual embedado dos anúncios META
- ✅ Thumbnail/imagem de preview disponível
- ✅ Cache de 4 dias (reduz chamadas à META API)
- ✅ Sistema escalável via N8N

---

## 🏗️ Arquitetura

```
User Click → Frontend
              ↓
         GET /api/performance/creative-link?ad_id=123
              ↓
         Verifica Cache (< 4 dias?)
              ↓ (cache miss)
         POST N8N Webhook
              ↓
         N8N Workflow:
         1. Busca ad no Supabase
         2. Chama META API
         3. Obtém creative_link + preview_image
         4. SALVA no Supabase (UPDATE)
         5. Retorna success: true
              ↓
         API refetch Supabase (dados atualizados)
              ↓
         Return: {
           creative_link: "...",
           creative_preview_image: "...",
           cached: false
         }
              ↓
         Frontend renderiza preview
```

---

## 📁 Arquivos Criados

### **1. API Route**
**File:** `app/api/performance/creative-link/route.ts`

**Endpoints:**
```
GET /api/performance/creative-link?ad_id=123456789
```

**Response:**
```json
{
  "success": true,
  "ad_id": 123456789,
  "creative_link": "https://www.facebook.com/ads/library/?id=...",
  "creative_preview_image": "https://scontent.xx.fbcdn.net/...",
  "cached": false,
  "link_updated_at": "2025-10-06T12:00:00Z"
}
```

**Features:**
- ✅ Cache validation (4 dias)
- ✅ Apenas META platform
- ✅ Triggera N8N webhook
- ✅ Refetch após webhook salvar
- ✅ Error handling completo

---

### **2. React Hook**
**File:** `features/performance/hooks/useCreativeLink.ts`

**Usage:**
```tsx
const { creativeLink, previewImage, isLoading, fetchCreativeLink } = useCreativeLink();

// On user click
await fetchCreativeLink(ad.ad_id);

// Render
{creativeLink && <CreativePreview link={creativeLink} image={previewImage} />}
```

**Returns:**
- `creativeLink` (string | null)
- `previewImage` (string | null)
- `isLoading` (boolean)
- `error` (string | null)
- `isCached` (boolean)
- `fetchCreativeLink(ad_id)` (function)
- `reset()` (function)

---

### **3. TypeScript Types**
**File:** `features/performance/types/index.ts`

**Novos campos em `MktAdsLookerRow`:**
```typescript
link_updated_at: string | null;           // Timestamp para cache
creative_preview_image: string | null;    // URL da imagem de preview
```

---

### **4. SQL Migration**
**File:** `supabase-migrations/add-link-updated-at.sql`

```sql
-- Add timestamp for cache validation
ALTER TABLE mkt_ads_looker
ADD COLUMN IF NOT EXISTS link_updated_at TIMESTAMPTZ DEFAULT NULL;

-- Add preview image URL
ALTER TABLE mkt_ads_looker
ADD COLUMN IF NOT EXISTS creative_preview_image TEXT DEFAULT NULL;

-- Indexes for performance
CREATE INDEX idx_mkt_ads_looker_link_updated_at ON mkt_ads_looker(link_updated_at);
CREATE INDEX idx_mkt_ads_looker_platform_meta ON mkt_ads_looker(platform) WHERE platform = 'meta';
```

**Como rodar:**
1. Acesse Supabase Dashboard (Growth DB)
2. SQL Editor → New Query
3. Cole o SQL acima
4. Run

---

### **5. Documentação**

**API Docs:** `app/api/performance/creative-link/README.md`
- Como usar a API
- Cache settings
- Error handling
- Testing

**N8N Contract:** `app/api/performance/creative-link/N8N-CONTRACT.md`
- Request/Response format
- Responsabilidades do N8N
- Workflow exemplo
- Troubleshooting

**Env Setup:** `ENV_SETUP.md`
- Todas as variáveis de ambiente
- Verificação
- Troubleshooting

---

### **6. Scripts**

**Migration Script:** `scripts/migrate-add-link-updated-at.ts`
```bash
npm run migrate:add-link-updated-at
```
- Verifica se campo existe
- Mostra SQL se precisar rodar manualmente

**README:** `scripts/README.md`
- Como usar scripts
- Por que manual SQL

---

## ⚙️ Configuração

### **Variável de Ambiente:**
```bash
# .env.local
N8N_CREATIVE_LINK_WEBHOOK_URL=https://cloudwalk-growth.app.n8n.cloud/webhook/a5c24fb4-12df-415e-85c3-0a2e38b6f966
```

### **N8N Workflow (Responsabilidades):**
1. ✅ Receber POST com `{ ad_id: 123 }`
2. ✅ Buscar ad no Supabase (`SELECT ... WHERE ad_id = ...`)
3. ✅ Validar que é plataforma META
4. ✅ Chamar META Marketing API
5. ✅ Obter `creative_link` e `creative_preview_image`
6. ✅ Salvar no Supabase:
   ```sql
   UPDATE mkt_ads_looker
   SET creative_link = '...',
       creative_preview_image = '...',
       link_updated_at = NOW()
   WHERE ad_id = ...
   ```
7. ✅ Retornar `{ success: true }`

---

## 🧪 Testing

### **1. Testar Webhook N8N Diretamente:**
```bash
curl -X POST https://cloudwalk-growth.app.n8n.cloud/webhook/a5c24fb4-12df-415e-85c3-0a2e38b6f966 \
  -H "Content-Type: application/json" \
  -d '{"ad_id": 120211079278030050}'
```

**Expected:**
```json
{
  "success": true,
  "ad_id": 120211079278030050,
  "creative_link": "https://...",
  "creative_preview_image": "https://...",
  "saved_at": "2025-10-06T12:00:00Z"
}
```

### **2. Testar API Next.js:**
```bash
# Primeira chamada (sem cache)
curl "http://localhost:3000/api/performance/creative-link?ad_id=120211079278030050"

# Segunda chamada (com cache)
curl "http://localhost:3000/api/performance/creative-link?ad_id=120211079278030050"
```

### **3. Verificar Supabase:**
```sql
SELECT ad_id, creative_link, creative_preview_image, link_updated_at
FROM mkt_ads_looker
WHERE ad_id = 120211079278030050;
```

---

## 📊 Performance

### **Cache:**
- **Validade:** 4 dias
- **Motivo:** Links META expiram em ~7 dias
- **Hit Rate Esperado:** ~90% (mesmo anúncio visto múltiplas vezes)
- **Economia:** ~90% menos chamadas N8N/META

### **Response Times:**
- **Cached:** ~50-100ms (Supabase query)
- **Fresh:** ~1-3s (N8N webhook + META API + Supabase update)

---

## 🚀 Próximos Passos (Visual)

### **Pendente:**
1. 🎨 Modal de confirmação ("Deseja ver o preview?")
2. ⏳ Loading state (Logo Piadinha)
3. 🎠 Carrossel de melhores anúncios (5 por plataforma)
4. 🏆 Winners na Overview (5 melhores por plataforma)
5. 🎯 Winners no Drilldown (carrossel por plataforma + produto)

---

## 🔐 Segurança

- ✅ Webhook URL configurável via env var
- ✅ Server-side only (não expõe secrets)
- ✅ Validação de platform (META apenas)
- ✅ Validação de ad existence
- ✅ Error handling completo
- ✅ Logs detalhados para debug

---

## 📝 Notas Técnicas

### **Por que N8N salva no Supabase?**
- ✅ Simplifica API Next.js (só triggera + fetch)
- ✅ N8N já tem conexão com Supabase
- ✅ N8N tem acesso à META API
- ✅ Evita duplicação de lógica
- ✅ Mais fácil de debug (logs no N8N)

### **Por que cache de 4 dias?**
- Links META expiram em ~7 dias
- 4 dias garante margem de segurança
- Reduz carga na META API (rate limits)
- Melhora UX (response rápido)

### **Por que apenas META?**
- Google Ads: Não tem preview embedável via API
- TikTok: Não tem preview embedável via API
- META: Biblioteca de anúncios pública + embedável

---

## 🏁 Status Final

**Backend (Engenharia):**
- ✅ API route criada
- ✅ Hook React criado
- ✅ Types atualizados
- ✅ SQL migration pronto
- ✅ Documentação completa
- ✅ Webhook URL configurado
- ✅ Build OK

**Frontend (Visual):**
- ⏳ Aguardando implementação
- Modal de confirmação
- Loading state
- Carrossel de melhores anúncios
- Integration com BestAds component

---

**Próximo:** Implementar UI components para preview de anúncios! 🎨
