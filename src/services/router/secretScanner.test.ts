import { expect, test } from "bun:test"
import { scanForSecrets, hasSensitiveContent } from "./secretScanner.js"

test("detects sk- API keys", () => {
  const matches = scanForSecrets('const key = "sk-905b563440e14d1385a258aaf1d74295"')
  expect(matches.length).toBe(1)
  expect(matches[0]!.pattern).toBe("api_key_sk")
})

test("detects GitHub PATs", () => {
  const matches = scanForSecrets('token: "ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghij"')
  expect(matches.length).toBe(1)
  expect(matches[0]!.pattern).toBe("github_pat")
})

test("detects JWTs", () => {
  const matches = scanForSecrets('const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U"')
  expect(matches.length).toBe(1)
  expect(matches[0]!.pattern).toBe("jwt")
})

test("detects connection strings", () => {
  const matches = scanForSecrets("DATABASE_URL=postgres://user:pass123@localhost:5432/mydb")
  expect(matches.length).toBe(1)
  expect(matches[0]!.pattern).toBe("connection_string")
})

test("detects password assignments", () => {
  const matches = scanForSecrets('const password = "super_secret_123"')
  expect(matches.length).toBe(1)
  expect(matches[0]!.pattern).toBe("password_assignment")
})

test("detects private keys", () => {
  const matches = scanForSecrets("-----BEGIN RSA PRIVATE KEY-----")
  expect(matches.length).toBe(1)
  expect(matches[0]!.pattern).toBe("private_key")
})

test("detects Anthropic API keys", () => {
  const matches = scanForSecrets("sk-ant-api03-abc123def456ghi789")
  expect(matches.length).toBeGreaterThanOrEqual(1)
})

test("does not flag normal code", () => {
  const matches = scanForSecrets("const x = 42\nfunction hello() { return \"world\" }")
  expect(matches.length).toBe(0)
})

test("hasSensitiveContent returns boolean", () => {
  expect(hasSensitiveContent("sk-abc123def456ghi789jkl")).toBe(true)
  expect(hasSensitiveContent("const x = 42")).toBe(false)
})

test("reports correct line numbers", () => {
  const content = "line1\nline2\nconst key = \"sk-abc123def456ghi789jkl\"\nline4"
  const matches = scanForSecrets(content)
  expect(matches[0]!.line).toBe(3)
})
