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
index.html
  ├── assets/vendor/konva.min.js   (Konva 9.3.20)
  ├── assets/vendor/lucide.min.js  (Lucide 0.468.0)
  ├── citrana-debug.js           → window.citranaDebug (on by default)
  ├── chart-templates-south.js   → SouthIndianChartTemplate
  ├── chart-templates-north.js   → NorthIndianChartTemplate
  ├── chart-coordinator.js       → ChartCoordinator
  ├── planet-system.js           → PlanetSystem
  ├── drawing-tools.js           → DrawingTools (+ EditUI instance)
  ├── edit-ui.js                 → EditUI
  ├── context-menu.js            → ContextMenu
  └── app.js                     → CitranaApp (window.app)
```

Script order matters: `citrana-debug.js` must load before any module that calls `citranaDebug()`; chart template classes must load before `ChartCoordinator`, and all modules must load before `app.js`.

## High-Level Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        CitranaApp (app.js)                  │
│  Stage/Layer · Tools · Zoom · Export · Modals   │
└────────────┬───────────────────────────────┬────────────────┘
             │                               │
    ┌────────▼────────┐              ┌───────▼────────┐
    │ ChartCoordinator │              │  PlanetSystem  │
    │  + hit-test API  │              └───────┬────────┘
    └────────┬─────────┘                      │ drag/drop
             │                               │
   ┌─────────┴─────────┐                     │
   │                   │                     │
┌──▼──────────┐  ┌─────▼──────────┐          │
│ SouthIndian │  │ NorthIndian    │◄─────────┘
│ ChartTemplate│  │ ChartTemplate  │
└─────────────┘  └────────────────┘

┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ DrawingTools │  │   EditUI     │  │ ContextMenu  │
└──────────────┘  └──────────────┘  └──────────────┘
```

## Module Responsibilities

| Module | Primary role |
|--------|----------------|
| `app.js` | Application lifecycle, Konva stage, tool routing, keyboard shortcuts, export, modals |
| `chart-coordinator.js` | Unified API over South/North templates; zoom helpers; chart serialisation; pointer-to-bhava hit-test routing |
| `chart-templates-south.js` | 4×4 grid chart, bhava numbering, Lagna indicator, `getBhavaNumberForHouse()`, `findHouseAtChartPoint()`, Graha placement/drag |
| `chart-templates-north.js` | Diamond polygon chart, rashi boxes, Lagna-based rashi math, `findHouseAtChartPoint()`, Graha repositioning |
| `planet-system.js` | Graha library UI (5 pages), drag-and-drop from library to chart via coordinator hit-test |
| `drawing-tools.js` | Drawing tools, selection, control points, Graha text editing panel |
| `edit-ui.js` | Floating property editor for drawing shapes (and Graha retrograde toggle when applicable) |
| `context-menu.js` | Right-click / long-press menus; chart-type-specific house menus; Graha edit/delete; menu routing and `handleAction()` |
| `styles.css` | Light theme, floating UI layout, modals, responsive breakpoints |

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
- **Editing**: Double-click Graha, right-click → **Edit Graha**, or Edit UI when applicable → retrograde button (↺)
- **Persistence**: `retrograde` is included in in-memory chart serialisation (`getChartData()` / undo snapshots); not restored after page refresh
- **Legacy**: Labels containing the old Unicode subscript `ᵣ` are stripped on ingest; `retrograde` is set to `true`.

Key methods:

- `DrawingTools.makePlanetTextEditable()` — opens edit panel
- `DrawingTools.setPlanetRetrogradeState()` — syncs underline + house data
- `SouthIndianChartTemplate.addPlanetToHouse()` / `NorthIndianChartTemplate.addPlanetToHouse()` — normalise label and set `retrograde`

## Key Data Flows

### Create chart

1. User right-clicks canvas → `ContextMenu.showChartMenu()`
2. User selects chart type → `ChartCoordinator.createSouthIndianChart()` or `createNorthIndianChart()`
3. Template builds Konva groups, calls `zoomToFit()`

### Place Graha (library drag-and-drop)

1. User drags from Graha library → `PlanetSystem.handleDrop()` (desktop) or `handleMobileDrop()` (touch)
2. Target bhava resolution (first match wins):
   - **Selected bhava**: `window.selectedBhavaSouth` or `window.selectedBhavaNorth` if the user clicked a house first
   - **Pointer hit-test**: `ChartCoordinator.findHouseAtPointer()` (Konva stage pointer) or `findHouseAtClientPoint()` (viewport coords when pointer is unavailable)
3. Coordinator converts coords with `stagePointerToChartCoords()` / `clientToChartCoords()` (stage scale + position), then delegates to template `findHouseAtChartPoint()`:
   - **South**: axis-aligned rectangle test on `houseDataSouth`; nearest-centre fallback
   - **North**: `isPointInPolygon()` on `houseDataNorth.points`; nearest-centroid fallback
4. `ChartCoordinator.addPlanetToHouse()` → template `updatePlanetsInHouse()`

### Set Lagna

- **South Indian**
  - House menu → **Set as Lagna (Ascendant)** on the clicked bhava (no chart-level Lagna menu)
  - `setLagnaHouse(n)` → renumber bhava boxes, draw diagonal Lagna indicator
  - House menu header uses `getBhavaNumberForHouse()` so **House N** counts from Lagna, not fixed grid Rashi position
- **North Indian**
  - Chart menu → **Set Lagna as…** → pick zodiac sign (1–12); submenu on desktop, flat list on mobile
  - House menu → **Set as First House** → reads `getRashiNumberForHouse(visualHouse)` and calls `setLagnaHouse(rashi)` so the sign in that cell becomes Lagna
  - `lagnaHouseNorth` stores the **Rashi sign** (1–12), not the visual house index
  - `setLagnaHouse(n)` → renumber rashi boxes, `repositionPlanetsForNewLagna()` using stored `rashiNumber` on each Graha

### Context menus

Right-click routing:

1. **Graha** (`planet-*` / `planet-hit-*`): Konva handler calls `stopPropagation()` → `showPlanetMenu()` → **Edit Graha** or **Delete Graha**
2. **Bhava** (`house-*`): Konva handler calls `stopPropagation()` → `showHouseMenu()` with chart-type-specific items
3. **Empty canvas**: Stage listener skips when pointer intersects house or Graha nodes → `showChartMenu()` (create or existing chart menu)

Graha actions from context menu delegate to `openPlanetEditor()` and `removePlanetFromHouse()`, which use `getActiveChartTemplate()` and `findPlanetTextNode()`.

House **Clear House** calls `clearHousePlanets()` on the active template.

### Edit Graha

1. Double-click Graha text, or right-click → **Edit Graha** → `DrawingTools.editPlanetText()` / `openPlanetEditor()`
2. On save → template callback updates `label`, `color`, `retrograde` in house data and Konva node

### Draw annotation

1. User selects tool in toolbar → `app.setTool()` → `DrawingTools.setTool()`
2. Mouse/touch on stage → `startDrawing` / `draw` / `stopDrawing`
3. Arrow/line auto-switch to Select; control points appear on selection

### Export

1. `app.exportChart()` → optional white background rect → `stage.toDataURL({ pixelRatio: 2 })`
2. Offscreen canvas adds padding + watermark → download as `citrana-chart-{timestamp}.png`

### Session model (ephemeral)

1. Chart Grahas, Lagna, and drawings live in memory on the Konva stage for the current tab visit
2. Refreshing the page always starts a blank session — nothing is restored from `localStorage`
3. On init, any legacy `citranaChartData` key from older builds is removed
4. `getChartData()` / `loadChartData()` support undo snapshots and internal restore within the same visit
5. `clearChart()` also removes legacy `citranaChartData` if present
6. **Export PNG** is how users keep a copy

## Global State

| Symbol | Set by | Used for |
|--------|--------|----------|
| `window.app` | `index.html` on `DOMContentLoaded` | Cross-module access to coordinator, tools, menus |
| `window.selectedBhavaSouth` | South template house click | Optional drop target for Graha library |
| `window.selectedBhavaNorth` | North template house click | Optional drop target for Graha library |
| `localStorage.citrana_welcome_seen` | Welcome modal close | First-visit UX |
| `localStorage.citrana_debug` | DevTools / manual | Set to `'0'` to silence `citranaDebug()` logs; omitted or any other value keeps debug on (default) |

## Debug logging

Contributor-oriented trace logging uses `citranaDebug()` from `citrana-debug.js` (loaded before chart modules). **Enabled by default** for open-source debugging.

- **Silence:** `localStorage.setItem('citrana_debug', '0')` then refresh
- **Re-enable:** `localStorage.removeItem('citrana_debug')` or `localStorage.setItem('citrana_debug', '1')`
- **Runtime:** `window.CITRANA_DEBUG = false` disables without localStorage

`console.error` is unchanged for real failures.

## UI Architecture

All interactive chrome is **absolutely positioned** over a full-viewport canvas:

- Top centre: drawing/tool toolbar
- Top left: Graha library (draggable header)
- Bottom right: zoom controls (+ duplicate Select/Hand shortcuts)
- Bottom centre: Graha text edit bar, drawing Edit UI (created dynamically)
- Corners: Help (desktop), About

Modals: Welcome, Help, About, Confirmation, Export Progress.

Breakpoints in `styles.css`: **769px+** desktop, **768px** tablet, **600px** mobile. Official support is desktop-only.

## Extension Points

| Goal | Where to change |
|------|-----------------|
| Add Graha to library | `planetsPage1`–`planetsPage5` in `planet-system.js` |
| Add drawing tool | `DrawingTools.startDrawing()` switch, toolbar in `index.html`, `app.setTool()` |
| New chart type | New template class + routes in `ChartCoordinator` (include `findHouseAtChartPoint()`) |
| Context menu action | `ContextMenu.handleAction()`; add items in `showHouseMenu()` / `showPlanetMenu()` as needed |
| South bhava menu header | `SouthIndianChartTemplate.getBhavaNumberForHouse()` |
| North First House → Lagna | `getRashiNumberForHouse()` then `setLagnaHouse()` in `handleAction('set-first-house')` |
| Library drop hit-test | `findHouseAtChartPoint()` in chart template; coordinate routing in `ChartCoordinator` |
| Graha visual style | `updatePlanetsInHouse()` in chart template files |
| Theme / layout | `assets/css/styles.css` |
| Export behaviour | `app.exportChart()` |

## Known Limitations

- **Undo/redo**: Snapshot logic exists in `app.js` but keyboard shortcuts are disabled due to bugs.
- **Single chart**: One chart per canvas by design.
- **Mobile**: Touch code exists; officially unsupported.

## Related Documentation

- [AGENT.md](AGENT.md) — Full feature reference and development guidelines
- [README.md](README.md) — Quick start and user guide
- [CHANGELOG.md](CHANGELOG.md) — Version history
- [.cursorrules](.cursorrules) — Cursor IDE rules for contributors and AI agents
