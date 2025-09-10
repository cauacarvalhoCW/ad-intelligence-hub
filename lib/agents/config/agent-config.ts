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
    enabled: ["datetime"],
    config: {
      datetime: {
        defaultTimezone: "America/Sao_Paulo",
        defaultLocale: "pt-BR",
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

  return config;
};
