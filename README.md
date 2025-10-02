# EspiADinha - AD Intelligence Hub

Uma plataforma avançada de inteligência competitiva para análise de anúncios digitais, desenvolvida com Next.js 15, React 19 e tecnologias de ponta.

## 🎯 Visão Geral

O **EspiADinha** é uma ferramenta de business intelligence especializada em monitoramento e análise de campanhas publicitárias de concorrentes. A plataforma oferece insights estratégicos através de dashboards interativos, análises automatizadas e um assistente de IA conversacional.

### Principais Funcionalidades

- 📊 **Dashboard Interativo**: Visualização em tempo real de anúncios de concorrentes
- 🤖 **Assistente IA**: Chatbot inteligente com acesso aos dados via LangGraph
- 📈 **Analytics Avançados**: Métricas detalhadas e análises competitivas
- 🎨 **Multi-Perspectiva**: Visualização personalizada por empresa (CloudWalk, InfinitePay, JIM)
- 🔍 **Busca Inteligente**: Filtros avançados por competidor, tipo de mídia, período e conteúdo
- 📱 **Responsivo**: Interface otimizada para desktop e mobile

## 🏗️ Arquitetura

### Stack Tecnológico

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **UI/UX**: Tailwind CSS, Radix UI, shadcn/ui
- **Autenticação**: Clerk (com controle de domínio @cloudwalk.io)
- **Banco de Dados**: Supabase (PostgreSQL)
- **IA/ML**: OpenAI GPT, LangChain, LangGraph
- **Estado**: TanStack Query (React Query)
- **Deployment**: Vercel

### Estrutura do Projeto

```
ad-intelligence-hub/
├── app/                          # Next.js App Router
│   ├── (protected)/             # Rotas protegidas por autenticação
│   ├── api/                     # API Routes
│   │   ├── ads/                 # Endpoint de anúncios
│   │   ├── analytics/           # Endpoint de analytics
│   │   └── chat/                # Endpoint do chatbot IA
│   ├── sign-in/                 # Páginas de autenticação
│   └── sign-up/
├── components/                   # Componentes React globais
│   ├── chat/                    # Sistema de chat IA
│   └── ad-dashboard.tsx         # Dashboard principal
├── features/                     # Módulos de funcionalidades
│   ├── ads/                     # Sistema de anúncios
│   │   ├── components/          # Componentes específicos
│   │   ├── hooks/               # React hooks
│   │   ├── server/              # Lógica server-side
│   │   └── types/               # Tipos TypeScript
│   └── analytics/               # Sistema de analytics
├── lib/                         # Bibliotecas e utilitários
│   ├── agents/                  # Sistema de IA (LangGraph)
│   │   ├── chatbot-agent.ts     # Agente principal
│   │   └── tools/               # Ferramentas do agente
│   ├── supabase/                # Cliente Supabase
│   └── auth-helpers.ts          # Helpers de autenticação
├── shared/                      # Componentes UI compartilhados
│   └── ui/                      # shadcn/ui components
└── middleware.ts                # Middleware de autenticação
```

## 🚀 Funcionalidades Detalhadas

### 1. Dashboard de Anúncios

O dashboard principal oferece:

- **Visualização em Grid**: Cards interativos com preview de anúncios
- **Filtros Avançados**: Por competidor, tipo de mídia, período, plataforma
- **Paginação Inteligente**: Navegação otimizada para grandes volumes
- **Modal Detalhado**: Visualização completa com análise IA

### 2. Sistema de Analytics

Múltiplas visões analíticas:

- **Analytics Geral**: Métricas agregadas e tendências
- **Análise Competitiva**: Comparação entre concorrentes
- **Análise de Tendências**: Padrões temporais e sazonalidade
- **Extração de Taxas**: Identificação automática de preços e ofertas

### 3. Assistente IA (EspiADinha)

Chatbot inteligente com:

- **LangGraph Agent**: Arquitetura de agente conversacional
- **Ferramentas Especializadas**: Acesso direto ao banco de dados
- **Contexto Persistente**: Histórico de conversas por sessão
- **Interface Responsiva**: Chat widget redimensionável

### 4. Sistema de Perspectivas

Visualização personalizada por empresa:

- **CloudWalk**: Perspectiva padrão
- **InfinitePay**: Foco em concorrentes específicos
- **JIM**: Análise direcionada
- **Padrão**: Visão geral do mercado

## 🔧 Configuração e Instalação

### Pré-requisitos

- Node.js 18+
- npm/pnpm
- Conta Supabase
- Conta Clerk
- API Key OpenAI

### Variáveis de Ambiente

Crie um arquivo `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Vercel Analytics (opcional)
VERCEL_ANALYTICS_ID=your_analytics_id
```

### Instalação

```bash
# Clone o repositório
git clone https://github.com/your-org/edge-intelligence-hub.git
cd edge-intelligence-hub

# Instale as dependências
pnpm install

# Execute em desenvolvimento
pnpm dev

# Build para produção
pnpm build
pnpm start
```

## 📊 Estrutura do Banco de Dados

### Tabelas Principais

#### `competitors`
```sql
- id: string (PK)
- name: string
- home_url: string
- created_at: timestamp
- updated_at: timestamp
```

#### `ads`
```sql
- ad_id: string (PK)
- competitor_id: string (FK)
- source: string
- asset_type: enum('image', 'video', 'text')
- product: string
- platform: enum('GOOGLE', 'META')
- start_date: date
- tags: text
- image_description: text
- transcription: text
- ad_analysis: jsonb
- created_at: timestamp
```

## 🤖 Sistema de IA

### Arquitetura do Agente

O assistente IA utiliza **LangGraph** para criar um fluxo conversacional estruturado:

```typescript
// Fluxo do Agente
START → Agent → Tools → Agent → END
```

### Ferramentas Disponíveis

1. **ads_query**: Consulta anúncios no banco
2. **analytics_query**: Gera métricas e insights
3. **datetime**: Manipulação de datas
4. **calc**: Cálculos matemáticos

### Configuração do Agente

```typescript
const agentConfig = {
  model: {
    name: "gpt-4o-mini",
    temperature: 0.1,
    maxTokens: 2000
  },
  limits: {
    toolCalls: 10,
    recursion: 15
  },
  tools: {
    enabled: ["ads_query", "analytics_query", "datetime", "calc"]
  }
}
```

## 🔐 Autenticação e Segurança

### Sistema de Autenticação

- **Clerk**: Gerenciamento completo de usuários
- **Controle de Domínio**: Acesso restrito a emails @cloudwalk.io
- **Middleware**: Proteção automática de rotas
- **Redirects**: Fluxo inteligente de autenticação

### Estrutura de Proteção

```typescript
// Middleware de autenticação
export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return NextResponse.next();
  
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }
  
  return NextResponse.next();
});
```

## 📱 Interface e UX

### Design System

- **Tema Adaptativo**: Dark/Light mode
- **Componentes Reutilizáveis**: shadcn/ui
- **Responsividade**: Mobile-first approach
- **Acessibilidade**: WCAG 2.1 compliance

### Componentes Principais

- **AdCard**: Card de anúncio com preview
- **AdFilters**: Sistema de filtros avançados
- **ChatWidget**: Interface do assistente IA
- **AnalyticsDashboard**: Dashboards de métricas

## 🔄 Fluxo de Dados

### Arquitetura de Estado

```
UI Components → React Query → API Routes → Supabase
                    ↓
              Cache & Sync ← Server State
```

### Hooks Personalizados

- `useAds()`: Gerencia dados de anúncios
- `useAnalytics()`: Controla métricas
- `useChat()`: Estado do chatbot
- `useCompetitors()`: Lista de concorrentes

## 🚀 Deploy e Produção

### Vercel Deployment

```bash
# Deploy automático via Git
git push origin main

# Deploy manual
vercel --prod
```

### Otimizações

- **Next.js 15**: App Router com streaming
- **React 19**: Concurrent features
- **Image Optimization**: Next.js Image component
- **Bundle Splitting**: Lazy loading de componentes

## 📈 Monitoramento

### Analytics

- **Vercel Analytics**: Métricas de performance
- **Console Logging**: Debug estruturado
- **Error Boundaries**: Tratamento de erros

### Performance

- **Core Web Vitals**: Otimização contínua
- **Caching**: React Query + Supabase
- **Lazy Loading**: Componentes sob demanda

## 🤝 Contribuição

### Padrões de Código

- **TypeScript**: Tipagem estrita
- **ESLint**: Linting automático
- **Prettier**: Formatação consistente
- **Conventional Commits**: Padronização de commits

### Estrutura de Features

```typescript
features/
└── feature-name/
    ├── components/     # Componentes específicos
    ├── hooks/         # React hooks
    ├── server/        # Lógica server-side
    ├── types/         # Tipos TypeScript
    └── index.ts       # Exports públicos
```

## 📄 Licença

Este projeto é propriedade da CloudWalk e está sob licença proprietária.

## 🆘 Suporte

Para suporte técnico ou dúvidas:

- **Email**: dev@cloudwalk.io
- **Slack**: #edge-intelligence-hub
- **Documentação**: [Internal Wiki]

---

**EspiADinha** - Transformando dados de anúncios em inteligência competitiva 🚀