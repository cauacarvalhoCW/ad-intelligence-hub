# REFACTOR PLAN — Fase 1: Roteamento por Perspectivas

**Branch**: `feat/spiadinha-v3-routing-phase1`

---

## 1. Arquivos a Criar

### 1.1 Rotas Principais (Next.js App Router)

```
app/
├── [perspectiva]/                                    # 🆕 Dynamic segment
│   ├── concorrente/
│   │   ├── page.tsx                                 # 🆕 Rota /:perspectiva/concorrente
│   │   └── ad/
│   │       └── [creativeId]/
│   │           └── page.tsx                         # 🆕 Rota /:perspectiva/concorrente/ad/:creativeId
│   └── layout.tsx                                   # 🆕 Layout com auth (opcional)
```

**Responsabilidades**:
- `[perspectiva]/concorrente/page.tsx`:
  - Validar perspectiva válida (default|cloudwalk|infinitepay|jim)
  - Redirecionar perspectiva inválida → `/default/concorrente`
  - Sincronizar `?ad=<id>` → `/ad/:creativeId` (redirect replace)
  - Renderizar `<ConcorrentePageWrapper />`

- `[perspectiva]/concorrente/ad/[creativeId]/page.tsx`:
  - Mesma validação de perspectiva
  - Renderizar `<ConcorrentePageWrapper initialAdId={creativeId} />`

- `[perspectiva]/layout.tsx`:
  - Autenticação (reusar lógica de `(protected)/layout.tsx`)
  - Header comum

### 1.2 Wrapper de Sincronização URL ↔ State

```
components/
└── ConcorrentePageWrapper.tsx                       # 🆕 Client component
```

**Responsabilidades**:
- Ler perspectiva da URL
- Ler filtros da query string
- Ler `initialAdId` dos params (se rota `/ad/:id`)
- Sincronizar tema via `useTheme()` com perspectiva da URL
- Passar tudo como props para `<AdDashboard />`
- Escutar mudanças de filtros/ad e atualizar URL via `useRouter()`
- Preservar UTMs durante navegação

### 1.3 Utilitários

```
lib/
└── utils/
    └── url-params.ts                                # 🆕 Funções helper
```

**Funções**:
```typescript
// Parse filtros da query string
parseFiltersFromURL(searchParams: URLSearchParams): FilterState

// Converte filtros para query string
buildFilterQuery(filters: FilterState, preserveUTMs?: URLSearchParams): string

// Preserva UTMs ao navegar
preserveUTMParams(currentParams: URLSearchParams, newParams: Record<string, string>): URLSearchParams

// Valida perspectiva
isValidPerspective(slug: string): slug is Perspective
```

---

## 2. Arquivos a Modificar

### 2.1 Root Redirect

```
app/
└── page.tsx                                         # ✏️ Modificar
```

**Mudança**:
```tsx
// ANTES: Renderiza algo ou depende de (protected)
// DEPOIS:
import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/default/concorrente');
}
```

### 2.2 AdDashboard - Tornar Controlável

```
components/
└── ad-dashboard.tsx                                 # ✏️ Modificar
```

**Mudanças**:
1. Adicionar props opcionais:
```typescript
interface AdDashboardProps {
  // Props de controle (quando usado via URL wrapper)
  externalPerspective?: ThemeType;
  externalFilters?: FilterState;
  externalSelectedAdId?: string | null;
  onPerspectiveChange?: (p: ThemeType) => void;
  onFiltersChange?: (f: FilterState) => void;
  onAdSelect?: (id: string | null) => void;
}

export function AdDashboard(props: AdDashboardProps = {}) {
  // Use props.external* quando disponível, senão state local
  const perspective = props.externalPerspective || useTheme().currentTheme;
  const [localFilters, setLocalFilters] = useState(DEFAULT_FILTERS);
  const filters = props.externalFilters || localFilters;
  
  // ... resto do código
}
```

2. Ao mudar filtro/ad, chamar callback se existir:
```typescript
const handleFilterChange = (newFilters: FilterState) => {
  if (props.onFiltersChange) {
    props.onFiltersChange(newFilters);  // Wrapper atualiza URL
  } else {
    setLocalFilters(newFilters);        // Modo standalone
  }
};
```

3. **PRESERVAR 100% dos estilos/classes existentes**

### 2.3 Header - Navegar em vez de setTheme()

```
components/
└── header.tsx                                       # ✏️ Modificar
```

**Mudanças**:
1. Importar `useRouter` e `usePathname`:
```typescript
import { useRouter, usePathname } from 'next/navigation';
```

2. Trocar `setTheme()` por navegação:
```typescript
// ANTES:
onClick={() => {
  setTheme(option.id as ThemeType);
  setIsDropdownOpen(false);
}}

// DEPOIS:
const router = useRouter();
const pathname = usePathname();

onClick={() => {
  // Detectar se está em rota de perspectiva
  const match = pathname.match(/^\/([^/]+)\/concorrente/);
  if (match) {
    // Preservar resto da URL
    const newPath = pathname.replace(match[1], option.id);
    router.push(newPath);
  } else {
    // Fallback: navegar para nova perspectiva
    router.push(`/${option.id}/concorrente`);
  }
  setIsDropdownOpen(false);
}}
```

3. **PRESERVAR todos os estilos/dropdown**

### 2.4 Legacy Protected Page

```
app/
└── (protected)/
    └── page.tsx                                     # ✏️ Modificar
```

**Mudança**:
```tsx
// ANTES: <AdDashboard />
// DEPOIS:
import { redirect } from 'next/navigation';

export default function LegacyHomePage() {
  redirect('/default/concorrente');
}
```

---

## 3. Arquivos NÃO Tocar (Preservar)

```
❌ features/                    # Lógica de domínio
❌ lib/themes.ts                # Definições (apenas ler)
❌ shared/ui/                   # Componentes UI
❌ app/api/                     # API routes
❌ styles/                      # CSS global
❌ tailwind.config.js           # Config Tailwind
❌ components/ad-filters.tsx    # Filtros (apenas consumir)
```

---

## 4. Fluxo de Dados (URL → State)

```
┌─────────────────────────────────────────────────────────┐
│ URL: /infinitepay/concorrente?search=tap&platform=META  │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ [perspectiva]/concorrente/page.tsx (Server Component)   │
│ - params.perspectiva = "infinitepay"                    │
│ - searchParams.search = "tap"                           │
│ - searchParams.platform = "META"                        │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ ConcorrentePageWrapper (Client Component)               │
│ - Valida perspectiva                                    │
│ - Parse filtros: parseFiltersFromURL(searchParams)      │
│ - Sync tema: setTheme(perspectiva)                      │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ AdDashboard (Client Component)                          │
│ - Recebe: externalPerspective="infinitepay"            │
│ - Recebe: externalFilters={search:"tap", platform:...}  │
│ - Usa filtros para buscar ads via useAds()             │
└─────────────────────────────────────────────────────────┘
```

---

## 5. Fluxo de Dados (State → URL)

```
User clica em filtro → AdDashboard.onFiltersChange()
                                      │
                                      ▼
            ConcorrentePageWrapper.handleFiltersChange()
                                      │
                                      ▼
              buildFilterQuery(filters, preserveUTMs)
                                      │
                                      ▼
            router.push(/infinitepay/concorrente?search=novo)
                                      │
                                      ▼
                              URL atualizada
                                      │
                                      ▼
                Re-render com novos searchParams
```

---

## 6. Compatibilidade Legado (`?ad=`)

### Cenário: `GET /infinitepay/concorrente?ad=123456789`

```typescript
// Em [perspectiva]/concorrente/page.tsx
export default function ConcorrentePage({ params, searchParams }) {
  const adId = searchParams.ad;
  
  if (adId) {
    // Preservar outros params (filtros, UTMs)
    const { ad, ...rest } = searchParams;
    const query = new URLSearchParams(rest).toString();
    const newPath = `/${params.perspectiva}/concorrente/ad/${adId}${query ? `?${query}` : ''}`;
    
    redirect(newPath);  // Replace (sem adicionar ao histórico)
  }
  
  // ... renderizar normalmente
}
```

---

## 7. Validação de Perspectiva

```typescript
// lib/utils/url-params.ts
const VALID_PERSPECTIVES = ['default', 'cloudwalk', 'infinitepay', 'jim'] as const;
export type Perspective = typeof VALID_PERSPECTIVES[number];

export function isValidPerspective(slug: string): slug is Perspective {
  return VALID_PERSPECTIVES.includes(slug as any);
}

// Em page.tsx
if (!isValidPerspective(params.perspectiva)) {
  redirect('/default/concorrente');
}
```

---

## 8. Checklist de Implementação

### Fase 1: Estrutura Base
- [ ] Criar `/lib/utils/url-params.ts`
- [ ] Criar `app/[perspectiva]/layout.tsx`
- [ ] Criar `app/[perspectiva]/concorrente/page.tsx`
- [ ] Criar `app/[perspectiva]/concorrente/ad/[creativeId]/page.tsx`

### Fase 2: Wrapper
- [ ] Criar `components/ConcorrentePageWrapper.tsx`
- [ ] Implementar parse de filtros da URL
- [ ] Implementar sync URL ← State
- [ ] Implementar preservação de UTMs

### Fase 3: Adaptação
- [ ] Modificar `AdDashboard` (adicionar props opcionais)
- [ ] Modificar `Header` (navegar em vez de setTheme)
- [ ] Modificar `app/page.tsx` (redirect)
- [ ] Modificar `app/(protected)/page.tsx` (redirect)

### Fase 4: Testes
- [ ] `npm run build` (sem erros)
- [ ] `npx tsc --noEmit` (sem erros de tipo)
- [ ] Teste manual: `/default/concorrente`
- [ ] Teste manual: `/infinitepay/concorrente`
- [ ] Teste manual: `/infinitepay/concorrente/ad/123`
- [ ] Teste manual: `?ad=123` redireciona
- [ ] Teste manual: Filtros na URL funcionam
- [ ] Teste manual: UTMs preservados
- [ ] Teste manual: Header troca perspectiva

---

## 9. Commits Convencionais

```bash
# Commit 1: Utilitários
git add lib/utils/url-params.ts
git commit -m "feat(routing): add URL params utilities with UTM preservation"

# Commit 2: Rotas
git add app/[perspectiva]/
git commit -m "feat(routing): implement perspective-based routes with deep linking"

# Commit 3: Wrapper
git add components/ConcorrentePageWrapper.tsx
git commit -m "feat(routing): create URL-state sync wrapper component"

# Commit 4: Dashboard adaptado
git add components/ad-dashboard.tsx
git commit -m "refactor(dashboard): make AdDashboard controllable via props"

# Commit 5: Header navegação
git add components/header.tsx
git commit -m "refactor(header): navigate via router instead of setTheme"

# Commit 6: Redirects
git add app/page.tsx app/(protected)/page.tsx
git commit -m "feat(routing): add root and legacy redirects"
```

---

**Status**: ✅ PLAN completo - Iniciando CHANGES
