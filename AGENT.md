# Citrana - Vedic Astrology Chart Builder

A modern, interactive web application for creating Vedic astrology charts with drag-and-drop planet placement and comprehensive drawing tools. Built with pure HTML5, CSS3, and JavaScript using Konva.js for canvas manipulation, this tool provides an intuitive interface for educators and students of Vedanga Jyotisha.

## Project Overview

Citrana is a browser-based application that allows users to create both South Indian and North Indian astrological charts. The application features a floating planet library, comprehensive drawing tools, context menus, and export capabilities. It runs entirely in the browser with no build process required, making it immediately deployable on GitHub Pages or any web server.

## Technology Stack

- Frontend: Pure HTML5, CSS3, JavaScript (ES6+)
- Graphics: HTML5 Canvas API with Konva.js
- Styling: Tailwind CSS (CDN) with custom CSS
- Icons: Lucide Icons
- Storage: Browser localStorage for data persistence
- Analytics: Google Analytics and Google Tag Manager
- No build process required - runs entirely in browser

## Complete Project Structure

```
Soothsayer-Citrana/
├── index.html                    # Main application entry point
├── assets/
│   ├── css/
│   │   └── styles.css            # Complete styling system (1517 lines)
│   ├── js/
│   │   ├── app.js                # Main application coordinator (1145 lines)
│   │   ├── chart-coordinator.js  # Chart type management (261 lines)
│   │   ├── chart-templates-south.js  # South Indian chart logic (961 lines)
│   │   ├── chart-templates-north.js  # North Indian chart logic (921 lines)
│   │   ├── planet-system.js      # Planet library and drag-drop (456 lines)
│   │   ├── drawing-tools.js      # Drawing tools implementation (1567 lines)
│   │   ├── context-menu.js       # Context menu system (456 lines)
│   │   ├── edit-ui.js            # Edit interface controls (786 lines)
│   │   └── utils.js              # Utility functions (340 lines)
│   ├── images/
│   │   └── soothsayer_social-preview.jpg  # Social media preview image
│   ├── svgs/
│   │   ├── north-indian.svg      # North Indian chart template
│   │   └── south-indian.svg      # South Indian chart template
│   └── favicon/                  # Complete favicon set (32 files)
│       ├── favicon.ico           # Main favicon
│       ├── manifest.json         # PWA manifest
│       ├── browserconfig.xml     # IE browser config
│       ├── apple-icon-*.png      # Apple touch icons (12 files)
│       ├── android-icon-*.png    # Android icons (6 files)
│       ├── favicon-*.png         # Standard favicons (6 files)
│       └── ms-icon-*.png         # Microsoft icons (4 files)
├── .github/
│   └── workflows/                # GitHub Actions (if configured)
├── AGENT.md                      # This comprehensive documentation
├── .cursorrules                  # Cursor IDE configuration
├── CHANGELOG.md                  # Version history and changes
├── README.md                     # Project readme
├── LICENSE                       # MIT License
├── SECURITY.md                   # Security policy
└── .gitignore                    # Git ignore rules
```

## Core Components Architecture

### Main Application (app.js - 1145 lines)
The central coordinator that manages all application components and lifecycle.

**Key Responsibilities:**
- Initializes Konva.js stage and layer
- Coordinates all component interactions
- Manages tool selection and drawing state
- Handles keyboard shortcuts and event listeners
- Manages undo/redo functionality
- Handles chart export and auto-save
- Provides mobile touch support and Safari compatibility
- Manages zoom controls and canvas transformations

**Key Methods:**
- `init()`: Application initialization
- `setupCanvas()`: Konva.js stage setup
- `setupComponents()`: Component initialization
- `setupEventListeners()`: Event binding
- `setupKeyboardShortcuts()`: Keyboard navigation
- `exportChart()`: High-resolution PNG export
- `autoSave()`: Automatic data persistence
- `handleMouseDown/Move/Up()`: Mouse interaction handling
- `handleTouchStart/Move/End()`: Touch interaction handling

### Chart Coordinator (chart-coordinator.js - 261 lines)
Manages the relationship between South Indian and North Indian chart templates.

**Key Responsibilities:**
- Routes operations to appropriate chart template
- Manages chart type switching
- Provides unified interface for chart operations
- Handles chart data persistence and loading
- Manages zoom operations across chart types

**Key Methods:**
- `createSouthIndianChart()`: Initialize South Indian layout
- `createNorthIndianChart()`: Initialize North Indian layout
- `setLagnaHouse()`: Set ascendant house
- `setFirstHouse()`: Set first house for North Indian charts
- `getChartData()`: Serialize chart data
- `loadChartData()`: Restore chart from data

### South Indian Chart Template (chart-templates-south.js - 961 lines)
Handles the traditional South Indian chart layout with 4x4 grid structure.

**Key Responsibilities:**
- Creates 4x4 grid layout with center empty space
- Manages house numbering and Lagna indicators
- Handles planet placement and text scaling
- Provides house highlighting and selection
- Manages Rashi and Bhava number boxes
- Implements context menu functionality for houses

**Key Features:**
- Traditional square grid layout
- Center empty space for annotations
- Lagna indicator with diagonal line
- Dynamic planet text sizing
- House renumbering based on Lagna position
- Touch and mouse interaction support

**Key Methods:**
- `createSouthIndianChart()`: Build chart layout
- `createHouse()`: Create individual house elements
- `addPlanetToHouse()`: Place planets in houses
- `setLagnaHouse()`: Set ascendant with visual indicator
- `renumberHouses()`: Update house numbering
- `highlightHouse()`: Visual house selection

### North Indian Chart Template (chart-templates-north.js - 921 lines)
Handles the diamond-shaped North Indian chart layout with polygon-based houses.

**Key Responsibilities:**
- Creates diamond-shaped polygon layout
- Manages complex house positioning
- Handles tiny Rashi number boxes
- Provides advanced Rashi numbering logic
- Manages planet placement in polygon houses
- Implements dynamic house renumbering

**Key Features:**
- Diamond-shaped polygon layout
- Precise house positioning using SVG coordinates
- Tiny Rashi number boxes with exact positioning
- Advanced Rashi numbering system
- Dynamic house renumbering
- Polygon-based hit detection

**Key Methods:**
- `createNorthIndianChart()`: Build diamond layout
- `addPlanetToHouse()`: Place planets in polygon houses
- `setLagnaHouse()`: Set ascendant house
- `renumberHouses()`: Update house numbering
- `isPointInPolygon()`: Hit detection for polygon houses
- `getRashiNumberForHouse()`: Rashi calculation

### Planet System (planet-system.js - 715 lines)
Manages the floating planet library and drag-and-drop functionality with paging system.

**Key Responsibilities:**
- Creates and manages floating planet library UI with paging
- Implements drag-and-drop for planet placement
- Handles touch and mouse interactions
- Manages planet data and visual representations
- Provides drop zone detection and validation
- Implements mobile-friendly drag preview
- Manages paging navigation for desktop and mobile

**Key Features:**
- Floating, draggable planet library with paging
- 24 planets across two pages (12 per page)
- Desktop navigation with clickable page dots
- Mobile swipe navigation (left/right)
- Drag preview with visual feedback
- Touch and mouse support
- Drop zone validation
- Mobile-optimized interactions

**Planet Library - Page 1 (Traditional Grahas):**
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

**Planet Library - Page 2 (Additional Grahas):**
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
- IL: Indu Lagna
- SL: Sree Lagna

**Key Methods:**
- `init()`: Initialize planet library
- `createPlanetLibrary()`: Build UI elements with paging
- `createPageDots()`: Create desktop navigation dots
- `setupSwipeEvents()`: Configure mobile swipe navigation
- `goToPage()`: Navigate between pages
- `setupDragAndDrop()`: Configure drag functionality
- `handleDragStart/Move/End()`: Drag interaction handling
- `handleTouchStart/Move/End()`: Touch interaction handling
- `findHouseAtPosition()`: Drop zone detection
- `getPlanetInfo()`: Retrieve planet data from paged structure

### Drawing Tools (drawing-tools.js - 1567 lines)
Comprehensive drawing system with multiple tools and editing capabilities.

**Key Responsibilities:**
- Implements all drawing tools (select, arrow, line, pen, text, heading)
- Manages undo/redo functionality
- Handles shape selection and editing
- Provides precise positioning and hit detection
- Manages Edit UI integration
- Implements planet text editing

**Available Tools:**
- Select Tool: Choose and modify existing elements
- Arrow Tool: Create directional indicators with arrowheads
- Line Tool: Draw straight lines and connections
- Pen Tool: Freehand drawing for annotations
- Text Tool: Add editable text boxes
- Heading Tool: Create chart headings and titles

**Key Features:**
- Pixel-perfect positioning
- Touch and mouse support
- Shape selection and editing
- Color and stroke customization
- Text editing with font controls
- Planet text editing with retrograde support
- Undo/redo with 50-step history

**Key Methods:**
- `startDrawing()`: Begin drawing operation
- `draw()`: Continue drawing
- `stopDrawing()`: Complete drawing
- `makeShapeSelectable()`: Enable shape interaction
- `undo()/redo()`: History management
- `showEditUIForShape()`: Edit interface integration
- `makePlanetTextEditable()`: Planet text editing

### Context Menu (context-menu.js - 456 lines)
Provides right-click and long-press context menus for chart interaction.

**Key Responsibilities:**
- Creates context-sensitive menus
- Handles right-click and long-press interactions
- Provides chart creation and management options
- Manages house and planet-specific actions
- Implements mobile-friendly touch interactions

**Menu Types:**
- Chart Creation Menu: Create new charts
- House Menu: House-specific actions (set Lagna, clear house)
- Planet Menu: Planet-specific actions (edit, delete, retrograde)
- Existing Chart Menu: Chart management options

**Key Features:**
- Desktop right-click support
- Mobile long-press support
- Context-sensitive menu items
- Submenu support
- Touch-optimized interactions

**Key Methods:**
- `init()`: Initialize context menu system
- `showChartMenu()`: Display main chart menu
- `showHouseMenu()`: Display house-specific menu
- `showPlanetMenu()`: Display planet-specific menu
- `handleAction()`: Process menu selections

### Edit UI (edit-ui.js - 786 lines)
Provides context-sensitive editing controls for drawing elements.

**Key Responsibilities:**
- Creates floating edit interface
- Provides tool-specific controls
- Manages shape property editing
- Handles color and stroke customization
- Implements text editing controls
- Provides mobile-optimized interface

**Edit Controls:**
- Stroke width and color controls
- Font size, weight, and style controls
- Text color customization
- Delete functionality
- Mobile touch support

**Key Features:**
- Floating, draggable interface
- Tool-specific controls
- Real-time property updates
- Mobile-optimized design
- Touch-friendly controls

**Key Methods:**
- `show()`: Display edit interface
- `hide()`: Hide edit interface
- `createToolControls()`: Build tool-specific controls
- `updateStrokeWidth()`: Modify stroke properties
- `updateFontSize()`: Modify text properties
- `positionEditUI()`: Position interface

### Utils (utils.js - 340 lines)
Provides utility functions for common operations across the application.

**Key Responsibilities:**
- Provides debouncing and throttling functions
- Manages status updates and notifications
- Handles localStorage operations
- Provides export functionality
- Implements coordinate calculations
- Manages file operations

**Key Functions:**
- `debounce()`: Performance optimization
- `showNotification()`: User feedback
- `saveChartData()`: Data persistence
- `exportCanvasAsPNG()`: Chart export
- `distance()`: Coordinate calculations
- `generateId()`: Unique ID generation
- `isMobile()`: Device detection

## Core Features

### Chart Types
- **South Indian Chart**: Traditional 4x4 square grid layout with center empty space
- **North Indian Chart**: Diamond-shaped polygon layout with dynamic positioning
- **Lagna Setting**: Right-click context menu to set any house as Lagna (Ascendant)
- **First House Selection**: For North Indian charts, designate any house as first house
- **Dynamic House Numbering**: Automatic renumbering based on Lagna position

### Planet Management
- **24 Major Grahas**: 12 traditional Grahas on Page 1 and 12 additional Grahas on Page 2
- **Paging System**: Two-page navigation with desktop dots and mobile swipe
- **Text-based Display**: Uses abbreviations instead of symbols for better compatibility
- **Drag & Drop**: Intuitive planet placement from floating library to chart houses
- **Multiple Instances**: Same planet can be placed multiple times
- **Dynamic Text Sizing**: Planet text scales based on house occupancy
- **Touch Support**: Mobile-friendly touch interactions with visual feedback

### Drawing Tools
- **Select Tool**: Choose and modify existing elements with Edit UI
- **Arrow Tool**: Create directional indicators with customizable arrowheads
- **Line Tool**: Draw straight lines and connections
- **Pen Tool**: Freehand drawing for annotations
- **Text Tool**: Add editable text boxes anywhere on canvas
- **Heading Tool**: Create chart headings and titles
- **Undo/Redo**: Full action history with keyboard shortcuts (Ctrl+Z, Ctrl+Y)

### User Experience
- **Dark/Light Theme**: Automatic system preference detection with manual toggle
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Keyboard Shortcuts**: Power user features for efficiency
- **Context Menus**: Right-click and long-press for quick actions
- **Status Updates**: Real-time feedback and notifications
- **Auto-Save**: Automatic chart data persistence every 30 seconds

### Export & Sharing
- **High-Resolution PNG**: Professional quality exports (300 DPI)
- **Auto-Save**: Chart data saved to localStorage
- **Cross-Platform**: Works on all modern browsers
- **GitHub Pages Compatible**: No build process required

## Browser Compatibility

- **Desktop**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Mobile**: iOS Safari 13+, Android Chrome 80+
- **Features**: Canvas API, localStorage, ES6 modules, Touch Events

**Mobile Browser Limitations:**
- Limited support for older mobile browsers
- Some advanced features may not work on older iOS Safari versions
- Touch interactions optimized for modern mobile browsers
- Performance may vary on low-end mobile devices

## Performance Optimization

- **Efficient Canvas Rendering**: Konva.js optimization
- **Debounced Resize Handlers**: 250ms debouncing
- **Optimized Planet Placement**: Efficient algorithms
- **Minimal DOM Manipulation**: Canvas-based rendering
- **Smart Auto-Save**: 30-second intervals
- **Touch Event Optimization**: Mobile performance

## Development Guidelines

### Code Style
- Use ES6+ JavaScript features
- Follow existing naming conventions
- Add comprehensive comments for new features
- Maintain modular architecture
- Use Tailwind CSS classes for styling

### File Organization
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
- Check performance on mobile devices

## Customization Guidelines

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

        // Planet data - Page 2 (Additional Grahas)
        this.planetsPage2 = {
            'AK': {
                name: 'AK',
                fullName: 'Atmakaraka',
                color: '#000000'
            },
            'AmK': {
                name: 'AmK',
                fullName: 'Amatyakaraka',
                color: '#000000'
            },
            'BK': {
                name: 'BK',
                fullName: 'Bhratrikaraka',
                color: '#000000'
            },
            'MK': {
                name: 'MK',
                fullName: 'Matrikaraka',
                color: '#000000'
            },
            'PK': {
                name: 'PK',
                fullName: 'Pitrikaraka',
                color: '#000000'
            },
            'GK': {
                name: 'GK',
                fullName: 'Gnatikaraka',
                color: '#000000'
            },
            'DK': {
                name: 'DK',
                fullName: 'Dara Karaka',
                color: '#000000'
            },
            'AL': {
                name: 'AL',
                fullName: 'Arudha Lagna',
                color: '#000000'
            },
            'UL': {
                name: 'UL',
                fullName: 'Upapada Lagna',
                color: '#000000'
            },
            'KL': {
                name: 'KL',
                fullName: 'Karakamsa Lagna',
                color: '#000000'
            },
            'IL': {
                name: 'IL',
                fullName: 'Indu Lagna',
                color: '#000000'
            },
            'SL': {
                name: 'SL',
                fullName: 'Sree Lagna',
                color: '#000000'
            }
        };
        
        // Paging state
        this.currentPage = 1;
        this.totalPages = 2;
        this.draggedPlanet = null;
        this.dropZones = [];
    }
```

### Modifying Chart Styles
- House colors and borders in chart template files
- Grid line styles and text formatting
- Layout dimensions and spacing
- Theme colors and visual elements

### Theme Customization
- Modify assets/css/styles.css for custom component styles
- Update color schemes in JavaScript files
- Add new theme variants
- Customize responsive breakpoints

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
- All data stored locally in browser localStorage
- No external API calls or data collection
- Privacy-first approach with no tracking
- Auto-save every 30 seconds

## Future Enhancements

### Planned Ideas
- Custom planet sets and configurations
- Multi-language support (Tamil, Hindi)

## Support and Documentation

- **AGENT.md**: This comprehensive project documentation
- **README.md**: Project overview and quick start

## Development Commands

- Open index.html in browser to run application
- No build commands required
- Use browser developer tools for debugging
- All changes are immediately visible on refresh

Built with love for the Vedanga Jyotisha community. 