export type GuardLevel = 'safe' | 'caution' | 'dangerous'

interface GuardResult { level: GuardLevel; command: string; reason: string | null }

const DANGEROUS_PATTERNS: [RegExp, string][] = [
  [/\brm\s+(-[rfRF]+\s+|.*\s+)\/(?!\s)/i, 'rm -rf with root path'],
  [/\bgit\s+push\s+.*--force\b/i, 'force push'],
  [/\bDROP\s+DATABASE\b/i, 'drop database'],
  [/\bchmod\s+777\b/i, 'chmod 777 (world writable)'],
  [/\bcurl\b.*\|\s*\bbash\b/i, 'piped curl to bash'],
  [/\bwget\b.*\|\s*\bbash\b/i, 'piped wget to bash'],
  [/\bmkfs\b/i, 'format filesystem'],
  [/\bdd\s+if=/i, 'dd raw disk write'],
  [/>\s*\/dev\/sd[a-z]/i, 'write to block device'],
]

const CAUTION_PATTERNS: [RegExp, string][] = [
  [/\bgit\s+reset\s+--hard\b/i, 'hard reset'],
  [/\bgit\s+clean\s+-[fdFD]+/i, 'git clean'],
  [/\brm\s+(-[rfRF]+)/i, 'recursive/force remove'],
  [/\bDROP\s+TABLE\b/i, 'drop table'],
  [/\bTRUNCATE\b/i, 'truncate table'],
  [/\bkill\s+-9\b/i, 'force kill'],
  [/\bgit\s+branch\s+-[dD]\b/i, 'delete branch'],
  [/\bgit\s+stash\s+drop\b/i, 'drop stash'],
  [/\bnpm\s+unpublish\b/i, 'npm unpublish'],
]

export function classifyCommand(command: string): GuardResult {
  for (const [pattern, reason] of DANGEROUS_PATTERNS) {
    if (pattern.test(command)) return { level: 'dangerous', command, reason }
  }
  for (const [pattern, reason] of CAUTION_PATTERNS) {
    if (pattern.test(command)) return { level: 'caution', command, reason }
  }
  return { level: 'safe', command, reason: null }
}
