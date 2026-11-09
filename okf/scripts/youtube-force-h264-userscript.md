---
type: Script
title: YouTube Force H.264
description: Forces YouTube to serve H.264 (AVC) instead of VP9/AV1 by hiding non-H.264 codec support from the browser media APIs. Works in VMs with no GPU.
repo: https://github.com/chirag127/youtube-force-h264-userscript
install: https://github.com/chirag127/youtube-force-h264-userscript/raw/main/youtube-force-h264-userscript.user.js
version: "1.0.0"
tags: [userscript, youtube, h264, codec, vp9, av1, vm, no-gpu]
timestamp: 2026-11-09T00:00:00Z
---

# YouTube Force H.264

Forces YouTube's HTML5 player to select H.264 (AVC) instead of VP9 / AV1 by hiding
non-H.264 codec support from `MediaSource.isTypeSupported`, `canPlayType`, and
`MediaCapabilities.decodingInfo`. No extension, no server, no GPU.

## Method

| Surface | What is patched |
|---------|-----------------|
| `MediaSource.isTypeSupported()` | Returns `false` for vp8 / vp9 / vp09 / av01 / av1 / opus |
| `HTMLMediaElement.prototype.canPlayType()` | Returns `""` (unsupported) for those codecs |
| `MediaCapabilities.prototype.decodingInfo()` | Returns `{supported: false}` for those codecs |

The player then falls back to `avc1` (H.264) + `mp4a` (AAC), decoded in software by the CPU.
`@grant none`, runs at `document-start`, silent background patch (no UI, no hotkeys).

## Why

In a VM with no GPU (or a limited virtual GPU), VP9/AV1 hardware decode is unavailable.
H.264 is universally supported and decodes fine in software on the CPU, so forcing it makes
YouTube playable where VP9/AV1 would stutter or show static.

## Limitations

- YouTube may add new codec-detection surfaces in future updates; patch them here if that happens.
- Forces H.264 on every YouTube page while enabled.

## Risk

Read-only and local. Does not proxy requests or modify page DOM beyond patching built-in media APIs.
