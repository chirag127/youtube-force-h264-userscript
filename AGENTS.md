# AGENTS.md - youtube-force-h264-userscript

Single-file userscript. `youtube-force-h264-userscript.user.js` at repo root IS the product. No build, no deps, `@grant none`.

## Method (best method - do not revert to UI clicking)

YouTube's HTML5 player picks codecs by querying:
1. `MediaSource.isTypeSupported()` — MSE codec advertisement
2. `HTMLMediaElement.prototype.canPlayType()` — `<video>`/`<audio>` probe
3. `MediaCapabilities.prototype.decodingInfo()` — modern capability query

This script overrides all three to report VP9/AV1/VP8/Opus as unsupported. The player then falls back to H.264 (avc1) + AAC (mp4a), which decode in software on the CPU — no GPU required.

Blocked codecs: vp8, vp9, vp09, av01, av1, opus.
Allowed codecs: avc1 (H.264), mp4a (AAC).

## Rules

- One file, zero deps, `@grant none`. Runs at `document-start` so the override is in place before the player initialises.
- Broad `@match https://www.youtube.com/*` — intentional; this is a general YouTube codec tool.
- No hotkeys, no UI panel — silent background patch.
- If YouTube changes its codec-detection surface, add it here and bump `@version`.

## Install docs

Shared guide: https://github.com/chirag127/userscript-install-guide — link it, never duplicate install steps.

## Test

`sctl install ./youtube-force-h264-userscript.user.js`, open YouTube, open DevTools console, look for `[yt-force-h264] patched N codec-surface(s)`. Then play a video and check **Stats for nerds** — `codecs:` should show `avc1`, not `vp09`/`av01`.

<!-- okf-requirement -->
## 🧠 OKF documentation requirement (mandatory)

**Every repository in this collection MUST ship an Open Knowledge Format (OKF) bundle in `okf/`.**

A repository without `okf/` is **incomplete**, even if the script works.

### What must exist

```
okf/
├── bundle.md      overview of the collection
├── index.md       catalogue of concepts
├── concepts/      all shared concept notes (architecture, metadata, scriptcat-and-sctl,
│                  testing, youtube-dom, okf-requirement)
└── scripts/       THIS repository's own script note (where one applies)
```

### Rules

1. **Never hand-edit** a repository's `okf/` copy. The canonical bundle is
   `repos/own/public/userscripts/okf/` in the `c:\ws` monorepo.
2. After changing the canonical bundle, regenerate every copy:
   `node okf/sync-okf.mjs`
3. Verify nothing has drifted: `node okf/sync-okf.mjs --check` - must exit `0`.
4. `README.md` must link to `okf/`. `AGENTS.md` (this file) must restate this requirement.
5. When adding a new script, add its note at `okf/scripts/<repo-name>.md` in the canonical
   bundle first, then sync.
6. Record durable knowledge here as a concept note: fragile selectors, platform rules,
   rejected alternatives, and mistakes that already cost time.

Full detail: [`okf/concepts/okf-requirement.md`](okf/concepts/okf-requirement.md)
