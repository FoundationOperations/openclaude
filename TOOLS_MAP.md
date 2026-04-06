# Foundation Operations — Tools Map
## 20 Spawn Tools from openclaude

> All tools are spawned from [FoundationOperations/openclaude](https://github.com/FoundationOperations/openclaude).  
> Each has its own branch with full architecture blueprint.

---

## Standalone Tools (15)

| # | Branch | Tool Name | Mission | Key Source Files |
|---|--------|-----------|---------|-----------------|
| 1 | `foundation/op-groundwork` | `openclaude-ollama-launcher` | Zero-config Ollama setup TUI — detect models, benchmark, write profile | `ollamaModels.ts`, `providerDiscovery.ts`, `headlessProfiler.ts` |
| 2 | `foundation/op-bunker` | `bash-inspector` | CLI to parse + threat-score any shell command with AST visualization | `bashParser.ts`, `ast.ts`, `bashSecurity.ts` |
| 3 | `foundation/op-ledger` | `llm-cost-calculator` | Calculate and compare API costs across all LLM providers | `modelCost.ts`, `cost-tracker.ts`, `tokenEstimation.ts` |
| 4 | `foundation/op-recon` | `mcp-inspector` | Postman for MCP — connect, enumerate, test, and record MCP servers | `mcp/client.ts`, `mcp/auth.ts`, `mcp/doctor.ts` |
| 5 | `foundation/op-archive` | `session-replay` | Load, scrub, search, and export openclaude session JSONL files | `sessionStorage.ts`, `asciicast.ts`, `ansiToSvg.ts` |
| 6 | `foundation/op-keymaster` | `provider-wizard` | Interactive setup wizard for all 8 supported LLM providers | `providerProfile.ts`, `geminiAuth.ts`, `aws.ts` |
| 7 | `foundation/op-compression` | `context-compactor` | Compact long conversation transcripts offline before re-injection | `compact/compact.ts`, `autoCompact.ts`, `microCompact.ts` |
| 8 | `foundation/op-clearance` | `permission-auditor` | Audit openclaude permission configs — explain, risk-score, suggest fixes | `permissions.ts`, `permissionExplainer.ts`, `bashClassifier.ts` |
| 9 | `foundation/op-dispatch` | `markdown-term-renderer` | Pipeable GFM Markdown renderer with syntax highlighting and SVG export | `markdown.ts`, `cliHighlight.ts`, `ansiToSvg.ts` |
| 10 | `foundation/op-reaper` | `git-context-harvester` | Extract full git context (diff, PR, commits, worktrees) as JSON | `git.ts`, `gitDiff.ts`, `ghPrStatus.ts` |
| 11 | `foundation/op-armory` | `plugin-marketplace-cli` | npm-style CLI for discovering, installing, and managing openclaude plugins | `marketplaceManager.ts`, `pluginLoader.ts` |
| 12 | `foundation/op-blueprint` | `ansi-to-image` | Convert ANSI terminal output to PNG, SVG, or HTML with themes | `ansiToSvg.ts`, `ansiToPng.ts`, `asciicast.ts` |
| 13 | `foundation/op-quota` | `token-budget-parser` | Parse natural-language token budget hints into structured values | `tokenBudget.ts`, `tokenEstimation.ts` |
| 14 | `foundation/op-benchpress` | `headless-llm-profiler` | Benchmark TTFT, tok/s, and cost across providers with prompt suites | `headlessProfiler.ts`, `queryProfiler.ts`, `fpsTracker.ts` |
| 15 | `foundation/op-striker` | `agent-task-runner` | Run named agents headlessly from CLI — no REPL required | `loadAgentsDir.ts`, `Task.ts`, `QueryEngine.ts` |

---

## Multi-Tool Apps (5)

| # | Branch | App Name | Components | Mission |
|---|--------|----------|-----------|---------|
| 16 | `foundation/op-command-center` | `openclaude-studio` | op-keymaster + op-ledger + op-archive | 3-tab TUI: manage providers, track costs, browse sessions |
| 17 | `foundation/op-fortress` | `secure-shell-gateway` | op-bunker + op-clearance + op-archive | Security wrapper that intercepts, scores, and audits all shell commands |
| 18 | `foundation/op-workshop` | `mcp-devkit` | op-recon + op-armory + op-keymaster | Complete MCP server developer workbench: inspect, plugin, test, auth |
| 19 | `foundation/op-watchtower` | `llm-ops-dashboard` | op-ledger + op-quota + op-compression + op-benchpress | Production ops dashboard: spend, context, budget, benchmarks |
| 20 | `foundation/op-pipeline` | `openclaude-ci` | op-striker + op-reaper + op-clearance + op-archive | CI/CD agent runner: harvest PR context, run agents, post results |

---

## Blueprint Files

Each branch contains a `BLUEPRINT.md` with:
- Mission statement
- Source file extraction targets from openclaude
- Full directory architecture
- Phased build plan (Phase 1–4)
- CLI interface specification
- Sample output

| Branch | Blueprint |
|--------|-----------|
| `foundation/op-groundwork` | [tools/op-groundwork/BLUEPRINT.md](tools/op-groundwork/BLUEPRINT.md) |
| `foundation/op-bunker` | [tools/op-bunker/BLUEPRINT.md](tools/op-bunker/BLUEPRINT.md) |
| `foundation/op-ledger` | [tools/op-ledger/BLUEPRINT.md](tools/op-ledger/BLUEPRINT.md) |
| `foundation/op-recon` | [tools/op-recon/BLUEPRINT.md](tools/op-recon/BLUEPRINT.md) |
| `foundation/op-archive` | [tools/op-archive/BLUEPRINT.md](tools/op-archive/BLUEPRINT.md) |
| `foundation/op-keymaster` | [tools/op-keymaster/BLUEPRINT.md](tools/op-keymaster/BLUEPRINT.md) |
| `foundation/op-compression` | [tools/op-compression/BLUEPRINT.md](tools/op-compression/BLUEPRINT.md) |
| `foundation/op-clearance` | [tools/op-clearance/BLUEPRINT.md](tools/op-clearance/BLUEPRINT.md) |
| `foundation/op-dispatch` | [tools/op-dispatch/BLUEPRINT.md](tools/op-dispatch/BLUEPRINT.md) |
| `foundation/op-reaper` | [tools/op-reaper/BLUEPRINT.md](tools/op-reaper/BLUEPRINT.md) |
| `foundation/op-armory` | [tools/op-armory/BLUEPRINT.md](tools/op-armory/BLUEPRINT.md) |
| `foundation/op-blueprint` | [tools/op-blueprint/BLUEPRINT.md](tools/op-blueprint/BLUEPRINT.md) |
| `foundation/op-quota` | [tools/op-quota/BLUEPRINT.md](tools/op-quota/BLUEPRINT.md) |
| `foundation/op-benchpress` | [tools/op-benchpress/BLUEPRINT.md](tools/op-benchpress/BLUEPRINT.md) |
| `foundation/op-striker` | [tools/op-striker/BLUEPRINT.md](tools/op-striker/BLUEPRINT.md) |
| `foundation/op-command-center` | [tools/op-command-center/BLUEPRINT.md](tools/op-command-center/BLUEPRINT.md) |
| `foundation/op-fortress` | [tools/op-fortress/BLUEPRINT.md](tools/op-fortress/BLUEPRINT.md) |
| `foundation/op-workshop` | [tools/op-workshop/BLUEPRINT.md](tools/op-workshop/BLUEPRINT.md) |
| `foundation/op-watchtower` | [tools/op-watchtower/BLUEPRINT.md](tools/op-watchtower/BLUEPRINT.md) |
| `foundation/op-pipeline` | [tools/op-pipeline/BLUEPRINT.md](tools/op-pipeline/BLUEPRINT.md) |

---

## Common Stack (all tools)

```
Language:   TypeScript
Build:      bun install && bun run build
Test:       bun test
Runtime:    Node.js >= 20
TUI:        Ink (React for terminals) — where applicable
Output:     dist/cli.mjs (global install via npm link or bun install -g)
```

---

## Dependency Graph

```
                        openclaude (parent)
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
    [Standalone]         [Standalone]       [Standalone]
    op-bunker            op-ledger          op-recon
    op-clearance         op-quota           op-archive
    op-reaper            op-benchpress      op-armory
          │                   │                   │
          └──────┬────────────┴──────────┬─────────┘
                 │                       │
           [Multi-Tool]           [Multi-Tool]
           op-fortress            op-watchtower
           (bunker+clearance+     (ledger+quota+
            archive)               compression+benchpress)
                 │
           op-command-center
           (keymaster+ledger+archive)
                 │
           op-workshop
           (recon+armory+keymaster)
                 │
           op-pipeline
           (striker+reaper+clearance+archive)
```

---

*Generated: 2026-04-05 | Foundation Operations*
