# BLUEPRINT: op-watchtower
## Tool: `llm-ops-dashboard`

> Foundation Operations — Operation Watchtower  
> *"Observe everything. Budget everything. Compress before it overflows."*

---

## Mission

An operations dashboard for teams running LLM agents at scale. Surfaces token spend by model and session, detects approaching context limits and triggers compaction automatically, parses natural-language budget constraints from user requests, and benchmarks provider performance on demand. The single pane of glass for production AI operations.

---

## Component Tools Integrated

| Module | Source Tool | Role |
|--------|------------|------|
| Cost Tracking | `op-ledger` (llm-cost-calculator) | Token spend by model/session |
| Budget Parsing | `op-quota` (token-budget-parser) | NL budget constraint parsing |
| Auto-Compaction | `op-compression` (context-compactor) | Detect + compress long contexts |
| Performance | `op-benchpress` (headless-llm-profiler) | On-demand provider benchmarking |

---

## Source Files from openclaude (extraction targets)

| File | Role |
|------|------|
| `src/cost-tracker.ts` | Session cost accumulation |
| `src/costHook.ts` | Cost state React hook |
| `src/utils/modelCost.ts` | Pricing tables |
| `src/utils/tokenBudget.ts` | Budget hint parser |
| `src/utils/tokenEstimation.ts` | Token counting |
| `src/services/compact/autoCompact.ts` | Context threshold monitoring |
| `src/services/compact/compact.ts` | Compaction orchestrator |
| `src/utils/headlessProfiler.ts` | Benchmark runner |
| `src/utils/sessionStorage.ts` | Session data access |

---

## Architecture

```
llm-ops-dashboard/
├── src/
│   ├── cli.ts                  # Entry: TUI dashboard or CLI subcommands
│   ├── monitors/
│   │   ├── costMonitor.ts      # Track spend per session/model/day
│   │   ├── contextMonitor.ts   # Watch for context limit approach
│   │   ├── budgetMonitor.ts    # Check against set budgets/quotas
│   │   └── providerMonitor.ts  # Provider availability and latency
│   ├── actions/
│   │   ├── compactionTrigger.ts # Auto-compact when threshold hit
│   │   ├── budgetAlert.ts      # Emit alerts when budget thresholds crossed
│   │   └── providerFallback.ts # Switch provider on failure
│   ├── budget/
│   │   ├── parser.ts           # From tokenBudget.ts
│   │   ├── enforcer.ts         # Block or warn when budget exceeded
│   │   └── projectBudgets.ts   # Per-project budget config
│   ├── benchmarker/
│   │   └── onDemandBench.ts    # Trigger benchmark from dashboard
│   ├── ui/
│   │   ├── App.tsx             # Root TUI: 4-section layout
│   │   ├── CostTicker.tsx      # Live cost counter top-right
│   │   ├── SpendHeatmap.tsx    # Cost by hour/day heatmap
│   │   ├── ContextGauge.tsx    # Context window fill level
│   │   ├── BudgetBar.tsx       # Budget consumed vs limit
│   │   ├── AlertPanel.tsx      # Active alerts and warnings
│   │   ├── ProviderStatus.tsx  # Provider health indicators
│   │   └── BenchmarkTrigger.tsx# Launch quick benchmark
│   ├── storage/
│   │   ├── metricsStore.ts     # Persist metrics to local SQLite
│   │   └── alertStore.ts       # Alert history
│   └── types.ts
├── package.json
├── tsconfig.json
└── README.md
```

### Dashboard Layout

```
┌──────────────────────────────────────────────────────────────┐
│ LLM Ops Dashboard                    Total today: $0.42  ●   │
├────────────────────┬─────────────────┬────────────────────────┤
│ SPEND              │ CONTEXT         │ ALERTS                 │
│ Today:   $0.42     │ qwen2.5:7b      │ ⚠ Session #3: 87%      │
│ Week:    $3.18     │ ████████░░ 87%  │   context used         │
│ Month:   $11.04    │                 │                        │
│                    │ Budget          │ ℹ Provider fallback     │
│ Top model:         │ ███░░░░░ 42%    │   triggered 2x today   │
│ qwen2.5:7b $0.000  │ $0.42 / $1.00  │                        │
│ claude-haiku $0.31 │                 │                        │
├────────────────────┴─────────────────┴────────────────────────┤
│ PROVIDERS          │ Status  │ TTFT   │ Tok/s  │ Cost/1k      │
│ ● Ollama           │ ✓ up    │  42ms  │  41.2  │ $0.000       │
│ ○ Anthropic        │ ✓ up    │ 287ms  │  87.6  │ $0.0008      │
│ ○ OpenAI           │ ✗ down  │  ---   │  ---   │ $0.0020      │
└───────────────────────────────────────────────────────────────┘
```

---

## Build Plan

### Phase 1 — Core Monitors
- [ ] Cost monitor: watch session JSONL files, aggregate spend
- [ ] Context monitor: watch active session token counts
- [ ] Budget monitor: compare actual vs configured budgets

### Phase 2 — Auto-Compaction Integration
- [ ] Integrate `autoCompact.ts` threshold detection
- [ ] Trigger `compact.ts` when context gauge hits threshold
- [ ] Notify via alert panel with before/after stats

### Phase 3 — Budget Parsing Integration
- [ ] Parse budget constraints from openclaude config/env
- [ ] `OPENCLAUDE_BUDGET=2M` env var support
- [ ] Budget alert at 80% / 95% / 100% thresholds

### Phase 4 — Benchmark Integration
- [ ] One-click benchmark from dashboard (op-benchpress)
- [ ] Auto-benchmark on provider addition
- [ ] Provider ranking visible in PROVIDERS section

---

## CLI Interface

```bash
# Launch TUI dashboard
llm-ops-dashboard

# Monitor specific session directory
llm-ops-dashboard --sessions ~/.openclaude/sessions/

# Set budget and monitor
llm-ops-dashboard --budget $1.00

# CLI metrics query
llm-ops-dashboard cost --today
llm-ops-dashboard cost --model qwen2.5:7b --week
llm-ops-dashboard context --session <id>

# Run benchmark from CLI
llm-ops-dashboard benchmark --provider ollama

# Set alert thresholds
llm-ops-dashboard config --budget-warn 80 --budget-block 100
```

---

*Branch: `foundation/op-watchtower` | Parent repo: FoundationOperations/openclaude*
