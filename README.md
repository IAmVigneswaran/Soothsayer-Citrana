<p align="center">
  <h1 align="center">Citrana</h1>
</p>


Citrana is a whiteboard web application that allows students, gurus, and Vedanga Jyotisha practitioners and researchers to create Janma Kundali (Vedic charts) for study and reference. Built with pure HTML5, CSS3, and JavaScript, this modern, interactive tool provides an intuitive interface for creating both South Indian and North Indian astrological charts with drag-and-drop planet placement and comprehensive drawing tools.

Perfect for educational purposes, research documentation, and professional chart analysis, Citrana offers a seamless experience for anyone studying or practising Vedanga Jyotisha (Vedic astrology). Whether you're a student learning the fundamentals, a guru teaching traditional methods, or a researcher documenting complex planetary configurations to decode Karma, Citrana provides the tools you need to create accurate, professional-quality astrological charts for online classes, presentations, and personal reference.

This codebase is developed using AI agents.

## Definition of Citrana

### Sanskrit (संस्कृतम्)
**Citraṇā** (चित्रणा): The act of painting, drawing, illustration, or portrayal. Derived from the Sanskrit root *citrayati* with the suffix *-anā*.

### Tamil (தமிழ்)
**சித்திரம்** (Cittiram): Artistic representation, drawing, illustration, or systematic arrangement.

### Hindi (हिंदी)
**Citraṇa** (चित्रण): Portrayal, delineation, painting, illustration, or drawing.

## Core Features

- Dual Chart Types: South Indian (4x4 grid) and North Indian (diamond layout) with dynamic house numbering
- Drag & Drop Planets: Navagrahas with intuitive placement and multiple instances support
- Comprehensive Drawing Tools: Select, arrow, line, pen, text, and heading tools with undo/redo
- Professional Export: High-resolution PNG exports (300 DPI) with auto-save functionality
- Context Menus: Right-click and long-press support for quick chart management
- Keyboard Shortcuts: Power user features for efficient workflow

## Table of Contents

- [Quick Start](#quick-start)
- [Usage Guide](#usage-guide)
  - [Creating Your First Chart](#creating-your-first-chart)
  - [Browser Compatibility](#browser-compatibility)
  - [Chart Types](#chart-types)
  - [Working with Planets](#working-with-planets)
  - [Drawing and Navigation](#drawing-and-navigation)
  - [Export and Limitations](#export-and-limitations)
  - [Important Notes](#important-notes)
- [Browser Compatibility](#browser-compatibility)
- [Credits](#credits)
- [License](#license)
- [Reporting Bugs](#reporting-bugs)
- [Contribution](#contribution)

## Quick Start

### Prerequisites
- Modern web browser (Chrome 80+, Firefox 75+, Safari 13+, Edge 80+)
- No server setup required - runs entirely in the browser

## Usage Guide

### Creating Your First Chart

1. **Choose Chart Type**: Select between South Indian or North Indian layout
2. **Set Lagna**: Right-click any house and select "Set as Lagna (Ascendant)"
3. **Add Planets**: Drag planets from the sidebar to chart houses
4. **Add Annotations**: Use drawing tools to add notes and aspects
5. **Export**: Click "Export PNG" to save your chart

### Browser Compatibility

Citrana is best used in desktop browsers (Chrome, Firefox, Safari, Edge) for optimal performance and full feature access.

Mobile Browser Support: There is extremely limited support for mobile browsers. Low to zero/minimal support is provided for mobile browsers due to their constraints and limitations. For the best experience, please use Citrana on desktop browsers.

Mobile Drawing Tools: The drawing tools are not currently available on mobile devices. Users can utilise iOS or Android's built-in annotation tools for additional markups on exported images.

### Chart Types

South Indian Chart: Traditional 4x4 grid layout with centre empty. Right-click any house to set it as Lagna (Ascendant). A diagonal line indicator will appear at the top-left corner of the Lagna house.

North Indian Chart: Diamond layout with dynamic positioning. Right-click any house to set it as Lagna. All Grahas (planets) placed in the Bhavas will automatically rotate and renumbered based on the new Lagna position.

### Working with Planets

Adding Planets: Drag Grahas from the Graha Library (top-left) to chart houses. You can place the same Graha multiple times. Double-click any Graha to open a floating editing panel where you can modify text and set it as retrograde (a small "r" subscript will appear).

Custom Graha: There is also a "Custom" Graha available in the library. Drag and drop it into any house, then double-click to edit the name. There is a maximum character limit of 6 characters for all Graha names.

### Drawing and Navigation

Drawing Tools: Use the toolbar to add arrows, lines, text, and heading. Double-click text elements to edit them. Use the Hand tool to pan around the chart.

Navigation: Use zoom controls or mouse wheel to zoom in/out. The Hand tool allows you to pan around the chart for detailed work.

### Export and Limitations

Export Options: Click the save button to export your chart as a PNG file with timestamp. Use the transparency toggle button (before save) to choose between solid white background or transparent background for your exported image.

Export Viewpoint: Exported images will always follow and inherit the browser's current viewpoint. If you resize the browser window, the exported image will reflect the visible area accordingly. Adjust your browser window size and zoom level before exporting to achieve the desired output.

Single Chart Limitation: Citrana does not and will not support multiple charts in a single canvas. To create another chart, open a new browser window or tab. This ensures optimal performance and prevents conflicts between different chart configurations.

### Important Notes

Session Management: All sessions are ephemeral. The moment the browser refreshes, all data and progress will be reset and cleared. Citrana is privacy-focused and nothing is stored on the server.

Undo/Redo: Use Ctrl+Z and Ctrl+Y to undo and redo your actions. All changes are automatically saved to your browser's local storage.

## Browser Compatibility

- **Desktop**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+

> [!IMPORTANT]
> **Mobile Browser Limitations:**
> - Limited support for mobile browsers
> - Some advanced features may not work on mobile browsers
> - Performance may vary on low-end mobile devices

## Credits

Created by [Vigneswaran Rajkumar](https://soothsayer.life)

## License

Licensed under the MIT license. See [LICENSE](https://github.com/IAmVigneswaran/Soothsayer-Citrana/blob/main/LICENSE) for details.

## Reporting Bugs

For bug reports, feature requests and suggestions you can create a new [issue](https://github.com/IAmVigneswaran/Soothsayer-Citrana/issues) to discuss.

## Contribution

Community contributions are welcome and appreciated. Developers are encouraged to fork the repository and submit pull requests to enhance functionality or introduce thoughtful improvements. However, a key requirement is that nothing should break—all existing features and behaviours and logic must remain fully functional and unchanged. Once reviewed and approved, updates will be merged into the main branch.

Built with ❤️ for the Vedanga Jyotisha community.