# BLUEPRINT: op-reaper
## Tool: `git-context-harvester`

> Foundation Operations — Operation Reaper  
> *"Harvest the intelligence from your codebase before every deployment."*

---

## Mission

A CLI that extracts all relevant git context from a repository — branch, dirty files, recent commits, PR status, worktree info, gitignore rules, and diff stats — and outputs structured JSON or a formatted summary. Purpose-built for feeding context to LLMs, CI pipelines, or agents.

---

## Source Files from openclaude (extraction targets)

| File | Role |
|------|------|
| `src/utils/git.ts` | Core git operations, branch/status/commit queries |
| `src/utils/git/gitFilesystem.ts` | File-level git status |
| `src/utils/git/gitignore.ts` | Gitignore rule parsing and file filtering |
| `src/utils/git/gitConfigParser.ts` | `.git/config` parser |
| `src/utils/gitDiff.ts` | Diff generation and parsing |
| `src/utils/ghPrStatus.ts` | GitHub PR status via CLI/API |
| `src/utils/agenticSessionSearch.ts` | Agentic context search |

---

## Architecture

```
git-context-harvester/
├── src/
│   ├── cli.ts                  # Entry: collect context, output
│   ├── collectors/
│   │   ├── branchCollector.ts  # Current branch, upstream, ahead/behind
│   │   ├── statusCollector.ts  # Staged/unstaged/untracked files
│   │   ├── commitCollector.ts  # Recent N commits with author/message/hash
│   │   ├── diffCollector.ts    # Unified diff with stats
│   │   ├── worktreeCollector.ts# Active worktrees
│   │   ├── configCollector.ts  # Remote URLs, user.name, user.email
│   │   ├── prCollector.ts      # Open PRs, current PR status
│   │   └── gitignoreCollector.ts # Effective gitignore patterns
│   ├── aggregator.ts           # Merge collectors into GitContext object
│   ├── formatter.ts            # JSON / Markdown / LLM-prompt formats
│   └── types.ts
├── package.json
├── tsconfig.json
└── README.md
```

### Output Schema

```typescript
interface GitContext {
  repo: {
    root: string;
    remotes: { name: string; url: string }[];
    defaultBranch: string;
  };
  branch: {
    current: string;
    upstream: string | null;
    aheadBy: number;
    behindBy: number;
  };
  status: {
    staged: FileStatus[];
    unstaged: FileStatus[];
    untracked: string[];
    conflicted: string[];
  };
  commits: CommitInfo[];   // last N commits
  diff: DiffSummary;       // stats + patch
  pr: PrStatus | null;     // GitHub PR info if available
  worktrees: WorktreeInfo[];
  config: GitConfig;
  collectedAt: string;     // ISO8601
}
```

---

## Build Plan

### Phase 1 — Core Collectors
- [ ] Branch/upstream status collector
- [ ] Staged/unstaged/untracked file status
- [ ] Recent N commits collector (configurable depth)
- [ ] Diff collector (stats and full patch)

### Phase 2 — Extended Collectors
- [ ] Worktree enumeration
- [ ] Git config parser (remotes, user, hooks)
- [ ] Gitignore effective rules
- [ ] GitHub PR status (via `gh` CLI or GitHub API)

### Phase 3 — Output Formats
- [ ] `--json` structured JSON output
- [ ] `--markdown` human-readable summary
- [ ] `--prompt` LLM-optimized context block (concise, token-efficient)
- [ ] `--diff` just the diff
- [ ] `--status` just the status (like `git status` but structured)

### Phase 4 — Filtering & Scoping
- [ ] `--files` include file contents of changed files
- [ ] `--max-diff-lines N` truncate large diffs
- [ ] `--since <ref>` collect commits since a ref/date
- [ ] `--ignore-lockfiles` exclude package-lock.json etc.

---

## CLI Interface

```bash
# Full context as JSON
git-context-harvester --json

# Human-readable summary
git-context-harvester

# LLM prompt format
git-context-harvester --prompt

# Include file contents of changed files
git-context-harvester --files --max-file-size 10000

# Last 20 commits
git-context-harvester --commits 20

# From a specific repo
git-context-harvester --repo /path/to/repo

# Use in a CI pipeline
CONTEXT=$(git-context-harvester --json) && openclaude --print "Review these changes: $CONTEXT"
```

---

## Sample Output (Summary Mode)

```
Repository Context
──────────────────
Branch:    feature/add-oauth  →  origin/main (+3, -0)
Status:    2 staged, 1 unstaged, 0 untracked
PR:        #42 "Add OAuth support" [open, 2 reviewers]

Recent Commits:
  abc1234  Add OAuth callback handler         (2h ago)
  def5678  Update provider config schema      (4h ago)
  ghi9012  Fix token refresh race condition   (1d ago)

Diff Stats: +187 / -43 across 6 files
```

---

*Branch: `foundation/op-reaper` | Parent repo: FoundationOperations/openclaude*
