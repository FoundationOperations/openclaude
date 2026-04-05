interface SecretMatch {
  line: number
  column: number
  pattern: string
  snippet: string
}

const SECRET_PATTERNS: [RegExp, string][] = [
  [/sk-[a-zA-Z0-9]{20,}/g, "api_key_sk"],
  [/ghp_[a-zA-Z0-9]{36}/g, "github_pat"],
  [/ghu_[a-zA-Z0-9]{36}/g, "github_user_token"],
  [/github_pat_[a-zA-Z0-9_]{82}/g, "github_fine_grained_pat"],
  [/key-[a-zA-Z0-9]{20,}/g, "api_key_generic"],
  [/eyJ[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}/g, "jwt"],
  [/-----BEGIN (RSA |EC |DSA |)PRIVATE KEY-----/g, "private_key"],
  [/postgres(ql)?:\/\/[^\s"']+:[^\s"']+@[^\s"']+/gi, "connection_string"],
  [/mysql:\/\/[^\s"']+:[^\s"']+@[^\s"']+/gi, "connection_string"],
  [/mongodb(\+srv)?:\/\/[^\s"']+:[^\s"']+@[^\s"']+/gi, "connection_string"],
  [/(password|passwd|pwd)\s*[:=]\s*["'][^"']{4,}["']/gi, "password_assignment"],
  [/AKIA[0-9A-Z]{16}/g, "aws_access_key"],
  [/sk-ant-[a-zA-Z0-9_-]{20,}/g, "anthropic_api_key"],
]

export function scanForSecrets(content: string): SecretMatch[] {
  const matches: SecretMatch[] = []
  const lines = content.split("\n")
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    for (const [pattern, name] of SECRET_PATTERNS) {
      pattern.lastIndex = 0
      let match: RegExpExecArray | null
      while ((match = pattern.exec(line)) !== null) {
        matches.push({ line: i + 1, column: match.index + 1, pattern: name, snippet: match[0].slice(0, 20) + "..." })
      }
    }
  }
  return matches
}

export function hasSensitiveContent(content: string): boolean {
  return scanForSecrets(content).length > 0
}
