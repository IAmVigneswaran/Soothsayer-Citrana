# Citrana - Vedic Astrology Chart Builder

A modern, interactive web application for creating Vedic astrology charts with drag-and-drop Graha placement and comprehensive drawing tools. Built with pure HTML5, CSS3, and JavaScript using Konva.js for canvas manipulation, this tool provides an intuitive interface for educators and students of Vedanga Jyotisha.

## Project Overview

Citrana is a browser-based application that allows users to create both South Indian and North Indian astrological charts. The application features a floating Graha library, comprehensive drawing tools, context menus, and export capabilities. It runs entirely in the browser with no build process required, making it immediately deployable on GitHub Pages or any web server.


## Terminology

Citrana uses consistent Vedic terms in all user-facing text and documentation:

| Use | Not |
|-----|-----|
| **Bhava** / **Bhavas** | House / Houses |
| **Graha** / **Grahas** | Planet / Planets |
| **Rashi** / **Rashis** | Sign / Signs / zodiac sign |

Internal code identifiers (e.g. `citrana-planet-system.js`, `addPlanetToHouse()`, Konva names `house-*` / `planet-*`, data keys `planetsByHouse`) are unchanged for implementation stability.

## Technology Stack

- Frontend: Pure HTML5, CSS3, JavaScript (ES6+)
- Graphics: HTML5 Canvas API with Konva.js (self-hosted, `assets/vendor/konva.min.js` v9.3.20)
- Colour picker: JSColorPicker (self-hosted, `assets/vendor/colorpicker.iife.min.js` v1.1.0; theme in `citrana-colorpicker.js`)
- Styling: Custom CSS only
- Icons: Lucide Icons (self-hosted, `assets/vendor/lucide.min.js` v0.576.0)
- Storage: Browser `localStorage` for preferences (welcome modal, chart indicator toggles, Save Chart Only export, context menu enable/disable, Graha Library visibility, debug opt-out)
- Analytics: Google Analytics and Google Tag Manager
- No build process required - runs entirely in browser

For system architecture, data flows, and extension points, see [ARCHITECTURE.md](ARCHITECTURE.md). This file (`AGENT.md`) and [.cursorrules](.cursorrules) should stay in sync with the codebase and each other.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [CSS and Layout](#css-and-layout-stylescss---2960-lines)
4. [Complete Project Structure](#complete-project-structure)
5. [Core Components Architecture](#core-components-architecture)
   - [Main Application (citrana-app.js)](#main-application-citrana-appjs---2189-lines)
   - [History Engine (citrana-history.js)](#history-engine-citrana-historyjs---94-lines)
   - [Chart Coordinator](#chart-coordinator-chart-coordinatorjs---334-lines)
   - [South Indian Chart Template](#south-indian-chart-template-chart-templates-southjs---984-lines)
   - [North Indian Chart Template](#north-indian-chart-template-chart-templates-northjs---1011-lines)
   - [Graha System](#graha-system-citrana-planet-systemjs---962-lines)
   - [Citrana Arrow](#citrana-arrow-citrana-arrowjs---187-lines)
   - [Citrana Color Picker](#citrana-color-picker-citrana-colorpickerjs---370-lines)
   - [Citrana Device](#citrana-device-citrana-devicejs---39-lines)
   - [Citrana Rashis](#citrana-rashis-citrana-rashisjs---41-lines)
   - [Citrana Selection](#citrana-selection-citrana-selectionjs---98-lines)
   - [Citrana Annotation Fonts](#citrana-annotation-fonts-citrana-annotation-fontsjs---118-lines)
   - [Citrana Laser](#citrana-laser-citrana-laserjs---248-lines)
   - [Drawing Tools](#drawing-tools-citrana-drawing-toolsjs---3218-lines)
   - [Context Menu](#context-menu-citrana-context-menujs---743-lines)
   - [Citrana Items Menu](#citrana-items-menu-citrana-items-menujs---846-lines)
   - [Citrana Session](#citrana-session-citrana-sessionjs---214-lines)
   - [Edit UI](#edit-ui-citrana-edit-uijs---1020-lines)
6. [Core Features](#core-features)
   - [Undo / Redo](#undo--redo)
   - [Chart Types](#chart-types)
   - [Chart Display Options](#chart-display-options)
   - [Chart Management](#chart-management-actions)
   - [Graha Management](#planet-management)
   - [Drawing Tool Summary](#drawing-tool-summary)
   - [Control Points](#control-points-feature)
   - [User Experience](#user-experience)
   - [Export & Sharing](#export--sharing)
7. [Browser Compatibility](#browser-compatibility)
8. [Performance Optimisation](#performance-optimisation)
9. [Development Guidelines](#development-guidelines)
10. [Customisation Guidelines](#customisation-guidelines)
11. [Important Notes](#important-notes)
12. [Support and Documentation](#support-and-documentation)
13. [Development Commands](#development-commands)
14. [GitHub Actions Workflow](#github-actions-workflow)

## CSS and Layout (styles.css - ~2964 lines)

Light theme, floating UI, modals (Help and Options share modal chrome; `role="dialog"` + `aria-*`), responsive breakpoints (769px desktop, 768px tablet, 600px mobile). Most tablet/mobile rules live in one `@media (max-width: 768px)` block; **post-base mobile overrides** (Help/About position, modal compact sizing) use separate `@media` blocks **after** base component selectors so cascade order is correct.

**Layout tokens (`:root`):** Desktop — `--ui-bottom-stack` (60px), `--zoom-controls-block-height` (48px), `--corner-btn-size` (48px). Mobile `≤768px` overrides in the main mobile block — 50px chrome height (zoom bar border included), `--ui-bottom-stack: 62px`. Help icon at 50% of button; About logo at 62.5%.

**Presentation View:** `body.presentation-view` hides `.floating-top-toolbar`, `.floating-zoom-controls`, `.floating-planet-library`, `.help-btn`, `.about-btn`, `.floating-text-edit-controls`, and `.floating-edit-ui` via CSS. Toggled from context menu or **Canvas Items** panel (`app.togglePresentationView()`); dismisses active edit sessions on enter.

**Graha library layout:**
- Header, grid, and page-dots styled in CSS (`.planet-library-header`, `.planet-grid`, `.page-dots`, `.page-dots-track`, `.page-dots-chevron`) — no inline styles in `index.html`
- No grid scrolling (`overflow: visible`; no `max-height` on `.planet-grid`)
- Desktop: `repeat(auto-fit, minmax(80px, 1fr))`; 80×40px `.planet-item` cells; page dots only (no chevrons)
- Mobile (≤768px): 6×2 grid, 320px library width, compact vertical padding, 30px cells with 7px font and `word-break: break-word` for Page 5 Upagraha names; **swipe left/right on `.page-dots` bar only** to change pages (grey `chevrons-left` / `chevrons-right` hints at each end; dots remain tappable); keyboard **1**–**5** switches pages on all viewports

**Canvas Items modal layout (`#items-modal`):**
- `#items-modal .options-modal-content` — flex column, `overflow: hidden` (modal shell does not scroll)
- Pinned: header, `#items-modal-description`, `#items-modal-nav` Section Anchors (`.items-section-nav-wrap`)
- Scrollable list only: `#items-modal-body` with `--items-scrollbar-gutter` (scrollbar in outer gutter, Help-style thumb)
- Section Anchors: `.items-section-nav-scroll-wrap` with mobile horizontal edge fades (`items-section-nav-fade-start` / `items-section-nav-fade-end`)
- Context Menu row: `.items-row-context-menu-on` (green tint) / `.items-row-context-menu-off` (red tint); **Graha Library** row reuses same On/Off row tint (`orbit` icon; independent of Presentation View)

**Mobile toolbar / Edit UI scroll:**
- `.toolbar-scroll-wrap` with `.toolbar-scroll-fade-start` / `.toolbar-scroll-fade-end` edge gradients (≤768px) alongside chevron scroll buttons

**JSColorPicker theme (`--cp-*` in `:root`):** chip size, borders, swatch width, shadows — aligned to Citrana light theme. Compact toolbars hide hex input, format tabs, and dropdown caret (`.cp_input`, `.cp_formats`, `.cp_caret`).

**iOS standalone PWA (2.0):**
- Safe-area CSS vars (`--sat` … `--sal`, `--ui-inset`, `--ui-bottom-pad`, `--ui-bottom-stack`)
- `body { position: fixed; inset: 0 }` — avoids bottom gap on iOS
- `viewport-fit=cover`; manifest `display: standalone`
- Mobile: Graha library bottom stack; Help bottom-left; drawing tools visible in toolbar; toolbar and Edit UI horizontal scroll with chevrons and edge fades when controls overflow; **Canvas Items** button in zoom bar

## Complete Project Structure

| Path | Lines | Description |
|------|-------|-------------|
| `index.html` | ~600 | Main entry; viewport-fit=cover; PWA meta; Google Fonts Caveat; modal a11y; Canvas Items modal; Options modal (zoom step); script tags at bottom in **dependency order** (see below) |
| `robots.txt` | — | Search engine rules |
| `sitemap.xml` | — | Sitemap |
| `assets/css/styles.css` | ~2964 | Complete styling; primary mobile block + post-base overrides; JSColorPicker `--cp-*` theme; `.items-*` panel (`.items-section-nav-wrap`, `.items-section-nav-scroll-wrap`, `.items-section-chip`, `.items-row-context-menu-on/off`); `#graha-library.graha-library-hidden`; `.page-dots-chevron`; `#items-modal` pinned layout; `.citrana-laser-canvas`; `body.presentation-view`; `.toolbar-scroll-*` (toolbar + Edit UI edge fades) |
| `assets/js/citrana-annotation-fonts.js` | ~118 | Normal and hand-written annotation fonts |
| `assets/js/citrana-app.js` | ~2189 | Main application coordinator |
| `assets/js/citrana-arrow.js` | ~185 | Unified filled-arrow geometry |
| `assets/js/citrana-chart-coordinator.js` | ~334 | Chart type management |
| `assets/js/citrana-chart-templates-north.js` | ~1011 | North Indian chart logic |
| `assets/js/citrana-chart-templates-south.js` | ~989 | South Indian chart logic |
| `assets/js/citrana-colorpicker.js` | ~388 | JSColorPicker theme and helpers |
| `assets/js/citrana-context-menu.js` | ~742 | Context menu system |
| `assets/js/citrana-debug.js` | ~13 | Contributor debug logging (on by default) |
| `assets/js/citrana-device.js` | ~39 | Touch, mobile UA, and viewport helpers |
| `assets/js/citrana-drawing-tools.js` | ~3218 | Drawing tools implementation |
| `assets/js/citrana-edit-ui.js` | ~1020 | Edit interface controls |
| `assets/js/citrana-history.js` | ~94 | Unified undo/redo timeline |
| `assets/js/citrana-items-menu.js` | ~846 | Canvas Items panel — chart/Bhava/Graha/Annotation actions; Section Anchors; Context Menu and Graha Library toggles; list-only scroll; mobile anchor fades |
| `assets/js/citrana-laser.js` | ~248 | Ephemeral laser pointer Canvas overlay |
| `assets/js/citrana-planet-system.js` | ~962 | Graha library and drag-drop; visibility toggle; dots-bar swipe; chevron hints |
| `assets/js/citrana-rashis.js` | ~49 | Rashi names, Lucide zodiac icons, grid numbers |
| `assets/js/citrana-selection.js` | ~98 | Selection Pill |
| `assets/js/citrana-session.js` | ~225 | Save/open `.citrana.json` session files |
| `assets/js/citrana-zoom.js` | ~59 | Zoom step presets (`CitranaZoom`) for buttons, keyboard, and scroll wheel |
| `assets/vendor/konva.min.js` | — | Konva 9.3.20 (self-hosted; loaded in `<head>`) |
| `assets/vendor/lucide.min.js` | — | Lucide 0.576.0 (self-hosted) |
| `assets/vendor/colorpicker.iife.min.js` | — | JSColorPicker 1.1.0 (self-hosted) |
| `assets/vendor/colorpicker.min.css` | — | JSColorPicker 1.1.0 stylesheet |
| `assets/images/` | 14 files | Logos, demo GIFs, browser screenshot |
| `assets/svgs/north-indian.svg` | — | North Indian chart template |
| `assets/svgs/south-indian.svg` | — | South Indian chart template |
| `assets/favicon/` | 29 files | Favicon set, `manifest.json` (PWA standalone), `browserconfig.xml` |
| `.github/workflows/static.yml` | — | GitHub Pages deploy with minification (push to `main`) |
| `.github/workflows/codeql.yml` | — | CodeQL security analysis |
| `AGENT.md` | ~1260 | Comprehensive documentation |
| `ARCHITECTURE.md` | ~542 | System architecture and data flows |
| `.cursorrules` | ~1293 | Cursor IDE configuration |
| `CHANGELOG.md` | ~98 | Version history |
| `README.md` | ~299 | Project readme |
| `LICENSE` | — | MIT License |
| `SECURITY.md` | — | Security policy |
| `.gitignore` | — | Git ignore rules |

> Line counts are approximate; run `wc -l` after significant edits. Update About modal version in `index.html` on each release.

## Script load order (`index.html`)

Citrana uses classic `<script>` tags (no bundler). Each file expects globals from scripts **above** it. **Do not sort alphabetically** — that would load `citrana-app.js` before `ChartCoordinator`, `PlanetSystem`, `CitranaZoom`, etc., and break init.

**Vendor and head:** Konva loads in `<head>`; Lucide and JSColorPicker load at the bottom before local modules.

**Local `citrana-*.js` order** (must match `index.html`):

1. `citrana-debug.js` — logging helper
2. `citrana-device.js` — `CitranaDevice`
3. `citrana-rashis.js` — `CitranaRashis`
4. `citrana-selection.js` — `CitranaSelection` (uses `CitranaDevice`)
5. `citrana-annotation-fonts.js`
6. `citrana-chart-templates-south.js` — uses `CitranaRashis`, `CitranaDevice`
7. `citrana-chart-templates-north.js` — same
8. `citrana-zoom.js` — `CitranaZoom` (before coordinator and session)
9. `citrana-chart-coordinator.js` — templates + `CitranaZoom`
10. `citrana-planet-system.js` — coordinator
11. `citrana-arrow.js` — before color picker
12. `citrana-colorpicker.js`
13. `citrana-laser.js` — before drawing tools
14. `citrana-drawing-tools.js`
15. `citrana-edit-ui.js`
16. `citrana-context-menu.js` — before Canvas Items menu
17. `citrana-items-menu.js`
18. `citrana-history.js`
19. `citrana-session.js` — uses `CitranaZoom`
20. `citrana-app.js` — **always last**; creates `window.app`

**When adding a module:** insert it after everything it depends on and before anything that depends on it; update `index.html`, `.github/workflows/static.yml` (minify + `sed` rewrite), and this list. CI minifies files in alphabetical order for convenience — that order is **not** the browser load order.

See also [ARCHITECTURE.md](ARCHITECTURE.md) — Runtime Composition table.

## Core Components Architecture

For system design, module boundaries, data flows, and extension points, see [ARCHITECTURE.md](ARCHITECTURE.md).

### Main Application (citrana-app.js - ~2189 lines)
The central coordinator that manages all application components and lifecycle.

Key Responsibilities:
- Initialises Konva.js stage and layer
- Coordinates all component interactions
- Manages tool selection and drawing state
- Handles keyboard shortcuts and event listeners
- Manages unified undo/redo via `CitranaHistory` (`citrana-history.js`)
- Handles chart export (full viewport or chart-only crop via Options)
- Manages chart display options modal and `localStorage` preferences (indicators, Save Chart Only)
- **Save/Open Session** via `CitranaSession` (`.citrana.json` files); shared progress dialog for save and open
- Initialises **Canvas Items** panel (`CitranaItemsMenu`) and toolbar horizontal scroll
- Provides mobile touch support and Safari compatibility
- Manages zoom controls, zoom lock (default locked), zoom level display, canvas resize (`visualViewport`), and **Presentation View**
- Manages modal open/close, focus trap, and Escape dismiss for all overlays (including operation progress and **Canvas Items** modal)

Key Methods:
- `init()`: Application initialisation; loads `this.options` from `localStorage`
- `setupCanvas()`: Konva stage; `scaleXChange`/`scaleYChange` → `updateZoomLevel()`
- `setupToolbarScroll()`: Horizontal toolbar overflow with `#toolbar-scroll-wrap`, chevrons, and mobile edge fades (`toolbar-scroll-fade-start` / `toolbar-scroll-fade-end`)
- `setupKeyboardShortcuts()`: Tool/action shortcuts; **I** toggles **Canvas Items** panel (open/close); **Escape** → `dismissActiveModalOnEscape()`; **Tab** → `trapModalFocus()` when a modal is open; otherwise blocked while inline Graha/text editors are focused or `isModalBlockingShortcuts()` (Help, Options, About, Welcome, Confirmation, Canvas Items, operation progress)
- `openModal(modal)` / `closeModal(modal)`: Toggle `.active` and `aria-hidden`; push/pop `_modalFocusStack`; focus close button on open
- `closeWelcomeModal()`: Welcome close + `localStorage.citrana_welcome_seen`
- `getActiveModal()` / `dismissActiveModalOnEscape()`: Topmost modal; Escape dismiss (operation progress not dismissible)
- `getModalFocusableElements()` / `getModalInitialFocusElement()` / `focusModalEntry()` / `trapModalFocus()`: Modal focus trap
- `pushModalFocus()` / `popModalFocus()`: Focus restore on modal close
- `isModalBlockingShortcuts()`: Returns true when any modal overlay is open
- `isTouchDevice()`: Delegates to `CitranaDevice.isTouchDevice()`
- `setTool()`: Tool routing to drawing tools and hand mode
- `zoomIn()` / `zoomOut()` / `zoomToFit()`: Delegate to `ChartCoordinator` (`zoomIn`/`zoomOut` no-op when locked; `zoomToFit` always works)
- `toggleZoomLock()` / `updateZoomLockUI()`: Toggle `zoomLocked`; swap `#zoom-lock` icon (`lock` / `lock-open`); disable `#zoom-in` / `#zoom-out`
- `updateZoomLevel()`: Updates `#zoom-level` from `stage.scaleX()`
- `handleResize()`: Stage size from `visualViewport` or container; `CitranaLaser.resize()` syncs laser overlay
- `handleWheel()`: Desktop wheel zoom about pointer when unlocked; early return when locked (no `preventDefault`)
- `exportChart()` / `finalizeExportImage()`: PNG export (`pixelRatio: 2`); full stage or chart-only crop when `options.saveChartOnly`; `isExporting` guard; shared `#export-progress-modal`
- `setNorthHideIndicators(hide)` / `setSouthHideIndicators(hide)`: Persist indicator toggles; apply to active chart template
- `setSaveChartOnly(enabled)` / `applySaveChartOnlyTransparency()` / `updateTransparencyToggleUI()`: Chart-only export preference; when enabled forces transparent export and locks `#toggle-transparency-btn`; when disabled restores `exportWithWhiteBg = true`
- `recordHistory()` / `captureHistoryState()` / `restoreHistoryState()`: Undo timeline integration; `restoreHistoryState()` saves/restores stage scale and position (chart reload via `loadChartData()` calls `clearChart()`, which resets the viewport — restored after reload); templates use `skipZoomToFit: true` on history restore
- `undo()` / `redo()` / `updateHistoryButtons()`: Delegate to `this.history`; sync `#undo-btn` / `#redo-btn` disabled state
- `clearChart()` / `resetChart()` / `resetDrawings()`
- `isPresentationView()` / `togglePresentationView()`: Toggle `presentationView` and `body.presentation-view`; hides toolbar, zoom bar, Graha library, Help, About, Graha bar, and drawing Edit UI; dismisses open edit sessions on enter; Safari visibility fix skips when active; not undoable
- `clearWelcomeLoadingInterval()` / `showWelcomeModal()`: Welcome progress timer cleared on close or at 100%
- Mouse/touch handlers: `handleMouseDown/Move/Up`, `handleTouchStart/Move/End`; `handleTouchStart/Move` call `drawingTools.shouldPreserveTouchDrag()` before `preventDefault`; empty-canvas `mousedown`/`tap` → `clearCanvasSelection()`; `_selectPointerDownOnDrawing` prevents stage `tap` from clearing selection when pointer down was on a drawing but release was elsewhere
- `isAnnotationTarget()`: Pen tool — blocks starting a stroke only on existing annotations, not on chart Bhavas
- `clearCanvasSelection()` / `getCanvasSelection()` / `notifyCanvasSelectionChanged()`: Unified selection state for Canvas Items panel row highlight
- `setupSafariToolbarFix()`: Touch Safari UI visibility restore on focus/viewport events (`visualViewport` resize/scroll; no polling timer)
- `showConfirmationDialog()`
- `showProgressModal()` / `updateProgressModal()` / `hideProgressModal()` / `completeProgressModal()` / `failProgressModal()`: Shared operation progress dialog (`#export-progress-modal`); dynamic title; focus trap and `aria-busy`; not dismissible via Escape
- `showExportProgress()` / `updateExportProgress()` / `hideExportProgress()`: Export wrappers for the shared progress dialog
- `saveSession()` / `openSessionFromFile()` / `applyImportedSession()` / `restoreSessionState()`: `.citrana.json` via `CitranaSession`; save/open use progress modal; confirm before replace; `isSessionBusy` blocks concurrent save/open/export; `history.resetToState()` on import
- `hasSessionContent()`: Whether chart or drawings exist before session replace prompt

Keyboard shortcuts: `V` Select, `A` Arrow, `L` Line, `P` Pen, `K` Laser Pointer (when available), `T` Text, `H` Hand, `1`–`5` Graha Library pages, `I` Canvas Items (toggle open/close), `Ctrl+Z`/`Cmd+Z` undo, `Ctrl+Y`/`Ctrl+Shift+Z`/`Cmd+Shift+Z` redo, `+`/`-` zoom (when unlocked), `0` zoom to fit, `Delete` remove selected Graha or delete selected drawing (Select tool), `?`/`/` Help, **Escape** close modal. No Heading shortcut. Ignored when a modal is open (except **Escape**/**Tab** for modal UX, and **I** to close Canvas Items when open) or Graha/text inline editor is focused.

### History Engine (citrana-history.js - ~94 lines)
Unified undo/redo timeline for the entire session.

Key Responsibilities:
- Stores labelled snapshots (`entries[]`, `index`, `maxSteps: 50`)
- Deep-clones state on `record()` to prevent timeline corruption
- Suppresses recording during `restoreState()` via `_restoring`

Key Methods:
- `record(label)`: Capture and append snapshot; truncate redo branch
- `undo()` / `redo()`: Move index and call `restoreState`
- `canUndo()` / `canRedo()`: Query availability

Wired in `app.setupComponents()` with `captureState` → `captureHistoryState()` and `restoreState` → `restoreHistoryState()`.

### Chart Coordinator (citrana-chart-coordinator.js - ~334 lines)
Manages the relationship between South Indian and North Indian chart templates.

Key Responsibilities:
- Routes operations to appropriate chart template
- Manages chart type switching
- Provides unified interface for chart operations
- In-session chart serialisation (`getChartData` / `loadChartData` for undo snapshots)
- Stage zoom (`zoomIn`, `zoomOut`, `zoomToFit`) and zoom level display delegation
- Pointer-to-bhava hit-test for Graha library drops

Key Methods:
- `createSouthIndianChart()` / `createNorthIndianChart()`: Initialise layouts
- `setLagnaHouse(houseNumber, options?)`: Set ascendant; `options.skipSnapshot` suppresses undo step during `loadChartData()` restore (both templates)
- `getChartData()` / `loadChartData()`: Serialise / restore chart (in-session)
- `stagePointerToChartCoords()` / `clientToChartCoords()`: Map pointer to chart space
- `findHouseAtChartPoint()` / `findHouseAtPointer()` / `findHouseAtClientPoint()`: Drop targeting
- `zoomIn()` / `zoomOut()` / `zoomToFit()` / `updateZoomLevel()` — `zoomToFit()` routes by `currentChartType` (not group existence)
- `hasActiveChart()` / `getExportCropRect()` / `unionClientRects()`: Chart-only PNG crop bounds in stage pixels
- `addPlanetToHouse()`, `clearAllPlanets()`, `clearChart()`
- `getStage()`: Konva stage (used by Graha library drop coords)

**Removed:** `setFirstHouse()`, `getDropZones()`, `highlightHouse()`, `clearHighlight()`, `renumberHouses()` (use template methods directly).

### South Indian Chart Template (citrana-chart-templates-south.js - ~989 lines)
Handles the traditional South Indian chart layout with 4x4 grid structure.

Key Responsibilities:
- Creates 4x4 grid layout with centre empty space
- Manages Bhava numbering and Lagna indicators
- Handles Graha placement and text scaling
- Provides Bhava highlighting and selection
- Manages Rashi and Bhava number boxes
- Handles Bhava and Graha right-clicks (`stopPropagation`) for context menus

Key Features:
- Traditional square grid layout
- Centre empty space for annotations
- Lagna indicator with diagonal line
- Dynamic Graha text sizing
- Bhava renumbering based on Lagna position
- Touch and mouse interaction support

Key Methods:
- `createSouthIndianChart(options?)`: Build chart layout; `options.skipZoomToFit` skips fit on undo restore
- `createHouse()`: Create individual Bhava elements
- `addPlanetToHouse()`: Place Grahas in Bhavas
- `setLagnaHouse(houseNumber, options?)`: Set ascendant with visual indicator; `skipSnapshot` for undo restore
- `renumberHouses()`: Update Bhava numbering
- `getBhavaNumberForHouse()`: Get Bhava number (1–12 from Lagna) for a fixed grid cell
- `findHouseAtChartPoint()`: Rectangle hit-test (with nearest-Bhava fallback) for library drops
- `highlightHouse()` / `clearHighlight()`: Visual Bhava selection (`#f3f4f6`)
- `selectPlanet()` / `clearSelectedPlanet()`: Graha selection via `CitranaSelection`
- Rashi number boxes use `CitranaRashis.getNumberForHouseIndex()`; mobile fit uses `CitranaDevice.isCompactViewport()` / `isMobileUA()`
- `setSouthIndicatorsVisible(visible)` / `applySouthIndicatorsPreference()`: Show or hide lagna line and bhava/rashi boxes per `app.options`
- `zoomToFit()`: Fit chart to viewport using **local bounds**; compact viewport (`≤600px`): fixed **65%** scale; desktop: computed fit (`scaleFactor=0.7`)

### North Indian Chart Template (citrana-chart-templates-north.js - ~1011 lines)
Handles the diamond-shaped North Indian chart layout with polygon-based Bhavas.

Key Responsibilities:
- Creates diamond-shaped polygon layout
- Manages complex Bhava positioning
- Handles tiny Rashi number boxes
- Provides advanced Rashi numbering logic (`lagnaHouseNorth` stores Rashi 1–12)
- Manages Graha placement in polygon Bhavas with per-Graha `rashiNumber`
- Handles Bhava and Graha right-clicks (`stopPropagation`) for context menus

Key Features:
- Diamond-shaped polygon layout
- Precise Bhava positioning using SVG coordinates
- Tiny Rashi number boxes with exact positioning
- Advanced Rashi numbering system
- Dynamic Bhava renumbering
- Polygon-based hit detection

Key Methods:
- `createNorthIndianChart(options?)`: Build diamond layout; `options.skipZoomToFit` skips fit on undo restore
- `addPlanetToHouse()`: Place Grahas in polygon Bhavas
- `setLagnaHouse(houseNumber, options?)`: Set Lagna rashi; renumber and `repositionPlanetsForNewLagna()`; `skipSnapshot` for undo restore
- `renumberHouses()`: Update Bhava numbering
- `isPointInPolygon()`: Hit detection for polygon Bhavas
- `getRashiNumberForHouse()`: Rashi calculation
- `findHouseAtChartPoint()`: Polygon hit-test (with nearest-centroid fallback) for library drops
- `highlightHouse()` / `clearHighlight()`: Visual Bhava selection (`#f3f4f6`)
- `selectPlanet()` / `clearSelectedPlanet()`: Graha selection via `CitranaSelection`
- `raiseDrawingsAboveChart()` / `syncNorthChartLayerOrder()`: Keep annotations above chart layer
- Lagna logging uses `CitranaRashis.getName()`; mobile fit uses `CitranaDevice.isCompactViewport()`
- `setNorthIndicatorsVisible(visible)` / `applyNorthIndicatorsPreference()`: Show or hide `tinyBoxGroupNorth` (bhava numbers in black corner boxes) per `app.options`
- `zoomToFit()`: Fit chart to viewport using **local bounds**; compact viewport (`≤600px`): fixed **82%** scale; desktop: computed fit (`scaleFactor=0.7`, `extraTopMargin=-50`)

### Graha System (citrana-planet-system.js - ~962 lines)
Manages the floating Graha library and drag-and-drop functionality with paging system.

Key Responsibilities:
- Creates and manages floating Graha library UI with paging
- Implements drag-and-drop for Graha placement
- Handles touch and mouse interactions
- Manages Graha data and visual representations
- Provides drop zone detection and validation
- Implements mobile-friendly drag preview
- Manages paging navigation for desktop and mobile

Key Features:
- Floating, draggable Graha library with paging
- 60 Grahas across five pages (12 per page)
- Desktop navigation with clickable page dots; keyboard **1**–**5** on all viewports
- Mobile paging: swipe left/right on **`.page-dots` bar only** (not the Graha grid or header — avoids accidental panel moves or Graha drags); decorative grey chevron hints (`.page-dots-chevron`, `chevrons-left` / `chevrons-right`); dots remain tappable
- **Visibility toggle:** show/hide floating library via Canvas Items → **Graha Library** (On/Off; `localStorage.citrana_graha_library_enabled`; default on; `#graha-library.graha-library-hidden`) — independent of Presentation View
- Drag preview with visual feedback
- Touch and mouse support
- Drop zone validation
- Mobile-optimised interactions
- Library cells render `fullName` labels; grid layout has no scroll (desktop auto-fit columns; mobile 6×2)

Graha Library - Page 1 (Traditional Grahas):
- Lg: Lagna (Ascendant)
- Su: Sun
- Mo: Moon
- Me: Mercury
- Ve: Venus
- Ma: Mars
- Ju: Jupiter
- Sa: Saturn
- Ra: Rahu
- Ke: Ketu
- Md: Maandi
- Cu: Custom

Graha Library - Page 2 (Jaimini Karakas):
- AK: Atmakaraka
- AmK: Amatyakaraka
- BK: Bhratrikaraka
- MK: Matrikaraka
- PK: Pitrikaraka
- GK: Gnatikaraka
- DK: Dara Karaka
- AL: Arudha Lagna
- UL: Upapada Lagna
- KL: Karakamsa Lagna
- HL: Hora Lagna
- SL: Sree Lagna

Graha Library - Page 3 (Tamil Grahas):
- ல: லக்கினம் (Lagna)
- சூ: சூரியன் (Sun)
- சந்: சந்திரன் (Moon)
- பு: புதன் (Mercury)
- சுக்: சுக்ரன் (Venus)
- செவ்: செவ்வாய் (Mars)
- குரு: குரு (Jupiter)
- சனி: சனி (Saturn)
- ரா: ராகு (Rahu)
- கே: கேது (Ketu)
- மா: மாந்தி (Maandi)
- ப: பயன் (Custom)

Graha Library - Page 4 (Hindi Grahas):
- लग्न: लग्न (Lagna)
- सूर्य: सूर्य (Sun)
- चंद्र: चंद्र (Moon)
- बुद्ध: बुद्ध (Mercury)
- शुक्र: शुक्र (Venus)
- मंगल: मंगल (Mars)
- गुरु: गुरु (Jupiter)
- शनि: शनि (Saturn)
- राहु: राहु (Rahu)
- केतु: केतु (Ketu)
- मांदी: मांदी (Maandi)
- कस: कस्टम (Custom)

Graha Library - Page 5 (Upagrahas & Outer Grahas):
- Dh: Dhuma
- Vy: Vyatipata
- Pv: Parivesha
- Ic: Indra Chapa
- Uk: Upaketu
- Kl: Kala
- Mr: Mrityu
- Ap: Ardha Prahara
- Yg: Yama Ghantaka
- Ur: Uranus
- Ne: Neptune
- Pl: Pluto

Key Methods:
- `init()`: Initialise Graha library
- `isGrahaLibraryEnabled()` / `setGrahaLibraryEnabled()` / `toggleGrahaLibrary()` / `applyGrahaLibraryVisibility()` — persisted in `localStorage.citrana_graha_library_enabled`
- `getGrahaLibraryItemsTitle()` / `getGrahaLibraryItemsMeta()` / `getGrahaLibraryToggleActionLabel()` — Canvas Items panel **Graha Library** row copy
- `createPlanetLibrary()`: Build UI elements with paging
- `createPageDots()`: Create page dots in `.page-dots-track` with mobile chevron hints
- `setupSwipeEvents()`: Horizontal swipe listeners on `.page-dots` only (`pageDotsEl`)
- `goToPage()`: Navigate between pages
- `setupDragAndDrop()`: Configure drag functionality
- `handleDragStart/Move/End()`: Drag interaction handling
- `handleTouchStart/Move/End()`: Touch interaction handling
- `handleDrop()` / `handleMobileDrop()`: Place Graha on chart (one-shot selected bhava or pointer hit-test)
- `clearSelectedBhavaDropTarget()`: Clear `window.selectedBhavaSouth` / `window.selectedBhavaNorth` after a successful library drop
- `findHouseAtPosition()`: Delegates to `ChartCoordinator.findHouseAtClientPoint()` (viewport coords for touch / drop fallback)
- `getPlanetInfo()`: Retrieve Graha data from paged structure

### Drawing Tools (citrana-drawing-tools.js - ~3218 lines)
Comprehensive drawing system with multiple tools and editing capabilities.

Key Responsibilities:
- Implements all drawing tools (select, arrow, line, pen, laser, text, heading)
- Creates arrows via `CitranaArrow.create()` (filled `Konva.Line`, not `Konva.Arrow`)
- Delegates laser pointer to `CitranaLaser` (Canvas 2D overlay — not Konva, not serialised)
- Converts completed pen strokes to tapered `Konva.Shape` nodes (`penTaper`, `penTaperPoints`, `penTaperWidths`, `penStrokeColor`, `penBaseWidth`)
- Invisible `bounding-box-{type}` pick rects for line/arrow/pen hit-testing; pen uses `bindPenPickRectInteraction()` (click select, double-click edit, drag-after-threshold move; `beginManualPenDrag()` on touch)
- Calls `window.app.recordHistory()` for drawing and Graha edit actions (laser excluded)
- Handles shape selection and editing; `CitranaSelection` for text/heading/pen annotations (`syncPenSelectionPill()` for tapered pens)
- Provides precise positioning and hit detection (`normalizeDrawingShape()`, `repairPenPickRects()`, `raiseDrawingsAboveChart()`)
- Manages Edit UI integration (`editPenAnnotation()` — same path as Canvas Items → Edit)
- Implements Graha text editing (`#text-edit-controls` bar; colour via `#text-edit-color` + `CitranaColorPicker`)

Available Tools:
- Select Tool: Choose and modify existing elements; pen strokes — click/tap select, drag/touch-drag move, double-click/double-tap Edit UI
- Arrow Tool: Create directional indicators with arrowheads and control points
- Line Tool: Draw straight lines and connections with control points
- Pen Tool: Freehand drawing — live uniform preview while drawing; on release, smoothed path with velocity-based width and end taper (default **4px** base, full opacity)
- Laser Pointer: Ephemeral presentation highlight via `CitranaLaser`; stays active for continuous drawing like Pen
- Text Tool: Add editable text boxes (multi-line inline editor)
- Heading Tool: Create chart headings and titles (multi-line inline editor)

Key Features:
- Pixel-perfect positioning
- Touch and mouse support
- Shape selection and editing
- Colour and stroke customisation
- Default stroke widths: Pen **4px**, Line and Arrow **4px** (`PEN_DEFAULT_STROKE_WIDTH` + `citrana-edit-ui.js` defaults)
- Text editing with font controls via Edit UI and `CitranaAnnotationFonts`
- Graha text editing with retrograde underline support (Konva `textDecoration`)
- Graha edit sessions: **Save** / click-away / Enter → `dismissPlanetEditing()` (commits if dirty); **Cancel** / Escape → `cancelPlanetEditing()` (discards)
- Auto-switch to Select Tool after Arrow, Line, Text, and Heading creation; Pen and Laser stay active for continuous drawing
- `makeShapeSelectable()` binds drag/selection once when a stroke completes (`stopDrawing`), not on every mousemove; touch double-tap guarded by `_editUiDoubleTapBound`
- Control points for arrow/line adjustment with desktop hover feedback; `raiseControlPointsAbovePickRects()` keeps handles above pick rects; `Adjust drawing` on handle drag end
- `syncBoundingBoxListening()` enables pick rects only in Select tool; larger pen pick padding on mobile
- Touch pen drag: `shouldPreserveTouchDrag()`, `isPenDragActive`, `getDomEventClientXY()`, `beginManualPenDrag()`

Key Methods:
- `startDrawing()` / `draw()` / `stopDrawing()`: Drawing lifecycle; pen finalisation via tapered `Konva.Shape`
- `bindPenPickRectInteraction()` / `beginManualPenDrag()` / `editPenAnnotation()` / `shouldPreserveTouchDrag()`
- `syncBoundingBoxListening()` / `repairPenPickRects()` / `raiseControlPointsAbovePickRects()` / `raiseDrawingsAboveChart()`
- `normalizeDrawingShape()` / `findDrawingAtLayerPoint()` / `resolveDrawingHitTarget()`
- `makeShapeSelectable()` / `bindMoveDragHistory()`: Selection and move undo
- `editPlanetText()` / `dismissPlanetEditing()` / `cancelPlanetEditing()`: Graha label/colour/retrograde bar — dismiss commits if edited (click outside); cancel discards (Cancel / Escape)
- `editText()` / `editHeading()`: Inline content editors with undo on commit; hide Edit UI before opening; **Shift+Enter** new line, **Enter** finish
- `startInlineContentEdit()` / `focusInlineTextarea()`: Canvas Items **Edit text** and double-click path for Text/Heading
- `showEditUIForShape()`: Edit interface integration
- `setPlanetRetrogradeState()`: Persist retrograde underline on Graha text
- `createControlPoints()` / `commitControlPointAdjust()` / `bindControlPointHover()`: Arrow/line endpoint handles
- `updateControlPointsPosition()` / `clearControlPoints()`: Control point sync
- `restorePersistedDrawings()`: Rebuild drawings from history snapshots; migrates legacy `Konva.Arrow` via `CitranaArrow.fromLegacyNode()`; restores tapered pen shapes; calls `bindRestoredDrawingInteractions()`
- `bindRestoredDrawingInteractions()`: Re-bind selection/drag handlers after undo or session restore
- `clearLaser()` / `isLaserToolAvailable()`: Laser overlay lifecycle; delegates to `CitranaDevice.isLaserViewport()`
- Touch detection via `CitranaDevice.isTouchDevice()`; mobile font sizing via `CitranaDevice.isMobileUA()`

### Citrana Device (citrana-device.js - ~39 lines)
Shared touch, mobile UA, and viewport helpers.

Key Methods:
- `isTouchDevice()`, `isMobileUA()`, `isCompactViewport()` (`innerWidth <= 600`), `isLaserViewport()` (all viewports), `hasFinePointer()`

Used by `citrana-app.js`, chart templates, `citrana-drawing-tools.js`, `citrana-context-menu.js`, and `citrana-laser.js`.

### Citrana Rashis (citrana-rashis.js - ~49 lines)
Shared Rashi names, Lucide zodiac icons (`zodiac-aries`, …), and South Indian grid numbers (1–12).

Key Exports:
- `RASHIS`: Array of `{ name, icon, number }` for all 12 signs
- `NAMES`, `NUMBERS`: Derived arrays
- `getName(rashiNumber)`, `getNumberForHouseIndex(houseIndex0to11)`, `iconHtml(icon)`

Used by `citrana-context-menu.js` (North **Set Lagna as …** submenu), chart templates, and `citrana-items-menu.js` (South Bhava row labels).

### Citrana Selection (citrana-selection.js - ~98 lines)
**Selection Pill** — colour-independent dashed outline behind selected Graha labels and Text/Heading/Pen Stroke Annotations.

Key Responsibilities:
- Dashed transparent `Konva.Rect` (`selection-pill`) behind selected label text or pen bounds
- `listening: false` on pill; label text stays on top for hit-testing
- Pen strokes use `syncPenSelectionPill()` with bounds from `getTaperedPenBoundsInLayer()`
- Extra padding on mobile (`CitranaDevice.isMobileUA()`)

Key Methods:
- `attach(labelText, parentContainer)`, `sync(labelText)`, `detach(labelText)`

Wired from South/North `selectPlanet()` / `clearSelectedPlanet()`, annotation `selectShape()` (text/heading/pen), and on Graha `dragmove`.

### Citrana Annotation Fonts (citrana-annotation-fonts.js - ~118 lines)
Normal vs Hand-written typography for Text and Heading Annotations.

Key Responsibilities:
- **Normal mode:** Arial / Arial Black + `fontWeight` for bold
- **Hand-written mode:** Caveat / **Caveat Brush** (bold uses separate family — Konva has no real `fontWeight` slot for canvas fonts)
- Italic via `fontStyle: 'italic'` in both modes
- `ensureLoaded()` preloads Google Fonts (called from app init and Edit UI before hand-written bold)

Key Methods:
- `isHandwritten()`, `isBold()`, `isItalic()`, `setBold()`, `setItalic()`, `setMode()`, `ensureLoaded()`
- Constants: `MODE_NORMAL`, `MODE_HANDWRITTEN`

Consumed by `citrana-edit-ui.js` (**Normal** / **Hand-written** buttons, bold/italic toggles). Font families persist in session/undo via Konva `toObject()`.

### Citrana Laser (citrana-laser.js - ~248 lines)
Ephemeral laser pointer for presentations — separate from Konva chart objects.

Key Responsibilities:
- Canvas 2D overlay (`.citrana-laser-canvas`) above the Konva stage; `pointer-events: none`
- Dense point sampling (`SAMPLE_STEP` 1px) for smooth trails; ~3s fade per stroke (`FADE_DURATION_MS`)
- Independent stroke groups per mouse gesture; `pruneStrokes()` removes expired points in place (preserves `activeStroke` reference)
- Not included in `serializeDrawings()`, undo/redo, or PNG export (overlay is outside Konva `toDataURL`)
- Initialised from `DrawingTools` constructor via `CitranaLaser.init(stage)`
- Cleared on `clearAll()` / chart reset paths that call `drawingTools.clearAll()`

Key Methods:
- `init()`, `startStroke()`, `extendStroke()`, `endStroke()`, `clear()`, `resize()`, `isAvailable()` — `isAvailable()` delegates to `CitranaDevice.isLaserViewport()`

Availability: `CitranaDevice.isLaserViewport()` returns `true` on all viewports including mobile/touch.

### Citrana Arrow (citrana-arrow.js - ~186 lines)
Unified filled-arrow geometry — shaft and head are one `Konva.Line` polygon so semi-transparent colours render correctly.

Key Responsibilities:
- `buildOutlinePoints()` — constant-width shaft + prominent triangular head (no taper)
- Stores tail/tip in `arrowAnchors`; serialises `arrowStrokeWidth`, `arrowPointerLength`, `arrowPointerWidth`
- `fromLegacyNode()` converts saved `Konva.Arrow` instances on restore

Key Methods:
- `create()`, `rebuild()`, `setAnchor()`, `setStrokeWidth()`, `isArrow()`, `getAnchors()`

### Citrana Color Picker (citrana-colorpicker.js - ~370 lines)
Centralised [JSColorPicker](https://www.jscolorpicker.com/) v1.1.0 integration.

Key Responsibilities:
- `SWATCHES` — 16 Apple-style rainbow colours (shared by Graha bar and drawing Edit UI; 2 rows × 8 in dialog)
- Chip toggles in toolbars; alpha slider; format tabs hidden (`formats: false`)
- `applyToKonvaArrow()` / `fromKonvaShape()` — opaque paint + `shape.opacity()` for arrows and picker round-trip

Key Methods:
- `attach()`, `destroy()`, `getValue()`, `setValue()`, `createInput()`, `initGrahaBar()`, `setGrahaPickCallback()`
- `parseColorString()`, `toHex()`, `toRgbaString()`, `isPickerPopupTarget()`

Vendor: `assets/vendor/colorpicker.iife.min.js`, `colorpicker.min.css`. Theme overrides: `--cp-*` in `styles.css`.

### Context Menu (citrana-context-menu.js - ~742 lines)
Provides right-click and long-press context menus for chart, bhava, and Graha interaction.

Key Responsibilities:
- Unified hit-test routing via `openContextMenuAtClientPoint()` (desktop right-click and mobile 500ms long-press)
- **`shouldBlockCanvasContextMenu()`**: Suppresses canvas menus when disabled by user, while drawing, or when active tool is not Select/Hand
- **Default enablement**: `resolveDefaultCanvasContextMenuEnabled()` — on when `CitranaDevice.hasFinePointer()`; **off** on touch-primary devices until enabled via Canvas Items
- Creates context-sensitive menus with chart-type-specific items
- **Presentation View** on create chart, existing chart, and Bhava menus via `getPresentationViewMenuHtml()`
- Prevents chart menu from overriding Graha or bhava menus
- Implements mobile-friendly touch interactions

Menu Types:
- **Chart Creation Menu** (empty canvas): Create North/South Indian chart, **Presentation View**, Clear Canvas
- **Existing Chart Menu** (canvas, no Bhava/Graha hit): **Presentation View**; Reset Chart, Reset Annotations, Clear Canvas; **North Indian only**: Set Lagna as … (Rashi flyout submenu; tap to expand on touch)
- **Bhava Menu** (bhava hit):
  - **South Indian**: Header `Bhava N` (Lagna-relative); **Set as Lagna** (`set-lagna`); Clear Bhava; **Presentation View**; …
  - **North Indian**: Header `Bhava N` (visual); **Set as First Bhava** (`set-first-house`); Clear Bhava; **Presentation View**; …
- **Graha Menu**: Edit Graha, Delete Graha

Presentation View (`handleAction`):
- `toggle-presentation-view` → `app.togglePresentationView()`; label **Presentation View** / **Exit Presentation View**; Lucide `presentation` icon

Lagna actions (`handleAction`):
- `set-lagna`: South Bhava menu → `setLagnaHouse(visualHouse)`; North chart menu → `setLagnaHouse(rashi 1–12)`. Skipped if `houseNumber` missing (no default fallback).
- `set-first-house`: North Bhava menu only → `getRashiNumberForHouse()` → `setLagnaHouse(rashi)`

Key Methods:
- `openContextMenuAtClientPoint()`, `resolveContextTarget()`, `getShapeAtClientPoint()`, `findPlanetContextById()`
- `showChartMenu()`, `showHouseMenu()`, `showPlanetMenu()`, `showExistingChartMenu()`, `showCreateChartMenu()`
- `handleAction()`, `setupMenuEventListeners()`, `setupSubmenuHover()`, `shouldBlockCanvasContextMenu()`
- `isCanvasContextMenuEnabled()` / `setCanvasContextMenuEnabled()` / `toggleCanvasContextMenu()` — persisted in `localStorage.citrana_context_menu_enabled`
- `getContextMenuItemsTitle()` / `getContextMenuItemsMeta()` / `getContextMenuToggleActionLabel()` — Canvas Items panel **Context Menu** row copy
- `openPlanetEditor()`, `removePlanetFromHouse()`, `clearHousePlanets()`, `getActiveChartTemplate()`, `findPlanetTextNode()`

### Citrana Items Menu (citrana-items-menu.js - ~846 lines)
Floating **Canvas Items** panel for chart, Bhava, Graha, and annotation actions — primary workflow on touch; also available on desktop.

Key Responsibilities:
- Opens from `#items-menu-btn` in the zoom bar or keyboard **I** (`title="Canvas Items (I)"`)
- **Pinned chrome:** title, `#items-modal-description`, and `#items-modal-nav` Section Anchors stay fixed; only `#items-modal-body` scrolls (`scrollContainer` / `IntersectionObserver` root)
- **`#items-modal-nav`**: Section Anchors — jump to Canvas, Chart, Bhavas, Grahas, Annotations, Lagna, Actions; horizontal swipe/scroll on pills when they overflow (mobile edge fades via `setupSectionNavScrollFades()`); active anchor via `IntersectionObserver`
- Sections use `id="items-section-{id}"`; `renderSectionNav()`, `scrollToSection()`, `handleNavClick()`
- **Canvas**: **Clear Selection** (`app.clearCanvasSelection()`), **Context Menu** toggle (On/Off meta; green `.items-row-context-menu-on` / red `.items-row-context-menu-off` row tint; `square-menu` / `power` / `power-off` icons), **Graha Library** toggle (same On/Off row tint; `orbit` row icon; `toggle-graha-library` → `PlanetSystem.toggleGrahaLibrary()`)
- Selected rows use `.items-row-selected`; `refreshSelectionHighlight()` syncs with `app.getCanvasSelection()`
- South Indian Bhava rows show fixed Rashi names with Lucide zodiac icons (`CitranaRashis.iconHtml`)
- Reuses `citrana-context-menu.js` `handleAction()` for chart/Bhava/Graha actions where possible
- Text/Heading rows: **Edit text** (`startInlineContentEdit`) and **Style** (`showEditUI`); other Annotations: single **Edit** → `showEditUI`
- **Presentation View** and chart management actions mirror context menu icons

Key Methods:
- `init()`, `open()`, `close()`, `render()`, `renderSectionNav()`, `scrollToSection()`, `setupSectionNavObserver()`, `setupSectionNavScrollFades()`, `handleNavClick()`, `handleBodyClick()`, `refreshSelectionHighlight()`
- `isRowSelected()`, `renderUtilitySection()`, `getBhavaRowLabel()`
- `getDrawingShapes()`, `getAnnotationDisplayName()`, `getAnnotationIcon()`

### Citrana Session (citrana-session.js - ~214 lines)
Save and open `.citrana.json` session files.

Key Responsibilities:
- `capture(app)` — chart data, drawings, and Options preferences (`format: citrana-session`, `version: 1`)
- `validate()` / `readFile()` — parse and validate imported JSON
- `download()` — timestamped filename `citrana-session-YYYY-MM-DD-HHMMSS.citrana.json`
- `applyOptions()` — restore indicator and Save Chart Only preferences on import

Key Methods:
- `capture()`, `validate()`, `readFile()`, `download()`, `applyOptions()`, `buildExportFileName()`

Wired from `app.saveSession()` / `app.openSessionFromFile()` / `app.applyImportedSession()` / `app.restoreSessionState()`; save/open show shared progress modal; import resets undo timeline via `history.resetToState()`.

### Edit UI (citrana-edit-ui.js - ~1020 lines)
Provides context-sensitive editing controls for drawing elements.

Key Responsibilities:
- Creates floating edit interface with mobile chevron scroll (`setupEditUIScroll`, reuses `.toolbar-scroll-wrap` + edge fade classes at ≤768px)
- Provides tool-specific controls
- Manages shape property editing
- Handles colour and stroke customisation
- Implements text/heading style controls via `CitranaAnnotationFonts`
- Records one undo step per edit session on `hide()` when properties changed
- Touch-outside dismiss ignores colour picker popup (`.cp_dialog`) and Konva inline textarea (`.konva-textarea`)
- `getEditTarget()` / `_editSessionTarget`: Stable Konva node for colour/stroke updates (resolves `bounding-box-pen` → tapered `drawing-pen`)

Edit Controls:
- Stroke width and colour controls (pen, line, arrow) — defaults Pen **4px**, Line/Arrow **4px**; tapered pen width via `penBaseWidth`; colour via `CitranaColorPicker.createInput()` chips
- Font size, bold, italic, **Normal** / **Hand-written**, alignment, and colour (text, heading)
- Retrograde toggle (Graha text only — records via `setPlanetRetrogradeState`, not session close)
- Delete functionality

Key Features:
- Session-based undo: `markEditDirty()` on changes; `_commitEditHistoryIfNeeded()` on `hide()`
- Delete sets `_skipHistoryOnHide` to avoid double steps with `Delete drawing`
- Floating, bottom-centre positioning; `#edit-ui-scroll-prev` / `#edit-ui-scroll-viewport` / `#edit-ui-scroll-next` on mobile
- Mobile-optimised touch targets

Key Methods:
- `show()` / `hide()`: Display/hide; commit history on hide when dirty
- `setupEditUIScroll()`: Mobile overflow scroll for text style controls
- `createToolControls()`: Build tool-specific controls
- `updateStrokeWidth()` / `updateStrokeColor()` / `updateTextColor()`: Property updates
- `setAnnotationBold()` / `setAnnotationItalic()`: Delegate to `CitranaAnnotationFonts`
- `markEditDirty()` / `_commitEditHistoryIfNeeded()`: Session undo integration

## Core Features

### Undo / Redo

Unified **50-step** timeline via `CitranaHistory` (`citrana-history.js`). Toolbar **Undo** / **Redo** buttons (`#undo-btn`, `#redo-btn`) and keyboard shortcuts.

| Control | Action |
|---------|--------|
| **Undo** toolbar button / **Ctrl+Z** / **Cmd+Z** | Undo |
| **Redo** toolbar button / **Ctrl+Y** / **Ctrl+Shift+Z** / **Cmd+Shift+Z** | Redo |

Toolbar buttons disable when `canUndo()` / `canRedo()` is false (`updateHistoryButtons()` after each record, undo, or redo).

Each step snapshots **chart data** (type, Lagna, Grahas, South centre label) and **drawings** (`drawing-*` Konva nodes).

**Tracked:** create/reset/clear chart; add/move/remove/edit Grahas; set Lagna; clear Bhava; draw/move/adjust/delete Annotations; Edit UI style sessions; inline text/heading edits; centre label edit.

**Viewport:** undo/redo preserves zoom and pan (`restoreHistoryState()` restores stage scale/position after chart reload; templates pass `skipZoomToFit: true` on history restore).

**Not tracked:** active tool, Bhava highlight, Graha library page, modals, chart indicator visibility preferences, Save Chart Only export preference, **laser pointer strokes**, **Presentation View**.

See [ARCHITECTURE.md — Undo / redo](ARCHITECTURE.md#undo--redo) for data flow and extension points.

### Chart Types
- South Indian Chart: Traditional 4x4 square grid layout with centre empty space; Rashis are fixed per grid cell
- North Indian Chart: Diamond-shaped polygon layout with dynamic Rashi numbering based on Lagna
- **South Indian Lagna**: Right-click a bhava → **Set as Lagna** only (no chart-level Set as Lagna). Bhava menu header shows **Bhava N** counted from Lagna (not fixed grid position)
- **North Indian Lagna**: Right-click empty canvas → **Set Lagna as …** (choose Rashi); or right-click a bhava showing a Rashi → **Set as First Bhava** (that Rashi becomes Lagna). Grahas reposition by stored `rashiNumber`
- Dynamic Bhava Numbering: South Indian bhava numbers (yellow boxes) rotate from Lagna; North Indian Rashi boxes recalculate from Lagna

### Chart Display Options
- **Options modal**: `#options-btn` (gear icon in toolbar export group, after Save) opens `#options-modal`
- **Hide North Indian Chart Indicators**: Hides bhava numbers in black corner boxes (`tinyBoxGroupNorth`)
- **Hide South Indian Chart Indicators**: Hides lagna diagonal line, yellow bhava boxes, and black rashi boxes
- **Save Chart Only**: Same `#export-btn` exports only the chart area — saves/restores zoom/pan, calls `zoomToFit()`, crops via `getExportCropRect()`, includes Grahas and on-chart Annotations, leaves out anything outside the chart boundary, transparent background, no padding or watermark; locks `#toggle-transparency-btn` on; turning the option off restores white-background export. Falls back to full viewport export when no chart is loaded
- **Persistence**: `localStorage.citrana_north_hide_indicators`, `citrana_south_hide_indicators`, and `citrana_save_chart_only` (`'1'` when enabled; keys removed when off); defaults are indicators visible and full viewport export
- **Application**: `app.setNorthHideIndicators()` / `setSouthHideIndicators()` / `setSaveChartOnly()`; indicator prefs reapply on chart create and Lagna changes via `apply*IndicatorsPreference()`
- **Undo**: Options preferences are not tracked in the undo timeline

### Chart Management Actions
- Clear Canvas: Removes everything (charts, Grahas, drawings) and returns to blank canvas
- Reset Chart: Removes Grahas and drawings, but keeps chart structure/layout
- Reset Annotations: Removes only drawings, keeps Grahas and chart structure

### Graha Management
- 60 Major Grahas: 12 traditional Grahas on Page 1, 12 Jaimini Karakas on Page 2, 12 Tamil Grahas on Page 3, 12 Hindi Grahas on Page 4, and 12 Upagrahas and outer Grahas on Page 5
- Paging System: Five-page navigation — desktop dots and keyboard **1**–**5**; mobile swipe on dots bar with chevron hints
- Library Labels: Graha library cells show `fullName` (e.g. Page 5 Upagrahas); chart placement still uses text abbreviations
- Library Layout: No grid scrolling — desktop auto-fit columns (80×40px cells); mobile 6×2 grid with 30px cells and word-wrap for long names
- Text-based Display: Uses abbreviations on the chart instead of symbols for better compatibility
- Drag & Drop: Grahas from the floating library land in the bhava under the pointer, or in a Bhava you clicked first (`window.selectedBhavaSouth` / `window.selectedBhavaNorth` — one-shot: cleared after the next successful drop or when you click empty canvas)
- Multiple Instances: Same Graha can be placed multiple times
- Dynamic Text Sizing: Graha text scales based on Bhava occupancy
- Touch Support: Mobile-friendly touch interactions with visual feedback
- Degree Support: Add degree positions to Grahas (e.g., "Su-20")
- Graha Editing: Double-click a Graha, or right-click → **Edit Graha**, to open the floating edit panel (label, colour, retrograde)
- Graha Deletion: Right-click → **Delete Graha**, delete from the edit panel, or press **Delete** when a Graha is selected
- Retrograde Display: Underlined Graha text via Konva `textDecoration` (stored as `retrograde: boolean` on Graha data, not appended to the label)
- Legacy Migration: Older charts that used the Unicode subscript `ᵣ` are normalised automatically (marker removed, underline applied)
- 8-Character Limit: Applies to Graha label text only; retrograde does not consume a character slot

### Drawing Tool Summary
- Select Tool: Choose and modify existing elements with Edit UI
- Arrow Tool: Unified filled arrow (`CitranaArrow`) with constant-width shaft, prominent head, and control points (default 4px)
- Line Tool: Draw straight lines and connections with control points (default 4px)
- Pen Tool: Freehand drawing with natural taper — velocity-based width, smoothed path, end taper (default **4px** base width, full opacity); stored as custom `Konva.Shape` with `penTaper` attrs; Select tool — click/tap select (Selection Pill), click-and-drag or touch-and-drag move, double-click/double-tap (or Canvas Items → Edit) for colour and stroke
- Laser Pointer: Temporary fading highlight for presentations (`CitranaLaser` Canvas overlay; shortcut **K**; not saved or undoable)
- Presentation View: Context menu or **Canvas Items** panel toggle hides toolbar, zoom bar, Graha library, Help, About, Graha edit bar, and drawing Edit UI; dismisses active edit sessions on enter. Graha Library can also be hidden independently via Canvas Items → **Graha Library** (On/Off)
- Text Tool: Add editable multi-line text boxes anywhere on canvas (**Shift+Enter** new line)
- Heading Tool: Create multi-line chart headings and titles
- **Hand-written Annotations:** optional Caveat script; bold uses Caveat Brush via Edit UI **Normal** / **Hand-written** toggles
- Undo/Redo: Unified timeline via `app.recordHistory()` — see [Undo / Redo](#undo--redo)
- Auto-Switch Behaviour: Arrow, Line, Text, and Heading automatically switch to Select Tool after creation; Pen and Laser remain active
- Control Points: Draggable handles for arrow/line endpoints; desktop hover feedback (colour invert, grab cursor); `raiseControlPointsAbovePickRects()` keeps handles above invisible pick rects

### Control Points Feature
The control points system provides precise adjustment capabilities for arrow and line elements:

Functionality:
- Control points appear automatically when arrows or lines are selected; endpoint handles stay above invisible `bounding-box-*` pick rects
- Two draggable handles at the start and end points of each element
- Desktop hover inverts handle fill/stroke (black ↔ white) and shows **grab** / **grabbing** cursor; wider hit targets for easier picking
- Real-time visual feedback during adjustment
- Per-frame synchronisation ensures control points stay attached during shape movement
- Works on both blank canvas and chart-loaded states

Technical Implementation:
- Konva.Circle objects with custom styling and event handling
- Coordinate transformation between local shape coordinates and global stage coordinates
- RequestAnimationFrame loop for continuous synchronisation
- Touch and mouse support for cross-platform compatibility
- Automatic cleanup when elements are deselected or deleted

### User Experience
- Light Theme: Clean, professional appearance with high contrast
- Responsive Design: Optimised for desktop, tablet, and mobile viewports
- Keyboard Shortcuts: Tools, undo/redo, zoom (when unlocked), delete, help — see Main Application
- Undo/Redo Toolbar: `#undo-btn` and `#redo-btn` in the top toolbar (first group); disabled when no steps available
- Context Menus: Right-click or long-press on canvas, bhava, or Graha (Select/Hand when enabled; off by default on touch-primary devices; suppressed while drawing or when disabled via Canvas Items); chart-type-specific Bhava actions; Graha edit/delete; **Presentation View**
- **Canvas Items**: `#items-menu-btn` or **I** — chart/Bhava/Graha/Annotation actions; pinned Section Anchors; **Clear Selection**, **Context Menu**, and **Graha Library** (On/Off with green/red row tint); row highlight syncs with canvas selection; desktop and touch workflow
- **Selection Pill**: dashed outline behind selected Graha labels and Text/Heading/Pen Stroke Annotations; Bhava highlight in light grey
- **Edit UI mobile scroll**: chevron buttons and edge fades scroll style controls when they overflow on narrow screens
- Status Updates: Real-time feedback and notifications
- Ephemeral tab sessions: Refresh starts fresh — **Save Session** (`.citrana.json`) or export PNG to keep work
- Help Modal: Shortcuts and usage guide (Laser Pointer, Canvas Items with pinned Section Anchors, Context Menu and Graha Library toggles, Graha Library dots-bar swipe and **1**–**5** page keys, **I** shortcut, Presentation View, undo exclusions); `#help-modal-description` / `.help-modal-description` intro spacing
- About Modal: Information about Citrana with creator details and links; mobile compact layout without scroll
- Welcome Modal: First-time user experience; `closeWelcomeModal()` marks seen in `localStorage`; mobile compact layout without scroll
- Options Modal: Chart indicator toggles and **Save Chart Only** export; shared modal width with Help (`width: min(600px, 90vw)`)
- Confirmation Modal: Destructive-action confirm; dynamic message + warning in `aria-describedby`
- Export Progress Modal: Shared `#export-progress-modal` for export PNG, save session, and open session; non-dismissible; dynamic title; live status in `aria-describedby`; `aria-busy` while operation runs
- Modal accessibility: Escape dismiss, Tab focus trap, focus restore on close; canvas `role="application"` with `aria-label`
- Zoom Controls: `#zoom-in`, `#zoom-out`, `#reset-zoom`, `#zoom-lock` (default locked), `#zoom-level`, **`#items-menu-btn`**
- Zoom Lock: Prevents accidental scroll-wheel and +/- zoom until user unlocks; reset zoom always available
- Toolbar scroll: `#toolbar-scroll-viewport` with chevrons when tools overflow on narrow screens
- iOS PWA: Safe-area layout for home-screen install (see CSS section); desktop is primary supported experience

### Export & Sharing
- **Full viewport export** (default): `stage.toDataURL({ pixelRatio: 2 })` on entire stage; 100px padding and watermark via `finalizeExportImage()`; respects current zoom/pan and `#toggle-transparency-btn`; progress dialog **Exporting Chart**
- **Save Chart Only** (`options.saveChartOnly` + active chart): temporarily `zoomToFit()`, crop to `ChartCoordinator.getExportCropRect()` (chart group + visible North `tinyBoxGroupNorth`), transparent background, no padding or watermark; restores user's zoom/pan after capture
- **Save Session**: `.citrana.json` file with chart, Grahas, drawings, and Options preferences; progress dialog during save
- **Open Session**: Restore from `.citrana.json`; confirmation when replacing existing work; progress dialog during import
- High-Resolution PNG: `pixelRatio: 2` for both export modes
- Cross-Platform: Works on all modern browsers
- GitHub Pages Compatible: No build process required

## Browser Compatibility

- Desktop: Brave 1.80+, Chrome 138+, Firefox 128+, Safari 18+, Edge 138+
- Note: For Brave browser, disable Brave Shields for optimal functionality
- Features: Canvas API, localStorage, ES6+ JavaScript (classic script tags), Touch Events

Mobile and touch:
- Desktop is the primary supported experience
- Mobile/touch layouts are tuned (safe areas, compact Graha library, toolbar scroll, drawing tools in toolbar)
- Use the **Canvas Items** panel (`#items-menu-btn` or **I**) for chart/Bhava/Graha/annotation actions when context menus are awkward on touch
- Laser pointer is available on all viewports (`CitranaDevice.isLaserViewport()`)

## Performance Optimisation

- Efficient Canvas Rendering: Konva.js optimisation
- Optimised resize handlers
- Optimised Graha Placement: Efficient algorithms
- Minimal DOM Manipulation: Canvas-based rendering
- Touch Event Optimisation: Mobile performance

## Development Guidelines

### Code Style
- Use ES6+ JavaScript features
- Follow existing naming conventions
- Add comprehensive comments for new features
- Maintain modular architecture
- Use custom CSS classes for styling

### Debug logging
- Use `citranaDebug(...)` from `citrana-debug.js` for contributor trace logs (enabled by default)
- Silence in DevTools: `localStorage.setItem('citrana_debug', '0')` then refresh; remove the key to re-enable
- Use `console.error` for real failures only

### File Headers
All JavaScript and CSS files use a standardised comment header format:
```javascript
/**
 * filename.extension
 * Citrana • https://github.com/IAmVigneswaran/Soothsayer-Citrana 
 * © 2026 Vigneswaran Rajkumar • Licensed under MIT License
 * One line description of the file
 */
```

### File Organisation
- Keep all assets in the assets/ directory
- JavaScript files in assets/js/
- CSS files in assets/css/
- Images in assets/images/
- SVGs in assets/svgs/
- Favicons in assets/favicon/

### Browser Compatibility
- Test on multiple browsers and devices
- Ensure touch and mouse support
- Validate responsive design
- Check performance on desktop devices

## Customisation Guidelines

### Adding New Grahas
Edit the Graha data objects in assets/js/citrana-planet-system.js:
```javascript
// Graha data - Page 1 (Traditional Grahas)
        this.planetsPage1 = {
            'Lg': {
                name: 'Lagna',
                fullName: 'Lagna',
                color: '#000000'
            },
            'Su': {
                name: 'Sun',
                fullName: 'Sun',
                color: '#e2792e'
            },
            'Mo': {
                name: 'Moon',
                fullName: 'Moon',
                color: '#868484'
            },
            'Me': {
                name: 'Mercury',
                fullName: 'Mercury',
                color: '#08b130'
            },
            'Ve': {
                name: 'Venus',
                fullName: 'Venus',
                color: '#eb539f'
            },
            'Ma': {
                name: 'Mars',
                fullName: 'Mars',
                color: '#da3b26'
            },
            'Ju': {
                name: 'Jupiter',
                fullName: 'Jupiter',
                color: '#ffa200'
            },
            'Sa': {
                name: 'Saturn',
                fullName: 'Saturn',
                color: '#3274b5'
            },
            'Ra': {
                name: 'Rahu',
                fullName: 'Rahu',
                color: '#4c4b4b'
            },
            'Ke': {
                name: 'Ketu',
                fullName: 'Ketu',
                color: '#4c4b4b'
            },
            'Md': {
                name: 'Maandi',
                fullName: 'Maandi',
                color: '#000000'
            },
            'Cu': {
                name: 'Custom',
                fullName: 'Custom',
                color: '#000000'
            }
        };

        // Graha data - Page 2 (Jaimini Karakas)
        this.planetsPage2 = {
            'AK': {
                name: 'AK',
                fullName: 'AK',
                color: '#000000'
            },
            'AmK': {
                name: 'AmK',
                fullName: 'AmK',
                color: '#000000'
            },
            'BK': {
                name: 'BK',
                fullName: 'BK',
                color: '#000000'
            },
            'MK': {
                name: 'MK',
                fullName: 'MK',
                color: '#000000'
            },
            'PK': {
                name: 'PK',
                fullName: 'PK',
                color: '#000000'
            },
            'GK': {
                name: 'GK',
                fullName: 'GK',
                color: '#000000'
            },
            'DK': {
                name: 'DK',
                fullName: 'DK',
                color: '#000000'
            },
            'AL': {
                name: 'AL',
                fullName: 'AL',
                color: '#000000'
            },
            'UL': {
                name: 'UL',
                fullName: 'UL',
                color: '#000000'
            },
            'KL': {
                name: 'KL',
                fullName: 'KL',
                color: '#000000'
            },
            'HL': {
                name: 'HL',
                fullName: 'HL',
                color: '#000000'
            },
            'SL': {
                name: 'SL',
                fullName: 'SL',
                color: '#000000'
            }
        };

        // Graha data - Page 3 (In Tamil)
        this.planetsPage3 = {
            'ல': {
                name: 'லக்கினம்',
                fullName: 'லக்கினம்',
                color: '#000000'
            },
            'சூ': {
                name: 'சூரியன்',
                fullName: 'சூரியன்',
                color: '#e2792e'
            },
            'சந்': {
                name: 'சந்திரன்',
                fullName: 'சந்திரன்',
                color: '#868484'
            },
            'பு': {
                name: 'புதன்',
                fullName: 'புதன்',
                color: '#08b130'
            },
            'சுக்': {
                name: 'சுக்ரன்',
                fullName: 'சுக்ரன்',
                color: '#eb539f'
            },
            'செவ்': {
                name: 'செவ்வாய்',
                fullName: 'செவ்வாய்',
                color: '#da3b26'
            },
            'குரு': {
                name: 'குரு',
                fullName: 'குரு',
                color: '#ffa200'
            },
            'சனி': {
                name: 'சனி',
                fullName: 'சனி',
                color: '#3274b5'
            },
            'ரா': {
                name: 'ராகு',
                fullName: 'ராகு',
                color: '#4c4b4b'
            },
            'கே': {
                name: 'கேது',
                fullName: 'கேது',
                color: '#4c4b4b'
            },
            'மா': {
                name: 'மாந்தி',
                fullName: 'மாந்தி',
                color: '#000000'
            },
            'ப': {
                name: 'பயன்',
                fullName: 'பயன்',
                color: '#000000'
            }
        };

        // Graha data - Page 4 (In Hindi)
        this.planetsPage4 = {
            'लग्न': {
                name: 'लग्न',
                fullName: 'लग्न',
                color: '#000000'
            },
            'सूर्य': {
                name: 'सूर्य',
                fullName: 'सूर्य',
                color: '#e2792e'
            },
            'चंद्र': {
                name: 'चंद्र',
                fullName: 'चंद्र',
                color: '#868484'
            },
            'बुद्ध': {
                name: 'बुद्ध',
                fullName: 'बुद्ध',
                color: '#08b130'
            },
            'शुक्र': {
                name: 'शुक्र',
                fullName: 'शुक्र',
                color: '#eb539f'
            },
            'मंगल': {
                name: 'मंगल',
                fullName: 'मंगल',
                color: '#da3b26'
            },
            'गुरु': {
                name: 'गुरु',
                fullName: 'गुरु',
                color: '#ffa200'
            },
            'शनि': {
                name: 'शनि',
                fullName: 'शनि',
                color: '#3274b5'
            },
            'राहु': {
                name: 'राहु',
                fullName: 'राहु',
                color: '#4c4b4b'
            },
            'केतु': {
                name: 'केतु',
                fullName: 'केतु',
                color: '#4c4b4b'
            },
            'मांदी': {
                name: 'मांदी',
                fullName: 'मांदी',
                color: '#000000'
            },
            'कस': {
                name: 'कस्टम',
                fullName: 'कस्टम',
                color: '#000000'
            }
        };

        // Graha data - Page 5 (Upagrahas & Outer Grahas)
        this.planetsPage5 = {
            'Dh': {
                name: 'Dhuma',
                fullName: 'Dhuma',
                color: '#000000'
            },
            'Vy': {
                name: 'Vyatipata',
                fullName: 'Vyatipata',
                color: '#000000'
            },
            'Pv': {
                name: 'Parivesha',
                fullName: 'Parivesha',
                color: '#000000'
            },
            'Ic': {
                name: 'Indra Chapa',
                fullName: 'Indra Chapa',
                color: '#000000'
            },
            'Uk': {
                name: 'Upaketu',
                fullName: 'Upaketu',
                color: '#000000'
            },
            'Kl': {
                name: 'Kala',
                fullName: 'Kala',
                color: '#000000'
            },
            'Mr': {
                name: 'Mrityu',
                fullName: 'Mrityu',
                color: '#000000'
            },
            'Ap': {
                name: 'Ardha Prahara',
                fullName: 'Ardha Prahara',
                color: '#000000'
            },
            'Yg': {
                name: 'Yama Ghantaka',
                fullName: 'Yama Ghantaka',
                color: '#000000'
            },
            'Ur': {
                name: 'Uranus',
                fullName: 'Uranus',
                color: '#000000'
            },
            'Ne': {
                name: 'Neptune',
                fullName: 'Neptune',
                color: '#000000'
            },
            'Pl': {
                name: 'Pluto',
                fullName: 'Pluto',
                color: '#000000'
            }
        };
        
        // Paging state
        this.currentPage = 1;
        this.totalPages = 5;
        this.draggedPlanet = null;
    }
```

### Modifying Chart Styles
- Bhava colours and borders in chart template files
- Grid line styles and text formatting
- Layout dimensions and spacing
- Theme colours and visual elements

### Theme Customisation
- Modify assets/css/styles.css for custom component styles
- Update colour schemes in JavaScript files
- Add new theme variants
- Customise responsive breakpoints

## Important Notes

### No Symbol Support
- The application does NOT use Graha symbols
- All Grahas are displayed using text abbreviations (Su, Mo, Ma, etc.)
- This ensures better compatibility and accessibility

### No Build Process
- Application runs entirely in the browser
- No server-side dependencies
- No build tools or compilation required
- Ready for immediate deployment on GitHub Pages

### Data Management
- Chart work lives in the browser tab for the current visit; refreshing starts fresh unless the user **Save Session** / **Open Session** (`.citrana.json`)
- Export PNG or Save Session to keep a copy; chart data is not uploaded to a server
- `localStorage` is used for preferences: welcome modal seen (`citrana_welcome_seen`), chart indicator toggles (`citrana_north_hide_indicators`, `citrana_south_hide_indicators`), Save Chart Only export (`citrana_save_chart_only`), context menu enable (`citrana_context_menu_enabled` — touch-primary default off until set), Graha Library visibility (`citrana_graha_library_enabled` — default on), optional `citrana_debug` opt-out

## Support and Documentation

- AGENT.md: This comprehensive project documentation
- ARCHITECTURE.md: System architecture, data flows, and extension points
- README.md: Project overview, nested usage guide (aligned with in-app Help), and quick start
- CHANGELOG.md: Version history
- `.cursorrules`: Cursor IDE rules for contributors and AI agents

## Development Commands

- Open index.html in browser to run application
- No build commands required
- Use browser developer tools for debugging
- All changes are immediately visible on refresh

## GitHub Actions Workflow

**Source of truth:** `.github/workflows/static.yml` — edit that file only; do not copy workflow YAML from this doc.

### Production (current)

- **Trigger:** push to `main` only (`if: github.ref == 'refs/heads/main'`), plus `workflow_dispatch`
- **paths-ignore:** `**/*.md`, `LICENSE`, `.gitignore`, `.cursorrules` — doc-only commits to `main` do not redeploy
- **Steps:** checkout → Node 18 → `clean-css-cli` + `terser` → `styles.min.css` and `*.min.js` for all local JS → `sed` rewrites `index.html` script/link refs → configure-pages → upload artifact → deploy-pages
- **Minified local JS:** all 20 `citrana-*.js` modules (alphabetically in `static.yml` terser step only — **not** browser load order): `citrana-annotation-fonts`, `citrana-app`, `citrana-arrow`, `citrana-chart-coordinator`, `citrana-chart-templates-north`, `citrana-chart-templates-south`, `citrana-colorpicker`, `citrana-context-menu`, `citrana-debug`, `citrana-device`, `citrana-drawing-tools`, `citrana-edit-ui`, `citrana-history`, `citrana-items-menu`, `citrana-laser`, `citrana-planet-system`, `citrana-rashis`, `citrana-selection`, `citrana-session`, `citrana-zoom`
- **Not minified in CI:** `assets/vendor/*` (Konva, Lucide, JSColorPicker — already minified)

### Local development

- Open `index.html` in the browser — no build; repo `index.html` references source `.js` / `.css`
- GitHub Pages serves minified assets only in the **deploy artifact** after CI rewrites `index.html` (the committed `main` tree keeps source filenames)

### Optional: deploy without minification

In `static.yml`, remove the Setup Node, Install minification tools, Minify CSS, Minify local JavaScript files, and Update HTML steps. Keep checkout → Setup Pages → Upload artifact → Deploy.

Built with love for the Vedanga Jyotisha community. 