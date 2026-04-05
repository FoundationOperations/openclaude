import type { Command } from '../../commands.js'

const decisions = {
  type: 'local' as const,
  name: 'decisions',
  description: 'Show or manage project decisions: /decisions, /decisions add <text>',
  isHidden: false,
  supportsNonInteractive: true,
  argumentHint: '[add <title>|remove <id>|search <query>]',
  load: () => import('./decisions.js'),
} satisfies Command

export default decisions
