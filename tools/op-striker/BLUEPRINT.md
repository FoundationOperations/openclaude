# BLUEPRINT: op-striker
## Tool: `agent-task-runner`

> Foundation Operations — Operation Striker  
> *"Deploy the agent. Execute the mission. No REPL required."*

---

## Mission

A minimal CLI for running named agent definitions from `agents/` directories without launching the full openclaude REPL. Reads agent specs, injects context, runs the task headlessly, and outputs results. Enables CI/CD pipelines, cron jobs, and scripts to invoke AI agents programmatically with structured inputs and outputs.

---

## Source Files from openclaude (extraction targets)

| File | Role |
|------|------|
| `src/tools/AgentTool/loadAgentsDir.ts` | Discover and load agent definitions |
| `src/Task.ts` | Core task execution engine |
| `src/QueryEngine.ts` | Query orchestration, tool dispatch |
| `src/Tool.ts` | Tool base class and interface |
| `src/tasks.ts` | Task state management |
| `src/utils/headlessProfiler.ts` | Headless execution timing |
| `src/utils/agentContext.ts` | Agent context building |
| `src/utils/argumentSubstitution.ts` | Template variable substitution |

---

## Architecture

```
agent-task-runner/
├── src/
│   ├── cli.ts                  # Entry: parse agent name + inputs, run
│   ├── discovery/
│   │   ├── agentLoader.ts      # From loadAgentsDir.ts — find agent specs
│   │   ├── agentValidator.ts   # Validate agent spec schema
│   │   └── agentResolver.ts    # Resolve agent by name/path
│   ├── runner/
│   │   ├── taskRunner.ts       # From Task.ts — headless execution
│   │   ├── toolDispatcher.ts   # From QueryEngine.ts — tool routing
│   │   ├── contextBuilder.ts   # Build agent context from inputs
│   │   └── outputCapture.ts    # Capture and structure task output
│   ├── io/
│   │   ├── inputParser.ts      # Parse --input key=value pairs
│   │   ├── templateEngine.ts   # Variable substitution from argumentSubstitution
│   │   └── outputFormatter.ts  # Structure output as JSON/text/exit-code
│   ├── permissions/
│   │   └── headlessPerms.ts    # Default safe permissions for headless mode
│   └── types.ts
├── package.json
├── tsconfig.json
└── README.md
```

### Agent Spec Format

```yaml
# agents/code-reviewer.yaml
name: code-reviewer
description: Review code changes and suggest improvements
model: claude-3-5-sonnet
tools: [bash, file_read, glob, grep]
permissions:
  - bash:git *
  - file:./src/**
inputs:
  - name: diff
    description: The code diff to review
    required: true
prompt: |
  Review the following code changes and provide feedback:
  
  {{diff}}
  
  Focus on: correctness, security, performance, style.
```

---

## Build Plan

### Phase 1 — Agent Discovery
- [ ] Port `loadAgentsDir.ts` to scan `agents/`, `.agents/`, `~/.openclaude/agents/`
- [ ] Support YAML and JSON agent specs
- [ ] Validate required fields: `name`, `prompt`, `tools`

### Phase 2 — Headless Execution
- [ ] Strip interactive/TUI components from `Task.ts` + `QueryEngine.ts`
- [ ] Inject inputs via template substitution (`argumentSubstitution.ts`)
- [ ] Capture all tool calls and their results
- [ ] Capture final agent response

### Phase 3 — Output Modes
- [ ] Default: print agent response to stdout
- [ ] `--json` structured output with all tool calls + final response
- [ ] `--exit-code` mode: 0 = success, 1 = agent reported failure
- [ ] `--verbose` stream each tool call as it happens

### Phase 4 — Integration Features
- [ ] `--timeout <seconds>` max execution time
- [ ] `--max-turns N` cap tool call loops
- [ ] `--dry-run` show what would be executed without running
- [ ] `--watch` re-run on input file changes (dev mode)

---

## CLI Interface

```bash
# List available agents
agent-task-runner list

# Run an agent by name
agent-task-runner run code-reviewer --input diff="$(git diff HEAD~1)"

# Run from file
agent-task-runner run ./agents/my-agent.yaml --input prompt="Analyze this"

# Run with stdin input
git diff | agent-task-runner run code-reviewer --input diff=-

# JSON output
agent-task-runner run code-reviewer --input diff="..." --json

# In CI pipeline
RESULT=$(agent-task-runner run pr-summarizer \
  --input pr_number=$PR_NUMBER \
  --input repo=$GITHUB_REPOSITORY \
  --json)
echo $RESULT | jq '.response'

# Dry run
agent-task-runner run my-agent --input x=y --dry-run
```

---

## Sample Output

```
Running agent: code-reviewer
Input: diff (1,234 chars)
─────────────────────────────────────────
[tool] bash: git log --oneline -5
[tool] file_read: src/auth.ts
[tool] grep: pattern="password" path=src/

Code Review Summary:
✓ Logic is correct
⚠ Line 42: potential timing attack in token comparison
  → Use crypto.timingSafeEqual() instead of ===
✓ No hardcoded secrets
✓ Error handling looks good

Exit: 0 (success)
```

---

*Branch: `foundation/op-striker` | Parent repo: FoundationOperations/openclaude*
