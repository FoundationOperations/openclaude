# BLUEPRINT: op-blueprint
## Tool: `ansi-to-image`

> Foundation Operations — Operation Blueprint  
> *"Turn your terminal art into shareable artifacts."*

---

## Mission

A utility CLI and library that converts ANSI-colored terminal output into PNG, SVG, or self-contained HTML images. Perfect for embedding terminal sessions in documentation, GitHub READMEs, blog posts, and presentations. Built directly on openclaude's existing `ansiToSvg.ts` and `ansiToPng.ts` converters.

---

## Source Files from openclaude (extraction targets)

| File | Role |
|------|------|
| `src/utils/ansiToSvg.ts` | ANSI escape sequence → SVG renderer |
| `src/utils/ansiToPng.ts` | SVG → PNG rasterizer |
| `src/utils/asciicast.ts` | Asciicast v2 format reader/writer |
| `src/outputStyles/` | ANSI color theme definitions |

---

## Architecture

```
ansi-to-image/
├── src/
│   ├── cli.ts                  # Entry: read input, convert, output
│   ├── input/
│   │   ├── stdinReader.ts      # Read ANSI from stdin
│   │   ├── fileReader.ts       # Read from .ansi / .txt / .cast file
│   │   └── asciicastReader.ts  # Parse asciicast v2 to final ANSI frame
│   ├── converters/
│   │   ├── ansiToSvg.ts        # From src/utils/ansiToSvg.ts
│   │   ├── svgToPng.ts         # From src/utils/ansiToPng.ts (via sharp/canvas)
│   │   └── ansiToHtml.ts       # Wrap SVG in responsive HTML page
│   ├── themes/
│   │   ├── default.ts          # Classic dark terminal colors
│   │   ├── light.ts            # Light background theme
│   │   ├── monokai.ts          # Monokai Pro
│   │   ├── dracula.ts          # Dracula theme
│   │   ├── nord.ts             # Nord theme
│   │   └── solarized.ts        # Solarized Dark
│   ├── options.ts              # Font, padding, window chrome config
│   ├── lib/
│   │   └── index.ts            # Library API
│   └── types.ts
├── package.json
├── tsconfig.json
└── README.md
```

### Rendering Options

| Option | Default | Description |
|--------|---------|-------------|
| `--theme` | `default` | Color scheme |
| `--font-size` | `14` | Terminal font size in px |
| `--font-family` | `JetBrains Mono` | Monospace font |
| `--padding` | `20` | Padding around terminal content |
| `--window-chrome` | `true` | Show macOS-style window title bar |
| `--title` | `""` | Window title text |
| `--width` | `auto` | Output image width in px |
| `--scale` | `2` | Pixel density (retina: 2) |

---

## Build Plan

### Phase 1 — Core Converters
- [ ] Extract `ansiToSvg.ts` as standalone module
- [ ] Extract `ansiToPng.ts` rasterizer (integrate with `sharp` for prod)
- [ ] Add window chrome renderer (title bar with traffic lights)

### Phase 2 — Input Formats
- [ ] Stdin (pipe raw ANSI output)
- [ ] `.ansi` / `.txt` file input
- [ ] Asciicast v2 `.cast` files (render final frame or specific timestamp)

### Phase 3 — Themes & Styling
- [ ] 6 built-in themes matching popular terminal emulator configs
- [ ] Custom theme via JSON: `--theme ./my-theme.json`
- [ ] Font selection (include JetBrains Mono and Fira Code as embedded options)

### Phase 4 — Library & CI Integration
- [ ] `import { ansiToSvg, ansiToPng, ansiToHtml } from 'ansi-to-image'`
- [ ] GitHub Actions action: `foundation-ops/ansi-to-image@v1`
- [ ] Vite/webpack plugin for embedding terminal output in docs

---

## CLI Interface

```bash
# Pipe terminal output to PNG
ls --color | ansi-to-image --png > ls-output.png

# Convert a file
ansi-to-image --input session.ansi --svg > session.svg

# Use a theme
ansi-to-image --input output.ansi --theme dracula --png > output.png

# Convert asciicast to PNG (final frame)
ansi-to-image --input demo.cast --png > demo-screenshot.png

# HTML output
ansi-to-image --input output.ansi --html > terminal.html

# Custom title and no window chrome
ansi-to-image --input out.ansi --title "My App" --no-chrome --svg

# High-DPI output
ansi-to-image --input out.ansi --scale 3 --png > retina.png
```

---

## Library API

```typescript
import { ansiToSvg, ansiToPng, ansiToHtml } from 'ansi-to-image';

const svg = ansiToSvg('\x1b[32mHello\x1b[0m World', {
  theme: 'dracula',
  windowChrome: true,
  title: 'Terminal',
});

const png = await ansiToPng(ansiString, { scale: 2, theme: 'nord' });
```

---

*Branch: `foundation/op-blueprint` | Parent repo: FoundationOperations/openclaude*
