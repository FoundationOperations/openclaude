import type { Command } from '../../commands.js'

const log = {
  type: 'local' as const,
  name: 'log',
  description: 'Show session event log: /log, /log decisions, /log costs',
  isHidden: false,
  isEnabled: true,
  supportsNonInteractive: true,
  argumentHint: '[decisions|costs|all]',
  load: () => import('./log.js'),
} satisfies Command

export default log
