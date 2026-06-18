# Changelog

### 2.0.0

**🎉 Released:**
- TBD

**✨ Features:**
- Ephemeral browser sessions — chart work lives in this tab while you work; refreshing the page always starts fresh (export PNG to keep a visual copy).
- Graha right-click menu with **Edit Graha** and **Delete Graha** (same editing panel as double-click).
- Chart-type-specific house menus — **South Indian**: **Set as Lagna**; **North Indian**: **Set as First House**.
- **Clear House** removes all Grahas from the selected bhava.

**🔧 Improvements:**
- Retrograde Grahas are shown with **underlined text** instead of a Unicode subscript character (`ᵣ`).
- The retrograde toggle applies underline styling directly, without appending extra characters to the Graha label.
- The 8-character Graha name limit applies only to the label text; retrograde no longer uses a character slot.
- South Indian house menu header shows **House** numbering from the current Lagna position (fixed Rashi grid, rotating house count).
- Removed **Set as Lagna** from the South Indian chart-level context menu; North Indian **Set Lagna as…** (zodiac) remains on chart right-click.
- Updated Help modal, Welcome modal, and README for accurate North Indian Lagna instructions and browser-session guidance.
- Self-hosted pinned vendor bundles for Konva (9.3.20) and Lucide (0.468.0), removing unpinned unpkg CDN dependencies for core scripts.
- Added `citranaDebug()` for contributor trace logging (enabled by default; opt out via `localStorage.citrana_debug = '0'`).
- Removed unused legacy code (`setFirstHouse`, Graha library drop-zone scaffolding, localStorage chart auto-save).
- Removed unused `#canvas` markup and dead `.zoom-control-btn` CSS; added `rel="noopener noreferrer"` to external links.
- iOS standalone PWA layout respects safe areas (Dynamic Island, home indicator) with `viewport-fit=cover` and tuned floating UI positioning on mobile and desktop.
- PWA manifest uses `display: standalone` for home-screen install.
- Canvas resize uses `visualViewport` on supported browsers for more reliable mobile layout.

**🐛 Bug Fixes:**
- Fixed Graha and bhava right-click menus being overridden by the main chart context menu.
- Fixed dead context menu code that prevented **Edit Graha** and **Delete Graha** from running.
- Fixed **Set as First House** on North Indian charts so the Rashi in the clicked house becomes Lagna (e.g. selecting Cancer correctly sets Cancer Ascendant).
- Fixed Graha library drop targeting so Grahas land in the house under the pointer instead of always defaulting to house 1.
- Fixed mobile long-press opening the chart menu instead of the house menu (**Set as Lagna**, **Set as First House**, **Clear House**).
- Fixed zoom bar percentage not updating on zoom in, zoom out, or reset.
- Fixed South Indian **Reset Zoom** returning to the wrong scale after manual zoom (fit level now matches the initial chart view).
- Fixed iOS PWA bottom controls (zoom bar, Help, About, Graha Library) sitting too high above the home indicator.

---

### 1.0.0

**🎉 Released:**
- 9th August 2025

This is the first public release of **Citrana**!
