# 🔗 N8N Webhook - Contrato de Integração

**Webhook URL:** `N8N_CREATIVE_LINK_WEBHOOK_URL` (configurar em `.env`)  
**Purpose:** Buscar creative link e preview image para anúncios META e salvar no Supabase

---

## 📋 Request (Next.js → N8N)

### **Endpoint:**
```
POST https://cloudwalk-growth.app.n8n.cloud/webhook/a5c24fb4-12df-415e-85c3-0a2e38b6f966
Content-Type: application/json
```

### **Body:**
```json
{
  "ad_id": 120211079278030050
}
```

**Parameters:**
- `ad_id` (number, required): ID do anúncio META

---

## 📦 Responsabilidades do N8N

O workflow N8N deve:

### **1. Buscar dados do anúncio no Supabase**
```sql
SELECT * FROM mkt_ads_looker WHERE ad_id = {ad_id} LIMIT 1;
```

### **2. Buscar creative link da META**
- Usar META Marketing API
- Obter URL embedável do criativo
- Exemplo: `https://www.facebook.com/ads/library/?id=123456789`

### **3. Buscar preview image/thumbnail**
- Extrair URL da imagem de preview do anúncio
- Formato: JPG, PNG ou WebP
- Tamanho recomendado: 1200x628px (ou proporção META padrão)

### **4. Salvar no Supabase**
```sql
UPDATE mkt_ads_looker
SET 
  creative_link = '{creative_link_url}',
  creative_preview_image = '{image_link_url}',  -- image_link da META
  link_updated_at = NOW()
WHERE ad_id = {ad_id};
```

**Campos a atualizar (JÁ EXISTEM no Supabase):**
- `creative_link` (TEXT): URL embedável do criativo
- `creative_preview_image` (TEXT): URL da imagem de preview (image_link)
- `link_updated_at` (TIMESTAMPTZ): Timestamp atual (para cache de 4 dias)

---

## ✅ Response (N8N → Next.js)

### **Success Response:**
```json
{
  "success": true,
  "ad_id": 120211079278030050,
  "creative_link": "https://www.facebook.com/ads/library/?id=123456789",
  "creative_preview_image": "https://scontent.xx.fbcdn.net/...",
  "saved_at": "2025-10-06T12:00:00Z"
}
```

### **Error Response:**
```json
{
  "success": false,
  "ad_id": 120211079278030050,
  "error": "META API rate limit exceeded"
}
```

**Note:** A API Next.js só verifica `success === true` para confirmar que o webhook funcionou. Os dados são buscados depois diretamente do Supabase.

---

## 🔄 Fluxo Completo

```
1. User clica em "Ver Preview" (anúncio META)
   ↓
2. Frontend chama: GET /api/performance/creative-link?ad_id=123
   ↓
3. API verifica cache no Supabase:
   - Se link_updated_at < 4 dias → retorna cached ✅
   - Se não → continua para step 4
   ↓
4. API chama N8N webhook: POST {ad_id: 123}
   ↓
5. N8N Workflow:
   a) Busca ad no Supabase
   b) Chama META API
   c) Obtém creative_link + preview_image
   d) SALVA no Supabase (UPDATE mkt_ads_looker)
   e) Retorna success: true
   ↓
6. API Next.js re-busca do Supabase (agora tem dados atualizados)
   ↓
7. API retorna para o Frontend:
   {
     creative_link: "...",
     creative_preview_image: "...",
     cached: false
   }
   ↓
8. Frontend renderiza preview
```

---

## 🗄️ Schema Supabase

### **Tabela: `mkt_ads_looker`**

**Campos utilizados (JÁ EXISTEM):**
```sql
ad_id BIGINT PRIMARY KEY
ad_name TEXT
platform TEXT
creative_id TEXT
creative_link TEXT             -- ✅ Preenchido pelo N8N
creative_preview_image TEXT    -- ✅ Preenchido pelo N8N (image_link)
link_updated_at TIMESTAMPTZ    -- ✅ Preenchido pelo N8N
```

**Nota:** Não é necessário migration. Campos já existem no banco.

---

## 🔐 Segurança

### **N8N → Supabase:**
- N8N precisa ter acesso ao Supabase Growth DB
- Configurar credenciais no N8N:
  - `SUPABASE_URL_GROWTH`
  - `SUPABASE_SERVICE_ROLE_KEY_GROWTH`

### **N8N → META API:**
- Configurar access token da META no N8N
- Permissões necessárias: `ads_read`

---

## ⚡ Performance

### **Cache:**
- Validade: 4 dias
- Link META expira: ~7 dias (conforme META docs)
- Re-fetch automático se `link_updated_at > 4 dias`

### **Timeout:**
- N8N deve responder em < 5 segundos
- Se demorar mais, configurar timeout no N8N para evitar bloqueio

---

## 🧪 Testing

### **Teste Manual (N8N):**
```bash
# Testar webhook N8N diretamente
curl -X POST https://cloudwalk-growth.app.n8n.cloud/webhook/a5c24fb4-12df-415e-85c3-0a2e38b6f966 \
  -H "Content-Type: application/json" \
  -d '{"ad_id": 120211079278030050}'

# Verificar se salvou no Supabase
SELECT ad_id, creative_link, creative_preview_image, link_updated_at
FROM mkt_ads_looker
WHERE ad_id = 120211079278030050;
```

### **Teste via Next.js API:**
```bash
# Primeira chamada (sem cache)
curl "http://localhost:3000/api/performance/creative-link?ad_id=120211079278030050"

# Segunda chamada (com cache)
curl "http://localhost:3000/api/performance/creative-link?ad_id=120211079278030050"
```

---

## 🚨 Error Handling

### **Cenários de Erro:**

1. **Ad não encontrado no Supabase**
   - N8N retorna: `{ success: false, error: "Ad not found" }`

2. **META API rate limit**
   - N8N retorna: `{ success: false, error: "Rate limit exceeded" }`
   - Next.js API retorna 500 para frontend

3. **Falha ao salvar no Supabase**
   - N8N retorna: `{ success: false, error: "Database error" }`

4. **Timeout (N8N > 10s)**
   - Next.js API retorna: `{ success: false, error: "N8N webhook timeout" }`

---

## 📊 Monitoring

### **Logs Importantes:**

**N8N deve logar:**
```
[N8N] Received request: ad_id=123
[N8N] Fetching from META API...
[N8N] META API response: 200 OK
[N8N] Saving to Supabase...
[N8N] Success: creative_link and preview_image saved
```

**Next.js API loga:**
```
🔗 [N8N Webhook] Calling: https://... with ad_id=123
✅ [N8N Webhook] Response: { success: true }
✅ [Creative Link API] N8N webhook completed, fetching updated data...
```

---

## 🔮 Exemplo de Workflow N8N

```
[1] Webhook Trigger (POST /creative-link)
    ↓
[2] Extract ad_id from body
    ↓
[3] Supabase: SELECT ad from mkt_ads_looker
    ↓
[4] IF platform != 'meta' → Return error
    ↓
[5] HTTP Request: META Marketing API
    GET https://graph.facebook.com/v18.0/{ad_id}
    ?fields=creative,thumbnail_url,preview_url
    &access_token={token}
    ↓
[6] Extract creative_link and preview_image from response
    ↓
[7] Supabase: UPDATE mkt_ads_looker
    SET creative_link = ...,
        creative_preview_image = ...,
        link_updated_at = NOW()
    WHERE ad_id = ...
    ↓
[8] Return JSON:
    {
      "success": true,
      "ad_id": ...,
      "creative_link": "...",
      "creative_preview_image": "...",
      "saved_at": "..."
    }
```

---

## 📝 Checklist de Implementação

- [ ] Criar workflow N8N
- [ ] Configurar webhook endpoint
- [ ] Adicionar nós do Supabase (SELECT e UPDATE)
- [ ] Integrar META Marketing API
- [ ] Testar com ad_id real
- [ ] Configurar error handling
- [ ] Adicionar logs
- [ ] Configurar `N8N_CREATIVE_LINK_WEBHOOK_URL` no `.env` do Next.js
- [ ] Rodar migration SQL no Supabase
- [ ] Testar fluxo completo (Frontend → API → N8N → Supabase)

---

## 🆘 Troubleshooting

### **"N8N webhook failed"**
- Verificar se `N8N_CREATIVE_LINK_WEBHOOK_URL` está configurado
- Testar webhook N8N diretamente com curl
- Verificar logs do N8N

### **"Failed to retrieve updated creative data"**
- N8N pode ter falhado em salvar no Supabase
- Verificar permissões do service role key no N8N
- Checar logs do Supabase

### **Preview image não carrega**
- URL da imagem pode ter expirado (META CDN)
- N8N precisa buscar imagem atualizada
- Verificar se `creative_preview_image` foi salvo corretamente

---

**Documentação criada:** 6 de outubro de 2025  
**Versão:** 1.0  
**Autor:** Sistema Ad Intelligence Hub
