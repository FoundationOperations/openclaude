import { expect, test } from 'bun:test'
import { nextTier, TIER_ORDER, DEFAULT_TIER_CONFIGS } from './types.js'

test('TIER_ORDER has 5 tiers in ascending cost order', () => {
  expect(TIER_ORDER).toEqual(['T0', 'T1', 'T2', 'T3', 'T4'])
})

test('nextTier returns next tier in order', () => {
  expect(nextTier('T0')).toBe('T1')
  expect(nextTier('T1')).toBe('T2')
  expect(nextTier('T3')).toBe('T4')
})

test('nextTier returns null for T4 (highest)', () => {
  expect(nextTier('T4')).toBeNull()
})

test('DEFAULT_TIER_CONFIGS has config for every tier', () => {
  for (const tier of TIER_ORDER) {
    expect(DEFAULT_TIER_CONFIGS[tier]).toBeDefined()
    expect(DEFAULT_TIER_CONFIGS[tier].tier).toBe(tier)
    expect(DEFAULT_TIER_CONFIGS[tier].model).toBeTruthy()
    expect(DEFAULT_TIER_CONFIGS[tier].baseURL).toBeTruthy()
  }
})

test('T0 is free', () => {
  expect(DEFAULT_TIER_CONFIGS.T0.inputPricePerM).toBe(0)
  expect(DEFAULT_TIER_CONFIGS.T0.outputPricePerM).toBe(0)
})

test('tier costs increase from T0 to T4', () => {
  let prevCost = -1
  for (const tier of TIER_ORDER) {
    const cost = DEFAULT_TIER_CONFIGS[tier].outputPricePerM
    expect(cost).toBeGreaterThanOrEqual(prevCost)
    prevCost = cost
  }
})
