import { expect, test, beforeEach, afterEach } from 'bun:test'
import { mkdtempSync, rmSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { RegressionWatch } from './regressionWatch.js'

let tempDir: string

beforeEach(() => { tempDir = mkdtempSync(join(tmpdir(), 'regression-test-')); mkdirSync(join(tempDir, '.openclaude'), { recursive: true }) })
afterEach(() => { rmSync(tempDir, { recursive: true, force: true }) })

test('starts with zero failures', () => { expect(new RegressionWatch(tempDir).getFailCount('src/auth.ts')).toBe(0) })

test('records failures and increments count', () => {
  const w = new RegressionWatch(tempDir)
  w.recordFailure('src/auth.ts', 'T1', 'type error')
  w.recordFailure('src/auth.ts', 'T1', 'type error')
  w.recordFailure('src/auth.ts', 'T1')
  expect(w.getFailCount('src/auth.ts')).toBe(3)
})

test('shouldEscalate returns true at threshold', () => {
  const w = new RegressionWatch(tempDir)
  w.recordFailure('src/auth.ts', 'T1'); w.recordFailure('src/auth.ts', 'T1')
  expect(w.shouldEscalate('src/auth.ts')).toBe(false)
  w.recordFailure('src/auth.ts', 'T1')
  expect(w.shouldEscalate('src/auth.ts')).toBe(true)
})

test('success decays fail count', () => {
  const w = new RegressionWatch(tempDir)
  w.recordFailure('src/auth.ts', 'T1'); w.recordFailure('src/auth.ts', 'T1')
  w.recordSuccess('src/auth.ts')
  expect(w.getFailCount('src/auth.ts')).toBe(1)
})

test('getProblematicFiles returns only high-failure files', () => {
  const w = new RegressionWatch(tempDir)
  w.recordFailure('src/auth.ts', 'T1'); w.recordFailure('src/auth.ts', 'T1'); w.recordFailure('src/auth.ts', 'T1')
  w.recordFailure('src/routes.ts', 'T1')
  const p = w.getProblematicFiles()
  expect(p.size).toBe(1)
  expect(p.has('src/auth.ts')).toBe(true)
})

test('persists across instances', () => {
  const w1 = new RegressionWatch(tempDir)
  w1.recordFailure('src/auth.ts', 'T1'); w1.recordFailure('src/auth.ts', 'T1')
  expect(new RegressionWatch(tempDir).getFailCount('src/auth.ts')).toBe(2)
})
