# BLUEPRINT: op-archive
## Tool: `session-replay`

> Foundation Operations — Operation Archive  
> *"Every operation leaves a record. Preserve it. Replay it. Learn from it."*

---

## Mission

A terminal app that loads and replays saved openclaude/Claude Code JSONL session files. Renders conversations with syntax highlighting and tool-call formatting, lets users scrub forward/backward through turns, filter by message type (assistant/tool/user), and export to HTML or Markdown.

---

## Source Files from openclaude (extraction targets)

| File | Role |
|------|------|
| `src/utils/sessionStorage.ts` | Session file I/O, JSONL format |
| `src/utils/asciicast.ts` | Asciicast v2 format export |
| `src/utils/markdown.ts` | Markdown rendering to ANSI |
| `src/utils/cliHighlight.ts` | Syntax highlighting for code blocks |
| `src/utils/ansiToSvg.ts` | ANSI → SVG for HTML export |
| `src/utils/ansiToPng.ts` | ANSI → PNG for image export |
| `src/components/` | Ink rendering components for messages |
| `src/utils/sessionStorage.ts` | Session schema types |

---

## Architecture

```
session-replay/
├── src/
│   ├── cli.ts                  # Entry: load session file, launch viewer
│   ├── loader.ts               # Parse JSONL, validate schema, build turn list
│   ├── renderer/
│   │   ├── AssistantMessage.tsx # Render assistant turns with markdown
│   │   ├── ToolCall.tsx         # Render tool_use blocks (colored by tool type)
│   │   ├── ToolResult.tsx       # Render tool_result blocks
│   │   ├── UserMessage.tsx      # Render user turns
│   │   └── Metadata.tsx         # Cost, token counts, timestamps
│   ├── viewer/
│   │   ├── Player.tsx           # TUI player with scrubber
│   │   ├── Scrubber.tsx         # Turn-by-turn navigation (←/→, j/k)
│   │   ├── FilterBar.tsx        # Filter by role/tool type
│   │   └── SearchBar.tsx        # Full-text search within session
│   ├── exporter/
│   │   ├── htmlExporter.ts      # Export full session as self-contained HTML
│   │   ├── markdownExporter.ts  # Export as Markdown transcript
│   │   └── asciicastExporter.ts # Export as .cast file for asciinema
│   └── types.ts
├── package.json
├── tsconfig.json
└── README.md
```

### Session JSONL Schema

Each line in an openclaude session file:
```json
{
  "type": "say" | "tool_use" | "tool_result" | "thinking",
  "role": "assistant" | "user",
  "content": "...",
  "timestamp": "ISO8601",
  "cost": { "inputTokens": 100, "outputTokens": 50, "totalCost": 0.001 }
}
```

---

## Build Plan

### Phase 1 — Loader & Parser
- [ ] JSONL line-by-line parser with schema validation
- [ ] Turn reconstruction (group consecutive lines into conversation turns)
- [ ] Handle malformed sessions gracefully (partial replay)

### Phase 2 — TUI Viewer
- [ ] Ink-based player with turn-by-turn scrubber (←/→ keys)
- [ ] Syntax-highlighted code blocks in assistant messages
- [ ] Collapsible tool call/result pairs
- [ ] Status bar: turn N/M, cost so far, elapsed time

### Phase 3 — Search & Filter
- [ ] `/ ` to enter search, highlight matching turns
- [ ] Filter panel: show only assistant / tool_use / user turns
- [ ] `g` / `G` jump to first/last turn

### Phase 4 — Export
- [ ] `--html` export: self-contained HTML file with embedded CSS
- [ ] `--markdown` export: Markdown transcript
- [ ] `--asciicast` export: `.cast` file for asciinema.org sharing

---

## CLI Interface

```bash
# Interactive replay
session-replay ~/.openclaude/sessions/20260405-192345.jsonl

# List available sessions
session-replay --list

# Export to HTML
session-replay session.jsonl --html > session.html

# Export to Markdown
session-replay session.jsonl --markdown

# Filter and show only tool calls
session-replay session.jsonl --filter tool_use

# Play back at speed (auto-advance every N seconds)
session-replay session.jsonl --play --speed 1.5
```

---

*Branch: `foundation/op-archive` | Parent repo: FoundationOperations/openclaude*
