import { expect, test, beforeEach, afterEach } from 'bun:test'
import { mkdtempSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { DocCache } from './docCache.js'

let tempDir: string

beforeEach(() => { tempDir = mkdtempSync(join(tmpdir(), 'doccache-test-')) })
afterEach(() => { rmSync(tempDir, { recursive: true, force: true }) })

test('starts empty', () => {
  const cache = new DocCache(tempDir)
  expect(cache.list()).toEqual([])
  expect(cache.get('react')).toBeNull()
})

test('set and get a doc', () => {
  const cache = new DocCache(tempDir)
  cache.set('fastify', '5.1.0', '# Fastify Docs\nRoute declaration...')
  expect(cache.get('fastify')).toContain('Fastify Docs')
  expect(cache.has('fastify')).toBe(true)
})

test('get returns null for stale entry', () => {
  const cache = new DocCache(tempDir)
  cache.set('old-lib', '1.0', 'docs')
  // Manually backdate
  const idx = JSON.parse(require('node:fs').readFileSync(join(tempDir, '.openclaude', 'doc-cache', '_index.json'), 'utf-8'))
  idx.entries['old-lib'].fetchedAt = '2020-01-01T00:00:00Z'
  require('node:fs').writeFileSync(join(tempDir, '.openclaude', 'doc-cache', '_index.json'), JSON.stringify(idx))
  const cache2 = new DocCache(tempDir)
  expect(cache2.get('old-lib')).toBeNull()
  expect(cache2.isStale('old-lib')).toBe(true)
})

test('remove deletes entry', () => {
  const cache = new DocCache(tempDir)
  cache.set('zod', '3.24', 'schema validation')
  expect(cache.remove('zod')).toBe(true)
  expect(cache.has('zod')).toBe(false)
  expect(cache.remove('nonexistent')).toBe(false)
})

test('clear removes all', () => {
  const cache = new DocCache(tempDir)
  cache.set('a', '1', 'doc a')
  cache.set('b', '2', 'doc b')
  expect(cache.clear()).toBe(2)
  expect(cache.list()).toEqual([])
})

test('persists across instances', () => {
  const c1 = new DocCache(tempDir)
  c1.set('react', '18.3', 'React docs')
  const c2 = new DocCache(tempDir)
  expect(c2.get('react')).toContain('React docs')
})
