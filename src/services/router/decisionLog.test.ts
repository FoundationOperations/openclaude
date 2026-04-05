import { expect, test, beforeEach, afterEach } from 'bun:test'
import { mkdtempSync, rmSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { DecisionLog } from './decisionLog.js'

let tempDir: string

beforeEach(() => { tempDir = mkdtempSync(join(tmpdir(), 'decision-test-')) })
afterEach(() => { rmSync(tempDir, { recursive: true, force: true }) })

test('starts empty', () => {
  const log = new DecisionLog(tempDir)
  expect(log.getDecisions()).toEqual([])
})

test('adds a decision with auto-generated id and date', () => {
  const log = new DecisionLog(tempDir)
  const d = log.addDecision({ title: 'Use JWT', choice: 'JWT over sessions', why: 'Stateless API', alternativesRejected: ['session cookies'], session: 'test-session' })
  expect(d.id).toBeTruthy()
  expect(d.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  expect(log.getDecisions().length).toBe(1)
})

test('removes a decision by id', () => {
  const log = new DecisionLog(tempDir)
  const d = log.addDecision({ title: 'Test', choice: 'A', why: 'B', alternativesRejected: [], session: 's1' })
  expect(log.removeDecision(d.id)).toBe(true)
  expect(log.getDecisions().length).toBe(0)
})

test('removeDecision returns false for unknown id', () => {
  const log = new DecisionLog(tempDir)
  expect(log.removeDecision('nonexistent')).toBe(false)
})

test('persists across instances via markdown', () => {
  const log1 = new DecisionLog(tempDir)
  log1.addDecision({ title: 'Use Fastify', choice: 'Fastify over Express', why: 'Performance', alternativesRejected: ['Express', 'Koa'], session: 's1' })
  log1.addDecision({ title: 'Use Postgres', choice: 'PG over Mongo', why: 'Relational data', alternativesRejected: ['MongoDB'], session: 's1' })

  const log2 = new DecisionLog(tempDir)
  expect(log2.getDecisions().length).toBe(2)
  expect(log2.getDecisions()[0]!.title).toBe('Use Fastify')
  expect(log2.getDecisions()[1]!.choice).toBe('PG over Mongo')
})

test('searchDecisions filters by query', () => {
  const log = new DecisionLog(tempDir)
  log.addDecision({ title: 'Use JWT', choice: 'JWT auth', why: 'stateless', alternativesRejected: [], session: 's1' })
  log.addDecision({ title: 'Use Postgres', choice: 'PG', why: 'relational', alternativesRejected: [], session: 's1' })
  expect(log.searchDecisions('jwt').length).toBe(1)
  expect(log.searchDecisions('postgres').length).toBe(1)
  expect(log.searchDecisions('nonexistent').length).toBe(0)
})

test('toContextString produces summary for injection', () => {
  const log = new DecisionLog(tempDir)
  log.addDecision({ title: 'Use JWT', choice: 'JWT over sessions', why: 'Stateless', alternativesRejected: [], session: 's1' })
  const ctx = log.toContextString()
  expect(ctx).toContain('Use JWT')
  expect(ctx).toContain('JWT over sessions')
  expect(ctx).toContain('Stateless')
})

test('toContextString returns empty for no decisions', () => {
  const log = new DecisionLog(tempDir)
  expect(log.toContextString()).toBe('')
})
