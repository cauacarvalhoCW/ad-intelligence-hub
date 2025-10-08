# ⚙️ Environment Variables Setup

## 🚀 Quick Start

Crie um arquivo `.env.local` na raiz do projeto com estas variáveis:

```bash
# ============================================
# N8N WEBHOOK (CLOUDWALK GROWTH)
# ============================================
N8N_CREATIVE_LINK_WEBHOOK_URL=https://cloudwalk-growth.app.n8n.cloud/webhook/a5c24fb4-12df-415e-85c3-0a2e38b6f966

# ============================================
# SUPABASE GROWTH (PERFORMANCE DATA)
# ============================================
NEXT_PUBLIC_SUPABASE_URL_GROWTH=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY_GROWTH=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY_GROWTH=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ============================================
# CLERK AUTHENTICATION
# ============================================
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# ============================================
# OPENAI (CHATBOT)
# ============================================
OPENAI_API_KEY=sk-...
```

---

## 📝 Variáveis Detalhadas

### **N8N_CREATIVE_LINK_WEBHOOK_URL**
- **Purpose:** Webhook para buscar creative links e preview images dos anúncios META
- **Value:** `https://cloudwalk-growth.app.n8n.cloud/webhook/a5c24fb4-12df-415e-85c3-0a2e38b6f966`
- **Used by:** `/api/performance/creative-link`

### **SUPABASE_SERVICE_ROLE_KEY_GROWTH**
- **Purpose:** Service role key para acessar o banco Growth (mkt_ads_looker)
- **Security:** ⚠️ NUNCA commitar no Git
- **Used by:** Server-side API routes

### **NEXT_PUBLIC_SUPABASE_URL_GROWTH**
- **Purpose:** URL pública do projeto Supabase Growth
- **Format:** `https://xxx.supabase.co`
- **Used by:** Client e Server

### **CLERK Keys**
- **Purpose:** Autenticação de usuários
- **Dashboard:** https://dashboard.clerk.com

### **OPENAI_API_KEY**
- **Purpose:** Chatbot com LangChain
- **Dashboard:** https://platform.openai.com

---

## ✅ Verificação

Após configurar o `.env.local`, verifique se tudo está funcionando:

```bash
# 1. Rodar dev server
npm run dev

# 2. Testar API de creative link
curl "http://localhost:3000/api/performance/creative-link?ad_id=120211079278030050"

# 3. Verificar logs
# Deve aparecer: ✅ [Creative Link API] Using cached data
# ou: 🔄 [Creative Link API] Triggering N8N webhook
```

---

## 🔐 Segurança

- ✅ `.env.local` está no `.gitignore`
- ✅ Nunca commitar secrets no código
- ✅ Usar Service Role Key apenas no servidor
- ✅ ANON KEY é segura para client-side

---

## 🆘 Troubleshooting

### **"N8N_CREATIVE_LINK_WEBHOOK_URL not configured"**
- Adicione a variável no `.env.local`
- Reinicie o servidor (`npm run dev`)

### **"Failed to fetch creative data from N8N"**
- Verifique se o webhook N8N está ativo
- Teste com curl (ver comando acima)
- Verifique logs do N8N

### **"Ad not found"**
- ad_id não existe no Supabase
- Use um ad_id válido para testes

---

**Última atualização:** 6 de outubro de 2025
