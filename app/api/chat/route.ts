/**
 * Chat API endpoint using LangChain.js and OpenAI
 * Handles conversational AI with session management and error handling
 */

import { NextRequest, NextResponse } from 'next/server'
import { ChatOpenAI } from '@langchain/openai'
import { 
  SystemMessage, 
  HumanMessage, 
  AIMessage, 
  trimMessages 
} from '@langchain/core/messages'
import { v4 as uuidv4 } from 'uuid'

import {
  ChatRequest,
  ChatResponse,
  ChatbotError,
  ChatbotErrorCode,
  CHATBOT_CONFIG,
  LangChainMessage,
  chatRequestSchema
} from '@/lib/types/chat'

// In-memory session storage (use Redis in production for scalability)
const sessionHistory = new Map<string, LangChainMessage[]>()

// Singleton pattern to avoid model reinitialization on each request

let chatModel: ChatOpenAI | null = null

function initializeChatModel(): ChatOpenAI {
  if (!chatModel) {
    // Ensure API key is configured before model initialization
    if (!process.env.OPENAI_API_KEY) {
      throw new ChatbotError(
        ChatbotErrorCode.INTERNAL_ERROR,
        'OPENAI_API_KEY não configurada. Verifique o arquivo .env.local'
      )
    }

    chatModel = new ChatOpenAI({
      model: CHATBOT_CONFIG.MODEL,
      temperature: CHATBOT_CONFIG.TEMPERATURE,
      maxTokens: CHATBOT_CONFIG.MAX_TOKENS,
      apiKey: process.env.OPENAI_API_KEY,
    })
  }
  return chatModel
}

// Structured logging utilities for debugging and monitoring

type LogLevel = 'info' | 'error' | 'warn' | 'debug'

function logChatActivity(
  level: LogLevel, 
  message: string, 
  data?: Record<string, unknown>
) {
  const timestamp = new Date().toISOString()
  const logMessage = `[${timestamp}] [CHAT-${level.toUpperCase()}] ${message}`

  if (data) {
    console.log(logMessage, JSON.stringify(data, null, 2))
  } else {
    console.log(logMessage)
  }
}

// Session management utilities

function getSessionHistory(sessionId: string): LangChainMessage[] {
  if (!sessionHistory.has(sessionId)) {
    sessionHistory.set(sessionId, [])
  }
  return sessionHistory.get(sessionId) || []
}

function saveMessageToHistory(sessionId: string, message: LangChainMessage): void {
  const history = getSessionHistory(sessionId)
  history.push(message)

  // Prevent memory bloat by trimming old messages (keeps last 50 by default)
  if (history.length > CHATBOT_CONFIG.MAX_HISTORY_LENGTH) {
    history.splice(0, 10) // Remove oldest 10 messages to maintain sliding window
    logChatActivity('info', 'Session history trimmed', { 
      sessionId, 
      newLength: history.length 
    })
  }

  sessionHistory.set(sessionId, history)
}

// Message processing with intelligent trimming

async function processMessages(
  sessionId: string, 
  newMessage: string
): Promise<{ messages: any[], shouldTrim: boolean }> {
  const history = getSessionHistory(sessionId)
  
  // Create LangChain messages
  const systemMessage = new SystemMessage(CHATBOT_CONFIG.SYSTEM_PROMPT)
  const userMessage = new HumanMessage(newMessage)

  // Convert history to LangChain messages
  const historyMessages = history.map(msg =>
    msg.role === 'user'
      ? new HumanMessage(msg.content)
      : new AIMessage(msg.content)
  )

  // Combine all messages
  let allMessages = [systemMessage, ...historyMessages, userMessage]

  // Apply trimming if needed (based on token count)
  const shouldTrim = allMessages.length > 20 // Limit based on number of messages
  
  if (shouldTrim) {
    const trimmer = trimMessages({
      maxTokens: 3000, // Token limit
      strategy: "last",
      tokenCounter: (msgs) => msgs.length * 50, // Simple estimation
      includeSystem: true,
      allowPartial: false,
      startOn: "human",
    })
    
    allMessages = await trimmer.invoke(allMessages)
    logChatActivity('info', 'Messages trimmed', { 
      sessionId, 
      originalLength: historyMessages.length + 2,
      newLength: allMessages.length 
    })
  }

  return { messages: allMessages, shouldTrim }
}

// Error handling utilities

function createErrorResponse(
  error: ChatbotError,
  statusCode: number = 500
): NextResponse {
  logChatActivity('error', `Erro ${error.code}: ${error.message}`, {
    sessionId: error.sessionId,
    statusCode,
    details: error.details
  })

  return NextResponse.json(
    { 
      error: {
        code: error.code,
        message: error.message,
        sessionId: error.sessionId,
        timestamp: new Date()
      }
    },
    { status: statusCode }
  )
}

// Input validation using Zod schemas

function validateRequest(body: unknown): ChatRequest {
  try {
    return chatRequestSchema.parse(body)
  } catch (error) {
    if (error instanceof Error) {
      throw new ChatbotError(
        ChatbotErrorCode.VALIDATION_ERROR,
        `Dados inválidos: ${error.message}`
      )
    }
    throw new ChatbotError(
      ChatbotErrorCode.VALIDATION_ERROR,
      'Dados de entrada inválidos'
    )
  }
}

// API endpoints

/**
 * Handles chat message requests and returns AI responses
 * Processes user input, manages conversation history, and generates responses
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  let sessionId: string | undefined

  try {
    logChatActivity('info', 'Nova requisição de chat recebida')

    // 1. Validate input
    const body = await request.json()
    const chatRequest = validateRequest(body)
    sessionId = chatRequest.sessionId

    logChatActivity('info', 'Requisição validada', {
      sessionId,
      userId: chatRequest.userId,
      messageLength: chatRequest.message.length
    })

    // 2. Initialize model
    const model = initializeChatModel()

    // 3. Process messages with intelligent trimming
    const { messages } = await processMessages(sessionId!, chatRequest.message)

    logChatActivity('info', 'Enviando requisição para OpenAI', {
      sessionId,
      messageCount: messages.length,
      model: CHATBOT_CONFIG.MODEL
    })

    // 4. Call OpenAI via LangChain
    const response = await model.invoke(messages)

    // 5. Save messages to history
    saveMessageToHistory(sessionId!, { 
      role: 'user', 
      content: chatRequest.message 
    })
    saveMessageToHistory(sessionId!, { 
      role: 'assistant', 
      content: response.content as string 
    })

    // 6. Calculate metrics
    const processingTime = Date.now() - startTime

    // 7. Create structured response
    const chatResponse: ChatResponse = {
      response: response.content as string,
      sessionId: sessionId!,
      messageId: uuidv4(),
      timestamp: new Date(),
      metadata: {
        model: CHATBOT_CONFIG.MODEL,
        processingTime,
        tokensUsed: response.usage_metadata?.total_tokens
      }
    }

    logChatActivity('info', 'Resposta gerada com sucesso', {
      sessionId,
      responseLength: (response.content as string).length,
      processingTime: `${processingTime}ms`,
      tokensUsed: response.usage_metadata?.total_tokens
    })

    return NextResponse.json(chatResponse)

  } catch (error) {
    if (error instanceof ChatbotError) {
      return createErrorResponse(error, 
        error.code === ChatbotErrorCode.VALIDATION_ERROR ? 400 : 500
      )
    }

    const chatError = new ChatbotError(
      ChatbotErrorCode.INTERNAL_ERROR,
      error instanceof Error ? error.message : 'Erro interno do servidor',
      sessionId
    )

    return createErrorResponse(chatError, 500)
  }
}

/**
 * Returns system health status and configuration information
 * Used for monitoring and debugging purposes
 */
export async function GET() {
  try {
    const isConfigured = !!process.env.OPENAI_API_KEY
    const activeSessions = sessionHistory.size

    return NextResponse.json({
      status: 'ok',
      configured: isConfigured,
      model: isConfigured ? CHATBOT_CONFIG.MODEL : null,
      activeSessions,
      timestamp: new Date().toISOString(),
      version: '2.0.0'
    })
  } catch (error) {
    const chatError = new ChatbotError(
      ChatbotErrorCode.INTERNAL_ERROR,
      'Erro ao verificar status do sistema'
    )
    return createErrorResponse(chatError, 500)
  }
}

/**
 * Clears conversation history for a specific session
 * Helps manage memory usage and user privacy
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      throw new ChatbotError(
        ChatbotErrorCode.VALIDATION_ERROR,
        'sessionId é obrigatório'
      )
    }

    sessionHistory.delete(sessionId)
    
    logChatActivity('info', 'Sessão limpa', { sessionId })

    return NextResponse.json({
      success: true,
      sessionId,
      timestamp: new Date()
    })

  } catch (error) {
    if (error instanceof ChatbotError) {
      return createErrorResponse(error, 400)
    }

    const chatError = new ChatbotError(
      ChatbotErrorCode.INTERNAL_ERROR,
      'Erro ao limpar sessão'
    )
    return createErrorResponse(chatError, 500)
  }
}
