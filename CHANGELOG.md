# Changelog

All notable user-facing changes to Citrana are documented here.

---

## 2.0.0

**Released:** TBD

Citrana 2.0 is a major update focused on chart workflow, Annotations, sessions, and a clearer experience on desktop and touch devices. Highlights include **Save Session**, undo/redo, the **Canvas Items** panel, **Presentation View**, and an expanded Graha library with Upagrahas.

### Charts and Grahas

- **Clearer Lagna setup** — South Indian: **Set as Lagna** on a Bhava. North Indian: **Set as First Bhava** or **Set Lagna as …** from the chart menu (same flyout on desktop and touch)
- **Bhava numbering** — South Indian menus and Canvas Items show Bhava numbers relative to Lagna
- **Clear Bhava** — remove every Graha from the Bhava you selected
- **60 Grahas** — Page 5 of the Graha Library adds nine Upagrahas before Uranus, Neptune, and Pluto
- **Edit or delete from the menu** — right-click any Graha for **Edit Graha** or **Delete Graha**
- **Retrograde Grahas** — shown with underlined text (no shortened labels)
- **Selection Pill** — a dashed highlight behind selected Grahas and Annotations so coloured labels stay readable
- **Graha Library shortcuts** — press **1**–**5** to switch library pages
- **Rashi icons** — zodiac icons in **Set Lagna as …** menus and South Indian Bhava rows in Canvas Items

### Annotations

- **Richer colour controls** — 16-colour palette, transparency, and eyedropper when editing Grahas or Annotations
- **Improved arrows** — unified shaft and head with even transparency
- **Natural pen strokes** — velocity-based taper for a more handwritten feel (saved in session files)
- **Select and move pen strokes** — use the Select tool to reposition pen Annotations
- **Multi-line text and headings** — **Shift+Enter** for a new line, **Enter** to finish
- **Hand-written style** — optional **Caveat** script for text and headings, with **Normal** and **Hand-written** toggles; bold uses **Caveat Brush** for natural weight
- **Text and heading styles** — bold, italic, alignment, and font mode stay in sync with the canvas
- **Arrow and line control points** — draggable endpoints on desktop with clear hover feedback
- **Laser Pointer** (**K**) — temporary highlight for presentations; not saved or undoable
- **Stroke defaults** — Pen, Arrow, and Line start at 4px

### Sessions, export, and options

- **Save and Open Session** — download or restore a `.citrana.json` working file (chart, Grahas, Annotations, and Options); save to any cloud storage and open on another device to resume where you left off
- **Fresh start on refresh** — each visit begins with a blank canvas unless you open a session
- **Options** (gear icon in the toolbar):
  - **Zoom Step** — **Fine (1%)** default, plus Small, Medium, and Large steps for zoom buttons, keyboard **+**/**−**, and scroll wheel
  - Hide North or South chart indicators
  - **Save Chart Only** — export only the chart area (fitted, transparent, no watermark)
- **Zoom lock** — on by default; unlock from the zoom bar when you need to zoom freely. **Reset Zoom** always works

### Canvas Items and presentation

- **Canvas Items** (**I**) — one panel for chart actions, Bhavas, Grahas, Annotations, and canvas controls on desktop and touch
  - **Section Anchors** jump between sections while the header stays fixed
  - Under the **Canvas** section: **Clear Selection**, **Context Menu** on/off, and **Graha Library** on/off (green/red row tint)
  - Text and Heading rows offer separate **Edit text** and **Style** actions
- **Presentation View** — hide toolbar, zoom bar, Graha library, Help, and About for a clean on-screen chart
- **Graha Library visibility** — show or hide the library under Canvas Items (separate from Presentation View)
- **Context Menu on touch** — off by default on touch devices; enable under Canvas Items in the **Canvas** section
- **Graha Library paging** — swipe the dots bar on mobile (chevron hints; dots remain tappable)
- **Mobile toolbar** — Arrow, Line, Pen, and Laser Pointer on narrow screens; chevron scroll on the toolbar and Edit UI when controls overflow
- **Mobile layout** — improved spacing for iPhone home-screen install (notch and home bar); clearer default zoom on compact viewports

### Undo and redo

- Up to **50 steps** via toolbar buttons or **Ctrl+Z** / **Cmd+Z** and **Ctrl+Y** / **Cmd+Shift+Z**
- Tracks chart changes, Graha placement and edits, Lagna, resets, and Annotation edits
- Does not track zoom, pan, tool selection, laser pointer strokes, or Presentation View

### Accessibility

- Modals support screen readers, **Escape** to close, and **Tab** focus trapping
- Chart canvas and overlays use clearer roles and labels

### Bug fixes

**Chart and Graha placement**

- Grahas now drop into the Bhava under your pointer, not always Bhava 1
- Dragging a placed Graha while zoomed or panned targets the correct Bhava
- **Set as First Bhava** on North Indian charts sets the correct Lagna Rashi
- One-shot Bhava targeting for library drops clears correctly after tap on empty canvas

**Menus and touch**

- Long-press on mobile opens the Bhava menu, not the chart menu
- Graha and Bhava menus no longer open the wrong chart menu
- North Indian **Set Lagna as …** submenu works in Firefox
- Keyboard shortcuts no longer fire behind open dialogs

**Zoom, layout, and editing**

- Zoom percentage updates correctly when zooming or resetting
- **Reset Zoom** returns to the correct fit for each chart type
- Chart reset clears stale drop targets and closes the Edit UI
- Heading Annotations show the correct Edit UI when selected
- **Delete** removes the selected Graha first, then the selected Annotation
- Safari toolbar no longer drifts on resize; iPhone and desktop chrome positions corrected
- Welcome loading animation stops when the modal is closed early
- Touch drawing no longer stacks duplicate tap handlers

---

## 1.0.0

**Released:** 9 August 2025

First public release of **Citrana**.
