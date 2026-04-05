import type { LocalCommandCall } from '../../types/command.js'
import { getCostTracker } from '../../services/router/index.js'

export const call: LocalCommandCall = async (args: string) => {
  const tracker = getCostTracker()
  if (!tracker) {
    return { type: 'text', value: 'Router not initialized. Cost tracking unavailable.' }
  }

  const subcommand = args.trim().toLowerCase()

  if (subcommand === 'savings') {
    const s = tracker.getSavingsToday()
    return {
      type: 'text',
      value: [
        '## Savings vs All-Opus',
        '',
        `Today's actual spend: **$${s.actual.toFixed(4)}**`,
        `All-Opus equivalent: **$${s.opusEquivalent.toFixed(4)}**`,
        `Saved: **$${s.saved.toFixed(4)}** (${s.percentage.toFixed(1)}%)`,
      ].join('\n'),
    }
  }

  if (subcommand === 'month') {
    const m = tracker.getMonthSummary()
    const all = tracker.getAllTimeSummary()
    return {
      type: 'text',
      value: [
        '## Monthly Cost Summary',
        '',
        `This month: **$${m.total.toFixed(4)}**`,
        `Opus equivalent: **$${m.opusEquivalent.toFixed(4)}**`,
        `All-time: **$${all.total.toFixed(4)}**`,
      ].join('\n'),
    }
  }

  // Default: today's breakdown
  const today = tracker.getTodaySummary()
  const savings = tracker.getSavingsToday()

  const modelLines: string[] = []
  for (const [model, data] of Object.entries(today.byModel)) {
    modelLines.push(`| ${model} | ${data.calls} | ${data.tokensIn.toLocaleString()} | ${data.tokensOut.toLocaleString()} | $${data.cost.toFixed(4)} |`)
  }

  const lines = [
    "## Today's Costs",
    '',
    `**Total:** $${today.total.toFixed(4)} | **Opus equivalent:** $${today.opusEquivalent.toFixed(4)} | **Savings:** ${savings.percentage.toFixed(1)}%`,
    '',
  ]

  if (modelLines.length > 0) {
    lines.push(
      '| Model | Calls | Tokens In | Tokens Out | Cost |',
      '|-------|-------|----------|-----------|------|',
      ...modelLines,
    )
  } else {
    lines.push('No API calls recorded today.')
  }

  return { type: 'text', value: lines.join('\n') }
}
