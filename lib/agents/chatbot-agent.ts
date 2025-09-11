/**
 * Chatbot Agent using LangGraph
 * Implements state management and tool calling with structured workflow
 * Enhanced with configuration management and RAG preparation
 */

import { ChatOpenAI } from "@langchain/openai";
import {
  StateGraph,
  START,
  END,
  MessagesAnnotation,
} from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { getLangChainTools } from "./tools";
import { CHATBOT_CONFIG } from "../types/chat";
import { getAgentConfig, type AgentConfiguration } from "./config/agent-config";
import { PlaceholderRAGSystem } from "./rag/base-rag";

// Define the state structure for our agent
interface AgentState {
  messages: any[];
  nextStep?: string;
  toolResults?: any[];
  metadata?: {
    sessionId: string;
    userId?: string;
    processingTime?: number;
    toolCalls?: number;
  };
}

// Create the chatbot agent class
export class ChatbotAgent {
  private model: ChatOpenAI;
  private graph: any;
  private tools: any[];
  private config: AgentConfiguration;
  private ragSystem: PlaceholderRAGSystem | null = null;

  constructor(apiKey: string, customConfig?: Partial<AgentConfiguration>) {
    // Load configuration
    this.config = { ...getAgentConfig(), ...customConfig };

    // Initialize the language model
    this.model = new ChatOpenAI({
      model: this.config.model.name,
      temperature: this.config.model.temperature,
      maxTokens: this.config.model.maxTokens,
      streaming: this.config.model.streaming,
      apiKey: apiKey,
    });

    // Get available tools based on configuration
    this.tools = this.initializeTools();

    // Bind tools to the model
    const modelWithTools = this.model.bindTools(this.tools);

    // Initialize RAG system if enabled
    if (this.config.rag.enabled) {
      this.initializeRAG();
    }

    // Create the graph
    this.graph = this.createGraph(modelWithTools);
  }

  private createGraph(modelWithTools: any) {
    // Define the graph structure
    const graph = new StateGraph(MessagesAnnotation)
      .addNode("agent", async (state) => {
        const result = await modelWithTools.invoke(state.messages);
        return { messages: [result] };
      })
      .addNode("tools", new ToolNode(this.tools))
      .addEdge(START, "agent")
      .addConditionalEdges("agent", this.shouldContinue)
      .addEdge("tools", "agent");

    return graph;
  }

  // Use arrow function to preserve 'this' in callbacks
  private shouldContinue = (state: any): string => {
    const lastMessage = state.messages[state.messages.length - 1];

    // Guard: stop if tool call budget exceeded
    const totalToolCalls = state.messages
      .filter((m: any) => Array.isArray(m?.tool_calls))
      .reduce((acc: number, m: any) => acc + m.tool_calls.length, 0);
    if (totalToolCalls >= this.config.limits.toolCalls) {
      return END;
    }

    // Continue to tools if the last message requests them
    if (lastMessage?.tool_calls && lastMessage.tool_calls.length > 0) {
      return "tools";
    }

    // Otherwise, end the conversation
    return END;
  };

  /**
   * Initialize tools based on configuration
   */
  private initializeTools(): any[] {
    const allTools = getLangChainTools();

    // Filter tools based on enabled configuration
    return allTools.filter((tool) =>
      this.config.tools.enabled.includes(tool.name),
    );
  }

  /**
   * Initialize RAG system (placeholder for future implementation)
   */
  private initializeRAG(): void {
    this.ragSystem = new PlaceholderRAGSystem(this.config.rag);

    // Initialize the RAG system asynchronously
    this.ragSystem.initialize().catch((error) => {
      console.error("Failed to initialize RAG system:", error);
      this.ragSystem = null;
    });
  }

  /**
   * Get RAG context for a query (future implementation)
   */
  private async getRAGContext(query: string): Promise<string> {
    if (!this.ragSystem || !this.config.rag.enabled) {
      return "";
    }

    try {
      const documents = await this.ragSystem.retrieveRelevantDocuments(query);
      return documents.map((doc) => doc.pageContent).join("\n\n");
    } catch (error) {
      console.error("Error retrieving RAG context:", error);
      return "";
    }
  }

  /**
   * Process a user message through the agent workflow
   */
  async processMessage(
    message: string,
    sessionId: string,
    userId?: string,
    history: any[] = [],
  ): Promise<{
    response: string;
    metadata: any;
    toolResults?: any[];
  }> {
    const startTime = Date.now();

    try {
      // Prepare the initial state
      const systemMessage = {
        role: "system",
        content: CHATBOT_CONFIG.SYSTEM_PROMPT,
      };

      const userMessage = {
        role: "user",
        content: message,
      };

      const initialMessages = [systemMessage, ...history, userMessage];

      // Execute the graph
      const result = await this.graph.compile().invoke(
        {
          messages: initialMessages,
          metadata: {
            sessionId,
            userId,
            processingTime: 0,
            toolCalls: 0,
          },
        },
        { recursionLimit: this.config.limits.recursion },
      );

      const processingTime = Date.now() - startTime;

      // Extract the final response
      const finalMessage = result.messages[result.messages.length - 1];
      let response = finalMessage.content || "";

      // Count tool calls
      const toolCalls = result.messages
        .filter((msg: any) => msg.tool_calls && msg.tool_calls.length > 0)
        .reduce((count: number, msg: any) => count + msg.tool_calls.length, 0);

      // Extract tool results
      const toolResults = result.messages
        .filter((msg: any) => msg.role === "tool")
        .map((msg: any) => ({
          toolName: msg.name,
          result: msg.content,
          timestamp: new Date(),
        }));

      // Friendly fallback if response is empty or tool budget hit
      if (!response || response.trim().length === 0) {
        response = this.buildFriendlyFallback(toolCalls, processingTime);
      }

      return {
        response,
        metadata: {
          sessionId,
          userId,
          processingTime,
          toolCalls,
          model: this.config.model.name,
          timestamp: new Date(),
        },
        toolResults: toolResults.length > 0 ? toolResults : undefined,
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;

      // Detect LangGraph recursion limit errors and return an elegant message
      const msg = error instanceof Error ? error.message : String(error);
      const isRecursion = /Recursion limit/i.test(msg);

      const friendly = isRecursion
        ? "Precisei de passos demais para chegar a uma resposta segura e parei para evitar loops. Pode reformular a pergunta com um período e um competidor específicos (ex.: 'nos últimos 30 dias, Mercado Pago')?"
        : `Desculpe, ocorreu um erro ao processar sua mensagem: ${msg}`;

      return {
        response: friendly,
        metadata: {
          sessionId,
          userId,
          processingTime,
          toolCalls: 0,
          error: msg,
          timestamp: new Date(),
        },
      };
    }
  }

  private buildFriendlyFallback(
    toolCalls: number,
    processingTime: number,
  ): string {
    if (toolCalls >= this.config.limits.toolCalls) {
      return "Interrompi a pesquisa para evitar muitas chamadas de ferramenta. Tente especificar concorrente, período (ex.: últimos 30 dias) e o tipo de dado que deseja (lista, contagem ou ranking).";
    }
    return "Não consegui gerar uma resposta clara. Pode detalhar melhor o período (ex.: ontem/últimos 7 dias) e o competidor?";
  }

  /**
   * Get available tools
   */
  getAvailableTools(): string[] {
    return this.tools.map((tool) => tool.name);
  }

  /**
   * Get model information
   */
  getModelInfo(): {
    model: string;
    temperature: number;
    tools: number;
    streaming: boolean;
    rag: boolean;
  } {
    return {
      model: this.config.model.name,
      temperature: this.config.model.temperature,
      tools: this.tools.length,
      streaming: this.config.streaming.enabled,
      rag: this.config.rag.enabled,
    };
  }

  /**
   * Get agent configuration
   */
  getConfiguration(): AgentConfiguration {
    return { ...this.config };
  }

  /**
   * Get RAG system health status
   */
  async getRAGHealth(): Promise<any> {
    if (!this.ragSystem) {
      return { status: "disabled" };
    }
    return await this.ragSystem.healthCheck();
  }

  /**
   * Update tool configuration dynamically
   */
  updateToolConfig(toolName: string, config: any): void {
    this.config.tools.config[toolName] = {
      ...this.config.tools.config[toolName],
      ...config,
    };
  }
}

// Singleton instance for reuse
let chatbotAgentInstance: ChatbotAgent | null = null;

export function getChatbotAgent(apiKey?: string): ChatbotAgent {
  if (!chatbotAgentInstance) {
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is required for agent initialization");
    }
    chatbotAgentInstance = new ChatbotAgent(apiKey);
  }

  return chatbotAgentInstance;
}

export function resetChatbotAgent(): void {
  chatbotAgentInstance = null;
}
