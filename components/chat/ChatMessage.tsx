/**
 * Displays individual chat messages with formatting and accessibility features
 * Handles both user and assistant messages with proper ARIA labels
 */

"use client";

import React, { memo } from "react";
import { User, Bot, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ChatMessage as ChatMessageType } from "@/lib/types/chat";

interface ChatMessageProps {
  message: ChatMessageType;
  isLast?: boolean;
  className?: string;
}

// Message formatting utilities for rich text rendering

function formatTime(date: Date): string {
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMessageContent(content: string): React.ReactNode {
  // Split into lines
  const lines = content.split("\n");

  return lines.map((line, index) => {
    // Empty line
    if (line.trim() === "") {
      return <br key={index} />;
    }

    // Detect bullet lists
    if (line.match(/^[-*•]\s/)) {
      return (
        <div key={index} className="ml-4 flex items-start gap-2">
          <span className="text-primary mt-1">•</span>
          <span>{line.substring(2)}</span>
        </div>
      );
    }

    // Detect numbered lists
    if (line.match(/^\d+\.\s/)) {
      const match = line.match(/^(\d+)\.\s(.*)/);
      if (match) {
        return (
          <div key={index} className="ml-4 flex items-start gap-2">
            <span className="text-primary font-medium mt-1">{match[1]}.</span>
            <span>{match[2]}</span>
          </div>
        );
      }
    }

    // Detect bold titles with **text**
    if (line.match(/^\*\*(.*)\*\*$/)) {
      return (
        <div key={index} className="font-semibold text-foreground">
          {line.replace(/^\*\*(.*)\*\*$/, "$1")}
        </div>
      );
    }

    // Detect inline bold text
    const boldRegex = /\*\*(.*?)\*\*/g;
    if (boldRegex.test(line)) {
      const parts = line.split(boldRegex);
      return (
        <div key={index}>
          {parts.map((part, partIndex) => {
            if (partIndex % 2 === 1) {
              return (
                <strong key={partIndex} className="font-semibold">
                  {part}
                </strong>
              );
            }
            return part;
          })}
        </div>
      );
    }

    // Detect links
    const linkRegex = /(https?:\/\/[^\s]+)/g;
    if (linkRegex.test(line)) {
      const parts = line.split(linkRegex);
      return (
        <div key={index}>
          {parts.map((part, partIndex) => {
            if (part.match(linkRegex)) {
              // Sanitize trailing punctuation like ')' or '].,' often appended in prose
              const sanitized = part.replace(/[)\],。.]+$/u, "");
              const trailing = part.slice(sanitized.length);
              return (
                <React.Fragment key={partIndex}>
                  <a
                    href={sanitized}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline hover:no-underline transition-colors"
                  >
                    {sanitized}
                  </a>
                  {trailing}
                </React.Fragment>
              );
            }
            return <React.Fragment key={partIndex}>{part}</React.Fragment>;
          })}
        </div>
      );
    }

    // Detect inline code with `code`
    const codeRegex = /`([^`]+)`/g;
    if (codeRegex.test(line)) {
      const parts = line.split(codeRegex);
      return (
        <div key={index}>
          {parts.map((part, partIndex) => {
            if (partIndex % 2 === 1) {
              return (
                <code
                  key={partIndex}
                  className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono"
                >
                  {part}
                </code>
              );
            }
            return part;
          })}
        </div>
      );
    }

    // Regular text
    return <div key={index}>{line}</div>;
  });
}

// Main component with memoization for performance

export const ChatMessage = memo<ChatMessageProps>(
  ({ message, isLast = false, className }) => {
    const isUser = message.role === "user";
    const isAssistant = message.role === "assistant";
    const isSystem = message.role === "system";

    // Render system message
    if (isSystem) {
      return (
        <div className={cn("flex items-center justify-center py-2", className)}>
          <div className="flex items-center gap-2 bg-muted/50 rounded-full px-3 py-1.5">
            <AlertTriangle className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {message.content}
            </span>
          </div>
        </div>
      );
    }

    return (
      <div
        className={cn(
          "flex gap-3 group animate-in fade-in-0 slide-in-from-bottom-2 duration-300",
          isUser ? "justify-end" : "justify-start",
          className,
        )}
        role="article"
        aria-label={`Mensagem de ${isUser ? "usuário" : "assistente"}`}
      >
        {/* Avatar */}
        <div
          className={cn(
            "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
            "ring-2 ring-background transition-all duration-200",
            isUser
              ? "bg-primary text-primary-foreground order-2 group-hover:ring-primary/20"
              : "bg-muted text-muted-foreground group-hover:ring-muted-foreground/20",
          )}
        >
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </div>

        {/* Message content */}
        <div
          className={cn(
            "max-w-[85%] space-y-1",
            isUser ? "order-1" : "order-2",
          )}
        >
          {/* Message bubble */}
          <div
            className={cn(
              "rounded-2xl px-4 py-3 break-words transition-all duration-200",
              "shadow-sm hover:shadow-md",
              isUser
                ? "bg-primary text-primary-foreground rounded-br-md"
                : "bg-muted text-foreground rounded-bl-md border",
            )}
          >
            {/* Formatted content */}
            <div
              className={cn(
                "text-sm leading-relaxed",
                // Better contrast for user text
                isUser ? "text-primary-foreground" : "text-foreground",
              )}
            >
              {formatMessageContent(message.content)}
            </div>
          </div>

          {/* Timestamp and status */}
          <div
            className={cn(
              "flex items-center gap-2 text-xs text-muted-foreground",
              "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
              isUser ? "justify-end" : "justify-start",
            )}
          >
            <time dateTime={message.timestamp.toISOString()}>
              {formatTime(message.timestamp)}
            </time>

            {/* Latest message indicator */}
            {isLast && isAssistant && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                Latest
              </Badge>
            )}

            {/* Delivery indicator (for user messages) */}
            {isLast && isUser && (
              <span className="text-primary" aria-label="Message sent">
                ✓
              </span>
            )}
          </div>
        </div>
      </div>
    );
  },
);

ChatMessage.displayName = "ChatMessage";

export default ChatMessage;
