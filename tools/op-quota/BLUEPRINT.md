# BLUEPRINT: op-quota
## Tool: `token-budget-parser`

> Foundation Operations — Operation Quota  
> *"Set the budget. Enforce the quota. No overspend without authorization."*

---

## Mission

A small library and CLI that parses natural-language token budget hints from user text (`"+500k"`, `"use 2M tokens"`, `"spend up to 1B tokens"`, `"max budget"`) and returns structured, normalized token count values. Useful for any app that lets users specify LLM resource limits in plain language.

---

## Source Files from openclaude (extraction targets)

| File | Role |
|------|------|
| `src/utils/tokenBudget.ts` | Token budget hint parser (core logic) |
| `src/utils/tokenEstimation.ts` | Token counting and estimation utilities |

---

## Architecture

```
token-budget-parser/
├── src/
│   ├── cli.ts                  # Entry: parse text from arg or stdin
│   ├── parser/
│   │   ├── tokenBudget.ts      # Core parser from src/utils/tokenBudget.ts
│   │   ├── patterns.ts         # Regex patterns for budget expressions
│   │   ├── normalizer.ts       # Normalize k/M/B suffixes to raw numbers
│   │   └── validator.ts        # Range validation, sanity checks
│   ├── formatter.ts            # Output formatting (JSON, human, env var)
│   ├── lib/
│   │   └── index.ts            # Library API
│   └── types.ts
├── package.json
├── tsconfig.json
└── README.md
```

### Supported Input Patterns

| Input | Parsed Value |
|-------|-------------|
| `"+500k"` | 500,000 (additive hint) |
| `"use 2M tokens"` | 2,000,000 |
| `"spend up to 1B"` | 1,000,000,000 |
| `"max budget"` | MAX_SAFE_INTEGER (unbounded) |
| `"minimal"`, `"small"` | 8,192 (conservative preset) |
| `"64k context"` | 65,536 |
| `"think hard"` | 10,000 (thinking budget) |
| `"8000 tokens"` | 8,000 (explicit) |

---

## Build Plan

### Phase 1 — Core Parser
- [ ] Extract `tokenBudget.ts` parser as standalone module
- [ ] Add pattern table for all known natural language forms
- [ ] Handle k/K/M/m/B/b suffix normalization
- [ ] Handle relative hints: `"more"`, `"less"`, `"+500k"`, `"-1M"`

### Phase 2 — Validation & Presets
- [ ] Named presets: `minimal`, `standard`, `extended`, `max`
- [ ] Provider-specific max context validation (e.g., Claude 200k, GPT-4 128k)
- [ ] Warning for budgets that exceed model context window

### Phase 3 — CLI
- [ ] Parse from command line arg: `token-budget-parser "use 2M tokens"`
- [ ] Parse from stdin: `echo "think hard" | token-budget-parser`
- [ ] `--model` flag: validate against specific model's context limit
- [ ] `--json` structured output

### Phase 4 — Library
- [ ] Clean TypeScript API with full type definitions
- [ ] ESM + CJS dual output
- [ ] Zero runtime dependencies

---

## CLI Interface

```bash
# Parse a budget string
token-budget-parser "use 2M tokens"
# Output: 2000000

# With JSON output
token-budget-parser --json "spend up to 500k"
# { "value": 500000, "hint": "additive", "suffix": "k", "original": "spend up to 500k" }

# Validate against a model
token-budget-parser --model claude-3-5-sonnet "use 2M tokens"
# Warning: 2,000,000 exceeds claude-3-5-sonnet max context (200,000)

# Named presets
token-budget-parser minimal    # → 8192
token-budget-parser standard   # → 32768
token-budget-parser max        # → model's max context

# Pipe mode
echo "think harder than usual" | token-budget-parser
```

---

## Library API

```typescript
import { parseTokenBudget, TokenBudget } from 'token-budget-parser';

const budget: TokenBudget = parseTokenBudget('use 2M tokens');
// { value: 2_000_000, hint: 'absolute', original: 'use 2M tokens' }

const budget2 = parseTokenBudget('+500k', { baseValue: 32768 });
// { value: 532768, hint: 'additive', delta: 500_000 }

const budget3 = parseTokenBudget('think hard');
// { value: 10000, hint: 'preset', preset: 'thinking' }
```

---

*Branch: `foundation/op-quota` | Parent repo: FoundationOperations/openclaude*
