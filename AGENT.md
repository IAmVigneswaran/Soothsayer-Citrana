# Citrana - Vedic Astrology Chart Builder

A modern, interactive web application for creating Vedic astrology charts with drag-and-drop planet placement and comprehensive drawing tools. Built with pure HTML5, CSS3, and JavaScript using Konva.js for canvas manipulation, this tool provides an intuitive interface for educators and students of Vedanga Jyotisha.

## Project Overview

Citrana is a browser-based application that allows users to create both South Indian and North Indian astrological charts. The application features a floating planet library, comprehensive drawing tools, context menus, and export capabilities. It runs entirely in the browser with no build process required, making it immediately deployable on GitHub Pages or any web server.

## Technology Stack

- Frontend: Pure HTML5, CSS3, JavaScript (ES6+)
- Graphics: HTML5 Canvas API with Konva.js (self-hosted, `assets/vendor/konva.min.js` v9.3.20)
- Styling: Custom CSS only
- Icons: Lucide Icons (self-hosted, `assets/vendor/lucide.min.js` v0.468.0)
- Storage: Browser `localStorage` for preferences (welcome modal, chart indicator toggles, debug opt-out)
- Analytics: Google Analytics and Google Tag Manager
- No build process required - runs entirely in browser

For system architecture, data flows, and extension points, see [ARCHITECTURE.md](ARCHITECTURE.md). This file (`AGENT.md`) and [.cursorrules](.cursorrules) should stay in sync with the codebase and each other.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [CSS and Layout](#css-and-layout-stylescss---2260-lines)
4. [Complete Project Structure](#complete-project-structure)
5. [Core Components Architecture](#core-components-architecture)
   - [Main Application (app.js)](#main-application-appjs---1394-lines)
   - [History Engine (history.js)](#history-engine-historyjs---77-lines)
   - [Chart Coordinator](#chart-coordinator-chart-coordinatorjs---299-lines)
   - [South Indian Chart Template](#south-indian-chart-template-chart-templates-southjs---993-lines)
   - [North Indian Chart Template](#north-indian-chart-template-chart-templates-northjs---949-lines)
   - [Planet System](#planet-system-planet-systemjs---839-lines)
   - [Drawing Tools](#drawing-tools-drawing-toolsjs---1902-lines)
   - [Context Menu](#context-menu-context-menujs---721-lines)
   - [Edit UI](#edit-ui-edit-uijs---775-lines)
6. [Core Features](#core-features)
   - [Undo / Redo](#undo--redo)
   - [Chart Types](#chart-types)
   - [Chart Display Options](#chart-display-options)
   - [Chart Management](#chart-management-actions)
   - [Planet Management](#planet-management)
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

## CSS and Layout (styles.css - ~2260 lines)

Light theme, floating UI, modals (Help and Options share modal chrome), responsive breakpoints (769px desktop, 768px tablet, 600px mobile).

**iOS standalone PWA (2.0):**
- Safe-area CSS vars (`--sat` … `--sal`, `--ui-inset`, `--ui-bottom-pad`, `--ui-bottom-stack`)
- `body { position: fixed; inset: 0 }` — avoids bottom gap on iOS
- `viewport-fit=cover`; manifest `display: standalone`
- Mobile: Graha library bottom stack; Help bottom-left; arrow/line/pen hidden in toolbar

## Complete Project Structure

```
Soothsayer-Citrana/
├── index.html                    # Main entry (~454 lines); viewport-fit=cover; PWA meta; Options modal
├── robots.txt
├── sitemap.xml
├── assets/
│   ├── css/
│   │   └── styles.css            # Complete styling system (~2260 lines)
│   ├── js/
│   │   ├── app.js                # Main application coordinator (~1394 lines)
│   │   ├── citrana-debug.js      # Contributor debug logging (~13 lines; on by default)
│   │   ├── chart-coordinator.js  # Chart type management (~299 lines)
│   │   ├── chart-templates-south.js  # South Indian chart logic (~993 lines)
│   │   ├── chart-templates-north.js  # North Indian chart logic (~949 lines)
│   │   ├── planet-system.js      # Graha library and drag-drop (~839 lines)
│   │   ├── drawing-tools.js      # Drawing tools implementation (~1902 lines)
│   │   ├── context-menu.js       # Context menu system (~721 lines)
│   │   ├── edit-ui.js            # Edit interface controls (~775 lines)
│   │   └── history.js            # Unified undo/redo timeline (~77 lines)
│   ├── vendor/
│   │   ├── konva.min.js          # Konva 9.3.20 (self-hosted; loaded in <head>)
│   │   └── lucide.min.js         # Lucide 0.468.0 (self-hosted)
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
├── AGENT.md                      # This comprehensive documentation (~974 lines)
├── ARCHITECTURE.md               # System architecture and data flows (~355 lines)
├── .cursorrules                  # Cursor IDE configuration (~995 lines)
├── CHANGELOG.md                  # Version history and changes (~57 lines)
├── README.md                     # Project readme (~177 lines)
├── LICENSE                       # MIT License
├── SECURITY.md                   # Security policy
└── .gitignore                    # Git ignore rules
```

> Line counts are approximate; run `wc -l` after significant edits. Update About modal version in `index.html` on each release.

## Core Components Architecture

For system design, module boundaries, data flows, and extension points, see [ARCHITECTURE.md](ARCHITECTURE.md).

### Main Application (app.js - ~1394 lines)
The central coordinator that manages all application components and lifecycle.

Key Responsibilities:
- Initialises Konva.js stage and layer
- Coordinates all component interactions
- Manages tool selection and drawing state
- Handles keyboard shortcuts and event listeners
- Manages unified undo/redo via `CitranaHistory` (`history.js`)
- Handles chart export
- Manages chart display options modal and `localStorage` indicator preferences
- Provides mobile touch support and Safari compatibility
- Manages zoom controls, zoom lock (default locked), zoom level display, and canvas resize (`visualViewport`)

Key Methods:
- `init()`: Application initialisation; loads `this.options` from `localStorage`
- `setupCanvas()`: Konva stage; `scaleXChange`/`scaleYChange` → `updateZoomLevel()`
- `setupComponents()` / `setupEventListeners()` / `setupKeyboardShortcuts()`
- `setTool()`: Tool routing to drawing tools and hand mode
- `zoomIn()` / `zoomOut()` / `zoomToFit()`: Delegate to `ChartCoordinator` (`zoomIn`/`zoomOut` no-op when locked; `zoomToFit` always works)
- `toggleZoomLock()` / `updateZoomLockUI()`: Toggle `zoomLocked`; swap `#zoom-lock` icon (`lock` / `lock-open`); disable `#zoom-in` / `#zoom-out`
- `updateZoomLevel()`: Updates `#zoom-level` from `stage.scaleX()`
- `handleResize()`: Stage size from `visualViewport` or container
- `handleWheel()`: Desktop wheel zoom about pointer when unlocked; early return when locked (no `preventDefault`)
- `exportChart()`: PNG export (`pixelRatio: 2`)
- `setNorthHideIndicators(hide)` / `setSouthHideIndicators(hide)`: Persist indicator toggles; apply to active chart template
- `recordHistory()` / `captureHistoryState()` / `restoreHistoryState()`: Undo timeline integration
- `undo()` / `redo()` / `updateHistoryButtons()`: Delegate to `this.history`; sync `#undo-btn` / `#redo-btn` disabled state
- `clearChart()` / `resetChart()` / `resetDrawings()`
- `showWelcomeModal()` / `showConfirmationDialog()`
- Mouse/touch handlers: `handleMouseDown/Move/Up`, `handleTouchStart/Move/End`

Keyboard shortcuts: `V` Select, `A` Arrow, `L` Line, `P` Pen, `T` Text, `H` Hand, `Ctrl+Z`/`Cmd+Z` undo, `Ctrl+Y`/`Ctrl+Shift+Z`/`Cmd+Shift+Z` redo, `+`/`-` zoom (when unlocked), `0` zoom to fit, `Delete` remove selected Graha or delete selected drawing (Select tool), `?`/`/` Help. No Heading shortcut.

### History Engine (history.js - ~77 lines)
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

### Chart Coordinator (chart-coordinator.js - ~299 lines)
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
- `zoomIn()` / `zoomOut()` / `zoomToFit()` / `updateZoomLevel()`
- `addPlanetToHouse()`, `clearAllPlanets()`, `highlightHouse()`, `clearHighlight()`, `renumberHouses()`, `clearChart()`
- `getStage()`: Konva stage (used by Graha library drop coords)

**Removed:** `setFirstHouse()`, `getDropZones()` (legacy).

### South Indian Chart Template (chart-templates-south.js - ~993 lines)
Handles the traditional South Indian chart layout with 4x4 grid structure.

Key Responsibilities:
- Creates 4x4 grid layout with centre empty space
- Manages house numbering and Lagna indicators
- Handles planet placement and text scaling
- Provides house highlighting and selection
- Manages Rashi and Bhava number boxes
- Handles house and Graha right-clicks (`stopPropagation`) for context menus

Key Features:
- Traditional square grid layout
- Centre empty space for annotations
- Lagna indicator with diagonal line
- Dynamic planet text sizing
- House renumbering based on Lagna position
- Touch and mouse interaction support

Key Methods:
- `createSouthIndianChart()`: Build chart layout
- `createHouse()`: Create individual house elements
- `addPlanetToHouse()`: Place planets in houses
- `setLagnaHouse(houseNumber, options?)`: Set ascendant with visual indicator; `skipSnapshot` for undo restore
- `renumberHouses()`: Update house numbering
- `getBhavaNumberForHouse()`: Get house number (1–12 from Lagna) for a fixed grid cell
- `findHouseAtChartPoint()`: Rectangle hit-test (with nearest-house fallback) for library drops
- `highlightHouse()` / `clearHighlight()`: Visual house selection
- `setSouthIndicatorsVisible(visible)` / `applySouthIndicatorsPreference()`: Show or hide lagna line and bhava/rashi boxes per `app.options`
- `zoomToFit()`: Fit chart to viewport using **local bounds** (immune to current zoom/pan)

### North Indian Chart Template (chart-templates-north.js - ~949 lines)
Handles the diamond-shaped North Indian chart layout with polygon-based houses.

Key Responsibilities:
- Creates diamond-shaped polygon layout
- Manages complex house positioning
- Handles tiny Rashi number boxes
- Provides advanced Rashi numbering logic (`lagnaHouseNorth` stores Rashi sign 1–12)
- Manages planet placement in polygon houses with per-Graha `rashiNumber`
- Handles house and Graha right-clicks (`stopPropagation`) for context menus

Key Features:
- Diamond-shaped polygon layout
- Precise house positioning using SVG coordinates
- Tiny Rashi number boxes with exact positioning
- Advanced Rashi numbering system
- Dynamic house renumbering
- Polygon-based hit detection

Key Methods:
- `createNorthIndianChart()`: Build diamond layout
- `addPlanetToHouse()`: Place planets in polygon houses
- `setLagnaHouse(houseNumber, options?)`: Set Lagna rashi; renumber and `repositionPlanetsForNewLagna()`; `skipSnapshot` for undo restore
- `renumberHouses()`: Update house numbering
- `isPointInPolygon()`: Hit detection for polygon houses
- `getRashiNumberForHouse()`: Rashi calculation
- `findHouseAtChartPoint()`: Polygon hit-test (with nearest-centroid fallback) for library drops
- `setNorthIndicatorsVisible(visible)` / `applyNorthIndicatorsPreference()`: Show or hide `tinyBoxGroupNorth` (bhava numbers in black corner boxes) per `app.options`
- `zoomToFit()`: Fit chart to viewport using **local bounds** (desktop `extraTopMargin=-50`)

### Planet System (planet-system.js - ~839 lines)
Manages the floating planet library and drag-and-drop functionality with paging system.

Key Responsibilities:
- Creates and manages floating planet library UI with paging
- Implements drag-and-drop for planet placement
- Handles touch and mouse interactions
- Manages planet data and visual representations
- Provides drop zone detection and validation
- Implements mobile-friendly drag preview
- Manages paging navigation for desktop and mobile

Key Features:
- Floating, draggable planet library with paging
- 51 planets across five pages with varying counts per page
- Desktop navigation with clickable page dots
- Mobile swipe navigation (left/right)
- Drag preview with visual feedback
- Touch and mouse support
- Drop zone validation
- Mobile-optimised interactions

Planet Library - Page 1 (Traditional Grahas):
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

Planet Library - Page 2 (Jaimini Karakas):
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

Planet Library - Page 3 (Tamil Grahas):
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

Planet Library - Page 4 (Hindi Grahas):
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

Planet Library - Page 5 (Outer Planets):
- Ur: Uranus
- Ne: Neptune
- Pl: Pluto

Key Methods:
- `init()`: Initialise planet library
- `createPlanetLibrary()`: Build UI elements with paging
- `createPageDots()`: Create desktop navigation dots
- `setupSwipeEvents()`: Configure mobile swipe navigation
- `goToPage()`: Navigate between pages
- `setupDragAndDrop()`: Configure drag functionality
- `handleDragStart/Move/End()`: Drag interaction handling
- `handleTouchStart/Move/End()`: Touch interaction handling
- `handleDrop()` / `handleMobileDrop()`: Place Graha on chart (one-shot selected bhava or pointer hit-test)
- `clearSelectedBhavaDropTarget()`: Clear `window.selectedBhavaSouth` / `window.selectedBhavaNorth` after a successful library drop
- `findClosestHouse()`: Delegates to `ChartCoordinator.findHouseAtPointer()` (Konva pointer during HTML5 drop)
- `findHouseAtPosition()`: Delegates to `ChartCoordinator.findHouseAtClientPoint()` (viewport coords for touch / drop fallback)
- `getPlanetInfo()`: Retrieve planet data from paged structure

### Drawing Tools (drawing-tools.js - ~1902 lines)
Comprehensive drawing system with multiple tools and editing capabilities.

Key Responsibilities:
- Implements all drawing tools (select, arrow, line, pen, text, heading)
- Calls `window.app.recordHistory()` for drawing and Graha edit actions
- Handles shape selection and editing
- Provides precise positioning and hit detection
- Manages Edit UI integration
- Implements Graha text editing (`#text-edit-controls` bar)

Available Tools:
- Select Tool: Choose and modify existing elements
- Arrow Tool: Create directional indicators with arrowheads and control points
- Line Tool: Draw straight lines and connections with control points
- Pen Tool: Freehand drawing for annotations
- Text Tool: Add editable text boxes
- Heading Tool: Create chart headings and titles

Key Features:
- Pixel-perfect positioning
- Touch and mouse support
- Shape selection and editing
- Colour and stroke customisation
- Text editing with font controls
- Graha text editing with retrograde underline support (Konva `textDecoration`)
- Graha edit sessions commit on Save / dismiss when dirty (`planetEditSession`)
- Auto-switch to Select Tool after Arrow, Line, Text, and Heading creation; Pen stays active for continuous drawing
- `makeShapeSelectable()` binds drag/selection once when a stroke completes (`stopDrawing`), not on every mousemove; touch double-tap guarded by `_editUiDoubleTapBound`
- Control points for precise arrow and line adjustment; `Adjust drawing` on handle drag end

Key Methods:
- `startDrawing()` / `draw()` / `stopDrawing()`: Drawing lifecycle
- `makeShapeSelectable()` / `bindMoveDragHistory()`: Selection and move undo
- `editPlanetText()` / `cancelPlanetEditing()`: Graha label/colour/retrograde bar
- `editText()` / `editHeading()`: Inline content editors with undo on commit
- `showEditUIForShape()`: Edit interface integration
- `setPlanetRetrogradeState()`: Persist retrograde underline on Graha text
- `createControlPoints()` / `commitControlPointAdjust()`: Arrow/line endpoint handles
- `updateControlPointsPosition()` / `clearControlPoints()`: Control point sync
- `restorePersistedDrawings()`: Rebuild drawings from history snapshots

### Context Menu (context-menu.js - ~721 lines)
Provides right-click and long-press context menus for chart, bhava, and Graha interaction.

Key Responsibilities:
- Unified hit-test routing via `openContextMenuAtClientPoint()` (desktop right-click and mobile 500ms long-press)
- Creates context-sensitive menus with chart-type-specific items
- Prevents chart menu from overriding Graha or bhava menus
- Implements mobile-friendly touch interactions

Menu Types:
- **Chart Creation Menu** (empty canvas): Create North/South Indian chart, Clear Canvas
- **Existing Chart Menu** (canvas, no house/planet hit): Reset Chart, Reset Drawings, Clear Canvas; **North Indian only**: Set Lagna as… (zodiac; submenu desktop, flat list mobile)
- **House Menu** (bhava hit):
  - **South Indian**: Header `House N` (Lagna-relative); **Set as Lagna** (`set-lagna`); Clear House; …
  - **North Indian**: Header `House N` (visual); **Set as First House** (`set-first-house`); Clear House; …
- **Planet Menu**: Edit Graha, Delete Graha

Lagna actions (`handleAction`):
- `set-lagna`: South house menu → `setLagnaHouse(visualHouse)`; North chart menu → `setLagnaHouse(rashi 1–12)`. Skipped if `houseNumber` missing (no default fallback).
- `set-first-house`: North house menu only → `getRashiNumberForHouse()` → `setLagnaHouse(rashi)`

Key Methods:
- `openContextMenuAtClientPoint()`, `resolveContextTarget()`, `getShapeAtClientPoint()`, `findPlanetContextById()`
- `showChartMenu()`, `showHouseMenu()`, `showPlanetMenu()`, `showExistingChartMenu()`, `showCreateChartMenu()`
- `handleAction()`, `setupMenuEventListeners()`, `setupSubmenuHover()`
- `openPlanetEditor()`, `removePlanetFromHouse()`, `clearHousePlanets()`, `getActiveChartTemplate()`, `findPlanetTextNode()`

### Edit UI (edit-ui.js - ~775 lines)
Provides context-sensitive editing controls for drawing elements.

Key Responsibilities:
- Creates floating edit interface
- Provides tool-specific controls
- Manages shape property editing
- Handles colour and stroke customisation
- Implements text editing controls
- Records one undo step per edit session on `hide()` when properties changed

Edit Controls:
- Stroke width and colour controls (pen, line, arrow)
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

**Tracked:** create/reset/clear chart; add/move/remove/edit Grahas; set Lagna; clear house; draw/move/adjust/delete annotations; Edit UI style sessions; inline text/heading edits; centre label edit.

**Not tracked:** zoom, pan, active tool, bhava highlight, Graha library page, modals, chart indicator visibility preferences.

**Deferred 2.1:** visible History panel listing `entries[].label`.

See [ARCHITECTURE.md — Undo / redo](ARCHITECTURE.md#undo--redo) for data flow and extension points.

### Chart Types
- South Indian Chart: Traditional 4x4 square grid layout with centre empty space; Rashi signs are fixed per grid cell
- North Indian Chart: Diamond-shaped polygon layout with dynamic Rashi numbering based on Lagna
- **South Indian Lagna**: Right-click a bhava → **Set as Lagna** only (no chart-level Set as Lagna). House menu header shows **House N** counted from Lagna (not fixed grid position)
- **North Indian Lagna**: Right-click empty canvas → **Set Lagna as…** (choose zodiac sign); or right-click a bhava showing a sign → **Set as First House** (that Rashi becomes Lagna). Grahas reposition by stored `rashiNumber`
- Dynamic House Numbering: South Indian bhava numbers (yellow boxes) rotate from Lagna; North Indian Rashi boxes recalculate from Lagna

### Chart Display Options
- **Options modal**: `#options-btn` (gear icon in toolbar export group, after Save) opens `#options-modal`
- **Hide North Indian Chart Indicators**: Hides bhava numbers in black corner boxes (`tinyBoxGroupNorth`)
- **Hide South Indian Chart Indicators**: Hides lagna diagonal line, yellow bhava boxes, and black rashi boxes
- **Persistence**: `localStorage.citrana_north_hide_indicators` and `citrana_south_hide_indicators` (`'1'` when hidden; key removed when shown again); default is visible
- **Application**: `app.setNorthHideIndicators()` / `setSouthHideIndicators()` update preference and call `applyNorthIndicatorsPreference()` / `applySouthIndicatorsPreference()` on the active chart; templates reapply on chart create and Lagna changes
- **Undo**: Indicator visibility is not tracked in the undo timeline

### Chart Management Actions
- Clear Canvas: Removes everything (charts, planets, drawings) and returns to blank canvas
- Reset Chart: Removes planets and drawings, but keeps chart structure/layout
- Reset Drawings: Removes only drawings, keeps planets and chart structure

### Planet Management
- 51 Major Grahas: 12 traditional Grahas on Page 1, 12 Jaimini Karakas on Page 2, 12 Tamil Grahas on Page 3, 12 Hindi Grahas on Page 4, and 3 Outer Planets on Page 5
- Paging System: Five-page navigation with desktop dots and mobile swipe
- Text-based Display: Uses abbreviations instead of symbols for better compatibility
- Drag & Drop: Grahas from the floating library land in the bhava under the pointer, or in a house you clicked first (`window.selectedBhavaSouth` / `window.selectedBhavaNorth` — one-shot: cleared after the next successful drop or when you click empty canvas)
- Multiple Instances: Same planet can be placed multiple times
- Dynamic Text Sizing: Planet text scales based on house occupancy
- Touch Support: Mobile-friendly touch interactions with visual feedback
- Degree Support: Add degree positions to Grahas (e.g., "Su-20")
- Graha Editing: Double-click a Graha, or right-click → **Edit Graha**, to open the floating edit panel (label, colour, retrograde)
- Graha Deletion: Right-click → **Delete Graha**, delete from the edit panel, or press **Delete** when a Graha is selected
- Retrograde Display: Underlined Graha text via Konva `textDecoration` (stored as `retrograde: boolean` on planet data, not appended to the label)
- Legacy Migration: Older charts that used the Unicode subscript `ᵣ` are normalised automatically (marker removed, underline applied)
- 8-Character Limit: Applies to Graha label text only; retrograde does not consume a character slot

### Drawing Tool Summary
- Select Tool: Choose and modify existing elements with Edit UI
- Arrow Tool: Create directional indicators with customisable arrowheads and control points
- Line Tool: Draw straight lines and connections with control points
- Pen Tool: Freehand drawing for annotations
- Text Tool: Add editable text boxes anywhere on canvas
- Heading Tool: Create chart headings and titles
- Undo/Redo: Unified timeline via `app.recordHistory()` — see [Undo / Redo](#undo--redo)
- Auto-Switch Behaviour: Arrow, Line, Text, and Heading automatically switch to Select Tool after creation; Pen remains active
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
- Responsive Design: Optimised for desktop, tablet, and mobile devices
- Keyboard Shortcuts: Tools, undo/redo, zoom (when unlocked), delete, help — see Main Application
- Undo/Redo Toolbar: `#undo-btn` and `#redo-btn` in the top toolbar (first group); disabled when no steps available
- Context Menus: Right-click or long-press on canvas, bhava, or Graha; chart-type-specific house actions; Graha edit/delete
- Status Updates: Real-time feedback and notifications
- Ephemeral Sessions: Chart work lives in this browser tab; refresh starts fresh — export PNG to keep a copy
- About Modal: Information about Citrana with creator details and links
- Welcome Modal: First-time user experience with getting started guide
- Options Modal: Chart indicator visibility toggles (North/South); shared modal width with Help (`width: min(600px, 90vw)`)
- Zoom Controls: `#zoom-in`, `#zoom-out`, `#reset-zoom`, `#zoom-lock` (default locked), `#zoom-level`; mobile adds Select/Hand in zoom bar
- Zoom Lock: Prevents accidental scroll-wheel and +/- zoom until user unlocks; reset zoom always available
- iOS PWA: Safe-area layout for home-screen install (see CSS section); officially desktop-only
- Mobile drawing: Arrow, line, and pen tools hidden in CSS on `≤768px`

### Export & Sharing
- High-Resolution PNG: Export at `pixelRatio: 2` with padding and watermark
- Ephemeral Sessions: Work is not restored after refresh; export PNG to keep a copy
- Cross-Platform: Works on all modern browsers
- GitHub Pages Compatible: No build process required

## Browser Compatibility

- Desktop: Brave 1.80+, Chrome 138+, Firefox 128+, Safari 18+, Edge 138+
- Note: For Brave browser, disable Brave Shields for optimal functionality
- Features: Canvas API, localStorage, ES6+ JavaScript (classic script tags), Touch Events

Mobile Support:
- Citrana is not supported on mobile or touch devices

Special Note on Mobile Support:
While the codebase might have limited support for mobile or touch, officially it is advertised as mobile is not supported due to its complexity and limited resources. Project owners have to acquire various mobile or touch devices with different screen sizes. It is not a practical task for a free and open-source application.

## Performance Optimisation

- Efficient Canvas Rendering: Konva.js optimisation
- Optimised resize handlers
- Optimised Planet Placement: Efficient algorithms
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
 * © 2025 Vigneswaran Rajkumar • Licensed under MIT License
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

### Adding New Planets
Edit the planets objects in assets/js/planet-system.js:
```javascript
// Planet data - Page 1 (Traditional Grahas)
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

        // Planet data - Page 2 (Jaimini Karakas)
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

        // Planet data - Page 3 (In Tamil)
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

        // Planet data - Page 4 (In Hindi)
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

        // Planet data - Page 5 (Outer Planets)
        this.planetsPage5 = {
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
- House colours and borders in chart template files
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
- The application does NOT use planet symbols
- All planets are displayed using text abbreviations (Su, Mo, Ma, etc.)
- This ensures better compatibility and accessibility

### No Build Process
- Application runs entirely in the browser
- No server-side dependencies
- No build tools or compilation required
- Ready for immediate deployment on GitHub Pages

### Data Management
- Chart work lives in the browser tab for the current visit only; refreshing the page starts a fresh session
- Export PNG to keep a copy; chart data is not uploaded to a server
- `localStorage` is used for preferences: welcome modal seen (`citrana_welcome_seen`), chart indicator toggles (`citrana_north_hide_indicators`, `citrana_south_hide_indicators`), optional `citrana_debug` opt-out

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
- **Minified local JS:** `app`, `chart-coordinator`, `chart-templates-north`, `chart-templates-south`, `citrana-debug`, `context-menu`, `drawing-tools`, `edit-ui`, `history`, `planet-system`
- **Not minified in CI:** `assets/vendor/*` (Konva, Lucide — already minified)

### Local development

- Open `index.html` in the browser — no build; repo `index.html` references source `.js` / `.css`
- GitHub Pages serves minified assets only in the **deploy artifact** after CI rewrites `index.html` (the committed `main` tree keeps source filenames)

### Optional: deploy without minification

In `static.yml`, remove the Setup Node, Install minification tools, Minify CSS, Minify local JavaScript files, and Update HTML steps. Keep checkout → Setup Pages → Upload artifact → Deploy.

Built with love for the Vedanga Jyotisha community. 