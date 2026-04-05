import type { Command } from '../../commands.js'

const decisions = {
  type: 'local' as const,
  name: 'decisions',
  description: 'Show or manage project decisions: /decisions, /decisions add <text>',
  isHidden: false,
  isEnabled: true,
  supportsNonInteractive: true,
  argumentHint: '[add <title>|remove <id>|search <query>]',
  load: () => import('./decisions.js'),
} satisfies Command

export default decisions
