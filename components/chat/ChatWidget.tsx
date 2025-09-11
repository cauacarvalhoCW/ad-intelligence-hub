/**
 * Chat Widget Optimized - Professional chat interface
 *
 * Features:
 * - Border resize
 * - Auto-focus inteligente
 * - Full responsiveness
 * - Optimized state management
 * - Accessibility (WCAG 2.1)
 */

"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  Maximize2,
  Minimize2,
  AlertCircle,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { ChatMessage } from "./ChatMessage";
import { useChat } from "@/hooks/useChat";
import { cn } from "@/lib/utils";

interface ChatWidgetProps {
  className?: string;
  userId?: string;
  sessionId?: string;
  autoFocus?: boolean;
  position?: "bottom-right" | "bottom-left";
}

interface ChatSize {
  width: number;
  height: number;
}

interface ResizeState {
  isResizing: boolean;
  direction: string;
  startPos: { x: number; y: number };
  startSize: ChatSize;
}

// Widget configuration constants

const WIDGET_CONFIG = {
  DEFAULT_SIZE: { width: 400, height: 600 },
  MIN_SIZE: { width: 320, height: 400 },
  MOBILE_BREAKPOINT: 768,
  RESIZE_HANDLE_SIZE: 8,
  Z_INDEX: {
    BUTTON: 60,
    MODAL: 55,
  },
} as const;

// Function to get MAX_SIZE safely (client-side only)
const getMaxSize = () => {
  if (typeof window === "undefined") {
    return { width: 800, height: 700 }; // SSR fallback
  }
  return {
    width: 800,
    height: window.innerHeight - 100 || 700,
  };
};

// Main widget component

export function ChatWidget({
  className,
  userId,
  sessionId,
  autoFocus = true,
  position = "bottom-right",
}: ChatWidgetProps) {
  // Component state management

  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [message, setMessage] = useState("");
  const [chatSize, setChatSize] = useState<ChatSize>(WIDGET_CONFIG.DEFAULT_SIZE);
  const [maxSize, setMaxSize] = useState<ChatSize>({ width: 800, height: 700 });
  const [resizeState, setResizeState] = useState<ResizeState>({
    isResizing: false,
    direction: "",
    startPos: { x: 0, y: 0 },
    startSize: WIDGET_CONFIG.DEFAULT_SIZE,
  });

  // DOM element references

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  // Custom chat hook integration

  const {
    messages,
    sessionId: currentSessionId,
    isLoading,
    error,
    systemStatus,
    isSystemReady,
    sendMessage,
    clearMessages,
    hasMessages,
    canSend,
    abortCurrentRequest,
  } = useChat({
    userId,
    sessionId,
    autoFocus,
    onMessageReceived: () => {
      // Auto-focus after response (with delay for rendering)
      setTimeout(() => {
        if (autoFocus && textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 500);
    },
  });

  // Initialize client-side only values to prevent SSR issues

  useEffect(() => {
    // Initialize maxSize on client
    setMaxSize(getMaxSize());
  }, []);

  // Responsive design detection

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < WIDGET_CONFIG.MOBILE_BREAKPOINT;
      setIsMobile(mobile);

      // Adjust size for mobile
      if (mobile && isOpen) {
        setIsMaximized(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [isOpen]);

  // Auto-scroll to latest messages

  useEffect(() => {
    if (scrollAreaRef.current && messages.length > 0) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]",
      );
      if (scrollContainer) {
        setTimeout(() => {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }, 100);
      }
    }
  }, [messages]);

  // Resize functionality with mouse event handling

  const handleResizeStart = useCallback(
    (e: React.MouseEvent, direction: string) => {
      if (isMobile || isMaximized) return;

      e.preventDefault();
      e.stopPropagation();

      setResizeState({
        isResizing: true,
        direction,
        startPos: { x: e.clientX, y: e.clientY },
        startSize: chatSize,
      });

      const handleMouseMove = (e: MouseEvent) => {
        const deltaX = e.clientX - resizeState.startPos.x;
        const deltaY = e.clientY - resizeState.startPos.y;

        let newWidth = resizeState.startSize.width;
        let newHeight = resizeState.startSize.height;

        // Calculate new dimensions based on direction
        if (direction.includes("right")) {
          newWidth = Math.max(
            WIDGET_CONFIG.MIN_SIZE.width,
            Math.min(maxSize.width, resizeState.startSize.width + deltaX),
          );
        }
        if (direction.includes("left")) {
          newWidth = Math.max(
            WIDGET_CONFIG.MIN_SIZE.width,
            Math.min(maxSize.width, resizeState.startSize.width - deltaX),
          );
        }
        if (direction.includes("bottom")) {
          newHeight = Math.max(
            WIDGET_CONFIG.MIN_SIZE.height,
            Math.min(maxSize.height, resizeState.startSize.height + deltaY),
          );
        }
        if (direction.includes("top")) {
          newHeight = Math.max(
            WIDGET_CONFIG.MIN_SIZE.height,
            Math.min(maxSize.height, resizeState.startSize.height - deltaY),
          );
        }

        setChatSize({ width: newWidth, height: newHeight });
      };

      const handleMouseUp = () => {
        setResizeState((prev) => ({
          ...prev,
          isResizing: false,
          direction: "",
        }));
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.cursor = "default";
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = getResizeCursor(direction);
    },
    [chatSize, isMobile, isMaximized, maxSize, resizeState.startPos, resizeState.startSize],
  );

  const getResizeCursor = (direction: string): string => {
    const cursors: Record<string, string> = {
      top: "n-resize",
      bottom: "s-resize",
      left: "w-resize",
      right: "e-resize",
      "top-left": "nw-resize",
      "top-right": "ne-resize",
      "bottom-left": "sw-resize",
      "bottom-right": "se-resize",
    };
    return cursors[direction] || "default";
  };

  // Message input handling and validation

  const handleSendMessage = useCallback(async () => {
    if (!message.trim() || !canSend) return;

    const messageToSend = message.trim();
    setMessage("");

    try {
      await sendMessage(messageToSend);
    } catch (error) {
      // Restore message in case of error
      setMessage(messageToSend);
    }
  }, [message, canSend, sendMessage]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    },
    [handleSendMessage],
  );

  // Widget control functions (open/close/maximize)

  const toggleChat = useCallback(() => {
    setIsOpen((prev) => !prev);
    if (!isOpen) {
      setIsMaximized(false);
      setTimeout(() => textareaRef.current?.focus(), 300);
    } else {
      abortCurrentRequest();
    }
  }, [isOpen, abortCurrentRequest]);

  const toggleMaximize = useCallback(() => {
    if (isMobile) return;

    if (isMaximized) {
      setChatSize(WIDGET_CONFIG.DEFAULT_SIZE);
    } else {
      setChatSize({
        width: Math.min(maxSize.width, window.innerWidth - 100),
        height: Math.min(maxSize.height, window.innerHeight - 100),
      });
    }
    setIsMaximized(!isMaximized);
  }, [isMaximized, isMobile, maxSize]);

  // Render helper functions and computed values

  const renderResizeBorders = useMemo(() => {
    if (isMobile || isMaximized) return null;

    const borderClass =
      "absolute bg-transparent hover:bg-primary/20 transition-colors duration-200";
    const handleSize = WIDGET_CONFIG.RESIZE_HANDLE_SIZE;

    return (
      <>
        {/* Borders */}
        <div
          className={`${borderClass} top-0 left-2 right-2 h-1 cursor-n-resize`}
          onMouseDown={(e) => handleResizeStart(e, "top")}
        />
        <div
          className={`${borderClass} bottom-0 left-2 right-2 h-1 cursor-s-resize`}
          onMouseDown={(e) => handleResizeStart(e, "bottom")}
        />
        <div
          className={`${borderClass} left-0 top-2 bottom-2 w-1 cursor-w-resize`}
          onMouseDown={(e) => handleResizeStart(e, "left")}
        />
        <div
          className={`${borderClass} right-0 top-2 bottom-2 w-1 cursor-e-resize`}
          onMouseDown={(e) => handleResizeStart(e, "right")}
        />

        {/* Corners */}
        <div
          className={`${borderClass} top-0 left-0 w-2 h-2 cursor-nw-resize`}
          onMouseDown={(e) => handleResizeStart(e, "top-left")}
        />
        <div
          className={`${borderClass} top-0 right-0 w-2 h-2 cursor-ne-resize`}
          onMouseDown={(e) => handleResizeStart(e, "top-right")}
        />
        <div
          className={`${borderClass} bottom-0 left-0 w-2 h-2 cursor-sw-resize`}
          onMouseDown={(e) => handleResizeStart(e, "bottom-left")}
        />
        <div
          className={`${borderClass} bottom-0 right-0 w-2 h-2 cursor-se-resize`}
          onMouseDown={(e) => handleResizeStart(e, "bottom-right")}
        />
      </>
    );
  }, [isMobile, isMaximized, handleResizeStart]);

  const positionClasses = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6",
  };

  // Main render function

  return (
    <>
      {/* Floating button */}
      <Button
        onClick={toggleChat}
        size="lg"
        className={cn(
          "fixed rounded-full shadow-lg hover:shadow-xl transition-all duration-300",
          "bg-primary hover:bg-primary/90 w-14 h-14",
          positionClasses[position],
          className,
        )}
        style={{ zIndex: WIDGET_CONFIG.Z_INDEX.BUTTON }}
        aria-label={isOpen ? "Fechar chat" : "Abrir chat"}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}

        {/* Notification badge */}
        {!isOpen && hasMessages && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            {messages.length > 9 ? "9+" : messages.length}
          </div>
        )}

        {/* Status indicator */}
        {!isSystemReady && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
        )}
      </Button>

      {/* Chat modal */}
      {isOpen && (
        <Card
          ref={chatRef}
          className={cn(
            "fixed flex flex-col bg-background/95 backdrop-blur-sm border-2 overflow-hidden",
            "shadow-2xl transition-all duration-300 ease-in-out",
            isMobile
              ? "top-4 left-4 right-4 bottom-4"
              : `${positionClasses[position].replace("bottom-6", "bottom-24")}`,
            resizeState.isResizing && "select-none",
          )}
          style={
            isMobile
              ? {}
              : {
                  width: `${chatSize.width}px`,
                  height: `${chatSize.height}px`,
                  zIndex: WIDGET_CONFIG.Z_INDEX.MODAL,
                }
          }
        >
          {/* Resize borders */}
          {renderResizeBorders}

          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-primary/5 shrink-0">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-5 w-5 text-primary" />
              <div>
                <h3 className="font-semibold text-sm">Assistente IA</h3>
                <p className="text-xs text-muted-foreground">
                  {isSystemReady ? "Online" : "Conectando..."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {currentSessionId && (
                <Badge variant="outline" className="text-xs">
                  {currentSessionId.slice(-6)}
                </Badge>
              )}

              {!isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMaximize}
                  className="h-8 w-8 p-0"
                  title={isMaximized ? "Restaurar" : "Maximizar"}
                >
                  {isMaximized ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={clearMessages}
                className="h-8 w-8 p-0"
                title="Limpar conversa"
                disabled={!hasMessages}
              >
                <Trash2 className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleChat}
                className="h-8 w-8 p-0"
                title="Fechar chat"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* System status */}
          {!isSystemReady && (
            <Alert className="mx-4 mt-3 mb-0">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Sistema não configurado. Verifique a configuração da API.
              </AlertDescription>
            </Alert>
          )}

          {/* Messages area */}
          <div className="flex-1 min-h-0 relative">
            <ScrollArea ref={scrollAreaRef} className="h-full w-full">
              <div className="p-4 space-y-4 min-h-full">
                {/* Welcome message */}
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h4 className="font-medium mb-2">Olá! 👋</h4>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                      Sou o EspiADinha, seu assistente de inteligência de anúncios. Vou facilitar seu trabalho: diga o concorrente, o período e se quer lista, contagem ou ranking. 😉
                    </p>
                  </div>
                )}

                {/* Conversation messages */}
                {messages.map((msg, index) => (
                  <ChatMessage key={msg.id} message={msg} isLast={index === messages.length - 1} />
                ))}

                {/* Typing indicator */}
                {isLoading && (
                  <div className="flex items-start gap-3 animate-in fade-in-0 duration-300">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      🤖
                    </div>
                    <div className="bg-muted/50 rounded-2xl p-4 max-w-[80%]">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:0ms]" />
                          <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:150ms]" />
                          <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:300ms]" />
                        </div>
                        <span className="text-sm text-muted-foreground ml-2">Pensando...</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error message */}
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Input area */}
          <div className="p-4 border-t bg-muted/20 shrink-0">
            <div className="flex gap-3">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Digite sua mensagem..."
                className="min-h-[48px] max-h-32 resize-none flex-1 rounded-xl border-2 transition-all duration-200"
                disabled={isLoading || !isSystemReady}
                rows={1}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim() || !canSend}
                size="icon"
                className="shrink-0 h-12 w-12 rounded-xl"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Pressione Enter para enviar • Shift+Enter para nova linha
            </p>
          </div>
        </Card>
      )}
    </>
  );
}

export default ChatWidget;
