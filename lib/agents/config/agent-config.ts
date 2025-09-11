/**
 * Agent Configuration
 * Centralized configuration for LangGraph agents
 */

export interface AgentConfiguration {
  // Model configuration
  model: {
    name: string;
    temperature: number;
    maxTokens?: number;
    streaming?: boolean;
  };

  // Tool configuration
  tools: {
    enabled: string[];
    config: Record<string, any>;
  };

  // RAG configuration (preparado para implementação futura)
  rag: {
    enabled: boolean;
    vectorStore?: {
      type: "supabase" | "chroma" | "memory";
      config: Record<string, any>;
    };
    retrieval: {
      topK: number;
      similarityThreshold: number;
    };
    chunking: {
      chunkSize: number;
      chunkOverlap: number;
    };
  };

  // Memory configuration
  memory: {
    enabled: boolean;
    maxMessages: number;
    persistSession: boolean;
  };

  // Streaming configuration
  streaming: {
    enabled: boolean;
    bufferSize?: number;
  };

  // Limits and safeguards
  limits: {
    recursion: number; // max graph steps
    toolCalls: number; // max total tool calls per turn
    timeoutMs?: number; // optional overall timeout
  };

  // Debugging and monitoring
  debug: {
    verbose: boolean;
    logLevel: "info" | "debug" | "warn" | "error";
    enableTracing: boolean;
  };
}

// Default configuration
export const DEFAULT_AGENT_CONFIG: AgentConfiguration = {
  model: {
    name: "gpt-4o-mini",
    temperature: 0.2,
    maxTokens: 1000,
    streaming: false,
  },

  tools: {
    enabled: ["datetime", "ads_query", "ads_analytics", "calc"],
    config: {
      datetime: {
        defaultTimezone: "America/Sao_Paulo",
        defaultLocale: "pt-BR",
      },
      ads_query: {
        defaultTimezone: "America/Sao_Paulo",
        defaultLimit: 50,
      },
      ads_analytics: {
        defaultTimezone: "America/Sao_Paulo",
        defaultLimit: 10,
      },
    },
  },

  rag: {
    enabled: false,
    retrieval: {
      topK: 5,
      similarityThreshold: 0.7,
    },
    chunking: {
      chunkSize: 1000,
      chunkOverlap: 200,
    },
  },

  memory: {
    enabled: true,
    maxMessages: 50,
    persistSession: true,
  },

  streaming: {
    enabled: false,
    bufferSize: 10,
  },

  limits: {
    recursion: 20,
    toolCalls: 8,
    timeoutMs: 20000,
  },

  debug: {
    verbose: process.env.NODE_ENV === "development",
    logLevel: process.env.NODE_ENV === "development" ? "debug" : "info",
    enableTracing: process.env.LANGSMITH_TRACING === "true",
  },
};

// Environment-based configuration
export const getAgentConfig = (): AgentConfiguration => {
  const config = { ...DEFAULT_AGENT_CONFIG };

  // Override with environment variables (all optional - defaults are sensible)

  // Model configuration (optional)
  if (process.env.CHATBOT_MODEL) {
    config.model.name = process.env.CHATBOT_MODEL;
  }

  if (process.env.CHATBOT_TEMPERATURE) {
    config.model.temperature = parseFloat(process.env.CHATBOT_TEMPERATURE);
  }

  // Feature flags (optional)
  if (process.env.ENABLE_STREAMING === "true") {
    config.streaming.enabled = true;
    config.model.streaming = true;
  }

  if (process.env.ENABLE_RAG === "true") {
    config.rag.enabled = true;
  }

  // Tools configuration (optional - defaults to ['datetime'])
  if (process.env.CHATBOT_TOOLS) {
    config.tools.enabled = process.env.CHATBOT_TOOLS.split(",");
  }

  // Optional overrides for limits
  if (process.env.AGENT_RECURSION_LIMIT) {
    config.limits.recursion = parseInt(process.env.AGENT_RECURSION_LIMIT, 10);
  }
  if (process.env.AGENT_MAX_TOOL_CALLS) {
    config.limits.toolCalls = parseInt(process.env.AGENT_MAX_TOOL_CALLS, 10);
  }
  if (process.env.AGENT_TIMEOUT_MS) {
    config.limits.timeoutMs = parseInt(process.env.AGENT_TIMEOUT_MS, 10);
  }

  return config;
};
