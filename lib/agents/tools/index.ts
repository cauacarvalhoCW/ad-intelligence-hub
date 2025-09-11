/**
 * Tools exports and registry setup
 * Central point for tool management
 */

export { BaseTool, ToolRegistry, DateTimeSchema, SearchSchema } from "./base";
export type { ToolResult } from "./base";

// Individual tools
export { DateTimeTool, datetimeTool } from "./datetime";

// Tool registry setup
import { ToolRegistry } from "./base";
import { datetimeTool } from "./datetime";
import { adsQueryTool } from "./supabase-ads";
import { adsAnalyticsTool } from "./supabase-analytics";
import { calcTool } from "./calc";

// Initialize registry with available tools
const toolRegistry = ToolRegistry.getInstance();
toolRegistry.register(datetimeTool);
toolRegistry.register(adsQueryTool);
toolRegistry.register(adsAnalyticsTool);
toolRegistry.register(calcTool);

export { toolRegistry };

// Utility functions
export const getAllTools = () => toolRegistry.getAll();
export const getLangChainTools = () => toolRegistry.getLangChainTools();
export const getToolNames = () => toolRegistry.getToolNames();
export const getTool = (name: string) => toolRegistry.get(name);
