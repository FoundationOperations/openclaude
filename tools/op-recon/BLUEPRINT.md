# BLUEPRINT: op-recon
## Tool: `mcp-inspector`

> Foundation Operations — Operation Recon  
> *"Know the terrain before you deploy your tools."*

---

## Mission

A standalone TUI for connecting to any MCP (Model Context Protocol) server, enumerating its tools/resources/prompts, calling tools interactively with test inputs, and testing OAuth flows. Think Postman but purpose-built for MCP — for developers building or debugging MCP servers.

---

## Source Files from openclaude (extraction targets)

| File | Role |
|------|------|
| `src/services/mcp/client.ts` | MCP client, tool invocation, session management (3,363 lines) |
| `src/services/mcp/auth.ts` | Full PKCE OAuth 2.0 flow for MCP auth (2,466 lines) |
| `src/services/mcp/doctor.ts` | MCP connection diagnostics |
| `src/services/mcp/mcpUtils.ts` | JSON-RPC helpers, message formatting |
| `src/tools/MCPTool/` | Tool invocation wrappers |
| `src/tools/McpAuthTool/` | Auth flow UI and state |
| `src/tools/ListMcpResourcesTool/` | Resource enumeration |
| `src/tools/ReadMcpResourceTool/` | Resource content reading |

---

## Architecture

```
mcp-inspector/
├── src/
│   ├── cli.ts                  # Entry: connect to MCP server URL
│   ├── connector.ts            # Establish JSON-RPC session (stdio/SSE/HTTP)
│   ├── enumerator.ts           # List tools, resources, prompts via initialize
│   ├── invoker.ts              # Call any tool with user-provided JSON args
│   ├── recorder.ts             # Record request/response pairs to JSONL
│   ├── auth/
│   │   ├── pkceFlow.ts         # OAuth PKCE from mcp/auth.ts
│   │   ├── tokenStore.ts       # Persist tokens to ~/.mcp-inspector-tokens.json
│   │   └── authTester.ts       # Test token validity, refresh
│   ├── ui/
│   │   ├── ServerTree.tsx      # Ink: tool/resource/prompt tree
│   │   ├── ToolInvoker.tsx     # Form for entering tool args as JSON
│   │   ├── ResponseView.tsx    # Formatted response with syntax highlighting
│   │   └── AuthPanel.tsx       # OAuth status, token info, login/logout
│   └── types.ts
├── package.json
├── tsconfig.json
└── README.md
```

### Connection Modes

| Mode | Transport | Use Case |
|------|-----------|---------|
| `stdio` | subprocess stdin/stdout | Local MCP servers |
| `sse` | Server-Sent Events | Remote hosted MCP |
| `http` | Streamable HTTP | Stateless MCP servers |
| `ws` | WebSocket | Real-time MCP servers |

---

## Build Plan

### Phase 1 — Connection & Enumeration
- [ ] JSON-RPC 2.0 client with all 4 transport modes
- [ ] `initialize` handshake, capability negotiation
- [ ] Tool/resource/prompt listing and metadata display

### Phase 2 — Interactive Tool Invocation
- [ ] JSON argument editor with schema-driven validation
- [ ] Tool call execution with streamed response display
- [ ] Error pretty-printer for MCP error responses

### Phase 3 — Auth Testing
- [ ] OAuth PKCE flow (from `mcp/auth.ts`)
- [ ] Token inspection: expiry, scopes, claims
- [ ] `--token <value>` flag to test with pre-issued tokens

### Phase 4 — Recording & Replay
- [ ] Record sessions to JSONL (all JSON-RPC messages)
- [ ] Replay from recorded session for regression testing
- [ ] Export single tool call as curl/fetch snippet

---

## CLI Interface

```bash
# Connect to local MCP server via stdio
mcp-inspector stdio -- node my-mcp-server.js

# Connect to remote SSE MCP server
mcp-inspector sse https://my-mcp.example.com/sse

# Non-interactive: call specific tool
mcp-inspector call --server https://... --tool search --args '{"query":"hello"}'

# Run diagnostics
mcp-inspector doctor https://my-mcp.example.com

# Test OAuth flow
mcp-inspector auth https://my-mcp.example.com
```

---

*Branch: `foundation/op-recon` | Parent repo: FoundationOperations/openclaude*
