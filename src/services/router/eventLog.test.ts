import { expect, test, beforeEach, afterEach } from "bun:test"
import { mkdtempSync, rmSync } from "node:fs"
import { join } from "node:path"
import { tmpdir } from "node:os"
import { EventLog } from "./eventLog.js"

let tempDir: string

beforeEach(() => {
  tempDir = mkdtempSync(join(tmpdir(), "eventlog-test-"))
})

afterEach(() => {
  rmSync(tempDir, { recursive: true, force: true })
})

test("creates session log file on construction", () => {
  const log = new EventLog(tempDir)
  const sessions = EventLog.listSessions(tempDir)
  expect(sessions.length).toBe(1)
})

test("emits session_start event on construction", () => {
  const log = new EventLog(tempDir)
  const events = log.getRecentEvents()
  expect(events.length).toBe(1)
  expect(events[0]!.event).toBe("session_start")
  expect(events[0]!.project).toBe(tempDir)
})

test("emit adds events to ring buffer and disk", () => {
  const log = new EventLog(tempDir)
  log.emit({ event: "test_event", data: "hello" })
  const events = log.getRecentEvents()
  expect(events.length).toBe(2)
  expect(events[1]!.event).toBe("test_event")
  expect(events[1]!.data).toBe("hello")

  const diskEvents = EventLog.readSessionLog(log.getLogPath())
  expect(diskEvents.length).toBe(2)
})

test("getEventsByType filters correctly", () => {
  const log = new EventLog(tempDir)
  log.emit({ event: "api_call", model: "deepseek-chat" })
  log.emit({ event: "file_edit", path: "/tmp/test.ts" })
  log.emit({ event: "api_call", model: "qwen2.5:7b" })

  const apiCalls = log.getEventsByType("api_call")
  expect(apiCalls.length).toBe(2)
  expect(apiCalls[0]!.model).toBe("deepseek-chat")
  expect(apiCalls[1]!.model).toBe("qwen2.5:7b")
})

test("ring buffer respects size limit", () => {
  const log = new EventLog(tempDir)
  for (let i = 0; i < 1100; i++) {
    log.emit({ event: "bulk", i })
  }
  const events = log.getRecentEvents(2000)
  expect(events.length).toBe(1000)
})

test("hash chain is valid", () => {
  const log = new EventLog(tempDir)
  log.emit({ event: "test1" })
  log.emit({ event: "test2" })
  log.emit({ event: "test3" })
  log.end()

  const result = EventLog.verifyIntegrity(log.getLogPath())
  expect(result.valid).toBe(true)
  expect(result.brokenAt).toBeNull()
})

test("end emits session_end event", () => {
  const log = new EventLog(tempDir)
  log.end()
  const events = log.getRecentEvents()
  expect(events[events.length - 1]!.event).toBe("session_end")
})

test("session linking works", () => {
  const log1 = new EventLog(tempDir)
  const session1Id = log1.getSessionId()
  log1.end()

  const log2 = new EventLog(tempDir, session1Id)
  const events = log2.getRecentEvents()
  expect(events[0]!.prev_session).toBe(session1Id)
})
