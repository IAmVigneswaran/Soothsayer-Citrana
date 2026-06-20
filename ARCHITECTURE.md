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
  ├── history.js                        → CitranaHistory (undo/redo timeline)
  └── app.js                            → CitranaApp (window.app on DOMContentLoaded)
```

Script order matters: vendor libs first; `citrana-arrow.js` before `citrana-colorpicker.js`; `citrana-laser.js` before `drawing-tools.js`; `history.js` immediately before `app.js`.

## High-Level Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        CitranaApp (app.js)                  │
│  Stage/Layer · Tools · Zoom · Export · Modals · Undo/Redo   │
└────────────┬───────────────────────────────┬────────────────┘
             │                               │
    ┌────────▼─────────┐             ┌───────▼────────┐
    │ ChartCoordinator │             │  PlanetSystem  │
    │  + hit-test API  │             └───────┬────────┘
    └────────┬─────────┘                     │ drag/drop
             │                               │
   ┌─────────┴───────────┐                   │
   │                     │                   │
┌──▼────────────┐  ┌─────▼──────────┐        │
│ SouthIndian   │  │ NorthIndian    │◄───────┘
│ ChartTemplate │  │ ChartTemplate  │
└───────────────┘  └────────────────┘

┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ DrawingTools │  │ CitranaLaser │  │   EditUI     │  │ ContextMenu  │
│  (Konva)     │  │ (Canvas 2D)  │  │              │  │              │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
```

## Module Responsibilities

| Module | Lines | Primary role |
|--------|-------|----------------|
| `app.js` | ~1520 | Application lifecycle, Konva stage, tool routing, keyboard shortcuts (**K** laser when available; centralised **Delete** for Grahas and drawings), zoom lock, export (full viewport or chart-only crop), modals (including Options), chart display preferences, history coordinator, undo/redo toolbar; `serializeDrawings()` includes `arrowAnchors` for unified arrows |
| `history.js` | ~77 | Unified undo/redo timeline (`CitranaHistory`) |
| `chart-coordinator.js` | ~360 | Unified API over South/North templates; zoom; chart serialisation; pointer-to-bhava hit-test; chart-only export crop bounds |
| `chart-templates-south.js` | ~993 | 4×4 grid chart, bhava numbering, Lagna indicator, centre label, indicator visibility, `zoomToFit()` with local bounds |
| `chart-templates-north.js` | ~949 | Diamond polygon chart, rashi boxes, Lagna rashi math, indicator visibility (`tinyBoxGroupNorth`), `zoomToFit()` with local bounds |
| `planet-system.js` | ~884 | Graha library UI (5 pages, 60 Grahas — Page 5: Upagrahas and outer Grahas), `fullName` library labels, no-scroll grid layout, drag-and-drop via coordinator hit-test, `clearSelectedBhavaDropTarget()` |
| `citrana-arrow.js` | ~187 | Unified filled-arrow geometry (`Konva.Line` polygon); `arrowAnchors`; legacy `Konva.Arrow` migration |
| `citrana-colorpicker.js` | ~378 | JSColorPicker v1.1.0 theme, swatches, chip toggles, alpha; `applyToKonvaArrow()` / `fromKonvaShape()` |
| `citrana-laser.js` | ~219 | Ephemeral laser pointer — Canvas 2D overlay above stage; fade trail; not serialised or undoable |
| `drawing-tools.js` | ~2030 | Drawing tools, selection, control points, Graha text editing, `CitranaArrow.create()`, `CitranaLaser` delegation, history `recordHistory()` calls (laser excluded) |
| `edit-ui.js` | ~776 | Floating property editor; colour chips via `CitranaColorPicker.createInput()` (session-based undo on close) |
| `context-menu.js` | ~721 | Right-click / long-press menus; unified hit-test routing |
| `citrana-debug.js` | ~13 | Opt-out contributor trace logging |
| `styles.css` | ~2340 | Light theme, floating UI, safe areas, iOS PWA layout, Graha library grid, JSColorPicker `--cp-*` theme, `.citrana-laser-canvas`, compact colour chips |

## Canvas Object Naming

Konva nodes use predictable `name` values for hit-testing and cleanup:

| Pattern | Example | Purpose |
|---------|---------|---------|
| `house-{n}` | `house-7` | Bhava hit area |
| `planet-{abbr}-{house}-{id}` | `planet-Su-4-abc123` | Graha label text |
| `planet-hit-{id}` | `planet-hit-abc123` | Invisible drag/select target |
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
   - **Selected bhava** (one-shot): `window.selectedBhavaSouth` or `window.selectedBhavaNorth` if the user clicked a Bhava first — cleared after the next successful drop (`PlanetSystem.clearSelectedBhavaDropTarget()`) or when clicking empty canvas (`app.js`)
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
  - Chart menu → **Set Lagna as…** → pick Rashi (`set-lagna` with `data-house` 1–12 = Rashi)
  - Bhava menu → **Set as First Bhava** → `set-first-house` → `getRashiNumberForHouse(visualHouse)` → `setLagnaHouse(rashi)`
  - `lagnaHouseNorth` stores **Rashi** (1–12), not visual Bhava index
  - `setLagnaHouse(n, options?)` → renumber rashi boxes, `repositionPlanetsForNewLagna()`; `options.skipSnapshot` on undo restore

`set-lagna` requires a `houseNumber`; if missing, the action is skipped (no default fallback).

### Context menus

**Unified routing** (`openContextMenuAtClientPoint`):

1. `getShapeAtClientPoint()` → `stage.getIntersection(pos)`
2. `resolveContextTarget()` walks Konva names: `house-*`, `planet-hit-*`, `planet-{abbr}-{house}-{id}`
3. Bhava → `showHouseMenu()`; Graha → `showPlanetMenu()`; else → `showChartMenu()`

**Desktop**: right-click on `#canvas-container` and Konva `contextmenu` on Bhavas/Grahas (with `stopPropagation`).

**Mobile**: 500ms long-press on canvas uses the same hit-test routing (not chart-menu-only).

| Menu | Trigger | Key actions |
|------|---------|-------------|
| Create | Empty canvas | North/South chart, Clear Canvas |
| Existing chart | Canvas, no hit | North: Set Lagna as…; Reset Chart; Reset Drawings; Clear Canvas |
| Bhava | Bhava hit | South: Set as Lagna; North: Set as First Bhava; Clear Bhava; … |
| Graha | Graha hit | Edit Graha, Delete Graha |

### Zoom

| Control | Path |
|---------|------|
| `#zoom-in` / `#zoom-out` | `app.zoomIn/Out()` → `ChartCoordinator.zoomIn/Out()` (scale 0.1–5, about stage centre); disabled when zoom locked |
| `#reset-zoom` | `app.zoomToFit()` → template `zoomToFit()` or scale reset (always available) |
| `#zoom-lock` | `app.toggleZoomLock()` — default **locked** (`zoomLocked: true`); `lock` icon when locked, `lock-open` when unlocked |
| Mouse wheel | `app.handleWheel()` (desktop only; scales about pointer when unlocked; no `preventDefault` when locked) |
| Keyboard `+`/`-`/`0` | `+`/`-` zoom when unlocked; `0` reset zoom always |
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
5. **Laser:** `CitranaLaser.startStroke()` / `extendStroke()` on a DOM `<canvas>` overlay (not Konva); `stopDrawing()` skips `recordHistory()`; `clearLaser()` on `clearAll()`
6. Mobile (`≤768px`): arrow, line, pen, and laser toolbar buttons hidden in CSS (`#laser-help-shortcut` in Help)

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
4. **Toolbar** `#undo-btn` / `#redo-btn` or **Ctrl+Z** / **Ctrl+Y** (or **Cmd** on macOS) → `app.undo()` / `app.redo()` → `history.undo()` / `history.redo()` → `restoreHistoryState()`; `updateHistoryButtons()` syncs disabled state
5. Restore reloads chart via `loadChartData()`, redraws via `restorePersistedDrawings()`, clears selection and Edit UI
6. `_restoring` flag suppresses new records during restore

**Edit sessions** (one step on commit, not per click): drawing Edit UI (`hide()`), Graha text bar (`finish(true)`), inline text/heading double-click editors.

**Not tracked:** zoom, pan, active tool, Bhava highlight, Graha library page, modals, chart indicator visibility preferences, Save Chart Only export preference, laser pointer strokes. **Deferred 2.1:** visible History panel.

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

### Session model (ephemeral)

1. Chart Grahas, Lagna, and drawings live in memory on the Konva stage for the current tab visit
2. Refreshing the page always starts a blank session — nothing is restored from `localStorage`
3. On init, any legacy `citranaChartData` key from older builds is removed
4. `getChartData()` / `loadChartData()` support undo snapshots within the same visit
5. **Export PNG** is how users keep a copy

## Global State

| Symbol | Set by | Used for |
|--------|--------|----------|
| `window.app` | `index.html` on `DOMContentLoaded` | Cross-module access |
| `window.selectedBhavaSouth` | South template Bhava click / context menu | One-shot library drop target; cleared after drop or empty-canvas click |
| `window.selectedBhavaNorth` | North template Bhava click / context menu | One-shot library drop target; cleared after drop or empty-canvas click |
| `localStorage.citrana_welcome_seen` | Welcome modal close | First-visit UX |
| `localStorage.citrana_north_hide_indicators` | Options modal (North toggle) | `'1'` hides North bhava corner boxes; key removed when shown |
| `localStorage.citrana_south_hide_indicators` | Options modal (South toggle) | `'1'` hides South lagna line and bhava/rashi boxes; key removed when shown |
| `localStorage.citrana_save_chart_only` | Options modal (Save Chart Only) | `'1'` enables chart-area export (transparent, no watermark); key removed when off |
| `localStorage.citrana_debug` | DevTools / manual | `'0'` silences `citranaDebug()`; default is on |

## Debug logging

`citranaDebug()` from `citrana-debug.js` — **enabled by default** for open-source contributors.

- **Silence:** `localStorage.setItem('citrana_debug', '0')` then refresh
- **Re-enable:** remove key or set to `'1'`
- **Runtime:** `window.CITRANA_DEBUG = false` disables without localStorage

`console.error` is unchanged for real failures.

## UI Architecture

All interactive chrome is **fixed/absolute positioned** over a full-viewport canvas.

### CSS layout (2.0)

- `:root` safe-area vars: `--sat`, `--sar`, `--sab`, `--sal`; `--ui-inset` (20px desktop), `--ui-inset-sm` (10px mobile), `--ui-bottom-pad` (8px mobile / 4px standalone PWA)
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

- Top centre: tool toolbar — Undo/Redo, Select/Hand, drawing tools, export/transparency/**Options** (`#options-btn`)
- Top left (desktop) / bottom stack (mobile): Graha library
- Bottom: zoom controls (`#zoom-in`, `#zoom-out`, `#reset-zoom`, `#zoom-lock`, `#zoom-level`); mobile adds Select/Hand in zoom bar (288px width)
- Bottom corners: Help (mobile bottom-left), About (bottom-right)
- Bottom centre: Graha text edit bar, drawing Edit UI (dynamic)

Modals: Welcome, Help, **Options**, About, Confirmation, Export Progress.

Breakpoints: **769px+** desktop, **768px** tablet, **600px** mobile chart fit factor. Official support is desktop-only; iOS standalone PWA layout is tuned but not officially supported.

### PWA

- `index.html`: `viewport-fit=cover`, Apple web-app meta tags, manifest link
- `assets/favicon/manifest.json`: `display: standalone`

## Undo / redo

Single unified timeline via `CitranaHistory` (`history.js`), wired in `app.setupComponents()`.

| Aspect | Detail |
|--------|--------|
| Engine | `CitranaHistory` — `entries[]`, `index`, `maxSteps: 50` |
| Snapshot | `{ chartData, drawingData }` deep-cloned on each `record()` |
| Keyboard | **Ctrl+Z** / **Cmd+Z** undo; **Ctrl+Y**, **Ctrl+Shift+Z**, **Cmd+Shift+Z** redo; **V/A/L/P/K/T/H** tools (K = laser when available); **Delete** removes selected Graha first, else deletes selected drawing when Select tool is active |
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

Zoom level, pan position, active tool, bhava selection highlight, Graha library page, modal/UI state, chart indicator visibility preferences, Save Chart Only export preference, laser pointer strokes.

### Extension

| Goal | Where to change |
|------|-----------------|
| New undoable action | Call `window.app.recordHistory('Label')` after the mutation; ensure data is in `getChartData()` or `drawing-*` nodes |
| History depth | `maxSteps` in `app.setupComponents()` |
| History panel (2.1) | UI over `app.history.entries`; no engine changes required |

## Extension Points

| Goal | Where to change |
|------|-----------------|
| Add Graha to library | `planetsPage1`–`planetsPage5` in `planet-system.js` (Page 5: Upagrahas before outer Grahas) |
| Graha library layout | `.floating-planet-library`, `.planet-library-header`, `.planet-grid`, `.planet-item` in `styles.css`; markup in `index.html` |
| Add drawing tool | `DrawingTools.startDrawing()` switch, toolbar in `index.html`, `app.setTool()` |
| Laser pointer overlay | `citrana-laser.js` (`init`, fade loop, `isAvailable`); CSS `.citrana-laser-canvas`; exclude from `recordHistory` / `serializeDrawings` |
| Arrow geometry / transparency | `citrana-arrow.js` (`buildOutlinePoints`, `create`); colour via `CitranaColorPicker.applyToKonvaArrow()` |
| Colour picker theme / swatches | `citrana-colorpicker.js` (`SWATCHES`, `BASE_OPTIONS`); `--cp-*` in `styles.css` |
| New chart type | New template class + routes in `ChartCoordinator` (include `findHouseAtChartPoint()`) |
| Context menu action | `ContextMenu.handleAction()`; items in `showHouseMenu()` / `showPlanetMenu()` / `showExistingChartMenu()` |
| South bhava menu header | `SouthIndianChartTemplate.getBhavaNumberForHouse()` |
| North First Bhava → Lagna | `handleAction('set-first-house')` |
| North chart Lagna by Rashi | `handleAction('set-lagna')` with rashi 1–12 |
| Library drop hit-test | `findHouseAtChartPoint()` in template; coords in `ChartCoordinator` |
| Zoom fit behaviour | `zoomToFit()` in chart template |
| Theme / layout / safe areas | `assets/css/styles.css` |
| Export behaviour | `app.exportChart()` / `finalizeExportImage()`; crop bounds in `ChartCoordinator.getExportCropRect()` |
| Chart indicator toggles | `app.setNorthHideIndicators()` / `setSouthHideIndicators()`, template `apply*IndicatorsPreference()`, Options UI in `index.html` |
| Save Chart Only export | `app.setSaveChartOnly()`, `applySaveChartOnlyTransparency()`, `#save-chart-only-toggle` in `index.html` |
| Undo/redo | `history.js`, `app.recordHistory()` / `captureHistoryState()` / `updateHistoryButtons()` |

## Known Limitations

- **History panel**: Timeline labels exist in memory; visible panel deferred to 2.1.
- **Single chart**: One chart per canvas by design.
- **Mobile**: Touch code and PWA layout exist; officially unsupported for drawing complexity.
- **About version**: `index.html` About modal version string should match `CHANGELOG.md` on each release.

## Related Documentation

- [AGENT.md](AGENT.md) — Full feature reference and development guidelines
- [README.md](README.md) — Quick start and user guide
- [CHANGELOG.md](CHANGELOG.md) — Version history
- [.cursorrules](.cursorrules) — Cursor IDE rules for contributors and AI agents
