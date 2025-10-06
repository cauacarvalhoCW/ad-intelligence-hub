# 🧪 Teste de Integração - Creative Link Webhook

**Flow Simplificado:**
1. Busca 5 melhores anúncios META (Winners)
2. Para cada ad_id → chama webhook N8N
3. N8N busca META API + salva no Supabase
4. API Next.js busca do Supabase e retorna
5. Frontend renderiza creative_link + preview image

**Campos no Supabase (JÁ EXISTEM):**
- `creative_link` - URL do anúncio
- `creative_preview_image` - URL da imagem de preview  
- `link_updated_at` - Timestamp para cache

---

## 📝 Checklist

- [ ] Server Next.js rodando (`npm run dev`)
- [ ] N8N workflow ativo
- [ ] ad_id válido obtido do Supabase
- [ ] `.env.local` configurado com webhook URL

---

## **Passo 1: Obter ad_id válido**

**SQL no Supabase (Growth DB):**
```sql
SELECT ad_id, ad_name, platform, creative_link, link_updated_at
FROM mkt_ads_looker
WHERE platform = 'meta'
  AND ad_id IS NOT NULL
LIMIT 10;
```

**Resultado esperado:**
```
ad_id              | ad_name                        | platform | creative_link | link_updated_at
120211079278030050 | META_TAP_WEB_TOFU_CONVERSION... | meta     | null          | null
```

✅ **Copie um `ad_id` da lista**

---

## **Passo 2: Testar API Next.js (Terminal)**

### **Opção A: Via curl (recomendado)**

```bash
# Substituir {AD_ID} pelo ad_id real
curl -v "http://localhost:3000/api/performance/creative-link?ad_id={AD_ID}"
```

**Exemplo:**
```bash
curl -v "http://localhost:3000/api/performance/creative-link?ad_id=120211079278030050"
```

### **Opção B: Via navegador**

Abra no navegador:
```
http://localhost:3000/api/performance/creative-link?ad_id=120211079278030050
```

---

## **Passo 3: Analisar Logs**

### **A. Logs do Next.js (Terminal)**

Você deve ver algo como:

```
🔗 [N8N Webhook] Calling: https://cloudwalk-growth.app.n8n.cloud/webhook/... with ad_id=120211079278030050
✅ [N8N Webhook] Response: { success: true }
✅ [Creative Link API] N8N webhook completed, fetching updated data...
✅ [Creative Link API] Successfully fetched and returned new data for ad: 120211079278030050
```

**Ou (se já existe cache):**
```
✅ [Creative Link API] Using cached data for ad: 120211079278030050
```

### **B. Logs do N8N (Dashboard N8N)**

1. Acesse: https://cloudwalk-growth.app.n8n.cloud
2. Vá no workflow do creative-link
3. Veja "Executions" (últimas execuções)
4. Verifique se apareceu a chamada com o `ad_id`

**O que verificar:**
- ✅ Status: Success
- ✅ Recebeu o `ad_id` correto
- ✅ Buscou dados da META API
- ✅ Salvou no Supabase (UPDATE)

---

## **Passo 4: Verificar Supabase**

Agora vamos confirmar que o N8N salvou os dados:

```sql
-- Rode no Supabase SQL Editor (Growth DB)
SELECT 
  ad_id, 
  ad_name,
  platform,
  creative_link,
  creative_preview_image,
  link_updated_at
FROM mkt_ads_looker
WHERE ad_id = 120211079278030050;  -- Substituir pelo ad_id testado
```

**Resultado esperado (ANTES do teste):**
```
creative_link:        null
creative_preview_image: null
link_updated_at:      null
```

**Resultado esperado (DEPOIS do teste):**
```
creative_link:        https://www.facebook.com/ads/library/?id=...
creative_preview_image: https://scontent.xx.fbcdn.net/...
link_updated_at:      2025-10-06 14:30:00+00
```

✅ **Se os campos foram preenchidos → Sucesso!**

---

## **Passo 5: Testar Cache (2ª chamada)**

Rode o curl novamente com o **mesmo ad_id**:

```bash
curl -v "http://localhost:3000/api/performance/creative-link?ad_id=120211079278030050"
```

**Resultado esperado:**
```json
{
  "success": true,
  "ad_id": 120211079278030050,
  "creative_link": "https://...",
  "creative_preview_image": "https://...",
  "cached": true,  ← DEVE SER TRUE
  "link_updated_at": "2025-10-06T14:30:00Z"
}
```

**Logs esperados:**
```
✅ [Creative Link API] Using cached data for ad: 120211079278030050
```

✅ **Se "cached": true e não chamou N8N → Cache funcionando!**

---

## **Passo 6: Response da API**

### **Response esperado (1ª chamada - sem cache):**

```json
{
  "success": true,
  "ad_id": 120211079278030050,
  "creative_link": "https://www.facebook.com/ads/library/?id=123456789",
  "creative_preview_image": "https://scontent.xx.fbcdn.net/v/t45.1600-4/...",
  "cached": false,
  "link_updated_at": "2025-10-06T14:30:00.000Z"
}
```

### **Response esperado (2ª chamada - com cache):**

```json
{
  "success": true,
  "ad_id": 120211079278030050,
  "creative_link": "https://www.facebook.com/ads/library/?id=123456789",
  "creative_preview_image": "https://scontent.xx.fbcdn.net/v/t45.1600-4/...",
  "cached": true,  ← MUDOU PARA TRUE
  "link_updated_at": "2025-10-06T14:30:00.000Z"
}
```

---

## 🚨 **Troubleshooting**

### **Erro: "Ad not found"**
```json
{
  "success": false,
  "error": "Ad not found"
}
```

**Solução:**
- ✅ Verificar se o `ad_id` existe no Supabase
- ✅ Usar outro ad_id da query do Passo 1

---

### **Erro: "Creative link webhook only available for META platform"**
```json
{
  "success": false,
  "error": "Creative link webhook only available for META platform"
}
```

**Solução:**
- ✅ O ad_id é de um anúncio Google ou TikTok
- ✅ Usar um ad_id com `platform = 'meta'`

---

### **Erro: "Failed to fetch creative data from N8N"**
```json
{
  "success": false,
  "error": "Failed to fetch creative data from N8N"
}
```

**Possíveis causas:**
1. N8N workflow não está ativo
   - ✅ Ativar workflow no N8N Dashboard

2. N8N retornou erro
   - ✅ Verificar logs no N8N (Executions)
   - ✅ Ver qual step falhou

3. Webhook URL incorreto
   - ✅ Verificar `N8N_CREATIVE_LINK_WEBHOOK_URL` no `.env.local`

4. N8N timeout
   - ✅ META API pode estar lenta
   - ✅ Tentar novamente

---

### **Cache não está funcionando (sempre "cached": false)**

**Possível causa:** Campo `link_updated_at` não está sendo preenchido pelo N8N

**Solução:**
- ✅ Verificar no N8N se o workflow está salvando `link_updated_at = NOW()`
- ✅ Verificar no Supabase se o campo existe e aceita TIMESTAMPTZ

---

## ✅ **Checklist Final**

Após o teste, verifique:

- [ ] API Next.js retornou `"success": true`
- [ ] Logs do Next.js mostram "N8N webhook completed"
- [ ] N8N Dashboard mostra execução com status "Success"
- [ ] Supabase tem `creative_link` e `creative_preview_image` preenchidos
- [ ] Supabase tem `link_updated_at` com timestamp
- [ ] Segunda chamada retorna `"cached": true`
- [ ] Segunda chamada não chama N8N (verificar logs)

---

## 🎯 **Teste Real no Frontend**

Depois que o backend funcionar, testar no frontend:

```tsx
// Exemplo de uso
const { creativeLink, previewImage, isLoading, fetchCreativeLink } = useCreativeLink();

// On button click
await fetchCreativeLink(120211079278030050);

// Render
{creativeLink && (
  <div>
    <img src={previewImage} alt="Preview" />
    <a href={creativeLink} target="_blank">Ver anúncio completo</a>
  </div>
)}
```

---

**Boa sorte! Se algo der errado, manda print dos logs! 🚀**
