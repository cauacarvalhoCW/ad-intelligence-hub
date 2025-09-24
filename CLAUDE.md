# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Linting
npm run lint
```

## Architecture Overview

This is **EspiADinha** (Edge Intelligence Hub), a competitive ad intelligence platform built with Next.js 15 and React 19. The application analyzes competitor ads with different business perspectives and AI-powered analytics.

### Core Architecture Patterns

- **Next.js App Router** with TypeScript for full-stack functionality
- **Feature-based architecture** in `/features/` directory with modular organization
- **Multi-theme system** supporting different business perspectives (CloudWalk, InfinitePay, JIM, Default)
- **AI-powered chat system** with LangGraph agents and RAG pipeline
- **Authentication** via Clerk with protected routes
- **Database** integration with Supabase for ads and analytics data

### Directory Structure

```
/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (chat, ads, analytics, competitors)
│   ├── (protected)/       # Protected pages requiring auth
│   └── sign-in|sign-up/   # Auth pages
├── components/            # Shared React components
│   ├── chat/             # Chat widget components
│   └── providers/        # React providers
├── features/             # Feature modules (primary architecture)
│   ├── ads/              # Ad management feature
│   │   ├── components/   # Ad-specific UI components
│   │   ├── hooks/        # React hooks
│   │   ├── server/       # Server-side logic
│   │   └── types/        # TypeScript definitions
│   └── analytics/        # Analytics feature
│       ├── components/   # Analytics UI components
│       ├── hooks/        # Analytics hooks
│       ├── server/       # Analytics server logic
│       └── types/        # Analytics types
├── hooks/                # Global React hooks
├── lib/                  # Utilities and configurations
│   ├── agents/          # AI agents and tools
│   ├── rag/             # RAG pipeline implementation
│   ├── supabase/        # Database client/server
│   └── utils/           # Helper functions
└── public/              # Static assets
```

### Key Technologies & Libraries

- **Frontend**: Next.js 15.2.4, React 19, TypeScript, Tailwind CSS 4.1.9
- **UI Components**: Radix UI (complete design system)
- **Auth**: Clerk (@clerk/nextjs)
- **Database**: Supabase (@supabase/supabase-js)
- **AI/Chat**: LangChain (@langchain/core, @langchain/langgraph, @langchain/openai)
- **Data Fetching**: TanStack Query (@tanstack/react-query)
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod validation

### Multi-Theme System

The app supports 4 business perspectives with automatic competitor filtering:

1. **CloudWalk** - Global view (BR + US competitors)
2. **InfinitePay** - Brazilian market (PagBank, Stone, Cora, Ton, Mercado Pago, Jeitto)
3. **JIM** - US market (Square, PayPal, Stripe, Venmo, SumUp)
4. **Default** - Complete view (all competitors)

Theme configuration is in `lib/themes.ts` with persistent localStorage and CSS class application.

### AI Chat System

- **LangGraph agents** in `lib/agents/` with specialized tools for Supabase queries
- **RAG pipeline** in `lib/rag/` for context-aware responses
- **Tool system** includes calculators, datetime helpers, and database query tools
- **Streaming responses** via API routes in `app/api/chat/`

### Feature Module Pattern

Each feature (ads, analytics) follows this structure:
- `components/` - React components
- `hooks/` - Custom React hooks
- `server/` - Server-side logic (services, params, constants)
- `types/` - TypeScript definitions
- `index.ts` - Public API exports

### Database Schema (Supabase)

Key entities:
- **ads** - Ad records with competitor_id, asset_type, analysis data
- **competitors** - Competitor information with home_url
- **tags** - Tagging system for ads
- **ad_tags** - Many-to-many relationship

### Authentication & Routes

- **Public routes**: `/sign-in`, `/sign-up`, `/access-denied`
- **Protected routes**: Everything under `/(protected)/`
- **API protection**: Server-side auth helpers in `lib/auth-helpers.ts`

### Configuration Notes

- **ESLint/TypeScript**: Builds ignore errors (ignoreDuringBuilds: true, ignoreBuildErrors: true)
- **Images**: Unoptimized for flexibility
- **Fonts**: Geist Sans & Mono via geist package
- **Analytics**: Vercel Analytics integrated

### Development Best Practices

- Use feature modules for new functionality
- Follow the established TypeScript patterns in `lib/types.ts`
- Leverage existing Radix UI components
- Maintain theme consistency across perspectives
- Use TanStack Query for server state management
- Follow the existing API route patterns for new endpoints