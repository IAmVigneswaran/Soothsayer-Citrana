<div align="center">
  <img alt="Citrana Logo" src="https://raw.githubusercontent.com/IAmVigneswaran/Soothsayer-Citrana/main/assets/images/Soothsayer-Citrana-Full-Logo-Black.png#gh-light-mode-only">
  <img alt="Citrana Logo" src="https://raw.githubusercontent.com/IAmVigneswaran/Soothsayer-Citrana/main/assets/images/Soothsayer-Citrana-Full-Logo-White.png#gh-dark-mode-only">
  <h1>Citrana</h1>
</div>

<p align="center"><a href="https://github.com/IAmVigneswaran/Soothsayer-Citrana/blob/main/LICENSE"><img src="http://img.shields.io/badge/license-MIT-lightgrey.svg?style=flat" alt="license"/></a>&nbsp;<a href="https://github.com/IAmVigneswaran/Soothsayer-Citrana"><img src="https://img.shields.io/badge/platform-Web-lightgrey.svg?style=flat" alt="platform"/></a>&nbsp;<a href="https://github.com/IAmVigneswaran/Soothsayer-Citrana/actions/workflows/static.yml"><img src="https://github.com/IAmVigneswaran/Soothsayer-Citrana/actions/workflows/static.yml/badge.svg" alt="deploy"/></a>&nbsp;<a href="https://github.com/IAmVigneswaran/Soothsayer-Citrana/actions/workflows/codeql.yml"><img src="https://github.com/IAmVigneswaran/Soothsayer-Citrana/actions/workflows/codeql.yml/badge.svg" alt="codeql"/></a>&nbsp;<img src="https://img.shields.io/badge/JavaScript-ES6+-yellow.svg?style=flat" alt="JavaScript"/>&nbsp;<img src="https://img.shields.io/badge/HTML5-CSS3-orange.svg?style=flat" alt="HTML5-CSS3"/></p>

Citrana is a planetary chart builder and a whiteboard web application that allows students, gurus, and Vedanga Jyotisha practitioners to create Janma Kundali (Vedic charts) for study and reference. Built with pure HTML5, CSS3, and JavaScript, this modern, interactive tool provides an intuitive interface for creating both South Indian and North Indian astrological charts with drag-and-drop Graha placement and basic drawing tools.

Perfect for educational purposes, research documentation, and professional chart analysis, Citrana offers a seamless experience for anyone studying or practising Vedanga Jyotisha (Vedic astrology). Whether you're a student learning the fundamentals, a guru teaching traditional methods, or a researcher documenting complex Graha combinations to decode Karma, Citrana provides the tools you need to build Janma Kundali for online classes, presentations, and personal reference.

This codebase is developed using AI agents.

## Definition of Citrana

### Sanskrit (संस्कृतम्)
**Citraṇā** (चित्रणा): The act of painting, drawing, illustration, or portrayal. Derived from the Sanskrit root *citrayati* with the suffix *-anā*.

### Tamil (தமிழ்)
**சித்திரம்** (Cittiram): Artistic representation, drawing, illustration, or systematic arrangement.

### Hindi (हिंदी)
**Citraṇa** (चित्रण): Portrayal, delineation, painting, illustration, or drawing.

## Core Features

- **Charts:** South Indian (4×4 grid) and North Indian (diamond layout) with dynamic Bhava numbering; set Lagna via **Set as Lagna** (South) or **Set as First Bhava** / **Set Lagna as …** (North)
- **Options:** Choose **Zoom Step** (**Fine (1%)** default, Small, Medium, or Large), hide North or South chart indicators, or enable **Save Chart Only** for a fitted transparent chart export — from the gear icon in the toolbar; preferences persist in this browser and in session files
- **Graha Library:** 60 Grahas across five pages — traditional Grahas, Jaimini Karakas, Tamil, Hindi, and Upagrahas with outer Grahas; switch pages with dots, keys **1**–**5**, or on mobile by swiping the dots bar
- **Grahas on the Chart:** Drag onto the Bhava under your pointer; click a Bhava first to target the **next** drop only; **Selection Pill** on select; edit text, colour, retrograde (underlined), and degrees; **Clear Bhava** removes every Graha from a Bhava
- **Annotations:** Select, arrow, line, pen, text, heading, and **Laser Pointer** (**K**) on the canvas; multi-line text, hand-written **Shantell Sans** style, and rich colour controls; pen strokes can be selected and moved; laser strokes fade and are not saved
- **Canvas Items:** Layers icon in the zoom bar or **I** — chart actions, Bhavas, Grahas, Annotations, and canvas controls on desktop and touch; **Section Anchors** jump between sections; **Context Menu** on/off (off by default on touch) and **Graha Library** on/off in the **Canvas** section (green/red row tint); Text and Heading rows offer separate **Edit text** and **Style** actions
- **Canvas hints:** On a blank canvas, illustrated tips highlight the Graha Library, toolbar, zoom bar, and Help; they disappear after you create a chart, place a Graha, or add an Annotation
- **Presentation View:** Hide toolbar, zoom bar, Graha library, Help, and About for a clean on-screen chart; separate from the Graha Library visibility toggle
- **Zoom and Pan:** Zoom is **locked by default**; unlock from the zoom bar for scroll-wheel zoom; **Reset Zoom** always refits the chart
- **Undo and Redo:** Up to 50 steps via toolbar buttons or **Ctrl+Z** / **Cmd+Z** and **Ctrl+Y** / **Cmd+Shift+Z**; tracks chart, Graha, and Annotation changes (not zoom, pan, laser strokes, or Presentation View)
- **Save and Open Session:** Download or restore `.citrana.json` files — chart, Grahas, Annotations, and Options; Save As dialog before download; **Open Session** dialog before the file picker; save to any cloud storage and **Open Session** on another device to resume where you left off
- **Export PNG:** High-resolution images with optional transparency; Save As dialog before download
- **Privacy:** Chart data stays in your browser — nothing is uploaded to our servers; refreshing starts a fresh session unless you save or export
- **Keyboard shortcuts:** Tools (**K** laser, **I** Canvas Items), Graha Library pages **1**–**5**, undo/redo, zoom when unlocked, and **Delete** (selected Graha first, then selected Annotation) — press `?` or `/` in the app for the full list

## Table of Contents

- [Tutorials](#tutorials)
- [Screenshot](#screenshot)
- [Quick Start](#quick-start)
  - [Prerequisites](#prerequisites)
  - [Browser and Device Compatibility](#browser-and-device-compatibility)
- [Usage Guide](#usage-guide)
  - [Creating Your First Chart](#creating-your-first-chart)
  - [Charts](#charts)
  - [Options](#options)
  - [Graha Library](#graha-library)
  - [Grahas on the Chart](#grahas-on-the-chart)
  - [Annotations](#annotations)
  - [Canvas Items](#canvas-items)
  - [Presentation View](#presentation-view)
  - [Zoom and Pan](#zoom-and-pan)
  - [Undo and Redo](#undo-and-redo)
  - [Sessions and Export](#sessions-and-export)
  - [Important Notes](#important-notes)
- [Credits](#credits)
- [License](#license)
- [Reporting Bugs](#reporting-bugs)
- [Contribution](#contribution)

## Tutorials

<details><summary>Creating North Indian Chart (English)</summary>
<p align="center"><img src="https://github.com/IAmVigneswaran/Soothsayer-Citrana/blob/main/assets/images/demo-english-north-indian-chart.gif?raw=true" alt="Creating North Indian Chart in English"></p>
</details>

<details><summary>Creating South Indian Chart (Tamil)</summary>
<p align="center"><img src="https://github.com/IAmVigneswaran/Soothsayer-Citrana/blob/main/assets/images/demo-tamil-south-indian-chart.gif?raw=true" alt="Creating South Indian Chart in Tamil"></p>
</details>

<details><summary>Creating North Indian Chart (Hindi)</summary>
<p align="center"><img src="https://github.com/IAmVigneswaran/Soothsayer-Citrana/blob/main/assets/images/demo-hindi-north-indian-chart.gif?raw=true" alt="Creating North Indian Chart in Hindi"></p>
</details>

<details><summary>Editing Grahas (English)</summary>
<p align="center"><img src="https://github.com/IAmVigneswaran/Soothsayer-Citrana/blob/main/assets/images/demo-english-editing.gif?raw=true" alt="Editing Grahas in English"></p>
</details>

<details><summary>Editing Grahas (Tamil)</summary>
<p align="center"><img src="https://github.com/IAmVigneswaran/Soothsayer-Citrana/blob/main/assets/images/demo-tamil-editing.gif?raw=true" alt="Editing Grahas in Tamil"></p>
</details>

<details><summary>Using Arrow Tool & Pen Tool</summary>
<p align="center"><img src="https://github.com/IAmVigneswaran/Soothsayer-Citrana/blob/main/assets/images/demo-english-arrows.gif?raw=true" alt="Using Arrow Tool & Pen Tool"></p>
</details>

<details><summary>North Indian Chart Rotation & Toggle Transparency</summary>
<p align="center"><img src="https://github.com/IAmVigneswaran/Soothsayer-Citrana/blob/main/assets/images/demo-english-rotation-transparency.gif?raw=true" alt="North Indian chart rotation and transparency"></p>
</details>

<details><summary>Using Laser Pointer</summary>
<p align="center"><img src="https://github.com/IAmVigneswaran/Soothsayer-Citrana/blob/main/assets/images/demo-laser-pointer.gif?raw=true" alt="Using Laser Pointer"></p>
</details>

<details><summary>Using Citrana with tldraw for Loading Multiple Charts & Advance Annotation</summary>
<p align="center"><img src="https://github.com/IAmVigneswaran/Soothsayer-Citrana/blob/main/assets/images/demo-using-with-tldraw.gif?raw=true" alt="Using Citrana with tldraw"></p>
</details>

Note: Bhagavan Sri Ram's Janma Kundali (Vedic chart) is based on K.N. Rao's interpretation and insights.

## Screenshot

<p align="center"> <img src="https://github.com/IAmVigneswaran/Soothsayer-Citrana/blob/main/assets/images/citrana-browser-screenshot.png?raw=true"> </p>

## Quick Start

### Prerequisites
- Modern desktop web browser (Brave 1.80+, Chrome 138+, Firefox 128+, Safari 18+, Edge 138+)
- No setup required - runs entirely in the desktop web browser

### Browser and Device Compatibility

Citrana is designed for desktop browsers (Brave 1.80+, Chrome 138+, Firefox 128+, Safari 18+, Edge 138+). For optimal performance and full feature access, use a desktop environment. On mobile and touch devices, the **Canvas Items** panel (layers icon or **I**) is the primary way to run chart, Bhava, Graha, and Annotation actions. Note: Brave users must disable Brave Shields for full functionality.

Screen Size: If you have a small screen size or if this site appears too large, please utilise your browser's zoom control under the browser's View menu to adjust the browser viewpoint for optimal viewing.

## Usage Guide

Visit: [citrana.soothsayer.life](https://citrana.soothsayer.life)

Citrana is a **desktop-first** Janma Kundali (Vedic charts) workspace: create South Indian or North Indian layouts, place Grahas, add Annotations, and export or save your work — all in the browser, with no account required. For the best experience, use a current desktop browser (Brave 1.80+, Chrome 138+, Firefox 128+, Safari 18+, or Edge 138+). On mobile and touch devices, use **Canvas Items** (**I**) for chart, Bhava, Graha, and Annotation actions. Brave users should disable Brave Shields for full functionality. If the interface looks too large on a small display, adjust your browser zoom under the View menu.

### Creating Your First Chart

1. **Choose chart type** — right-click the canvas and select South Indian or North Indian layout
2. **Set Lagna** — South Indian: right-click a Bhava and choose **Set as Lagna**. North Indian: right-click a Bhava and choose **Set as First Bhava**, or right-click the chart and use **Set Lagna as …**
3. **Add Grahas** — drag from the Graha Library onto the Bhava under your pointer. Click a Bhava first to target that Bhava on the **next** drop only (then the pointer takes over again)
4. **Add Annotations** — use the toolbar to add arrows, lines, pen strokes, text, and headings
5. **Save your work** — **Save Session** for a `.citrana.json` file (edit the name in the Save As dialog), or the save icon for a PNG export (Save As dialog)

### Charts

Citrana supports **South Indian** (traditional 4×4 grid with an empty centre) and **North Indian** (diamond layout with dynamic Rashi numbering). Grahas reposition automatically when Lagna changes on North Indian charts.

- **South Indian:** right-click a Bhava and choose **Set as Lagna**. A diagonal line marks the Lagna Bhava
- **North Indian:** right-click a Bhava and choose **Set as First Bhava**, or right-click the chart and use **Set Lagna as …** to pick the Lagna Rashi

Only one chart per canvas. To start another chart, open a new browser tab or window.

### Options

Open **Options** from the gear icon in the toolbar (after Save).

- **Zoom Step** — **Fine (1%)** is the default; **Small (~10%)**, **Medium (~20%)**, and **Large (~25%)** are also available. Applies to zoom buttons, keyboard **+**/**−**, and the scroll wheel when zoom is unlocked
- **Hide North Indian Chart Indicators** — hides bhava numbers in the black corner boxes
- **Hide South Indian Chart Indicators** — hides the Lagna line, yellow bhava numbers, and black rashi numbers
- **Save Chart Only** — the Save button exports only the chart area (fitted, transparent, no watermark). Turning this off restores a white-background full-canvas export

Option preferences are saved in this browser, included in **Save Session**, and are not tracked by undo/redo.

### Graha Library

Drag Grahas from the floating library onto chart Bhavas. The same Graha can be placed more than once. Five pages cover traditional Grahas, Jaimini Karakas, Tamil, Hindi, and Upagrahas with outer Grahas. Switch pages with the dots at the bottom, keys **1**–**5**, or on mobile by swiping the **dots bar** (grey chevrons hint that you can swipe; the dots remain tappable). Swiping the Graha grid or header still drags Grahas or moves the library panel.

Under **Canvas Items**, in the **Canvas** section, you can show or hide the library (saved in this browser; separate from Presentation View) or **Reset Graha Library Position** to return the panel to its default place.

### Grahas on the Chart

- Click or tap a placed Graha to select it; a dashed **Selection Pill** appears behind the label
- Double-click a Graha, or right-click and choose **Edit Graha**, to change text, colour, or retrograde (retrograde Grahas are underlined)
- Add degrees in the editor using the format **Graha-Degree** (e.g. **Su-20**)
- Use **Custom** from the library for a user-defined label (up to 8 characters)
- Press the save button (✓) in the Graha editor before moving a Graha, or your edits may be lost
- Right-click and choose **Delete Graha**, or press **Delete** when a Graha is selected
- Right-click a Bhava and choose **Clear Bhava** to remove every Graha from that Bhava

### Annotations

Use the toolbar to add arrows, lines, pen strokes, text, and headings on the canvas. After you create an arrow, line, text box, or heading, the Select tool activates automatically; the Pen tool and Laser Pointer stay active for continuous use.

- **Select** — click or tap an Annotation to select it (Selection Pill). Drag to move pen strokes. Double-click text or headings to edit wording; use the Edit UI for colour, stroke, font size, bold, italic, alignment, and **Normal** or **Hand-written** style. Text and headings support multiple lines (**Shift+Enter** for a new line, **Enter** to finish)
- **Hand** — pan around the chart
- **Laser Pointer** (**K**) — temporary highlight that fades away; not saved, exported, or undoable

Under **Canvas Items**, the **Annotations** section lists every arrow, line, pen stroke, text, and heading. Text and Heading rows offer **Edit text** and **Style** separately.

### Canvas Items

Open **Canvas Items** from the layers icon in the zoom bar or press **I**. One panel lists chart actions, Bhavas, Grahas, Annotations, and canvas controls.

- **Section Anchors** — jump between sections; the title, description, and anchors stay fixed while the list scrolls
- **Canvas** — **Clear Selection**; **Context Menu** on/off (off by default on touch devices; green or red row tint); **Graha Library** on/off; **Reset Graha Library Position**
- **Chart** — create a chart, set Lagna, Presentation View, reset actions, and clear the canvas
- **Bhavas** — select a Bhava, set Lagna or First Bhava, or clear Grahas in that Bhava; South Indian rows show each cell's fixed Rashi name with its zodiac symbol
- **Grahas** — select, edit, or delete placed Grahas

Right-click and long-press menus work in Select and Hand when the Context Menu is enabled. They are suppressed while annotation tools are active so drawing is not interrupted.

### Presentation View

Hide the toolbar, zoom bar, Graha library, Help, and About for a clean on-screen chart. Turn it on from the chart context menu or under **Canvas Items** in the **Chart** section. Choose **Exit Presentation View** to restore the interface. To hide only the Graha Library, use the **Graha Library** toggle under **Canvas Items** in the **Canvas** section instead.

### Zoom and Pan

- Zoom is **locked by default**. Click the lock icon in the zoom bar to unlock, then use the zoom buttons, mouse wheel, or **+**/**−**
- **Reset Zoom** refits the chart (always available)
- Step size is set under **Options** (**Zoom Step**)
- On narrow screens, chevrons at the edges of the top toolbar and Edit UI scroll overflow controls; edge fades indicate more tools off-screen
- Press `?` or `/` in the app for the full keyboard shortcut list

### Undo and Redo

Use the toolbar buttons or **Ctrl+Z** / **Cmd+Z** (undo) and **Ctrl+Y** / **Cmd+Shift+Z** (redo) — up to 50 steps.

- **Tracked:** chart changes, Graha placement and edits, Lagna, reset actions, and Annotation edits
- **Not tracked:** zoom, pan, tool selection, laser pointer strokes, and Presentation View

### Sessions and Export

**Save Session** and **Open Session** in the toolbar work with `.citrana.json` files only. Plain `.json` or other extensions cannot be opened.

**Save Session** opens a Save As dialog where you can edit the file name (a timestamped default is offered; the `.citrana.json` extension is kept). A progress dialog then appears while the file is prepared.

**Open Session** opens a dialog first — click **Choose file**, then pick a session file from your device. A progress dialog appears while it loads. Opening a session replaces your current work; Citrana asks for confirmation if the canvas is not empty. If the file is invalid, an in-app notice explains the problem.

Take your work with you: build a chart on mobile, save the file, and store it in any cloud service you already use — iCloud Drive, Google Drive, Dropbox, and so on. When you **Open Session** on another device or browser, your chart, Grahas, Annotations, and Options are restored.

- **Included:** chart layout, Grahas, Annotations, and Options
- **Not included:** undo/redo history, active tool, laser pointer strokes, Presentation View, and zoom/pan

**Export PNG** — a Save As dialog lets you edit the file name before export (default `citrana-chart-….png`). A progress dialog then prepares the image. Use the transparency toggle before export for a white or transparent background. By default, export follows the current viewport; with **Save Chart Only** enabled in Options, Save exports only the chart area.

### Important Notes

Your chart lives in this browser tab while you work — nothing is sent to a server. Refreshing the page starts a fresh session. Use **Save Session** to keep a working copy, or **Export PNG** for a shareable image.

Exported images with transparency can be imported into other canvas applications such as tldraw for advanced annotation workflows.

## Credits

Created by [Vigneswaran Rajkumar](https://soothsayer.life)

## License

Licensed under the MIT license. See [LICENSE](https://github.com/IAmVigneswaran/Soothsayer-Citrana/blob/main/LICENSE) for details.

## Reporting Bugs

For bug reports and feature requests you can create a new [issue](https://github.com/IAmVigneswaran/Soothsayer-Citrana/issues) to discuss.

## Contribution

Community contributions are welcome and appreciated. Developers are encouraged to fork the repository and submit pull requests to enhance functionality or introduce thoughtful improvements. However, a key requirement is that nothing should break—all existing features and behaviours and logic must remain fully functional and unchanged. Please submit pull requests to the development branch rather than main, as the main branch is currently read-only. Once reviewed and approved, updates will be merged into the main branch.

Built with ❤️ for the Vedanga Jyotisha community.
