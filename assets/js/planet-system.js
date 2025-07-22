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
            'Lg': { name: 'Lagna', fullName: 'Lagna', color: '#000000' },
            'Su': { name: 'Sun', fullName: 'Sun', color: '#000000' },
            'Mo': { name: 'Moon', fullName: 'Moon', color: '#000000' },
            'Me': { name: 'Mercury', fullName: 'Mercury', color: '#000000' },
            'Ve': { name: 'Venus', fullName: 'Venus', color: '#000000' },
            'Ma': { name: 'Mars', fullName: 'Mars', color: '#000000' },
            'Ju': { name: 'Jupiter', fullName: 'Jupiter', color: '#000000' },
            'Sa': { name: 'Saturn', fullName: 'Saturn', color: '#000000' },
            'Ra': { name: 'Rahu', fullName: 'Rahu', color: '#000000' },
            'Ke': { name: 'Ketu', fullName: 'Ketu', color: '#000000' },
            'Md': { name: 'Maandi', fullName: 'Maandi', color: '#000000' },
            'Cu': { name: 'Custom', fullName: 'Custom', color: '#000000' }
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
        header.addEventListener('mousedown', (e) => this.handleLibraryDragStart(e));
        document.addEventListener('mousemove', (e) => this.handleLibraryDragMove(e));
        document.addEventListener('mouseup', () => this.handleLibraryDragEnd());
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
        return { x: rect.left, y: rect.top };
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
        const library = this.planetGrid;
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
            // Add drag event listeners
            planetItem.addEventListener('dragstart', (e) => this.handleDragStart(e, abbr));
            planetItem.addEventListener('dragend', (e) => this.handleDragEnd(e));
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