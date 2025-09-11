/**
 * calc tool — operações matemáticas determinísticas para evitar erros do LLM.
 * Suporta soma, média, razão, percentual, taxa de crescimento e arredondamento.
 */

import { z } from "zod";
import { BaseTool, ToolResult } from "./base";

const CalcSchema = z.object({
  op: z
    .enum(["sum", "avg", "ratio", "percentage", "growth_rate", "round"])
    .describe("Operação"),
  values: z
    .array(z.number())
    .default([])
    .describe("Lista de números para sum/avg/round"),
  numerator: z
    .number()
    .optional()
    .describe("Numerador para ratio/percentage/growth_rate"),
  denominator: z
    .number()
    .optional()
    .describe("Denominador para ratio/percentage/growth_rate"),
  decimals: z
    .number()
    .min(0)
    .max(6)
    .default(2)
    .optional()
    .describe("Casas decimais para arredondamento"),
});

type CalcInput = z.infer<typeof CalcSchema>;

export class CalcTool extends BaseTool {
  name = "calc";
  description =
    "Calculadora determinística para somar, tirar média, calcular razão/percentual e taxa de crescimento.\n" +
    "Use para: médias semanais, porcentagens de vídeos vs imagens, diferenças relativas, arredondamento.\n" +
    "Exemplos: { op: 'percentage', numerator: 59, denominator: 103, decimals: 2 } → 57.28";
  schema = CalcSchema;

  async execute(input: CalcInput): Promise<ToolResult> {
    const start = Date.now();
    try {
      const round = (x: number, d = input.decimals ?? 2) => {
        const m = Math.pow(10, d);
        return Math.round((x + Number.EPSILON) * m) / m;
      };

      let result: number | number[];

      switch (input.op) {
        case "sum": {
          result = input.values.reduce((a, b) => a + b, 0);
          break;
        }
        case "avg": {
          if (input.values.length === 0) result = 0;
          else
            result =
              input.values.reduce((a, b) => a + b, 0) / input.values.length;
          result = round(result as number);
          break;
        }
        case "ratio": {
          const { numerator = 0, denominator = 0 } = input;
          result = denominator === 0 ? 0 : numerator / denominator;
          result = round(result as number, input.decimals ?? 4);
          break;
        }
        case "percentage": {
          const { numerator = 0, denominator = 0 } = input;
          result = denominator === 0 ? 0 : (numerator / denominator) * 100;
          result = round(result as number);
          break;
        }
        case "growth_rate": {
          // (novo - antigo) / max(1, antigo) * 100
          const { numerator = 0, denominator = 0 } = input;
          const base = denominator === 0 ? 1 : denominator;
          result = ((numerator - base) / base) * 100;
          result = round(result as number);
          break;
        }
        case "round": {
          result = input.values.map((v) => round(v, input.decimals ?? 2));
          break;
        }
        default:
          return {
            success: false,
            data: null,
            error: "Operação não suportada",
          };
      }

      return {
        success: true,
        data: result,
        metadata: { executionTime: Date.now() - start, toolName: this.name },
      };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro na calculadora";
      return { success: false, data: null, error: msg };
    }
  }
}

export const calcTool = new CalcTool();
