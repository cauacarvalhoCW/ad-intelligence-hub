# 🧪 Sprint 0: Teste Supabase Growth

## ✅ Arquivos Criados

1. **`lib/supabase/growth.ts`** - Cliente Supabase Growth (browser + server)
2. **`features/performance/types/index.ts`** - Types para performance data
3. **`scripts/test-supabase-growth.ts`** - Script de teste

---

## 🔧 Configuração Necessária

### 1. Criar `.env.local` (se não existir)

Crie o arquivo `.env.local` na raiz do projeto com:

```env
# Supabase Ads (existente)
NEXT_PUBLIC_SUPABASE_URL=<sua_url_ads>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<sua_key_ads>
SUPABASE_SERVICE_ROLE_KEY=<sua_service_key_ads>

# Supabase Growth (NOVO!)
NEXT_PUBLIC_SUPABASE_URL_GROWTH=<sua_url_growth>
NEXT_PUBLIC_SUPABASE_ANON_KEY_GROWTH=<sua_key_growth>
SUPABASE_SERVICE_ROLE_KEY_GROWTH=<sua_service_key_growth>

# OpenAI
OPENAI_API_KEY=<sua_key>

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<sua_key>
CLERK_SECRET_KEY=<sua_key>
```

### 2. Adicionar ao `.gitignore` (se necessário)

Verifique se `.env.local` está no `.gitignore`:

```
.env.local
.env*.local
```

---

## 🧪 Rodar Teste

### Executar Script de Teste:

```bash
# Instalar ts-node se necessário
npm install -D ts-node

# Rodar teste
npx ts-node scripts/test-supabase-growth.ts
```

### Resultado Esperado:

```
🔍 Testando conexão com Supabase Growth...

✅ Conexão OK! Total de registros: XXXX

📊 Amostra de dados (5 registros):
┌─────┬──────┬──────────────────────┬─────────┬──────────┬────────┬──────┬─────────────┬────────┐
│     │ id   │ ad_name              │ product │ platform │ date   │ cost │ impressions │ clicks │
├─────┼──────┼──────────────────────┼─────────┼──────────┼────────┼──────┼─────────────┼────────┤
│  0  │ ... │ Campaign Name...     │ TAP     │ META     │ 2024.. │ 1234 │ 50000       │ 2500   │
└─────┴──────┴──────────────────────┴─────────┴──────────┴────────┴──────┴─────────────┴────────┘

📦 Produtos disponíveis: [ 'POS', 'TAP', 'LINK', 'JIM' ]

📅 Período dos dados:
   Primeiro registro: 2024-01-01
   Último registro: 2024-10-01

✅ Todos os testes passaram!
```

---

## ✅ Validações

### O teste deve:
- [ ] Conectar com Supabase Growth sem erros
- [ ] Contar total de registros na tabela `mkt_ads_looker`
- [ ] Buscar amostra de 5 registros
- [ ] Listar produtos disponíveis (POS, TAP, LINK, JIM)
- [ ] Mostrar período dos dados (data inicial e final)

### Se houver erro:

**Erro de conexão**:
- Verificar se as variáveis de ambiente estão corretas
- Confirmar que URL e keys do Supabase Growth estão válidas

**Erro de tabela não encontrada**:
- Verificar se tabela `mkt_ads_looker` existe no banco
- Verificar permissões de acesso

**Erro de tipos**:
- Verificar se schema da tabela está correto
- Ajustar types em `features/performance/types/index.ts`

---

## 📝 Próximos Passos

**Após teste passar**:
1. ✅ Sprint 0 completo
2. → Sprint 1: Criar estrutura de rotas
3. → Sprint 2: Implementar service layer e API
4. → Sprint 3: Criar componentes UI

---

## 🔍 Debug

Se precisar debugar:

```typescript
// Verificar variáveis de ambiente
console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL_GROWTH);
console.log('Key exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY_GROWTH);

// Query customizada
const { data, error } = await supabase
  .from('mkt_ads_looker')
  .select('*')
  .eq('product', 'TAP')
  .limit(1);
```

---

**Status**: 📋 Aguardando execução do teste

