import type { Tier, HealthStatus, TierConfig } from './types.js'
import { DEFAULT_TIER_CONFIGS } from './types.js'
import type { EventLog } from './eventLog.js'

export class HealthMonitor {
  private statuses: Map<Tier, HealthStatus> = new Map()
  private intervalHandle: ReturnType<typeof setInterval> | null = null
  private eventLog: EventLog | null = null

  constructor(projectDir: string, tiers: Record<Tier, TierConfig> = DEFAULT_TIER_CONFIGS) {}

  setEventLog(eventLog: EventLog): void { this.eventLog = eventLog }
  start(intervalMs: number = 60000): void { /* TODO: implement health checks */ }
  stop(): void { if (this.intervalHandle) { clearInterval(this.intervalHandle); this.intervalHandle = null } }
  getStatus(tier: Tier): HealthStatus | undefined { return this.statuses.get(tier) }
  getAllStatuses(): Map<Tier, HealthStatus> { return new Map(this.statuses) }
}
