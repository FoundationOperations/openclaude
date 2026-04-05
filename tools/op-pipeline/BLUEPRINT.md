# BLUEPRINT: op-pipeline
## Tool: `openclaude-ci`

> Foundation Operations — Operation Pipeline  
> *"Every PR goes through the field agent. No commit escapes review."*

---

## Mission

A CI/CD-native agent runner. On each pull request or push, harvests rich git context (diff, branch info, PR metadata), invokes configured agents headlessly with appropriate permissions, audits permission usage, records all sessions, and posts a structured summary back to the PR as a comment. Brings AI agents into the standard software delivery pipeline.

---

## Component Tools Integrated

| Module | Source Tool | Role |
|--------|------------|------|
| Agent Execution | `op-striker` (agent-task-runner) | Run agents headlessly in CI |
| Git Context | `op-reaper` (git-context-harvester) | Harvest PR/commit/diff context |
| Permission Audit | `op-clearance` (permission-auditor) | Audit agent permission usage |
| Session Record | `op-archive` (session-replay) | Record and expose session artifacts |

---

## Source Files from openclaude (extraction targets)

| File | Role |
|------|------|
| `src/Task.ts` | Core task execution engine |
| `src/QueryEngine.ts` | Query orchestration, tool dispatch |
| `src/tools/AgentTool/loadAgentsDir.ts` | Agent discovery |
| `src/utils/git.ts` | Git operations |
| `src/utils/gitDiff.ts` | Diff generation |
| `src/utils/ghPrStatus.ts` | GitHub PR API integration |
| `src/utils/permissions/permissions.ts` | Permission rule engine |
| `src/utils/sessionStorage.ts` | Session recording |
| `src/utils/agentContext.ts` | Agent context building |

---

## Architecture

```
openclaude-ci/
├── src/
│   ├── cli.ts                  # Entry: run, report, list subcommands
│   ├── ci/
│   │   ├── detector.ts         # Detect CI environment (GitHub Actions, GitLab, etc.)
│   │   ├── contextBuilder.ts   # Build full CI run context
│   │   └── reporter.ts         # Post results to PR/MR/commit
│   ├── harvest/                # From op-reaper
│   │   ├── gitHarvester.ts     # Branch, status, diff, commits
│   │   ├── prHarvester.ts      # PR metadata, labels, reviewers
│   │   └── fileHarvester.ts    # Changed file contents (respecting size limits)
│   ├── runner/                 # From op-striker
│   │   ├── agentRunner.ts      # Headless agent execution
│   │   ├── agentLoader.ts      # Load from .ci-agents/ or agents/
│   │   ├── inputBuilder.ts     # Build agent inputs from CI context
│   │   └── outputParser.ts     # Parse structured agent output
│   ├── audit/                  # From op-clearance
│   │   ├── permissionAuditor.ts # Audit permission usage per run
│   │   └── violationReporter.ts # Surface permission violations
│   ├── record/                 # From op-archive
│   │   ├── sessionRecorder.ts  # Record agent sessions to artifacts
│   │   └── artifactUploader.ts # Upload to CI artifact store
│   ├── github/
│   │   ├── prCommenter.ts      # Post results as PR comment
│   │   ├── checkRunner.ts      # Create GitHub Check runs with status
│   │   └── annotationWriter.ts # File-level inline annotations
│   └── types.ts
├── action.yml                  # GitHub Actions action definition
├── package.json
├── tsconfig.json
└── README.md
```

### CI Run Flow

```
PR opened / push
     │
     ▼
detector.ts ──► identify CI environment, extract GITHUB_SHA, PR_NUMBER
     │
     ▼
gitHarvester.ts ──► collect branch, diff, commits, changed files
prHarvester.ts  ──► collect PR title, description, labels, reviewers
     │
     ▼
agentLoader.ts ──► find agents matching trigger patterns
     │           (e.g., .ci-agents/code-review.yaml triggered on: pr)
     ▼
agentRunner.ts ──► run each agent headlessly with harvested context
     │              (with permission audit enabled)
     ▼
outputParser.ts ──► extract findings, suggestions, pass/fail verdict
     │
     ▼
prCommenter.ts ──► post structured comment to PR
checkRunner.ts ──► create GitHub Check with status + annotations
artifactUploader.ts ──► upload session JSONL as CI artifact
```

### Agent Trigger Config (`.ci-agents/code-review.yaml`)

```yaml
name: code-reviewer
on:
  - pull_request
  - push:branch:main
model: claude-3-5-sonnet
tools: [bash, file_read, grep, glob]
permissions:
  - bash:git *
  - file:./src/**:read
inputs:
  diff: "{{ci.diff}}"
  pr_title: "{{ci.pr.title}}"
  changed_files: "{{ci.changedFiles}}"
output:
  format: markdown
  post_as: pr_comment
  create_check: true
```

---

## Build Plan

### Phase 1 — CI Environment Detection
- [ ] GitHub Actions: GITHUB_SHA, GITHUB_REF, GITHUB_EVENT_NAME
- [ ] GitLab CI: CI_COMMIT_SHA, CI_MERGE_REQUEST_IID
- [ ] Generic: detect from git + env vars
- [ ] Local dev mode: `openclaude-ci run --local`

### Phase 2 — Context Harvesting (op-reaper)
- [ ] Git diff (with size limits), branch info, recent commits
- [ ] Changed file paths and contents (configurable max size)
- [ ] PR metadata via GitHub API (title, body, labels, reviewers)

### Phase 3 — Agent Execution (op-striker)
- [ ] Load agents from `.ci-agents/` directory
- [ ] Build agent inputs from CI context template
- [ ] Run headlessly with `--timeout` and `--max-turns` safety limits
- [ ] Capture structured output + all tool calls

### Phase 4 — Reporting
- [ ] GitHub PR comment with findings summary
- [ ] GitHub Check with pass/fail and inline annotations
- [ ] Session JSONL uploaded as CI artifact
- [ ] Permission audit report as separate artifact

---

## CLI Interface

```bash
# Run all CI agents (auto-detects environment)
openclaude-ci run

# Run locally against current branch
openclaude-ci run --local

# Run specific agent
openclaude-ci run --agent code-reviewer

# List configured CI agents
openclaude-ci list

# Dry run (no PR comments)
openclaude-ci run --dry-run

# GitHub Actions usage
- uses: foundation-ops/openclaude-ci@v1
  with:
    agent: code-reviewer
    github-token: ${{ secrets.GITHUB_TOKEN }}

# View last run results
openclaude-ci report --last
openclaude-ci report --json
```

---

## GitHub Actions Workflow Example

```yaml
# .github/workflows/ai-review.yml
name: AI Code Review

on: [pull_request]

jobs:
  ai-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: foundation-ops/openclaude-ci@v1
        with:
          agents-dir: .ci-agents/
          github-token: ${{ secrets.GITHUB_TOKEN }}
          provider: anthropic
          api-key: ${{ secrets.ANTHROPIC_API_KEY }}
```

---

*Branch: `foundation/op-pipeline` | Parent repo: FoundationOperations/openclaude*
