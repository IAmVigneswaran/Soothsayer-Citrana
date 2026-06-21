# Citrana Architecture

This document describes how Citrana is structured at a system level: runtime composition, module boundaries, data flows, and safe extension points. For feature-level documentation and usage guidance, see [AGENT.md](AGENT.md) and [README.md](README.md).


## Terminology

User-facing copy and docs use **Bhava**, **Graha**, and **Rashi** (with correct capitalisation and plurals). Legacy identifiers in source (`house`, `planet` in filenames, methods, Konva node names, and serialised keys) remain for compatibility.

## Design Principles

- **Browser-only**: No build step, no server runtime. Open `index.html` or deploy static files to GitHub Pages.
- **Canvas-first**: Chart layout, Grahas, and drawings live on a single Konva.js stage/layer.
- **Floating DOM UI**: Toolbars, modals, Graha library, and edit panels are HTML/CSS overlays; the canvas handles chart interaction.
- **Global coordinator**: `window.app` (`CitranaApp`) is the integration hub. Modules reference it for cross-cutting actions.
- **Template delegation**: South and North Indian charts are separate classes; `ChartCoordinator` routes by `currentChartType`.

## Runtime Composition

```
index.html  (viewport-fit=cover; Konva + colorpicker CSS in <head>)
  ├── assets/vendor/konva.min.js        (Konva 9.3.20)
  ├── assets/vendor/lucide.min.js       (Lucide 0.468.0)
  ├── assets/vendor/colorpicker.min.css (JSColorPicker 1.1.0)
  ├── assets/vendor/colorpicker.iife.min.js (JSColorPicker 1.1.0)
  ├── citrana-debug.js                  → window.citranaDebug (on by default)
  ├── citrana-device.js                 → CitranaDevice (touch, mobile UA, viewport)
  ├── citrana-rashis.js                 → CitranaRashis (Rashi names, symbols, grid numbers)
  ├── citrana-graha-selection.js        → CitranaGrahaSelection (Graha Selection Pill)
  ├── chart-templates-south.js          → SouthIndianChartTemplate
  ├── chart-templates-north.js          → NorthIndianChartTemplate
  ├── chart-coordinator.js              → ChartCoordinator
  ├── planet-system.js                  → GrahaSystem (`PlanetSystem` class)
  ├── citrana-arrow.js                  → CitranaArrow (unified filled arrows)
  ├── citrana-colorpicker.js            → CitranaColorPicker (JSColorPicker theme)
  ├── citrana-laser.js                  → CitranaLaser (ephemeral laser pointer overlay)
  ├── drawing-tools.js                  → DrawingTools (+ EditUI instance)
  ├── edit-ui.js                        → EditUI
  ├── context-menu.js                   → ContextMenu
  ├── citrana-items-menu.js             → CitranaItemsMenu (Items panel)
  ├── history.js                        → CitranaHistory (undo/redo timeline)
  ├── citrana-session.js                → CitranaSession (save/open `.citrana.json`)
  └── app.js                            → CitranaApp (window.app on DOMContentLoaded)
```

Script order matters: vendor libs first; `citrana-debug.js`, then `citrana-device.js` and `citrana-rashis.js` before `citrana-graha-selection.js` and chart templates; `citrana-arrow.js` before `citrana-colorpicker.js`; `citrana-laser.js` before `drawing-tools.js`; `context-menu.js` before `citrana-items-menu.js`; `history.js` and `citrana-session.js` immediately before `app.js`.

## High-Level Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        CitranaApp (app.js)                  │
│  Stage/Layer · Tools · Zoom · Export · Modals · Undo/Redo   │
│  getCanvasSelection() · clearCanvasSelection()              │
└────┬───────────────────────────────┬────────────────────────┘
     │                               │
┌────▼──────────┐              ┌─────▼──────────┐
│ CitranaHistory│              │  PlanetSystem  │
│  (history.js) │              └───────┬────────┘
└───────────────┘                      │ drag/drop
                             ┌────────▼─────────┐
                             │ ChartCoordinator │
                             │  + hit-test API  │
                             └────────┬─────────┘
                                      │
                    ┌─────────────────┴─────────────────┐
                    │                                   │
             ┌──────▼──────┐                     ┌──────▼──────┐
             │ SouthIndian │                     │ NorthIndian │
             │   Template  │                     │   Template  │
             └──────┬──────┘                     └──────┬──────┘
                    │                                   │
                    └─────────────────┬─────────────────┘
                                      │
                            ┌─────────▼─────────────┐
                            │ CitranaGrahaSelection │
                            │   (Selection Pill)    │
                            └───────────────────────┘

┌─────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│DrawingTools │  │ CitranaLaser │  │   EditUI     │  │ ContextMenu  │
│  (Konva)    │  │ (Canvas 2D)  │  │+ColorPicker  │  │ + menu toggle│
└──────┬──────┘  └──────────────┘  └──────────────┘  └──────┬───────┘
       └── CitranaArrow                                      │
                                                    ┌────────▼─────────┐
                                                    │ CitranaItemsMenu │
                                                    │ (row highlight)  │
                                                    └──────────────────┘

  CitranaSession · CitranaDevice · CitranaRashis · CitranaGrahaSelection · citranaDebug
```

`CitranaDevice` and `CitranaRashis` are used across `app.js`, chart templates, `drawing-tools.js`, `context-menu.js`, and `citrana-laser.js`. `CitranaGrahaSelection` is used by South/North templates on Graha select/drag. `app.getCanvasSelection()` / `notifyCanvasSelectionChanged()` keep the Items panel in sync. `CitranaHistory` is wired in `app.setupComponents()` for undo/redo snapshots.

## Module Responsibilities

| Module | Lines | Primary role |
|--------|-------|----------------|
| `app.js` | ~2020 | Application lifecycle, Konva stage, tool routing, keyboard shortcuts (**K** laser when available; centralised **Delete** for Grahas and drawings; **Escape** modal dismiss; **Tab** focus trap), zoom lock, export (full viewport or chart-only crop), modals (`openModal`/`closeModal`, `aria-hidden`, focus stack), chart display preferences, history coordinator, undo/redo toolbar, **Presentation View**, **Save/Open Session**, **Items** panel init, toolbar scroll; `clearCanvasSelection()`, `getCanvasSelection()`, `notifyCanvasSelectionChanged()`; `isModalBlockingShortcuts()` blocks shortcuts when modals open; `setupSafariToolbarFix()` via `visualViewport`; `serializeDrawings()` includes `arrowAnchors` for unified arrows |
| `history.js` | ~94 | Unified undo/redo timeline (`CitranaHistory`) |
| `chart-coordinator.js` | ~334 | Unified API over South/North templates; zoom (`zoomToFit` routes by `currentChartType`); chart serialisation; pointer-to-bhava hit-test; chart-only export crop bounds |
| `chart-templates-south.js` | ~984 | 4×4 grid chart, bhava numbering, Lagna indicator, centre label, indicator visibility, `zoomToFit()` with local bounds; `skipZoomToFit` on undo restore; `selectPlanet()` / `clearSelectedPlanet()` via `CitranaGrahaSelection`; `CitranaRashis` / `CitranaDevice` |
| `chart-templates-north.js` | ~1011 | Diamond polygon chart, rashi boxes, Lagna rashi math, indicator visibility (`tinyBoxGroupNorth`), `zoomToFit()` with local bounds; `skipZoomToFit` on undo restore; `selectPlanet()` / `clearSelectedPlanet()` via `CitranaGrahaSelection`; `raiseDrawingsAboveChart()` / `syncNorthChartLayerOrder()`; `CitranaRashis` / `CitranaDevice` |
| `planet-system.js` | ~880 | Graha library UI (5 pages, 60 Grahas — Page 5: Upagrahas and outer Grahas), `fullName` library labels, no-scroll grid layout, drag-and-drop via coordinator hit-test, `clearSelectedBhavaDropTarget()` |
| `citrana-arrow.js` | ~185 | Unified filled-arrow geometry (`Konva.Line` polygon); `arrowAnchors`; legacy `Konva.Arrow` migration |
| `citrana-colorpicker.js` | ~383 | JSColorPicker v1.1.0 theme, swatches, chip toggles, alpha; `applyToKonvaArrow()` / `fromKonvaShape()`; `isPickerPopupTarget()` for touch-outside dismiss |
| `citrana-device.js` | ~39 | Shared `isTouchDevice()`, `isMobileUA()`, `isCompactViewport()`, `isLaserViewport()` (all viewports), `hasFinePointer()` |
| `citrana-rashis.js` | ~41 | Shared `RASHIS`, `NAMES`, `NUMBERS`, `getName()`, `getNumberForHouseIndex()` |
| `citrana-graha-selection.js` | ~96 | Graha Selection Pill — white `Konva.Rect` (`planet-selection-pill`) behind Graha text; `attach()` / `sync()` / `detach()`; extra padding on mobile |
| `citrana-laser.js` | ~248 | Ephemeral laser pointer — Canvas 2D overlay above stage; independent strokes per gesture; ~3s fade; `isAvailable()` → `CitranaDevice.isLaserViewport()`; not serialised or undoable |
| `drawing-tools.js` | ~2134 | Drawing tools, selection, control points, Graha text editing, `CitranaArrow.create()`, `CitranaLaser` delegation, `startInlineContentEdit()`, `bindRestoredDrawingInteractions()`; history `recordHistory()` calls (laser excluded); notifies `app.notifyCanvasSelectionChanged()` on select/clear; `CitranaDevice` for touch/mobile |
| `edit-ui.js` | ~786 | Floating property editor; colour chips via `CitranaColorPicker.createInput()` (session-based undo on close); touch-outside dismiss excludes picker popup and `.konva-textarea` |
| `context-menu.js` | ~717 | Right-click / long-press menus; `shouldBlockCanvasContextMenu()` (Select/Hand only, not while drawing, respects user disable); unified hit-test routing; **Presentation View** toggle; North **Set Lagna as …** flyout from `CitranaRashis.RASHIS` (tap to expand on touch); `isCanvasContextMenuEnabled()` / `toggleCanvasContextMenu()` persisted in `localStorage` |
| `citrana-items-menu.js` | ~635 | **Items** panel (`#items-menu-btn`); Chart/**Canvas**/Bhava/Graha/Annotation sections; **Clear Selection**, **Disable Context Menu**; `.items-row-selected` sync with `app.getCanvasSelection()`; South Bhava rows show fixed Rashi names; reuses `ContextMenu.handleAction()`; Text/Heading **Edit text** + **Style** actions |
| `citrana-session.js` | ~214 | Save/open `.citrana.json` (`format: citrana-session`, `version: 1`); `capture()`, `validate()`, `download()`, `applyOptions()` |
| `citrana-debug.js` | ~13 | Opt-out contributor trace logging (`citranaDebug()` used across app, templates, coordinator, menus, drawing tools, Graha system) |
| `styles.css` | ~2681 | Light theme, floating UI, safe areas, iOS PWA layout, primary `@media (max-width: 768px)` block plus post-base mobile overrides (Help/About, modals), Graha library grid, JSColorPicker `--cp-*` theme, `.items-*` panel (`.items-row-selected`), `.toolbar-scroll-*`, `.help-modal-description`, `.citrana-laser-canvas`, `body.presentation-view` (includes `.floating-text-edit-controls`, `.floating-edit-ui`), Help/About `--corner-btn-size` (48px desktop; 50px mobile) |

## Canvas Object Naming

Konva nodes use predictable `name` values for hit-testing and cleanup:

| Pattern | Example | Purpose |
|---------|---------|---------|
| `house-{n}` | `house-7` | Bhava hit area |
| `planet-{abbr}-{house}-{id}` | `planet-Su-4-abc123` | Graha label text |
| `planet-hit-{id}` | `planet-hit-abc123` | Invisible drag/select target |
| `planet-selection-pill` | — | Selection Pill behind selected Graha text (`CitranaGrahaSelection`) |
| `drawing-{type}` | `drawing-arrow` | User-drawn annotations (`Konva.Line` polygon via `CitranaArrow`; attrs `arrowAnchors`, `arrowStrokeWidth`, …) |
| `south-indian-chart` / `north-indian-chart` | — | Chart root groups |

## Graha Data Model

Each placed Graha is stored in the active template's `houseData` as an object on the Bhava's `grahas` array.

**South Indian** (`houseDataSouth[houseNumber].planets[]`):

```javascript
{
  abbr: 'Su',
  label: 'Su-20',
  id: 'unique-id',
  color: '#e2792e',
  retrograde: false
}
```

**North Indian** (`houseDataNorth[houseNumber].planets[]`) adds rashi tracking:

```javascript
{
  abbr: 'Su',
  label: 'Su',
  id: 'unique-id',
  color: '#e2792e',
  rashiNumber: 5,
  retrograde: true
}
```

Rendering uses `label` and `color` for `Konva.Text`, and `retrograde` drives `textDecoration: 'underline'`. The label string is never modified to indicate retrograde.

### Retrograde

- **Display**: Underlined Graha text on canvas.
- **Storage**: `retrograde: boolean` on Graha data.
- **Editing**: Double-click Graha, right-click → **Edit Graha**, or Edit UI → retrograde button (↺)
- **Persistence**: `retrograde` is included in in-memory chart serialisation (`getChartData()` / undo snapshots); not restored after page refresh
- **Legacy**: Labels containing the old Unicode subscript `ᵣ` are stripped on ingest; `retrograde` is set to `true`.

## Key Data Flows

### Create chart

1. User right-clicks canvas → `ContextMenu.showChartMenu()`
2. User selects chart type → `ChartCoordinator.createSouthIndianChart()` or `createNorthIndianChart()`
3. Template builds Konva groups, calls `zoomToFit()`

### Place Graha (library drag-and-drop)

1. User drags from Graha library → `PlanetSystem.handleDrop()` (desktop) or `handleMobileDrop()` (touch)
2. Target bhava resolution (first match wins):
   - **Selected bhava** (one-shot): `window.selectedBhavaSouth` or `window.selectedBhavaNorth` if the user clicked a Bhava first — cleared after the next successful drop (`PlanetSystem.clearSelectedBhavaDropTarget()`), when clicking empty canvas (`app.js` `mousedown`/`tap`), or on mobile tap on empty stage
   - **Pointer hit-test**: `ChartCoordinator.findHouseAtPointer()` or `findHouseAtClientPoint()`
3. Coordinator converts coords with `stagePointerToChartCoords()` / `clientToChartCoords()`, then delegates to template `findHouseAtChartPoint()`:
   - **South**: axis-aligned rectangle test; nearest-centre fallback
   - **North**: `isPointInPolygon()`; nearest-centroid fallback
4. `ChartCoordinator.addPlanetToHouse()` → template `updatePlanetsInHouse()`

### Set Lagna

- **South Indian**
  - Bhava menu only → **Set as Lagna** on the clicked bhava (no chart-level Lagna menu)
  - `set-lagna` action → `setLagnaHouse(visualHouseNumber)`; `loadChartData()` restores with `{ skipSnapshot: true }`
  - Bhava menu header uses `getBhavaNumberForHouse()` — **Bhava N** counts from Lagna
- **North Indian**
  - Chart menu → **Set Lagna as …** → pick Rashi from `CitranaRashis.RASHIS` (`set-lagna` with `data-house` 1–12 = Rashi)
  - Bhava menu → **Set as First Bhava** → `set-first-house` → `getRashiNumberForHouse(visualHouse)` → `setLagnaHouse(rashi)`
  - `lagnaHouseNorth` stores **Rashi** (1–12), not visual Bhava index
  - `setLagnaHouse(n, options?)` → renumber rashi boxes, `repositionPlanetsForNewLagna()`; `options.skipSnapshot` on undo restore

`set-lagna` requires a `houseNumber`; if missing, the action is skipped (no default fallback).

### Context menus

**Gating** (`shouldBlockCanvasContextMenu`): Canvas context menus are suppressed when the user has disabled them (`isCanvasContextMenuEnabled()`), while `app.isDrawing`, or when the active tool is not Select/Hand. Reduces touch conflicts during drawing.

**Unified routing** (`openContextMenuAtClientPoint`):

1. `getShapeAtClientPoint()` → `stage.getIntersection(pos)`
2. `resolveContextTarget()` walks Konva names: `house-*`, `planet-hit-*`, `planet-{abbr}-{house}-{id}`
3. Bhava → `showHouseMenu()`; Graha → `showPlanetMenu()`; else → `showChartMenu()`

**Desktop**: right-click on `#canvas-container` and Konva `contextmenu` on Bhavas/Grahas (with `stopPropagation`).

**Mobile**: 500ms long-press on canvas uses the same hit-test routing (not chart-menu-only).

| Menu | Trigger | Key actions |
|------|---------|-------------|
| Create | Empty canvas | North/South chart, **Presentation View**, Clear Canvas |
| Existing chart | Canvas, no hit | **Presentation View**; North: Set Lagna as …; Reset Chart; Reset Drawings; Clear Canvas |
| Bhava | Bhava hit | South: Set as Lagna; North: Set as First Bhava; Clear Bhava; **Presentation View**; … |
| Graha | Graha hit | Edit Graha, Delete Graha |

**Presentation View:** `toggle-presentation-view` → `app.togglePresentationView()` toggles `presentationView` and `body.presentation-view` (hides toolbar, zoom bar, Graha library, Help, About, Graha edit bar, drawing Edit UI). Dismisses active edit sessions on enter. Label alternates **Presentation View** / **Exit Presentation View**. Available from context menus and the **Items** panel. Not undoable.

### Items panel

1. User clicks `#items-menu-btn` (zoom bar) → `CitranaItemsMenu.open()` → `render()` lists Chart, **Canvas**, Bhavas, Grahas, Annotations
2. **Canvas** rows: **Clear Selection** → `app.clearCanvasSelection()`; **Disable Context Menu** → `ContextMenu.toggleCanvasContextMenu()` (persisted in `localStorage.citrana_context_menu_enabled`)
3. Chart rows dispatch `ContextMenu.handleAction()` (create/reset/clear, **Presentation View**, North Set Lagna, etc.)
4. Bhava/Graha rows reuse the same action handlers as context menus; South Bhava labels show fixed Rashi names from `CitranaRashis`
5. Selected row gets `.items-row-selected` via `isRowSelected()` / `app.getCanvasSelection()`; `refreshSelectionHighlight()` on canvas selection change
6. Annotation rows: Text/Heading offer **Edit text** (`startInlineContentEdit`) and **Style** (`showEditUI`); other types offer **Edit** → `showEditUI`
7. Modal uses Options modal shell (`#items-modal`); included in `isModalBlockingShortcuts()`

### Canvas selection

1. **Bhava**: click/tap Bhava → `highlightHouse()` (light grey `#f3f4f6` fill)
2. **Graha**: click/tap Graha → `selectPlanet()` → `CitranaGrahaSelection.attach()` (Selection Pill); clears other Graha/Bhava/annotation selection
3. **Annotation**: Select tool → `DrawingTools.selectShape()`; notifies `app.notifyCanvasSelectionChanged()`
4. **Clear**: empty-canvas `mousedown`/`tap` → `app.clearCanvasSelection()`; Items **Clear Selection**; switching Graha/Bhava selection clears the others
5. **Items sync**: `getCanvasSelection()` returns `{ type, houseNumber?, planetId?, shapeIndex? }` — Graha takes priority over Bhava over annotation for panel highlight
6. Not tracked by undo/redo

### Zoom

| Control | Path |
|---------|------|
| `#zoom-in` / `#zoom-out` | `app.zoomIn/Out()` → `ChartCoordinator.zoomIn/Out()` (scale 0.1–5, about stage centre); disabled when zoom locked |
| `#reset-zoom` | `app.zoomToFit()` → `ChartCoordinator.zoomToFit()` (routes by `currentChartType`) or scale reset (always available) |
| `#zoom-lock` | `app.toggleZoomLock()` — default **locked** (`zoomLocked: true`); `lock` icon when locked, `lock-open` when unlocked |
| Mouse wheel | `app.handleWheel()` (desktop only; scales about pointer when unlocked; no `preventDefault` when locked) |
| Keyboard `+`/`-`/`0` | `+`/`-` zoom when unlocked; `0` reset zoom always; **Escape** closes dismissible modals; **Tab** trapped inside open modal; other shortcuts ignored when `isModalBlockingShortcuts()` or Graha/text inline editor focused |
| Display | `stage.on('scaleXChange scaleYChange')` → `app.updateZoomLevel()` → `#zoom-level` text |

**`zoomToFit()`** in both templates converts `getClientRect()` to **local bounds** (undoes current scale/pan) before computing fit scale. South: desktop `scaleFactor=0.7`, mobile `0.95`. North: desktop `extraTopMargin=-50`, mobile `20`.

### Edit Graha

1. Double-click Graha text, or right-click → **Edit Graha** → `DrawingTools.editPlanetText()` / `openPlanetEditor()`
2. On save → template callback updates `label`, `color`, `retrograde` in Bhava data and Konva node

### Draw annotation

1. User selects tool in toolbar → `app.setTool()` → `DrawingTools.setTool()`
2. Mouse/touch on stage → `startDrawing` / `draw` / `stopDrawing`
3. **Arrows:** `CitranaArrow.create()` → filled closed `Konva.Line` (constant-width shaft + prominent head); control points use `arrowAnchors` tail/tip
4. Arrow, line, text, and heading auto-switch to Select after creation; Pen and Laser stay active. `makeShapeSelectable()` runs once in `stopDrawing()` (not per mousemove). Control points appear when arrow/line is selected
5. **Laser:** `CitranaLaser.startStroke()` / `extendStroke()` on a DOM `<canvas>` overlay (not Konva); each gesture is a separate stroke in `strokes[]`; `stopDrawing()` skips `recordHistory()`; `clearLaser()` on `clearAll()`
6. Mobile: drawing tools visible in toolbar; toolbar horizontal scroll with chevrons; **Items** button in zoom bar for touch-friendly actions

### Presentation View

1. User right-clicks canvas or Bhava → **Presentation View**, or uses **Items** panel → **Presentation View** (or **Exit Presentation View** when active)
2. `ContextMenu.handleAction('toggle-presentation-view')` → `app.togglePresentationView()`
3. `document.body.classList.toggle('presentation-view')` hides `.floating-top-toolbar`, `.floating-zoom-controls`, `.floating-planet-library`, `.help-btn`, `.about-btn`, `.floating-text-edit-controls`, `.floating-edit-ui`; dismisses open Graha bar and drawing Edit UI
4. Safari iOS visibility fix (`setupSafariToolbarFix` / `fixUIElementsVisibility`) listens to `focusin`/`focusout`, `resize`, `scroll`, and `visualViewport` events — no polling timer; no-ops while `presentationView` is true
5. Not tracked in undo/redo; state resets on page refresh

### Colour (Graha + drawings)

1. **Graha bar:** `#text-edit-color` button → `CitranaColorPicker.initGrahaBar()` on app init; pick commits on Save (session undo)
2. **Drawing Edit UI:** `EditUI.createColorControl()` → `CitranaColorPicker.createInput()` chip; changes mark session dirty; one undo step on `hide()`
3. **Arrows:** `CitranaColorPicker.applyToKonvaArrow()` sets opaque `fill` + `shape.opacity()` (single composited shape)
4. **Swatches:** shared 16-colour rainbow grid in `citrana-colorpicker.js`; theme via `--cp-*` in `styles.css`

### Undo / redo

1. User action calls `window.app.recordHistory(label)` (or `CitranaHistory.record` via `app.history`)
2. `captureHistoryState()` snapshots `{ chartData, drawingData }`:
   - `chartData` ← `ChartCoordinator.getChartData()` (Grahas, Lagna, centre label)
   - `drawingData` ← `serializeDrawings()` (Konva `drawing-*` nodes; explicit `points`/`x`/`y` for lines; `arrowAnchors` + head metrics for unified arrows)
3. State is deep-cloned into the timeline (`maxSteps: 50`, seeded with `Start` on init)
4. **Toolbar** `#undo-btn` / `#redo-btn` or **Ctrl+Z** / **Ctrl+Y** (or **Cmd** on macOS) → `app.undo()` / `app.redo()` → `history.undo()` / `history.redo()` → `restoreHistoryState()`; saves/restores stage scale and position around chart reload; templates recreate with `skipZoomToFit: true`; `updateHistoryButtons()` syncs disabled state
5. Restore reloads chart via `loadChartData()`, redraws via `restorePersistedDrawings()`, clears selection and Edit UI
6. `_restoring` flag suppresses new records during restore

**Edit sessions** (one step on commit, not per click): drawing Edit UI (`hide()`), Graha text bar (`finish(true)`), inline text/heading double-click editors.

**Not tracked:** active tool, Bhava highlight, Graha library page, modal/UI state, chart indicator visibility preferences, Save Chart Only export preference, laser pointer strokes, **Presentation View**.

**Tracked with viewport:** zoom level and pan position are preserved across undo/redo (`restoreHistoryState()` + `skipZoomToFit` on template reload).

### Chart display options

1. User opens `#options-btn` (gear, toolbar export group) → `#options-modal`
2. Toggle **Hide North Indian Chart Indicators**, **Hide South Indian Chart Indicators**, and/or **Save Chart Only**
3. Indicator toggles → `app.setNorthHideIndicators(hide)` / `setSouthHideIndicators(hide)` → `localStorage` (`citrana_north_hide_indicators` / `citrana_south_hide_indicators`, `'1'` when hidden)
4. Active chart template applies indicators via `applyNorthIndicatorsPreference()` or `applySouthIndicatorsPreference()`:
   - **North**: `tinyBoxGroupNorth.visible(!hide)`
   - **South**: lagna diagonal lines, yellow bhava boxes, black rashi boxes via `setSouthIndicatorsVisible()`
5. **Save Chart Only** → `app.setSaveChartOnly(enabled)` → `localStorage.citrana_save_chart_only`; forces `exportWithWhiteBg = false` and locks `#toggle-transparency-btn` via `applySaveChartOnlyTransparency()`
6. Indicator prefs reapply on chart create and Lagna changes; all option prefs survive refresh but are **not** in undo snapshots

### Export

**Full viewport** (default, or Save Chart Only with no chart loaded):

1. `app.exportChart()` → optional full-stage white background rect → `stage.toDataURL({ pixelRatio: 2 })`
2. `finalizeExportImage()` adds 100px padding + watermark → download as `citrana-chart-{timestamp}.png`
3. Follows current zoom/pan and `#toggle-transparency-btn`

**Save Chart Only** (`options.saveChartOnly` and `hasActiveChart()`):

1. Save stage scale/position; `drawingTools.clearControlPoints()` if needed
2. `chartTemplates.zoomToFit()` then `getExportCropRect()` (chart group bounds; North unions visible `tinyBoxGroupNorth`)
3. `stage.toDataURL({ x, y, width, height, pixelRatio: 2 })` — Grahas and layer annotations inside the crop are included; anything outside is clipped
4. Restore zoom/pan and control points
5. `finalizeExportImage({ chartOnly: true })` — transparent background, no padding, no watermark

### Session model

**In-tab (default):**
1. Chart Grahas, Lagna, and drawings live in memory on the Konva stage for the current tab visit
2. Refreshing the page starts a blank session — nothing is auto-restored from `localStorage`
3. On init, any legacy `citranaChartData` key from older builds is removed
4. `getChartData()` / `loadChartData()` support undo snapshots within the same visit

**Save / Open Session (`.citrana.json`):**
1. User clicks **Save Session** → `CitranaSession.capture(app)` → `download()` with timestamped filename
2. Payload: `{ format: 'citrana-session', version: 1, chartData, drawingData, options }` where `options` mirrors indicator toggles and Save Chart Only preference
3. **Open Session** → file picker → `CitranaSession.readFile()` → `validate()` → confirm if canvas has content → `app.restoreSessionState()`
4. Import applies chart + drawings + options; `history.resetToState()` seeds a fresh undo timeline
5. **Export PNG** remains the raster copy path; session files are the structured save path

## Global State

| Symbol | Set by | Used for |
|--------|--------|----------|
| `window.app` | `index.html` on `DOMContentLoaded` | Cross-module access |
| `app.presentationView` | `togglePresentationView()` | In-memory Presentation View flag (not persisted) |
| `window.selectedBhavaSouth` | South template Bhava click / context menu | One-shot library drop target; cleared after drop or empty-canvas click |
| `window.selectedBhavaNorth` | North template Bhava click / context menu | One-shot library drop target; cleared after drop or empty-canvas click |
| `localStorage.citrana_welcome_seen` | Welcome modal close | First-visit UX |
| `localStorage.citrana_north_hide_indicators` | Options modal (North toggle) | `'1'` hides North bhava corner boxes; key removed when shown |
| `localStorage.citrana_south_hide_indicators` | Options modal (South toggle) | `'1'` hides South lagna line and bhava/rashi boxes; key removed when shown |
| `localStorage.citrana_save_chart_only` | Options modal (Save Chart Only) | `'1'` enables chart-area export (transparent, no watermark); key removed when off |
| `localStorage.citrana_context_menu_enabled` | Items panel (Disable Context Menu) | `'false'` disables right-click and long-press menus; default enabled |
| `localStorage.citrana_debug` | DevTools / manual | `'0'` silences `citranaDebug()`; default is on |

## Debug logging

`citranaDebug()` from `citrana-debug.js` — **enabled by default** for open-source contributors. Trace logs in `app.js`, chart templates, `chart-coordinator.js`, `context-menu.js`, `drawing-tools.js`, and `planet-system.js` route through `citranaDebug()` (not `console.log`).

- **Silence:** `localStorage.setItem('citrana_debug', '0')` then refresh
- **Re-enable:** remove key or set to `'1'`
- **Runtime:** `window.CITRANA_DEBUG = false` disables without localStorage

`console.error` is unchanged for real failures.

## UI Architecture

All interactive chrome is **fixed/absolute positioned** over a full-viewport canvas.

### CSS layout (2.0)

- `:root` safe-area vars: `--sat`, `--sar`, `--sab`, `--sal`; `--ui-inset` (20px desktop), `--ui-inset-sm` (10px mobile), `--ui-bottom-pad` (8px mobile / 4px standalone PWA)
- Layout tokens: `--ui-bottom-stack` (60px desktop token), `--zoom-controls-block-height` (48px), `--corner-btn-size` (48px); **mobile `≤768px`:** 50px chrome height, `--ui-bottom-stack: 62px`
- `body { position: fixed; inset: 0 }` — fills viewport on iOS (avoids `100dvh` gap)
- `.app-container { position: absolute; inset: 0 }`
- Top chrome: `top: calc(var(--ui-inset) + var(--sat))`
- Bottom chrome: `bottom: calc(var(--ui-bottom-pad) + var(--sab))` on mobile; `var(--ui-inset)` on desktop zoom/About
- Graha library on mobile: `bottom: calc(var(--ui-bottom-stack) + var(--ui-bottom-pad) + var(--sab))`

### Graha library layout

| Viewport | Grid | Cells | Notes |
|----------|------|-------|-------|
| Desktop | `repeat(auto-fit, minmax(80px, 1fr))` | 80×40px | No scroll; grows to fit 12 items per page |
| Mobile ≤768px | 6 cols × 2 rows | 30px tall, 7px font | Compact header/grid/dots padding; `word-break: break-word` for Page 5 Upagrahas |

Markup: `#graha-library` > `.planet-library-header` + `#planet-library.planet-grid` + `.page-dots`. Styles in `styles.css` only (no inline header/grid styles in `index.html`). Library cells show `planet.fullName` from `createPlanetLibrary()`.

### Floating elements

- Top centre: tool toolbar — Undo/Redo, Select/Hand, drawing tools, **Save Session** / **Open Session**, export/transparency/**Options** (`#options-btn`); `#toolbar-scroll-viewport` with chevrons when overflow
- Top left (desktop) / bottom stack (mobile): Graha library
- Bottom: zoom controls (`#zoom-in`, `#zoom-out`, `#reset-zoom`, `#zoom-lock`, `#zoom-level`, divider, **`#items-menu-btn`**); 288px width on mobile; 48px block height desktop, **50px mobile** including border
- Bottom corners: Help (mobile bottom-left; desktop top-right), About (bottom-right) — `--corner-btn-size` 48px desktop / 50px mobile; hidden in Presentation View along with Graha bar and drawing Edit UI
- Bottom centre: Graha text edit bar, drawing Edit UI (dynamic)

Modals: Welcome, Help, **Options**, About, **Items**, Confirmation, Export Progress.

**Modal accessibility (`index.html` + `app.js`):**
- Overlays: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, `aria-describedby`; `aria-hidden` toggled on open/close
- Canvas: `#canvas-container` has `role="application"` and descriptive `aria-label`
- **Escape** → `dismissActiveModalOnEscape()` (export progress not dismissible)
- **Tab** → `trapModalFocus()` cycles focus within the active modal
- `openModal()` / `showExportProgress()` push prior focus onto `_modalFocusStack` and focus close button (or modal root if no focusables)
- `closeModal()` / `hideExportProgress()` pop stack and restore focus
- Export progress: `aria-busy="true"` during export; status text id referenced by `aria-describedby`
- Help intro: `#help-modal-description` with `.help-modal-description` (spacing before **Keyboard Shortcuts** section)
- Mobile About/Welcome: compact typography, `overflow: hidden`; `@media` blocks after base modal CSS (cascade-safe)

**CSS responsive cascade:** Additional `@media (max-width: 768px)` blocks after base `.help-btn`, `.about-btn`, and modal selectors override desktop rules that appear later in the file.

Breakpoints: **769px+** desktop, **768px** tablet, **600px** mobile chart fit factor. Desktop is the primary supported experience; mobile/touch layouts are tuned with the **Items** panel as the recommended action surface.

### PWA

- `index.html`: `viewport-fit=cover`, Apple web-app meta tags, manifest link
- `assets/favicon/manifest.json`: `display: standalone`

## Undo / redo

Single unified timeline via `CitranaHistory` (`history.js`), wired in `app.setupComponents()`.

| Aspect | Detail |
|--------|--------|
| Engine | `CitranaHistory` — `entries[]`, `index`, `maxSteps: 50` |
| Snapshot | `{ chartData, drawingData }` deep-cloned on each `record()` |
| Keyboard | **Ctrl+Z** / **Cmd+Z** undo; **Ctrl+Y**, **Ctrl+Shift+Z**, **Cmd+Shift+Z** redo; **V/A/L/P/K/T/H** tools (K = laser when available); **Delete** removes selected Graha first, else deletes selected drawing when Select tool is active; **Escape** closes dismissible modals; **Tab** trapped in modals; other shortcuts blocked when modals open (`isModalBlockingShortcuts`) |
| Toolbar | `#undo-btn` / `#redo-btn` (first group); Lucide `undo-2` / `redo-2`; disabled via `updateHistoryButtons()` |
| API | `app.recordHistory(label)`, `app.undo()`, `app.redo()`, `app.updateHistoryButtons()` |

### Tracked actions (representative labels)

| Area | Labels |
|------|--------|
| Chart | `Start`, `Create South Indian chart`, `Create North Indian chart`, `Set Lagna`, `Clear Bhava`, `Clear canvas`, `Reset chart`, `Reset drawings` |
| Grahas | `Add Graha`, `Remove Graha`, `Move Graha`, `Edit Graha` |
| Drawings | `Draw arrow`, `Draw line`, `Draw pen stroke`, `Add text`, `Add heading`, `Move drawing`, `Adjust drawing`, `Delete drawing` |
| Edits | `Edit arrow`, `Edit line`, `Edit pen`, `Edit text`, `Edit heading`, `Edit centre label` |

### Not tracked

Active tool, bhava selection highlight, Graha library page, modal/UI state, chart indicator visibility preferences, Save Chart Only export preference, laser pointer strokes, **Presentation View**.

**Preserved across undo/redo:** zoom level and pan position (via `restoreHistoryState()` viewport save/restore and `skipZoomToFit` on chart reload).

### Extension

| Goal | Where to change |
|------|-----------------|
| New undoable action | Call `window.app.recordHistory('Label')` after the mutation; ensure data is in `getChartData()` or `drawing-*` nodes |
| History depth | `maxSteps` in `app.setupComponents()` |

## Extension Points

| Goal | Where to change |
|------|-----------------|
| Add Graha to library | `planetsPage1`–`planetsPage5` in `planet-system.js` (Page 5: Upagrahas before outer Grahas) |
| Graha library layout | `.floating-planet-library`, `.planet-library-header`, `.planet-grid`, `.planet-item` in `styles.css`; markup in `index.html` |
| Add drawing tool | `DrawingTools.startDrawing()` switch, toolbar in `index.html`, `app.setTool()` |
| Laser pointer overlay | `citrana-laser.js` (`init`, fade loop, `pruneStrokes`, `isAvailable` → `CitranaDevice.isLaserViewport()`); CSS `.citrana-laser-canvas`; exclude from `recordHistory` / `serializeDrawings` |
| Device / viewport helpers | `citrana-device.js` (`isTouchDevice`, `isMobileUA`, `isCompactViewport`, `isLaserViewport`) |
| Rashi data | `citrana-rashis.js` (`RASHIS`, `getName`, `getNumberForHouseIndex`); North Lagna submenu in `context-menu.js` |
| Presentation View | `app.togglePresentationView()`; `body.presentation-view` in `styles.css` (includes edit bars); `getPresentationViewMenuHtml()` in `context-menu.js`; Items panel chart actions |
| Items panel action | `citrana-items-menu.js` (`render`, `handleBodyClick`); reuse `ContextMenu.handleAction()` where possible |
| Graha Selection Pill | `citrana-graha-selection.js` (`attach`, `sync`, `detach`); wired from template `selectPlanet()` / `clearSelectedPlanet()` |
| Canvas selection API | `app.clearCanvasSelection()`, `getCanvasSelection()`, `notifyCanvasSelectionChanged()` |
| Context menu enable/disable | `context-menu.js` `isCanvasContextMenuEnabled()` / `toggleCanvasContextMenu()`; `localStorage.citrana_context_menu_enabled` |
| Save/open session | `citrana-session.js` (`capture`, `validate`, `download`); `app.saveSession()` / `restoreSessionState()` |
| Context menu gating | `context-menu.js` `shouldBlockCanvasContextMenu()` — Select/Hand only, not while `app.isDrawing` |
| Arrow geometry / transparency | `citrana-arrow.js` (`buildOutlinePoints`, `create`); colour via `CitranaColorPicker.applyToKonvaArrow()` |
| Colour picker theme / swatches | `citrana-colorpicker.js` (`SWATCHES`, `BASE_OPTIONS`); `--cp-*` in `styles.css` |
| New chart type | New template class + routes in `ChartCoordinator` (include `findHouseAtChartPoint()`) |
| Context menu action | `ContextMenu.handleAction()`; items in `showHouseMenu()` / `showPlanetMenu()` / `showExistingChartMenu()` |
| South bhava menu header | `SouthIndianChartTemplate.getBhavaNumberForHouse()` |
| North First Bhava → Lagna | `handleAction('set-first-house')` |
| North chart Lagna by Rashi | `handleAction('set-lagna')` with rashi 1–12 |
| Library drop hit-test | `findHouseAtChartPoint()` in template; coords in `ChartCoordinator` |
| Zoom fit behaviour | `zoomToFit()` in chart template |
| Theme / layout / safe areas | `assets/css/styles.css` — keep post-base mobile `@media` blocks after component base rules when overrides must win |
| Export behaviour | `app.exportChart()` / `finalizeExportImage()`; crop bounds in `ChartCoordinator.getExportCropRect()` |
| Chart indicator toggles | `app.setNorthHideIndicators()` / `setSouthHideIndicators()`, template `apply*IndicatorsPreference()`, Options UI in `index.html` |
| Save Chart Only export | `app.setSaveChartOnly()`, `applySaveChartOnlyTransparency()`, `#save-chart-only-toggle` in `index.html` |
| Modal accessibility | `index.html` dialog `aria-*`; `app.openModal()` / `closeModal()`, `trapModalFocus()`, `dismissActiveModalOnEscape()`, export progress focus in `showExportProgress()` / `hideExportProgress()` |
| Undo/redo | `history.js`, `app.recordHistory()` / `captureHistoryState()` / `updateHistoryButtons()` |

## Known Limitations

- **Single chart**: One chart per canvas by design.
- **Mobile/touch**: Layout and Items panel are tuned; desktop remains the primary supported experience; laser pointer available on all viewports (`isLaserViewport()`).
- **About version**: `index.html` About modal version string should match `CHANGELOG.md` on each release.

## Related Documentation

- [AGENT.md](AGENT.md) — Full feature reference and development guidelines
- [README.md](README.md) — Quick start and user guide
- [CHANGELOG.md](CHANGELOG.md) — Version history
- [.cursorrules](.cursorrules) — Cursor IDE rules for contributors and AI agents
