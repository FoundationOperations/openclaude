# BLUEPRINT: op-compression
## Tool: `context-compactor`

> Foundation Operations — Operation Compression  
> *"Shrink the signal. Keep the intel. Drop the noise."*

---

## Mission

A standalone CLI that reads a conversation transcript (JSONL, JSON array, or plain text) and intelligently compacts it when the context window is approaching its limit. Uses the same summarization logic as openclaude's auto-compact feature, but as a standalone offline tool — useful for preprocessing long conversations before re-injecting them into a new session or a different model.

---

## Source Files from openclaude (extraction targets)

| File | Role |
|------|------|
| `src/services/compact/compact.ts` | Core compaction orchestrator |
| `src/services/compact/autoCompact.ts` | Threshold-based auto-trigger logic |
| `src/services/compact/microCompact.ts` | Lightweight summarization for small windows |
| `src/services/compact/` | Full compact service (12 files) |
| `src/utils/tokenEstimation.ts` | Token counting for compaction decisions |
| `src/utils/api.ts` | LLM call wrapper for summarization |

---

## Architecture

```
context-compactor/
├── src/
│   ├── cli.ts                  # Entry: read input, run compaction, output
│   ├── ingestion/
│   │   ├── jsonlReader.ts      # Read openclaude JSONL sessions
│   │   ├── jsonReader.ts       # Read JSON array of messages
│   │   └── textReader.ts       # Chunk plain text into message format
│   ├── compactor/
│   │   ├── tokenCounter.ts     # Estimate tokens (from tokenEstimation.ts)
│   │   ├── thresholdChecker.ts # Should we compact? (from autoCompact.ts)
│   │   ├── summarizer.ts       # LLM-based or heuristic summary generation
│   │   ├── microSummarizer.ts  # No-LLM heuristic for offline mode
│   │   └── merger.ts           # Merge summary + recent turns
│   ├── output/
│   │   ├── jsonlWriter.ts      # Write compacted JSONL
│   │   ├── jsonWriter.ts       # Write compacted JSON array
│   │   └── statsWriter.ts      # Reduction stats
│   └── types.ts
├── package.json
├── tsconfig.json
└── README.md
```

### Compaction Strategies

| Strategy | Description | LLM Required |
|----------|-------------|-------------|
| `aggressive` | Summarize everything except last 5 turns | Yes |
| `balanced` | Summarize turns older than threshold | Yes |
| `tail-only` | Keep last N turns, drop everything older | No |
| `heuristic` | Remove tool results, keep reasoning | No |
| `micro` | Shortest-path compaction for tiny windows | No |

---

## Build Plan

### Phase 1 — Input Parsing
- [ ] JSONL session reader with schema validation
- [ ] JSON array reader (OpenAI message format)
- [ ] Token counting for the full conversation

### Phase 2 — Compaction Engine
- [ ] Port `autoCompact.ts` threshold logic
- [ ] Port `microCompact.ts` for no-LLM offline mode
- [ ] LLM-based summarizer (uses configured provider from env)
- [ ] `--strategy` flag for compaction mode selection

### Phase 3 — Output
- [ ] Write compacted JSONL
- [ ] Stats output: original tokens, compacted tokens, reduction %
- [ ] `--dry-run` flag: just report what would be compacted
- [ ] `--json` stats-only output for CI use

### Phase 4 — Streaming Mode
- [ ] Pipe mode: `cat session.jsonl | context-compactor | openclaude --session -`
- [ ] Watch mode: monitor a growing session file and auto-compact in place

---

## CLI Interface

```bash
# Compact a session file (uses configured LLM)
context-compactor session.jsonl

# Offline heuristic compaction (no LLM needed)
context-compactor session.jsonl --strategy heuristic

# Keep only last 20 turns
context-compactor session.jsonl --strategy tail-only --tail 20

# Dry run: see what would be compacted
context-compactor session.jsonl --dry-run

# Pipe mode
cat long-session.jsonl | context-compactor --strategy micro | openclaude --stdin

# Set target token budget
context-compactor session.jsonl --target-tokens 50000
```

---

## Sample Output

```
Context Compaction Report
─────────────────────────
Strategy:     balanced
Input turns:  147
Output turns: 23

Tokens:
  Before:  98,432
  After:   24,106
  Saved:   74,326  (75.5% reduction)

Compacted session written to: session.compacted.jsonl
```

---

*Branch: `foundation/op-compression` | Parent repo: FoundationOperations/openclaude*
