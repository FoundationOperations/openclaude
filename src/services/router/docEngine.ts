import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { DocCache } from './docCache.js'

export interface StackManifest {
  runtime: string | null
  dependencies: Record<string, string>
  detectedAt: string
}

export class DocEngine {
  private cache: DocCache
  private projectDir: string
  private manifest: StackManifest | null = null

  constructor(projectDir: string) {
    this.projectDir = projectDir
    this.cache = new DocCache(projectDir)
  }

  getCache(): DocCache { return this.cache }

  detectStack(): StackManifest {
    const deps: Record<string, string> = {}
    let runtime: string | null = null

    // Node.js
    const pkgPath = join(this.projectDir, 'package.json')
    if (existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
        runtime = pkg.engines?.node ? `node@${pkg.engines.node}` : 'node'
        const allDeps = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) }
        for (const [name, version] of Object.entries(allDeps)) {
          deps[name] = String(version).replace(/^[\^~]/, '')
        }
      } catch {}
    }

    // Python
    const reqPath = join(this.projectDir, 'requirements.txt')
    if (existsSync(reqPath)) {
      runtime = runtime ?? 'python'
      try {
        const lines = readFileSync(reqPath, 'utf-8').split('\n')
        for (const line of lines) {
          const match = line.trim().match(/^([a-zA-Z0-9_-]+)==(.+)/)
          if (match) deps[match[1]!] = match[2]!
        }
      } catch {}
    }

    this.manifest = { runtime, dependencies: deps, detectedAt: new Date().toISOString() }
    return this.manifest
  }

  getManifest(): StackManifest | null { return this.manifest }

  resolveDocsForPrompt(prompt: string, maxTokens: number = 8000): string | null {
    const libs = this.extractLibraryMentions(prompt)
    if (libs.length === 0) return null

    const docs: string[] = []
    let totalChars = 0
    const charLimit = maxTokens * 4

    for (const lib of libs) {
      const cached = this.cache.get(lib)
      if (cached && totalChars + cached.length <= charLimit) {
        docs.push(`### ${lib}\n${cached}`)
        totalChars += cached.length
      }
    }

    if (docs.length === 0) return null
    return `<technical-reference>\n${docs.join('\n\n')}\n</technical-reference>`
  }

  getUncachedLibs(prompt: string): string[] {
    const libs = this.extractLibraryMentions(prompt)
    return libs.filter(lib => !this.cache.has(lib) || this.cache.isStale(lib))
  }

  private extractLibraryMentions(prompt: string): string[] {
    const known = new Map<RegExp, string>([
      [/\breact\b/i, 'react'], [/\bvue\b/i, 'vue'], [/\bangular\b/i, 'angular'],
      [/\bsvelte\b/i, 'svelte'], [/\bnext\.?js\b/i, 'nextjs'], [/\bnuxt\b/i, 'nuxt'],
      [/\bfastify\b/i, 'fastify'], [/\bexpress\b/i, 'express'], [/\bhono\b/i, 'hono'],
      [/\bpostgres(?:ql)?\b/i, 'postgres'], [/\bmysql\b/i, 'mysql'], [/\bredis\b/i, 'redis'],
      [/\bmongo\b/i, 'mongodb'], [/\bsqlite\b/i, 'sqlite'], [/\bsupabase\b/i, 'supabase'],
      [/\bprisma\b/i, 'prisma'], [/\bdrizzle\b/i, 'drizzle'],
      [/\bplaywright\b/i, 'playwright'], [/\bjest\b/i, 'jest'], [/\bvitest\b/i, 'vitest'],
      [/\btailwind\b/i, 'tailwindcss'], [/\bshadcn\b/i, 'shadcn'],
      [/\bzod\b/i, 'zod'], [/\bdocker\b/i, 'docker'], [/\bnginx\b/i, 'nginx'],
      [/\bcaddy\b/i, 'caddy'], [/\bcloudflare\b/i, 'cloudflare'],
    ])

    const found: string[] = []
    for (const [pattern, name] of known) {
      if (pattern.test(prompt) && !found.includes(name)) found.push(name)
    }
    return found
  }
}
