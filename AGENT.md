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

Internal code identifiers (e.g. `planet-system.js`, `addPlanetToHouse()`, Konva names `house-*` / `planet-*`, data keys `planetsByHouse`) are unchanged for implementation stability.

## Technology Stack

- Frontend: Pure HTML5, CSS3, JavaScript (ES6+)
- Graphics: HTML5 Canvas API with Konva.js (self-hosted, `assets/vendor/konva.min.js` v9.3.20)
- Colour picker: JSColorPicker (self-hosted, `assets/vendor/colorpicker.iife.min.js` v1.1.0; theme in `citrana-colorpicker.js`)
- Styling: Custom CSS only
- Icons: Lucide Icons (self-hosted, `assets/vendor/lucide.min.js` v0.468.0)
- Storage: Browser `localStorage` for preferences (welcome modal, chart indicator toggles, Save Chart Only export, context menu enable/disable, debug opt-out)
- Analytics: Google Analytics and Google Tag Manager
- No build process required - runs entirely in browser

For system architecture, data flows, and extension points, see [ARCHITECTURE.md](ARCHITECTURE.md). This file (`AGENT.md`) and [.cursorrules](.cursorrules) should stay in sync with the codebase and each other.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [CSS and Layout](#css-and-layout-stylescss---2654-lines)
4. [Complete Project Structure](#complete-project-structure)
5. [Core Components Architecture](#core-components-architecture)
   - [Main Application (app.js)](#main-application-appjs---2020-lines)
   - [History Engine (history.js)](#history-engine-historyjs---94-lines)
   - [Chart Coordinator](#chart-coordinator-chart-coordinatorjs---334-lines)
   - [South Indian Chart Template](#south-indian-chart-template-chart-templates-southjs---984-lines)
   - [North Indian Chart Template](#north-indian-chart-template-chart-templates-northjs---1011-lines)
   - [Graha System](#planet-system-planet-systemjs---880-lines)
   - [Citrana Arrow](#citrana-arrow-citrana-arrowjs---187-lines)
   - [Citrana Color Picker](#citrana-color-picker-citrana-colorpickerjs---370-lines)
   - [Citrana Device](#citrana-device-citrana-devicejs---39-lines)
   - [Citrana Rashis](#citrana-rashis-citrana-rashisjs---41-lines)
   - [Citrana Graha Selection](#citrana-graha-selection-citrana-graha-selectionjs---96-lines)
   - [Citrana Laser](#citrana-laser-citrana-laserjs---248-lines)
   - [Drawing Tools](#drawing-tools-drawing-toolsjs---2134-lines)
   - [Context Menu](#context-menu-context-menujs---717-lines)
   - [Citrana Items Menu](#citrana-items-menu-citrana-items-menujs---635-lines)
   - [Citrana Session](#citrana-session-citrana-sessionjs---214-lines)
   - [Edit UI](#edit-ui-edit-uijs---786-lines)
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

## CSS and Layout (styles.css - ~2681 lines)

Light theme, floating UI, modals (Help and Options share modal chrome; `role="dialog"` + `aria-*`), responsive breakpoints (769px desktop, 768px tablet, 600px mobile). Most tablet/mobile rules live in one `@media (max-width: 768px)` block; **post-base mobile overrides** (Help/About position, modal compact sizing) use separate `@media` blocks **after** base component selectors so cascade order is correct.

**Layout tokens (`:root`):** Desktop — `--ui-bottom-stack` (60px), `--zoom-controls-block-height` (48px), `--corner-btn-size` (48px). Mobile `≤768px` overrides in the main mobile block — 50px chrome height (zoom bar border included), `--ui-bottom-stack: 62px`. Help icon at 50% of button; About logo at 62.5%.

**Presentation View:** `body.presentation-view` hides `.floating-top-toolbar`, `.floating-zoom-controls`, `.floating-planet-library`, `.help-btn`, `.about-btn`, `.floating-text-edit-controls`, and `.floating-edit-ui` via CSS. Toggled from context menu or **Items** panel (`app.togglePresentationView()`); dismisses active edit sessions on enter.

**Graha library layout:**
- Header, grid, and page-dots styled in CSS (`.planet-library-header`, `.planet-grid`, `.page-dots`) — no inline styles in `index.html`
- No grid scrolling (`overflow: visible`; no `max-height` on `.planet-grid`)
- Desktop: `repeat(auto-fit, minmax(80px, 1fr))`; 80×40px `.planet-item` cells
- Mobile (≤768px): 6×2 grid, 320px library width, compact vertical padding, 30px cells with 7px font and `word-break: break-word` for Page 5 Upagraha names

**JSColorPicker theme (`--cp-*` in `:root`):** chip size, borders, swatch width, shadows — aligned to Citrana light theme. Compact toolbars hide hex input, format tabs, and dropdown caret (`.cp_input`, `.cp_formats`, `.cp_caret`).

**iOS standalone PWA (2.0):**
- Safe-area CSS vars (`--sat` … `--sal`, `--ui-inset`, `--ui-bottom-pad`, `--ui-bottom-stack`)
- `body { position: fixed; inset: 0 }` — avoids bottom gap on iOS
- `viewport-fit=cover`; manifest `display: standalone`
- Mobile: Graha library bottom stack; Help bottom-left; drawing tools visible in toolbar; toolbar horizontal scroll with chevrons when overflow; **Items** button in zoom bar

## Complete Project Structure

```
Soothsayer-Citrana/
├── index.html                    # Main entry (~567 lines); viewport-fit=cover; PWA meta; modal a11y; Items modal; toolbar scroll viewport
├── robots.txt
├── sitemap.xml
├── assets/
│   ├── css/
│   │   └── styles.css            # Complete styling system (~2681 lines); primary mobile block + post-base mobile overrides; JSColorPicker `--cp-*` theme; `.items-*`; `.items-row-selected`; `.citrana-laser-canvas`; `body.presentation-view`; `.toolbar-scroll-*`
│   ├── js/
│   │   ├── app.js                # Main application coordinator (~2020 lines)
│   │   ├── citrana-arrow.js      # Unified filled-arrow geometry (~185 lines)
│   │   ├── citrana-colorpicker.js # JSColorPicker theme and helpers (~383 lines)
│   │   ├── citrana-debug.js      # Contributor debug logging (~13 lines; on by default)
│   │   ├── citrana-device.js     # Shared touch, mobile UA, and viewport helpers (~39 lines)
│   │   ├── citrana-graha-selection.js # Graha Selection Pill (~96 lines)
│   │   ├── citrana-items-menu.js # Items panel — chart/Bhava/Graha/annotation actions (~635 lines)
│   │   ├── citrana-laser.js      # Ephemeral laser pointer Canvas overlay (~248 lines)
│   │   ├── citrana-rashis.js     # Shared Rashi names, symbols, and grid numbers (~41 lines)
│   │   ├── citrana-session.js    # Save/open `.citrana.json` session files (~214 lines)
│   │   ├── chart-coordinator.js  # Chart type management (~334 lines)
│   │   ├── chart-templates-south.js  # South Indian chart logic (~984 lines)
│   │   ├── chart-templates-north.js  # North Indian chart logic (~1011 lines)
│   │   ├── planet-system.js      # Graha library and drag-drop (~880 lines)
│   │   ├── drawing-tools.js      # Drawing tools implementation (~2134 lines)
│   │   ├── context-menu.js       # Context menu system (~717 lines)
│   │   ├── edit-ui.js            # Edit interface controls (~786 lines)
│   │   └── history.js            # Unified undo/redo timeline (~94 lines)
│   ├── vendor/
│   │   ├── konva.min.js          # Konva 9.3.20 (self-hosted; loaded in <head>)
│   │   ├── lucide.min.js         # Lucide 0.468.0 (self-hosted)
│   │   ├── colorpicker.iife.min.js  # JSColorPicker 1.1.0 (self-hosted)
│   │   └── colorpicker.min.css   # JSColorPicker 1.1.0 stylesheet
│   ├── images/                   # 14 files (logos, demo GIFs, browser screenshot)
│   │   ├── soothsayer_citrana_social-preview.jpg
│   │   ├── Soothsayer-Citrana-Full-Logo-Black.png / -White.png
│   │   ├── Soothsayer-Logo-Black.png / Soothsayer-Logo-White.png
│   │   ├── citrana-browser-screenshot.png
│   │   └── demo-*.gif            # English, Tamil, Hindi, tldraw demos
│   ├── svgs/
│   │   ├── north-indian.svg
│   │   └── south-indian.svg
│   └── favicon/                  # 29 files
│       ├── favicon.ico
│       ├── manifest.json         # PWA manifest (display: standalone)
│       ├── browserconfig.xml
│       ├── apple-icon-*.png      # 12 variants
│       ├── android-icon-*.png    # 6 variants
│       ├── favicon-*.png         # 5 variants
│       └── ms-icon-*.png         # 4 variants
├── .github/
│   └── workflows/
│       ├── static.yml            # GitHub Pages deploy with minification (push to main)
│       └── codeql.yml            # CodeQL security analysis
├── AGENT.md                      # This comprehensive documentation (~1202 lines)
├── ARCHITECTURE.md               # System architecture and data flows (~500 lines)
├── .cursorrules                  # Cursor IDE configuration (~1232 lines)
├── CHANGELOG.md                  # Version history and changes (~87 lines)
├── README.md                     # Project readme (~199 lines)
├── LICENSE                       # MIT License
├── SECURITY.md                   # Security policy
└── .gitignore                    # Git ignore rules
```

> Line counts are approximate; run `wc -l` after significant edits. Update About modal version in `index.html` on each release.

## Core Components Architecture

For system design, module boundaries, data flows, and extension points, see [ARCHITECTURE.md](ARCHITECTURE.md).

### Main Application (app.js - ~2020 lines)
The central coordinator that manages all application components and lifecycle.

Key Responsibilities:
- Initialises Konva.js stage and layer
- Coordinates all component interactions
- Manages tool selection and drawing state
- Handles keyboard shortcuts and event listeners
- Manages unified undo/redo via `CitranaHistory` (`history.js`)
- Handles chart export (full viewport or chart-only crop via Options)
- Manages chart display options modal and `localStorage` preferences (indicators, Save Chart Only)
- **Save/Open Session** via `CitranaSession` (`.citrana.json` files)
- Initialises **Items panel** (`CitranaItemsMenu`) and toolbar horizontal scroll
- Provides mobile touch support and Safari compatibility
- Manages zoom controls, zoom lock (default locked), zoom level display, canvas resize (`visualViewport`), and **Presentation View**
- Manages modal open/close, focus trap, and Escape dismiss for all overlays (including export progress and **Items** modal)

Key Methods:
- `init()`: Application initialisation; loads `this.options` from `localStorage`
- `setupCanvas()`: Konva stage; `scaleXChange`/`scaleYChange` → `updateZoomLevel()`
- `setupToolbarScroll()`: Horizontal toolbar overflow with `#toolbar-scroll-prev` / `#toolbar-scroll-next`
- `setupKeyboardShortcuts()`: Tool/action shortcuts; **Escape** → `dismissActiveModalOnEscape()`; **Tab** → `trapModalFocus()` when a modal is open; otherwise blocked while inline Graha/text editors are focused or `isModalBlockingShortcuts()` (Help, Options, About, Welcome, Confirmation, Items, export progress)
- `openModal(modal)` / `closeModal(modal)`: Toggle `.active` and `aria-hidden`; push/pop `_modalFocusStack`; focus close button on open
- `closeWelcomeModal()`: Welcome close + `localStorage.citrana_welcome_seen`
- `getActiveModal()` / `dismissActiveModalOnEscape()`: Topmost modal; Escape dismiss (export progress not dismissible)
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
- `exportChart()` / `finalizeExportImage()`: PNG export (`pixelRatio: 2`); full stage or chart-only crop when `options.saveChartOnly`
- `setNorthHideIndicators(hide)` / `setSouthHideIndicators(hide)`: Persist indicator toggles; apply to active chart template
- `setSaveChartOnly(enabled)` / `applySaveChartOnlyTransparency()` / `updateTransparencyToggleUI()`: Chart-only export preference; forces transparent export and locks `#toggle-transparency-btn`
- `recordHistory()` / `captureHistoryState()` / `restoreHistoryState()`: Undo timeline integration; `restoreHistoryState()` saves/restores stage scale and position (chart reload via `loadChartData()` calls `clearChart()`, which resets the viewport — restored after reload); templates use `skipZoomToFit: true` on history restore
- `undo()` / `redo()` / `updateHistoryButtons()`: Delegate to `this.history`; sync `#undo-btn` / `#redo-btn` disabled state
- `clearChart()` / `resetChart()` / `resetDrawings()`
- `isPresentationView()` / `togglePresentationView()`: Toggle `presentationView` and `body.presentation-view`; hides toolbar, zoom bar, Graha library, Help, About, Graha bar, and drawing Edit UI; dismisses open edit sessions on enter; Safari visibility fix skips when active; not undoable
- `clearWelcomeLoadingInterval()` / `showWelcomeModal()`: Welcome progress timer cleared on close or at 100%
- Mouse/touch handlers: `handleMouseDown/Move/Up`, `handleTouchStart/Move/End`; empty-canvas `mousedown`/`tap` → `clearCanvasSelection()` (Bhavas, Grahas, annotations, edit bars)
- `clearCanvasSelection()` / `getCanvasSelection()` / `notifyCanvasSelectionChanged()`: Unified selection state for Items panel row highlight
- `setupSafariToolbarFix()`: Touch Safari UI visibility restore on focus/viewport events (`visualViewport` resize/scroll; no polling timer)
- `showConfirmationDialog()`
- `showExportProgress()` / `hideExportProgress()`: Export modal (`display: block`); focus trap; `aria-busy` during export
- `saveSession()` / `openSessionFromFile()` / `restoreSessionState()`: `.citrana.json` export/import via `CitranaSession`; confirms before replacing existing work; `history.resetToState()` on import
- `hasSessionContent()`: Whether chart or drawings exist before session replace prompt

Keyboard shortcuts: `V` Select, `A` Arrow, `L` Line, `P` Pen, `K` Laser Pointer (when available), `T` Text, `H` Hand, `Ctrl+Z`/`Cmd+Z` undo, `Ctrl+Y`/`Ctrl+Shift+Z`/`Cmd+Shift+Z` redo, `+`/`-` zoom (when unlocked), `0` zoom to fit, `Delete` remove selected Graha or delete selected drawing (Select tool), `?`/`/` Help, **Escape** close modal. No Heading shortcut. Ignored when a modal is open (except Escape/Tab for modal UX) or Graha/text inline editor is focused.

### History Engine (history.js - ~94 lines)
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

### Chart Coordinator (chart-coordinator.js - ~334 lines)
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

### South Indian Chart Template (chart-templates-south.js - ~984 lines)
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
- `selectPlanet()` / `clearSelectedPlanet()`: Graha selection via `CitranaGrahaSelection`
- Rashi number boxes use `CitranaRashis.getNumberForHouseIndex()`; mobile fit uses `CitranaDevice.isCompactViewport()` / `isMobileUA()`
- `setSouthIndicatorsVisible(visible)` / `applySouthIndicatorsPreference()`: Show or hide lagna line and bhava/rashi boxes per `app.options`
- `zoomToFit()`: Fit chart to viewport using **local bounds** (immune to current zoom/pan)

### North Indian Chart Template (chart-templates-north.js - ~1011 lines)
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
- `selectPlanet()` / `clearSelectedPlanet()`: Graha selection via `CitranaGrahaSelection`
- `raiseDrawingsAboveChart()` / `syncNorthChartLayerOrder()`: Keep annotations above chart layer
- Lagna logging uses `CitranaRashis.getName()`; mobile fit uses `CitranaDevice.isCompactViewport()`
- `setNorthIndicatorsVisible(visible)` / `applyNorthIndicatorsPreference()`: Show or hide `tinyBoxGroupNorth` (bhava numbers in black corner boxes) per `app.options`
- `zoomToFit()`: Fit chart to viewport using **local bounds** (desktop `extraTopMargin=-50`)

### Graha System (planet-system.js - ~880 lines)
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
- Desktop navigation with clickable page dots
- Mobile swipe navigation (left/right)
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
- `createPlanetLibrary()`: Build UI elements with paging
- `createPageDots()`: Create desktop navigation dots
- `setupSwipeEvents()`: Configure mobile swipe navigation
- `goToPage()`: Navigate between pages
- `setupDragAndDrop()`: Configure drag functionality
- `handleDragStart/Move/End()`: Drag interaction handling
- `handleTouchStart/Move/End()`: Touch interaction handling
- `handleDrop()` / `handleMobileDrop()`: Place Graha on chart (one-shot selected bhava or pointer hit-test)
- `clearSelectedBhavaDropTarget()`: Clear `window.selectedBhavaSouth` / `window.selectedBhavaNorth` after a successful library drop
- `findHouseAtPosition()`: Delegates to `ChartCoordinator.findHouseAtClientPoint()` (viewport coords for touch / drop fallback)
- `getPlanetInfo()`: Retrieve Graha data from paged structure

### Drawing Tools (drawing-tools.js - ~2134 lines)
Comprehensive drawing system with multiple tools and editing capabilities.

Key Responsibilities:
- Implements all drawing tools (select, arrow, line, pen, laser, text, heading)
- Creates arrows via `CitranaArrow.create()` (filled `Konva.Line`, not `Konva.Arrow`)
- Delegates laser pointer to `CitranaLaser` (Canvas 2D overlay — not Konva, not serialised)
- Calls `window.app.recordHistory()` for drawing and Graha edit actions (laser excluded)
- Handles shape selection and editing
- Provides precise positioning and hit detection
- Manages Edit UI integration
- Implements Graha text editing (`#text-edit-controls` bar; colour via `#text-edit-color` + `CitranaColorPicker`)

Available Tools:
- Select Tool: Choose and modify existing elements
- Arrow Tool: Create directional indicators with arrowheads and control points
- Line Tool: Draw straight lines and connections with control points
- Pen Tool: Freehand drawing for annotations (spline tension + point filtering for smooth curves)
- Laser Pointer: Ephemeral presentation highlight via `CitranaLaser`; stays active for continuous drawing like Pen
- Text Tool: Add editable text boxes
- Heading Tool: Create chart headings and titles

Key Features:
- Pixel-perfect positioning
- Touch and mouse support
- Shape selection and editing
- Colour and stroke customisation
- Default stroke widths: Pen **3px**, Line and Arrow **4px** (`edit-ui.js` defaults + tool `start*` methods)
- Text editing with font controls
- Graha text editing with retrograde underline support (Konva `textDecoration`)
- Graha edit sessions: **Save** / click-away / Enter → `dismissPlanetEditing()` (commits if dirty); **Cancel** / Escape → `cancelPlanetEditing()` (discards)
- Auto-switch to Select Tool after Arrow, Line, Text, and Heading creation; Pen and Laser stay active for continuous drawing
- `makeShapeSelectable()` binds drag/selection once when a stroke completes (`stopDrawing`), not on every mousemove; touch double-tap guarded by `_editUiDoubleTapBound`
- Control points for precise arrow and line adjustment; `Adjust drawing` on handle drag end

Key Methods:
- `startDrawing()` / `draw()` / `stopDrawing()`: Drawing lifecycle
- `makeShapeSelectable()` / `bindMoveDragHistory()`: Selection and move undo
- `editPlanetText()` / `dismissPlanetEditing()` / `cancelPlanetEditing()`: Graha label/colour/retrograde bar — dismiss commits if edited (click outside); cancel discards (Cancel / Escape)
- `editText()` / `editHeading()`: Inline content editors with undo on commit; hide Edit UI before opening
- `startInlineContentEdit()` / `focusInlineTextarea()`: Items **Edit text** and double-click path for Text/Heading
- `showEditUIForShape()`: Edit interface integration
- `setPlanetRetrogradeState()`: Persist retrograde underline on Graha text
- `createControlPoints()` / `commitControlPointAdjust()`: Arrow/line endpoint handles
- `updateControlPointsPosition()` / `clearControlPoints()`: Control point sync
- `restorePersistedDrawings()`: Rebuild drawings from history snapshots; migrates legacy `Konva.Arrow` via `CitranaArrow.fromLegacyNode()`; calls `bindRestoredDrawingInteractions()`
- `bindRestoredDrawingInteractions()`: Re-bind selection/drag handlers after undo or session restore
- `clearLaser()` / `isLaserToolAvailable()`: Laser overlay lifecycle; delegates to `CitranaDevice.isLaserViewport()`
- Touch detection via `CitranaDevice.isTouchDevice()`; mobile font sizing via `CitranaDevice.isMobileUA()`

### Citrana Device (citrana-device.js - ~39 lines)
Shared touch, mobile UA, and viewport helpers.

Key Methods:
- `isTouchDevice()`, `isMobileUA()`, `isCompactViewport()` (`innerWidth <= 600`), `isLaserViewport()` (all viewports), `hasFinePointer()`

Used by `app.js`, chart templates, `drawing-tools.js`, `context-menu.js`, and `citrana-laser.js`.

### Citrana Rashis (citrana-rashis.js - ~41 lines)
Shared Rashi names, symbols, and South Indian grid numbers (1–12).

Key Exports:
- `RASHIS`, `NAMES`, `NUMBERS`, `getName(rashiNumber)`, `getNumberForHouseIndex(houseIndex0to11)`

Used by `context-menu.js` (North **Set Lagna as …** submenu), chart templates, and `citrana-items-menu.js` (South Bhava row labels).

### Citrana Graha Selection (citrana-graha-selection.js - ~96 lines)
Graha **Selection Pill** — colour-independent indicator behind Graha text.

Key Responsibilities:
- Selection Pill — white rounded `Konva.Rect` (`planet-selection-pill`) behind selected Graha text
- `listening: false` on pill; Graha text stays on top for hit-testing
- Extra padding on mobile (`CitranaDevice.isMobileUA()`)

Key Methods:
- `attach(planetText, parentGroup)`, `sync(planetText)`, `detach(planetText)`

Wired from South/North `selectPlanet()` / `clearSelectedPlanet()` and on Graha `dragmove`.

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

### Context Menu (context-menu.js - ~717 lines)
Provides right-click and long-press context menus for chart, bhava, and Graha interaction.

Key Responsibilities:
- Unified hit-test routing via `openContextMenuAtClientPoint()` (desktop right-click and mobile 500ms long-press)
- **`shouldBlockCanvasContextMenu()`**: Suppresses canvas menus when disabled by user, while drawing, or when active tool is not Select/Hand
- Creates context-sensitive menus with chart-type-specific items
- **Presentation View** on create chart, existing chart, and Bhava menus via `getPresentationViewMenuHtml()`
- Prevents chart menu from overriding Graha or bhava menus
- Implements mobile-friendly touch interactions

Menu Types:
- **Chart Creation Menu** (empty canvas): Create North/South Indian chart, **Presentation View**, Clear Canvas
- **Existing Chart Menu** (canvas, no Bhava/Graha hit): **Presentation View**; Reset Chart, Reset Drawings, Clear Canvas; **North Indian only**: Set Lagna as … (Rashi flyout submenu; tap to expand on touch)
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
- `openPlanetEditor()`, `removePlanetFromHouse()`, `clearHousePlanets()`, `getActiveChartTemplate()`, `findPlanetTextNode()`

### Citrana Items Menu (citrana-items-menu.js - ~635 lines)
Floating **Items** panel for chart, Bhava, Graha, and annotation actions — primary touch-friendly alternative to context menus.

Key Responsibilities:
- Opens from `#items-menu-btn` in the zoom bar (desktop and mobile)
- Renders sections: **Chart**, **Canvas**, **Bhavas**, **Grahas**, **Annotations**
- **Canvas**: **Clear Selection** (`app.clearCanvasSelection()`), **Disable Context Menu** / **Enable Context Menu**
- Selected rows use `.items-row-selected`; `refreshSelectionHighlight()` syncs with `app.getCanvasSelection()`
- South Indian Bhava rows show fixed Rashi names with zodiac symbols (`CitranaRashis`)
- Reuses `context-menu.js` `handleAction()` for chart/Bhava/Graha actions where possible
- Text/Heading rows: **Edit text** (`startInlineContentEdit`) and **Style** (`showEditUI`); other annotations: single **Edit** → `showEditUI`
- **Presentation View** and chart management actions mirror context menu icons

Key Methods:
- `init()`, `open()`, `close()`, `render()`, `handleBodyClick()`, `refreshSelectionHighlight()`
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

Wired from `app.saveSession()` / `app.openSessionFromFile()` / `app.restoreSessionState()`; import resets undo timeline via `history.resetToState()`.

### Edit UI (edit-ui.js - ~786 lines)
Provides context-sensitive editing controls for drawing elements.

Key Responsibilities:
- Creates floating edit interface
- Provides tool-specific controls
- Manages shape property editing
- Handles colour and stroke customisation
- Implements text editing controls
- Records one undo step per edit session on `hide()` when properties changed
- Touch-outside dismiss ignores colour picker popup (`.cp_dialog`) and Konva inline textarea (`.konva-textarea`)

Edit Controls:
- Stroke width and colour controls (pen, line, arrow) — defaults Pen 3px, Line/Arrow 4px; colour via `CitranaColorPicker.createInput()` chips
- Font size, weight, style, alignment, and colour (text, heading)
- Retrograde toggle (Graha text only — records via `setPlanetRetrogradeState`, not session close)
- Delete functionality

Key Features:
- Session-based undo: `markEditDirty()` on changes; `_commitEditHistoryIfNeeded()` on `hide()`
- Delete sets `_skipHistoryOnHide` to avoid double steps with `Delete drawing`
- Floating, bottom-centre positioning
- Mobile-optimised touch targets

Key Methods:
- `show()` / `hide()`: Display/hide; commit history on hide when dirty
- `createToolControls()`: Build tool-specific controls
- `updateStrokeWidth()` / `updateStrokeColor()` / `updateTextColor()`: Property updates (font size/weight/style are applied inline in `createTextControls()`)
- `markEditDirty()` / `_commitEditHistoryIfNeeded()`: Session undo integration

## Core Features

### Undo / Redo

Unified **50-step** timeline via `CitranaHistory` (`history.js`). Toolbar **Undo** / **Redo** buttons (`#undo-btn`, `#redo-btn`) and keyboard shortcuts.

| Control | Action |
|---------|--------|
| **Undo** toolbar button / **Ctrl+Z** / **Cmd+Z** | Undo |
| **Redo** toolbar button / **Ctrl+Y** / **Ctrl+Shift+Z** / **Cmd+Shift+Z** | Redo |

Toolbar buttons disable when `canUndo()` / `canRedo()` is false (`updateHistoryButtons()` after each record, undo, or redo).

Each step snapshots **chart data** (type, Lagna, Grahas, South centre label) and **drawings** (`drawing-*` Konva nodes).

**Tracked:** create/reset/clear chart; add/move/remove/edit Grahas; set Lagna; clear Bhava; draw/move/adjust/delete annotations; Edit UI style sessions; inline text/heading edits; centre label edit.

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
- **Save Chart Only**: Same `#export-btn` exports only the chart area — saves/restores zoom/pan, calls `zoomToFit()`, crops via `getExportCropRect()`, includes Grahas and on-chart annotations, leaves out anything outside the chart boundary, transparent background, no padding or watermark; locks `#toggle-transparency-btn` on. Falls back to full viewport export when no chart is loaded
- **Persistence**: `localStorage.citrana_north_hide_indicators`, `citrana_south_hide_indicators`, and `citrana_save_chart_only` (`'1'` when enabled; keys removed when off); defaults are indicators visible and full viewport export
- **Application**: `app.setNorthHideIndicators()` / `setSouthHideIndicators()` / `setSaveChartOnly()`; indicator prefs reapply on chart create and Lagna changes via `apply*IndicatorsPreference()`
- **Undo**: Options preferences are not tracked in the undo timeline

### Chart Management Actions
- Clear Canvas: Removes everything (charts, Grahas, drawings) and returns to blank canvas
- Reset Chart: Removes Grahas and drawings, but keeps chart structure/layout
- Reset Drawings: Removes only drawings, keeps Grahas and chart structure

### Graha Management
- 60 Major Grahas: 12 traditional Grahas on Page 1, 12 Jaimini Karakas on Page 2, 12 Tamil Grahas on Page 3, 12 Hindi Grahas on Page 4, and 12 Upagrahas and outer Grahas on Page 5
- Paging System: Five-page navigation with desktop dots and mobile swipe
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
- Pen Tool: Freehand drawing with smoothed spline curves (default 3px)
- Laser Pointer: Temporary fading highlight for presentations (`CitranaLaser` Canvas overlay; shortcut **K**; not saved or undoable)
- Presentation View: Context menu or **Items** panel toggle hides toolbar, zoom bar, Graha library, Help, About, Graha edit bar, and drawing Edit UI; dismisses active edit sessions on enter
- Text Tool: Add editable text boxes anywhere on canvas
- Heading Tool: Create chart headings and titles
- Undo/Redo: Unified timeline via `app.recordHistory()` — see [Undo / Redo](#undo--redo)
- Auto-Switch Behaviour: Arrow, Line, Text, and Heading automatically switch to Select Tool after creation; Pen and Laser remain active
- Control Points: Draggable handles for adjusting start and end points of arrows and lines

### Control Points Feature
The control points system provides precise adjustment capabilities for arrow and line elements:

Functionality:
- Control points appear automatically when arrows or lines are selected
- Two draggable handles at the start and end points of each element
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
- Context Menus: Right-click or long-press on canvas, bhava, or Graha (Select/Hand when enabled; suppressed while drawing or when disabled via Items); chart-type-specific Bhava actions; Graha edit/delete; **Presentation View**
- **Items Panel**: `#items-menu-btn` in zoom bar — chart/Bhava/Graha/annotation actions; **Clear Selection** and **Disable Context Menu**; row highlight syncs with canvas selection; primary mobile/touch workflow
- **Graha Selection Pill**: **Selection Pill** behind Graha text when selected; Bhava highlight in light grey
- Status Updates: Real-time feedback and notifications
- Ephemeral tab sessions: Refresh starts fresh — **Save Session** (`.citrana.json`) or export PNG to keep work
- Help Modal: Shortcuts and usage guide (Laser Pointer, Items panel, Presentation View, undo exclusions); `#help-modal-description` / `.help-modal-description` intro spacing
- About Modal: Information about Citrana with creator details and links; mobile compact layout without scroll
- Welcome Modal: First-time user experience; `closeWelcomeModal()` marks seen in `localStorage`; mobile compact layout without scroll
- Options Modal: Chart indicator toggles and **Save Chart Only** export; shared modal width with Help (`width: min(600px, 90vw)`)
- Confirmation Modal: Destructive-action confirm; dynamic message + warning in `aria-describedby`
- Export Progress Modal: Non-dismissible; live status in `aria-describedby`; `aria-busy` while exporting
- Modal accessibility: Escape dismiss, Tab focus trap, focus restore on close; canvas `role="application"` with `aria-label`
- Zoom Controls: `#zoom-in`, `#zoom-out`, `#reset-zoom`, `#zoom-lock` (default locked), `#zoom-level`, **`#items-menu-btn`**
- Zoom Lock: Prevents accidental scroll-wheel and +/- zoom until user unlocks; reset zoom always available
- Toolbar scroll: `#toolbar-scroll-viewport` with chevrons when tools overflow on narrow screens
- iOS PWA: Safe-area layout for home-screen install (see CSS section); desktop is primary supported experience

### Export & Sharing
- **Full viewport export** (default): `stage.toDataURL({ pixelRatio: 2 })` on entire stage; 100px padding and watermark via `finalizeExportImage()`; respects current zoom/pan and `#toggle-transparency-btn`
- **Save Chart Only** (`options.saveChartOnly` + active chart): temporarily `zoomToFit()`, crop to `ChartCoordinator.getExportCropRect()` (chart group + visible North `tinyBoxGroupNorth`), transparent background, no padding or watermark; restores user's zoom/pan after capture
- **Save Session**: `.citrana.json` file with chart, Grahas, drawings, and Options preferences
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
- Use the **Items** panel (`#items-menu-btn`) for chart/Bhava/Graha/annotation actions when context menus are awkward on touch
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
Edit the Graha data objects in assets/js/planet-system.js:
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
- `localStorage` is used for preferences: welcome modal seen (`citrana_welcome_seen`), chart indicator toggles (`citrana_north_hide_indicators`, `citrana_south_hide_indicators`), Save Chart Only export (`citrana_save_chart_only`), context menu enable (`citrana_context_menu_enabled`), optional `citrana_debug` opt-out

## Support and Documentation

- AGENT.md: This comprehensive project documentation
- ARCHITECTURE.md: System architecture, data flows, and extension points
- README.md: Project overview and quick start
- CHANGELOG.md: Version history

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
- **Minified local JS:** `app`, `chart-coordinator`, `chart-templates-north`, `chart-templates-south`, `citrana-arrow`, `citrana-colorpicker`, `citrana-debug`, `citrana-device`, `citrana-graha-selection`, `citrana-items-menu`, `citrana-laser`, `citrana-rashis`, `citrana-session`, `context-menu`, `drawing-tools`, `edit-ui`, `history`, `planet-system`
- **Not minified in CI:** `assets/vendor/*` (Konva, Lucide, JSColorPicker — already minified)

### Local development

- Open `index.html` in the browser — no build; repo `index.html` references source `.js` / `.css`
- GitHub Pages serves minified assets only in the **deploy artifact** after CI rewrites `index.html` (the committed `main` tree keeps source filenames)

### Optional: deploy without minification

In `static.yml`, remove the Setup Node, Install minification tools, Minify CSS, Minify local JavaScript files, and Update HTML steps. Keep checkout → Setup Pages → Upload artifact → Deploy.

Built with love for the Vedanga Jyotisha community. 