# BLUEPRINT: op-dispatch
## Tool: `markdown-term-renderer`

> Foundation Operations — Operation Dispatch  
> *"Deliver the message. Format it so nothing gets lost in transmission."*

---

## Mission

A standalone terminal Markdown renderer that converts GitHub-flavored Markdown to richly formatted ANSI terminal output with syntax-highlighted code blocks, clickable hyperlinks, tables, and theming. Pipeable (`cat README.md | mdterm`) and usable as a library. Extracted from openclaude's internal rendering infrastructure.

---

## Source Files from openclaude (extraction targets)

| File | Role |
|------|------|
| `src/utils/markdown.ts` | Core Markdown-to-ANSI rendering pipeline |
| `src/utils/cliHighlight.ts` | Language-specific syntax highlighting |
| `src/utils/ansiToSvg.ts` | ANSI → SVG for HTML output |
| `src/utils/ansiToPng.ts` | ANSI → PNG for image output |
| `src/components/` | Ink components for structured rendering |
| `src/outputStyles/` | ANSI color themes |

---

## Architecture

```
markdown-term-renderer/
├── src/
│   ├── cli.ts                  # Entry: read file/stdin, render, output
│   ├── parser.ts               # GFM parser (wraps existing markdown.ts)
│   ├── renderer/
│   │   ├── AnsiRenderer.ts     # Core ANSI output renderer
│   │   ├── CodeRenderer.ts     # Syntax highlighting per language
│   │   ├── TableRenderer.ts    # ASCII/Unicode table drawing
│   │   ├── LinkRenderer.ts     # Hyperlinks (OSC 8 terminal links)
│   │   ├── HeadingRenderer.ts  # Bold/colored headings with separators
│   │   └── ListRenderer.ts     # Nested lists with Unicode bullets
│   ├── themes/
│   │   ├── default.ts          # Default dark-bg theme
│   │   ├── light.ts            # Light terminal theme
│   │   ├── monokai.ts          # Monokai color scheme
│   │   └── nord.ts             # Nord color scheme
│   ├── exporters/
│   │   ├── svgExporter.ts      # From ansiToSvg.ts
│   │   ├── pngExporter.ts      # From ansiToPng.ts
│   │   └── htmlExporter.ts     # Wrap SVG in HTML
│   ├── lib/
│   │   └── index.ts            # Library API (render, renderToSvg, etc.)
│   └── types.ts
├── package.json
├── tsconfig.json
└── README.md
```

### Rendering Features

| Feature | GFM Element | Output |
|---------|-------------|--------|
| Headings | `#`, `##`, `###` | Bold + color + separator line |
| Code blocks | ` ``` ` | Syntax highlighted with language label |
| Tables | `\| a \| b \|` | Unicode box-drawing table |
| Links | `[text](url)` | Underlined + OSC 8 hyperlink |
| Bold/Italic | `**b**`, `*i*` | ANSI bold/italic |
| Blockquotes | `> text` | Left border + dimmed text |
| Task lists | `- [x]` | ✅/☐ Unicode checkboxes |
| Strikethrough | `~~text~~` | ANSI strikethrough |

---

## Build Plan

### Phase 1 — Core Renderer
- [ ] Extract `markdown.ts` rendering pipeline as standalone module
- [ ] Add full GFM table support (alignment, spanning)
- [ ] Heading hierarchy with visual depth cues

### Phase 2 — Code Highlighting
- [ ] Port `cliHighlight.ts` with language auto-detection
- [ ] Add language badge display
- [ ] Line numbers option (`--line-numbers`)

### Phase 3 — Themes & Config
- [ ] 4 built-in themes (default, light, monokai, nord)
- [ ] Per-user config: `~/.mdterm-config.json`
- [ ] `--theme <name>` flag

### Phase 4 — Export Modes
- [ ] `--svg` export via `ansiToSvg.ts`
- [ ] `--png` export via `ansiToPng.ts`
- [ ] `--html` self-contained HTML page
- [ ] Library API: `import { render } from 'markdown-term-renderer'`

---

## CLI Interface

```bash
# Render a file
mdterm README.md

# Pipe from stdin
cat CHANGELOG.md | mdterm

# With line numbers in code blocks
mdterm docs/guide.md --line-numbers

# Use a theme
mdterm README.md --theme nord

# Export to SVG
mdterm README.md --svg > preview.svg

# Export to HTML
mdterm README.md --html > preview.html

# Width control
mdterm README.md --width 100

# No color (plain text)
mdterm README.md --no-color
```

---

## Library API

```typescript
import { render, renderToSvg, renderToPng } from 'markdown-term-renderer';

// Render to ANSI string
const ansi = render('# Hello\n\n**World**');
console.log(ansi);

// Render to SVG
const svg = await renderToSvg('# Hello', { theme: 'nord', width: 80 });

// Render to PNG buffer
const png = await renderToPng('# Hello', { theme: 'monokai' });
```

---

*Branch: `foundation/op-dispatch` | Parent repo: FoundationOperations/openclaude*
