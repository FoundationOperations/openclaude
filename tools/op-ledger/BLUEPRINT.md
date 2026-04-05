# BLUEPRINT: op-ledger
## Tool: `llm-cost-calculator`

> Foundation Operations — Operation Ledger  
> *"Every token has a price. Know it before you spend it."*

---

## Mission

A CLI and optional web UI for calculating LLM API costs across all supported providers. Takes a conversation log (JSONL), raw text, or token counts, and outputs a detailed cost breakdown per model with comparison tables. Helps teams budget AI spend and pick the most cost-effective provider for a task.

---

## Source Files from openclaude (extraction targets)

| File | Role |
|------|------|
| `src/utils/modelCost.ts` | Per-model pricing constants (input/output $/1k tokens) |
| `src/cost-tracker.ts` | Session-level cost accumulation, breakdown |
| `src/costHook.ts` | React hook for live cost state |
| `src/utils/tokenEstimation.ts` | Token count estimation without API call |
| `src/utils/api.ts` | Usage metadata extraction from API responses |

---

## Architecture

```
llm-cost-calculator/
├── src/
│   ├── cli.ts                  # Entry point
│   ├── ingestion/
│   │   ├── jsonlParser.ts      # Parse JSONL conversation logs
│   │   ├── textSplitter.ts     # Estimate tokens from raw text
│   │   └── manualInput.ts      # Accept manual token counts via flags
│   ├── calculator.ts           # Core: apply pricing tables, compute totals
│   ├── pricingTables.ts        # Extracted from modelCost.ts — all providers
│   ├── comparison.ts           # Side-by-side model comparison engine
│   ├── formatter.ts            # Table/JSON/CSV output
│   └── types.ts
├── package.json
├── tsconfig.json
└── README.md
```

### Supported Providers

| Provider | Models |
|----------|--------|
| Anthropic | Claude 3.5 Sonnet, Claude 3 Opus, Haiku |
| OpenAI | GPT-4o, GPT-4 Turbo, GPT-3.5 Turbo |
| Google | Gemini 1.5 Pro, Gemini Flash |
| Ollama | $0 (local, but estimates compute cost) |
| AWS Bedrock | Claude via Bedrock pricing |
| GitHub Models | GPT-4o via GitHub free tier |

---

## Build Plan

### Phase 1 — Pricing Engine
- [ ] Extract `modelCost.ts` pricing constants into standalone `pricingTables.ts`
- [ ] Add missing providers (Gemini, Bedrock, Vertex pricing)
- [ ] Token estimation heuristics for when exact counts are unavailable

### Phase 2 — Input Modes
- [ ] `--tokens-in N --tokens-out M` manual entry
- [ ] `--file conversation.jsonl` parse openclaude session logs
- [ ] `--text "..."` estimate tokens from raw text
- [ ] Pipe support: `cat session.jsonl | llm-cost`

### Phase 3 — Output Modes
- [ ] Default: cost table for all models ranked by price
- [ ] `--model claude-3-5-sonnet` single model breakdown
- [ ] `--compare` side-by-side comparison table
- [ ] `--json` machine-readable output
- [ ] `--csv` for spreadsheet import

### Phase 4 — Budget Alerts
- [ ] `--budget $5.00` flag: warn when estimated session cost exceeds budget
- [ ] `--monthly $100` amortization calculator

---

## CLI Interface

```bash
# Estimate cost for a raw text prompt
llm-cost-calculator --text "Write me a novel..."

# Calculate from a saved session
llm-cost-calculator --file session.jsonl

# Manual token count
llm-cost-calculator --tokens-in 10000 --tokens-out 2000

# Compare all models for the same prompt
llm-cost-calculator --text "Hello world" --compare

# Single model, JSON output
llm-cost-calculator --model gpt-4o --tokens-in 5000 --tokens-out 1000 --json
```

---

## Sample Output

```
Provider       Model                 Input      Output     Total
──────────────────────────────────────────────────────────────────
Anthropic      claude-3-haiku        $0.0008    $0.0010    $0.0018
OpenAI         gpt-3.5-turbo         $0.0015    $0.0020    $0.0035
Anthropic      claude-3-5-sonnet     $0.0150    $0.0750    $0.0900
OpenAI         gpt-4o                $0.0250    $0.1000    $0.1250
Anthropic      claude-3-opus         $0.0750    $0.3750    $0.4500

Tokens: 10,000 input / 2,000 output
```

---

*Branch: `foundation/op-ledger` | Parent repo: FoundationOperations/openclaude*
