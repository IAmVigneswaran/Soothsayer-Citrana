# Changelog

### 2.0.0

**🎉 Released:**
- TBD

**✨ Features:**
- **Fresh start on refresh** — your chart lives in this browser tab while you work. Reloading the page always begins with a blank canvas. Export a PNG when you want to keep a copy.
- **Undo and redo** — step backward and forward through chart, Graha, and drawing changes (up to 50 steps). Use the toolbar buttons or **Ctrl+Z** / **Ctrl+Y** (and **Ctrl+Shift+Z** / **Cmd+Shift+Z** on Mac). Covers Graha placement and edits, Lagna, chart resets, annotations, and Edit UI sessions. Zoom, pan, and tool selection are not tracked.
- **Edit or delete Grahas from the menu** — right-click any Graha for **Edit Graha** or **Delete Graha** (same editor as double-click).
- **Clearer Lagna setup** by chart type:
  - **South Indian** — right-click a house and choose **Set as Lagna**.
  - **North Indian** — use **Set Lagna as…** on the chart menu (pick the zodiac sign), or **Set as First House** on a house menu.
- **Clear House** removes every Graha from the house you selected.
- **Zoom lock** — on by default so scroll-wheel zoom does not catch you by surprise. Click the lock icon to zoom freely; **Reset Zoom** always works.

**🔧 Improvements:**
- Retrograde Grahas use **underlined text** instead of a small ᵣ character, so your 8-character Graha labels are not shortened.
- South Indian house menus show **House** numbers based on where Lagna is set.
- Help, Welcome, and README updated for the new Lagna flows, session behaviour, zoom lock, and undo/redo.
- Drawing and icon libraries now ship with the app for faster, more reliable loading.
- Tidied unused code from older versions, including automatic chart restore on refresh and deprecated history helpers.
- Further removed dead code — unused accessors, duplicate app-level selection state, orphan modal CSS, and unused chart-coordinator wrappers (no change to how the app behaves).
- README aligned with in-app Help for **Delete** key routing (Graha first, then drawing), auto-switch to Select after arrow/line/text/heading, and one-shot bhava drop targeting.
- Better layout when Citrana is opened from your iPhone home screen — floating controls sit correctly around the notch and home bar.
- Browser chrome (`theme-color`, tile colour) aligned to the white UI theme.
- Agent & AI Docs (`AGENT.md`, `ARCHITECTURE.md`, `.cursorrules`) refreshed to match current behaviour, module line counts, and deploy workflow (`.github/workflows/static.yml` only).

**🐛 Bug Fixes:**
- Fixed undo not covering some edits — centre label text, text and heading content, element drags, and arrow/line control-point adjustments now step correctly.
- Fixed chart reset leaving stale drop targets or the Edit UI open after **Reset Chart**, **Reset Drawings**, or **Clear Canvas**.
- Fixed Graha and house menus sometimes opening the wrong chart menu, which blocked **Edit Graha** and **Delete Graha**.
- Fixed **Set as First House** on North Indian charts so the sign in the clicked house becomes Lagna (for example, choosing Cancer correctly sets Cancer Ascendant).
- Fixed Grahas always landing in house 1 when dragged from the library — they now drop into the house under your pointer.
- Fixed dragging a placed Graha to another house while zoomed or panned — moves now target the house under your pointer instead of snapping to the wrong bhava.
- Fixed long-press on mobile opening the chart menu instead of the house menu (**Set as Lagna**, **Set as First House**, **Clear House**).
- Fixed the zoom percentage not updating when you zoom in, zoom out, or reset.
- Fixed South Indian **Reset Zoom** jumping to the wrong size after manual zoom — it now returns to the same fit as when the chart first appeared.
- Fixed bottom controls sitting too high on iPhone when the app is installed to the home screen.
- Fixed desktop zoom bar and About button sitting too low after the iPhone layout improvements.
- Fixed heading annotations not showing the correct Edit UI when selected with the Select tool.
- Fixed touch drawing stacking duplicate tap handlers while drawing arrows, lines, or pen strokes.
- Fixed **Delete** key — removes the selected Graha first, then the selected drawing when the Select tool is active (no duplicate per-chart listeners).
- Fixed library drops still targeting a previously clicked house after that drop — selected bhava is now one-shot (cleared after drop or when you click empty canvas).
- Fixed North Indian undo restore adding an extra **Set Lagna** step or leaving Grahas misaligned after Lagna restore.

---

### 1.0.0

**🎉 Released:**
- 9th August 2025

This is the first public release of **Citrana**!
