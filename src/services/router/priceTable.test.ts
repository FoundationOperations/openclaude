import { expect, test } from 'bun:test'
import { PriceTable } from './priceTable.js'

test('calculates DeepSeek cost correctly', () => {
  const table = new PriceTable()
  const result = table.calculateCost('deepseek-chat', 1_000_000, 1_000_000)
  expect(result.costIn).toBeCloseTo(0.28, 2)
  expect(result.costOut).toBeCloseTo(0.42, 2)
  expect(result.costTotal).toBeCloseTo(0.70, 2)
})

test('calculates Ollama cost as zero', () => {
  const table = new PriceTable()
  const result = table.calculateCost('qwen2.5:7b', 1_000_000, 1_000_000)
  expect(result.costTotal).toBe(0)
})

test('calculates Opus cost correctly', () => {
  const table = new PriceTable()
  const result = table.calculateCost('claude-opus-4-20250514', 1_000_000, 1_000_000)
  expect(result.costIn).toBeCloseTo(15.0, 1)
  expect(result.costOut).toBeCloseTo(75.0, 1)
})

test('returns zero for unknown model', () => {
  const table = new PriceTable()
  const result = table.calculateCost('unknown-model', 1000, 1000)
  expect(result.costTotal).toBe(0)
})

test('calculateOpusCost gives all-Opus equivalent', () => {
  const table = new PriceTable()
  const opusCost = table.calculateOpusCost(100_000, 50_000)
  expect(opusCost).toBeCloseTo(5.25, 2)
})

test('updatePrice changes pricing', () => {
  const table = new PriceTable()
  table.updatePrice('deepseek-chat', 0.50, 0.80)
  const result = table.calculateCost('deepseek-chat', 1_000_000, 1_000_000)
  expect(result.costIn).toBeCloseTo(0.50, 2)
  expect(result.costOut).toBeCloseTo(0.80, 2)
})
