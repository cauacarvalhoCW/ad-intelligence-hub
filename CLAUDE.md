# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**EspiADinha** (Edge Intelligence Hub) is a competitive intelligence platform for analyzing digital advertising campaigns. Built with Next.js 15 and React 19, it provides interactive dashboards, automated analytics, and an AI conversational assistant for monitoring competitor ads.

## Essential Commands

```bash
# Development
npm run dev              # Start dev server on localhost:3000
npm run build           # Build for production
npm start               # Start production server
npm run lint            # Run ESLint

# Testing
./test-api.sh           # Test API endpoints manually (requires jq)
```

## Architecture Overview

### Tech Stack
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **UI**: Tailwind CSS, Radix UI, shadcn/ui
- **Auth**: Clerk (restricted to @cloudwalk.io domain)
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT-4o-mini, LangChain, LangGraph
- **State**: TanStack Query (React Query)

### Project Structure

```
ad-intelligence-hub/
├── app/                          # Next.js App Router
│   ├── (protected)/             # Protected routes (requires auth)
│   │   └── page.tsx             # Main dashboard page
│   ├── api/                     # API Routes
│   │   ├── ads/                 # Ads endpoint
│   │   ├── analytics/           # Analytics endpoint
│   │   ├── chat/                # AI chatbot endpoint (LangGraph)
│   │   └── competitors/         # Competitors endpoint
│   ├── sign-in/                 # Authentication pages
│   └── globals.css              # Global styles
├── components/                   # Global React components
│   ├── chat/                    # AI chat widget system
│   ├── ad-dashboard.tsx         # Main ads dashboard
│   └── ad-filters.tsx           # Advanced filtering UI
├── features/                     # Feature modules (collocated code)
│   ├── ads/                     # Ads feature
│   │   ├── components/          # Ads-specific UI components
│   │   ├── hooks/               # React hooks (useAds, etc.)
│   │   ├── server/              # Server-side logic (service.ts, params.ts)
│   │   └── types/               # TypeScript types
│   └── analytics/               # Analytics feature
│       ├── components/          # Analytics UI
│       ├── hooks/               # React hooks
│       └── server/              # Analytics service logic
├── lib/                         # Shared libraries and utilities
│   ├── agents/                  # LangGraph AI agent system
│   │   ├── chatbot-agent.ts     # Main agent class
│   │   ├── config/              # Agent configuration
│   │   └── tools/               # Agent tools (ads_query, analytics_query, datetime, calc)
│   ├── supabase/                # Supabase client setup
│   ├── auth-helpers.ts          # Authentication utilities
│   └── types.ts                 # Shared TypeScript types
├── shared/                      # Shared UI components
│   └── ui/                      # shadcn/ui components
└── middleware.ts                # Clerk authentication middleware
```

## Key Architectural Patterns

### 1. Feature Module Pattern
The codebase uses a feature-based architecture where related code is colocated:
- `features/ads/` - Everything related to ads (UI, hooks, API logic, types)
- `features/analytics/` - Everything related to analytics

Each feature has:
- `components/` - Feature-specific React components
- `hooks/` - Custom React hooks for data fetching
- `server/` - Server-side business logic (service.ts, params.ts)
- `types/` - TypeScript type definitions
- `index.ts` - Public API exports

### 2. Authentication Flow
All routes except `/sign-in`, `/sign-up`, and `/access-denied` are protected by Clerk middleware. Users must have an `@cloudwalk.io` email domain to access the application.

**Middleware** (`middleware.ts`):
- Intercepts all requests
- Redirects unauthenticated users to `/sign-in`
- Allows authenticated users to proceed

### 3. AI Agent Architecture (LangGraph)
The chatbot uses LangGraph for structured AI workflows:

**Flow**: `START → Agent → Tools → Agent → END`

**Available Tools**:
- `ads_query` - Query ads from Supabase database
- `analytics_query` - Generate metrics and insights
- `datetime` - Date manipulation utilities
- `calc` - Mathematical calculations

**Agent Configuration** (`lib/agents/config/agent-config.ts`):
- Model: GPT-4o-mini
- Temperature: 0.1 (precise answers)
- Max tokens: 2000
- Tool call limit: 10
- Recursion limit: 15

### 4. Data Fetching Pattern
Uses TanStack Query (React Query) for server state management:
- Client components use `useAds()`, `useAnalytics()` hooks
- Data is cached and synchronized automatically
- API routes handle server-side data fetching from Supabase

### 5. Perspective System
The application supports multiple business perspectives:
- **CloudWalk** (default)
- **InfinitePay**
- **JIM**
- **Default** (general market view)

Each perspective filters competitors and customizes the dashboard view.

## Database Schema

### Key Tables

**`competitors`**
- `id` (PK)
- `name`
- `home_url`
- `created_at`, `updated_at`

**`ads`**
- `ad_id` (PK)
- `competitor_id` (FK)
- `source`
- `asset_type` (enum: 'image', 'video', 'text')
- `product`
- `platform` (enum: 'GOOGLE', 'META')
- `start_date`
- `tags`
- `image_description`
- `transcription`
- `ad_analysis` (jsonb)
- `created_at`

## Environment Variables

Required in `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# OpenAI
OPENAI_API_KEY=
```

## Important Notes

### Path Aliases
TypeScript paths are configured with `@/*` mapping to the root directory:
```typescript
import { supabaseClient } from "@/lib/supabase/client"
import { useAds } from "@/features/ads"
```

### Build Configuration
The Next.js config (`next.config.mjs`) has:
- ESLint ignored during builds
- TypeScript errors ignored during builds
- Image optimization disabled

This is intentional for rapid development but should be addressed before production.

### Styling
- Uses Tailwind CSS 4.x with custom configuration
- Dark/light theme support via `next-themes`
- shadcn/ui components in `shared/ui/`
- Global styles in `app/globals.css`

### API Route Pattern
All API routes follow this structure:
```typescript
// app/api/[feature]/route.ts
export async function GET(request: Request) {
  // Extract search params
  // Call service layer (features/[feature]/server/service.ts)
  // Return JSON response
}
```

Service layer handles all business logic and database queries.

## Common Development Tasks

### Adding a New Feature Module
1. Create directory: `features/[feature-name]/`
2. Add subdirectories: `components/`, `hooks/`, `server/`, `types/`
3. Create `index.ts` for public exports
4. Add API route in `app/api/[feature-name]/route.ts`
5. Implement service logic in `server/service.ts`

### Working with the AI Agent
The chatbot agent is in `lib/agents/chatbot-agent.ts`:
- To add new tools, create them in `lib/agents/tools/`
- Register tools in `lib/agents/tools/index.ts`
- Update agent configuration in `lib/agents/config/agent-config.ts`

### Testing the API
Use the provided test script:
```bash
./test-api.sh
```

This tests all major API endpoints with various filter combinations.

## Deployment

The application is deployed on Vercel with automatic deployments from the `main` branch. The project uses:
- Vercel Analytics for performance monitoring
- Next.js 15 streaming and concurrent features
- React 19 server components

## Recent Changes

Based on git history, recent work includes:
- Refactored analytics module into feature-based structure
- Added Google Display cards (video, text, image)
- Added platform logos (Meta, Google)
- Implemented image/video preview functionality
- Collocated analytics UI/hooks and API into feature modules