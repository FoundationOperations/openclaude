import type { Command } from '../../commands.js'

const health = {
  type: 'local' as const,
  name: 'health',
  description: 'Show provider health status, latency, and availability',
  isHidden: false,
  supportsNonInteractive: true,
  argumentHint: '[endpoint]',
  load: () => import('./health.js'),
} satisfies Command

export default health
