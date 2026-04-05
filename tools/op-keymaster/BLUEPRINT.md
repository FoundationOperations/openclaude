# BLUEPRINT: op-keymaster
## Tool: `provider-wizard`

> Foundation Operations — Operation Keymaster  
> *"Control the keys, control the operation."*

---

## Mission

A CLI setup wizard for configuring any supported LLM provider. Walks users through detecting available providers, testing credentials, selecting models, and writing ready-to-use env files or JSON profiles. Replaces manual `.env` editing with an interactive, validated setup flow.

---

## Source Files from openclaude (extraction targets)

| File | Role |
|------|------|
| `src/utils/providerProfile.ts` | Provider profile schema, serialization |
| `src/utils/providerDiscovery.ts` | Auto-detect local providers |
| `src/utils/geminiAuth.ts` | Google Gemini auth flow |
| `src/utils/aws.ts` | AWS Bedrock credential helpers |
| `src/utils/awsAuthStatusManager.ts` | AWS auth status tracking |
| `src/utils/auth.ts` | Generic auth utilities |
| `src/utils/authPortable.ts` | Portable auth (no native deps) |
| `src/utils/billing.ts` | Billing/quota check utilities |
| `src/utils/betas.ts` | Beta feature flags per provider |

---

## Architecture

```
provider-wizard/
├── src/
│   ├── cli.ts                  # Entry: detect mode (interactive vs --provider flag)
│   ├── providers/
│   │   ├── anthropic.ts        # API key validation, model listing
│   │   ├── openai.ts           # OpenAI + compatible (Ollama, LM Studio)
│   │   ├── gemini.ts           # Google OAuth + API key flow
│   │   ├── bedrock.ts          # AWS credentials, region, model ARN
│   │   ├── vertex.ts           # GCP project/location, ADC flow
│   │   ├── github.ts           # GitHub token + Models API test
│   │   └── ollama.ts           # Local detection, model pull prompt
│   ├── wizard/
│   │   ├── ProviderSelector.tsx # Ink: pick provider from list
│   │   ├── CredentialForm.tsx   # Dynamic form based on provider schema
│   │   ├── ModelSelector.tsx    # Fetch and display available models
│   │   ├── TestResult.tsx       # Show connection test outcome
│   │   └── OutputPreview.tsx    # Preview .env or JSON before writing
│   ├── writer.ts               # Write .env file or JSON profile
│   ├── tester.ts               # Validate credentials via real API call
│   └── types.ts
├── package.json
├── tsconfig.json
└── README.md
```

### Provider Configuration Schema

```typescript
interface ProviderConfig {
  provider: 'anthropic' | 'openai' | 'gemini' | 'bedrock' | 'vertex' | 'github' | 'ollama';
  model: string;
  apiKey?: string;
  baseUrl?: string;
  region?: string;       // AWS Bedrock
  projectId?: string;    // GCP Vertex
  credentials?: object;  // AWS/GCP credential objects
}
```

---

## Build Plan

### Phase 1 — Provider Detection
- [ ] Auto-discover Ollama (port 11434), LM Studio (port 1234)
- [ ] Detect environment variables already set (ANTHROPIC_API_KEY, etc.)
- [ ] Check AWS/GCP credentials from standard config paths

### Phase 2 — Interactive Wizard
- [ ] Provider selection menu (auto-highlight detected providers)
- [ ] Dynamic credential form per provider (API key, region, etc.)
- [ ] Real connection test with success/failure feedback

### Phase 3 — Model Selection
- [ ] Fetch available models from each provider's API
- [ ] Display with metadata: context window, pricing tier, capabilities
- [ ] Allow pinning a default model

### Phase 4 — Output
- [ ] Write `.env` file with all environment variables
- [ ] Write `.openclaude-profile.json`
- [ ] Print shell `export` commands for copy-paste
- [ ] `--dry-run` flag: preview without writing

---

## CLI Interface

```bash
# Full interactive wizard
provider-wizard

# Configure specific provider
provider-wizard --provider anthropic
provider-wizard --provider ollama
provider-wizard --provider bedrock

# Non-interactive: validate existing config
provider-wizard --test
provider-wizard --test --provider openai

# Output formats
provider-wizard --output env      # Write .env file
provider-wizard --output json     # Write profile JSON
provider-wizard --output shell    # Print export commands

# Dry run (no writes)
provider-wizard --dry-run
```

---

## Sample Wizard Flow

```
? Select a provider:
  ❯ Ollama (detected at localhost:11434) ✓
    Anthropic (API key not set)
    OpenAI (API key not set)
    Google Gemini
    AWS Bedrock
    GitHub Models

? Select Ollama model:
  ❯ qwen2.5:7b    (4.7 GB, 32k ctx, Q4_K_M)
    llama3.2:3b   (2.0 GB, 8k ctx, Q4_K_M)
    mistral:7b    (4.1 GB, 32k ctx, Q4_K_M)

✓ Connection test passed (42ms TTFT)

Writing to .env:
  CLAUDE_CODE_USE_OPENAI=1
  OPENAI_BASE_URL=http://localhost:11434/v1
  OPENAI_MODEL=qwen2.5:7b
  OPENAI_API_KEY=ollama
```

---

*Branch: `foundation/op-keymaster` | Parent repo: FoundationOperations/openclaude*
