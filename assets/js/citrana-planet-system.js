/**
 * citrana-planet-system.js
 * Citrana • https://github.com/IAmVigneswaran/Soothsayer-Citrana 
 * © 2026 Vigneswaran Rajkumar • Licensed under MIT License
 * Manages Graha library, floating Graha Library UI, and drag-and-drop functionality
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

        // Graha data - Page 1 (Traditional Grahas)
        // Contains the 12 traditional grahas used in Vedic astrology
        // To add more Grahas to this page, simply add new entries to this object
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
        this.swipeStartX = 0;
        this.swipeStartY = 0;
        this.isSwiping = false;
        this.isPageSwiping = false;
        this.draggedPlanet = null;
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
        citranaDebug('Graha system initialized');
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

        // Disable transitions on all Graha items to prevent height changes
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

            // Re-enable transitions on Graha items
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

    // --- Graha Library and Drag-and-Drop ---
    createPlanetLibrary() {
        const library = document.getElementById('planet-library');
        if (!library) {
            console.error('Graha library container not found');
            return;
        }

        // Clear existing content
        library.innerHTML = '';

        // Get current page Grahas
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

        // Create Graha items for current page
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
    handleDragStart(e, planetAbbr) {
        this.draggedPlanet = planetAbbr;
        e.dataTransfer.setData('text/plain', planetAbbr);
        e.dataTransfer.effectAllowed = 'copy';
        // Add visual feedback
        e.target.style.opacity = '0.5';
        e.target.style.transform = 'scale(0.9)';
        citranaDebug(`Started dragging Graha: ${planetAbbr}`);
    }
    handleDragEnd(e) {
        this.draggedPlanet = null;
        // Remove visual feedback
        e.target.style.opacity = '1';
        e.target.style.transform = 'scale(1)';
        citranaDebug('Drag ended');
    }

    // Mobile touch handlers
    handleTouchStart(e, planetAbbr) {
        e.stopPropagation();

        this.draggedPlanet = planetAbbr;
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
        this.isDragging = false;
        this.isPageSwiping = false;

        document.addEventListener('touchmove', this.boundTouchMove = (e) => this.handleTouchMove(e, planetAbbr), {
            passive: false
        });
        document.addEventListener('touchend', this.boundTouchEnd = (e) => this.handleTouchEnd(e, planetAbbr), {
            passive: false
        });

        citranaDebug(`Touch started for Graha: ${planetAbbr}`);
    }

    handleTouchMove(e, planetAbbr) {
        if (!this.draggedPlanet && !this.isPageSwiping) {
            return;
        }

        if (this.draggedPlanet && this.draggedPlanet !== planetAbbr && !this.isPageSwiping) {
            return;
        }

        const touch = e.touches[0];
        const deltaX = touch.clientX - this.touchStartX;
        const deltaY = touch.clientY - this.touchStartY;
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);

        if (!this.isDragging && !this.isPageSwiping && this.draggedPlanet === planetAbbr) {
            if (absX < 8 && absY < 8) {
                return;
            }

            // Horizontal swipe on the grid changes pages; otherwise treat as Graha drag.
            if (absX > absY && absX >= 24) {
                this.isPageSwiping = true;
                this.draggedPlanet = null;
                this.removeDragPreview();
                e.preventDefault();
                return;
            }

            if (absX > 5 || absY > 5) {
                this.isDragging = true;
                if (!this.dragPreview) {
                    this.createDragPreview(planetAbbr, touch.clientX, touch.clientY);
                }
            }
        }

        if (this.isPageSwiping) {
            e.preventDefault();
            return;
        }

        if (this.isDragging && this.dragPreview) {
            e.preventDefault();
            this.dragPreview.style.left = (touch.clientX - 25) + 'px';
            this.dragPreview.style.top = (touch.clientY - 25) + 'px';
        }
    }

    handleTouchEnd(e, planetAbbr) {
        if (this.isPageSwiping) {
            e.preventDefault();
            const deltaX = e.changedTouches[0].clientX - this.touchStartX;
            const threshold = 50;

            if (Math.abs(deltaX) > threshold) {
                if (deltaX > 0 && this.currentPage > 1) {
                    this.goToPage(this.currentPage - 1);
                } else if (deltaX < 0 && this.currentPage < this.totalPages) {
                    this.goToPage(this.currentPage + 1);
                }
            }
        } else if (this.isDragging && this.draggedPlanet === planetAbbr) {
            e.preventDefault();
            const touch = e.changedTouches[0];
            this.handleMobileDrop(touch.clientX, touch.clientY);
        }

        this.draggedPlanet = null;
        this.isDragging = false;
        this.isPageSwiping = false;
        this.removeDragPreview();

        if (this.boundTouchMove) {
            document.removeEventListener('touchmove', this.boundTouchMove);
            this.boundTouchMove = null;
        }
        if (this.boundTouchEnd) {
            document.removeEventListener('touchend', this.boundTouchEnd);
            this.boundTouchEnd = null;
        }

        citranaDebug('Touch ended');
    }

    createDragPreview(planetAbbr, x, y) {
        // Remove existing preview
        this.removeDragPreview();

        // Get Graha info from current page or both pages
        const planetInfo = this.getPlanetInfo(planetAbbr);
        if (!planetInfo) {
            console.error(`Graha info not found for: ${planetAbbr}`);
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

    clearSelectedBhavaDropTarget() {
        const chartType = this.chartTemplates?.currentChartType;
        if (chartType === 'south-indian') {
            window.selectedBhavaSouth = null;
        } else if (chartType === 'north-indian') {
            window.selectedBhavaNorth = null;
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
            // Find Bhava based on touch position
            targetHouse = this.findHouseAtPosition(x, y);
        }

        if (targetHouse && this.draggedPlanet) {
            this.placePlanetInHouse(this.draggedPlanet, targetHouse);
            this.clearSelectedBhavaDropTarget();
            citranaDebug(`Mobile drop: Graha ${this.draggedPlanet} placed in Bhava ${targetHouse}`);
        }
    }

    findHouseAtPosition(clientX, clientY) {
        if (!this.chartTemplates) return null;
        return this.chartTemplates.findHouseAtClientPoint(clientX, clientY);
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
            const pointer = stage.getPointerPosition();
            if (pointer) {
                targetHouse = this.chartTemplates.findHouseAtPointer(pointer);
            }
            if (!targetHouse) {
                targetHouse = this.findHouseAtPosition(e.clientX, e.clientY);
            }
        }
        if (targetHouse) {
            this.placePlanetInHouse(this.draggedPlanet, targetHouse);
            this.clearSelectedBhavaDropTarget();
            citranaDebug(`Graha ${this.draggedPlanet} placed in Bhava ${targetHouse}`);
        } else {
            citranaDebug('No suitable Bhava found for Graha placement');
        }
        this.draggedPlanet = null;
    }
    placePlanetInHouse(planetAbbr, houseIndex, label = null, id = null) {
        if (!this.chartTemplates) {
            console.error('Chart templates not available');
            return;
        }
        // Add Graha to the specified Bhava
        this.chartTemplates.addPlanetToHouse(planetAbbr, houseIndex, label, id);
    }
    getPlanetInfo(abbr) {
        // Check all five pages for Graha info
        return this.planetsPage1[abbr] || this.planetsPage2[abbr] || this.planetsPage3[abbr] || this.planetsPage4[abbr] || this.planetsPage5[abbr] || null;
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
            dot.title = `Graha Library Page ${i} (${i})`;
            dot.setAttribute('aria-label', `Graha Library Page ${i}`);
            dot.addEventListener('click', () => this.goToPage(i));
            dotsContainer.appendChild(dot);
        }

        library.appendChild(dotsContainer);
    }

    setupSwipeEvents() {
        const library = document.getElementById('graha-library');
        const grid = document.getElementById('planet-library');
        if (!library) return;

        // Remove existing swipe listeners
        library.removeEventListener('touchstart', this.handleSwipeStart);
        library.removeEventListener('touchmove', this.handleSwipeMove);
        library.removeEventListener('touchend', this.handleSwipeEnd);
        grid?.removeEventListener('touchstart', this.handleSwipeStart);
        grid?.removeEventListener('touchmove', this.handleSwipeMove);
        grid?.removeEventListener('touchend', this.handleSwipeEnd);

        this.handleSwipeStart = (e) => {
            if (e.target.closest('.planet-item')) {
                return;
            }

            this.swipeStartX = e.touches[0].clientX;
            this.swipeStartY = e.touches[0].clientY;
            this.isSwiping = false;
        };

        this.handleSwipeMove = (e) => {
            if (!this.swipeStartX) return;

            const deltaX = e.touches[0].clientX - this.swipeStartX;
            const deltaY = e.touches[0].clientY - this.swipeStartY;

            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 24) {
                this.isSwiping = true;
                e.preventDefault();
            }
        };

        this.handleSwipeEnd = (e) => {
            if (!this.isSwiping || !this.swipeStartX) {
                this.swipeStartX = 0;
                this.swipeStartY = 0;
                this.isSwiping = false;
                return;
            }

            const deltaX = e.changedTouches[0].clientX - this.swipeStartX;
            const threshold = 50;

            if (Math.abs(deltaX) > threshold) {
                if (deltaX > 0 && this.currentPage > 1) {
                    this.goToPage(this.currentPage - 1);
                } else if (deltaX < 0 && this.currentPage < this.totalPages) {
                    this.goToPage(this.currentPage + 1);
                }
            }

            this.swipeStartX = 0;
            this.swipeStartY = 0;
            this.isSwiping = false;
        };

        const swipeTargets = grid ? [library, grid] : [library];
        swipeTargets.forEach((target) => {
            target.addEventListener('touchstart', this.handleSwipeStart, {
                passive: true
            });
            target.addEventListener('touchmove', this.handleSwipeMove, {
                passive: false
            });
            target.addEventListener('touchend', this.handleSwipeEnd, {
                passive: true
            });
        });
    }

    goToPage(pageNumber) {
        if (pageNumber < 1 || pageNumber > this.totalPages || pageNumber === this.currentPage) {
            return false;
        }

        this.currentPage = pageNumber;
        this.createPlanetLibrary();
        citranaDebug(`Switched to page ${pageNumber}`);
        return true;
    }
}