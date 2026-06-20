# Changelog

### 2.0.0

**🎉 Released:**
- TBD

**✨ Features:**
- **Richer colour controls** — when editing a Graha or a drawing, pick from a **16-colour** rainbow palette, adjust **transparency**, or use the eyedropper. The same swatches appear in the Graha bar and the drawing Edit UI; the toolbar shows a compact colour chip instead of a hex code.
- **Improved arrows** — arrow shaft and head render as one shape, with a straight (non-tapering) body and a clearer triangular head. Transparency applies evenly across the whole arrow.
- **Fresh start on refresh** — your chart lives in this browser tab while you work. Reloading the page always begins with a blank canvas. Export a PNG when you want to keep a copy.
- **Undo and redo** — step backward and forward through chart, Graha, and drawing changes (up to 50 steps). Use the toolbar buttons or **Ctrl+Z** / **Ctrl+Y** (and **Ctrl+Shift+Z** / **Cmd+Shift+Z** on Mac). Covers Graha placement and edits, Lagna, chart resets, annotations, and Edit UI sessions. Zoom, pan, and tool selection are not tracked.
- **Edit or delete Grahas from the menu** — right-click any Graha for **Edit Graha** or **Delete Graha** (same editor as double-click).
- **Clearer Lagna setup** by chart type:
  - **South Indian** — right-click a Bhava and choose **Set as Lagna**.
  - **North Indian** — use **Set Lagna as…** on the chart menu (pick the Rashi), or **Set as First Bhava** on a Bhava menu.
- **Clear Bhava** removes every Graha from the Bhava you selected.
- **Zoom lock** — on by default so scroll-wheel zoom does not catch you by surprise. Click the lock icon to zoom freely; **Reset Zoom** always works.
- **Chart display options** — open **Options** (gear icon in the toolbar) to hide chart indicators per layout (North: bhava numbers in black corner boxes; South: lagna line, yellow bhava numbers, black rashi numbers), or enable **Save Chart Only** so the same Save button exports only the chart area — fits the chart, ignores zoom/pan, includes Grahas and on-chart annotations, leaves out anything outside the chart boundary, uses a transparent background, and omits the watermark. Preferences are saved in this browser and apply immediately; they are not tracked by undo/redo.
- **Upagrahas in Graha Library** — Page 5 adds nine Upagrahas (Dhuma, Vyatipata, Parivesha, Indra Chapa, Upaketu, Kala, Mrityu, Ardha Prahara, Yama Ghantaka) before Uranus, Neptune, and Pluto — **60 Grahas** in total across five pages (12 per page).
- **Laser Pointer** — draw a temporary red highlight over the chart for presentations (toolbar after Pen, shortcut **K**). The trail fades away over a few seconds; it is not saved, exported, or included in undo/redo. Hidden in the mobile toolbar layout.

**🔧 Improvements:**
- Retrograde Grahas use **underlined text** instead of a small ᵣ character, so your 8-character Graha labels are not shortened.
- South Indian Bhava menus show **Bhava** numbers based on where Lagna is set.
- Help, Welcome, and README updated for the new Lagna flows, session behaviour, zoom lock, undo/redo, chart display options, Upagrahas on Page 5, Laser Pointer, and drawing stroke defaults.
- Drawing and icon libraries now ship with the app for faster, more reliable loading.
- Tidied unused code from older versions, including automatic chart restore on refresh.
- README aligned with in-app Help for **Delete** key routing (Graha first, then drawing), auto-switch to Select after arrow/line/text/heading, and one-shot bhava drop targeting.
- Better layout when Citrana is opened from your iPhone home screen — floating controls sit correctly around the notch and home bar.
- Browser chrome aligned to the white UI theme.
- Documentation refreshed for contributors and AI assistants.
- **Colour picker polish** — cleaner chips in the Edit UI and Graha bar; a simpler picker dialog without format labels; semi-transparent colours look consistent on arrows and Graha labels.
- **Smoother pen strokes** — freehand curves look less jagged and more natural when you draw with the Pen tool.
- **Drawing stroke defaults** — Pen starts at 3px; Arrow and Line start at 4px.
- Consistent use of **Bhava**, **Graha**, and **Rashi** across the app and documentation.

**🐛 Bug Fixes:**
- Fixed undo not covering some edits — centre label text, text and heading content, element drags, and arrow/line control-point adjustments now step correctly.
- Fixed chart reset leaving stale drop targets or the Edit UI open after **Reset Chart**, **Reset Drawings**, or **Clear Canvas**.
- Fixed Graha and Bhava menus sometimes opening the wrong chart menu, which blocked **Edit Graha** and **Delete Graha**.
- Fixed **Set as First Bhava** on North Indian charts so the Rashi in the clicked Bhava becomes Lagna (for example, choosing Cancer correctly sets Cancer Ascendant).
- Fixed Grahas always landing in Bhava 1 when dragged from the library — they now drop into the Bhava under your pointer.
- Fixed dragging a placed Graha to another Bhava while zoomed or panned — moves now target the Bhava under your pointer instead of snapping to the wrong Bhava.
- Fixed long-press on mobile opening the chart menu instead of the Bhava menu (**Set as Lagna**, **Set as First Bhava**, **Clear Bhava**).
- Fixed the zoom percentage not updating when you zoom in, zoom out, or reset.
- Fixed South Indian **Reset Zoom** jumping to the wrong size after manual zoom — it now returns to the same fit as when the chart first appeared.
- Fixed bottom controls sitting too high on iPhone when the app is installed to the home screen.
- Fixed desktop zoom bar and About button sitting too low after the iPhone layout improvements.
- Fixed heading annotations not showing the correct Edit UI when selected with the Select tool.
- Fixed touch drawing stacking duplicate tap handlers while drawing arrows, lines, or pen strokes.
- Fixed **Delete** key — removes the selected Graha first, then the selected drawing when the Select tool is active (no duplicate per-chart listeners).
- Fixed library drops still targeting a previously clicked Bhava after that drop — selected bhava is now one-shot (cleared after drop or when you click empty canvas).
- Fixed semi-transparent arrows looking like two separate pieces (line and head) — they now fade as one arrow.

---

### 1.0.0

**🎉 Released:**
- 9th August 2025

This is the first public release of **Citrana**!
