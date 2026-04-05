import { existsSync, readFileSync, writeFileSync, renameSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'

export interface Decision {
  id: string
  date: string
  title: string
  choice: string
  why: string
  alternativesRejected: string[]
  session: string
}

export class DecisionLog {
  private filePath: string
  private decisions: Decision[] = []

  constructor(projectDir: string) {
    const dir = join(projectDir, '.openclaude')
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
    this.filePath = join(dir, 'decisions.md')
    this.decisions = this.load()
  }

  addDecision(decision: Omit<Decision, 'id' | 'date'>): Decision {
    const full: Decision = {
      ...decision,
      id: `d${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
    }
    this.decisions.push(full)
    this.save()
    return full
  }

  removeDecision(id: string): boolean {
    const before = this.decisions.length
    this.decisions = this.decisions.filter(d => d.id !== id)
    if (this.decisions.length < before) { this.save(); return true }
    return false
  }

  getDecisions(): Decision[] {
    return [...this.decisions]
  }

  getDecisionById(id: string): Decision | undefined {
    return this.decisions.find(d => d.id === id)
  }

  searchDecisions(query: string): Decision[] {
    const lower = query.toLowerCase()
    return this.decisions.filter(d =>
      d.title.toLowerCase().includes(lower) ||
      d.choice.toLowerCase().includes(lower) ||
      d.why.toLowerCase().includes(lower)
    )
  }

  toMarkdown(): string {
    if (this.decisions.length === 0) return '# Project Decisions\n\nNo decisions recorded yet.\n'
    const lines = ['# Project Decisions\n']
    for (const d of this.decisions) {
      lines.push(`## ${d.date} — ${d.title}`)
      lines.push(`**Choice:** ${d.choice}`)
      lines.push(`**Why:** ${d.why}`)
      if (d.alternativesRejected.length > 0) {
        lines.push(`**Alternatives rejected:** ${d.alternativesRejected.join(', ')}`)
      }
      lines.push(`**Session:** ${d.session}`)
      lines.push(`**ID:** ${d.id}`)
      lines.push('')
    }
    return lines.join('\n')
  }

  toContextString(): string {
    if (this.decisions.length === 0) return ''
    const lines = ['Previously settled decisions for this project:']
    for (const d of this.decisions) {
      lines.push(`- ${d.title}: ${d.choice} (because: ${d.why})`)
    }
    return lines.join('\n')
  }

  private load(): Decision[] {
    if (!existsSync(this.filePath)) return []
    try {
      const content = readFileSync(this.filePath, 'utf-8')
      const decisions: Decision[] = []
      const sections = content.split('\n## ').slice(1)
      for (const section of sections) {
        const lines = section.split('\n')
        const titleLine = lines[0] ?? ''
        const dateMatch = titleLine.match(/^(\d{4}-\d{2}-\d{2})\s*—\s*(.+)/)
        if (!dateMatch) continue
        const date = dateMatch[1]!
        const title = dateMatch[2]!.trim()
        let choice = '', why = '', session = '', id = ''
        const alts: string[] = []
        for (const line of lines.slice(1)) {
          if (line.startsWith('**Choice:**')) choice = line.replace('**Choice:**', '').trim()
          else if (line.startsWith('**Why:**')) why = line.replace('**Why:**', '').trim()
          else if (line.startsWith('**Alternatives rejected:**')) alts.push(...line.replace('**Alternatives rejected:**', '').trim().split(', '))
          else if (line.startsWith('**Session:**')) session = line.replace('**Session:**', '').trim()
          else if (line.startsWith('**ID:**')) id = line.replace('**ID:**', '').trim()
        }
        if (id && title) decisions.push({ id, date, title, choice, why, alternativesRejected: alts, session })
      }
      return decisions
    } catch { return [] }
  }

  private save(): void {
    try {
      const tmp = this.filePath + '.tmp'
      writeFileSync(tmp, this.toMarkdown())
      renameSync(tmp, this.filePath)
    } catch {}
  }
}
