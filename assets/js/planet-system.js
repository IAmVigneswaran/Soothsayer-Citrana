/**
 * Planet System Class
 * Manages planet library, floating Graha Library UI, and drag-and-drop functionality
 */
class PlanetSystem {
    constructor(stage, layer, chartTemplates) {
        // Store references to dependencies
        this.stage = stage;
        this.layer = layer;
        this.chartTemplates = chartTemplates;

        // Graha Library UI state
        this.grahaLibrary = null;
        this.planetGrid = null;
        this.isDraggingLibrary = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.initialX = 0;
        this.initialY = 0;

        // Planet data - Page 1 (Grahas)
        // Contains the 12 traditional grahas used in Vedic astrology
        // To add more planets to this page, simply add new entries to this object
        // Structure: { abbreviation: { name, fullName, color } }
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
            'IL': {
                name: 'IL',
                fullName: 'IL',
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
        this.swipeStartX = 0;
        this.swipeStartY = 0;
        this.isSwiping = false;
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

        // Clear existing content
        library.innerHTML = '';

        // Get current page planets
        let currentPlanets;
        if (this.currentPage === 1) {
            currentPlanets = this.planetsPage1;
        } else if (this.currentPage === 2) {
            currentPlanets = this.planetsPage2;
        } else if (this.currentPage === 3) {
            currentPlanets = this.planetsPage3;
        } else if (this.currentPage === 4) {
            currentPlanets = this.planetsPage4;
        } else if (this.currentPage === 5) {
            currentPlanets = this.planetsPage5;
        }

        // Create planet items for current page
        Object.entries(currentPlanets).forEach(([abbr, planet]) => {
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

        // Create page dots for desktop
        this.createPageDots();

        // Add swipe event listeners for mobile
        this.setupSwipeEvents();
    }
    setupDragAndDrop() {
        // Prevent default drag behaviors on the canvas
        const canvas = document.getElementById('canvas-container');
        if (canvas) {
            canvas.addEventListener('dragover', (e) => e.preventDefault());
            canvas.addEventListener('drop', (e) => this.handleDrop(e));
        }
    }
    setupDropZones() {
        if (this.chartTemplates) {
            this.dropZones = this.chartTemplates.getDropZones();
            console.log('Drop zones setup complete');
        }
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

        // Get planet info from current page or both pages
        const planetInfo = this.getPlanetInfo(planetAbbr);
        if (!planetInfo) {
            console.error(`Planet info not found for: ${planetAbbr}`);
            return;
        }

        // Create new preview
        this.dragPreview = document.createElement('div');
        this.dragPreview.className = 'planet-drag-preview';
        this.dragPreview.textContent = planetInfo.fullName;
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
        const chartType = this.chartTemplates?.currentChartType;
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

        const chartType = this.chartTemplates?.currentChartType;
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
        const chartType = this.chartTemplates?.currentChartType;
        if (chartType === 'south-indian') {
            targetHouse = window.selectedBhavaSouth;
        } else if (chartType === 'north-indian') {
            targetHouse = window.selectedBhavaNorth;
        }
        if (!targetHouse) {
            const stage = this.chartTemplates?.getStage();
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
        if (!this.chartTemplates) {
            console.error('Chart templates not available');
            return;
        }
        // Add planet to the specified house
        this.chartTemplates.addPlanetToHouse(planetAbbr, houseIndex, label, id);
    }
    getPlanetInfo(abbr) {
        // Check all five pages for planet info
        return this.planetsPage1[abbr] || this.planetsPage2[abbr] || this.planetsPage3[abbr] || this.planetsPage4[abbr] || this.planetsPage5[abbr] || null;
    }

    getAllPlanets() {
        // Return all planets from all five pages
        return {
            ...this.planetsPage1,
            ...this.planetsPage2,
            ...this.planetsPage3,
            ...this.planetsPage4,
            ...this.planetsPage5
        };
    }

    // Paging methods
    createPageDots() {
        const library = document.getElementById('graha-library');
        if (!library) return;

        // Remove existing page dots
        const existingDots = library.querySelector('.page-dots');
        if (existingDots) {
            existingDots.remove();
        }

        // Create page dots container
        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'page-dots';

        // Create dots for each page
        for (let i = 1; i <= this.totalPages; i++) {
            const dot = document.createElement('div');
            dot.className = `page-dot ${i === this.currentPage ? 'active' : ''}`;

            dot.addEventListener('click', () => this.goToPage(i));
            dotsContainer.appendChild(dot);
        }

        library.appendChild(dotsContainer);
    }

    setupSwipeEvents() {
        const library = document.getElementById('graha-library');
        if (!library) return;

        // Remove existing swipe listeners
        library.removeEventListener('touchstart', this.handleSwipeStart);
        library.removeEventListener('touchmove', this.handleSwipeMove);
        library.removeEventListener('touchend', this.handleSwipeEnd);

        // Add new swipe listeners
        this.handleSwipeStart = (e) => {
            this.swipeStartX = e.touches[0].clientX;
            this.swipeStartY = e.touches[0].clientY;
            this.isSwiping = false;
        };

        this.handleSwipeMove = (e) => {
            if (!this.swipeStartX) return;

            const deltaX = e.touches[0].clientX - this.swipeStartX;
            const deltaY = e.touches[0].clientY - this.swipeStartY;

            // Check if it's a horizontal swipe
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                this.isSwiping = true;
                e.preventDefault(); // Prevent default scroll
            }
        };

        this.handleSwipeEnd = (e) => {
            if (!this.isSwiping || !this.swipeStartX) return;

            const deltaX = e.changedTouches[0].clientX - this.swipeStartX;
            const threshold = 100; // Minimum swipe distance

            if (Math.abs(deltaX) > threshold) {
                if (deltaX > 0 && this.currentPage > 1) {
                    // Swipe right - go to previous page
                    this.goToPage(this.currentPage - 1);
                } else if (deltaX < 0 && this.currentPage < this.totalPages) {
                    // Swipe left - go to next page
                    this.goToPage(this.currentPage + 1);
                }
            }

            this.swipeStartX = 0;
            this.swipeStartY = 0;
            this.isSwiping = false;
        };

        library.addEventListener('touchstart', this.handleSwipeStart, {
            passive: false
        });
        library.addEventListener('touchmove', this.handleSwipeMove, {
            passive: false
        });
        library.addEventListener('touchend', this.handleSwipeEnd, {
            passive: false
        });
    }

    goToPage(pageNumber) {
        if (pageNumber < 1 || pageNumber > this.totalPages || pageNumber === this.currentPage) {
            return;
        }

        this.currentPage = pageNumber;
        this.createPlanetLibrary();
        console.log(`Switched to page ${pageNumber}`);
    }
}