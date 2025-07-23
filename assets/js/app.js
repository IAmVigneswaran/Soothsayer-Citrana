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
        this.undoStack = [];
        this.redoStack = [];
        this.maxUndoSteps = 100;
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
        document.getElementById('select-tool').addEventListener('click', () => { this.setTool('select'); this.pushSnapshot(); });
        document.getElementById('arrow-tool').addEventListener('click', () => { this.setTool('arrow'); this.pushSnapshot(); });
        document.getElementById('line-tool').addEventListener('click', () => { this.setTool('line'); this.pushSnapshot(); });
        document.getElementById('pen-tool').addEventListener('click', () => { this.setTool('pen'); this.pushSnapshot(); });
        document.getElementById('text-tool').addEventListener('click', () => { this.setTool('text'); this.pushSnapshot(); });
        document.getElementById('hand-tool').addEventListener('click', () => { this.setTool('hand'); this.pushSnapshot(); });

        // Action buttons
        document.getElementById('undo-btn').addEventListener('click', () => this.undo());
        document.getElementById('redo-btn').addEventListener('click', () => this.redo());
        document.getElementById('export-btn').addEventListener('click', () => this.exportChart());

        // Zoom controls
        document.getElementById('zoom-in').addEventListener('click', () => this.chartTemplates.zoomIn());
        document.getElementById('zoom-out').addEventListener('click', () => this.chartTemplates.zoomOut());
        document.getElementById('reset-zoom').addEventListener('click', () => this.chartTemplates.zoomToFit());

        // Canvas events
        this.stage.on('mousedown', (e) => {
            // If click is on empty space (not a chart house or planet), clear highlight
            if (!e.target || (e.target && !e.target.name().startsWith('house-') && !e.target.name().startsWith('planet-') && !e.target.name().startsWith('planet-hit-'))) {
                if (this.chartTemplates.currentChartType === 'south-indian') {
                    this.chartTemplates.southIndianTemplate.clearHighlight();
                } else if (this.chartTemplates.currentChartType === 'north-indian') {
                    this.chartTemplates.northIndianTemplate.clearHighlight();
                }
            }
            this.handleMouseDown(e);
        });
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
                    // Check if we're in text editing mode
        const textarea = document.querySelector('.konva-textarea');
        const textEditInput = document.getElementById('text-edit-input');
        if ((textarea && document.activeElement === textarea) || 
            (textEditInput && document.activeElement === textEditInput)) {
            // Only allow Enter and Escape in text editing mode
            if (e.key === 'Enter' || e.key === 'Escape') {
                return; // Let the textarea handle these
            }
            return; // Ignore all other keyboard shortcuts during text editing
        }

            // Tool shortcuts
            if (e.key === 'v' || e.key === 'V') {
                e.preventDefault();
                this.setTool('select');
                this.pushSnapshot();
            } else if (e.key === 'a' || e.key === 'A') {
                e.preventDefault();
                this.setTool('arrow');
                this.pushSnapshot();
            } else if (e.key === 'l' || e.key === 'L') {
                e.preventDefault();
                this.setTool('line');
                this.pushSnapshot();
            } else if (e.key === 'p' || e.key === 'P') {
                e.preventDefault();
                this.setTool('pen');
                this.pushSnapshot();
            } else if (e.key === 't' || e.key === 'T') {
                e.preventDefault();
                this.setTool('text');
                this.pushSnapshot();
            } else if (e.key === 'h' || e.key === 'H') {
                e.preventDefault();
                this.setTool('hand');
                this.pushSnapshot();
            }

            // Action shortcuts
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'z') {
                    e.preventDefault();
                    this.undo();
                } else if (e.key === 'y') {
                    e.preventDefault();
                    this.redo();
                }
            }
            
            // Delete selected shape (only with Delete key, not Backspace)
            if (e.key === 'Delete') {
                if (this.currentTool === 'select') {
                    e.preventDefault();
                    this.drawingTools.deleteSelectedShape();
                }
            }
        });
    }

    setTool(tool) {
        this.currentTool = tool;
        this.drawingTools.setTool(tool);
        
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
        const pos = this.drawingTools.getPrecisePositionFromKonva(e);
        
        if (this.currentTool === 'hand') {
            this.stage.draggable(true);
            document.getElementById('canvas-container').style.cursor = 'grabbing';
        } else if (this.currentTool === 'select') {
            this.drawingTools.handleSelectMouseDown(pos, e);
        } else if (pos) {
            this.isDrawing = true;
            this.lastPoint = pos;
            this.drawingTools.startDrawing(pos, this.currentTool);
        }
    }

    handleMouseMove(e) {
        const pos = this.drawingTools.getPrecisePositionFromKonva(e);
        
        if (this.currentTool === 'select') {
            this.drawingTools.handleSelectMouseMove(pos);
        } else if (this.isDrawing && pos) {
        this.drawingTools.draw(pos, this.currentTool);
        this.lastPoint = pos;
        }
    }

    handleMouseUp(e) {
        if (this.currentTool === 'hand') {
            this.stage.draggable(false);
            document.getElementById('canvas-container').style.cursor = 'grab';
        } else if (this.currentTool === 'select') {
            this.drawingTools.handleSelectMouseUp();
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

    // --- GLOBAL UNDO/REDO ---
    pushSnapshot() {
        const chartData = this.chartTemplates.getChartData();
        const drawingData = this.serializeDrawings();
        this.undoStack.push({ chartData, drawingData });
        if (this.undoStack.length > this.maxUndoSteps) this.undoStack.shift();
        this.redoStack = [];
    }

    serializeDrawings() {
        // Only serialize drawing objects (name starts with 'drawing-')
        return this.layer.getChildren(node => node.name() && node.name().startsWith('drawing-')).map(node => node.toObject());
    }

    restoreDrawings(drawingData) {
        // Remove all current drawing objects
        this.drawingTools.clearAll();
        // Add from snapshot
        drawingData.forEach(obj => {
            const shape = Konva.Node.create(obj);
            this.layer.add(shape);
        });
        this.layer.batchDraw();
    }

    undo() {
        if (this.undoStack.length === 0) return;
        const current = { chartData: this.chartTemplates.getChartData(), drawingData: this.serializeDrawings() };
        this.redoStack.push(current);
        const snapshot = this.undoStack.pop();
        this.chartTemplates.loadChartData(snapshot.chartData);
        this.restoreDrawings(snapshot.drawingData);
    }

    redo() {
        if (this.redoStack.length === 0) return;
        const current = { chartData: this.chartTemplates.getChartData(), drawingData: this.serializeDrawings() };
        this.undoStack.push(current);
        const snapshot = this.redoStack.pop();
        this.chartTemplates.loadChartData(snapshot.chartData);
        this.restoreDrawings(snapshot.drawingData);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new CitranaApp();
}); 