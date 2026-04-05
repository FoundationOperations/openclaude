import { expect, test } from 'bun:test'
import { compressContext } from './contextCompressor.js'

test('keeps recent turns unchanged', () => {
  const messages = Array.from({ length: 5 }, (_, i) => `Message ${i}`)
  const result = compressContext(messages, { keepRecentTurns: 10 })
  expect(result.compressed).toContain('Message 0')
  expect(result.compressed).toContain('Message 4')
  expect(result.savedPercent).toBe(0)
})

test('truncates old code blocks', () => {
  const oldCode = '```typescript\n' + Array.from({ length: 50 }, (_, i) => `line ${i}`).join('\n') + '\n```'
  const messages = [oldCode, ...Array.from({ length: 15 }, (_, i) => `Recent ${i}`)]
  const result = compressContext(messages, { keepRecentTurns: 10, maxCodeBlockLines: 5, stripToolOutputsOlderThan: 5 })
  expect(result.compressed).toContain('truncated')
  expect(result.savedTokens).toBeGreaterThan(0)
})

test('strips old tool results', () => {
  const toolResult = '<tool-result>' + 'x'.repeat(500) + '</tool-result>'
  const messages = [toolResult, ...Array.from({ length: 15 }, (_, i) => `Recent ${i}`)]
  const result = compressContext(messages, { keepRecentTurns: 10, stripToolOutputsOlderThan: 5 })
  expect(result.compressed).toContain('[compressed]')
  expect(result.savedTokens).toBeGreaterThan(0)
})

test('preserves decision messages', () => {
  const messages = ['We decided to use JWT for auth', ...Array.from({ length: 15 }, (_, i) => `Recent ${i}`)]
  const result = compressContext(messages, { keepRecentTurns: 10 })
  expect(result.compressed).toContain('decided to use JWT')
})

test('returns correct savings stats', () => {
  const bigOutput = '<result>' + 'x'.repeat(2000) + '</result>'
  const messages = [bigOutput, bigOutput, bigOutput, ...Array.from({ length: 15 }, (_, i) => `Recent ${i}`)]
  const result = compressContext(messages, { keepRecentTurns: 10, stripToolOutputsOlderThan: 5 })
  expect(result.savedPercent).toBeGreaterThan(0)
  expect(result.compressedTokens).toBeLessThan(result.originalTokens)
})

test('handles empty input', () => {
  const result = compressContext([])
  expect(result.compressed).toBe('')
  expect(result.savedTokens).toBe(0)
})

test('small code blocks are not truncated', () => {
  const smallCode = '```js\nconst x = 1\n```'
  const messages = [smallCode, ...Array.from({ length: 15 }, (_, i) => `Recent ${i}`)]
  const result = compressContext(messages, { keepRecentTurns: 10, stripToolOutputsOlderThan: 5 })
  expect(result.compressed).toContain('const x = 1')
  expect(result.compressed).not.toContain('truncated')
})
