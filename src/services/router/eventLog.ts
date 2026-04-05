import { existsSync, mkdirSync, appendFileSync, readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { createHash } from "node:crypto"
import type { RouterEvent } from "./types.js"

const RING_BUFFER_SIZE = 1000

export class EventLog {
  private logPath: string
  private ringBuffer: RouterEvent[] = []
  private prevHash: string = "0000000000000000"
  private sessionId: string
  private diskAvailable: boolean = true

  constructor(projectDir: string, prevSessionId?: string) {
    const sessionsDir = join(projectDir, ".openclaude", "sessions")
    if (!existsSync(sessionsDir)) {
      mkdirSync(sessionsDir, { recursive: true })
    }

    this.sessionId = new Date().toISOString().replace(/[:.]/g, "").slice(0, 15)
    this.logPath = join(sessionsDir, `${this.sessionId}.jsonl`)

    this.emit({
      event: "session_start",
      prev_session: prevSessionId ?? null,
      project: projectDir,
    })
  }

  getSessionId(): string {
    return this.sessionId
  }

  getLogPath(): string {
    return this.logPath
  }

  emit(data: Omit<RouterEvent, "t"> & { t?: string }): void {
    const event: RouterEvent = {
      t: data.t ?? new Date().toISOString(),
      ...data,
      prev_hash: this.prevHash,
    }

    this.prevHash = createHash("sha256")
      .update(JSON.stringify(event))
      .digest("hex")
      .slice(0, 16)

    this.ringBuffer.push(event)
    if (this.ringBuffer.length > RING_BUFFER_SIZE) {
      this.ringBuffer.shift()
    }

    try {
      appendFileSync(this.logPath, JSON.stringify(event) + "\n")
    } catch (err) {
      this.diskAvailable = false
      console.error(`[eventLog] Disk write failed: ${err}`)
    }
  }

  getRecentEvents(count: number = 50): RouterEvent[] {
    return this.ringBuffer.slice(-count)
  }

  getEventsByType(eventType: string, count: number = 50): RouterEvent[] {
    return this.ringBuffer
      .filter(e => e.event === eventType)
      .slice(-count)
  }

  isDiskAvailable(): boolean {
    return this.diskAvailable
  }

  end(): void {
    this.emit({ event: "session_end" })
  }

  static readSessionLog(logPath: string): RouterEvent[] {
    if (!existsSync(logPath)) return []
    const content = readFileSync(logPath, "utf-8").trim()
    if (!content) return []
    return content.split("\n").map(line => JSON.parse(line) as RouterEvent)
  }

  static listSessions(projectDir: string): string[] {
    const sessionsDir = join(projectDir, ".openclaude", "sessions")
    if (!existsSync(sessionsDir)) return []
    return readdirSync(sessionsDir)
      .filter(f => f.endsWith(".jsonl"))
      .sort()
      .reverse()
  }

  static verifyIntegrity(logPath: string): { valid: boolean; brokenAt: number | null } {
    const events = EventLog.readSessionLog(logPath)
    let prevHash = "0000000000000000"

    for (let i = 0; i < events.length; i++) {
      const event = events[i]!
      if (event.prev_hash !== prevHash) {
        return { valid: false, brokenAt: i }
      }
      prevHash = createHash("sha256")
        .update(JSON.stringify(event))
        .digest("hex")
        .slice(0, 16)
    }

    return { valid: true, brokenAt: null }
  }
}
