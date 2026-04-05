import { existsSync, readFileSync, writeFileSync, readdirSync, unlinkSync, mkdirSync, renameSync } from 'node:fs'
import { join } from 'node:path'

interface CacheEntry {
  lib: string
  version: string
  fetchedAt: string
  sizeBytes: number
  sourceUrl: string | null
}

interface CacheIndex {
  entries: Record<string, CacheEntry>
}

export class DocCache {
  private cacheDir: string
  private indexPath: string
  private index: CacheIndex

  constructor(projectDir: string) {
    this.cacheDir = join(projectDir, '.openclaude', 'doc-cache')
    if (!existsSync(this.cacheDir)) mkdirSync(this.cacheDir, { recursive: true })
    this.indexPath = join(this.cacheDir, '_index.json')
    this.index = this.loadIndex()
  }

  get(lib: string, maxAgeDays: number = 7): string | null {
    const entry = this.index.entries[lib]
    if (!entry) return null
    const age = (Date.now() - new Date(entry.fetchedAt).getTime()) / (1000 * 60 * 60 * 24)
    if (age > maxAgeDays) return null
    const filePath = join(this.cacheDir, `${this.sanitize(lib)}.md`)
    if (!existsSync(filePath)) return null
    return readFileSync(filePath, 'utf-8')
  }

  set(lib: string, version: string, content: string, sourceUrl: string | null = null): void {
    const filePath = join(this.cacheDir, `${this.sanitize(lib)}.md`)
    writeFileSync(filePath, content)
    this.index.entries[lib] = {
      lib, version, fetchedAt: new Date().toISOString(),
      sizeBytes: Buffer.byteLength(content), sourceUrl,
    }
    this.saveIndex()
  }

  has(lib: string): boolean { return lib in this.index.entries }

  isStale(lib: string, maxAgeDays: number = 7): boolean {
    const entry = this.index.entries[lib]
    if (!entry) return true
    const age = (Date.now() - new Date(entry.fetchedAt).getTime()) / (1000 * 60 * 60 * 24)
    return age > maxAgeDays
  }

  remove(lib: string): boolean {
    if (!this.index.entries[lib]) return false
    const filePath = join(this.cacheDir, `${this.sanitize(lib)}.md`)
    try { unlinkSync(filePath) } catch {}
    delete this.index.entries[lib]
    this.saveIndex()
    return true
  }

  clear(): number {
    const count = Object.keys(this.index.entries).length
    for (const lib of Object.keys(this.index.entries)) this.remove(lib)
    return count
  }

  list(): CacheEntry[] { return Object.values(this.index.entries) }

  private sanitize(name: string): string { return name.replace(/[^a-zA-Z0-9._-]/g, '_') }

  private loadIndex(): CacheIndex {
    if (!existsSync(this.indexPath)) return { entries: {} }
    try { return JSON.parse(readFileSync(this.indexPath, 'utf-8')) } catch { return { entries: {} } }
  }

  private saveIndex(): void {
    try {
      const tmp = this.indexPath + '.tmp'
      writeFileSync(tmp, JSON.stringify(this.index, null, 2))
      renameSync(tmp, this.indexPath)
    } catch {}
  }
}
