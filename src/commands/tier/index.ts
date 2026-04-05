import type { Command } from '../../commands.js'

const tier = {
  type: 'local' as const,
  name: 'tier',
  description: 'Override routing tier: /tier T3, /tier lock T1, /tier auto',
  isHidden: false,
  isEnabled: true,
  supportsNonInteractive: true,
  argumentHint: '<T0|T1|T2|T3|T4|lock <tier>|auto>',
  load: () => import('./tier.js'),
} satisfies Command

export default tier
