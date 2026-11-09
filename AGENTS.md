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
## 📚 Documentation lives in ONE place (mandatory)

All documentation for every repository in this workspace is **single-sourced** in the
umbrella repository:

```
c:\ws\docs\okf├── bundle.md            collection overview
├── index.md             catalogue of every concept and script note
├── concepts/            shared knowledge (architecture, testing, metadata, …)
└── scripts/             one note per userscript repository
```

### Rules

1. **Never create an `okf/` folder in this repository.** It is not duplicated here, by
   design. There was once a copy in every repo: 278 files describing 42 unique documents,
   with `concepts/architecture.md` physically present 32 times. Every edit had to be
   propagated to 30 repositories and drift was unavoidable.
2. **Never hand-edit a copy.** There are no copies. Edit the canonical file under
   `c:\ws\docs\okf\`.
3. **This repository's note is** `c:\ws\docs\okf\scripts\<repo-name>.md`. If it does not
   exist, add it before adding the script.
4. **Link, do not paste.** In `README.md`, link to the canonical note with a relative path
   from the workspace, e.g. `[documentation](../../../../../docs/okf/scripts/<repo-name>.md)`.
5. **Verify** with `node c:\ws\scripts\check-okf.mjs` — it exits `0` only when nothing is
   duplicated and every repository is linked and documented.
6. When adding a new script: create the repo, add `docs/okf/scripts/<repo-name>.md`, add it
   to the tables in `docs/okf/bundle.md` and `docs/okf/index.md`, then run the checker.

Full detail: `c:\ws\docs\okf\concepts\okf-requirement.md`.
