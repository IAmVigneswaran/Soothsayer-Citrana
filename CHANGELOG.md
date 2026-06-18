# Changelog

### 2.0.0

**🎉 Released:**
- TBD

**✨ Features:**
- Ephemeral browser sessions — chart work lives in this tab while you work; refreshing the page always starts fresh (export PNG to keep a visual copy).
- Graha right-click menu with **Edit Graha** and **Delete Graha** (same editing panel as double-click).
- Chart-type-specific Lagna workflows:
  - **South Indian** — house menu: **Set as Lagna**; chart menu: no Lagna option (house-only).
  - **North Indian** — chart menu: **Set Lagna as…** (zodiac sign); house menu: **Set as First House**.
- **Clear House** removes all Grahas from the selected bhava.

**🔧 Improvements:**
- Retrograde Grahas use **underlined text** instead of a Unicode subscript (`ᵣ`); the toggle styles the label only and no longer consumes a character from the 8-character Graha name limit.
- South Indian house menu header shows **House** numbering from the current Lagna position (fixed Rashi grid, rotating house count).
- Updated Help modal, Welcome modal, and README for North Indian Lagna instructions and ephemeral-session guidance.
- Self-hosted pinned vendor bundles for Konva (9.3.20) and Lucide (0.468.0), removing unpinned unpkg CDN dependencies for core scripts.
- Added `citranaDebug()` for contributor trace logging (enabled by default; opt out via `localStorage.citrana_debug = '0'`).
- Removed unused legacy code (`setFirstHouse`, Graha library drop-zone scaffolding, localStorage chart auto-save, dead `set-lagna` fallback).
- Removed unused `#canvas` markup and dead `.zoom-control-btn` CSS; added `rel="noopener noreferrer"` to external links.
- iOS standalone PWA layout respects safe areas (Dynamic Island, home indicator) with `viewport-fit=cover`, `display: standalone` in the manifest, `visualViewport`-aware canvas resize, and tuned floating UI positioning on mobile and desktop.

**🐛 Bug Fixes:**
- Fixed Graha and bhava context menus being overridden by the main chart menu, including dead code that blocked **Edit Graha** and **Delete Graha**.
- Fixed **Set as First House** on North Indian charts so the Rashi in the clicked house becomes Lagna (e.g. selecting Cancer correctly sets Cancer Ascendant).
- Fixed Graha library drop targeting so Grahas land in the house under the pointer instead of always defaulting to house 1.
- Fixed mobile long-press opening the chart menu instead of the house menu (**Set as Lagna**, **Set as First House**, **Clear House**).
- Fixed zoom bar percentage not updating on zoom in, zoom out, or reset.
- Fixed South Indian **Reset Zoom** returning to the wrong scale after manual zoom (fit level now matches the initial chart view).
- Fixed iOS PWA bottom controls (zoom bar, Help, About, Graha Library) sitting too high above the home indicator.
- Fixed desktop zoom bar and About button bottom inset after iOS safe-area layout changes.

---

### 1.0.0

**🎉 Released:**
- 9th August 2025

This is the first public release of **Citrana**!
