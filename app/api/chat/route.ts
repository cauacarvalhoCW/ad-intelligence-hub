/**
 * Chat API endpoint using LangChain.js and LangGraph Agent
 * Handles conversational AI with session management, tool calling and error handling
 */

import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

import {
  ChatRequest,
  ChatResponse,
  ChatbotError,
  ChatbotErrorCode,
  CHATBOT_CONFIG,
  LangChainMessage,
  AgentResponse,
  chatRequestSchema,
} from "@/lib/types/chat";
import { getChatbotAgent } from "@/lib/agents";

// In-memory session storage (use Redis in production for scalability)
const sessionHistory = new Map<string, LangChainMessage[]>();

// Agent initialization
let chatbotAgent: ReturnType<typeof getChatbotAgent> | null = null;

function initializeChatbotAgent(): ReturnType<typeof getChatbotAgent> {
  if (!chatbotAgent) {
    if (!process.env.OPENAI_API_KEY) {
      throw new ChatbotError(
        ChatbotErrorCode.INTERNAL_ERROR,
        "OPENAI_API_KEY não configurada. Verifique o arquivo .env.local",
      );
    }

    chatbotAgent = getChatbotAgent(process.env.OPENAI_API_KEY);
  }
  return chatbotAgent;
}

// Structured logging utilities for debugging and monitoring

type LogLevel = "info" | "error" | "warn" | "debug";

function logChatActivity(
  level: LogLevel,
  message: string,
  data?: Record<string, unknown>,
) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [CHAT-${level.toUpperCase()}] ${message}`;

  if (data) {
    console.log(logMessage, JSON.stringify(data, null, 2));
  } else {
    console.log(logMessage);
  }
}

// Session management utilities

function getSessionHistory(sessionId: string): LangChainMessage[] {
  if (!sessionHistory.has(sessionId)) {
    sessionHistory.set(sessionId, []);
  }
  return sessionHistory.get(sessionId) || [];
}

function saveMessageToHistory(
  sessionId: string,
  message: LangChainMessage,
): void {
  const history = getSessionHistory(sessionId);
  history.push(message);

  // Prevent memory bloat by trimming old messages (keeps last 50 by default)
  if (history.length > CHATBOT_CONFIG.MAX_HISTORY_LENGTH) {
    history.splice(0, 10); // Remove oldest 10 messages to maintain sliding window
    logChatActivity("info", "Session history trimmed", {
      sessionId,
      newLength: history.length,
    });
  }

  sessionHistory.set(sessionId, history);
}

// Agent-based message processing

async function processMessageWithAgent(
  sessionId: string,
  newMessage: string,
  userId?: string,
): Promise<AgentResponse> {
  const agent = initializeChatbotAgent();
  const history = getSessionHistory(sessionId);

  // Convert history to the format expected by agent
  const historyMessages = history.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));

  logChatActivity("info", "Processing message with agent", {
    sessionId,
    userId,
    messageLength: newMessage.length,
    historyLength: history.length,
    availableTools: agent.getAvailableTools(),
  });

  const result = await agent.processMessage(
    newMessage,
    sessionId,
    userId,
    historyMessages,
  );

  return result;
}

// Error handling utilities

function createErrorResponse(
  error: ChatbotError,
  statusCode: number = 500,
): NextResponse {
  logChatActivity("error", `Erro ${error.code}: ${error.message}`, {
    sessionId: error.sessionId,
    statusCode,
    details: error.details,
  });

  return NextResponse.json(
    {
      error: {
        code: error.code,
        message: error.message,
        sessionId: error.sessionId,
        timestamp: new Date(),
      },
    },
    { status: statusCode },
  );
}

// Input validation using Zod schemas

function validateRequest(body: unknown): ChatRequest {
  try {
    return chatRequestSchema.parse(body);
  } catch (error) {
    if (error instanceof Error) {
      throw new ChatbotError(
        ChatbotErrorCode.VALIDATION_ERROR,
        `Dados inválidos: ${error.message}`,
      );
    }
    throw new ChatbotError(
      ChatbotErrorCode.VALIDATION_ERROR,
      "Dados de entrada inválidos",
    );
  }
}

// API endpoints

/**
 * Handles chat message requests and returns AI responses
 * Processes user input through LangGraph agent, manages conversation history, and generates responses
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let sessionId: string | undefined;

  try {
    logChatActivity("info", "Nova requisição de chat recebida");

    // 1. Validate input
    const body = await request.json();
    const chatRequest = validateRequest(body);
    sessionId = chatRequest.sessionId;

    logChatActivity("info", "Requisição validada", {
      sessionId,
      userId: chatRequest.userId,
      messageLength: chatRequest.message.length,
    });

    // 2. Process message with LangGraph agent
    logChatActivity("info", "Processando mensagem com LangGraph agent", {
      sessionId,
    });

    const agentResult = await processMessageWithAgent(
      sessionId!,
      chatRequest.message,
      chatRequest.userId,
    );

    // 3. Save messages to history
    saveMessageToHistory(sessionId!, {
      role: "user",
      content: chatRequest.message,
    });
    saveMessageToHistory(sessionId!, {
      role: "assistant",
      content: agentResult.response,
    });

    // 4. Create response with agent metadata
    const chatResponse: ChatResponse = {
      response: agentResult.response,
      sessionId: sessionId!,
      messageId: uuidv4(),
      timestamp: new Date(),
      metadata: {
        model: agentResult.metadata.model,
        processingTime: agentResult.metadata.processingTime,
        tokensUsed: undefined, // Will be available in future LangGraph versions
        toolCalls: agentResult.metadata.toolCallsCount,
        agentVersion: "2.0",
      },
    };

    logChatActivity("info", "Resposta gerada com sucesso", {
      sessionId,
      responseLength: chatResponse.response.length,
      processingTime: `${chatResponse.metadata?.processingTime}ms`,
      toolCalls: chatResponse.metadata?.toolCalls,
      agentVersion: chatResponse.metadata?.agentVersion,
    });

    return NextResponse.json(chatResponse);
  } catch (error) {
    if (error instanceof ChatbotError) {
      return createErrorResponse(
        error,
        error.code === ChatbotErrorCode.VALIDATION_ERROR ? 400 : 500,
      );
    }

    const chatError = new ChatbotError(
      ChatbotErrorCode.INTERNAL_ERROR,
      error instanceof Error ? error.message : "Erro interno do servidor",
      sessionId,
    );

    return createErrorResponse(chatError, 500);
  }
}

/**
 * Returns system health status and configuration information
 * Used for monitoring and debugging purposes
 */
export async function GET() {
  try {
    const isConfigured = !!process.env.OPENAI_API_KEY;
    const activeSessions = sessionHistory.size;

    let agentInfo = null;
    if (isConfigured) {
      try {
        const agent = initializeChatbotAgent();
        agentInfo = {
          availableTools: agent.getAvailableTools(),
          modelInfo: agent.getModelInfo(),
          configuration: agent.getConfiguration(),
          agentVersion: "2.0",
        };
      } catch (error) {
        agentInfo = { error: "Erro ao inicializar agente" };
      }
    }

    return NextResponse.json({
      status: "ok",
      configured: isConfigured,
      activeSessions,
      timestamp: new Date().toISOString(),
      version: "2.0.0",
      agentSystem: {
        enabled: true,
        type: "LangGraph Agent",
        agentInfo,
      },
      features: {
        streaming: agentInfo?.configuration?.streaming?.enabled || false,
        rag: agentInfo?.configuration?.rag?.enabled || false,
        tools: (agentInfo?.availableTools?.length || 0) > 0,
        toolsList: agentInfo?.availableTools || [],
      },
    });
  } catch (error) {
    const chatError = new ChatbotError(
      ChatbotErrorCode.INTERNAL_ERROR,
      "Erro ao verificar status do sistema",
    );
    return createErrorResponse(chatError, 500);
  }
}

/**
 * Clears conversation history for a specific session
 * Helps manage memory usage and user privacy
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      throw new ChatbotError(
        ChatbotErrorCode.VALIDATION_ERROR,
        "sessionId é obrigatório",
      );
    }

    sessionHistory.delete(sessionId);

    logChatActivity("info", "Sessão limpa", { sessionId });

    return NextResponse.json({
      success: true,
      sessionId,
      timestamp: new Date(),
    });
  } catch (error) {
    if (error instanceof ChatbotError) {
      return createErrorResponse(error, 400);
    }

    const chatError = new ChatbotError(
      ChatbotErrorCode.INTERNAL_ERROR,
      "Erro ao limpar sessão",
    );
    return createErrorResponse(chatError, 500);
  }
}
