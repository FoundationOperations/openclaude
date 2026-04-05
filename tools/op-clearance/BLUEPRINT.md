# BLUEPRINT: op-clearance
## Tool: `permission-auditor`

> Foundation Operations — Operation Clearance  
> *"No agent moves without proper clearance. Audit before you authorize."*

---

## Mission

A CLI tool that reads an openclaude or Claude Code config file, lists all shell and file permission rules, explains each rule in plain English, identifies overly broad or dangerous grants, and suggests tighter alternatives. Enables teams to review and harden their AI agent permission configurations before deployment.

---

## Source Files from openclaude (extraction targets)

| File | Role |
|------|------|
| `src/utils/permissions/permissionExplainer.ts` | Human-readable rule descriptions |
| `src/utils/permissions/shellRuleMatching.ts` | Pattern matching for shell rules |
| `src/utils/permissions/bashClassifier.ts` | Classify bash commands by risk tier |
| `src/utils/permissions/permissions.ts` | Permission rule schema, validation |
| `src/utils/permissions/` | Full permissions subsystem (14 files) |
| `src/utils/autoModeDenials.ts` | Auto-mode denial patterns |

---

## Architecture

```
permission-auditor/
├── src/
│   ├── cli.ts                  # Entry: load config, run audit, output report
│   ├── loader.ts               # Read openclaude/Claude Code config formats
│   ├── auditor/
│   │   ├── shellAuditor.ts     # Analyze bash allow/deny rules
│   │   ├── fileAuditor.ts      # Analyze file read/write/edit rules
│   │   ├── mcpAuditor.ts       # Analyze MCP tool permission rules
│   │   └── networkAuditor.ts   # Analyze network/URL permission rules
│   ├── explainer.ts            # Explain each rule in plain English
│   ├── scorer.ts               # Risk-score each rule (LOW/MED/HIGH/CRITICAL)
│   ├── suggester.ts            # Suggest tighter alternatives
│   ├── formatter.ts            # Table/JSON/Markdown output
│   └── types.ts
├── package.json
├── tsconfig.json
└── README.md
```

### Risk Classification

| Level | Examples |
|-------|---------|
| CRITICAL | `bash:*`, `file:/**`, `allow_all: true` |
| HIGH | `bash:sudo *`, `file:/etc/*`, wildcard network |
| MEDIUM | `bash:npm *`, `file:~/projects/**` |
| LOW | `bash:git status`, `file:./src/*.ts` (read-only) |

---

## Build Plan

### Phase 1 — Config Loading
- [ ] Parse `.claude/settings.json` and `settings.local.json`
- [ ] Parse `~/.claude/settings.json` (global config)
- [ ] Support `--config <path>` for any JSON config file

### Phase 2 — Rule Analysis
- [ ] Extract all `allow` / `deny` rules by category
- [ ] Apply `shellRuleMatching.ts` pattern logic for accuracy
- [ ] Classify each rule with `bashClassifier.ts` risk tier

### Phase 3 — Explanation Engine
- [ ] Port `permissionExplainer.ts` as standalone module
- [ ] Generate plain-English description for every rule
- [ ] Flag rules that are broader than needed

### Phase 4 — Suggestions & Report
- [ ] For each HIGH/CRITICAL rule, suggest a tighter equivalent
- [ ] Interactive mode: accept/reject suggestions, write updated config
- [ ] `--fix` flag: auto-apply all safe tightening suggestions
- [ ] `--json` output for CI gate integration

---

## CLI Interface

```bash
# Audit current project config
permission-auditor

# Audit a specific config file
permission-auditor --config .claude/settings.json

# Show only HIGH and CRITICAL findings
permission-auditor --severity high

# Apply suggested tightenings
permission-auditor --fix

# JSON output for CI gate
permission-auditor --json | jq '.findings[] | select(.severity == "CRITICAL")'

# Compare two configs (before/after)
permission-auditor --diff old-settings.json new-settings.json
```

---

## Sample Output

```
Permission Audit Report
───────────────────────────────────────────────────────────
Config: .claude/settings.json

CRITICAL  bash:*
  Allows ALL bash commands with no restrictions.
  → Suggest: Replace with an explicit allowlist of needed commands.

HIGH      file:/**
  Grants read/write access to the entire filesystem.
  → Suggest: Scope to project directory: file:./src/**

MEDIUM    bash:npm *
  Allows all npm subcommands including 'npm publish'.
  → Suggest: bash:npm run *, bash:npm install

LOW       bash:git status
  Read-only git status check. Safe.

Summary: 1 CRITICAL, 1 HIGH, 1 MEDIUM, 1 LOW
Run with --fix to auto-apply suggestions.
```

---

*Branch: `foundation/op-clearance` | Parent repo: FoundationOperations/openclaude*
