import type { Command } from '../../commands.js'

const budget = {
  type: 'local' as const,
  name: 'budget',
  description: 'Set daily spend budget: /budget 5.00',
  isHidden: false,
  supportsNonInteractive: true,
  argumentHint: '<amount>',
  load: () => import('./budget.js'),
} satisfies Command

export default budget
