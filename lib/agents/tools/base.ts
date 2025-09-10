/**
 * Base tool definitions and interfaces
 * Following LangChain.js best practices for tool creation
 */

import { tool } from "@langchain/core/tools";
import { z } from "zod";

// Base schemas for common tool patterns
export const DateTimeSchema = z.object({
  format: z
    .enum(["ISO", "locale", "custom"])
    .default("ISO")
    .describe("Formato da data/hora"),
  timezone: z.string().optional().describe("Timezone (ex: America/Sao_Paulo)"),
  locale: z.string().default("pt-BR").describe("Locale para formatação"),
});

export const SearchSchema = z.object({
  query: z.string().describe("Termo de busca"),
  limit: z
    .number()
    .min(1)
    .max(50)
    .default(10)
    .describe("Número máximo de resultados"),
  filters: z.record(z.any()).optional().describe("Filtros adicionais"),
});

// Tool result interface
export interface ToolResult<T = any> {
  success: boolean;
  data: T;
  metadata?: {
    executionTime?: number;
    toolName?: string;
    timestamp?: Date;
  };
  error?: string;
}

// Base tool class for consistent behavior
export abstract class BaseTool {
  abstract name: string;
  abstract description: string;
  abstract schema: z.ZodSchema;

  protected abstract execute(input: any): Promise<ToolResult>;

  // Create LangChain tool instance
  createTool() {
    return tool(
      async (input: any) => {
        const startTime = Date.now();

        try {
          const result = await this.execute(input);

          // Add metadata
          result.metadata = {
            ...result.metadata,
            executionTime: Date.now() - startTime,
            toolName: this.name,
            timestamp: new Date(),
          };

          return JSON.stringify(result);
        } catch (error) {
          const errorResult: ToolResult = {
            success: false,
            data: null,
            error: error instanceof Error ? error.message : "Unknown error",
            metadata: {
              executionTime: Date.now() - startTime,
              toolName: this.name,
              timestamp: new Date(),
            },
          };

          return JSON.stringify(errorResult);
        }
      },
      {
        name: this.name,
        description: this.description,
        schema: this.schema,
      },
    );
  }
}

// Tool registry for managing available tools
export class ToolRegistry {
  private static instance: ToolRegistry;
  private tools: Map<string, BaseTool> = new Map();

  static getInstance(): ToolRegistry {
    if (!ToolRegistry.instance) {
      ToolRegistry.instance = new ToolRegistry();
    }
    return ToolRegistry.instance;
  }

  register(tool: BaseTool): void {
    this.tools.set(tool.name, tool);
  }

  get(name: string): BaseTool | undefined {
    return this.tools.get(name);
  }

  getAll(): BaseTool[] {
    return Array.from(this.tools.values());
  }

  getLangChainTools(): any[] {
    return this.getAll().map((tool) => tool.createTool());
  }

  getToolNames(): string[] {
    return Array.from(this.tools.keys());
  }
}
