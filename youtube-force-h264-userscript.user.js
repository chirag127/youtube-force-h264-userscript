// ==UserScript==
// @name         YouTube Force H.264
// @namespace    https://github.com/chirag127
// @version      1.0.0
// @description  Forces YouTube to serve H.264 (AVC) instead of VP9/AV1 by hiding non-H.264 codec support from the player. No extension, no GPU needed — works in headless VMs.
// @author       chirag127
// @license      MIT
// @match        https://www.youtube.com/*
// @match        https://m.youtube.com/*
// @icon         data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ctext y='20' font-size='20'%3E%F0%9F%93%B4%3C/text%3E%3C/svg%3E
// @homepageURL  https://github.com/chirag127/youtube-force-h264-userscript
// @supportURL   https://github.com/chirag127/youtube-force-h264-userscript/issues
// @downloadURL  https://github.com/chirag127/youtube-force-h264-userscript/raw/main/youtube-force-h264-userscript.user.js
// @updateURL    https://github.com/chirag127/youtube-force-h264-userscript/raw/main/youtube-force-h264-userscript.user.js
// @grant        none
// @noframes
// @run-at       document-start
// ==/UserScript==

(function () {
  "use strict";

  /* ------------------------------------------------------------------ *
   * YouTube's HTML5 player picks VP9/AV1 by default because those
   * codecs advertise themselves as supported via MediaSource,
   * canPlayType, and MediaCapabilities. This script hides that
   * support so the player falls back to H.264 (avc1), which every
   * software decoder can play — including VMs with no GPU.
   * ------------------------------------------------------------------ */

  // vp8 / vp9 / vp09 / av01 / opus are the codecs we hide. avc1 (H.264)
  // and mp4a (AAC) are left alone so the player has something to use.
  const BLOCKED = /(?:vp\d|av01|av1|opus)/i;

  function isBlocked(type) {
    return typeof type === "string" && BLOCKED.test(type);
  }

  function patch(target, name, original) {
    try {
      target[name] = function (...args) {
        if (args.length && isBlocked(String(args[0]))) {
          return name === "isTypeSupported" ? false : "";
        }
        return original.apply(this, args);
      };
      return true;
    } catch (e) {
      console.warn("[yt-force-h264] could not patch " + name, e);
      return false;
    }
  }

  function apply() {
    let patched = 0;

    // 1. MediaSource.isTypeSupported — MSE codec advertisement
    if (window.MediaSource) {
      const orig = window.MediaSource.isTypeSupported;
      if (patch(window.MediaSource, "isTypeSupported", orig)) patched++;
    }

    // 2. HTMLMediaElement.prototype.canPlayType — <video>/<audio> probe
    if (window.HTMLMediaElement) {
      const orig = window.HTMLMediaElement.prototype.canPlayType;
      if (patch(window.HTMLMediaElement.prototype, "canPlayType", orig)) patched++;
    }

    // 3. MediaCapabilities.decodingInfo — modern capability query
    if (window.MediaCapabilities && window.MediaCapabilities.prototype.decodingInfo) {
      const orig = window.MediaCapabilities.prototype.decodingInfo;
      try {
        window.MediaCapabilities.prototype.decodingInfo = async function (cfg) {
          if (cfg && cfg.video && isBlocked(String(cfg.video.codec || ""))) {
            return { supported: false, smooth: false, powerEfficient: false };
          }
          return orig.call(this, cfg);
        };
        patched++;
      } catch (e) {
        console.warn("[yt-force-h264] could not patch decodingInfo", e);
      }
    }

    console.log("[yt-force-h264] patched " + patched + " codec-surface(s) — YouTube will now prefer H.264.");
  }

  // MediaSource / HTMLMediaElement are web-platform built-ins and exist at
  // document-start; guard anyway in case the page defers them.
  let attempts = 0;
  function boot() {
    const ready = !!(window.MediaSource || window.HTMLMediaElement);
    if (ready || attempts++ > 10) {
      apply();
      return;
    }
    setTimeout(boot, 100);
  }

  boot();
})();
