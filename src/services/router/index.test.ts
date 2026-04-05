import { expect, test, afterEach } from 'bun:test'
import { mkdtempSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { initRouter, shutdownRouter, getRouter, getEventLog, getCostTracker } from './index.js'

let tempDir: string

afterEach(() => { shutdownRouter(); if (tempDir) rmSync(tempDir, { recursive: true, force: true }) })

test('initRouter creates all components', () => {
  tempDir = mkdtempSync(join(tmpdir(), 'router-init-'))
  process.env.OPENAI_API_KEY = 'test-key'
  process.env.ANTHROPIC_API_KEY = 'test-key'
  const { router, eventLog, costTracker, healthMonitor, regressionWatch } = initRouter(tempDir)
  expect(router).toBeTruthy()
  expect(eventLog).toBeTruthy()
  expect(costTracker).toBeTruthy()
  expect(healthMonitor).toBeTruthy()
  expect(regressionWatch).toBeTruthy()
})

test('getRouter returns initialized router', () => {
  tempDir = mkdtempSync(join(tmpdir(), 'router-get-'))
  process.env.OPENAI_API_KEY = 'test-key'
  initRouter(tempDir)
  expect(getRouter()).toBeTruthy()
  expect(getEventLog()).toBeTruthy()
  expect(getCostTracker()).toBeTruthy()
})

test('shutdownRouter cleans up', () => {
  tempDir = mkdtempSync(join(tmpdir(), 'router-shutdown-'))
  initRouter(tempDir)
  shutdownRouter()
  expect(getRouter()).toBeNull()
  expect(getEventLog()).toBeNull()
})

test('full routing cycle works end-to-end', () => {
  tempDir = mkdtempSync(join(tmpdir(), 'router-e2e-'))
  process.env.OPENAI_API_KEY = 'test-key'
  process.env.ANTHROPIC_API_KEY = 'test-key'
  const { router } = initRouter(tempDir)
  const result = router.routeTask('Create a new user profile component')
  expect(result.tier).toBe('T1')
  expect(result.override).not.toBeNull()
  expect(result.override!.model).toBe('deepseek-chat')
})
