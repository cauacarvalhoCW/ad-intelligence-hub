/**
 * Streaming Chat API endpoint using LangGraph Agent
 * Handles real-time streaming responses with tool calling support
 */

import { NextRequest, NextResponse } from "next/server";
import { getChatbotAgent } from "@/lib/agents";
import {
  ChatbotError,
  ChatbotErrorCode,
  StreamingChunk,
  StreamingResponse,
  chatRequestSchema,
} from "@/lib/types/chat";

// Streaming utilities

function createStreamingResponse() {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      // Keep reference to controller for later use
      (this as any).controller = controller;
    },
  });

  return {
    stream,
    controller: (stream as any).controller as ReadableStreamDefaultController,
    encoder,
  };
}

function sendChunk(
  controller: ReadableStreamDefaultController,
  chunk: StreamingChunk,
) {
  const data = `data: ${JSON.stringify(chunk)}\n\n`;
  controller.enqueue(new TextEncoder().encode(data));
}

function sendError(controller: ReadableStreamDefaultController, error: string) {
  const errorChunk: StreamingChunk = {
    content: error,
    type: "error",
    metadata: {
      timestamp: new Date(),
    },
  };
  sendChunk(controller, errorChunk);
  controller.close();
}

function sendFinal(
  controller: ReadableStreamDefaultController,
  sessionId: string,
) {
  const finalChunk: StreamingChunk = {
    content: "",
    type: "content",
    metadata: {
      timestamp: new Date(),
    },
  };
  sendChunk(controller, finalChunk);
  controller.close();
}

// Agent streaming implementation
async function handleAgentStreaming(
  message: string,
  sessionId: string,
  userId: string | undefined,
  controller: ReadableStreamDefaultController,
) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY não configurada");
    }

    const agent = getChatbotAgent(process.env.OPENAI_API_KEY);

    // Process message with LangGraph agent
    const result = await agent.processMessage(message, sessionId, userId);

    // Send tool call information if any (before response)
    if (result.toolResults && result.toolResults.length > 0) {
      for (const toolResult of result.toolResults) {
        const toolChunk: StreamingChunk = {
          content: `🛠️ Executando ferramenta: ${toolResult.toolName}`,
          type: "tool_call",
          metadata: {
            toolName: toolResult.toolName,
            timestamp: new Date(),
          },
        };
        sendChunk(controller, toolChunk);

        // Small delay for UX
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }

    // Simulate streaming by breaking response into words
    const words = result.response.split(" ");

    for (const word of words) {
      const streamingChunk: StreamingChunk = {
        content: word + " ",
        type: "content",
        metadata: {
          timestamp: new Date(),
        },
      };

      sendChunk(controller, streamingChunk);

      // Small delay to simulate real streaming
      await new Promise((resolve) => setTimeout(resolve, 30));
    }

    sendFinal(controller, sessionId);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Erro no streaming do agente";
    sendError(controller, errorMessage);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Validate input
    const body = await request.json();
    const chatRequest = chatRequestSchema.parse(body);
    const sessionId =
      chatRequest.sessionId ||
      `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Create streaming response
    const { stream, controller } = createStreamingResponse();

    // Handle streaming with LangGraph agent
    handleAgentStreaming(
      chatRequest.message,
      sessionId,
      chatRequest.userId,
      controller,
    );

    // Return streaming response
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Cache-Control",
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      const chatError = new ChatbotError(
        ChatbotErrorCode.VALIDATION_ERROR,
        `Dados inválidos: ${error.message}`,
      );

      return NextResponse.json(
        {
          error: {
            code: chatError.code,
            message: chatError.message,
            timestamp: new Date(),
          },
        },
        { status: 400 },
      );
    }

    const chatError = new ChatbotError(
      ChatbotErrorCode.INTERNAL_ERROR,
      "Erro interno do servidor",
    );

    return NextResponse.json(
      {
        error: {
          code: chatError.code,
          message: chatError.message,
          timestamp: new Date(),
        },
      },
      { status: 500 },
    );
  }
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
