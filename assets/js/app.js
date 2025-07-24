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
        
        // Safari-specific configuration for better drag and drop
        this.stage.draggable(false); // Disable stage dragging by default
        this.stage.on('dragstart', (e) => {
            // Prevent stage dragging when dragging planets
            if (e.target && e.target.name() && e.target.name().startsWith('planet-')) {
                e.evt.preventDefault();
            }
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
            
            // Hide Edit UI if clicking outside of it
            if (this.drawingTools.editUI && this.drawingTools.editUI.isEditUIVisible()) {
                this.drawingTools.editUI.hide();
            }
            
            // Cancel planet editing if clicking outside of editing areas
            if (this.drawingTools.isEditingPlanet) {
                this.drawingTools.cancelPlanetEditing();
            }
            
            this.handleMouseDown(e);
        });
        this.stage.on('mousemove', (e) => this.handleMouseMove(e));
        this.stage.on('mouseup', (e) => this.handleMouseUp(e));
        this.stage.on('wheel', (e) => this.handleWheel(e));
        
        // Touch events for mobile
        this.stage.on('touchstart', (e) => this.handleTouchStart(e));
        this.stage.on('touchmove', (e) => this.handleTouchMove(e));
        this.stage.on('touchend', (e) => this.handleTouchEnd(e));

        // Safari-specific fix for toolbar visibility
        this.setupSafariToolbarFix();

        // Window resize
        window.addEventListener('resize', () => this.handleResize());

        console.log('Event listeners setup complete');
    }
    
    /**
     * Setup Safari-specific fix to ensure toolbar remains visible
     */
    setupSafariToolbarFix() {
        // Only apply Safari-specific fixes
        if (!this.isTouchDevice()) return;
        
        const toolbar = document.querySelector('.floating-top-toolbar');
        const editUI = document.querySelector('.floating-edit-ui');
        const textEditControls = document.querySelector('.floating-text-edit-controls');
        
        // Fix UI elements visibility after focus events (keyboard dismissal)
        const fixUIElementsVisibility = () => {
            setTimeout(() => {
                // Fix top toolbar - always visible
                if (toolbar) {
                    toolbar.style.visibility = 'visible';
                    toolbar.style.opacity = '1';
                    // Don't force display - let existing CSS control it
                    console.log('[SAFARI] Top toolbar visibility restored');
                }
                
                // Fix floating edit UI - only if it should be visible
                if (editUI && editUI.style.display !== 'none') {
                    editUI.style.visibility = 'visible';
                    editUI.style.opacity = '1';
                    // Don't force display - let JavaScript control it
                    console.log('[SAFARI] Floating Edit UI visibility restored');
                }
                
                // Fix floating text edit controls - only if it should be visible
                if (textEditControls && textEditControls.style.display !== 'none') {
                    textEditControls.style.visibility = 'visible';
                    textEditControls.style.opacity = '1';
                    // Don't force display - let JavaScript control it
                    console.log('[SAFARI] Text Edit Controls visibility restored');
                    
                    // Fix individual planet text edit input elements
                    const textEditInput = document.getElementById('text-edit-input');
                    const textEditColor = document.getElementById('text-edit-color');
                    const textEditButtons = textEditControls.querySelectorAll('button');
                    
                    if (textEditInput) {
                        textEditInput.style.visibility = 'visible';
                        textEditInput.style.opacity = '1';
                        // Don't force display - let existing CSS control it
                    }
                    
                    if (textEditColor) {
                        textEditColor.style.visibility = 'visible';
                        textEditColor.style.opacity = '1';
                        // Don't force display - let existing CSS control it
                    }
                    
                    textEditButtons.forEach(button => {
                        button.style.visibility = 'visible';
                        button.style.opacity = '1';
                        // Don't force display - let existing CSS control it
                    });
                    
                    console.log('[SAFARI] Planet text edit input elements restored');
                }
            }, 100);
        };
        
        // Listen for focus events that might indicate keyboard dismissal
        document.addEventListener('focusin', fixUIElementsVisibility);
        document.addEventListener('focusout', fixUIElementsVisibility);
        
        // Listen for window resize events (Safari sometimes triggers these)
        window.addEventListener('resize', fixUIElementsVisibility);
        
        // Listen for scroll events (Safari sometimes hides elements during scroll)
        window.addEventListener('scroll', fixUIElementsVisibility);
        
        // Periodic check to ensure UI elements are visible
        setInterval(() => {
            // Check top toolbar - always should be visible
            if (toolbar && (toolbar.style.visibility === 'hidden' || toolbar.style.display === 'none')) {
                fixUIElementsVisibility();
            }
            
            // Check floating edit UI - only if it should be visible
            if (editUI && editUI.style.display !== 'none' && (editUI.style.visibility === 'hidden' || editUI.style.opacity === '0')) {
                fixUIElementsVisibility();
            }
            
            // Check floating text edit controls - only if it should be visible
            if (textEditControls && textEditControls.style.display !== 'none' && (textEditControls.style.visibility === 'hidden' || textEditControls.style.opacity === '0')) {
                fixUIElementsVisibility();
            }
        }, 2000);
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
            
            // Zoom shortcuts
            if (e.key === '+' || e.key === '=') {
                e.preventDefault();
                this.zoomIn();
            } else if (e.key === '-') {
                e.preventDefault();
                this.zoomOut();
            } else if (e.key === '0') {
                e.preventDefault();
                this.chartTemplates.zoomToFit();
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
        
        // Update cursor and touch behavior
        const container = document.getElementById('canvas-container');
        if (tool === 'hand') {
            container.style.cursor = 'grab';
            // Don't enable draggable here - only enable it during touch/mouse down
        } else if (tool === 'select') {
            container.style.cursor = 'default';
            // Ensure stage is not draggable when switching to select tool
            this.stage.draggable(false);
        } else {
            container.style.cursor = 'crosshair';
            // Ensure stage is not draggable for drawing tools
            this.stage.draggable(false);
        }
        
        console.log(`Tool set to: ${tool}`);
    }

    handleMouseDown(e) {
        const pos = this.drawingTools.getPrecisePositionFromKonva(e);
        
        if (this.currentTool === 'hand') {
            // Safari-specific: Ensure stage is draggable for hand tool
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
            // Safari-specific: Disable stage dragging when hand tool is released
            this.stage.draggable(false);
            document.getElementById('canvas-container').style.cursor = 'grab';
        } else if (this.currentTool === 'select') {
            this.drawingTools.handleSelectMouseUp();
        } else {
            this.isDrawing = false;
            this.drawingTools.stopDrawing();
        }
    }
    
    /**
     * Handle touch start events for mobile
     * @param {KonvaEvent} e - Konva touch event
     */
    handleTouchStart(e) {
        // Prevent default to avoid browser gestures
        e.evt.preventDefault();
        
        if (this.currentTool === 'hand') {
            // Enable stage dragging for hand tool
            this.stage.draggable(true);
            document.getElementById('canvas-container').style.cursor = 'grabbing';
        } else if (this.currentTool === 'select') {
            const pos = this.drawingTools.getPrecisePositionFromKonva(e);
            this.drawingTools.handleSelectTouchDown(pos, e);
        } else {
            // For drawing tools, use the existing touch handling
            const pos = this.drawingTools.getPrecisePositionFromKonva(e);
            if (pos) {
                this.isDrawing = true;
                this.lastPoint = pos;
                this.drawingTools.startDrawing(pos, this.currentTool);
            }
        }
    }
    
    /**
     * Handle touch move events for mobile
     * @param {KonvaEvent} e - Konva touch event
     */
    handleTouchMove(e) {
        // Prevent default to avoid browser gestures
        e.evt.preventDefault();
        
        if (this.currentTool === 'select') {
            const pos = this.drawingTools.getPrecisePositionFromKonva(e);
            this.drawingTools.handleSelectMouseMove(pos);
        } else if (this.isDrawing) {
            const pos = this.drawingTools.getPrecisePositionFromKonva(e);
            if (pos) {
                this.drawingTools.draw(pos, this.currentTool);
                this.lastPoint = pos;
            }
        }
        // Hand tool panning is handled automatically by Konva's draggable
    }
    
    /**
     * Handle touch end events for mobile
     * @param {KonvaEvent} e - Konva touch event
     */
    handleTouchEnd(e) {
        // Prevent default to avoid browser gestures
        e.evt.preventDefault();
        
        if (this.currentTool === 'hand') {
            // Disable stage dragging when hand tool is released
            this.stage.draggable(false);
            document.getElementById('canvas-container').style.cursor = 'grab';
        } else if (this.currentTool === 'select') {
            this.drawingTools.handleSelectTouchUp();
        } else {
            this.isDrawing = false;
            this.drawingTools.stopDrawing();
        }
    }

    handleWheel(e) {
        // Allow pinch-to-zoom on mobile devices
        if (this.isTouchDevice()) {
            // Don't prevent default on mobile to allow browser pinch-to-zoom
            return;
        }
        
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
    
    isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
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
        if (this.redoStack.length > 0) {
            const drawingData = this.redoStack.pop();
            this.undoStack.push(this.serializeDrawings());
            this.restoreDrawings(drawingData);
            console.log('Redo performed');
        }
    }

    zoomIn() {
        const scaleBy = 1.2;
        const oldScale = this.stage.scaleX();
        const newScale = oldScale * scaleBy;
        
        if (newScale <= 5) { // Max zoom limit
            // Get the center of the stage
            const stageCenter = {
                x: this.stage.width() / 2,
                y: this.stage.height() / 2
            };
            
            const mousePointTo = {
                x: (stageCenter.x - this.stage.x()) / oldScale,
                y: (stageCenter.y - this.stage.y()) / oldScale
            };
            
            this.stage.scale({ x: newScale, y: newScale });
            
            const newPos = {
                x: stageCenter.x - mousePointTo.x * newScale,
                y: stageCenter.y - mousePointTo.y * newScale
            };
            this.stage.position(newPos);
            this.stage.batchDraw();
            
            this.updateZoomLevel();
        }
    }

    zoomOut() {
        const scaleBy = 0.8;
        const oldScale = this.stage.scaleX();
        const newScale = oldScale * scaleBy;
        
        if (newScale >= 0.1) { // Min zoom limit
            // Get the center of the stage
            const stageCenter = {
                x: this.stage.width() / 2,
                y: this.stage.height() / 2
            };
            
            const mousePointTo = {
                x: (stageCenter.x - this.stage.x()) / oldScale,
                y: (stageCenter.y - this.stage.y()) / oldScale
            };
            
            this.stage.scale({ x: newScale, y: newScale });
            
            const newPos = {
                x: stageCenter.x - mousePointTo.x * newScale,
                y: stageCenter.y - mousePointTo.y * newScale
            };
            this.stage.position(newPos);
            this.stage.batchDraw();
            
            this.updateZoomLevel();
        }
    }

    resetZoom() {
        this.stage.scale({ x: 1, y: 1 });
        this.stage.position({ x: 0, y: 0 });
        this.stage.batchDraw();
        this.updateZoomLevel();
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new CitranaApp();
}); 