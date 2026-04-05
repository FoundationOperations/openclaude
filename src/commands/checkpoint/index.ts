import type { Command } from '../../commands.js'

const checkpoint = {
  type: 'local' as const,
  name: 'checkpoint',
  description: 'Save a session checkpoint with decisions, tasks, and modified files',
  isHidden: false,
  isEnabled: true,
  supportsNonInteractive: true,
  load: () => import('./checkpoint.js'),
} satisfies Command

export default checkpoint
