/**
 * Performance Feature Constants
 */

export const DEFAULT_PAGE_SIZE = 24;
export const MAX_PAGE_SIZE = 100;

/**
 * Date presets for quick filtering
 */
export const DATE_PRESETS = {
  today: 'today',
  yesterday: 'yesterday',
  last_7_days: 'last_7_days',
  last_30_days: 'last_30_days',
  last_90_days: 'last_90_days',
  this_week: 'this_week',
  this_month: 'this_month',
  last_month: 'last_month',
} as const;

export type DatePreset = typeof DATE_PRESETS[keyof typeof DATE_PRESETS];

/**
 * Timezone for date calculations
 */
export const TIMEZONE = 'America/Sao_Paulo';

/**
 * Metrics calculation defaults
 */
export const METRICS_DEFAULTS = {
  minImpressions: 100,  // Mínimo de impressões para calcular métricas
  minCost: 1,           // Custo mínimo para evitar divisão por zero
};

