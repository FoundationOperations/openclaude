import { expect, test, beforeEach, afterEach } from 'bun:test'
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { DocEngine } from './docEngine.js'

let tempDir: string

beforeEach(() => { tempDir = mkdtempSync(join(tmpdir(), 'doceng-test-')) })
afterEach(() => { rmSync(tempDir, { recursive: true, force: true }) })

test('detectStack finds node dependencies', () => {
  writeFileSync(join(tempDir, 'package.json'), JSON.stringify({
    dependencies: { fastify: '^5.1.0', pg: '^8.13.0' },
    devDependencies: { vitest: '^1.0.0' },
  }))
  const engine = new DocEngine(tempDir)
  const manifest = engine.detectStack()
  expect(manifest.runtime).toBe('node')
  expect(manifest.dependencies['fastify']).toBeTruthy()
  expect(manifest.dependencies['pg']).toBeTruthy()
})

test('detectStack handles missing package.json', () => {
  const engine = new DocEngine(tempDir)
  const manifest = engine.detectStack()
  expect(manifest.dependencies).toEqual({})
})

test('resolveDocsForPrompt returns null with no matches', () => {
  const engine = new DocEngine(tempDir)
  expect(engine.resolveDocsForPrompt('Add a simple function')).toBeNull()
})

test('resolveDocsForPrompt injects cached docs', () => {
  const engine = new DocEngine(tempDir)
  engine.getCache().set('fastify', '5.1', '# Fastify\nRoute declaration API')
  const result = engine.resolveDocsForPrompt('Add a Fastify route for users')
  expect(result).toContain('<technical-reference>')
  expect(result).toContain('Fastify')
  expect(result).toContain('Route declaration')
})

test('getUncachedLibs identifies missing docs', () => {
  const engine = new DocEngine(tempDir)
  engine.getCache().set('react', '18', 'React docs')
  const uncached = engine.getUncachedLibs('Build a React component with Tailwind styling')
  expect(uncached).toContain('tailwindcss')
  expect(uncached).not.toContain('react')
})

test('extractLibraryMentions finds known libs', () => {
  const engine = new DocEngine(tempDir)
  const result = engine.getUncachedLibs('Use Prisma with PostgreSQL and deploy to Cloudflare')
  expect(result).toContain('prisma')
  expect(result).toContain('postgres')
  expect(result).toContain('cloudflare')
})
