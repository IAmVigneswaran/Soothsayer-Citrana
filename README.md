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

- Dual Chart Types: South Indian (4x4 grid) and North Indian (diamond layout) with dynamic Bhava numbering
- Graha Library: 60 Grahas across 5 pages — traditional Grahas, Jaimini Karakas, Grahas in Tamil, Grahas in Hindi, and Upagrahas with outer Grahas
- Drag & Drop Grahas: Drop onto the Bhava under your pointer; click a Bhava first to target that Bhava on the **next** drop only (then the pointer takes over again)
- Undo and Redo: Up to 50 steps for chart, Graha, and drawing changes via toolbar buttons or **Ctrl+Z** / **Ctrl+Y** (zoom and pan are not tracked)
- Comprehensive Drawing Tools: Select, arrow, line, pen, text, and heading tools
- Professional Export: High-resolution PNG exports with optional transparency
- Zoom Lock: Zoom is locked by default to prevent accidental scroll-wheel zoom; unlock from the zoom bar when you need to zoom in or out
- Chart Display Options: Hide North or South chart indicators, or enable **Save Chart Only** (transparent chart-area export with no watermark), from the toolbar **Options** modal; preferences persist in this browser
- Context Menus: Right-click and long-press for chart, Bhava, and Graha actions (**Set as Lagna**, **Clear Bhava**, **Edit Graha**, **Delete Graha**, and more)
- Keyboard Shortcuts: Tools, undo/redo, zoom (when unlocked), **Delete** (selected Graha first, then selected drawing with Select tool), and help — press `?` or `/` in the app for the full list
- Multi-language Support: Grahas available in English, Tamil, and Hindi
- Privacy focused: Chart data is not uploaded to our servers; your work stays in this browser session

## Table of Contents

- [Tutorials](#tutorials)
- [Screenshot](#screenshot)
- [Quick Start](#quick-start)
  - [Prerequisites](#prerequisites)
  - [Browser and Device Compatibility](#browser-and-device-compatibility)
- [Usage Guide](#usage-guide)
  - [Creating Your First Chart](#creating-your-first-chart)
  - [Chart Types](#chart-types)
  - [Working with Grahas](#working-with-grahas)
  - [Drawing and Navigation](#drawing-and-navigation)
  - [Export and Limitations](#export-and-limitations)
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

<details><summary>Creating Arrows</summary>
<p align="center"><img src="https://github.com/IAmVigneswaran/Soothsayer-Citrana/blob/main/assets/images/demo-english-arrows.gif?raw=true" alt="Creating arrows"></p>
</details>

<details><summary>North Indian Chart Rotation & Toggle Transparency</summary>
<p align="center"><img src="https://github.com/IAmVigneswaran/Soothsayer-Citrana/blob/main/assets/images/demo-english-rotation-transparency.gif?raw=true" alt="North Indian chart rotation and transparency"></p>
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

Citrana is designed exclusively for desktop browsers (Brave 1.80+, Chrome 138+, Firefox 128+, Safari 18+, Edge 138+) and is not supported on mobile or touch devices. For optimal performance and full feature access, use a desktop environment. Note: Brave users must disable Brave Shields for full functionality.

Screen Size: If you have a small screen size or if this site appears too large, please utilise your browser's zoom control under the browser's View menu to adjust the browser viewpoint for optimal viewing.

## Usage Guide

Visit: [citrana.soothsayer.life](https://citrana.soothsayer.life)

### Creating Your First Chart

1. **Choose Chart Type**: Right-click the canvas and select South Indian or North Indian layout
2. **Set Lagna**: South Indian — right-click a Bhava and select **Set as Lagna**. North Indian — right-click a Bhava and select **Set as First Bhava**, or right-click the chart and choose **Set Lagna as…** to pick a Rashi
3. **Add Grahas**: Drag Grahas from the Graha Library onto the Bhava under your pointer. Click a Bhava first if you want the **next** drop to go to that Bhava specifically (subsequent drops follow the pointer again)
4. **Add Annotations**: Use drawing tools to add notes and aspects
5. **Export**: Click the save button to export your chart as a PNG

### Chart Types

South Indian Chart: Traditional 4x4 grid layout with centre empty. Right-click any Bhava and select **Set as Lagna**. A diagonal line indicator will appear at the top-left corner of the Lagna Bhava.

North Indian Chart: Diamond layout with dynamic Rashi numbering. Right-click a Bhava and select **Set as First Bhava** to set the Rashi in that cell as Lagna, or right-click the chart and choose **Set Lagna as…** to pick a Rashi. Grahas reposition automatically when Lagna changes.

Chart Display Options: Click the gear icon in the toolbar (after Save) to open **Options**. Toggle **Hide North Indian Chart Indicators** to hide bhava numbers (black corner boxes). Toggle **Hide South Indian Chart Indicators** to hide the lagna diagonal line, yellow bhava numbers, and black rashi numbers. Toggle **Save Chart Only** to export only the chart area when you click Save — Citrana fits the chart and ignores your current zoom and pan. Grahas and annotations on the chart are included; anything outside the chart boundary is left out of the image. The export uses a transparent background and omits the watermark (Toggle Transparency is turned on automatically). Preferences are saved in this browser; they are not included in undo/redo.

### Working with Grahas

Adding Grahas: Drag Grahas from the Graha Library (top-left) to chart Bhavas. You can place the same Graha multiple times. Double-click any Graha, or right-click and choose **Edit Graha**, to open a floating editing panel where you can modify text and set it as retrograde (the Graha text will be underlined). Right-click a Graha and choose **Delete Graha** to remove it, or press **Delete** when a Graha is selected.

Clear Bhava: Right-click a Bhava and choose **Clear Bhava** to remove every Graha from that Bhava.

Custom Graha: There is also a "Custom" Graha available in the library. Drag and drop it into any Bhava, then double-click to edit the name. There is a maximum character limit of 8 characters for all Graha names.

### Drawing and Navigation

Drawing Tools: Use the toolbar to add arrows, lines, pen strokes, text, and headings. After you create an arrow, line, text box, or heading, the Select tool activates automatically so you can adjust it; the Pen tool stays active for continuous drawing. Double-click text and heading elements to edit them. Use the Hand tool to pan around the chart.

Undo and Redo: Use the undo/redo buttons in the toolbar or **Ctrl+Z** / **Ctrl+Y** to step backward and forward through chart, Graha, and drawing changes (up to 50 steps). Zoom, pan, and tool selection are not tracked.

Navigation: Zoom is locked by default. Use the zoom bar to zoom in or out, or click the lock icon to unlock zoom and use the mouse wheel or `+` / `-` keys. Reset zoom refits the chart. The Hand tool allows you to pan around the canvas for detailed work. Press `?` or `/` in the app for the full keyboard shortcut list.

### Export and Limitations

Export Options: Click the save button to export your chart as a PNG file with timestamp. Use the transparency toggle button (before save) to choose between solid white background or transparent background for your exported image. With **Save Chart Only** enabled in **Options**, Save exports only the chart area (transparent, no watermark) instead of the full canvas.

Export Viewpoint: By default, exported images follow the browser's current viewpoint — window size and zoom/pan affect the output. With **Save Chart Only** enabled, Save fits the chart and ignores your current zoom and pan; only the chart area is exported, and anything outside the chart boundary is left out of the image.

Single Chart Limitation: Citrana does not and will not support multiple charts in a single canvas. To create another chart, open a new browser window or tab. This ensures optimal performance and prevents conflicts between different chart configurations. Additionally, images can be saved with transparency enabled (Toggle Transparency Button) and imported into other canvas applications such as tldraw for advanced annotation and note-taking workflows.

### Important Notes

Session management: Your chart lives in this browser tab while you work (nothing is sent to a server). Refreshing the page always starts a fresh session — chart, Grahas, and drawings are not restored. Export a PNG to keep a copy.

## Credits

Created by [Vigneswaran Rajkumar](https://soothsayer.life)

## License

Licensed under the MIT license. See [LICENSE](https://github.com/IAmVigneswaran/Soothsayer-Citrana/blob/main/LICENSE) for details.

## Reporting Bugs

For bug reports and feature requests you can create a new [issue](https://github.com/IAmVigneswaran/Soothsayer-Citrana/issues) to discuss.

## Contribution

Community contributions are welcome and appreciated. Developers are encouraged to fork the repository and submit pull requests to enhance functionality or introduce thoughtful improvements. However, a key requirement is that nothing should break—all existing features and behaviours and logic must remain fully functional and unchanged. Please submit pull requests to the development branch rather than main, as the main branch is currently read-only. Once reviewed and approved, updates will be merged into the main branch.

Built with ❤️ for the Vedanga Jyotisha community.
