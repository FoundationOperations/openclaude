# BLUEPRINT: op-workshop
## Tool: `mcp-devkit`

> Foundation Operations — Operation Workshop  
> *"Build, test, and ship MCP servers from one workbench."*

---

## Mission

A full developer toolkit for building, testing, and debugging MCP servers. Combines server inspection, plugin management, OAuth configuration, tool call testing with mock inputs, and recorded session replay. The complete workbench for MCP server authors.

---

## Component Tools Integrated

| Module | Source Tool | Role |
|--------|------------|------|
| Server Inspector | `op-recon` (mcp-inspector) | Connect to and explore any MCP server |
| Plugin Manager | `op-armory` (plugin-marketplace-cli) | Install community MCP server plugins |
| Auth Wizard | `op-keymaster` (provider-wizard) | Configure OAuth credentials for MCP |

---

## Source Files from openclaude (extraction targets)

| File | Role |
|------|------|
| `src/services/mcp/client.ts` | MCP JSON-RPC client (3,363 lines) |
| `src/services/mcp/auth.ts` | OAuth PKCE flow (2,466 lines) |
| `src/services/mcp/doctor.ts` | Connection diagnostics |
| `src/services/mcp/mcpUtils.ts` | JSON-RPC helpers |
| `src/tools/MCPTool/` | Tool invocation wrappers |
| `src/tools/McpAuthTool/` | Auth UI and state |
| `src/utils/plugins/marketplaceManager.ts` | Plugin registry |
| `src/utils/plugins/pluginLoader.ts` | Plugin loading |

---

## Architecture

```
mcp-devkit/
├── src/
│   ├── cli.ts                  # Entry: workspace subcommand router
│   ├── workspace/
│   │   ├── WorkspaceManager.ts # Persist workspace config (servers, plugins, creds)
│   │   └── workspaceConfig.ts  # ~/.mcp-devkit/workspace.json
│   ├── inspector/              # From op-recon
│   │   ├── connector.ts        # Multi-transport MCP client
│   │   ├── enumerator.ts       # Tool/resource/prompt listing
│   │   ├── invoker.ts          # Parameterized tool invocation
│   │   └── recorder.ts         # Session recording to JSONL
│   ├── playground/
│   │   ├── MockRunner.tsx      # Run tool calls with mock data
│   │   ├── SchemaEditor.tsx    # Edit tool input schemas
│   │   ├── ResponseDiff.tsx    # Compare actual vs expected responses
│   │   └── TestSuite.tsx       # Save and re-run test cases
│   ├── plugins/                # From op-armory
│   │   ├── installer.ts        # Install MCP server plugins
│   │   ├── registry.ts         # Community registry client
│   │   └── localLoader.ts      # Load local dev MCP servers
│   ├── auth/                   # From op-keymaster
│   │   ├── pkceFlow.ts         # OAuth PKCE
│   │   ├── tokenStore.ts       # Credential persistence
│   │   └── authTester.ts       # Validate tokens
│   ├── ui/
│   │   ├── App.tsx             # Root: workspace + tab navigation
│   │   ├── ServerTree.tsx      # Registered servers + connection status
│   │   ├── ToolInvoker.tsx     # Interactive tool test form
│   │   ├── PluginBrowser.tsx   # Marketplace plugin browser
│   │   └── AuthPanel.tsx       # OAuth credential management
│   └── types.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

## Build Plan

### Phase 1 — Workspace
- [ ] Workspace config: list of MCP servers, installed plugins, saved test cases
- [ ] `mcp-devkit init` to create workspace in current directory
- [ ] Server registration: `mcp-devkit add stdio -- node my-server.js`

### Phase 2 — Inspector Integration (op-recon)
- [ ] Connect to registered servers on workspace open
- [ ] Tool/resource/prompt tree with live status
- [ ] Interactive tool invocation with argument editor

### Phase 3 — Playground
- [ ] Mock tool inputs with JSON editor + schema validation
- [ ] Save test cases with expected output assertions
- [ ] Run all test cases: `mcp-devkit test`
- [ ] Response diff: compare current vs saved baseline

### Phase 4 — Plugin & Auth Management
- [ ] Browse and install community MCP servers from marketplace (op-armory)
- [ ] OAuth credential management (op-keymaster)
- [ ] `mcp-devkit auth login <server>` for OAuth-protected servers
- [ ] `mcp-devkit plugin install <name>` add community servers

---

## CLI Interface

```bash
# Initialize workspace
mcp-devkit init

# Add a server
mcp-devkit add stdio -- node ./my-server.js
mcp-devkit add sse https://api.example.com/mcp

# Launch TUI workspace
mcp-devkit

# Run tool non-interactively
mcp-devkit call --server my-server --tool search --args '{"q":"hello"}'

# Save and run tests
mcp-devkit test save --server my-server --tool search --args '...' --expected '...'
mcp-devkit test run

# Auth flows
mcp-devkit auth login my-server
mcp-devkit auth status

# Plugin management
mcp-devkit plugin search "weather"
mcp-devkit plugin install @community/weather-mcp

# Diagnostics
mcp-devkit doctor my-server
```

---

*Branch: `foundation/op-workshop` | Parent repo: FoundationOperations/openclaude*
