/**
 * DateTime tool - collects current date and time
 * Following LangChain.js tool creation best practices
 */

import { BaseTool, DateTimeSchema, ToolResult } from "./base";

interface DateTimeResult {
  date: string;
  time: string;
  timezone: string;
  timestamp: number;
  formatted: string;
}

export class DateTimeTool extends BaseTool {
  name = "datetime";
  description =
    "Obtém a data e hora atuais. Útil para informações temporais e agendamento.";
  schema = DateTimeSchema;

  protected async execute(input: {
    format?: "ISO" | "locale" | "custom";
    timezone?: string;
    locale?: string;
  }): Promise<ToolResult<DateTimeResult>> {
    try {
      const now = new Date();

      // Handle timezone
      const timezone = input.timezone || "America/Sao_Paulo";
      const timeZoneDate = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).formatToParts(now);

      // Extract date and time parts
      const dateParts = timeZoneDate.reduce(
        (acc, part) => {
          acc[part.type] = part.value;
          return acc;
        },
        {} as Record<string, string>,
      );

      const date = `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
      const time = `${dateParts.hour}:${dateParts.minute}:${dateParts.second}`;

      // Format based on requested format
      let formatted: string;

      switch (input.format) {
        case "locale":
          formatted = new Intl.DateTimeFormat(input.locale || "pt-BR", {
            dateStyle: "full",
            timeStyle: "medium",
            timeZone: timezone,
          }).format(now);
          break;

        case "custom":
          formatted = new Intl.DateTimeFormat(input.locale || "pt-BR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            timeZone: timezone,
          }).format(now);
          break;

        case "ISO":
        default:
          formatted = now.toISOString();
          break;
      }

      const result: DateTimeResult = {
        date,
        time,
        timezone,
        timestamp: now.getTime(),
        formatted,
      };

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        data: null as any,
        error: `Erro ao obter data/hora: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
      };
    }
  }
}

// Export singleton instance
export const datetimeTool = new DateTimeTool();
