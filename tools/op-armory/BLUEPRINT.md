# BLUEPRINT: op-armory
## Tool: `plugin-marketplace-cli`

> Foundation Operations — Operation Armory  
> *"Equip your agents with the right tools. The armory is open."*

---

## Mission

A standalone CLI for discovering, installing, configuring, and managing openclaude plugins without running the full agent. Enables teams to curate plugin sets, audit installed plugins, and manage plugin updates — think `npm` but for LLM tool plugins.

---

## Source Files from openclaude (extraction targets)

| File | Role |
|------|------|
| `src/utils/plugins/marketplaceManager.ts` | Plugin registry, search, fetch (2,643 lines) |
| `src/utils/plugins/pluginLoader.ts` | Plugin loading, validation, sandboxing (3,302 lines) |
| `src/commands/plugin/ManagePlugins.tsx` | Plugin management UI components |
| `src/utils/plugins/` | Full plugin subsystem |

---

## Architecture

```
plugin-marketplace-cli/
├── src/
│   ├── cli.ts                  # Entry: parse subcommand (search/install/list/remove)
│   ├── commands/
│   │   ├── search.ts           # Search marketplace by name/tag/capability
│   │   ├── install.ts          # Download, validate, install plugin
│   │   ├── remove.ts           # Uninstall plugin, clean state
│   │   ├── list.ts             # List installed plugins with metadata
│   │   ├── info.ts             # Show detailed plugin info
│   │   ├── update.ts           # Update installed plugins
│   │   └── audit.ts            # Security audit of installed plugins
│   ├── marketplace/
│   │   ├── registry.ts         # Marketplace API client
│   │   ├── resolver.ts         # Dependency resolution
│   │   └── verifier.ts         # Checksum + signature verification
│   ├── loader/
│   │   ├── installer.ts        # From pluginLoader.ts — install logic
│   │   ├── validator.ts        # Schema validation for plugin manifests
│   │   └── sandbox.ts          # Plugin isolation/sandboxing
│   ├── ui/
│   │   ├── SearchResults.tsx   # Ink: paginated search results
│   │   ├── PluginCard.tsx      # Plugin info card
│   │   └── InstallProgress.tsx # Download/install progress bar
│   └── types.ts
├── package.json
├── tsconfig.json
└── README.md
```

### Plugin Manifest Schema

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "Does something useful",
  "author": "Foundation Operations",
  "tools": ["search", "analyze"],
  "permissions": ["bash:read", "file:./data/**"],
  "entrypoint": "dist/index.js",
  "checksum": "sha256:abc123..."
}
```

---

## Build Plan

### Phase 1 — Marketplace Client
- [ ] Extract `marketplaceManager.ts` registry queries
- [ ] Search by name, description, tags, capability
- [ ] Fetch plugin metadata without downloading

### Phase 2 — Install/Remove
- [ ] Download plugin package with checksum verification
- [ ] Validate manifest schema (from `pluginLoader.ts`)
- [ ] Install to `~/.openclaude/plugins/<name>/`
- [ ] Remove cleanly including config/state cleanup

### Phase 3 — Management Commands
- [ ] `list` — show installed plugins with version, source, last updated
- [ ] `update` — check for and apply updates
- [ ] `info` — detailed metadata including permissions and tools
- [ ] `audit` — flag plugins with suspicious permissions or outdated packages

### Phase 4 — Interactive TUI
- [ ] Ink-based search results browser
- [ ] Install confirmation with permission display
- [ ] `--yes` flag for non-interactive automation

---

## CLI Interface

```bash
# Search marketplace
plugin-marketplace search "code formatter"
plugin-marketplace search --tag git

# Install a plugin
plugin-marketplace install @foundation/git-helper
plugin-marketplace install ./path/to/local-plugin

# List installed
plugin-marketplace list
plugin-marketplace list --json

# Get plugin info
plugin-marketplace info @foundation/git-helper

# Update plugins
plugin-marketplace update
plugin-marketplace update @foundation/git-helper

# Remove a plugin
plugin-marketplace remove @foundation/git-helper

# Security audit
plugin-marketplace audit
plugin-marketplace audit --severity high
```

---

## Sample Output

```
Search Results: "git helper"
──────────────────────────────────────────────────
@foundation/git-helper     v2.1.0   ★ 4.8   1,234 installs
  Comprehensive git operations: commit, branch, PR management
  Permissions: bash:git *, file:./.git/**

@community/git-flow        v1.3.2   ★ 4.2   567 installs
  Git Flow workflow automation
  Permissions: bash:git *, bash:npm run *

Install a plugin: plugin-marketplace install @foundation/git-helper
```

---

*Branch: `foundation/op-armory` | Parent repo: FoundationOperations/openclaude*
