# 🎞️ YouTube Force H.264

Forces YouTube to play videos in **H.264 (AVC)** instead of VP9 / AV1 — no extension, no server, no GPU required. Ideal for virtual machines and headless systems that only have software video decoding.

## Why this exists

YouTube's HTML5 player prefers VP9 and AV1 because those codecs report themselves as "supported" through the browser's media APIs. In a VM with no GPU (or a limited virtual GPU), VP9/AV1 hardware decode is unavailable and software decode is slow or broken, so the video player shows static, stutters, or fails entirely.

H.264 is universally supported and decodes fine in software on the CPU. This script makes YouTube believe VP9/AV1/VP8/Opus are **not** supported, so the player selects H.264 + AAC instead.

## Install

First read the shared **[userscript install guide](https://github.com/chirag127/userscript-install-guide)** (how to set up ScriptCat / Tampermonkey). Then click:

**[Install youtube-force-h264-userscript.user.js](https://github.com/chirag127/youtube-force-h264-userscript/raw/main/youtube-force-h264-userscript.user.js)**

## How it works

The script patches three browser media APIs at `document-start` (before YouTube's player initialises):

| API | What it does |
|-----|--------------|
| `MediaSource.isTypeSupported()` | Returns `false` for VP9/AV1/VP8/Opus |
| `HTMLMediaElement.prototype.canPlayType()` | Returns `""` (unsupported) for those codecs |
| `MediaCapabilities.prototype.decodingInfo()` | Returns `{supported: false}` for those codecs |

With those hidden, YouTube's adaptive-format picker falls back to `avc1` (H.264) and `mp4a` (AAC). No page elements are touched, no requests are proxied, and nothing is sent anywhere.

## Verify it's working

1. Install the script and open YouTube.
2. Open DevTools → Console — you should see:
   `[yt-force-h264] patched N codec-surface(s) — YouTube will now prefer H.264.`
3. Play a video, right-click the player → **Stats for nerds**.
4. The `codecs:` line should read `avc1.42E01E` / `mp4a.40.2` (H.264), **not** `vp09` or `av01`.

## Limitations

- YouTube may experiment with new codec-detection surfaces. If a future update starts serving VP9/AV1 again, open an issue and the script can be updated.
- This forces H.264 on every YouTube page you visit while the script is enabled. Disable or uninstall the script if you want VP9/AV1 back.

## License

[MIT](LICENSE) © 2026 chirag127

<!-- docs-single-source -->
## 📚 Documentation

Documentation for this repository lives in the umbrella workspace, in exactly **one** place:

| What | Where |
|------|-------|
| This script's note | [`docs/okf/scripts/youtube-force-h264-userscript.md`](../../../../../docs/okf/scripts/youtube-force-h264-userscript.md) |
| All notes, catalogued | [`docs/okf/index.md`](../../../../../docs/okf/index.md) |
| Shared knowledge | [`docs/okf/concepts/`](../../../../../docs/okf/concepts/) |

It is **not** copied into this repository. Nothing in this workspace is duplicated: one
document, one file. Verify with `node c:\ws\scripts\check-okf.mjs`.
