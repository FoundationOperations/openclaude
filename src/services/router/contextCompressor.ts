export interface CompressResult {
  compressed: string
  originalTokens: number
  compressedTokens: number
  savedTokens: number
  savedPercent: number
}

export function compressContext(messages: string[], options: {
  keepRecentTurns?: number
  maxCodeBlockLines?: number
  stripToolOutputsOlderThan?: number
} = {}): CompressResult {
  const keepRecent = options.keepRecentTurns ?? 10
  const maxCodeLines = options.maxCodeBlockLines ?? 5
  const stripToolAge = options.stripToolOutputsOlderThan ?? 10

  const originalTokens = estimateTokens(messages.join("\n"))
  const totalTurns = messages.length

  const compressed: string[] = []

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i]!
    const turnsFromEnd = totalTurns - i
    const isRecent = turnsFromEnd <= keepRecent

    if (isRecent) {
      compressed.push(msg)
      continue
    }

    let processed = msg

    // Strip tool outputs from old turns
    if (turnsFromEnd > stripToolAge) {
      processed = processed.replace(
        /```[\s\S]*?```/g,
        (match) => {
          const lines = match.split("\n")
          if (lines.length <= maxCodeLines + 2) return match
          const lang = lines[0] ?? "```"
          const kept = lines.slice(1, maxCodeLines + 1).join("\n")
          return `${lang}\n${kept}\n... (${lines.length - maxCodeLines - 2} lines truncated)\n\`\`\``
        }
      )
    }

    // Strip verbose tool results from old turns
    if (turnsFromEnd > stripToolAge) {
      processed = processed.replace(
        /<tool-result>[\s\S]*?<\/tool-result>/g,
        "<tool-result>[compressed]</tool-result>"
      )
      processed = processed.replace(
        /<result>[\s\S]*?<\/result>/g,
        (match) => {
          if (match.length < 200) return match
          return "<result>[compressed \u2014 see recent context]</result>"
        }
      )
    }

    // Always preserve decision markers
    if (processed.includes("decision") || processed.includes("decided") || processed.includes("chose")) {
      compressed.push(processed)
      continue
    }

    // Drop empty or near-empty messages after compression
    const stripped = processed.replace(/\s+/g, " ").trim()
    if (stripped.length > 10) {
      compressed.push(processed)
    }
  }

  const compressedText = compressed.join("\n")
  const compressedTokens = estimateTokens(compressedText)
  const savedTokens = originalTokens - compressedTokens
  const savedPercent = originalTokens > 0 ? (savedTokens / originalTokens) * 100 : 0

  return {
    compressed: compressedText,
    originalTokens,
    compressedTokens,
    savedTokens,
    savedPercent,
  }
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}
