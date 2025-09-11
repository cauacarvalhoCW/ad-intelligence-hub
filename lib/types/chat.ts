/**
 * TypeScript type definitions for the chat system
 * Defines interfaces, schemas, and utility types for chat functionality
 */

import { z } from "zod";

// Core type definitions

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  sessionId: string;
}

export interface ChatSession {
  id: string;
  userId?: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  metadata?: SessionMetadata;
}

export interface SessionMetadata {
  userAgent?: string;
  ip?: string;
  referrer?: string;
  totalMessages?: number;
  lastActivity?: Date;
}

// API communication types

export interface ChatRequest {
  message: string;
  sessionId?: string;
  userId?: string;
  context?: RequestContext;
}

export interface RequestContext {
  page?: string;
  referrer?: string;
  userAgent?: string;
}

export interface ChatResponse {
  response: string;
  sessionId: string;
  messageId: string;
  timestamp: Date;
  metadata?: ResponseMetadata;
}

export interface ResponseMetadata {
  model: string;
  tokensUsed?: number;
  processingTime?: number;
  finishReason?: "stop" | "length" | "content_filter";
  toolCalls?: number;
  agentVersion?: string;
}

export interface ChatError {
  code: ChatbotErrorCode;
  message: string;
  sessionId?: string;
  timestamp: Date;
  details?: Record<string, unknown>;
}

// LangChain integration types

export interface LangChainMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface LangChainResponse {
  content: string;
  metadata?: {
    model: string;
    tokens?: number;
    finishReason?: string;
  };
}

// Tool and Agent types

export interface ToolCall {
  id: string;
  name: string;
  args: Record<string, any>;
  result?: any;
  timestamp: Date;
  executionTime?: number;
}

export interface AgentResponse {
  response: string;
  toolCalls?: ToolCall[];
  metadata: {
    sessionId: string;
    userId?: string;
    processingTime: number;
    toolCallsCount: number;
    model: string;
    timestamp: Date;
  };
}

export interface ToolResult {
  success: boolean;
  data: any;
  metadata?: {
    executionTime?: number;
    toolName?: string;
    timestamp?: Date;
  };
  error?: string;
}

// Streaming types

export interface StreamingChunk {
  content: string;
  type: "content" | "tool_call" | "tool_result" | "error";
  metadata?: {
    toolName?: string;
    toolArgs?: any;
    toolResult?: any;
    timestamp: Date;
  };
}

export interface StreamingResponse {
  sessionId: string;
  chunks: StreamingChunk[];
  final: boolean;
}

// LangGraph state types

export interface AgentState {
  messages: any[];
  nextStep?: string;
  toolResults?: ToolResult[];
  metadata?: {
    sessionId: string;
    userId?: string;
    processingTime?: number;
    toolCalls?: number;
  };
}

// Configuration updates

export interface AgentConfig {
  model: string;
  temperature: number;
  maxTokens?: number;
  tools: string[];
  enableStreaming: boolean;
  enableRag: boolean;
  ragConfig?: {
    topK: number;
    similarityThreshold: number;
  };
}

// Configuration types

export interface ChatbotConfig {
  model: string;
  temperature: number;
  maxTokens?: number;
  systemPrompt?: string;
  enableStreaming?: boolean;
  enableMemory?: boolean;
}

// Zod validation schemas

export const chatRequestSchema = z.object({
  message: z
    .string()
    .min(1, "Message cannot be empty")
    .max(2000, "Message too long (maximum 2000 characters)")
    .refine(
      (msg) => !/<script|<iframe|<object|<embed/i.test(msg),
      "Forbidden content detected",
    ),

  sessionId: z
    .string()
    .optional()
    .default(
      () =>
        `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    ),

  userId: z.string().optional(),

  context: z
    .object({
      page: z.string().optional(),
      referrer: z.string().optional(),
      userAgent: z.string().optional(),
    })
    .optional(),
});

export const chatResponseSchema = z.object({
  response: z.string().min(1),
  sessionId: z.string(),
  messageId: z.string(),
  timestamp: z.date(),
  metadata: z
    .object({
      model: z.string(),
      processingTime: z.number().positive().optional(),
      tokensUsed: z.number().positive().optional(),
      finishReason: z.enum(["stop", "length", "content_filter"]).optional(),
    })
    .optional(),
});

export const chatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
  timestamp: z.date(),
  sessionId: z.string(),
});

// Error handling types

export enum ChatbotErrorCode {
  INVALID_REQUEST = "INVALID_REQUEST",
  OPENAI_ERROR = "OPENAI_ERROR",
  RATE_LIMIT = "RATE_LIMIT",
  SESSION_ERROR = "SESSION_ERROR",
  INTERNAL_ERROR = "INTERNAL_ERROR",
  VALIDATION_ERROR = "VALIDATION_ERROR",
}

export class ChatbotError extends Error {
  constructor(
    public readonly code: ChatbotErrorCode,
    message: string,
    public readonly sessionId?: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "ChatbotError";
  }
}

// Default configuration constants (for backward compatibility and status endpoint)

export const CHATBOT_CONFIG = {
  MODEL: "gpt-4o-mini",
  TEMPERATURE: 0.2,
  MAX_TOKENS: 1000,
  MAX_HISTORY_LENGTH: 50,
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 horas
  SYSTEM_PROMPT: `Você é um assistente especializado em inteligência de anúncios concorrentes.
Você ajuda usuários a entenderem estratégias de anúncios, analisar campanhas e fornecer insights sobre o mercado de anúncios.

Sempre responda em português brasileiro, seja útil, preciso e profissional.
Use dados e exemplos quando apropriado, mas mantenha as respostas concisas e relevantes.

 Referência rápida do banco (somente estas tabelas/campos):
 - competitors: id, name, home_url, created_at, updated_at
 - ads: ad_id, competitor_id, source, asset_type, product, year, week, start_date, display_format, tags, image_description, transcription

 Regras críticas:
  - Sempre inclua ad_id e source ao listar anúncios.
  - Use apenas as tabelas acima; não invente outras.
  - Ao resumir listas, inclua: empresa (nome), ad_id, asset_type, product, data (start_date).
  - Para contagens/ranqueamentos, destaque o número principal + período.
  - Quando a pergunta mencionar "total", "ao todo" ou não especificar período, interprete como all_time (sem filtro de datas) ao usar ads_analytics.
  - Quando a pergunta mencionar períodos (ontem, últimos X dias, semana, mês), ajuste explicitamente o date_preset antes de consultar.
  - Links: exiba apenas o link do Facebook Ads Library com base no ad_id (https://www.facebook.com/ads/library/?id={ad_id}). Não inclua links diretos de arquivos (vídeo/imagem) do campo source.
  - Para perguntas como "mais antigos" ou "mais recentes", configure a ordenação na ferramenta: sort=oldest ou sort=newest respectivamente.

 Você tem acesso às seguintes ferramentas:
  - datetime: Para obter a data e hora atuais
  - ads_query: Para consultar anúncios no Supabase (listar/contar/buscar). Para perguntas sobre anúncios (ex.: "liste anúncios do Mercado Pago de ontem" ou "quantos vídeos na última semana"), SEMPRE use esta ferramenta.
  - ads_analytics: Para análises agregadas (top competidores, distribuição por tipo de asset, série diária) e buscas full-text via RPCs. Use quando a pergunta envolver ranking, proporções ou tendências.
  - calc: Para operações matemáticas determinísticas (soma, média, percentuais, razão, crescimento). Use para calcular médias semanais, percentuais de vídeos vs imagens, e arredondamentos.

 Diretrizes para respostas no chat:
  - Foque em respostas curtas e claras.
  - Quando listar anúncios, inclua empresa, ad_id, asset_type, produto e data.
  - Quando contar, destaque o número principal e período.
  - Evite formatação pesada; listas simples ou frases objetivas são preferíveis.
  - Inclua links do Ads Library apenas quando o usuário pedir explicitamente (formato: https://www.facebook.com/ads/library/?id={ad_id}). Não inclua 'Fonte' com links do campo source.
  - Ao exibir links, use a URL pura, sem parênteses ou pontuação adjacente (não finalize com ')', ',', '.', ']').`,
} as const;

// Exported utility types

export type ChatRequestInput = z.infer<typeof chatRequestSchema>;
export type ChatResponseOutput = z.infer<typeof chatResponseSchema>;
export type ChatMessageData = z.infer<typeof chatMessageSchema>;

// Additional utility types

export type MessageRole = ChatMessage["role"];
export type SessionId = string;
export type MessageId = string;
export type UserId = string;
