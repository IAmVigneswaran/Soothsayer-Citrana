# Citrana - Project Specification

## Project Overview

**Project Name:** Citrana  
**Type:** Interactive Web Application  
**Domain:** Educational Tool for Vedanga Jyotisha (Vedic Astrology)

## Problem Statement

Traditional Vedanga Jyotisha (Vedic Astrology) education relies on manual chart creation, which presents several challenges:

- **Time-consuming process**: Teachers and students must manually draw astrological charts for each lesson or practice session
- **Repetitive work**: Charts need to be redrawn frequently, leading to inefficiency
- **Error-prone**: Manual placement of Grahas (planets) in Bhavas (houses) can lead to mistakes
- **Limited reusability**: Once drawn on paper, charts cannot be easily modified or shared
- **Accessibility issues**: Physical charts are difficult to share in digital learning environments

## Solution Overview

Create a modern, web-based whiteboard application specifically designed for Vedanga Jyotisha education, heavily inspired by [Excalidraw](https://github.com/excalidraw/excalidraw). The application will provide:

- Pre-built chart templates for both major chart styles
- Intuitive drag-and-drop interface for placing planets
- Dynamic chart manipulation capabilities
- Professional export functionality
- Cross-platform compatibility

## Core Features

### 1. Chart Template System

#### South Indian Chart
- **Structure**: Fixed Rashi (Sign) positions
- **Layout**: Traditional square grid format with 12 houses
- **Behaviour**: Static house positions, planets move between houses
- **Special Feature**: Right-click menu option to set any sign/house as "Lagna (Ascendant)"
  - Selected Lagna house gets special colour highlighting
  - Tiny house numbers displayed in corner of each house
  - Setting new Lagna automatically renumbers all houses from the Lagna position
- **Lagna Indicator:** When a Bhava is set as Lagna, a single diagonal line appears at the top-left corner of that Bhava. The line matches the grid color and its ends touch the top and left sides of the house rectangle. The indicator updates dynamically as Lagna changes.

#### North Indian Chart (Diamond Chart)
- **Structure**: Fixed Bhava (House) positions in diamond formation
- **Layout**: Diamond-shaped arrangement with 12 triangular sections
- **Special Features**: 
  - **Dynamic first house selection**: Right-click menu option to designate any house as the first house, automatically updating the entire chart layout
  - **Lagna (Ascendant) setting**: Right-click menu option to set what Lagna (Ascendant) the First House represents
    - First house gets special colour highlighting
    - Tiny sign numbers displayed in corner of each house
    - Changing the Lagna automatically updates the sign numbering throughout all houses

### 2. Planet Management System

#### Planet Library
The application includes a dedicated panel with all major Grahas:

| Planet Name | Abbreviation |
|-------------|--------------|
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

#### Drag and Drop Functionality
- **Source**: Planet library panel with visual planet representations
- **Target**: Any Bhava (house) in the selected chart
- **Multiple instances**: Users can place the same planet multiple times
- **Dynamic sizing**: Text automatically scales based on the number of planets in each house
- **Inter-house movement**: Planets can be moved between houses after initial placement

### 3. Drawing Tools

#### Basic Tools
- **Arrow tool**: For creating directional indicators
- **Line tool**: For drawing connections and aspects
- **Pen tool**: For freehand annotations and notes
- **Text tool**: For adding custom labels and descriptions

#### Advanced Features
- **Layer management**: Separate layers for charts, planets, and annotations
- **Snap-to-grid**: Automatic alignment for precise placement
- **Undo/Redo**: Full action history for mistake correction
- **Custom right-click menu**: Context-sensitive menu system similar to Excalidraw for quick actions and tools

### 4. Export and Sharing

#### Export Options
- **High-resolution PNG**: For print-quality charts

#### Quality Standards
- Minimum 300 DPI resolution
- Vector-based rendering when possible
- Consistent typography and spacing
- Professional color schemes

## Technical Specifications

### Technology Stack

#### Core Technologies
- **Frontend**: Pure HTML5, CSS3, JavaScript (ES6+)
- **Type Safety**: TypeScript for enhanced development experience (compiled to JavaScript for GitHub Pages)
- **Styling**: Tailwind CSS for responsive, utility-first styling (linked from CDN)
- **Graphics**: HTML5 Canvas API for chart rendering and drawing
- **External Libraries**: All JavaScript libraries must be linked from external CDN sources (e.g., cdnjs.cloudflare.com, unpkg.com)
- **GitHub Pages Compatible**: All technologies must be client-side only with no build dependencies

#### Architecture Considerations
- **Excalidraw-inspired**: Heavily inspired by the [Excalidraw](https://github.com/excalidraw/excalidraw) codebase and user experience patterns and GUI designs
- **GitHub Pages Compatibility**: Entire codebase must work natively on GitHub Pages without any build process or server-side dependencies
- **Client-side only**: No server dependencies, all functionality runs in the browser
- **Static files only**: HTML, CSS, and JavaScript files that can be served directly by GitHub Pages
- **Local development**: Runnable with simple HTTP server or directly opening HTML files
- **Modular design**: Component-based architecture and codebase for maintainability, expansion and future updates.
- **Chart Generation Codebase**: I believe you utilise the codebase from [jyotichart](https://github.com/VicharaVandana/jyotichart) for generating both south-indian and north-indian Chart style. The codebase is in python. I believe you can translate and port the codebase into JavaScript?

### Browser Compatibility

#### Desktop Support
- **Chrome**: Version 80+ (Chromium-based browsers)
- **Firefox**: Version 75+
- **Safari**: Version 13+
- **Edge**: Version 80+

#### Mobile Support
- **iOS Safari**: Version 13+
- **Android Chrome**: Version 80+
- **Responsive design**: Optimized for tablet and phone screens
- **Touch interactions**: Native touch support for drag and drop

### Platform Requirements
- **Operating Systems**: Windows 10+, macOS 10.15+, Linux (modern distributions)
- **Memory**: Minimum 2GB RAM recommended
- **Storage**: Local browser storage for caching (no persistent storage)

## User Experience Design

### Design Principles
- **Ultra-sleek aesthetics**: Modern, minimalist interface
- **Intuitive workflow**: Excalidraw-inspired user experience
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: Smooth 60fps interactions

### Theme System
- **Light Mode**: Default theme with high contrast for readability
- **Dark Mode**: Eye-friendly alternative with proper color inversion
- **Automatic switching**: System preference detection
- **Manual toggle**: User-controlled theme selection

### Responsive Layout
- **Desktop**: Full-featured interface with sidebar panels
- **Tablet**: Optimized layout with collapsible panels
- **Mobile**: Touch-friendly interface with bottom navigation

## Data Management

### Session Handling
- **Ephemeral sessions**: No data persistence between browser sessions
- **Browser cache**: Temporary storage for performance optimization
- **No registration**: Zero-friction user experience
- **Privacy-first**: No personal data collection or storage

### Performance Optimization
- **Lazy loading**: Components loaded as needed
- **Efficient rendering**: Canvas optimization for smooth interactions
- **Memory management**: Automatic cleanup of unused resources
- **Caching strategy**: Smart asset caching for faster load times

## Development Guidelines

### Code Quality Standards
- **Clean architecture**: Separation of concerns
- **Modular components**: Reusable, testable code blocks
- **Documentation**: Comprehensive inline and API documentation
- **Testing**: Unit tests for core functionality

### Maintainability
- **Version control**: Git-based development workflow
- **Issue tracking**: GitHub Issues for bug reports and features
- **Contribution guidelines**: Clear process for community contributions
- **Release management**: Semantic versioning for updates

## Future Enhancement Roadmap

### Phase 1 (MVP)
- Basic chart templates (North and South Indian)
- Planet drag-and-drop functionality
- Simple drawing tools
- PNG export capability

### Phase 2 (Enhanced Features)
- Advanced drawing tools
- Improved mobile experience
- Keyboard shortcuts

### Phase 3 (Professional Features)
- Text notes and annotations: Users can type custom notes and create text boxes anywhere on the canvas
- Multi-language support: Planet names and abbreviations available in Tamil and Hindi alongside English (UI remains in UK English)
- Aspect line drawing
- Custom planet sets
- Batch chart generation

### Phase 4 (Future Considerations)
- Additional drawing tools and effects
- Enhanced export options
- Community feedback integration

## Success Metrics

### User Experience
- **Time to first chart**: Under 30 seconds from page load
- **Learning curve**: New users productive within 5 minutes
- **Error rate**: Less than 5% user actions result in errors

### Technical Performance
- **Page load time**: Under 3 seconds on average connection
- **Interaction latency**: Under 100ms for drag-and-drop operations
- **Memory usage**: Under 100MB RAM consumption

### Educational Impact
- **Adoption rate**: Measurable increase in digital chart usage
- **User feedback**: Positive reception from astrology educators
- **Feature utilization**: Active use of core features by target audience

## Risk Assessment and Mitigation

### Technical Risks
- **Browser compatibility**: Extensive testing across target browsers
- **Performance issues**: Optimization and profiling during development
- **Mobile limitations**: Progressive enhancement approach

### User Adoption Risks
- **Learning curve**: Intuitive design and onboarding flow
- **Feature complexity**: Gradual feature introduction
- **Traditional resistance**: Clear benefits demonstration

## Conclusion

This Vedic Astrology Chart Builder addresses a clear need in the educational technology space for traditional astrology. By combining modern web technologies with domain-specific requirements, the application will provide significant value to educators and students in the Vedanga Jyotisha community.

The project's success depends on maintaining a balance between feature richness and simplicity, ensuring that the tool enhances rather than complicates the traditional learning process. The technical approach emphasises accessibility, performance, and maintainability, positioning the application for long-term success and community adoption.