/**
 * Graha Library Management
 * Handles the floating Graha Library with drag functionality
 */
class GrahaLibrary {
    constructor() {
        this.grahaLibrary = null;
        this.planetGrid = null;
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.initialX = 0;
        this.initialY = 0;
        
        this.init();
    }

    init() {
        this.grahaLibrary = document.getElementById('graha-library');
        this.planetGrid = document.getElementById('planet-library');
        
        if (!this.grahaLibrary || !this.planetGrid) {
            console.error('Graha Library elements not found');
            return;
        }

        this.setupEventListeners();
        console.log('Graha Library initialized');
    }

    setupEventListeners() {
        // Drag functionality
        const header = this.grahaLibrary.querySelector('.planet-library-header');
        header.addEventListener('mousedown', (e) => this.handleDragStart(e));

        // Global mouse events for dragging
        document.addEventListener('mousemove', (e) => this.handleDragMove(e));
        document.addEventListener('mouseup', () => this.handleDragEnd());
    }

    handleDragStart(e) {
        this.isDragging = true;
        this.dragStartX = e.clientX;
        this.dragStartY = e.clientY;
        
        const rect = this.grahaLibrary.getBoundingClientRect();
        this.initialX = rect.left;
        this.initialY = rect.top;
        
        this.grahaLibrary.style.transition = 'none';
        document.body.style.cursor = 'grabbing';
    }

    handleDragMove(e) {
        if (!this.isDragging) return;
        
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

    handleDragEnd() {
        if (this.isDragging) {
            this.isDragging = false;
            this.grahaLibrary.style.transition = '';
            document.body.style.cursor = '';
        }
    }

    // Public methods for external control
    getPosition() {
        const rect = this.grahaLibrary.getBoundingClientRect();
        return {
            x: rect.left,
            y: rect.top
        };
    }

    setPosition(x, y) {
        // Keep within viewport bounds
        const maxX = window.innerWidth - this.grahaLibrary.offsetWidth;
        const maxY = window.innerHeight - this.grahaLibrary.offsetHeight;
        
        const clampedX = Math.max(0, Math.min(x, maxX));
        const clampedY = Math.max(0, Math.min(y, maxY));
        
        this.grahaLibrary.style.left = clampedX + 'px';
        this.grahaLibrary.style.top = clampedY + 'px';
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GrahaLibrary;
} 