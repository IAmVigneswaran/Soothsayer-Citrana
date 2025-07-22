/**
 * Main Application Class - Konva.js Implementation
 * Coordinates all components and manages the application lifecycle
 * Citrana Web Application
 */
class CitranaApp {
    constructor() {
        this.stage = null;
        this.layer = null;
        this.chartTemplates = null;
        this.planetSystem = null;
        this.drawingTools = null;
        this.contextMenu = null;
        this.currentTool = 'select';
        this.isDrawing = false;
        this.lastPoint = null;
        
        this.init();
    }

    init() {
        console.log('Initializing Citrana App...');
        
        this.setupCanvas();
        this.setupComponents();
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.loadSavedData();
        
        console.log('App initialization complete');
    }

    setupCanvas() {
        const container = document.getElementById('canvas-container');
        this.stage = new Konva.Stage({
            container: 'canvas-container',
            width: container.offsetWidth,
            height: container.offsetHeight
        });
        
        this.layer = new Konva.Layer();
        this.stage.add(this.layer);
        
        console.log('Canvas setup complete');
    }

    setupComponents() {
        this.chartTemplates = new ChartCoordinator(this.stage, this.layer);
        this.planetSystem = new PlanetSystem(this.stage, this.layer, this.chartTemplates);
        this.drawingTools = new DrawingTools(this.stage, this.layer);
        this.contextMenu = new ContextMenu();
        
        // Initialize components
        this.planetSystem.init();
        this.contextMenu.init();
        
        console.log('Components setup complete');
    }

    setupEventListeners() {
        // Tool selection
        document.getElementById('select-tool').addEventListener('click', () => this.setTool('select'));
        document.getElementById('arrow-tool').addEventListener('click', () => this.setTool('arrow'));
        document.getElementById('line-tool').addEventListener('click', () => this.setTool('line'));
        document.getElementById('pen-tool').addEventListener('click', () => this.setTool('pen'));
        document.getElementById('text-tool').addEventListener('click', () => this.setTool('text'));
        document.getElementById('hand-tool').addEventListener('click', () => this.setTool('hand'));

        // Action buttons
        document.getElementById('undo-btn').addEventListener('click', () => this.drawingTools.undo());
        document.getElementById('redo-btn').addEventListener('click', () => this.drawingTools.redo());
        document.getElementById('export-btn').addEventListener('click', () => this.exportChart());

        // Zoom controls
        document.getElementById('zoom-in').addEventListener('click', () => this.chartTemplates.zoomIn());
        document.getElementById('zoom-out').addEventListener('click', () => this.chartTemplates.zoomOut());
        document.getElementById('reset-zoom').addEventListener('click', () => this.chartTemplates.zoomToFit());

        // Canvas events
        this.stage.on('mousedown', (e) => this.handleMouseDown(e));
        this.stage.on('mousemove', (e) => this.handleMouseMove(e));
        this.stage.on('mouseup', (e) => this.handleMouseUp(e));
        this.stage.on('wheel', (e) => this.handleWheel(e));

        // Window resize
        window.addEventListener('resize', () => this.handleResize());

        console.log('Event listeners setup complete');
    }

    loadSavedData() {
        // Load saved chart data if available
        const savedData = localStorage.getItem('citranaChartData');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                this.chartTemplates.loadChartData(data);
                console.log('Saved chart data loaded');
            } catch (error) {
                console.error('Error loading saved data:', error);
            }
        }

        // Auto-save every 30 seconds
        setInterval(() => this.autoSave(), 30000);
    }

    autoSave() {
        try {
            const chartData = this.chartTemplates.getChartData();
            localStorage.setItem('citranaChartData', JSON.stringify(chartData));
            console.log('Chart data auto-saved');
        } catch (error) {
            console.error('Error auto-saving:', error);
        }
    }

    exportChart() {
        try {
            const dataURL = this.stage.toDataURL({
                pixelRatio: 2,
                mimeType: 'image/png'
            });
            
            const link = document.createElement('a');
            link.download = 'citrana-chart.png';
            link.href = dataURL;
            link.click();
            
            console.log('Chart exported successfully');
        } catch (error) {
            console.error('Error exporting chart:', error);
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Tool shortcuts
            if (e.key === 'v' || e.key === 'V') {
                e.preventDefault();
                this.setTool('select');
            } else if (e.key === 'a' || e.key === 'A') {
                e.preventDefault();
                this.setTool('arrow');
            } else if (e.key === 'l' || e.key === 'L') {
                e.preventDefault();
                this.setTool('line');
            } else if (e.key === 'p' || e.key === 'P') {
                e.preventDefault();
                this.setTool('pen');
            } else if (e.key === 't' || e.key === 'T') {
                e.preventDefault();
                this.setTool('text');
            } else if (e.key === 'h' || e.key === 'H') {
                e.preventDefault();
                this.setTool('hand');
            }

            // Action shortcuts
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'z') {
                    e.preventDefault();
                    this.drawingTools.undo();
                } else if (e.key === 'y') {
                    e.preventDefault();
                    this.drawingTools.redo();
                }
            }
        });
    }

    setTool(tool) {
        this.currentTool = tool;
        
        // Update UI
        document.querySelectorAll('.toolbar-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`${tool}-tool`).classList.add('active');
        
        // Update cursor
        const container = document.getElementById('canvas-container');
        if (tool === 'hand') {
            container.style.cursor = 'grab';
        } else if (tool === 'select') {
            container.style.cursor = 'default';
        } else {
            container.style.cursor = 'crosshair';
        }
        
        console.log(`Tool set to: ${tool}`);
    }

    handleMouseDown(e) {
        const pos = this.stage.getPointerPosition();
        
        if (this.currentTool === 'hand') {
            this.stage.draggable(true);
            document.getElementById('canvas-container').style.cursor = 'grabbing';
        } else {
            this.isDrawing = true;
            this.lastPoint = pos;
            this.drawingTools.startDrawing(pos, this.currentTool);
        }
    }

    handleMouseMove(e) {
        if (!this.isDrawing) return;
        
        const pos = this.stage.getPointerPosition();
        this.drawingTools.draw(pos, this.currentTool);
        this.lastPoint = pos;
    }

    handleMouseUp(e) {
        if (this.currentTool === 'hand') {
            this.stage.draggable(false);
            document.getElementById('canvas-container').style.cursor = 'grab';
        } else {
            this.isDrawing = false;
            this.drawingTools.stopDrawing();
        }
    }

    handleWheel(e) {
        e.evt.preventDefault();
        
        const scaleBy = 1.1;
        const oldScale = this.stage.scaleX();
        
        const pointer = this.stage.getPointerPosition();
        const mousePointTo = {
            x: (pointer.x - this.stage.x()) / oldScale,
            y: (pointer.y - this.stage.y()) / oldScale
        };
        
        const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
        
        this.stage.scale({ x: newScale, y: newScale });
        
        const newPos = {
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale
        };
        
        this.stage.position(newPos);
        this.stage.batchDraw();
        
        this.updateZoomLevel();
    }

    handleResize() {
        const container = document.getElementById('canvas-container');
        this.stage.width(container.offsetWidth);
        this.stage.height(container.offsetHeight);
        this.stage.batchDraw();
    }

    updateZoomLevel() {
        const zoomPercent = Math.round(this.stage.scaleX() * 100);
        document.getElementById('zoom-level').textContent = `${zoomPercent}%`;
        this.zoomLevel = this.stage.scaleX();
    }

    clearChart() {
        this.layer.destroyChildren();
        this.stage.batchDraw();
        this.chartTemplates.clearChart();
        console.log('Chart cleared');
    }

    resetChart() {
        // Clear all planets from the chart
        this.chartTemplates.clearAllPlanets();
        // Clear all annotations/drawings
        this.drawingTools.clearAll();
        // Optionally clear selection
        if (window.selectedBhavaSouth) window.selectedBhavaSouth = null;
        this.layer.batchDraw();
        console.log('Chart reset: all planets and annotations cleared');
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new CitranaApp();
}); 