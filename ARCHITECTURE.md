# Citrana Architecture

This document describes how Citrana is structured at a system level: runtime composition, module boundaries, data flows, and safe extension points. For feature-level documentation and usage guidance, see [AGENT.md](AGENT.md) and [README.md](README.md).

## Design Principles

- **Browser-only**: No build step, no server runtime. Open `index.html` or deploy static files to GitHub Pages.
- **Canvas-first**: Chart layout, Grahas, and drawings live on a single Konva.js stage/layer.
- **Floating DOM UI**: Toolbars, modals, Graha library, and edit panels are HTML/CSS overlays; the canvas handles chart interaction.
- **Global coordinator**: `window.app` (`CitranaApp`) is the integration hub. Modules reference it for cross-cutting actions.
- **Template delegation**: South and North Indian charts are separate classes; `ChartCoordinator` routes by `currentChartType`.

## Runtime Composition

```
index.html  (viewport-fit=cover; Konva in <head>)
  ├── assets/vendor/konva.min.js   (Konva 9.3.20)
  ├── assets/vendor/lucide.min.js  (Lucide 0.468.0)
  ├── citrana-debug.js            → window.citranaDebug (on by default)
  ├── chart-templates-south.js     → SouthIndianChartTemplate
  ├── chart-templates-north.js     → NorthIndianChartTemplate
  ├── chart-coordinator.js         → ChartCoordinator
  ├── planet-system.js             → PlanetSystem
  ├── drawing-tools.js             → DrawingTools (+ EditUI instance)
  ├── edit-ui.js                   → EditUI
  ├── context-menu.js              → ContextMenu
  └── app.js                       → CitranaApp (window.app on DOMContentLoaded)
```

Script order matters: `citrana-debug.js` before modules that call `citranaDebug()`; chart template classes before `ChartCoordinator`; all modules before `app.js`.

## High-Level Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        CitranaApp (app.js)                  │
│  Stage/Layer · Tools · Zoom · Export · Modals               │
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

┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ DrawingTools │  │   EditUI     │  │ ContextMenu  │
└──────────────┘  └──────────────┘  └──────────────┘
```

## Module Responsibilities

| Module | Lines | Primary role |
|--------|-------|----------------|
| `app.js` | ~1280 | Application lifecycle, Konva stage, tool routing, keyboard shortcuts, zoom lock, zoom display, export, modals |
| `chart-coordinator.js` | ~286 | Unified API over South/North templates; zoom; chart serialisation; pointer-to-bhava hit-test |
| `chart-templates-south.js` | ~1060 | 4×4 grid chart, bhava numbering, Lagna indicator, `zoomToFit()` with local bounds |
| `chart-templates-north.js` | ~971 | Diamond polygon chart, rashi boxes, Lagna rashi math, `zoomToFit()` with local bounds |
| `planet-system.js` | ~854 | Graha library UI (5 pages), drag-and-drop via coordinator hit-test |
| `drawing-tools.js` | ~1975 | Drawing tools, selection, control points, Graha text editing |
| `edit-ui.js` | ~805 | Floating property editor for drawing shapes |
| `context-menu.js` | ~731 | Right-click / long-press menus; unified hit-test routing |
| `citrana-debug.js` | ~13 | Opt-out contributor trace logging |
| `styles.css` | ~2220 | Light theme, floating UI, safe areas, iOS PWA layout, zoom bar disabled states |

## Canvas Object Naming

Konva nodes use predictable `name` values for hit-testing and cleanup:

| Pattern | Example | Purpose |
|---------|---------|---------|
| `house-{n}` | `house-7` | Bhava hit area |
| `planet-{abbr}-{house}-{id}` | `planet-Su-4-abc123` | Graha label text |
| `planet-hit-{id}` | `planet-hit-abc123` | Invisible drag/select target |
| `drawing-{type}` | `drawing-arrow` | User-drawn annotations |
| `south-indian-chart` / `north-indian-chart` | — | Chart root groups |

## Graha Data Model

Each placed Graha is stored in the active template's `houseData` as an object on the house's `planets` array.

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
- **Storage**: `retrograde: boolean` on planet data.
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
   - **Selected bhava**: `window.selectedBhavaSouth` or `window.selectedBhavaNorth` if the user clicked a house first
   - **Pointer hit-test**: `ChartCoordinator.findHouseAtPointer()` or `findHouseAtClientPoint()`
3. Coordinator converts coords with `stagePointerToChartCoords()` / `clientToChartCoords()`, then delegates to template `findHouseAtChartPoint()`:
   - **South**: axis-aligned rectangle test; nearest-centre fallback
   - **North**: `isPointInPolygon()`; nearest-centroid fallback
4. `ChartCoordinator.addPlanetToHouse()` → template `updatePlanetsInHouse()`

### Set Lagna

- **South Indian**
  - House menu only → **Set as Lagna** on the clicked bhava (no chart-level Lagna menu)
  - `set-lagna` action → `setLagnaHouse(visualHouseNumber)`
  - House menu header uses `getBhavaNumberForHouse()` — **House N** counts from Lagna
- **North Indian**
  - Chart menu → **Set Lagna as…** → pick zodiac sign (`set-lagna` with `data-house` 1–12 = Rashi sign)
  - House menu → **Set as First House** → `set-first-house` → `getRashiNumberForHouse(visualHouse)` → `setLagnaHouse(rashi)`
  - `lagnaHouseNorth` stores **Rashi sign** (1–12), not visual house index
  - `setLagnaHouse(n)` → renumber rashi boxes, `repositionPlanetsForNewLagna()`

`set-lagna` requires a `houseNumber`; if missing, the action is skipped (no default fallback).

### Context menus

**Unified routing** (`openContextMenuAtClientPoint`):

1. `getShapeAtClientPoint()` → `stage.getIntersection(pos)`
2. `resolveContextTarget()` walks Konva names: `house-*`, `planet-hit-*`, `planet-{abbr}-{house}-{id}`
3. House → `showHouseMenu()`; Graha → `showPlanetMenu()`; else → `showChartMenu()`

**Desktop**: right-click on `#canvas-container` and Konva `contextmenu` on houses/planets (with `stopPropagation`).

**Mobile**: 500ms long-press on canvas uses the same hit-test routing (not chart-menu-only).

| Menu | Trigger | Key actions |
|------|---------|-------------|
| Create | Empty canvas | North/South chart, Clear Canvas |
| Existing chart | Canvas, no hit | North: Set Lagna as…; Reset Chart; Reset Drawings; Clear Canvas |
| House | Bhava hit | South: Set as Lagna; North: Set as First House; Clear House; … |
| Planet | Graha hit | Edit Graha, Delete Graha |

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
2. On save → template callback updates `label`, `color`, `retrograde` in house data and Konva node

### Draw annotation

1. User selects tool in toolbar → `app.setTool()` → `DrawingTools.setTool()`
2. Mouse/touch on stage → `startDrawing` / `draw` / `stopDrawing`
3. Arrow/line auto-switch to Select; control points appear on selection
4. Mobile (`≤768px`): arrow, line, and pen toolbar buttons are hidden in CSS

### Export

1. `app.exportChart()` → optional white background rect → `stage.toDataURL({ pixelRatio: 2 })`
2. Offscreen canvas adds padding + watermark → download as `citrana-chart-{timestamp}.png`

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
| `window.selectedBhavaSouth` | South template house click | Optional drop target |
| `window.selectedBhavaNorth` | North template house click | Optional drop target |
| `localStorage.citrana_welcome_seen` | Welcome modal close | First-visit UX |
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

### Floating elements

- Top centre: drawing/tool toolbar
- Top left (desktop) / bottom stack (mobile): Graha library
- Bottom: zoom controls (`#zoom-in`, `#zoom-out`, `#reset-zoom`, `#zoom-lock`, `#zoom-level`); mobile adds Select/Hand in zoom bar (288px width)
- Bottom corners: Help (mobile bottom-left), About (bottom-right)
- Bottom centre: Graha text edit bar, drawing Edit UI (dynamic)

Modals: Welcome, Help, About, Confirmation, Export Progress.

Breakpoints: **769px+** desktop, **768px** tablet, **600px** mobile chart fit factor. Official support is desktop-only; iOS standalone PWA layout is tuned but not officially supported.

### PWA

- `index.html`: `viewport-fit=cover`, Apple web-app meta tags, manifest link
- `assets/favicon/manifest.json`: `display: standalone`

## Undo / redo

Two parallel snapshot systems exist; **UI and keyboard shortcuts are disabled**:

| Layer | Stack | Limit | Status |
|-------|-------|-------|--------|
| `app.js` | `undoStack` / `redoStack` (chart + drawings) | 100 | `pushSnapshot()` still called; `Ctrl+Z`/`Ctrl+Y` commented out |
| `drawing-tools.js` | Local undo stack | 50 | `undo()`/`redo()` implemented but not wired to UI |

## Extension Points

| Goal | Where to change |
|------|-----------------|
| Add Graha to library | `planetsPage1`–`planetsPage5` in `planet-system.js` |
| Add drawing tool | `DrawingTools.startDrawing()` switch, toolbar in `index.html`, `app.setTool()` |
| New chart type | New template class + routes in `ChartCoordinator` (include `findHouseAtChartPoint()`) |
| Context menu action | `ContextMenu.handleAction()`; items in `showHouseMenu()` / `showPlanetMenu()` / `showExistingChartMenu()` |
| South bhava menu header | `SouthIndianChartTemplate.getBhavaNumberForHouse()` |
| North First House → Lagna | `handleAction('set-first-house')` |
| North chart Lagna by sign | `handleAction('set-lagna')` with rashi 1–12 |
| Library drop hit-test | `findHouseAtChartPoint()` in template; coords in `ChartCoordinator` |
| Zoom fit behaviour | `zoomToFit()` in chart template |
| Theme / layout / safe areas | `assets/css/styles.css` |
| Export behaviour | `app.exportChart()` |

## Known Limitations

- **Undo/redo**: Snapshot logic exists but shortcuts and toolbar buttons are disabled due to bugs.
- **Single chart**: One chart per canvas by design.
- **Mobile**: Touch code and PWA layout exist; officially unsupported for drawing complexity.
- **About version**: `index.html` About modal version string should match `CHANGELOG.md` on each release.

## Related Documentation

- [AGENT.md](AGENT.md) — Full feature reference and development guidelines
- [README.md](README.md) — Quick start and user guide
- [CHANGELOG.md](CHANGELOG.md) — Version history
- [.cursorrules](.cursorrules) — Cursor IDE rules for contributors and AI agents
