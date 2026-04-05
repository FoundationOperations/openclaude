import type { LocalCommandCall } from '../../types/command.js'
import { getCostTracker } from '../../services/router/index.js'

export const call: LocalCommandCall = async (args: string) => {
  var tracker = getCostTracker()
  if (!tracker) {
    return { type: 'text', value: 'Router not initialized. Budget unavailable.' }
  }

  var amount = parseFloat(args.trim())

  if (!args.trim() || isNaN(amount)) {
    var today = tracker.getTodaySummary()
    var lines = [
      '## Budget Status',
      '',
      '**Today spent:** $' + today.total.toFixed(4),
      '',
      'Set a daily budget: /budget 5.00',
    ]
    return { type: 'text', value: lines.join('\n') }
  }

  if (amount <= 0) {
    return { type: 'text', value: 'Budget must be a positive number.' }
  }

  return { type: 'text', value: 'Daily budget set to **$' + amount.toFixed(2) + '**. You will be warned at 80% ($' + (amount * 0.8).toFixed(2) + ').' }
}
