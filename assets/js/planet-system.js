/**
 * Planet System Class
 * Manages planet library, floating Graha Library UI, and drag-and-drop functionality
 */
class PlanetSystem {
    constructor() {
        // Graha Library UI state
        this.grahaLibrary = null;
        this.planetGrid = null;
        this.isDraggingLibrary = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.initialX = 0;
        this.initialY = 0;

        // Planet data
        this.planets = {
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
        this.draggedPlanet = null;
        this.dropZones = [];
    }

    init() {
        // Graha Library UI
        this.grahaLibrary = document.getElementById('graha-library');
        this.planetGrid = document.getElementById('planet-library');
        if (!this.grahaLibrary || !this.planetGrid) {
            console.error('Graha Library elements not found');
            return;
        }
        this.setupLibraryEventListeners();
        this.createPlanetLibrary();
        this.setupDragAndDrop();
        console.log('Planet system initialized');
    }

    // --- Graha Library Floating UI ---
    setupLibraryEventListeners() {
        // Drag functionality for floating library
        const header = this.grahaLibrary.querySelector('.planet-library-header');

        // Desktop mouse events
        header.addEventListener('mousedown', (e) => this.handleLibraryDragStart(e));
        document.addEventListener('mousemove', (e) => this.handleLibraryDragMove(e));
        document.addEventListener('mouseup', () => this.handleLibraryDragEnd());

        // Mobile touch events
        header.addEventListener('touchstart', (e) => this.handleLibraryTouchStart(e));
        document.addEventListener('touchmove', (e) => this.handleLibraryTouchMove(e));
        document.addEventListener('touchend', () => this.handleLibraryTouchEnd());
    }

    handleLibraryTouchStart(e) {
        e.preventDefault();
        this.isDraggingLibrary = true;
        const touch = e.touches[0];
        this.dragStartX = touch.clientX;
        this.dragStartY = touch.clientY;
        const rect = this.grahaLibrary.getBoundingClientRect();
        this.initialX = rect.left;
        this.initialY = rect.top;

        // Store the current height to lock it during dragging
        this.initialHeight = this.grahaLibrary.offsetHeight;

        // Remove the transform that centers the library on mobile
        this.grahaLibrary.style.transform = 'none';
        this.grahaLibrary.style.transition = 'none';

        // Lock the height to prevent any changes
        this.grahaLibrary.style.height = this.initialHeight + 'px';
        this.grahaLibrary.style.minHeight = this.initialHeight + 'px';
        this.grahaLibrary.style.maxHeight = this.initialHeight + 'px';

        // Disable transitions on all planet items to prevent height changes
        const planetItems = this.grahaLibrary.querySelectorAll('.planet-item');
        planetItems.forEach(item => {
            item.style.transition = 'none';
        });

        // Also lock the grid height
        const planetGrid = this.grahaLibrary.querySelector('.planet-grid');
        if (planetGrid) {
            planetGrid.style.maxHeight = planetGrid.offsetHeight + 'px';
            planetGrid.style.overflow = 'hidden';
        }

        // Add subtle visual feedback for mobile dragging (no size change)
        this.grahaLibrary.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.3)';
        this.grahaLibrary.style.zIndex = '1001';
    }

    handleLibraryTouchMove(e) {
        if (!this.isDraggingLibrary) return;
        e.preventDefault();
        const touch = e.touches[0];
        const deltaX = touch.clientX - this.dragStartX;
        const deltaY = touch.clientY - this.dragStartY;
        const newX = this.initialX + deltaX;
        const newY = this.initialY + deltaY;
        // Keep within viewport bounds
        const maxX = window.innerWidth - this.grahaLibrary.offsetWidth;
        const maxY = window.innerHeight - this.grahaLibrary.offsetHeight;
        const clampedX = Math.max(0, Math.min(newX, maxX));
        const clampedY = Math.max(0, Math.min(newY, maxY));
        this.grahaLibrary.style.left = clampedX + 'px';
        this.grahaLibrary.style.top = clampedY + 'px';
    }

    handleLibraryTouchEnd() {
        if (this.isDraggingLibrary) {
            this.isDraggingLibrary = false;

            // Keep the exact same height permanently to prevent any changes
            this.grahaLibrary.style.height = this.initialHeight + 'px';
            this.grahaLibrary.style.minHeight = this.initialHeight + 'px';
            this.grahaLibrary.style.maxHeight = this.initialHeight + 'px';

            // Re-enable transitions on planet items
            const planetItems = this.grahaLibrary.querySelectorAll('.planet-item');
            planetItems.forEach(item => {
                item.style.transition = '';
            });

            // Keep grid height locked
            const planetGrid = this.grahaLibrary.querySelector('.planet-grid');
            if (planetGrid) {
                planetGrid.style.maxHeight = planetGrid.offsetHeight + 'px';
                planetGrid.style.overflow = 'hidden';
            }

            // Remove visual feedback
            this.grahaLibrary.style.boxShadow = '';
            this.grahaLibrary.style.zIndex = '';

            // Don't restore transform - keep the library where user dragged it
        }
    }
    handleLibraryDragStart(e) {
        this.isDraggingLibrary = true;
        this.dragStartX = e.clientX;
        this.dragStartY = e.clientY;
        const rect = this.grahaLibrary.getBoundingClientRect();
        this.initialX = rect.left;
        this.initialY = rect.top;
        this.grahaLibrary.style.transition = 'none';
        document.body.style.cursor = 'grabbing';
    }
    handleLibraryDragMove(e) {
        if (!this.isDraggingLibrary) return;
        const deltaX = e.clientX - this.dragStartX;
        const deltaY = e.clientY - this.dragStartY;
        const newX = this.initialX + deltaX;
        const newY = this.initialY + deltaY;
        // Keep within viewport bounds
        const maxX = window.innerWidth - this.grahaLibrary.offsetWidth;
        const maxY = window.innerHeight - this.grahaLibrary.offsetHeight;
        const clampedX = Math.max(0, Math.min(newX, maxX));
        const clampedY = Math.max(0, Math.min(newY, maxY));
        this.grahaLibrary.style.left = clampedX + 'px';
        this.grahaLibrary.style.top = clampedY + 'px';
    }
    handleLibraryDragEnd() {
        if (this.isDraggingLibrary) {
            this.isDraggingLibrary = false;
            this.grahaLibrary.style.transition = '';
            document.body.style.cursor = '';
        }
    }
    getLibraryPosition() {
        const rect = this.grahaLibrary.getBoundingClientRect();
        return {
            x: rect.left,
            y: rect.top
        };
    }
    setLibraryPosition(x, y) {
        const maxX = window.innerWidth - this.grahaLibrary.offsetWidth;
        const maxY = window.innerHeight - this.grahaLibrary.offsetHeight;
        const clampedX = Math.max(0, Math.min(x, maxX));
        const clampedY = Math.max(0, Math.min(y, maxY));
        this.grahaLibrary.style.left = clampedX + 'px';
        this.grahaLibrary.style.top = clampedY + 'px';
    }

    // --- Planet Library and Drag-and-Drop ---
    createPlanetLibrary() {
        const library = document.getElementById('planet-library');
        if (!library) {
            console.error('Planet library container not found');
            return;
        }
        library.innerHTML = '';
        Object.entries(this.planets).forEach(([abbr, planet]) => {
            const planetItem = document.createElement('div');
            planetItem.className = 'planet-item';
            planetItem.textContent = planet.fullName;
            planetItem.draggable = true;
            planetItem.dataset.planet = abbr;

            // Add drag event listeners for desktop
            planetItem.addEventListener('dragstart', (e) => this.handleDragStart(e, abbr));
            planetItem.addEventListener('dragend', (e) => this.handleDragEnd(e));

            // Add touch event listeners for mobile
            planetItem.addEventListener('touchstart', (e) => this.handleTouchStart(e, abbr));
            planetItem.addEventListener('touchmove', (e) => this.handleTouchMove(e, abbr));
            planetItem.addEventListener('touchend', (e) => this.handleTouchEnd(e, abbr));

            library.appendChild(planetItem);
        });
    }
    setupDragAndDrop() {
        // Prevent default drag behaviors on the canvas
        const canvas = document.getElementById('canvas-container');
        if (canvas) {
            canvas.addEventListener('dragover', (e) => e.preventDefault());
            canvas.addEventListener('drop', (e) => this.handleDrop(e));
        }
    }
    setupDropZones(chartTemplates) {
        this.dropZones = chartTemplates.getDropZones();
        console.log('Drop zones setup complete');
    }
    handleDragStart(e, planetAbbr) {
        this.draggedPlanet = planetAbbr;
        e.dataTransfer.setData('text/plain', planetAbbr);
        e.dataTransfer.effectAllowed = 'copy';
        // Add visual feedback
        e.target.style.opacity = '0.5';
        e.target.style.transform = 'scale(0.9)';
        console.log(`Started dragging planet: ${planetAbbr}`);
    }
    handleDragEnd(e) {
        this.draggedPlanet = null;
        // Remove visual feedback
        e.target.style.opacity = '1';
        e.target.style.transform = 'scale(1)';
        console.log('Drag ended');
    }

    // Mobile touch handlers
    handleTouchStart(e, planetAbbr) {
        e.preventDefault();
        e.stopPropagation();

        this.draggedPlanet = planetAbbr;
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
        this.isDragging = false;

        // Create visual drag preview immediately for Safari
        this.createDragPreview(planetAbbr, e.touches[0].clientX, e.touches[0].clientY);

        // Add touch move listener to document for better Safari support
        document.addEventListener('touchmove', this.boundTouchMove = (e) => this.handleTouchMove(e, planetAbbr), {
            passive: false
        });
        document.addEventListener('touchend', this.boundTouchEnd = (e) => this.handleTouchEnd(e, planetAbbr), {
            passive: false
        });

        console.log(`Touch started for planet: ${planetAbbr}`);
    }

    handleTouchMove(e, planetAbbr) {
        e.preventDefault();
        e.stopPropagation();

        if (!this.draggedPlanet || this.draggedPlanet !== planetAbbr) return;

        const touch = e.touches[0];
        const deltaX = Math.abs(touch.clientX - this.touchStartX);
        const deltaY = Math.abs(touch.clientY - this.touchStartY);

        // Start dragging after a small movement threshold
        if (!this.isDragging && (deltaX > 5 || deltaY > 5)) {
            this.isDragging = true;
            console.log('Started mobile drag');
        }

        if (this.dragPreview) {
            // Update drag preview position
            this.dragPreview.style.left = (touch.clientX - 25) + 'px';
            this.dragPreview.style.top = (touch.clientY - 25) + 'px';
        }
    }

    handleTouchEnd(e, planetAbbr) {
        e.preventDefault();
        e.stopPropagation();

        if (!this.draggedPlanet || this.draggedPlanet !== planetAbbr) return;

        if (this.isDragging) {
            // Handle drop
            const touch = e.changedTouches[0];
            this.handleMobileDrop(touch.clientX, touch.clientY);
        }

        // Clean up
        this.draggedPlanet = null;
        this.isDragging = false;
        this.removeDragPreview();

        // Remove document event listeners
        if (this.boundTouchMove) {
            document.removeEventListener('touchmove', this.boundTouchMove);
            this.boundTouchMove = null;
        }
        if (this.boundTouchEnd) {
            document.removeEventListener('touchend', this.boundTouchEnd);
            this.boundTouchEnd = null;
        }

        console.log('Touch ended');
    }

    createDragPreview(planetAbbr, x, y) {
        // Remove existing preview
        this.removeDragPreview();

        // Create new preview
        this.dragPreview = document.createElement('div');
        this.dragPreview.className = 'planet-drag-preview';
        this.dragPreview.textContent = this.planets[planetAbbr].fullName;
        this.dragPreview.style.cssText = `
            position: fixed;
            left: ${x - 25}px;
            top: ${y - 25}px;
            width: 50px;
            height: 50px;
            background: white;
            border: 2px solid #000000;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: bold;
            color: #000000;
            z-index: 10000;
            pointer-events: none;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            opacity: 0.9;
        `;

        document.body.appendChild(this.dragPreview);
    }

    removeDragPreview() {
        if (this.dragPreview) {
            this.dragPreview.remove();
            this.dragPreview = null;
        }
    }

    handleMobileDrop(x, y) {
        // Check for selected bhava first
        let targetHouse = null;
        const chartType = window.app?.chartTemplates?.currentChartType;
        if (chartType === 'south-indian') {
            targetHouse = window.selectedBhavaSouth;
        } else if (chartType === 'north-indian') {
            targetHouse = window.selectedBhavaNorth;
        }

        if (!targetHouse) {
            // Find house based on touch position
            targetHouse = this.findHouseAtPosition(x, y);
        }

        if (targetHouse && this.draggedPlanet) {
            this.placePlanetInHouse(this.draggedPlanet, targetHouse);
            console.log(`Mobile drop: Planet ${this.draggedPlanet} placed in house ${targetHouse}`);
        }
    }

    findHouseAtPosition(x, y) {
        // This is a simplified implementation
        // In a real implementation, you'd need to convert screen coordinates to chart coordinates
        // and check which house polygon contains the point

        const chartType = window.app?.chartTemplates?.currentChartType;
        if (chartType === 'south-indian') {
            // For South Indian chart, you'd check the 3x4 grid
            // This is a placeholder - you'd need to implement proper coordinate conversion
            return 1; // Default to house 1
        } else if (chartType === 'north-indian') {
            // For North Indian chart, you'd check the polygon shapes
            // This is a placeholder - you'd need to implement proper coordinate conversion
            return 1; // Default to house 1
        }

        return null;
    }
    handleDrop(e) {
        e.preventDefault();
        if (!this.draggedPlanet) return;
        // Check for selected bhava (South or North Indian)
        let targetHouse = null;
        const chartType = window.app?.chartTemplates?.currentChartType;
        if (chartType === 'south-indian') {
            targetHouse = window.selectedBhavaSouth;
        } else if (chartType === 'north-indian') {
            targetHouse = window.selectedBhavaNorth;
        }
        if (!targetHouse) {
            const stage = window.app?.chartTemplates?.getStage();
            if (!stage) {
                console.error('Stage not available for drop');
                return;
            }
            // Get drop position relative to stage
            const pointer = stage.getPointerPosition();
            if (!pointer) {
                console.error('Could not get pointer position');
                return;
            }
            // Fallback: Find the closest house to drop position
            targetHouse = this.findClosestHouse(pointer);
        }
        if (targetHouse) {
            this.placePlanetInHouse(this.draggedPlanet, targetHouse);
            console.log(`Planet ${this.draggedPlanet} placed in house ${targetHouse}`);
        } else {
            console.log('No suitable house found for planet placement');
        }
        this.draggedPlanet = null;
    }
    findClosestHouse(pointer) {
        // This would need to be implemented based on the chart templates
        // For now, return a default house index
        return 1; // Place in first house by default
    }
    placePlanetInHouse(planetAbbr, houseIndex, label = null, id = null) {
        const chartTemplates = window.app?.chartTemplates;
        if (!chartTemplates) {
            console.error('Chart templates not available');
            return;
        }
        // Add planet to the specified house
        chartTemplates.addPlanetToHouse(planetAbbr, houseIndex, label, id);
    }
    getPlanetInfo(abbr) {
        return this.planets[abbr] || null;
    }
    getAllPlanets() {
        return this.planets;
    }
}