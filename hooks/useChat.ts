/**
 * Custom hook for managing chat state and API interactions
 * Handles message sending, session management, and real-time updates
 */

"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { v4 as uuidv4 } from "uuid";

import {
  ChatMessage,
  ChatRequest,
  ChatResponse,
  ChatbotError,
  ChatbotErrorCode,
} from "@/lib/types/chat";

interface UseChatOptions {
  sessionId?: string;
  userId?: string;
  autoFocus?: boolean;
  maxRetries?: number;
  onMessageReceived?: (message: ChatMessage) => void;
  onError?: (error: string) => void;
  onSessionStart?: (sessionId: string) => void;
}

// API communication functions

async function sendMessageToAPI(request: ChatRequest): Promise<ChatResponse> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = errorData.error || {};

    throw new ChatbotError(
      error.code || ChatbotErrorCode.INTERNAL_ERROR,
      error.message || `Erro HTTP ${response.status}`,
      error.sessionId,
    );
  }

  return response.json();
}

async function getChatStatus(): Promise<{
  status: string;
  configured: boolean;
  model: string | null;
  activeSessions: number;
}> {
  const response = await fetch("/api/chat");

  if (!response.ok) {
    throw new Error(`Erro ao verificar status: ${response.status}`);
  }

  return response.json();
}

async function clearSession(sessionId: string): Promise<void> {
  const response = await fetch(`/api/chat?sessionId=${sessionId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Erro ao limpar sessão: ${response.status}`);
  }
}

// Main hook implementation

export function useChat(options: UseChatOptions = {}) {
  // Local state management

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string>(
    options.sessionId || `session_${Date.now()}_${uuidv4().slice(0, 8)}`,
  );
  const [isTyping, setIsTyping] = useState(false);

  const queryClient = useQueryClient();
  const abortControllerRef = useRef<AbortController | null>(null);

  // System status monitoring

  const {
    data: systemStatus,
    error: statusError,
    isLoading: isStatusLoading,
  } = useQuery({
    queryKey: ["chat-status"],
    queryFn: getChatStatus,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
    refetchOnWindowFocus: false,
  });

  // Message sending mutation

  const sendMessageMutation = useMutation({
    mutationFn: sendMessageToAPI,
    retry: (failureCount, error) => {
      // Não retentar erros de validação
      if (
        error instanceof ChatbotError &&
        error.code === ChatbotErrorCode.VALIDATION_ERROR
      ) {
        return false;
      }
      return failureCount < (options.maxRetries || 2);
    },
    onMutate: () => {
      // Cancel previous requests
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      setIsTyping(true);
    },
    onSuccess: (data: ChatResponse) => {
      // Update sessionId if needed
      if (data.sessionId !== sessionId) {
        setSessionId(data.sessionId);
        options.onSessionStart?.(data.sessionId);
      }

      // Create assistant message
      const assistantMessage: ChatMessage = {
        id: data.messageId,
        role: "assistant",
        content: data.response,
        timestamp: new Date(data.timestamp),
        sessionId: data.sessionId,
      };

      // Add to messages list
      setMessages((prev) => [...prev, assistantMessage]);

      // Optional callback
      options.onMessageReceived?.(assistantMessage);

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["chat-status"] });
    },
    onError: (error: ChatbotError) => {
      const errorMessage = error.message || "Error sending message";

      // Add error message to chat
      const errorChatMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        role: "system",
        content: `⚠️ ${errorMessage}`,
        timestamp: new Date(),
        sessionId,
      };

      setMessages((prev) => [...prev, errorChatMessage]);

      // Optional callback
      options.onError?.(errorMessage);
    },
    onSettled: () => {
      setIsTyping(false);
      abortControllerRef.current = null;
    },
  });

  // Session clearing mutation

  const clearSessionMutation = useMutation({
    mutationFn: () => clearSession(sessionId),
    onSuccess: () => {
      setMessages([]);
      const newSessionId = `session_${Date.now()}_${uuidv4().slice(0, 8)}`;
      setSessionId(newSessionId);
      queryClient.invalidateQueries({ queryKey: ["chat-status"] });
    },
    onError: (error) => {
      console.error("Error clearing session:", error);
      // Clear locally even if API fails
      setMessages([]);
      const newSessionId = `session_${Date.now()}_${uuidv4().slice(0, 8)}`;
      setSessionId(newSessionId);
    },
  });

  // Public methods

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || sendMessageMutation.isPending) {
        return;
      }

      // Add user message immediately
      const userMessage: ChatMessage = {
        id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
        sessionId,
      };

      setMessages((prev) => [...prev, userMessage]);

      // Prepare request
      const request: ChatRequest = {
        message: content.trim(),
        sessionId,
        userId: options.userId,
        context: {
          page:
            typeof window !== "undefined"
              ? window.location.pathname
              : undefined,
          referrer:
            typeof document !== "undefined" ? document.referrer : undefined,
          userAgent:
            typeof navigator !== "undefined" ? navigator.userAgent : undefined,
        },
      };

      // Send to API
      try {
        await sendMessageMutation.mutateAsync(request);
      } catch (error) {
        // Error already handled in onError mutation
        console.error("Error sending message:", error);
      }
    },
    [sessionId, sendMessageMutation, options.userId],
  );

  const clearMessages = useCallback(() => {
    clearSessionMutation.mutate();
  }, [clearSessionMutation]);

  const addSystemMessage = useCallback(
    (content: string) => {
      const systemMessage: ChatMessage = {
        id: `system_${Date.now()}`,
        role: "system",
        content,
        timestamp: new Date(),
        sessionId,
      };

      setMessages((prev) => [...prev, systemMessage]);
    },
    [sessionId],
  );

  const retryLastMessage = useCallback(() => {
    const lastUserMessage = messages
      .slice()
      .reverse()
      .find((msg) => msg.role === "user");

    if (lastUserMessage) {
      sendMessage(lastUserMessage.content);
    }
  }, [messages, sendMessage]);

  // Side effects and cleanup

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  // Public API interface

  return {
    // Main state
    messages,
    sessionId,
    isLoading: sendMessageMutation.isPending,
    isTyping,
    error: sendMessageMutation.error?.message,

    // System status
    systemStatus,
    isSystemReady: systemStatus?.configured && !statusError,
    statusError: statusError?.message,

    // Main actions
    sendMessage,
    clearMessages,
    addSystemMessage,
    retryLastMessage,

    // Mutation states
    isClearingSession: clearSessionMutation.isPending,
    clearError: clearSessionMutation.error?.message,

    // Statistics
    messageCount: messages.length,
    userMessageCount: messages.filter((m) => m.role === "user").length,
    assistantMessageCount: messages.filter((m) => m.role === "assistant")
      .length,
    systemMessageCount: messages.filter((m) => m.role === "system").length,

    // Utilities
    hasMessages: messages.length > 0,
    lastMessage: messages[messages.length - 1],
    canSend: !sendMessageMutation.isPending && systemStatus?.configured,

    // External control callbacks
    abortCurrentRequest: () => abortControllerRef.current?.abort(),
  };
}
