export type Tier = 'T0' | 'T1' | 'T2' | 'T3' | 'T4'

export interface TierConfig {
  tier: Tier
  name: string
  model: string
  baseURL: string
  apiKeyEnv: string
  maxContext: number
  workBudget: number
  inputPricePerM: number
  outputPricePerM: number
}

export interface ClassifierResult {
  initialTier: Tier
  finalTier: Tier
  reason: string
  docNeeded: boolean
  estimatedTokens: number
  escalations: string[]
}

export interface ProviderOverride {
  model: string
  baseURL: string
  apiKey: string
}

export interface RouterEvent {
  t: string
  event: string
  [key: string]: unknown
}

export interface HealthStatus {
  endpoint: string
  status: 'healthy' | 'degraded' | 'offline'
  latencyMs: number
  latencyPer1kTokens: number
  lastCheck: string
  lastError: string | null
  modelLoaded: string | null
  coldStart: boolean
}

export interface CostEntry {
  tier: Tier
  model: string
  tokensIn: number
  tokensOut: number
  costIn: number
  costOut: number
  costTotal: number
  latencyMs: number
  taskId: string | null
  cacheHit: boolean
}

export interface TaskEntry {
  id: string
  subject: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  createdSession: string
  completedSession: string | null
  tokensUsed: number
  cost: number
  tier: Tier | null
  blockedBy: string[]
}

export interface EscalationRule {
  patterns: RegExp[]
  minTier: Tier
  reason: string
}

export interface RouterConfig {
  tiers: Record<Tier, TierConfig>
  escalationRules: EscalationRule[]
  budgetDaily: number
  budgetMonthly: number
  healthCheckIntervalMs: number
  speedGateThresholdMs: number
  diffGateThreshold: number
  contextWarnings: { yellow: number; orange: number; red: number }
}

export const DEFAULT_TIER_CONFIGS: Record<Tier, TierConfig> = {
  T0: {
    tier: 'T0',
    name: 'Ollama Local',
    model: 'qwen2.5:7b',
    baseURL: 'http://localhost:11434/v1',
    apiKeyEnv: 'OPENAI_API_KEY',
    maxContext: 32000,
    workBudget: 8000,
    inputPricePerM: 0,
    outputPricePerM: 0,
  },
  T1: {
    tier: 'T1',
    name: 'DeepSeek V3',
    model: 'deepseek-chat',
    baseURL: 'https://api.deepseek.com/v1',
    apiKeyEnv: 'OPENAI_API_KEY',
    maxContext: 128000,
    workBudget: 80000,
    inputPricePerM: 0.28,
    outputPricePerM: 0.42,
  },
  T2: {
    tier: 'T2',
    name: 'DeepSeek R1',
    model: 'deepseek-reasoner',
    baseURL: 'https://api.deepseek.com/v1',
    apiKeyEnv: 'OPENAI_API_KEY',
    maxContext: 128000,
    workBudget: 80000,
    inputPricePerM: 0.28,
    outputPricePerM: 0.42,
  },
  T3: {
    tier: 'T3',
    name: 'Claude Sonnet 4',
    model: 'claude-sonnet-4-20250514',
    baseURL: 'https://api.anthropic.com',
    apiKeyEnv: 'ANTHROPIC_API_KEY',
    maxContext: 200000,
    workBudget: 150000,
    inputPricePerM: 3.0,
    outputPricePerM: 15.0,
  },
  T4: {
    tier: 'T4',
    name: 'Claude Opus 4',
    model: 'claude-opus-4-20250514',
    baseURL: 'https://api.anthropic.com',
    apiKeyEnv: 'ANTHROPIC_API_KEY',
    maxContext: 1000000,
    workBudget: 800000,
    inputPricePerM: 15.0,
    outputPricePerM: 75.0,
  },
}

export const TIER_ORDER: Tier[] = ['T0', 'T1', 'T2', 'T3', 'T4']

export function nextTier(current: Tier): Tier | null {
  const idx = TIER_ORDER.indexOf(current)
  return idx < TIER_ORDER.length - 1 ? TIER_ORDER[idx + 1]! : null
}
