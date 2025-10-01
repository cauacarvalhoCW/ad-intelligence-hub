# AUDIT REPORT — espiadinha V3 (Fase 1: Roteamento)

**Data**: 2025-09-30  
**Escopo**: Auditoria completa antes do refactor de roteamento para perspectivas

---

## 1. Stack & Entrypoints

### Framework & Versões
- **Framework**: Next.js **15.2.4** (App Router)
- **React**: v19
- **TypeScript**: v5
- **Routing**: **Next.js App Router** (file-based, pasta `/app`)
- **Auth**: Clerk v6.31.10
- **State**: React Context + Local State (sem Redux/Zustand)
- **Styling**: Tailwind CSS v4.1.9 + CSS Variables (temas dinâmicos)
- **UI Components**: Radix UI + shadcn/ui

### Entrypoints
```
app/
├── layout.tsx                    # Root layout (ClerkProvider + ThemeProvider)
├── (protected)/
│   ├── layout.tsx               # Protected layout (auth check + Header)
│   └── page.tsx                 # 🎯 PÁGINA PRINCIPAL (renders AdDashboard)
├── access-denied/page.tsx
├── sign-in/[[...sign-in]]/page.tsx
├── sign-up/[[...sign-up]]/page.tsx
└── api/
    ├── ads/route.ts
    ├── analytics/route.ts
    ├── chat/route.ts
    └── competitors/route.ts
```

**Build Config**:
- `next.config.mjs`: Ignora erros de ESLint e TypeScript durante build
- Imagens não otimizadas (`unoptimized: true`)

---

## 2. Rotas Atuais

### Estrutura de Rotas (App Router)

| Rota | Componente/Ação | Auth | Descrição |
|------|----------------|------|-----------|
| `/` | → Protected layout | ✅ | Redirecionado para sign-in se não autenticado |
| `/(protected)/` | `AdDashboard` | ✅ | **Página principal** (módulo Concorrente) |
| `/(protected)/protected` | Página de teste protegida | ✅ | Página de debug/teste |
| `/sign-in/[[...sign-in]]` | Clerk Sign In | ❌ | Login |
| `/sign-up/[[...sign-up]]` | Clerk Sign Up | ❌ | Cadastro |
| `/access-denied` | Página de acesso negado | ❌ | Erro de permissão |
| `/api/ads` | API route | ✅ | Busca anúncios do Supabase |
| `/api/analytics` | API route | ✅ | Analytics de anúncios |
| `/api/competitors` | API route | ✅ | Lista competidores |
| `/api/chat` | API route | ✅ | Chat com IA (LangChain) |

**Observações importantes**:
- ✅ App Router file-based (Next.js 13+)
- ✅ Route Groups com `(protected)` para layout condicional
- ✅ Middleware do Clerk protege rotas automaticamente
- ❌ **Não há roteamento por perspectiva ainda**
- ❌ **Não há deep linking para anúncios**

---

## 3. Concorrente: Localização e Abertura

### Localização do Módulo

**Arquivo principal**: `/components/ad-dashboard.tsx` (694 linhas)

**Renderizado em**: `app/(protected)/page.tsx`

```tsx
// app/(protected)/page.tsx
export default function HomePage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <Suspense fallback={<LogoLoading />}>
        <AdDashboard />  // 🎯 MÓDULO CONCORRENTE
      </Suspense>
    </main>
  );
}
```

### Estrutura do AdDashboard

```tsx
// components/ad-dashboard.tsx (simplificado)
export function AdDashboard() {
  // ESTADO LOCAL (não está na URL!)
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: "",
    selectedCompetitors: [],
    selectedPlatform: "all",
    selectedAdType: "all",
    dateRange: "all",
    dateFrom: "",
    dateTo: "",
    tags: [],
  });

  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);  // 🚨 State local
  const [currentPage, setCurrentPage] = useState(1);

  const { currentTheme } = useTheme();  // Tema via Context (localStorage)

  // Busca ads com filtros
  const { ads, loading, error, pagination } = useAds({
    perspective: currentTheme,
    page: currentPage,
    limit: 24,
    filters: { ...filters }
  });

  return (
    <>
      {/* Filtros */}
      <AdFilters competitors={competitors} onFiltersChange={setFilters} />

      {/* Tabs: Anúncios | Analytics | Competitivo | Tendências */}
      <Tabs defaultValue="ads">
        <TabsContent value="ads">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ads.map((ad) => (
              <AdCard 
                key={ad.ad_id}
                ad={ad} 
                onClick={() => setSelectedAd(ad)}  // 🚨 Abre via state local
              />
            ))}
          </div>
        </TabsContent>
        {/* ... outras tabs ... */}
      </Tabs>

      {/* 🎯 MODAL/OVERLAY DO ANÚNCIO (CRIATIVO ISOLADO) */}
      {selectedAd && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedAd(null)}  // 🚨 Fecha via state local
        >
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Detalhes do anúncio */}
            <CardHeader>
              <CardTitle>{selectedAd.product}</CardTitle>
              <Button onClick={() => setSelectedAd(null)}>✕</Button>
            </CardHeader>
            <CardContent>
              {/* Mídia, análise, transcrição, etc. */}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
```

### Abertura do Criativo (ATUAL)

**Método**: State local `selectedAd` com overlay `position: fixed`

**Problemas para roteamento**:
- ❌ **Sem URL deep link** - não há como compartilhar link direto para um anúncio
- ❌ **State é perdido** ao recarregar página
- ❌ **Não funciona com back/forward** do navegador
- ❌ **Não é rastreável** por analytics/UTMs

**Componente do card**:
```tsx
// features/ads/components/AdCard.tsx
<AdCard 
  ad={ad}
  onClick={() => setSelectedAd(ad)}  // Callback que seta o state
/>
```

---

## 4. Estado & Filtros

### Gestão de Estado Atual

#### Perspectiva/Tema

**Localização**: `components/theme-provider.tsx`

```tsx
// Context React com localStorage
const CorporateThemeContext = createContext<...>();

export function useTheme() {
  return {
    currentTheme: corporateTheme,      // 'default' | 'cloudwalk' | 'infinitepay' | 'jim' | 'dark'
    setTheme: setCorporateTheme,
    themes,
    competitorScope,                    // Competidores filtrados por tema
  };
}

// Persistência via localStorage
localStorage.setItem("edge-intelligence-theme", theme);
```

**Perspectivas disponíveis** (em `/lib/themes.ts`):
- `default` - Todos os competidores
- `cloudwalk` - BR + US (global)
- `infinitepay` - BR: PagBank, Stone, Cora, Ton, Mercado Pago, Jeitto
- `jim` - US: Square, PayPal, Stripe, Venmo, SumUp
- `dark` - Modo escuro (não é perspectiva de negócio)

#### Filtros

**Localização**: State local no `AdDashboard`

**Estrutura** (tipo `FilterState`):
```typescript
{
  searchTerm: string;              // Busca textual
  selectedCompetitors: string[];   // IDs de competidores
  selectedPlatform: string;        // "all" | "META" | "GOOGLE"
  selectedAdType: string;          // "all" | "video" | "image"
  dateRange: string;               // "all" | "7d" | "30d" | "90d"
  dateFrom: string;                // ISO date
  dateTo: string;                  // ISO date
  tags: string[];                  // Array de tags
}
```

**Aplicação**: Passados para o hook `useAds()` que faz a chamada API

#### Anúncio Selecionado

**Localização**: State local `selectedAd: Ad | null`

**Problema**: ❌ **Não está na URL**

#### Paginação

**Localização**: State local `currentPage: number`

**Problema**: ❌ **Não está na URL** (perdida ao recarregar)

---

### ❌ O que NÃO está na URL (problemas atuais)

| Estado | Onde vive | Problema |
|--------|-----------|----------|
| Perspectiva | localStorage + Context | Não compartilhável |
| Filtros | State local | Links não restauram filtros |
| Anúncio aberto | State local | Deep link impossível |
| Página atual | State local | Navegação perdida |
| UTMs | Não gerenciado | Sem rastreamento |

---

## 5. Riscos Técnicos

### 🔴 Riscos Altos

1. **Perspectiva no localStorage**
   - **Problema**: Tema atual vive em `localStorage`, não na URL
   - **Impacto**: Links compartilhados abrem com tema errado
   - **Solução**: Mover perspectiva para URL (`/:perspectiva/...`)

2. **Filtros em state local**
   - **Problema**: `AdDashboard` não lê/escreve filtros na URL
   - **Impacto**: Filtros perdidos ao compartilhar link ou recarregar
   - **Solução**: Sync bidirecional com query params

3. **Anúncio aberto via state**
   - **Problema**: `selectedAd` é apenas local
   - **Impacto**: Impossível deep link direto para um anúncio
   - **Solução**: Criar rota `/ad/:creativeId` e sync com state

4. **Dependência de `useTheme()` hook**
   - **Problema**: AdDashboard depende de Context para `currentTheme`
   - **Impacto**: Precisamos injetar perspectiva via props/route param
   - **Solução**: Passar `perspective` como prop (fonte: URL)

### 🟡 Riscos Médios

5. **Paginação não persistida**
   - **Problema**: `currentPage` só em state
   - **Solução**: Adicionar `?page=N` na URL

6. **Componente `AdDashboard` monolítico**
   - **Problema**: 694 linhas, muita responsabilidade
   - **Solução**: Criar wrapper que gerencia URL, manter AdDashboard "burro"

7. **Header troca tema via dropdown**
   - **Problema**: Header usa `setTheme()` do Context
   - **Impacto**: Precisa navegar para nova rota em vez de só setar state
   - **Solução**: Trocar `setTheme()` por `router.push(/:perspectiva/...)`

### 🟢 Riscos Baixos

8. **Lazy imports**
   - Nenhum risco - componentes já são client components

9. **Suposições de caminho base**
   - Nenhum hardcoded path detectado

10. **Build config**
    - `ignoreBuildErrors: true` pode esconder erros novos
    - **Solução**: Rodar `tsc --noEmit` manualmente antes do commit

---

## 6. Arquivos a Tocar no Refactor

### 📝 Criar Novos

```
app/
├── [perspectiva]/                     # 🆕 Dynamic route segment
│   └── concorrente/
│       ├── page.tsx                   # 🆕 Rota principal /infinitepay/concorrente
│       ├── layout.tsx                 # 🆕 Layout para perspectiva (opcional)
│       └── ad/
│           └── [creativeId]/
│               └── page.tsx           # 🆕 Deep link /infinitepay/concorrente/ad/123

lib/
└── utils/
    └── url-sync.ts                    # 🆕 Utilitários para query params e UTMs

components/
└── ConcorrenteWrapper.tsx             # 🆕 Wrapper que gerencia URL sync
```

### ✏️ Modificar Existentes

```
app/
├── layout.tsx                         # Ajustar redirect se necessário
├── (protected)/
│   ├── page.tsx                       # Redirect para /default/concorrente
│   └── layout.tsx                     # Manter ou mover para [perspectiva]

components/
├── ad-dashboard.tsx                   # Tornar "burro" (receber props em vez de hooks)
├── header.tsx                         # Trocar setTheme() por router.push()
└── theme-provider.tsx                 # Sync tema com URL param (opcional)

middleware.ts                          # Adicionar validação de perspectiva (se necessário)
```

### ❌ NÃO Tocar

```
features/                              # Lógica de domínio - sem mudanças
lib/themes.ts                          # Definições de tema - sem mudanças
shared/ui/                             # Componentes UI - sem mudanças
app/api/                               # API routes - sem mudanças
```

---

## 7. Mapa de Navegação Proposto

### Antes (Atual)

```
/                           → Protected layout → AdDashboard
  └─ Tema: localStorage
  └─ Filtros: state local
  └─ Anúncio: state local (modal overlay)
```

### Depois (V3)

```
/                                              → Redirect → /default/concorrente

/:perspectiva/concorrente                      → ConcorrenteWrapper → AdDashboard
  ├─ default/concorrente
  ├─ cloudwalk/concorrente
  ├─ infinitepay/concorrente
  └─ jim/concorrente
      └─ ?search=tap&platform=META&competitors=abc,def&utm_source=email
          └─ Todos os filtros na URL

/:perspectiva/concorrente/ad/:creativeId       → ConcorrenteWrapper → AdDashboard (com modal aberto)
  └─ infinitepay/concorrente/ad/123456789
      └─ ?search=tap&utm_campaign=promo
          └─ Deep link + filtros preservados
```

### Compatibilidade Legado

```
/:perspectiva/concorrente?ad=123               → Redirect (replace) → /:perspectiva/concorrente/ad/123
```

---

## 8. Gaps & Decisões Necessárias

### Decisões de Arquitetura

1. **Perspectiva na URL OU no Context?**
   - ✅ **Recomendado**: URL como fonte da verdade
   - ❌ **Evitar**: Manter apenas no Context (não compartilhável)

2. **Wrapper vs. Refactor completo?**
   - ✅ **Recomendado**: Criar `ConcorrenteWrapper` que gerencia URL
   - ✅ **Manter**: `AdDashboard` burro (recebe props)
   - ❌ **Evitar**: Reescrever AdDashboard do zero (muito risco)

3. **Redirect na raiz?**
   - ✅ **Sim**: `/` → `/default/concorrente` (conforme prompt)
   - ✅ **Sim**: `/invalid-theme/concorrente` → `/default/concorrente`

4. **Modal ou route?**
   - ✅ **Ambos**: Manter modal visual + adicionar route para deep link
   - Técnica: Parallel Routes ou Intercepting Routes (Next.js)

5. **UTMs como middleware?**
   - ❌ **Não**: Middleware é server-side, UTMs são client-side
   - ✅ **Sim**: Utilitário client-side que preserva UTMs ao navegar

---

## 9. Checklist de Validação

Antes de começar o refactor, confirmar:

- [x] Next.js App Router identificado
- [x] AdDashboard localizado (`components/ad-dashboard.tsx`)
- [x] State de anúncio aberto (`selectedAd`) mapeado
- [x] Filtros atuais documentados
- [x] Perspectivas válidas listadas (4: default, cloudwalk, infinitepay, jim)
- [x] Header de troca de tema identificado
- [x] Riscos técnicos avaliados
- [x] Arquivos a tocar listados
- [x] Dev server funcionando (`npm run dev`)
- [x] Build passando (`npm run build`)

---

## 10. Próximos Passos (PROMPT 2)

Com base nesta auditoria, o **PROMPT 2** deve:

1. ✅ Criar rotas dinâmicas `/[perspectiva]/concorrente`
2. ✅ Implementar deep link `/[perspectiva]/concorrente/ad/[creativeId]`
3. ✅ Criar wrapper `ConcorrenteWrapper` para sync URL ↔ State
4. ✅ Modificar `Header` para navegar em vez de `setTheme()`
5. ✅ Adicionar utils para query params e UTMs
6. ✅ Implementar redirects (`/` e perspectiva inválida)
7. ✅ Manter 100% das classes CSS/estilos existentes
8. ✅ Testar manualmente todas as rotas

---

**Status**: ✅ Auditoria completa - Pronto para PROMPT 2
