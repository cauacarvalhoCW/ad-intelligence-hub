# Documentação de Roteamento e Filtros

## 📍 Estrutura de Rotas

### Rotas Implementadas

#### 1. **Página Principal de Concorrentes**
```
/:perspectiva/concorrente
```

**Perspectivas válidas:**
- `default` - Todos os competidores
- `cloudwalk` - Perspectiva CloudWalk (todos os mercados)
- `infinitepay` - Perspectiva Brasil (PagBank, Stone, Cora, Ton, Mercado Pago, Jeitto)
- `jim` - Perspectiva Internacional (Square, PayPal, Stripe, Venmo, SumUp)

**Exemplos:**
- `/default/concorrente`
- `/cloudwalk/concorrente`
- `/infinitepay/concorrente?platform=META&search=taxas`
- `/jim/concorrente?competitors=stripe,square&assetType=video`

#### 2. **Deep Link de Anúncio**
```
/:perspectiva/concorrente/ad/:creativeId
```

Abre a página de concorrentes com o modal do anúncio específico já aberto.

**Exemplos:**
- `/infinitepay/concorrente/ad/123456789`
- `/default/concorrente/ad/987654321?search=cartão`

#### 3. **Redirects**

**De `/` para `/default/concorrente`**
- Acesso à raiz redireciona automaticamente para a perspectiva default

**De `/:perspectiva/concorrente?ad=<id>` para `/:perspectiva/concorrente/ad/<id>`**
- Compatibilidade com query param `?ad=` (redireciona para o formato de URL com segmento)

**Perspectiva inválida**
- Qualquer perspectiva não reconhecida redireciona para `/default/concorrente`

---

## 🔍 Parâmetros de Filtros na URL

Todos os filtros são sincronizados automaticamente com a URL. A URL é a **fonte da verdade** para o estado da aplicação.

### Parâmetros Suportados

| Parâmetro | Tipo | Formato | Descrição | Exemplo |
|-----------|------|---------|-----------|---------|
| `search` | string | texto livre | Busca textual em título, descrição, transcrição | `?search=taxa` |
| `competitors` | string | csv (comma-separated) | Lista de IDs de competidores | `?competitors=stone,cora,ton` |
| `platform` | string | `META` \| `GOOGLE` | Plataforma de anúncio | `?platform=META` |
| `assetType` | string | `video` \| `image` \| `text` | Tipo de mídia | `?assetType=video` |
| `dateFrom` | string | `YYYY-MM-DD` | Data inicial do período | `?dateFrom=2024-01-01` |
| `dateTo` | string | `YYYY-MM-DD` | Data final do período | `?dateTo=2024-12-31` |
| `tags` | string | csv (comma-separated) | Lista de tags | `?tags=promocao,black-friday` |
| `utm_*` | string | qualquer | Parâmetros UTM preservados | `?utm_source=email` |

### Exemplos de URLs Completas

```bash
# Busca por "cartão" na perspectiva InfinitePay
/infinitepay/concorrente?search=cartão

# Filtrar apenas vídeos do Meta
/default/concorrente?platform=META&assetType=video

# Competidores específicos + busca
/cloudwalk/concorrente?competitors=stone,ton&search=pix

# Período específico
/infinitepay/concorrente?dateFrom=2024-01-01&dateTo=2024-03-31

# Combinação de múltiplos filtros
/jim/concorrente?platform=GOOGLE&assetType=video&search=payments&competitors=stripe,square

# Deep link com filtros
/infinitepay/concorrente/ad/123456?search=cartão&platform=META
```

---

## 🔄 Sincronização URL ↔ Estado

### Comportamento

1. **Na montagem da página:**
   - Os filtros são lidos da URL
   - A UI é preenchida com os valores da URL
   - Os dados são buscados com os filtros aplicados

2. **Ao alterar um filtro na UI:**
   - A URL é atualizada imediatamente (sem reload)
   - Os dados são refetchados automaticamente
   - O histórico do navegador é preservado

3. **Ao navegar pelo histórico (voltar/avançar):**
   - Os filtros são sincronizados com a URL
   - A UI reflete o estado da URL
   - Os dados são refetchados

4. **Ao clicar em um anúncio:**
   - A URL muda para `/:perspectiva/concorrente/ad/:creativeId`
   - O modal abre com os detalhes do anúncio
   - Os filtros permanecem na URL

5. **Ao fechar o modal:**
   - A URL volta para `/:perspectiva/concorrente`
   - Os filtros continuam preservados

### Debounce

- **Busca textual (search)**: debounce de 250ms
- **Outros filtros**: atualização imediata

---

## 🎨 Preservação Visual

**Todas as implementações foram feitas sem alterar:**
- ✅ CSS classes existentes
- ✅ Tailwind config
- ✅ Tokens de tema (cores, espaçamentos, tipografia)
- ✅ Estrutura DOM
- ✅ Layout visual
- ✅ Componentes UI (shadcn/ui)

**Apenas mudanças de lógica:**
- Roteamento baseado em URL params dinâmicos
- Sincronização de estado com URL
- Hook customizado `useUrlFilters`

---

## 🔧 Implementação Técnica

### Arquivos Criados

```
app/
├── [perspectiva]/
│   └── concorrente/
│       ├── page.tsx                      # Página principal
│       └── ad/
│           └── [creativeId]/
│               └── page.tsx              # Página com deep link
├── page.tsx                              # Redirect de / para /default/concorrente

hooks/
└── useUrlFilters.ts                      # Hook de sincronização URL ↔ Estado
```

### Arquivos Modificados

```
components/
├── ad-dashboard.tsx                      # Aceita props: perspectiva, creativeId, searchParams
└── ad-filters.tsx                        # Aceita prop: initialFilters

app/
└── (protected)/
    └── page.tsx                          # Redirect para nova estrutura
```

### Hook `useUrlFilters`

```typescript
const { 
  filters,         // Estado atual dos filtros
  updateFilters,   // Atualizar filtros (com debounce para search)
  openAd,          // Abrir modal de anúncio (muda URL)
  closeAd,         // Fechar modal (muda URL)
  clearFilters     // Limpar todos os filtros (preserva UTMs)
} = useUrlFilters({ perspectiva, creativeId, searchParams });
```

---

## ✅ Critérios de Aceite

### PROMPT 1 - Roteamento
- ✅ Rotas `/:perspectiva/concorrente` implementadas e funcionais
- ✅ Deep link `/ad/:creativeId` funcional
- ✅ Compatibilidade com `?ad=<id>` (redireciona para segmento)
- ✅ Redirect de `/` para `/default/concorrente`
- ✅ Perspectiva inválida redireciona para `/default/concorrente`
- ✅ Nenhuma alteração de estilos/design
- ✅ URL sincronizada com modal (abrir/fechar)
- ✅ UTMs preservados nas navegações

### PROMPT 2 - Filtros
- ✅ URL é a fonte da verdade
- ✅ Filtros sincronizados com URL (leitura e escrita)
- ✅ Debounce de 250ms na busca textual
- ✅ Filtros aplicados corretamente nos dados
- ✅ Botão "Limpar" mantém UTMs e ad aberto
- ✅ Nenhuma alteração de estilos/design
- ✅ Parâmetros documentados neste arquivo

---

## 🚀 Próximos Passos (Futuro)

1. **Paginação na URL**: adicionar `?page=2`
2. **Ordenação**: adicionar `?sort=ctr:desc`
3. **Tab ativa**: adicionar `?tab=analytics`
4. **Fetch único do anúncio**: quando deep link não estiver na página atual
5. **Histórico de busca**: salvar buscas recentes no localStorage

---

## 📝 Commits

Seguindo **Conventional Commits**:

```
feat(routing): implement dynamic routing by perspective and ad deep links
feat(filters): sync filters with URL query params
feat(url-state): create useUrlFilters hook for URL synchronization
refactor(dashboard): integrate URL-based state management
docs(routing): add comprehensive routing and filters documentation
```

---

## 🆘 Troubleshooting

### Filtros não aplicam
- Verifique se a URL contém os parâmetros corretos
- Abra o DevTools e veja os logs do console

### Modal não abre no deep link
- Confirme que o `creativeId` é válido
- Verifique se o anúncio existe na página atual

### Perspectiva não funciona
- Use apenas: `default`, `cloudwalk`, `infinitepay`, `jim`
- Outras perspectivas redirecionam para `default`

### UTMs se perdem
- Reporte como bug - UTMs devem ser preservados sempre

---

**Data de implementação:** 2025-10-02  
**Versão:** 1.0.0

