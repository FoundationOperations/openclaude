import type { Tier, TierConfig } from './types.js'
import { DEFAULT_TIER_CONFIGS } from './types.js'

export class PriceTable {
  private prices: Map<string, { inputPerM: number; outputPerM: number }>

  constructor(tierConfigs: Record<Tier, TierConfig> = DEFAULT_TIER_CONFIGS) {
    this.prices = new Map()
    for (const config of Object.values(tierConfigs)) {
      this.prices.set(config.model, {
        inputPerM: config.inputPricePerM,
        outputPerM: config.outputPricePerM,
      })
    }
  }

  calculateCost(model: string, tokensIn: number, tokensOut: number): { costIn: number; costOut: number; costTotal: number } {
    const price = this.prices.get(model)
    if (!price) {
      return { costIn: 0, costOut: 0, costTotal: 0 }
    }
    const costIn = (tokensIn / 1_000_000) * price.inputPerM
    const costOut = (tokensOut / 1_000_000) * price.outputPerM
    return { costIn, costOut, costTotal: costIn + costOut }
  }

  calculateOpusCost(tokensIn: number, tokensOut: number): number {
    const opusPrice = this.prices.get('claude-opus-4-20250514')
    if (!opusPrice) {
      return (tokensIn / 1_000_000) * 15 + (tokensOut / 1_000_000) * 75
    }
    return (tokensIn / 1_000_000) * opusPrice.inputPerM + (tokensOut / 1_000_000) * opusPrice.outputPerM
  }

  getModelPrice(model: string): { inputPerM: number; outputPerM: number } | null {
    return this.prices.get(model) ?? null
  }

  updatePrice(model: string, inputPerM: number, outputPerM: number): void {
    this.prices.set(model, { inputPerM, outputPerM })
  }

  getAllPrices(): Map<string, { inputPerM: number; outputPerM: number }> {
    return new Map(this.prices)
  }
}
