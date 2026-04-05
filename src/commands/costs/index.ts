import type { Command } from '../../commands.js'

const costs = {
  type: 'local' as const,
  name: 'costs',
  description: 'Show routing costs, savings vs all-Opus, and budget status',
  isHidden: false,
  isEnabled: true,
  supportsNonInteractive: true,
  argumentHint: '[week|month|savings|task]',
  load: () => import('./costs.js'),
} satisfies Command

export default costs
