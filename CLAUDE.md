# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Ad Intelligence Hub** is a competitive intelligence platform for analyzing digital ads from competitors. It features:
- Multi-perspective theme system (CloudWalk, InfinitePay, JIM, Default) with automatic data filtering
- Real-time analytics and metrics on competitor ads
- AI-powered conversational chat using LangGraph agents
- Advanced filtering and search capabilities
- Rate/pricing extraction and competitive analysis

## Development Commands

```bash
# Development
npm run dev              # Start dev server on port 3000

# Build
npm run build           # Production build (ESLint/TypeScript errors are ignored via next.config.mjs)

# Linting
npm run lint            # Run ESLint

# Production
npm start               # Start production server
```

## Architecture

### Routing Structure

The app uses Next.js 15 App Router with a perspective-based routing system:

- **`/[perspectiva]/concorrente`**: Main dashboard route (e.g., `/default/concorrente`, `/cloudwalk/concorrente`)
  - `perspectiva` is validated via `isValidPerspective()` in [lib/utils/url-params.ts](lib/utils/url-params.ts)
  - Valid perspectives: `cloudwalk`, `infinitepay`, `jim`, `default`
  - Invalid perspectives redirect to `/default/concorrente`

- **Legacy route**: `/` redirects to `/default/concorrente`

### Data Architecture

**Supabase Tables:**
- `competitors`: Competitor information (id, name, home_url)
- `ads`: Ad records (ad_id, competitor_id, asset_type, product, start_date, tags, image_description, transcription, platform)
- `variations`: Ad variations (variation_id, parent_ad_id, title, description, button_label, button_url)

**Type Definitions**: All core types are in [lib/types.ts](lib/types.ts):
- `Ad`: Main ad interface with competitor joins
- `Competitor`: Competitor entity
- `ThemeConfig`: Theme/perspective configuration
- `FilterState`: Filter state for ad queries

### AI Chat System (LangGraph Agent)

The chat system uses **LangGraph** for agentic workflows with tool calling:

- **Agent**: [lib/agents/chatbot-agent.ts](lib/agents/chatbot-agent.ts)
  - Implements StateGraph with tool nodes
  - Configurable via [lib/agents/config/agent-config.ts](lib/agents/config/agent-config.ts)
  - Session management with conversation history
  - Recursion limits and tool call budgets

- **Tools**: [lib/agents/tools/](lib/agents/tools/)
  - `supabase-ads.ts`: Query ads (list/count/search) with date ranges and competitor filtering
  - `supabase-analytics.ts`: Analytics queries (competitor stats, platform distribution, top ads)
  - `calc.ts`: Math calculations
  - `datetime.ts`: Date/time utilities

- **API Endpoint**: [app/api/chat/route.ts](app/api/chat/route.ts)
  - POST: Process messages through LangGraph agent
  - GET: System health check
  - DELETE: Clear session history

**Agent System Prompt**: Defined in `CHATBOT_CONFIG.SYSTEM_PROMPT` in [lib/types/chat.ts](lib/types/chat.ts)

### Supabase Integration

- **Client-side**: `supabaseClient` from [lib/supabase/client.ts](lib/supabase/client.ts) (uses `createBrowserClient`)
- **Server-side**: `createSupabaseServer()` from [lib/supabase/server.ts](lib/supabase/server.ts) (uses `createServerClient` with service role key)
- **Environment variables required**:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `OPENAI_API_KEY` (for chat agent)

### Theme/Perspective System

Themes are configured in [lib/themes.ts](lib/themes.ts) with:
- Color schemes and logos
- Metadata (description, competitor scope)
- Automatic filtering based on `competitorScope`

Theme selection persists via context and affects:
- UI colors and branding
- Data filtering (competitor scope)
- Analytics calculations

## Important Patterns

### Date Handling in Tools

Tools use `America/Sao_Paulo` timezone. The `supabase-ads` tool supports:
- Date presets: `today`, `yesterday`, `last_7_days`, `last_30_days`, `this_week`, `this_month`
- Natural language: Interprets "ontem", "hoje", "últimos 7 dias", etc.
- Custom ranges: `date_from` and `date_to` in `YYYY-MM-DD` format

### Ad Display

- Facebook Ads Library URL: `https://www.facebook.com/ads/library/?id={ad_id}`
- Never display the `source` field directly (it may be unavailable)
- Always include `ad_id` in responses

### Agent Tool Calling

- Tools return structured `ToolResult` with `success`, `data`, `error`, and `metadata`
- Agent has tool call limits (default 15) and recursion limits (default 25)
- Friendly error messages for recursion limits: Suggests user to specify competitor and period

## Configuration Notes

- **next.config.mjs**: ESLint and TypeScript errors are ignored during builds (`ignoreDuringBuilds: true`, `ignoreBuildErrors: true`)
- **Images**: Unoptimized mode enabled
- **Port**: Default Next.js dev server runs on `localhost:3000`

## Key Components

- **Dashboard**: [components/ad-dashboard.tsx](components/ad-dashboard.tsx) - Main ad grid and filters
- **Chat**: [components/chat/ChatWidget.tsx](components/chat/ChatWidget.tsx) - Conversational UI
- **Analytics**: Analytics components are colocated with their feature modules
- **Header**: [components/header.tsx](components/header.tsx) - Contains theme selector and navigation

## Testing the Chat System

Use the chat to:
- List ads: "Mostre os últimos anúncios do Mercado Pago"
- Count ads: "Quantos anúncios a PagBank publicou nos últimos 30 dias?"
- Search: "Busque anúncios sobre 'taxa zero'"
- Analytics: "Qual competidor tem mais anúncios esta semana?"

The agent will automatically select appropriate tools and date ranges based on natural language input.
