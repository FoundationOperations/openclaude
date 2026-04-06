# BLUEPRINT: op-command-center
## Tool: `openclaude-studio`

> Foundation Operations — Operation Command Center  
> *"All systems visible. All providers manageable. All sessions under command."*

---

## Mission

A unified desktop/TUI control panel for managing your entire openclaude deployment. Three-tab interface: provider configuration and testing, real-time cost dashboard across active sessions, and session browser with replay. The nerve center for teams running openclaude at scale.

---

## Component Tools Integrated

| Module | Source Tool | Role |
|--------|------------|------|
| Provider Panel | `op-keymaster` (provider-wizard) | Configure, test, and switch LLM providers |
| Cost Dashboard | `op-ledger` (llm-cost-calculator) | Real-time and historical cost tracking |
| Session Browser | `op-archive` (session-replay) | Browse, search, and replay saved sessions |

---

## Source Files from openclaude (extraction targets)

| File | Role |
|------|------|
| `src/utils/providerProfile.ts` | Provider config management |
| `src/utils/providerDiscovery.ts` | Auto-detect local providers |
| `src/cost-tracker.ts` | Session cost accumulation |
| `src/costHook.ts` | Cost state React hook |
| `src/utils/modelCost.ts` | Pricing tables |
| `src/utils/sessionStorage.ts` | Session I/O |
| `src/utils/api.ts` | Provider API clients |
| `src/components/` | Ink rendering components |

---

## Architecture

```
openclaude-studio/
├── src/
│   ├── cli.ts                  # Entry: launch TUI
│   ├── app/
│   │   ├── App.tsx             # Root Ink app with tab navigation
│   │   ├── TabBar.tsx          # Tab switcher (←/→ or 1/2/3)
│   │   └── StatusBar.tsx       # Global status: active provider, total cost
│   ├── panels/
│   │   ├── providers/
│   │   │   ├── ProviderPanel.tsx     # Tab 1: provider management
│   │   │   ├── ProviderList.tsx      # List of configured providers
│   │   │   ├── ProviderForm.tsx      # Add/edit provider config
│   │   │   ├── ConnectionTester.tsx  # Real-time connection test
│   │   │   └── ModelSelector.tsx     # Model selection per provider
│   │   ├── costs/
│   │   │   ├── CostPanel.tsx         # Tab 2: cost dashboard
│   │   │   ├── LiveCostMeter.tsx     # Real-time cost of active session
│   │   │   ├── SessionCostList.tsx   # Historical cost by session
│   │   │   ├── ModelCostComparison.tsx # Side-by-side model pricing
│   │   │   └── BudgetAlert.tsx       # Budget threshold alerts
│   │   └── sessions/
│   │       ├── SessionPanel.tsx      # Tab 3: session browser + replay
│   │       ├── SessionList.tsx       # Searchable session list
│   │       ├── SessionViewer.tsx     # Single session replay (from op-archive)
│   │       └── SessionExporter.tsx   # Export to HTML/Markdown
│   ├── store/
│   │   ├── providerStore.ts    # Provider config state
│   │   ├── costStore.ts        # Cost accumulation state
│   │   └── sessionStore.ts     # Session list state
│   └── types.ts
├── package.json
├── tsconfig.json
└── README.md
```

### Tab Layout

```
┌─────────────────────────────────────────────────────────────┐
│ openclaude-studio    [1] Providers  [2] Costs  [3] Sessions  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [TAB 1 - PROVIDERS]                                        │
│  ● Ollama (qwen2.5:7b)   ✓ Connected   42ms TTFT           │
│  ○ Anthropic              ✗ No API key                      │
│  ○ OpenAI                 ✗ No API key                      │
│                                                             │
│  [Add Provider]  [Test All]  [Set Default]                  │
├─────────────────────────────────────────────────────────────┤
│ Active: Ollama qwen2.5:7b  │  Session cost: $0.000          │
└─────────────────────────────────────────────────────────────┘
```

---

## Build Plan

### Phase 1 — Shell & Navigation
- [ ] Root Ink App with 3-tab navigation
- [ ] Persistent global status bar
- [ ] Keyboard shortcuts: `1/2/3` for tabs, `q` to quit

### Phase 2 — Provider Panel (from op-keymaster)
- [ ] List configured providers with connection status
- [ ] Add/edit provider form
- [ ] Connection test with latency display
- [ ] Model selector with pricing info

### Phase 3 — Cost Dashboard (from op-ledger)
- [ ] Real-time cost meter for active openclaude session
- [ ] Historical cost list from session files
- [ ] Model comparison pricing table
- [ ] Budget threshold alerts

### Phase 4 — Session Browser (from op-archive)
- [ ] File-browsable session list (sorted by date, searchable)
- [ ] In-panel session replay viewer
- [ ] Export actions (HTML, Markdown)
- [ ] Session stats (turns, cost, duration)

---

## CLI Interface

```bash
# Launch TUI
openclaude-studio

# Start on specific tab
openclaude-studio --tab providers
openclaude-studio --tab costs
openclaude-studio --tab sessions

# Non-interactive status
openclaude-studio status --json
```

---

*Branch: `foundation/op-command-center` | Parent repo: FoundationOperations/openclaude*
