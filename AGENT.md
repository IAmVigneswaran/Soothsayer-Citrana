# Vedic Astrology Chart Builder

A modern, interactive web application for creating Vedic astrology charts, inspired by Excalidraw. Built with pure HTML5, CSS3, and JavaScript, this tool provides an intuitive interface for educators and students of Vedanga Jyotisha.

## Features

### Chart Types
- South Indian Chart: Traditional square grid layout with fixed Rashi positions
- North Indian Chart: Diamond-shaped layout with dynamic house positioning
- Lagna Setting: Right-click to set any house as Lagna (Ascendant)
- First House Selection: For North Indian charts, designate any house as the first house

### Planet Management
- 10 Major Grahas: Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Rahu, Ketu, and Maandi
- Drag & Drop: Intuitive planet placement from sidebar to chart houses
- Multiple Instances: Place the same planet multiple times
- Dynamic Sizing: Text automatically scales based on house occupancy
- Mobile Support: Touch-friendly interface for tablets and phones

### Drawing Tools
- Select Tool: Choose and modify existing elements
- Arrow Tool: Create directional indicators
- Line Tool: Draw straight lines and connections
- Pen Tool: Freehand drawing for annotations
- Text Tool: Add custom labels and descriptions
- Undo/Redo: Full action history with keyboard shortcuts

### Export & Sharing
- High-Resolution PNG: Professional quality exports (300 DPI)
- Auto-Save: Automatic chart data persistence
- Cross-Platform: Works on desktop, tablet, and mobile devices

### User Experience
- Dark/Light Theme: Automatic system preference detection with manual toggle
- Responsive Design: Optimized for all screen sizes
- Keyboard Shortcuts: Power user features for efficiency
- Context Menus: Right-click for quick actions
- Status Updates: Real-time feedback and notifications

## Quick Start

### Prerequisites
- Modern web browser (Chrome 80+, Firefox 75+, Safari 13+, Edge 80+)
- No server setup required - runs entirely in the browser

### Installation
1. Clone or download this repository
2. Open index.html in your web browser
3. Start creating Vedic charts!

### For GitHub Pages
Simply push the files to a GitHub repository and enable GitHub Pages. The application will work immediately without any build process.

### Quick Start
The application is ready to use immediately - no setup required!

## Usage Guide

### Creating Your First Chart

1. Choose Chart Type: Select between South Indian or North Indian layout
2. Set Lagna: Right-click any house and select "Set as Lagna (Ascendant)"
3. Add Planets: Drag planets from the sidebar to chart houses
4. Add Annotations: Use drawing tools to add notes and aspects
5. Export: Click "Export PNG" to save your chart

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+1 | Switch to South Indian Chart |
| Ctrl+2 | Switch to North Indian Chart |
| Ctrl+S | Save chart |
| Ctrl+E | Export as PNG |
| 1-5 | Switch drawing tools |
| Ctrl+Z | Undo |
| Ctrl+Y | Redo |
| Escape | Clear selection |

### Planet Abbreviations

| Planet | Abbreviation |
|--------|--------------|
| Sun | Su |
| Moon | Mo |
| Mercury | Me |
| Venus | Ve |
| Mars | Ma |
| Jupiter | Ju |
| Saturn | Sa |
| Rahu | Ra |
| Ketu | Ke |
| Maandi | Md |

## Technical Architecture

### Technology Stack
- Frontend: Pure HTML5, CSS3, JavaScript (ES6+)
- Graphics: HTML5 Canvas API with Fabric.js
- Styling: Tailwind CSS (CDN)
- Libraries: Fabric.js for canvas manipulation
- Storage: Browser localStorage for data persistence

### Project Structure
```
Soothsayer-Citrana/
├── index.html              # Main application file
├── assets/
│   ├── css/
│   │   └── styles.css      # Custom styles and theme support
│   ├── js/
│   │   ├── utils.js        # Utility functions and constants
│   │   ├── chart-templates.js  # Chart layout and rendering
│   │   ├── planet-system.js    # Planet management and drag-drop
│   │   ├── drawing-tools.js    # Drawing tools and annotations
│   │   └── app.js          # Main application logic
│   ├── images/             # Image assets
│   ├── favicon/            # Favicon files
│   └── svgs/               # SVG graphics
├── SPECIFICATION.md        # Detailed project specification
├── README.md              # Empty file
└── IMPLEMENTATION_SUMMARY.md # Implementation summary
```

### Key Components

#### ChartTemplates Class
- Handles South Indian and North Indian chart layouts
- Manages Lagna and house numbering
- Provides chart data persistence

#### PlanetSystem Class
- Manages planet library and drag-and-drop
- Handles planet placement and validation
- Provides touch support for mobile devices

#### DrawingTools Class
- Implements drawing tools (arrow, line, pen, text)
- Manages undo/redo functionality
- Handles canvas interactions

#### Utils Class
- Provides utility functions for common operations
- Manages theme switching and localStorage
- Handles export functionality

## Customization

### Adding New Planets
Edit the PLANETS constant in assets/js/utils.js:

```javascript
const PLANETS = {
    'Su': { name: 'Sun', color: '#FF6B35' },
    // Add your new planet here
    'New': { name: 'New Planet', color: '#FF0000' }
};
```

### Customizing Chart Styles
Modify the chart rendering methods in assets/js/chart-templates.js to change:
- House colors and borders
- Grid line styles
- Text formatting
- Layout dimensions

### Theme Customization
The application uses Tailwind CSS classes. Customize the theme by:
- Modifying assets/css/styles.css for custom component styles
- Updating color schemes in the JavaScript files
- Adding new theme variants

## Development

### Local Development
1. Clone the repository
2. Open index.html in a web browser
3. Use browser developer tools for debugging
4. No build process required

### Browser Compatibility
- Desktop: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- Mobile: iOS Safari 13+, Android Chrome 80+
- Features: Canvas API, localStorage, ES6 modules

### Performance Optimization
- Efficient canvas rendering with Fabric.js
- Debounced resize handlers
- Optimized planet placement algorithms
- Minimal DOM manipulation

## Contributing

### Development Guidelines
1. Follow the existing code structure and naming conventions
2. Add comprehensive comments for new features
3. Test on multiple browsers and devices
4. Update documentation for new features

### Feature Requests
- Check existing issues before creating new ones
- Provide detailed descriptions of requested features
- Include use cases and expected behavior

### Bug Reports
- Include browser and OS information
- Provide steps to reproduce the issue
- Include console errors if applicable

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Excalidraw: Inspiration for the user interface and interaction patterns
- Fabric.js: Canvas manipulation library
- Tailwind CSS: Utility-first CSS framework
- Vedanga Jyotisha Community: Domain expertise and feedback

## Support

For questions, issues, or feature requests:
- Create an issue on GitHub
- Check the help section in the application (click the help button)
- Review the detailed specification in SPECIFICATION.md

## Roadmap

### Phase 2 (Planned)
- Aspect line drawing
- Custom planet sets
- Multi-language support (Tamil, Hindi)
- Advanced export options

### Phase 3 (Future)
- Batch chart generation
- Cloud storage integration
- Collaborative editing
- API for external integrations

Built with love for the Vedanga Jyotisha community 