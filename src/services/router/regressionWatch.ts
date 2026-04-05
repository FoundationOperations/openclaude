import { existsSync, readFileSync, writeFileSync, renameSync } from 'node:fs'
import { join } from 'node:path'

interface FileRecord { failCount: number; lastFail: string; lastTier: string; commonError: string | null }

export class RegressionWatch {
  private dataPath: string
  private records: Map<string, FileRecord>

  constructor(projectDir: string) {
    this.dataPath = join(projectDir, '.openclaude', 'regression-watch.json')
    this.records = this.load()
  }

  recordFailure(filePath: string, tier: string, error: string | null = null): void {
    const existing = this.records.get(filePath)
    this.records.set(filePath, {
      failCount: (existing?.failCount ?? 0) + 1,
      lastFail: new Date().toISOString().slice(0, 10),
      lastTier: tier,
      commonError: error ?? existing?.commonError ?? null,
    })
    this.save()
  }

  recordSuccess(filePath: string): void {
    const existing = this.records.get(filePath)
    if (existing && existing.failCount > 0) {
      existing.failCount = Math.max(0, existing.failCount - 1)
      this.save()
    }
  }

  getFailCount(filePath: string): number { return this.records.get(filePath)?.failCount ?? 0 }
  shouldEscalate(filePath: string, threshold: number = 3): boolean { return this.getFailCount(filePath) >= threshold }

  getProblematicFiles(threshold: number = 3): Map<string, FileRecord> {
    const result = new Map<string, FileRecord>()
    for (const [path, record] of this.records) { if (record.failCount >= threshold) result.set(path, record) }
    return result
  }

  getAllRecords(): Map<string, FileRecord> { return new Map(this.records) }

  private load(): Map<string, FileRecord> {
    if (!existsSync(this.dataPath)) return new Map()
    try { return new Map(Object.entries(JSON.parse(readFileSync(this.dataPath, 'utf-8')))) } catch { return new Map() }
  }

  private save(): void {
    try {
      const obj: Record<string, FileRecord> = {}
      for (const [k, v] of this.records) obj[k] = v
      const tmp = this.dataPath + '.tmp'
      writeFileSync(tmp, JSON.stringify(obj, null, 2))
      renameSync(tmp, this.dataPath)
    } catch {}
  }
}
