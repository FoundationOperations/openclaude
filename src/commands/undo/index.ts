import type { Command } from '../../commands.js'

const undo = {
  type: 'local' as const,
  name: 'undo',
  description: 'Rollback last changes: /undo or /undo all',
  isHidden: false,
  supportsNonInteractive: true,
  argumentHint: '[all]',
  load: () => import('./undo.js'),
} satisfies Command

export default undo
