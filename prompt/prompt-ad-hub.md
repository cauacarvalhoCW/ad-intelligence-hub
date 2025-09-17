# Edge Intelligence Hub - Especificação Técnica Completa

## 🎯 Visão Geral do Projeto

**Edge Intelligence Hub** é uma plataforma front-end moderna para análise e navegação de anúncios de concorrentes, construída com **Next.js 14**, **TypeScript**, **Tailwind CSS** e integrada ao **Supabase**. O projeto oferece múltiplos temas corporativos, filtros avançados, taggeamento inteligente e deploy otimizado na **Vercel**.

---

## 🏗️ Stack Tecnológica

### Core Technologies

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5+
- **Styling**: Tailwind CSS + CSS Custom Properties
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel
- **State Management**: React Context + useReducer
- **Data Fetching**: Server Components + React Query (client-side)

### Dependencies

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@supabase/supabase-js": "^2.38.0",
    "@tanstack/react-query": "^5.0.0",
    "lucide-react": "^0.300.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "date-fns": "^3.0.0",
    "papaparse": "^5.4.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/papaparse": "^5.3.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.0.0"
  }
}
```

---

## 🗄️ Schema do Banco de Dados (Supabase) - Schema Real

### Tabela `competitors`

```sql
CREATE TABLE public.competitors (
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
  name TEXT NOT NULL,
  home_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
  CONSTRAINT competitors_pkey PRIMARY KEY (id),
  CONSTRAINT competitors_name_key UNIQUE (name)
) TABLESPACE pg_default;

CREATE TRIGGER set_updated_at_competitors BEFORE
UPDATE ON competitors FOR EACH ROW
EXECUTE FUNCTION extensions.moddatetime();
```

### Tabela `ads`

```sql
CREATE TABLE public.ads (
  ad_id TEXT NOT NULL,
  competitor_id UUID NOT NULL,
  source TEXT NULL,
  asset_type TEXT NOT NULL,
  product TEXT NULL,
  asset BYTEA NULL,
  ad_analysis JSONB NULL,
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
  year INTEGER NULL,
  week INTEGER NULL,
  start_date TIMESTAMP WITH TIME ZONE NULL,
  display_format CHARACTER VARYING(50) NULL,
  tags TEXT NULL,
  image_description TEXT NULL,
  transcription TEXT NULL,
  CONSTRAINT ads_pkey PRIMARY KEY (ad_id),
  CONSTRAINT ads_competitor_id_fkey FOREIGN KEY (competitor_id) REFERENCES competitors (id),
  CONSTRAINT ads_competitor_id_fkey1 FOREIGN KEY (competitor_id) REFERENCES competitors (id) ON DELETE CASCADE
) TABLESPACE pg_default;

CREATE TRIGGER set_updated_at_ads BEFORE
UPDATE ON ads FOR EACH ROW
EXECUTE FUNCTION extensions.moddatetime('updated_at');

-- NOTA: Não criar índices adicionais - usar apenas consultas diretas
-- Os índices existentes no banco são suficientes
-- Não usar banco de dados vetorial ou full-text search
```

### Tabela `variations`

```sql
CREATE TABLE public.variations (
  variation_id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
  parent_ad_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  button_label TEXT NOT NULL,
  button_url TEXT NOT NULL,
  asset BYTEA NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
  competitor_id UUID NULL,
  CONSTRAINT variations_pkey PRIMARY KEY (variation_id),
  CONSTRAINT variations_parent_ad_id_fkey FOREIGN KEY (parent_ad_id) REFERENCES ads (ad_id)
) TABLESPACE pg_default;

CREATE TRIGGER set_updated_at_variations BEFORE
UPDATE ON variations FOR EACH ROW
EXECUTE FUNCTION extensions.moddatetime();

-- NOTA: Usar apenas os índices existentes no banco
```

---

## 📁 Estrutura Completa do Projeto

```
edge-intelligence-hub/
├── README.md
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── package.json
├── .env.local.example
├── .env.local
├── .gitignore
├── .eslintrc.json
│
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── loading.tsx
│   ├── not-found.tsx
│   ├── page.tsx (redirect to /ads)
│   │
│   ├── (ads)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Página principal "Explorar"
│   │   ├── loading.tsx
│   │   └── error.tsx
│   │
│   ├── api/
│   │   ├── ads/
│   │   │   └── route.ts                # API para buscar anúncios
│   │   ├── competitors/
│   │   │   └── route.ts                # API para buscar competidores
│   │   └── export/
│   │       └── route.ts                # API para export CSV
│   │
│   └── favicon.ico
│
├── components/
│   ├── ui/                             # Componentes base reutilizáveis
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   ├── Skeleton.tsx
│   │   ├── Pagination.tsx
│   │   ├── Modal.tsx
│   │   ├── Tooltip.tsx
│   │   └── index.ts
│   │
│   ├── layout/
│   │   ├── Header.tsx                  # Header com logo e theme switcher
│   │   ├── Sidebar.tsx                 # Sidebar com filtros (desktop)
│   │   └── MobileNav.tsx               # Navigation mobile
│   │
│   ├── filters/
│   │   ├── FiltersPanel.tsx            # Panel principal de filtros
│   │   ├── CompetitorFilter.tsx        # Filtro por competidor
│   │   ├── DateRangeFilter.tsx         # Filtro por data
│   │   ├── AssetTypeFilter.tsx         # Filtro por tipo de asset
│   │   ├── PlatformFilter.tsx          # Filtro por plataforma
│   │   ├── TagsFilter.tsx              # Filtro por tags
│   │   └── SearchFilter.tsx            # Busca full-text
│   │
│   ├── ads/
│   │   ├── AdsGrid.tsx                 # Grid responsivo com paginação
│   │   ├── AdCard.tsx                  # Card com taxas, produto e comunicação
│   │   ├── AdTable.tsx                 # Visualização em tabela
│   │   ├── AdModal.tsx                 # Modal com detalhes do anúncio
│   │   ├── VariationsCarousel.tsx      # Carrossel de variações
│   │   ├── RatesDisplay.tsx            # Componente para exibir taxas
│   │   ├── ProductBadge.tsx            # Badge do produto
│   │   └── ViewModeToggle.tsx          # Toggle Cards/Table
│   │
│   ├── theme/
│   │   ├── ThemeSwitcher.tsx           # Switcher de temas
│   │   ├── ThemeProvider.tsx           # Context provider
│   │   └── BrandLogo.tsx               # Logo dinâmico por tema
│   │
│   ├── export/
│   │   ├── ExportButton.tsx            # Botão de export CSV
│   │   └── ExportModal.tsx             # Modal de configuração do export
│   │
│   └── common/
│       ├── LoadingSpinner.tsx
│       ├── ErrorBoundary.tsx
│       ├── EmptyState.tsx
│       ├── TagChip.tsx                 # Chip de tag clicável
│       └── NewBadge.tsx                # Badge "Novo" para ads recentes
│
├── lib/
│   ├── contexts/
│   │   └── ThemeContext.tsx            # Context para gerenciamento de temas
│   │
│   ├── supabase/
│   │   ├── client.ts                   # Cliente Supabase (client-side)
│   │   ├── server.ts                   # Cliente Supabase (server-side)
│   │   └── types.ts                    # Tipos TypeScript do banco
│   │
│   ├── utils/
│   │   ├── cn.ts                       # Utility para className (clsx + twMerge)
│   │   ├── date.ts                     # Utilities para datas
│   │   ├── format.ts                   # Formatação de dados
│   │   ├── url.ts                      # Utilities para URL/querystring
│   │   ├── export.ts                   # Utilities para export CSV
│   │   └── ratesExtractor.ts           # Extração de taxas dos textos
│   │
│   ├── hooks/
│   │   ├── useAds.ts                   # Hook para buscar anúncios
│   │   ├── useCompetitors.ts           # Hook para buscar competidores
│   │   ├── useFilters.ts               # Hook para gerenciar filtros
│   │   ├── useTheme.ts                 # Hook para tema
│   │   ├── usePagination.ts            # Hook para paginação
│   │   └── useDebounce.ts              # Hook para debounce
│   │
│   ├── constants/
│   │   ├── themes.ts                   # Configurações de temas
│   │   ├── competitors.ts              # Lista de competidores por região
│   │   └── filters.ts                  # Opções de filtros
│   │
│   ├── tags/
│   │   ├── dictionary.ts               # Dicionário PT/EN para tags
│   │   ├── extractor.ts                # Extrator de tags via regex
│   │   └── types.ts                    # Tipos para sistema de tags
│   │
│   └── validations/
│       ├── ads.ts                      # Validações para anúncios
│       ├── filters.ts                  # Validações para filtros
│       └── export.ts                   # Validações para export
│
├── styles/
│   ├── globals.css                     # Estilos globais + CSS variables
│   ├── themes/
│   │   ├── light.css                   # Tema light
│   │   ├── dark.css                    # Tema dark
│   │   ├── cloudwalk.css               # Tema CloudWalk
│   │   ├── infinitepay.css             # Tema InfinitePay
│   │   └── jim.css                     # Tema JIM
│   └── components/
│       ├── ads.css                     # Estilos específicos para ads
│       ├── filters.css                 # Estilos para filtros
│       └── animations.css              # Animações customizadas
│
├── public/
│   ├── logos/
│   │   ├── cloudwalk.svg
│   │   ├── infinitepay.svg
│   │   ├── jim.svg
│   │   └── competitors/                # Logos dos competidores
│   │       ├── pagbank.svg
│   │       ├── stone.svg
│   │       ├── ton.svg
│   │       └── ...
│   ├── icons/
│   │   └── favicon.ico
│   └── images/
│       └── placeholder-ad.jpg
│
└── types/
    ├── database.ts                     # Tipos do banco de dados
    ├── api.ts                          # Tipos das APIs
    ├── filters.ts                      # Tipos dos filtros
    └── global.d.ts                     # Tipos globais
```

---

## 🎨 Sistema de Temas Detalhado

### Referências Visuais e Paletas

#### **CloudWalk Theme** (https://www.cloudwalk.io)

- **Escopo**: Competidores BR + US (visão global)
- **Paleta**: Gradiente quente (laranja → rosa → roxo) + Branco + Cinza claro
- **Cores Principais**: `#ffffff` (texto), `#f5f5f5` (nav), gradiente `#f59e0b → #ec4899`
- **Competidores**: Todos os mercados (Stone, PagBank, Square, PayPal, etc.)

#### **InfinitePay Theme** (https://www.infinitepay.io)

- **Escopo**: Competidores BR (foco nacional)
- **Paleta**: Verde limão neon + Roxo + Preto + Branco
- **Cores Principais**: `#9AFF00` (neon), `#8b5cf6` (roxo), `#000000` (texto)
- **Competidores**: PagBank, Stone, Cora, Ton, Mercado Pago, Jeitto

#### **JIM Theme** (https://www.jim.com)

- **Escopo**: Competidores US (foco internacional)
- **Paleta**: Roxo vibrante + Cinza claro + Branco
- **Cores Principais**: `#8b5cf6` (roxo), `#f9fafb` (background), `#1f2937` (dark)
- **Competidores**: Square, PayPal, Stripe, Venmo, SumUp

### CSS Custom Properties

```css
/* globals.css */
:root {
  /* Base Colors */
  --color-background: #ffffff;
  --color-foreground: #0b0b0c;
  --color-primary: #111111;
  --color-primary-foreground: #ffffff;
  --color-secondary: #f1f5f9;
  --color-secondary-foreground: #0f172a;
  --color-muted: #71717a;
  --color-muted-foreground: #64748b;
  --color-accent: #f1f5f9;
  --color-accent-foreground: #0f172a;
  --color-border: #e2e8f0;
  --color-input: #ffffff;
  --color-ring: #2563eb;

  /* Semantic Colors */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;

  /* Layout */
  --radius: 16px;
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;

  /* Typography */
  --font-sans: ui-sans-serif, system-ui, sans-serif;
  --font-mono: ui-monospace, "Cascadia Code", "Source Code Pro", monospace;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}

[data-theme="dark"] {
  --color-background: #0b0b0c;
  --color-foreground: #f6f6f6;
  --color-primary: #eaeaea;
  --color-primary-foreground: #0b0b0c;
  --color-secondary: #1e293b;
  --color-secondary-foreground: #f1f5f9;
  --color-muted: #64748b;
  --color-muted-foreground: #94a3b8;
  --color-border: #334155;
  --color-input: #1e293b;
}

/* 🎨 CORES REAIS DOS SITES - EXTRAÍDAS DAS CAPTURAS DE TELA */

[data-theme="cloudwalk"] {
  /* Cores extraídas de https://www.cloudwalk.io */
  --color-primary: #ffffff; /* Branco (texto principal) */
  --color-primary-foreground: #000000;
  --color-secondary: #f5f5f5; /* Cinza claro (navegação) */
  --color-secondary-foreground: #000000;
  --color-accent: #fbbf24; /* Dourado/amarelo (do gradiente) */
  --color-accent-foreground: #000000;
  --brand-gradient: linear-gradient(
    135deg,
    #f59e0b 0%,
    #f97316 30%,
    #ec4899 70%,
    #8b5cf6 100%
  );

  /* Cores específicas CloudWalk */
  --cloudwalk-white: #ffffff;
  --cloudwalk-warm-gradient: linear-gradient(135deg, #f59e0b, #f97316, #ec4899);
  --cloudwalk-text: #000000;
  --cloudwalk-nav-bg: #f5f5f5;
}

[data-theme="infinitepay"] {
  /* Cores extraídas de https://www.infinitepay.io */
  --color-primary: #9aff00; /* Verde limão neon (botão principal) */
  --color-primary-foreground: #000000;
  --color-secondary: #f8fafc; /* Branco/cinza muito claro */
  --color-secondary-foreground: #000000;
  --color-accent: #8b5cf6; /* Roxo (texto de destaque) */
  --color-accent-foreground: #ffffff;
  --brand-gradient: linear-gradient(135deg, #9aff00 0%, #00b894 100%);

  /* Cores específicas InfinitePay */
  --infinitepay-neon-green: #9aff00;
  --infinitepay-purple: #8b5cf6;
  --infinitepay-dark-green: #00b894;
  --infinitepay-black: #000000;
  --infinitepay-white: #ffffff;
}

[data-theme="jim"] {
  /* Cores extraídas de https://www.jim.com */
  --color-primary: #8b5cf6; /* Roxo vibrante (botões) */
  --color-primary-foreground: #ffffff;
  --color-secondary: #f9fafb; /* Cinza muito claro (background) */
  --color-secondary-foreground: #111827;
  --color-accent: #7c3aed; /* Roxo mais escuro */
  --color-accent-foreground: #ffffff;
  --brand-gradient: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);

  /* Cores específicas JIM */
  --jim-purple: #8b5cf6;
  --jim-purple-dark: #7c3aed;
  --jim-dark-bg: #1f2937;
  --jim-light-bg: #f9fafb;
  --jim-white: #ffffff;
  --jim-text-dark: #111827;
}
```

---

## 📊 Consultas SQL Baseadas no Schema Real

### Consultas Principais para o Frontend

```sql
-- 1. Buscar anúncios com informações do competidor (consulta principal)
SELECT
  a.ad_id,
  a.competitor_id,
  a.source,                    -- URL externa (pode ficar indisponível)
  a.asset_type,               -- "video" ou "image"
  a.product,                  -- Produto sendo anunciado
  a.start_date,               -- Data real do Facebook
  a.year,
  a.week,
  a.display_format,           -- "video", "DCO", etc.
  a.tags,                     -- Tags relacionadas
  a.image_description,        -- Descrição da imagem/vídeo
  a.transcription,            -- Transcrição do áudio
  a.ad_analysis,              -- Análise completa (JSONB)
  a.created_at,
  c.name as competitor_name,
  c.home_url as competitor_facebook_url,
  -- Contar variações
  COUNT(v.variation_id) as variations_count
FROM ads a
LEFT JOIN competitors c ON a.competitor_id = c.id
LEFT JOIN variations v ON a.ad_id = v.parent_ad_id
WHERE 1=1
  -- Filtros dinâmicos (aplicar conforme necessário)
  -- AND a.competitor_id = ANY($1::uuid[])  -- Filtro por competidores
  -- AND a.asset_type = ANY($2::text[])     -- Filtro por tipo (video/image)
  -- AND a.product ILIKE '%' || $3 || '%'   -- Filtro por produto
  -- AND a.year = $4 AND a.week = $5        -- Filtro por ano/semana
  -- AND a.start_date >= $6 AND a.start_date <= $7  -- Filtro por data
  -- AND (a.tags ILIKE '%' || $8 || '%' OR
  --      a.image_description ILIKE '%' || $8 || '%' OR
  --      a.transcription ILIKE '%' || $8 || '%' OR
  --      a.product ILIKE '%' || $8 || '%')  -- Busca simples por texto
GROUP BY a.ad_id, c.name, c.home_url
ORDER BY a.start_date DESC NULLS LAST, a.created_at DESC
LIMIT $9 OFFSET $10;  -- Paginação

-- 2. Buscar competidores
SELECT
  id,
  name,
  home_url,
  created_at
FROM competitors
ORDER BY name;

-- 3. Buscar variações de um anúncio específico
SELECT
  variation_id,
  parent_ad_id,
  title,
  description,
  button_label,
  button_url,
  created_at,
  competitor_id
FROM variations
WHERE parent_ad_id = $1
ORDER BY created_at DESC;

-- 4. Buscar detalhes de um anúncio específico
SELECT
  ad_id,
  asset_type,
  product,
  tags,
  image_description,
  transcription,
  ad_analysis,
  display_format,
  source,
  start_date
FROM ads
WHERE ad_id = $1;

-- 5. Buscar detalhes de uma variação específica
SELECT
  variation_id,
  title,
  description,
  button_label,
  button_url
FROM variations
WHERE variation_id = $1;

-- 6. Estatísticas para dashboard
SELECT
  COUNT(*) as total_ads,
  COUNT(DISTINCT competitor_id) as total_competitors,
  COUNT(DISTINCT asset_type) as total_asset_types,
  COUNT(DISTINCT product) as total_products,
  COUNT(DISTINCT display_format) as total_display_formats,
  COUNT(CASE WHEN ad_analysis IS NOT NULL THEN 1 END) as ads_with_analysis,
  COUNT(CASE WHEN transcription IS NOT NULL AND transcription != '' THEN 1 END) as ads_with_transcription,
  COUNT(CASE WHEN image_description IS NOT NULL AND image_description != '' THEN 1 END) as ads_with_description
FROM ads;

-- 7. Filtros disponíveis (para popular dropdowns)
SELECT DISTINCT asset_type FROM ads WHERE asset_type IS NOT NULL ORDER BY asset_type;
SELECT DISTINCT source FROM ads WHERE source IS NOT NULL ORDER BY source;
SELECT DISTINCT product FROM ads WHERE product IS NOT NULL ORDER BY product;
SELECT DISTINCT display_format FROM ads WHERE display_format IS NOT NULL ORDER BY display_format;

-- 8. Busca simples por texto (sem banco vetorial)
SELECT
  a.ad_id,
  a.competitor_id,
  a.tags,
  a.image_description,
  a.transcription,
  a.product,
  c.name as competitor_name
FROM ads a
LEFT JOIN competitors c ON a.competitor_id = c.id
WHERE (
  a.tags ILIKE '%' || $1 || '%' OR
  a.image_description ILIKE '%' || $1 || '%' OR
  a.transcription ILIKE '%' || $1 || '%' OR
  a.product ILIKE '%' || $1 || '%'
)
ORDER BY a.start_date DESC NULLS LAST, a.created_at DESC
LIMIT $2 OFFSET $3;
```

### ⚠️ Importantes Considerações Técnicas

#### **🚨 IMPORTANTE: APENAS LEITURA**

**NUNCA INSERIR, ATUALIZAR OU DELETAR DADOS** - O sistema é **100% READ-ONLY**. Apenas consultas SELECT são permitidas. Não modificar a estrutura do banco de dados de forma alguma.

#### **🚫 NÃO USAR BANCO VETORIAL**

**IMPORTANTE**: Não usar banco de dados vetorial, TS Factory, ou qualquer sistema de busca vetorial. Usar apenas:

- Consultas simples com `ILIKE` para busca de texto
- Campos de texto normais (tags, transcription, image_description)
- Sem `tsvector`, `ts_rank`, `plainto_tsquery` ou similares

#### **Gestão de Índices**

**NÃO CRIAR ÍNDICES ADICIONAIS** - O banco já possui os índices necessários. Usar apenas consultas diretas sem modificar a estrutura do banco de dados.

#### **Estrutura Real dos Dados**

**IMPORTANTE**: Entendimento correto dos campos e seu uso real:

**Tabela `competitors`:**

- `id` e `name`: Principais campos utilizados
- `home_url`: URL da página do Facebook do competidor
- Demais campos são auxiliares

**Tabela `ads`:**

- `source`: URL externa que pode ficar indisponível após 1-3 dias
- `asset_type`: "video" ou "image"
- `product`: Qual produto está sendo anunciado
- `tags`: Tags relacionadas ao vídeo/anúncio
- `image_description`: Descrição da imagem ou de todo o vídeo
- `transcription`: Transcrição do áudio do vídeo
- `ad_analysis`: Análise completa do anúncio (JSONB)
- `start_date`: Data real que o anúncio foi ao ar no Facebook
- `display_format`: Formatos como "video", "DCO", etc.
- **`asset`: Campo vazio - IGNORAR completamente**

**Tabela `variations`:**

- Variações do anúncio principal com título, descrição e botão
- `button_label` e `button_url`: Call-to-action da variação
- Foco em textos e elementos visuais

---

## 📋 Exemplo de Dados - Mercado Pago (Apenas Visualização)

### Estrutura de Dados Esperada (READ-ONLY)

**⚠️ IMPORTANTE**: Estes são exemplos de como os dados aparecem no banco. **NÃO INSERIR DADOS** - apenas usar para entender a estrutura.

```typescript
// Exemplo de como os dados aparecem quando consultados
const exemploMercadoPago = {
  competitor: {
    id: "550e8400-e29b-41d4-a716-446655440001",
    name: "Mercado Pago",
    home_url: "https://facebook.com/mercadopago",
  },

  ad: {
    ad_id: "mp_point_2024_001",
    competitor_id: "550e8400-e29b-41d4-a716-446655440001",
    source: "https://facebook.com/ads/library/12345", // Pode ficar indisponível
    asset_type: "video",
    product: "Mercado Pago Point",
    tags: "maquininha, point, vendas, pix, cartão",
    image_description:
      "Vídeo mostra empresário usando a maquininha Point em sua loja, processando pagamentos via cartão e PIX",
    transcription:
      "Aceite cartão e PIX na sua loja com a Point do Mercado Pago. Taxa zero no débito e PIX. Peça já a sua!",
    ad_analysis: {
      sentiment: "positive",
      cta_count: 2,
      mentions_competitors: false,
      key_benefits: ["taxa zero", "pix", "cartão"],
      // Informações de taxas extraídas da análise
      rates: {
        debit: "0%",
        pix: "0%",
        credit: "2.99%",
      },
    },
    year: 2024,
    week: 12,
    start_date: "2024-03-20T10:30:00Z",
    display_format: "video",
  },

  variations: [
    {
      variation_id: "550e8400-e29b-41d4-a716-446655440002",
      parent_ad_id: "mp_point_2024_001",
      title: "Point Pro - Taxa Zero",
      description:
        "Maquininha com taxa zero no débito e PIX. Ideal para pequenos negócios.",
      button_label: "Peça sua Point",
      button_url: "https://mercadopago.com.br/point",
    },
    {
      variation_id: "550e8400-e29b-41d4-a716-446655440003",
      parent_ad_id: "mp_point_2024_001",
      title: "Point Smart - Completa",
      description:
        "Maquininha completa com Wi-Fi, 4G e bateria que dura o dia todo.",
      button_label: "Saiba mais",
      button_url: "https://mercadopago.com.br/point-smart",
    },
  ],
};
```

### Mais Exemplos de Dados para Desenvolvimento

```typescript
// Exemplo Stone Ton
const exemploStoneTon = {
  competitor: {
    id: "stone-uuid",
    name: "Stone",
    home_url: "https://facebook.com/stone",
  },
  ad: {
    ad_id: "stone_ton_2024_001",
    product: "Stone Ton",
    asset_type: "image",
    tags: "maquininha, ton, sem mensalidade, taxa baixa",
    image_description:
      'Imagem da maquininha Ton sendo usada em uma padaria, com destaque para "sem mensalidade"',
    transcription:
      "Maquininha Ton da Stone. Sem mensalidade, taxa a partir de 1,99%. Peça já!",
    ad_analysis: {
      sentiment: "positive",
      key_benefits: ["sem mensalidade", "taxa baixa"],
      rates: { credit: "1,99%", debit: "0%", monthly_fee: "Grátis" },
    },
    start_date: "2024-03-15T14:20:00Z",
  },
};

// Exemplo PagBank
const exemploPagBank = {
  competitor: {
    id: "pagbank-uuid",
    name: "PagBank",
    home_url: "https://facebook.com/pagbank",
  },
  ad: {
    ad_id: "pagbank_pos_2024_001",
    product: "PagBank POS",
    asset_type: "video",
    tags: "pos, pagbank, conta digital, pix",
    image_description:
      "Vídeo mostra empresário recebendo pagamentos via POS e gerenciando pelo app",
    transcription:
      "PagBank POS: receba com cartão, PIX e conta digital tudo em um só lugar. Taxa competitiva!",
    ad_analysis: {
      sentiment: "positive",
      key_benefits: ["conta digital", "tudo em um"],
      rates: { credit: "2,49%", pix: "0%", debit: "0%" },
    },
    start_date: "2024-03-18T09:15:00Z",
  },
};

// Exemplo Square (US)
const exemploSquare = {
  competitor: {
    id: "square-uuid",
    name: "Square",
    home_url: "https://facebook.com/square",
  },
  ad: {
    ad_id: "square_reader_2024_001",
    product: "Square Reader",
    asset_type: "video",
    tags: "card reader, square, small business, contactless",
    image_description:
      "Video shows coffee shop owner using Square Reader for contactless payments",
    transcription:
      "Accept payments anywhere with Square Reader. 2.6% + 10¢ per transaction. Get started today!",
    ad_analysis: {
      sentiment: "positive",
      key_benefits: ["anywhere", "contactless"],
      rates: { credit: "2.6% + $0.10", contactless: "2.6% + $0.10" },
    },
    start_date: "2024-03-20T16:30:00Z",
  },
};

// Array com todos os exemplos para uso fácil
export const MOCK_ADS = [
  exemploMercadoPago,
  exemploStoneTon,
  exemploPagBank,
  exemploSquare,
];
```

### Como Usar os Dados de Exemplo

1. **Durante desenvolvimento**: Use `MOCK_ADS` para testar componentes
2. **Demonstrações**: Exemplo real de como os dados aparecem
3. **Testes de UI**: Validar layouts com conteúdo realista
4. **Fallback**: Quando não conseguir buscar dados reais do banco
5. **Troca de temas**: Filtrar exemplos baseado no `competitorScope`

---

## 💳 Cards com Taxas e Produtos

### Conceito Principal dos Cards

Cada anúncio deve ser exibido em **cards informativos** que destacam:

#### **📊 Informações de Taxas**

- **Taxa POS Crédito**: Extraída da análise ou transcrição
- **Taxa POS Débito**: Informação de cobrança no débito
- **Taxa PIX**: Cobrança para PIX (geralmente 0%)
- **Outras taxas**: Antecipação, mensalidade, etc.

#### **🎯 Informações do Produto**

- **Nome do Produto**: Ex: "Mercado Pago Point", "Stone Ton", "PagBank POS"
- **Tipo de Solução**: Maquininha, app, link de pagamento
- **Comunicação Principal**: Mensagem chave do anúncio
- **Call-to-Action**: Botão principal da campanha

### Exemplo de Card Layout com Interações

```typescript
interface AdCard {
  // Cabeçalho
  competitor: string;           // "Mercado Pago"
  product: string;              // "Point Pro"
  asset_type: 'video' | 'image';

  // Taxas (destaque principal)
  rates: {
    credit_pos?: string;        // "2,99%"
    debit_pos?: string;         // "0%"
    pix?: string;               // "0%"
    monthly_fee?: string;       // "R$ 15,90"
    anticipation?: string;      // "3,99%"
  };

  // Comunicação
  main_message: string;         // "Taxa zero no débito e PIX"
  transcription: string;        // Transcrição completa
  tags: string[];               // ["maquininha", "pix", "taxa zero"]

  // Metadados
  start_date: string;           // Data do Facebook
  variations_count: number;     // Quantas variações tem

  // Futuro: Comparação
  competitive_analysis?: {
    better_than_market: boolean;
    market_average: string;
  };
}

// Componente AdCard com interações
// components/ads/AdCard.tsx
'use client';

import { useState } from 'react';
import { Card } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { RatesDisplay } from './RatesDisplay';
import { ProductBadge } from './ProductBadge';

interface AdCardProps {
  ad: AdCard;
  onClick?: (ad: AdCard) => void;
}

export function AdCard({ ad, onClick }: AdCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      className={`
        cursor-pointer transition-all duration-300 hover:shadow-lg
        ${isHovered ? 'scale-105 shadow-xl' : 'hover:scale-102'}
        border-2 hover:border-primary/50
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick?.(ad)}
    >
      {/* Header */}
      <div className="flex justify-between items-start p-4 border-b">
        <div>
          <h3 className="font-semibold text-lg">{ad.competitor}</h3>
          <ProductBadge product={ad.product} type={ad.asset_type} />
        </div>
        <Badge variant="outline" className="text-xs">
          {new Date(ad.start_date).toLocaleDateString()}
        </Badge>
      </div>

      {/* Taxas - Destaque Principal */}
      <div className="p-4">
        <RatesDisplay rates={ad.rates} />
      </div>

      {/* Comunicação */}
      <div className="p-4 pt-0">
        <p className="font-medium text-primary mb-2">{ad.main_message}</p>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {ad.transcription}
        </p>
      </div>

      {/* Tags */}
      <div className="p-4 pt-0">
        <div className="flex flex-wrap gap-1">
          {ad.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {ad.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{ad.tags.length - 3}
            </Badge>
          )}
        </div>
      </div>

      {/* Footer com variações */}
      {ad.variations_count > 0 && (
        <div className="px-4 pb-4">
          <Badge variant="outline" className="text-xs">
            {ad.variations_count} variações
          </Badge>
        </div>
      )}

      {/* Hover Overlay */}
      {isHovered && (
        <div className="absolute inset-0 bg-primary/5 rounded-lg pointer-events-none" />
      )}
    </Card>
  );
}

// Componente RatesDisplay
// components/ads/RatesDisplay.tsx
interface RatesDisplayProps {
  rates: {
    credit_pos?: string;
    debit_pos?: string;
    pix?: string;
    monthly_fee?: string;
    anticipation?: string;
  };
}

export function RatesDisplay({ rates }: RatesDisplayProps) {
  const rateItems = [
    { label: 'Crédito', value: rates.credit_pos, color: 'text-orange-600' },
    { label: 'Débito', value: rates.debit_pos, color: 'text-green-600' },
    { label: 'PIX', value: rates.pix, color: 'text-blue-600' },
    { label: 'Mensalidade', value: rates.monthly_fee, color: 'text-purple-600' },
  ].filter(item => item.value);

  return (
    <div className="grid grid-cols-2 gap-2">
      {rateItems.map((item) => (
        <div key={item.label} className="text-center p-2 bg-secondary/50 rounded">
          <div className="text-xs text-muted-foreground">{item.label}</div>
          <div className={`font-bold ${item.color}`}>{item.value}</div>
        </div>
      ))}
    </div>
  );
}

// Componente ProductBadge
// components/ads/ProductBadge.tsx
interface ProductBadgeProps {
  product: string;
  type: 'video' | 'image';
}

export function ProductBadge({ product, type }: ProductBadgeProps) {
  const icon = type === 'video' ? '🎥' : '📸';

  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className="text-xs">
        {icon} {product}
      </Badge>
    </div>
  );
}
```

### Extração de Taxas dos Dados

```typescript
// lib/utils/ratesExtractor.ts
export interface ExtractedRates {
  credit_pos?: string;
  debit_pos?: string;
  pix?: string;
  monthly_fee?: string;
  anticipation?: string;
}

export function extractRatesFromAd(ad: Ad): ExtractedRates {
  const rates: ExtractedRates = {};

  // 1. Primeiro, tentar extrair do ad_analysis (JSONB)
  if (ad.ad_analysis?.rates) {
    return ad.ad_analysis.rates;
  }

  // 2. Extrair da transcrição
  const text =
    `${ad.transcription || ""} ${ad.image_description || ""} ${ad.tags || ""}`.toLowerCase();

  // Padrões de taxa
  const patterns = {
    credit: /(?:crédito|credit).*?(\d+[,.]?\d*%)/gi,
    debit: /(?:débito|debit).*?(\d+[,.]?\d*%|zero|grátis)/gi,
    pix: /pix.*?(\d+[,.]?\d*%|zero|grátis)/gi,
    monthly:
      /(?:mensalidade|mensal).*?(r\$\s*\d+[,.]?\d*|\d+[,.]?\d*|zero|grátis)/gi,
    anticipation: /(?:antecipação|antecip).*?(\d+[,.]?\d*%)/gi,
  };

  // Taxa zero patterns
  if (text.includes("taxa zero") || text.includes("sem taxa")) {
    if (text.includes("débito") || text.includes("pix")) {
      rates.debit_pos = "0%";
      rates.pix = "0%";
    }
  }

  // Extrair taxas específicas
  Object.entries(patterns).forEach(([key, pattern]) => {
    const match = text.match(pattern);
    if (match) {
      const rateKey =
        key === "credit"
          ? "credit_pos"
          : key === "debit"
            ? "debit_pos"
            : key === "monthly"
              ? "monthly_fee"
              : key;
      rates[rateKey as keyof ExtractedRates] = match[1];
    }
  });

  return rates;
}
```

As taxas são extraídas de:

1. **`ad_analysis`** (JSONB) - se contiver informações estruturadas
2. **`transcription`** - buscar padrões como "2,99%", "taxa zero"
3. **`image_description`** - descrições que mencionem preços
4. **`tags`** - tags como "taxa zero", "sem mensalidade"

### Futuro: Knowledge Base (KB)

**Conceito para próximas versões:**

- Criar KB com produtos próprios da empresa
- Comparar taxas dos concorrentes vs. produtos próprios
- Destacar vantagens competitivas
- Análise de posicionamento no mercado

---

## 🎨 Sistema de Troca de Temas via Header

### Layout do Header - Especificação Exata

O **header** deve ter:

- **Logo clicável** no canto esquerdo que muda conforme o tema
- **Quando clicar no logo**: abre dropdown com opções de tema
- **Cada tema** muda: cores, logo, e **filtra automaticamente** os competidores

### Comportamento do Logo no Header

```typescript
// Estado do logo baseado no tema atual
const LOGO_CONFIG = {
  light: {
    logo: "/logos/edge-hub-default.svg", // Logo padrão
    name: "Edge Intelligence Hub",
    description: "Todos os competidores",
  },
  dark: {
    logo: "/logos/edge-hub-default.svg", // Logo padrão (dark)
    name: "Edge Intelligence Hub",
    description: "Todos os competidores",
  },
  cloudwalk: {
    logo: "/logos/cloudwalk.svg",
    name: "CloudWalk Intelligence",
    description: "Competidores BR + US",
  },
  infinitepay: {
    logo: "/logos/infinitepay.svg",
    name: "InfinitePay Intelligence",
    description:
      "Competidores BR: PagBank, Stone, Cora, Ton, Mercado Pago, Jeitto",
  },
  jim: {
    logo: "/logos/jim.svg",
    name: "JIM Intelligence",
    description: "Competidores US: Square, PayPal, Stripe, Venmo, SumUp",
  },
};
```

### Header Component - Implementação Exata

```typescript
// components/layout/Header.tsx
'use client';

import { useState } from 'react';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { ChevronDown } from 'lucide-react';

export function Header() {
  const { theme, setTheme } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const currentLogo = LOGO_CONFIG[theme];

  const themeOptions = [
    { id: 'light', name: 'Padrão Light', icon: '☀️', logo: LOGO_CONFIG.light },
    { id: 'dark', name: 'Padrão Dark', icon: '🌙', logo: LOGO_CONFIG.dark },
    { id: 'cloudwalk', name: 'CloudWalk', icon: '🌍', logo: LOGO_CONFIG.cloudwalk },
    { id: 'infinitepay', name: 'InfinitePay', icon: '💜', logo: LOGO_CONFIG.infinitepay },
    { id: 'jim', name: 'JIM', icon: '🔵', logo: LOGO_CONFIG.jim },
  ];

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">

        {/* Logo Clicável - PRINCIPAL */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <img
              src={currentLogo.logo}
              alt={currentLogo.name}
              className="h-8 w-8"
            />
            <div className="text-left">
              <h1 className="font-semibold text-lg">{currentLogo.name}</h1>
              <p className="text-xs text-muted-foreground">{currentLogo.description}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>

          {/* Dropdown de Temas */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-80 bg-background border rounded-lg shadow-lg z-50">
              <div className="p-2">
                <div className="text-sm font-medium p-2 text-muted-foreground">
                  Escolher perspectiva:
                </div>
                {themeOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      setTheme(option.id as any);
                      setIsDropdownOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary
                      ${theme === option.id ? 'bg-primary/10 border border-primary/20' : ''}
                    `}
                  >
                    <img
                      src={option.logo.logo}
                      alt={option.name}
                      className="h-6 w-6"
                    />
                    <div className="text-left flex-1">
                      <div className="font-medium">{option.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {option.logo.description}
                      </div>
                    </div>
                    <span className="text-lg">{option.icon}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Resto do Header */}
        <div className="flex items-center gap-4">
          {/* Outros componentes do header se necessário */}
        </div>
      </div>
    </header>
  );
}
```

### Filtro Automático de Competidores

Quando o tema muda, **automaticamente** filtrar os anúncios:

```typescript
// Hook que filtra anúncios baseado no tema
function useFilteredAds() {
  const { theme, competitorScope } = useTheme();
  const { ads } = useAds(); // Busca todos os anúncios

  const filteredAds = useMemo(() => {
    if (competitorScope.length === 0) {
      return ads; // Tema padrão - mostra todos
    }

    return ads.filter(ad =>
      competitorScope.includes(ad.competitor?.name || '')
    );
  }, [ads, competitorScope]);

  return filteredAds;
}

// Usar no componente principal
function AdsGrid() {
  const filteredAds = useFilteredAds(); // Já filtrado automaticamente

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredAds.map(ad => (
        <AdCard key={ad.ad_id} ad={ad} />
      ))}
    </div>
  );
}
```

### 🎯 Instruções Específicas para V0

**IMPORTANTE para V0**: Implementar exatamente assim:

1. **Header fixo** no topo com logo clicável
2. **Logo muda** conforme o tema (CloudWalk, InfinitePay, JIM)
3. **Dropdown** abre quando clica no logo
4. **Cores mudam** automaticamente (CSS Custom Properties)
5. **Cards filtram** automaticamente por competidor
6. **Mock data** com exemplos de cada competidor

### 🎨 Mudança de Cores - Foco Principal

**A ideia principal é a questão das cores!** Quando muda o tema:

#### **CloudWalk** 🌍

- **Cores**: Gradiente quente (laranja → rosa → roxo)
- **Primary**: `#ffffff` (branco)
- **Accent**: `#fbbf24` (dourado)
- **Cards**: Bordas e acentos com gradiente CloudWalk

#### **InfinitePay** 💜

- **Cores**: Verde limão neon + Roxo
- **Primary**: `#9AFF00` (verde neon)
- **Accent**: `#8b5cf6` (roxo)
- **Cards**: Destaque nas taxas com verde neon

#### **JIM** 🔵

- **Cores**: Roxo vibrante + Cinza
- **Primary**: `#8b5cf6` (roxo)
- **Accent**: `#7c3aed` (roxo escuro)
- **Cards**: Interface limpa com acentos roxos

### Aplicação das Cores nos Cards

```css
/* Exemplo de como as cores devem aparecer nos cards */
[data-theme="infinitepay"] .ad-card {
  border-color: var(--infinitepay-neon-green);
}

[data-theme="infinitepay"] .rate-highlight {
  background: linear-gradient(135deg, #9aff00 0%, #8b5cf6 100%);
  color: white;
}

[data-theme="cloudwalk"] .ad-card {
  border-image: var(--cloudwalk-warm-gradient);
}

[data-theme="jim"] .ad-card {
  border-color: var(--jim-purple);
}
```

### Layout Principal

```typescript
// app/layout.tsx ou página principal
export default function RootLayout({ children }) {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        <Header /> {/* Logo clicável aqui */}
        <main className="container mx-auto py-6">
          {children} {/* Grid de cards aqui */}
        </main>
      </div>
    </ThemeProvider>
  );
}
```

### Implementação do Theme Context

```typescript
// lib/contexts/ThemeContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'cloudwalk' | 'infinitepay' | 'jim';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  competitorScope: string[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const COMPETITOR_SCOPES = {
  light: [], // Todos os competidores
  dark: [], // Todos os competidores
  cloudwalk: [], // Todos os competidores (BR + US)
  infinitepay: ['PagBank', 'Stone', 'Cora', 'Ton', 'Mercado Pago', 'Jeitto'], // BR
  jim: ['Square', 'PayPal', 'Stripe', 'Venmo', 'SumUp'], // US
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    // Aplicar tema no documento
    document.documentElement.setAttribute('data-theme', theme);

    // Salvar no localStorage
    localStorage.setItem('edge-hub-theme', theme);
  }, [theme]);

  useEffect(() => {
    // Carregar tema salvo
    const savedTheme = localStorage.getItem('edge-hub-theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  const competitorScope = COMPETITOR_SCOPES[theme];

  return (
    <ThemeContext.Provider value={{ theme, setTheme, competitorScope }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
```

### Theme Switcher Component

```typescript
// components/theme/ThemeSwitcher.tsx
'use client';

import { useTheme } from '@/lib/contexts/ThemeContext';
import { Button } from '@/shared/ui/button';

const THEMES = [
  { id: 'light', name: 'Light', icon: '☀️' },
  { id: 'dark', name: 'Dark', icon: '🌙' },
  { id: 'cloudwalk', name: 'CloudWalk', icon: '🌍' },
  { id: 'infinitepay', name: 'InfinitePay', icon: '💜' },
  { id: 'jim', name: 'JIM', icon: '🔵' },
] as const;

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex gap-2 p-2 bg-secondary rounded-lg">
      {THEMES.map((themeOption) => (
        <Button
          key={themeOption.id}
          variant={theme === themeOption.id ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setTheme(themeOption.id as any)}
          className="flex items-center gap-2"
        >
          <span>{themeOption.icon}</span>
          <span>{themeOption.name}</span>
        </Button>
      ))}
    </div>
  );
}
```

---

## 🔧 Funcionalidades Detalhadas

### 1. **Sistema de Filtros Avançado (Baseado no Schema Real)**

```typescript
interface FilterState {
  competitors: string[]; // UUIDs dos competidores selecionados
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  assetTypes: string[]; // Tipos de asset (baseado em ads.asset_type)
  sources: string[]; // Fontes dos anúncios (ads.source)
  products: string[]; // Produtos (ads.product)
  displayFormats: string[]; // Formatos de display (ads.display_format)
  yearWeek: {
    year: number | null;
    week: number | null;
  };
  search: string; // Busca full-text (tags, image_description, transcription)
  hasVariations: boolean; // Apenas anúncios com variações
  hasAnalysis: boolean; // Apenas anúncios com ad_analysis
}

// Tipos baseados no schema real
interface Competitor {
  id: string; // UUID
  name: string;
  home_url: string;
  created_at: string;
  updated_at: string;
}

interface Ad {
  ad_id: string; // TEXT (PK)
  competitor_id: string; // UUID (FK)
  source: string | null; // URL externa (pode ficar indisponível após 1-3 dias)
  asset_type: string; // "video" ou "image"
  product: string | null; // Produto sendo anunciado
  ad_analysis: any | null; // JSONB - Análise completa do anúncio
  created_at: string;
  updated_at: string;
  year: number | null;
  week: number | null;
  start_date: string | null; // TIMESTAMP - Data real do Facebook
  display_format: string | null; // "video", "DCO", etc.
  tags: string | null; // Tags relacionadas ao anúncio
  image_description: string | null; // Descrição da imagem ou vídeo completo
  transcription: string | null; // Transcrição do áudio do vídeo

  // Dados relacionados (joins)
  competitor?: Competitor;
  variations?: Variation[];
}

interface Variation {
  variation_id: string; // UUID (PK)
  parent_ad_id: string; // TEXT (FK para ads.ad_id)
  title: string; // Título da variação
  description: string; // Descrição da variação
  button_label: string; // Texto do botão CTA
  button_url: string; // URL de destino do botão
  created_at: string;
  updated_at: string;
  competitor_id: string | null; // UUID
}
```

### 2. **Sistema de Tags Inteligente**

```typescript
// lib/tags/dictionary.ts
export const TAG_DICTIONARY = {
  // Fintech/Payments (PT)
  maquininha: ["maquininha", "máquina de cartão", "point", "terminal"],
  pix: ["pix", "transferência instantânea", "qr code"],
  tap_to_pay: ["tap to pay", "aproximação", "contactless", "nfc"],
  cnpj: ["cnpj", "pessoa jurídica", "empresa"],
  mdr: ["mdr", "taxa", "tarifa", "custo"],
  antecipacao: ["antecipação", "adiantamento", "recebimento"],

  // Fintech/Payments (EN)
  card_reader: ["card reader", "terminal", "pos system"],
  instant_payment: ["instant payment", "real time", "immediate"],
  fees: ["fees", "rate", "pricing", "cost"],
  business: ["business", "merchant", "company"],
  advance: ["advance", "early payment", "cash advance"],

  // Marketing/Creative
  promocao: ["promoção", "desconto", "oferta", "cashback"],
  onboarding: ["cadastro", "abertura", "conta digital"],
  app: ["aplicativo", "app", "mobile", "celular"],
} as const;

// lib/tags/extractor.ts
export function extractTags(text: string): string[] {
  const tags: string[] = [];
  const normalizedText = text.toLowerCase();

  Object.entries(TAG_DICTIONARY).forEach(([tag, keywords]) => {
    const hasKeyword = keywords.some((keyword) =>
      normalizedText.includes(keyword.toLowerCase()),
    );
    if (hasKeyword) {
      tags.push(tag);
    }
  });

  return [...new Set(tags)]; // Remove duplicatas
}
```

### 3. **Paginação e Performance**

```typescript
// Configuração de paginação
const PAGINATION_CONFIG = {
  defaultPageSize: 24,
  pageSizeOptions: [12, 24, 48, 96],
  maxPages: 100, // Limite para performance
};

// Configuração de conteúdo dos anúncios
const AD_CONTENT_CONFIG = {
  placeholder: {
    image_description: "Descrição não disponível",
    transcription: "Transcrição não disponível",
    tags: "Tags não disponíveis",
  },
  maxTextLength: {
    description: 200,
    transcription: 500,
    tags: 100,
  },
  // Tratamento para source URLs indisponíveis
  sourceUnavailableMessage: "URL original não está mais disponível",
};
```

### 4. **Export CSV Customizável**

```typescript
interface ExportConfig {
  includeFields: {
    basic: boolean; // title, competitor, date
    content: boolean; // description, transcription
    metrics: boolean; // engagement, spend estimate
    tags: boolean; // tags, keywords
    technical: boolean; // asset_type, platform, mime_type
  };
  dateRange: {
    start: Date;
    end: Date;
  };
  format: "csv" | "xlsx";
  filename?: string;
}
```

---

## 🚀 Configuração de Deploy (Vercel)

### Variáveis de Ambiente

```bash
# .env.local.example
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Configurações opcionais
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
VERCEL_ENV=production
```

### Configuração do Next.js

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  // Configuração removida - não há imagens para servir
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=300, s-maxage=600" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

### Configuração do Tailwind

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        primary: {
          DEFAULT: "var(--color-primary)",
          foreground: "var(--color-primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--color-secondary)",
          foreground: "var(--color-secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--color-muted)",
          foreground: "var(--color-muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          foreground: "var(--color-accent-foreground)",
        },
        border: "var(--color-border)",
        input: "var(--color-input)",
        ring: "var(--color-ring)",
      },
      borderRadius: {
        DEFAULT: "var(--radius)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
```

---

## 📱 Requisitos de UI/UX

### Responsividade

- **Mobile First**: Design otimizado para mobile (320px+)
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Touch Friendly**: Botões com min-height de 44px
- **Swipe Gestures**: Navegação por swipe em carrosséis

### Acessibilidade (WCAG 2.1 AA)

- **Contraste**: Mínimo 4.5:1 para texto normal
- **Keyboard Navigation**: Todos os elementos navegáveis via teclado
- **Screen Readers**: Aria-labels e landmarks apropriados
- **Focus Management**: Indicadores visuais claros

### Performance

- **Core Web Vitals**: LCP < 2.5s, FID < 100ms, CLS < 0.1
- **Image Optimization**: WebP/AVIF com fallback JPEG
- **Lazy Loading**: Imagens e componentes fora da viewport
- **Code Splitting**: Chunks otimizados por rota

### Micro-interações

- **Loading States**: Skeletons para carregamento
- **Hover Effects**: Feedback visual em elementos interativos
- **Transitions**: Animações suaves (200-300ms)
- **Empty States**: Ilustrações e CTAs para estados vazios

---

## 🔄 Fluxos de Usuário Principais

### 1. **Exploração de Anúncios**

```
Landing → Selecionar Tema → Aplicar Filtros → Navegar Grid → Ver Detalhes → Explorar Variações
```

### 2. **Busca e Filtragem**

```
Busca Textual → Filtros Combinados → Resultados Filtrados → Salvar na URL → Compartilhar Link
```

### 3. **Export de Dados**

```
Aplicar Filtros → Botão Export → Configurar Campos → Download CSV → Análise Externa
```

### 4. **Troca de Contexto**

```
Theme Switcher → Selecionar Marca → Atualizar Competidores → Recarregar Dados → Nova Visualização
```

---

## 📊 Métricas e Analytics

### KPIs do Produto

- **Engagement**: Tempo na página, cliques em anúncios
- **Filtros**: Filtros mais utilizados, combinações populares
- **Export**: Frequência de downloads, campos mais exportados
- **Temas**: Distribuição de uso por tema/marca

### Tracking de Eventos

```typescript
// Eventos para analytics
interface AnalyticsEvents {
  ad_viewed: { adId: string; competitor: string; theme: string };
  filter_applied: { filterType: string; value: string };
  export_downloaded: { recordCount: number; format: string };
  theme_switched: { from: string; to: string };
  search_performed: { query: string; resultsCount: number };
}
```

---

## 🧪 Testes e Qualidade

### Estratégia de Testes

- **Unit Tests**: Utilities, hooks, componentes isolados
- **Integration Tests**: Fluxos de filtros, APIs
- **E2E Tests**: Jornadas críticas do usuário
- **Visual Regression**: Screenshots automatizados

### Ferramentas

```json
{
  "devDependencies": {
    "@testing-library/react": "^13.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "jest": "^29.0.0",
    "jest-environment-jsdom": "^29.0.0",
    "playwright": "^1.40.0",
    "chromatic": "^7.0.0"
  }
}
```

---

## 🚀 Roadmap de Implementação

### Fase 1: Core (Semana 1-2)

- [ ] Setup do projeto Next.js + TypeScript
- [ ] Configuração Supabase + Schema
- [ ] Componentes UI base
- [ ] Sistema de temas básico
- [ ] Layout responsivo

### Fase 2: Funcionalidades (Semana 3-4)

- [ ] Sistema de filtros completo
- [ ] Grid de anúncios com paginação
- [ ] Modal de detalhes
- [ ] Sistema de tags
- [ ] API routes

### Fase 3: Otimização (Semana 5)

- [ ] Performance optimization
- [ ] Export CSV
- [ ] Testes automatizados
- [ ] Deploy Vercel
- [ ] Analytics

### Fase 4: Refinamento (Semana 6)

- [ ] Polimento UI/UX
- [ ] Acessibilidade
- [ ] Documentação
- [ ] Monitoramento
- [ ] Feedback e iteração

---

## 📚 Documentação Adicional

### README.md Sugerido

```markdown
# Edge Intelligence Hub

Plataforma de análise de anúncios de concorrentes com múltiplos temas corporativos.

## Quick Start

1. `npm install`
2. Configure `.env.local` com credenciais Supabase
3. `npm run dev`

## Scripts

- `npm run dev` - Desenvolvimento
- `npm run build` - Build produção
- `npm run test` - Testes
- `npm run lint` - Linting
```

### Contribuição

- **Code Style**: Prettier + ESLint
- **Commits**: Conventional Commits
- **PRs**: Template com checklist
- **Issues**: Templates por tipo (bug, feature, etc.)

---

---

## 🎨 Instruções para Extração de Cores dos Sites

### Ferramentas Recomendadas

1. **ColorZilla (Extensão Chrome/Firefox)**
   - Instalar: [Chrome Web Store](https://chrome.google.com/webstore/detail/colorzilla/bhlhnicpbhignbdhedgjhgdocnmhomnp)
   - Usar: Clicar no ícone → "Pick Color from Page" → Clicar no elemento desejado

2. **Ferramentas de Desenvolvedor do Navegador**
   - Pressionar `F12` → Inspecionar elemento → Verificar propriedades CSS
   - Buscar por `color`, `background-color`, `border-color`, etc.

3. **Web Colour Data (Online)**
   - Acessar: [Web Colour Data](https://webcolourdata.com/)
   - Inserir URL do site → Obter paleta completa

### Sites para Análise

- **CloudWalk**: https://www.cloudwalk.io
- **InfinitePay**: https://www.infinitepay.io
- **JIM**: https://www.jim.com

### Elementos a Extrair

Para cada site, extrair cores dos seguintes elementos:

- **Header/Navigation**: Cor de fundo, texto, botões
- **Botões Primários**: Background, hover, texto
- **Botões Secundários**: Background, hover, texto
- **Links**: Cor normal, hover, visitado
- **Backgrounds**: Seções principais, cards, modais
- **Textos**: Títulos, subtítulos, corpo, muted
- **Borders**: Cards, inputs, divisores
- **Gradientes**: Se houver, capturar início e fim

### Formato de Atualização

Após extrair as cores, substituir os `#XXXXXX` no CSS pelos códigos reais:

```css
[data-theme="cloudwalk"] {
  --color-primary: #CÓDIGO_REAL;
  --cloudwalk-green: #CÓDIGO_REAL;
  --cloudwalk-dark: #CÓDIGO_REAL;
  /* etc... */
}
```

---

## 📋 Checklist de Implementação

### ✅ Concluído

- [x] Schema do banco atualizado com tabelas reais
- [x] Interfaces TypeScript alinhadas com schema
- [x] Consultas SQL otimizadas para o schema real
- [x] Lista de competidores corrigida
- [x] Estrutura de projeto detalhada
- [x] **Cores reais extraídas das capturas de tela**
- [x] **CSS Custom Properties atualizadas com cores reais**
- [x] **Paletas de cores documentadas por tema**
- [x] **Entendimento correto dos campos e uso real**
- [x] **Campo `asset` removido - não é utilizado**
- [x] **Foco em textos, transcrições e análises**
- [x] **🚨 APENAS LEITURA - sem inserções no banco**
- [x] **🚫 SEM BANCO VETORIAL - apenas consultas ILIKE**
- [x] **💳 Conceito de cards com taxas e produtos**
- [x] **📊 Extração de taxas dos textos**
- [x] **🔮 Planejamento futuro da KB**
- [x] **🎨 Sistema de troca de temas (InfinitePay, JIM, CloudWalk)**
- [x] **📱 Cards interativos com hover e click**
- [x] **🗂️ Múltiplos exemplos de dados (Mercado Pago, Stone, PagBank, Square)**
- [x] **⚙️ Context e Provider para temas**
- [x] **🏠 Header com logo clicável que muda por tema**
- [x] **🎯 Dropdown de seleção de perspectiva**
- [x] **🔄 Filtro automático de competidores por tema**
- [x] **🎨 Especificação detalhada das cores por tema**
- [x] **📋 Instruções específicas para V0**

### 🔄 Pendente

- [ ] Testar consultas SQL no Supabase
- [ ] Implementar troca de temas no layout principal
- [ ] Conectar filtros com escopo de competidores por tema
- [ ] Usar mock data como fallback quando necessário

---

Este prompt melhorado fornece uma especificação técnica completa e detalhada para construir o **Edge Intelligence Hub** com todas as funcionalidades, estrutura de arquivos, configurações e requisitos necessários para um desenvolvimento eficiente e profissional.

**O schema do banco foi atualizado com as tabelas reais do Supabase, as consultas SQL foram otimizadas para o schema atual, e os competidores foram corrigidos conforme suas especificações. As cores dos temas estão marcadas para atualização com as cores reais extraídas dos sites.**
