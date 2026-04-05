# BLUEPRINT: op-benchpress
## Tool: `headless-llm-profiler`

> Foundation Operations — Operation Benchpress  
> *"Stress-test every provider. The strongest model earns the mission."*

---

## Mission

A benchmarking CLI that runs a configurable test suite of prompts against any configured LLM provider, measures Time-to-First-Token (TTFT), sustained tokens/second, total latency, and estimated cost, then outputs a comparison report. Helps teams make data-driven decisions about which model and provider to deploy.

---

## Source Files from openclaude (extraction targets)

| File | Role |
|------|------|
| `src/utils/headlessProfiler.ts` | Headless benchmark runner |
| `src/utils/startupProfiler.ts` | Cold-start timing and warmup |
| `src/utils/queryProfiler.ts` | Per-query metrics collection |
| `src/utils/fpsTracker.ts` | Token streaming rate measurement |
| `src/utils/modelCost.ts` | Cost per token for all providers |
| `src/utils/api.ts` | Provider API client wrapper |
| `src/utils/providerProfile.ts` | Provider config loading |

---

## Architecture

```
headless-llm-profiler/
├── src/
│   ├── cli.ts                  # Entry: load config, run benchmarks, output
│   ├── config/
│   │   ├── defaultPrompts.ts   # Built-in prompt library (code/chat/reasoning)
│   │   ├── promptLoader.ts     # Load custom prompts from JSON/YAML file
│   │   └── providerLoader.ts   # Load provider config from env/profile
│   ├── runner/
│   │   ├── benchmarkRunner.ts  # Orchestrates warmup + timed runs
│   │   ├── streamMonitor.ts    # Real-time TTFT + tok/s from SSE stream
│   │   ├── costEstimator.ts    # Per-run cost from token usage
│   │   └── retryHandler.ts     # Handle rate limits, retries with backoff
│   ├── metrics/
│   │   ├── collector.ts        # Aggregate raw measurements
│   │   ├── statistics.ts       # p50/p95/p99, mean, stddev
│   │   └── scorer.ts           # Composite score (speed × quality × cost)
│   ├── report/
│   │   ├── tableFormatter.ts   # ASCII comparison table
│   │   ├── jsonFormatter.ts    # Machine-readable output
│   │   ├── csvFormatter.ts     # Spreadsheet export
│   │   └── htmlFormatter.ts    # HTML report with charts
│   └── types.ts
├── package.json
├── tsconfig.json
└── README.md
```

### Benchmark Suite (Built-in Prompts)

| Category | Prompts | What It Tests |
|----------|---------|--------------|
| Code | FizzBuzz, sort algo, regex | Code generation speed |
| Reasoning | Math word problems, logic | Multi-step reasoning |
| Chat | Greeting, summarize | Baseline throughput |
| Long context | 10k-token document Q&A | Context handling |
| Streaming | Progressive generation task | Stream stability |

---

## Build Plan

### Phase 1 — Benchmark Runner
- [ ] Extract `headlessProfiler.ts` + `queryProfiler.ts` as core module
- [ ] Warmup runs (configurable, default: 2 discarded)
- [ ] Timed runs (configurable, default: 5 per prompt)

### Phase 2 — Metrics Collection
- [ ] TTFT: time from request send to first streaming chunk
- [ ] Tokens/second: chunk timestamps across full stream
- [ ] Total latency: request start to stream end
- [ ] Token counts from API `usage` field
- [ ] Cost calculation from `modelCost.ts`

### Phase 3 — Multi-Provider Comparison
- [ ] Run same prompt set against multiple providers in sequence
- [ ] Aggregate stats per provider/model
- [ ] Composite score (weighted speed × cost efficiency × success rate)

### Phase 4 — Report Generation
- [ ] ASCII comparison table (default)
- [ ] `--json` for CI/scripting
- [ ] `--csv` for spreadsheet analysis
- [ ] `--html` with charts (Chart.js embedded)

---

## CLI Interface

```bash
# Benchmark default provider
headless-llm-profiler

# Benchmark specific provider
headless-llm-profiler --provider ollama --model qwen2.5:7b

# Compare multiple providers
headless-llm-profiler --compare anthropic openai ollama

# Custom prompt suite
headless-llm-profiler --prompts my-prompts.json

# Output formats
headless-llm-profiler --json > results.json
headless-llm-profiler --csv > results.csv
headless-llm-profiler --html > results.html

# Quick single test
headless-llm-profiler --prompt "Write a haiku about TypeScript" --runs 3
```

---

## Sample Output

```
LLM Benchmark Report
────────────────────────────────────────────────────────────────────
Provider    Model             TTFT p50   Tok/s    Cost/1k    Score
────────────────────────────────────────────────────────────────────
Ollama      qwen2.5:7b         124ms      41.2    $0.000     82.4
Anthropic   claude-3-haiku     287ms      87.6    $0.0008    91.2
OpenAI      gpt-3.5-turbo      198ms      62.4    $0.0020    78.9
Anthropic   claude-3-5-sonnet  421ms      48.3    $0.0090    74.1

Runs: 5 per prompt | Prompts: 8 | Warmup: 2 discarded
```

---

*Branch: `foundation/op-benchpress` | Parent repo: FoundationOperations/openclaude*
