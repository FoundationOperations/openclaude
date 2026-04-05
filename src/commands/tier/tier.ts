import type { LocalCommandCall } from '../../types/command.js'
import { getRouter } from '../../services/router/index.js'
import type { Tier } from '../../services/router/types.js'

const VALID_TIERS = ['T0', 'T1', 'T2', 'T3', 'T4'] as const

export const call: LocalCommandCall = async (args: string) => {
  const router = getRouter()
  if (!router) {
    return { type: 'text', value: 'Router not initialized.' }
  }

  const parts = args.trim().split(/\s+/)
  const cmd = parts[0]?.toUpperCase()

  if (!cmd || cmd === 'STATUS') {
    const enabled = router.isEnabled()
    return {
      type: 'text',
      value: [
        '## Tier Routing',
        '',
        `**Status:** ${enabled ? 'automatic' : 'disabled (fallback mode)'}`,
        '',
        'Usage:',
        '- `/tier T1` -- force next request to T1 (one-shot)',
        '- `/tier lock T2` -- lock all requests to T2',
        '- `/tier auto` -- return to automatic routing',
        '',
        'Tiers: T0 (Ollama/free) → T1 (DeepSeek) → T2 (DeepSeek R1) → T3 (Sonnet) → T4 (Opus)',
      ].join('\n'),
    }
  }

  if (cmd === 'AUTO') {
    router.setTierLock(null)
    router.setTierOverride(null)
    return { type: 'text', value: 'Routing set to **automatic**. Classifier will choose the optimal tier.' }
  }

  if (cmd === 'LOCK') {
    const tierArg = parts[1]?.toUpperCase()
    if (!tierArg || !VALID_TIERS.includes(tierArg as any)) {
      return { type: 'text', value: `Invalid tier. Use: /tier lock <T0|T1|T2|T3|T4>` }
    }
    router.setTierLock(tierArg as Tier)
    return { type: 'text', value: `Routing **locked** to **${tierArg}**. All requests will use this tier until \`/tier auto\`.` }
  }

  if (VALID_TIERS.includes(cmd as any)) {
    router.setTierOverride(cmd as Tier)
    return { type: 'text', value: `Next request will use **${cmd}** (one-shot). After that, automatic routing resumes.` }
  }

  return { type: 'text', value: `Unknown argument: ${cmd}. Use: /tier <T0-T4|lock <tier>|auto>` }
}
