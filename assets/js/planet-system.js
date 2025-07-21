/**
 * Planet System Class
 * Manages planet library and drag-and-drop functionality
 */
class PlanetSystem {
    constructor() {
        this.planets = {
            'Su': { name: 'Sun', fullName: 'Sun', color: '#000000' },
            'Mo': { name: 'Moon', fullName: 'Moon', color: '#000000' },
            'Ma': { name: 'Mars', fullName: 'Mars', color: '#000000' },
            'Me': { name: 'Mercury', fullName: 'Mercury', color: '#000000' },
            'Ju': { name: 'Jupiter', fullName: 'Jupiter', color: '#000000' },
            'Ve': { name: 'Venus', fullName: 'Venus', color: '#000000' },
            'Sa': { name: 'Saturn', fullName: 'Saturn', color: '#000000' },
            'Ra': { name: 'Rahu', fullName: 'Rahu', color: '#000000' },
            'Ke': { name: 'Ketu', fullName: 'Ketu', color: '#000000' },
            'Md': { name: 'Maandi', fullName: 'Maandi', color: '#000000' }
        };
        
        this.draggedPlanet = null;
        this.dropZones = [];
    }

    init() {
        this.createPlanetLibrary();
        this.setupDragAndDrop();
        console.log('Planet system initialized');
    }

    createPlanetLibrary() {
        const library = document.getElementById('planet-library');
        console.log('Looking for planet-library element:', library);
        
        if (!library) {
            console.error('Planet library container not found');
            return;
        }

        library.innerHTML = '';
        console.log('Creating planet items for:', Object.keys(this.planets));
        
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
            console.log('Added planet item:', planet.fullName);
        });
        
        console.log('Planet library created with', library.children.length, 'items');
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
        
        // Find the closest house to drop position
        const closestHouse = this.findClosestHouse(pointer);
        if (closestHouse) {
            this.placePlanetInHouse(this.draggedPlanet, closestHouse);
            console.log(`Planet ${this.draggedPlanet} placed in house ${closestHouse}`);
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

    placePlanetInHouse(planetAbbr, houseIndex) {
        const chartTemplates = window.app?.chartTemplates;
        if (!chartTemplates) {
            console.error('Chart templates not available');
            return;
        }
        
        // Add planet to the specified house
        chartTemplates.addPlanetToHouse(planetAbbr, houseIndex);
    }

    getPlanetInfo(abbr) {
        return this.planets[abbr] || null;
    }

    getAllPlanets() {
        return this.planets;
    }
} 