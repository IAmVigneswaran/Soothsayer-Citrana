/**
 * drawing-tools.js
 * Citrana • https://github.com/IAmVigneswaran/Soothsayer-Citrana 
 * © 2025 Vigneswaran Rajkumar • Licensed under MIT License
 * Handles all drawing functionality with precise mouse positioning and control points
 */
class DrawingTools {
    constructor(stage, layer) {
        this.stage = stage;
        this.layer = layer;
        this.isDrawing = false;
        this.currentShape = null;
        this.currentTool = null;
        this.lastPoint = null;
        this.isTouchDevice = this.detectTouchDevice();
        this.selectedShape = null;
        this.isDragging = false;

        // Track editing state to prevent conflicts
        this.isEditingPlanet = false;
        this.currentlyEditingPlanet = null;
        this.planetEditSession = null;

        // Control points functionality
        this.controlPoints = {
            startPoint: null,
            endPoint: null
        };
        this.isDraggingControlPoint = false;
        this.draggedControlPoint = null;

        // Animation frame for bulletproof control point sync
        this.controlPointAnimationFrame = null;

        // Initialize Edit UI
        this.editUI = new EditUI();

        // Do NOT call setupTouchEvents(); let app.js handle all mobile touch events
    }

    // Start per-frame sync for control points
    startControlPointSyncLoop(shape) {
        if (!shape || !this.supportsControlPoints(shape)) return;
        this.stopControlPointSyncLoop();
        const sync = () => {
            if (this.selectedShape === shape && this.controlPoints.startPoint && this.controlPoints.endPoint) {
                if (!this.isDraggingControlPoint) {
                    this.updateControlPointsPosition(shape);
                }
                this.controlPointAnimationFrame = requestAnimationFrame(sync);
            }
        };
        this.controlPointAnimationFrame = requestAnimationFrame(sync);
    }

    // Stop per-frame sync
    stopControlPointSyncLoop() {
        if (this.controlPointAnimationFrame) {
            cancelAnimationFrame(this.controlPointAnimationFrame);
            this.controlPointAnimationFrame = null;
        }
    }

    detectTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    /**
     * Check if device is mobile
     */
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    /**
     * Get precise position from Konva event
     * @param {KonvaEvent} e - Konva event
     * @returns {Object} Precise position {x, y}
     */
    getPrecisePositionFromKonva(e) {
        const pos = this.stage.getPointerPosition();
        if (!pos) return null;

        // Account for stage transformations
        const scaleX = this.stage.scaleX();
        const scaleY = this.stage.scaleY();
        const stageX = this.stage.x();
        const stageY = this.stage.y();

        // Ensure we get pixel-perfect positioning
        const finalX = Math.round((pos.x - stageX) / scaleX * 100) / 100;
        const finalY = Math.round((pos.y - stageY) / scaleY * 100) / 100;

        return {
            x: finalX,
            y: finalY
        };
    }

    startDrawing(pos, tool) {
        if (!pos || !this.stage || !this.layer) return;

        // Validate position coordinates
        if (typeof pos.x !== 'number' || typeof pos.y !== 'number' ||
            isNaN(pos.x) || isNaN(pos.y)) {
            console.warn('Invalid position coordinates:', pos);
            return;
        }

        this.isDrawing = true;
        this.currentTool = tool;
        this.lastPoint = pos;

        switch (tool) {
            case 'arrow':
                this.startArrow(pos);
                break;
            case 'line':
                this.startLine(pos);
                break;
            case 'pen':
                this.startPen(pos);
                break;
            case 'text':
                this.startText(pos);
                break;
            case 'heading':
                this.startHeading(pos);
                break;
        }
    }

    draw(pos, tool) {
        if (!this.isDrawing || !this.currentShape || !pos) return;

        // Validate position coordinates
        if (typeof pos.x !== 'number' || typeof pos.y !== 'number' ||
            isNaN(pos.x) || isNaN(pos.y)) {
            console.warn('Invalid position coordinates in draw:', pos);
            return;
        }

        // Ensure minimum distance for smooth drawing
        if (this.lastPoint && this.getDistance(pos, this.lastPoint) < 1) {
            return;
        }

        switch (tool) {
            case 'arrow':
                this.updateArrow(pos);
                break;
            case 'line':
                this.updateLine(pos);
                break;
            case 'pen':
                this.updatePen(pos);
                break;
        }

        this.lastPoint = pos;
    }

    stopDrawing() {
        if (!this.isDrawing) return;

        // Store the current tool and shape before resetting state
        const completedTool = this.currentTool;
        const completedShape = this.currentShape;

        this.isDrawing = false;
        this.currentShape = null;
        this.currentTool = null;
        this.lastPoint = null;

        // Bind selection/drag handlers once when the stroke is complete (not per mousemove)
        if (completedShape && (completedTool === 'arrow' || completedTool === 'line' || completedTool === 'pen')) {
            this.makeShapeSelectable(completedShape, completedTool);
        }

        // Ensure the layer is updated
        this.layer.batchDraw();

        const drawLabels = {
            arrow: 'Draw arrow',
            line: 'Draw line',
            pen: 'Draw pen stroke',
            text: 'Add text',
            heading: 'Add heading'
        };
        if (completedTool && window.app?.recordHistory) {
            window.app.recordHistory(drawLabels[completedTool] || 'Draw');
        }

        // Auto-switch to Select Tool for Arrow and Line tools
        if (window.app && (completedTool === 'arrow' || completedTool === 'line')) {
            window.app.setTool('select');
        }

        console.log('Drawing stopped');
    }

    /**
     * Ensure drawing objects are properly selectable after creation
     * @param {KonvaShape} shape - The shape to make selectable
     * @param {string} [toolForTap] - Tool type for touch double-tap (when currentTool is already cleared)
     */
    makeShapeSelectable(shape, toolForTap = null) {
        if (!shape) return;

        // Ensure the shape is listening for events
        shape.setAttrs({
            listening: true,
            draggable: false // Will be enabled when select tool is active
        });

        // Add drag event handlers for shapes that support control points
        if (this.supportsControlPoints(shape)) {
            if (!shape._shapeDragHistoryBound) {
                shape._shapeDragHistoryBound = true;

                // Add dragmove handler to update control points when shape is dragged
                shape.on('dragmove', () => {
                    if (this.selectedShape === shape && this.controlPoints.startPoint && this.controlPoints.endPoint) {
                        this.updateControlPointsPosition(shape);
                    }
                });

                // Add dragend handler to add to undo stack and update control points
                shape.on('dragend', () => {
                    if (this.selectedShape === shape) {
                        this.updateControlPointsPosition(shape);
                        if (window.app?.recordHistory) {
                            window.app.recordHistory('Move drawing');
                        }
                    }
                });
            }
        }

        this.bindMoveDragHistory(shape);

        // Touch double-tap for Edit UI — bind once per shape
        if (this.isTouchDevice && !shape._editUiDoubleTapBound) {
            const tapTool = toolForTap ?? this.currentTool;
            setTimeout(() => {
                if (shape.getLayer()) {
                    this.addDoubleTapSupport(shape, tapTool);
                }
            }, 150);
        }
    }

    /**
     * Record undo step when pen strokes, text, or headings are repositioned by drag
     * @param {KonvaShape} shape - The shape being dragged
     */
    bindMoveDragHistory(shape) {
        if (!shape || shape._moveDragHistoryBound || this.supportsControlPoints(shape)) {
            return;
        }

        const name = shape.name() || '';
        const supportsMoveHistory = name.includes('drawing-pen') ||
            name === 'drawing-text' ||
            name === 'drawing-heading';
        if (!supportsMoveHistory) {
            return;
        }

        shape._moveDragHistoryBound = true;
        shape.on('dragend', () => {
            if (this.selectedShape === shape && window.app?.recordHistory) {
                window.app.recordHistory('Move drawing');
            }
        });
    }

    getDistance(pos1, pos2) {
        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    startArrow(pos) {
        const arrow = CitranaArrow.create({
            x1: pos.x,
            y1: pos.y,
            x2: pos.x,
            y2: pos.y
        });

        // Create invisible bounding box for easier selection
        const boundingBox = this.createBoundingBox(arrow, 'arrow');

        // Desktop click opens Edit UI; touch double-tap is bound in makeShapeSelectable when drawing completes
        arrow.on('click', () => {
            this.showEditUI(arrow, 'arrow');
        });

        this.currentShape = arrow;
        this.layer.add(arrow);
        this.layer.add(boundingBox);
        this.layer.batchDraw();
    }

    updateArrow(pos) {
        if (!this.currentShape) return;

        CitranaArrow.setAnchor(this.currentShape, 'end', pos.x, pos.y);

        // Update bounding box if it exists
        if (this.currentShape.boundingBox) {
            this.updateBoundingBox(this.currentShape.boundingBox, this.currentShape);
        }

        this.layer.batchDraw();
    }

    startLine(pos) {
        const line = new Konva.Line({
            points: [pos.x, pos.y, pos.x, pos.y],
            stroke: '#FF0000',
            strokeWidth: 5,
            name: 'drawing-line',
            perfectDrawEnabled: true,
            listening: true,
            draggable: false // Will be enabled when select tool is active
        });

        // Create invisible bounding box for easier selection
        const boundingBox = this.createBoundingBox(line, 'line');
        line.boundingBox = boundingBox;

        line.on('click', () => {
            this.showEditUI(line, 'line');
        });

        this.currentShape = line;
        this.layer.add(line);
        this.layer.add(boundingBox);
        this.layer.batchDraw();
    }

    updateLine(pos) {
        if (!this.currentShape) return;

        const points = this.currentShape.points();
        points[2] = pos.x;
        points[3] = pos.y;
        this.currentShape.points(points);

        // Update bounding box if it exists
        if (this.currentShape.boundingBox) {
            this.updateBoundingBox(this.currentShape.boundingBox, this.currentShape);
        }

        this.layer.batchDraw();
    }

    startPen(pos) {
        const line = new Konva.Line({
            points: [pos.x, pos.y],
            stroke: '#FF0000',
            strokeWidth: 5,
            lineCap: 'round',
            lineJoin: 'round',
            name: 'drawing-pen',
            perfectDrawEnabled: true,
            listening: true,
            draggable: false, // Will be enabled when select tool is active
            tension: 0.1 // Smooth curves
        });

        // Create invisible bounding box for easier selection
        const boundingBox = this.createBoundingBox(line, 'pen');
        line.boundingBox = boundingBox;

        line.on('click', (e) => {
            e.cancelBubble = true;
            this.showEditUI(line, 'pen');
        });

        this.currentShape = line;
        this.layer.add(line);
        this.layer.add(boundingBox);
        this.layer.batchDraw();
    }

    updatePen(pos) {
        if (!this.currentShape) return;

        const points = this.currentShape.points();
        points.push(pos.x, pos.y);
        this.currentShape.points(points);

        // Update bounding box if it exists
        if (this.currentShape.boundingBox) {
            this.updateBoundingBox(this.currentShape.boundingBox, this.currentShape);
        }

        this.layer.batchDraw();
    }

    startText(pos) {
        const text = new Konva.Text({
            x: pos.x,
            y: pos.y,
            text: 'Double-click to edit',
            fontSize: 16,
            fontFamily: 'Arial, sans-serif',
            fontWeight: 400,
            fontStyle: 'normal',
            fill: '#374151',
            draggable: true,
            name: 'drawing-text',
            listening: true,
            padding: 4
        });

        this.currentShape = text;
        this.layer.add(text);
        this.layer.batchDraw();

        // Make text editable immediately and on double-click
        this.makeTextEditable(text);
        this.makeShapeSelectable(text);

        // Add click handler for Edit UI
        text.on('click', (e) => {
            // Prevent event bubbling
            e.cancelBubble = true;

            // Show Edit UI (always show Edit UI on click)
            this.showEditUI(text, 'text');
        });

        // Add double-tap support for mobile Edit UI
        this.addDoubleTapSupport(text, 'text');

        // Auto-switch to select tool after creating text
        setTimeout(() => {
            if (window.app) {
                window.app.setTool('select');
            }
        }, 100);
    }

    makeTextEditable(text) {
        // Double-click to edit (desktop)
        text.on('dblclick', () => {
            this.editText(text);
        });

        // Double-tap to edit (mobile)
        let lastTap = 0;
        let tapCount = 0;
        let tapTimer = null;

        text.on('tap', (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;

            if (tapLength < 500 && tapLength > 0) {
                // Double tap detected
                tapCount++;
                if (tapCount === 2) {
                    clearTimeout(tapTimer);
                    tapCount = 0;
                    this.editText(text);
                }
            } else {
                tapCount = 1;
            }

            lastTap = currentTime;

            // Reset tap count after a delay
            if (tapTimer) clearTimeout(tapTimer);
            tapTimer = setTimeout(() => {
                tapCount = 0;
            }, 500);
        });
    }

    editText(text) {
        // Prevent multiple textareas
        const existingTextarea = document.querySelector('.konva-textarea');
        if (existingTextarea) {
            existingTextarea.remove();
        }

        // Get the absolute position of the text
        const textPosition = text.absolutePosition();
        const stageBox = this.stage.container().getBoundingClientRect();

        // Calculate position relative to viewport
        const areaPosition = {
            x: stageBox.left + textPosition.x,
            y: stageBox.top + textPosition.y
        };

        // Create textarea
        const textarea = document.createElement('textarea');
        textarea.className = 'konva-textarea';
        document.body.appendChild(textarea);

        // Set initial value
        const initialText = text.text();
        textarea.value = initialText === 'Double-click to edit' ? '' : initialText;

        // Style the textarea
        textarea.style.position = 'absolute';
        textarea.style.top = areaPosition.y + 'px';
        textarea.style.left = areaPosition.x + 'px';
        textarea.style.width = Math.max(100, text.width()) + 'px';
        // Apply canvas scale to font size and height for editing precision
        const scale = this.stage.scaleX();
        const scaledFontSize = text.fontSize() * scale;
        textarea.style.fontSize = '16px'; // Prevent mobile zoom
        textarea.style.lineHeight = scaledFontSize + 'px';
        textarea.style.height = (scaledFontSize + 4) + 'px';
        textarea.style.fontFamily = text.fontFamily();
        textarea.style.color = text.fill();
        textarea.style.border = 'none';
        textarea.style.borderRadius = '0px';
        textarea.style.padding = '0px';
        textarea.style.margin = '0px';
        textarea.style.background = 'transparent';
        textarea.style.outline = 'none';
        textarea.style.resize = 'none';
        textarea.style.zIndex = '10000';
        textarea.style.boxShadow = 'none';
        // Remove transform scaling for caret precision
        textarea.style.transform = '';
        textarea.style.transformOrigin = '';
        textarea.style.touchAction = 'manipulation';
        textarea.style.WebkitTouchAction = 'manipulation';

        // Focus and select all text
        textarea.focus();
        textarea.select();

        // Disable dragging while editing and hide the original text
        text.setAttrs({
            draggable: false,
            visible: false // Hide the original text while editing
        });

        let finished = false;

        const finishEditing = (save = true) => {
            if (finished) {
                return;
            }
            finished = true;

            const committedText = save ?
                (textarea.value.trim() || 'Double-click to edit') :
                initialText;
            text.text(committedText);

            textarea.remove();
            text.setAttrs({
                draggable: true,
                visible: true
            });
            this.layer.batchDraw();

            if (save && committedText !== initialText) {
                window.app?.recordHistory('Edit text');
            }

            textarea.removeEventListener('blur', handleBlur);
            document.removeEventListener('click', handleOutsideClick);
            document.removeEventListener('keydown', handleKeyDown);
        };

        const handleKeyDown = (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                finishEditing(true);
            } else if (e.key === 'Escape') {
                e.preventDefault();
                finishEditing(false);
            }
        };

        const handleOutsideClick = (e) => {
            if (e.target !== textarea) {
                finishEditing(true);
            }
        };

        const handleBlur = () => finishEditing(true);

        textarea.addEventListener('blur', handleBlur);
        document.addEventListener('keydown', handleKeyDown);

        setTimeout(() => {
            document.addEventListener('click', handleOutsideClick);
        }, 100);
    }

    clearAll() {
        const drawingObjects = this.layer.find(node => {
            const name = node.name();
            return name && (name.startsWith('drawing-') || name.startsWith('bounding-box-'));
        });

        drawingObjects.forEach(shape => {
            shape.destroy();
        });

        this.clearSelection();
        this.clearControlPoints();
        this.layer.batchDraw();
    }

    restorePersistedDrawings(drawingData) {
        this.clearAll();
        if (!Array.isArray(drawingData) || drawingData.length === 0) {
            return;
        }

        drawingData.forEach((obj) => {
            let shape = Konva.Node.create(obj);
            const shapeName = shape.name();

            if (shapeName && shapeName.startsWith('bounding-box-')) {
                return;
            }

            if (shape instanceof Konva.Arrow) {
                shape = CitranaArrow.fromLegacyNode(shape);
            }

            if (obj.attrs?.points && typeof shape.points === 'function' && !CitranaArrow.isArrow(shape)) {
                shape.points(obj.attrs.points.slice());
            }

            if (CitranaArrow.isArrow(shape)) {
                if (obj.attrs?.arrowAnchors) {
                    shape.setAttr('arrowAnchors', obj.attrs.arrowAnchors.slice(0, 4));
                }
                if (obj.attrs?.arrowStrokeWidth !== undefined) {
                    shape.setAttr('arrowStrokeWidth', obj.attrs.arrowStrokeWidth);
                }
                if (obj.attrs?.arrowPointerLength !== undefined) {
                    shape.setAttr('arrowPointerLength', obj.attrs.arrowPointerLength);
                }
                if (obj.attrs?.arrowPointerWidth !== undefined) {
                    shape.setAttr('arrowPointerWidth', obj.attrs.arrowPointerWidth);
                }
                CitranaArrow.rebuild(shape);
                CitranaColorPicker.applyToKonvaArrow(shape, CitranaColorPicker.fromKonvaShape(shape));
            }
            if (obj.attrs?.x !== undefined && typeof shape.x === 'function') {
                shape.x(obj.attrs.x);
            }
            if (obj.attrs?.y !== undefined && typeof shape.y === 'function') {
                shape.y(obj.attrs.y);
            }
            if (obj.attrs?.text !== undefined && typeof shape.text === 'function') {
                shape.text(obj.attrs.text);
            }

            this.layer.add(shape);

            if (shapeName === 'drawing-arrow' || shapeName === 'drawing-line' || shapeName === 'drawing-pen') {
                const toolType = shapeName.replace('drawing-', '');
                const boundingBox = this.createBoundingBox(shape, toolType);
                this.layer.add(boundingBox);
            }

            shape.on('click tap', (e) => {
                e.cancelBubble = true;
                this.showEditUIForShape(shape);
            });
            this.makeShapeSelectable(shape);
        });

        this.layer.batchDraw();
    }

    /**
     * Create control points for arrow or line shapes
     * @param {KonvaObject} shape - The shape to add control points to
     */
    createControlPoints(shape) {
        if (!shape || !shape.points) return;

        const points = CitranaArrow.isArrow(shape)
            ? CitranaArrow.getControlPoints(shape)
            : shape.points();
        if (points.length < 4) return; // Need at least start and end points

        // Clear existing control points
        this.clearControlPoints();

        // Create start control point
        this.controlPoints.startPoint = new Konva.Circle({
            x: points[0],
            y: points[1],
            radius: 6,
            fill: '#ffffff',
            stroke: '#000000',
            strokeWidth: 2,
            name: 'control-point-start',
            listening: true,
            draggable: true
        });

        // Create end control point
        this.controlPoints.endPoint = new Konva.Circle({
            x: points[2],
            y: points[3],
            radius: 6,
            fill: '#ffffff',
            stroke: '#000000',
            strokeWidth: 2,
            name: 'control-point-end',
            listening: true,
            draggable: true
        });

        // Add drag event handlers for start point
        this.controlPoints.startPoint.on('dragstart', () => {
            this.isDraggingControlPoint = true;
            this.draggedControlPoint = 'start';
            shape._cpDragStartPoints = CitranaArrow.isArrow(shape)
                ? CitranaArrow.getAnchors(shape).slice()
                : shape.points().slice();
        });

        this.controlPoints.startPoint.on('dragmove', () => {
            if (this.isDraggingControlPoint && this.selectedShape) {
                // Get the control point position in stage coordinates
                const controlX = this.controlPoints.startPoint.x();
                const controlY = this.controlPoints.startPoint.y();

                // Convert to shape's local coordinates
                const shapeX = this.selectedShape.x();
                const shapeY = this.selectedShape.y();
                const scaleX = this.selectedShape.scaleX();
                const scaleY = this.selectedShape.scaleY();
                const rotation = this.selectedShape.rotation();

                // Remove shape's position offset
                let localX = controlX - shapeX;
                let localY = controlY - shapeY;

                // Apply inverse rotation if any
                if (rotation !== 0) {
                    const cos = Math.cos(-rotation * Math.PI / 180);
                    const sin = Math.sin(-rotation * Math.PI / 180);

                    const rotatedX = localX * cos - localY * sin;
                    const rotatedY = localX * sin + localY * cos;

                    localX = rotatedX;
                    localY = rotatedY;
                }

                // Apply inverse scale
                localX = localX / scaleX;
                localY = localY / scaleY;

                // Update shape points
                if (CitranaArrow.isArrow(this.selectedShape)) {
                    CitranaArrow.setAnchor(this.selectedShape, 'start', localX, localY);
                } else {
                    const newPoints = this.selectedShape.points();
                    newPoints[0] = localX;
                    newPoints[1] = localY;
                    this.selectedShape.points(newPoints);
                }

                // Update bounding box if it exists
                if (this.selectedShape.boundingBox) {
                    this.updateBoundingBox(this.selectedShape.boundingBox, this.selectedShape);
                }

                this.layer.batchDraw();
            }
        });

        this.controlPoints.startPoint.on('dragend', () => {
            this.commitControlPointAdjust(shape);
        });

        // Add drag event handlers for end point
        this.controlPoints.endPoint.on('dragstart', () => {
            this.isDraggingControlPoint = true;
            this.draggedControlPoint = 'end';
            shape._cpDragStartPoints = CitranaArrow.isArrow(shape)
                ? CitranaArrow.getAnchors(shape).slice()
                : shape.points().slice();
        });

        this.controlPoints.endPoint.on('dragmove', () => {
            if (this.isDraggingControlPoint && this.selectedShape) {
                // Get the control point position in stage coordinates
                const controlX = this.controlPoints.endPoint.x();
                const controlY = this.controlPoints.endPoint.y();

                // Convert to shape's local coordinates
                const shapeX = this.selectedShape.x();
                const shapeY = this.selectedShape.y();
                const scaleX = this.selectedShape.scaleX();
                const scaleY = this.selectedShape.scaleY();
                const rotation = this.selectedShape.rotation();

                // Remove shape's position offset
                let localX = controlX - shapeX;
                let localY = controlY - shapeY;

                // Apply inverse rotation if any
                if (rotation !== 0) {
                    const cos = Math.cos(-rotation * Math.PI / 180);
                    const sin = Math.sin(-rotation * Math.PI / 180);

                    const rotatedX = localX * cos - localY * sin;
                    const rotatedY = localX * sin + localY * cos;

                    localX = rotatedX;
                    localY = rotatedY;
                }

                // Apply inverse scale
                localX = localX / scaleX;
                localY = localY / scaleY;

                // Update shape points
                if (CitranaArrow.isArrow(this.selectedShape)) {
                    CitranaArrow.setAnchor(this.selectedShape, 'end', localX, localY);
                } else {
                    const newPoints = this.selectedShape.points();
                    newPoints[2] = localX;
                    newPoints[3] = localY;
                    this.selectedShape.points(newPoints);
                }

                // Update bounding box if it exists
                if (this.selectedShape.boundingBox) {
                    this.updateBoundingBox(this.selectedShape.boundingBox, this.selectedShape);
                }

                this.layer.batchDraw();
            }
        });

        this.controlPoints.endPoint.on('dragend', () => {
            this.commitControlPointAdjust(shape);
        });

        // Add control points to layer
        this.updateControlPointsPosition(shape);
        this.layer.add(this.controlPoints.startPoint);
        this.layer.add(this.controlPoints.endPoint);
        this.layer.batchDraw();
    }

    /**
     * Clear control points
     */
    clearControlPoints() {
        if (this.controlPoints.startPoint) {
            this.controlPoints.startPoint.destroy();
            this.controlPoints.startPoint = null;
        }
        if (this.controlPoints.endPoint) {
            this.controlPoints.endPoint.destroy();
            this.controlPoints.endPoint = null;
        }
        this.isDraggingControlPoint = false;
        this.draggedControlPoint = null;
    }

    /**
     * Update control points position when shape is moved
     * @param {KonvaObject} shape - The shape to update control points for
     */
    updateControlPointsPosition(shape) {
        if (!shape || !shape.points || !this.controlPoints.startPoint || !this.controlPoints.endPoint) return;

        const points = CitranaArrow.isArrow(shape)
            ? CitranaArrow.getControlPoints(shape)
            : shape.points();
        if (points.length < 4) return;

        // Get the shape's transformation matrix
        const transform = shape.getTransform();

        // Calculate the actual position of the shape
        const shapeX = shape.x();
        const shapeY = shape.y();
        const scaleX = shape.scaleX();
        const scaleY = shape.scaleY();
        const rotation = shape.rotation();

        // Apply transformation to the points
        const startPoint = {
            x: points[0] * scaleX,
            y: points[1] * scaleY
        };

        const endPoint = {
            x: points[2] * scaleX,
            y: points[3] * scaleY
        };

        // Apply rotation if any
        if (rotation !== 0) {
            const cos = Math.cos(rotation * Math.PI / 180);
            const sin = Math.sin(rotation * Math.PI / 180);

            const rotatedStartX = startPoint.x * cos - startPoint.y * sin;
            const rotatedStartY = startPoint.x * sin + startPoint.y * cos;
            const rotatedEndX = endPoint.x * cos - endPoint.y * sin;
            const rotatedEndY = endPoint.x * sin + endPoint.y * cos;

            startPoint.x = rotatedStartX;
            startPoint.y = rotatedStartY;
            endPoint.x = rotatedEndX;
            endPoint.y = rotatedEndY;
        }

        // Add the shape's position offset
        this.controlPoints.startPoint.x(shapeX + startPoint.x);
        this.controlPoints.startPoint.y(shapeY + startPoint.y);
        this.controlPoints.endPoint.x(shapeX + endPoint.x);
        this.controlPoints.endPoint.y(shapeY + endPoint.y);

        this.layer.batchDraw();
    }

    /**
     * Check if a shape supports control points
     * @param {KonvaObject} shape - The shape to check
     * @returns {boolean} True if shape supports control points
     */
    supportsControlPoints(shape) {
        if (!shape || !shape.name()) {
            return false;
        }
        return shape.name().includes('drawing-arrow') || shape.name().includes('drawing-line');
    }

    pointsChanged(before, after) {
        if (!before || !after || before.length !== after.length) {
            return true;
        }
        return before.some((value, index) => value !== after[index]);
    }

    commitControlPointAdjust(shape) {
        this.isDraggingControlPoint = false;
        this.draggedControlPoint = null;

        const startPoints = shape?._cpDragStartPoints;
        const endPoints = CitranaArrow.isArrow(shape)
            ? CitranaArrow.getAnchors(shape).slice()
            : (shape?.points?.() ? shape.points().slice() : null);
        shape._cpDragStartPoints = null;

        if (startPoints && endPoints && this.pointsChanged(startPoints, endPoints)) {
            window.app?.recordHistory('Adjust drawing');
        }
    }

    /**
     * Set the current tool
     * @param {string} tool - Tool name
     */
    setTool(tool) {
        this.currentTool = tool;

        // Clear selection when switching tools
        this.clearSelection();

        // Enable/disable dragging for all drawing objects based on tool
        this.updateDrawingObjectsDraggable(tool === 'select');
    }

    /**
     * Update draggable state for all drawing objects
     * @param {boolean} draggable - Whether objects should be draggable
     */
    updateDrawingObjectsDraggable(draggable) {
        const drawingObjects = this.layer.find(node =>
            node.name() && node.name().startsWith('drawing-')
        );

        drawingObjects.forEach(obj => {
            obj.draggable(draggable);
        });

        console.log(`Updated ${drawingObjects.length} drawing objects to draggable: ${draggable}`);
    }

    /**
     * Clear current selection
     */
    clearSelection() {
        this.stopControlPointSyncLoop();
        if (this.selectedShape) {
            this.selectedShape = null;
        }
        this.clearControlPoints();
        this.layer.batchDraw();
    }

    /**
     * Select a drawing object
     * @param {KonvaObject} shape - The shape to select
     */
    selectShape(shape) {
        this.clearSelection();

        if (shape && shape.name() && shape.name().startsWith('drawing-')) {
            this.selectedShape = shape;

            // Show control points for arrow and line shapes
            if (this.supportsControlPoints(shape)) {
                this.createControlPoints(shape);
                this.updateControlPointsPosition(shape); // Immediate sync
                this.startControlPointSyncLoop(shape); // Per-frame sync
            }

            // No visual selection indicator - just track the selected shape
            this.layer.batchDraw();
        }
    }

    /**
     * Handle mouse down for select tool (desktop)
     * @param {Object} pos - Mouse position
     * @param {KonvaEvent} e - Konva event
     */
    handleSelectMouseDown(pos, e) {
        if (!pos) return;

        const clickedShape = e.target;

        // Check if clicked on a control point
        if (clickedShape && (
                clickedShape.name() === 'control-point-start' ||
                clickedShape.name() === 'control-point-end'
            )) {
            // Let the control point handle its own dragging
            return;
        }

        // Check if clicked on a drawing object or its bounding box
        if (clickedShape && (
                (clickedShape.name() && clickedShape.name().startsWith('drawing-')) ||
                (clickedShape.name() && clickedShape.name().startsWith('bounding-box-'))
            )) {
            // If clicked on bounding box, get the actual shape
            let actualShape = clickedShape;
            if (clickedShape.name().startsWith('bounding-box-')) {
                // Use the direct relationship instead of searching
                actualShape = clickedShape.actualShape;
            }

            if (actualShape) {
                this.selectShape(actualShape);
                this.isDragging = true;
            }
        } else {
            // Clicked on empty space, clear selection
            this.clearSelection();
        }
    }

    /**
     * Handle touch down for select tool (mobile)
     * @param {Object} pos - Touch position
     * @param {KonvaEvent} e - Konva event
     */
    handleSelectTouchDown(pos, e) {
        if (!pos) return;

        const clickedShape = e.target;

        // Check if clicked on a control point
        if (clickedShape && (
                clickedShape.name() === 'control-point-start' ||
                clickedShape.name() === 'control-point-end'
            )) {
            // Let the control point handle its own dragging
            return;
        }

        // Check if clicked on a drawing object or its bounding box
        if (clickedShape && (
                (clickedShape.name() && clickedShape.name().startsWith('drawing-')) ||
                (clickedShape.name() && clickedShape.name().startsWith('bounding-box-'))
            )) {
            // If clicked on bounding box, get the actual shape
            let actualShape = clickedShape;
            if (clickedShape.name().startsWith('bounding-box-')) {
                // Use the direct relationship instead of searching
                actualShape = clickedShape.actualShape;
            }

            if (actualShape) {
                this.selectShape(actualShape);
                this.isDragging = true;

                // Add double-tap detection for Edit UI
                this.setupDoubleTapForEditUI(actualShape);
            }
        } else {
            // Clicked on empty space, clear selection
            this.clearSelection();
        }
    }

    /**
     * Handle touch up for select tool
     */
    handleSelectTouchUp() {
        this.isDragging = false;
    }

    /**
     * Setup double-tap detection for showing Edit UI
     * @param {KonvaObject} shape - The shape to monitor
     */
    setupDoubleTapForEditUI(shape) {
        if (shape._editUiDoubleTapBound) return;
        shape._editUiDoubleTapBound = true;

        let lastTap = 0;
        let tapCount = 0;
        let tapTimer = null;

        const handleTap = (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;

            if (tapLength < 500 && tapLength > 0) {
                // Double tap detected
                tapCount++;
                if (tapCount === 2) {
                    clearTimeout(tapTimer);
                    tapCount = 0;
                    this.showEditUIForShape(shape);
                }
            } else {
                tapCount = 1;
            }

            lastTap = currentTime;

            // Reset tap count after a delay
            if (tapTimer) clearTimeout(tapTimer);
            tapTimer = setTimeout(() => {
                tapCount = 0;
            }, 500);
        };

        // Add tap event listener
        shape.on('tap', handleTap);

        // Store the handler for cleanup
        shape._tapHandler = handleTap;
    }

    /**
     * Show Edit UI for a specific shape
     * @param {KonvaObject} shape - The shape to show Edit UI for
     */
    showEditUIForShape(shape) {
        if (!shape || !shape.name()) return;

        // Determine tool type from shape name
        let toolType = 'text'; // default
        if (shape.name().includes('drawing-arrow')) {
            toolType = 'arrow';
        } else if (shape.name().includes('drawing-line')) {
            toolType = 'line';
        } else if (shape.name().includes('drawing-pen')) {
            toolType = 'pen';
        } else if (shape.name().includes('drawing-heading')) {
            toolType = 'heading';
        } else if (shape.name().includes('drawing-text')) {
            toolType = 'text';
        }

        // Show Edit UI
        if (this.editUI) {
            this.editUI.hide();
            // Set up delete callback to properly handle control points
            this.editUI.onDelete = (element) => {
                // Set the selected shape to the element being deleted
                this.selectedShape = element;
                // Use the existing deleteSelectedShape method which properly handles control points
                this.deleteSelectedShape();
            };
            this.editUI.show(shape, toolType);
        }
    }

    /**
     * Handle mouse move for select tool
     * @param {Object} pos - Mouse position
     */
    handleSelectMouseMove(pos) {
        // Dragging is handled automatically by Konva when draggable is true
        // This method can be used for additional selection behavior if needed
    }

    /**
     * Handle mouse up for select tool
     */
    handleSelectMouseUp() {
        this.isDragging = false;
    }

    /**
     * Delete the currently selected shape
     */
    deleteSelectedShape() {
        if (!this.selectedShape) return;

        this.clearControlPoints();

        // Remove bounding box if it exists
        if (this.selectedShape.boundingBox) {
            this.selectedShape.boundingBox.destroy();
        }

        // Remove the shape
        this.selectedShape.destroy();
        this.selectedShape = null;

        // Hide Edit UI
        if (this.editUI) {
            this.editUI._skipHistoryOnHide = true;
            this.editUI.hide();
        }

        this.layer.batchDraw();

        // Trigger snapshot for undo/redo
        if (window.app?.recordHistory) {
            window.app.recordHistory('Delete drawing');
        }
    }

    /**
     * Make Graha text editable with live preview
     * @param {KonvaText} planetText - The Graha text object
     * @param {Function} onUpdate - Callback function to update the Graha label
     */
    makePlanetTextEditable(planetText, onUpdate) {
        // Double-click to edit Graha text (desktop)
        planetText.on('dblclick', () => {
            // Prevent multiple editing sessions
            if (this.isEditingPlanet) {
                citranaDebug('Already editing a Graha, ignoring double-click');
                return;
            }
            this.editPlanetText(planetText, onUpdate);
        });

        // Double-tap to edit Graha text (mobile)
        let lastTap = 0;
        let tapCount = 0;
        let tapTimer = null;

        planetText.on('tap', (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;

            if (tapLength < 500 && tapLength > 0) {
                // Double tap detected
                tapCount++;
                if (tapCount === 2) {
                    clearTimeout(tapTimer);
                    tapCount = 0;

                    // Prevent multiple editing sessions
                    if (this.isEditingPlanet) {
                        citranaDebug('Already editing a Graha, ignoring double-tap');
                        return;
                    }

                    this.editPlanetText(planetText, onUpdate);
                }
            } else {
                tapCount = 1;
            }

            lastTap = currentTime;

            // Reset tap count after a delay
            if (tapTimer) clearTimeout(tapTimer);
            tapTimer = setTimeout(() => {
                tapCount = 0;
            }, 500);
        });
    }

    /**
     * Edit Graha text using the floating UI
     * @param {KonvaText} planetText - The Graha text object
     * @param {Function} onUpdate - Callback function to update the Graha label
     */
    editPlanetText(planetText, onUpdate) {
        const textEditControls = document.getElementById('text-edit-controls');
        if (textEditControls && textEditControls.style.display === 'flex') {
            citranaDebug('Text edit controls already visible, ignoring edit request');
            return;
        }

        const textEditInput = document.getElementById('text-edit-input');
        const textEditColor = document.getElementById('text-edit-color');
        const saveButton = document.getElementById('text-edit-save');
        const cancelButton = document.getElementById('text-edit-cancel');
        const deleteButton = document.getElementById('text-edit-delete');
        const retrogradeButton = document.getElementById('text-edit-retrograde');

        if (!textEditControls || !textEditInput || !textEditColor || !saveButton || !cancelButton) {
            console.error('Text edit UI elements not found');
            return;
        }

        const initialText = planetText.text().replace(/ᵣ/g, '');
        const initialColor = planetText.fill() || '#000000';
        const initialRetrograde = planetText.textDecoration() === 'underline' || planetText.text().includes('ᵣ');
        let retrogradeState = initialRetrograde;
        let sessionDirty = false;

        const editingPlanetText = planetText;

        const markSessionDirty = () => {
            sessionDirty = true;
        };

        const restoreInitialAppearance = () => {
            editingPlanetText.text(initialText);
            editingPlanetText.fill(initialColor);
            editingPlanetText.textDecoration(initialRetrograde ? 'underline' : '');
            this.layer.batchDraw();
        };

        const removeSessionListeners = () => {
            saveButton.removeEventListener('click', handleSave);
            cancelButton.removeEventListener('click', handleCancel);
            textEditInput.removeEventListener('keydown', handleKeyDown);
            textEditInput.removeEventListener('input', handleInput);
            CitranaColorPicker.setGrahaPickCallback(null);
            if (deleteButton) {
                deleteButton.removeEventListener('click', handleDelete);
            }
            if (retrogradeButton && handleRetrograde) {
                retrogradeButton.removeEventListener('click', handleRetrograde);
            }
        };

        const teardownSession = () => {
            removeSessionListeners();
            textEditControls.style.display = 'none';
            if (textEditInput) {
                textEditInput.style.textDecoration = 'none';
            }
            editingPlanetText.draggable(true);
            this.isEditingPlanet = false;
            this.currentlyEditingPlanet = null;
            this.planetEditSession = null;
        };

        const finishEditing = (save = false) => {
            if (!this.planetEditSession) {
                return;
            }

            const wasDirty = sessionDirty;
            removeSessionListeners();
            this.planetEditSession = null;
            textEditControls.style.display = 'none';

            if (save && wasDirty) {
                const newText = textEditInput.value.trim();
                const newColor = CitranaColorPicker.getValue(textEditColor);
                if (newText && newText.length <= 8) {
                    if (onUpdate) {
                        onUpdate(newText, newColor, retrogradeState);
                    }
                    window.app?.recordHistory('Edit Graha');
                } else {
                    restoreInitialAppearance();
                }
            } else if (!save) {
                restoreInitialAppearance();
            }

            if (textEditInput) {
                textEditInput.style.textDecoration = 'none';
            }

            editingPlanetText.draggable(true);
            this.isEditingPlanet = false;
            this.currentlyEditingPlanet = null;
        };

        const handleSave = () => finishEditing(true);
        const handleCancel = () => finishEditing(false);

        const handleDelete = () => {
            teardownSession();

            if (editingPlanetText._planetHouseNumber !== undefined && editingPlanetText._planetId !== undefined && window.app?.chartTemplates) {
                const chartType = window.app.chartTemplates.currentChartType;
                if (chartType === 'south-indian' && window.app.chartTemplates.southIndianTemplate) {
                    window.app.chartTemplates.southIndianTemplate.removePlanetFromHouseById(
                        editingPlanetText._planetHouseNumber,
                        editingPlanetText._planetId
                    );
                } else if (chartType === 'north-indian' && window.app.chartTemplates.northIndianTemplate) {
                    window.app.chartTemplates.northIndianTemplate.removePlanetFromHouseById(
                        editingPlanetText._planetHouseNumber,
                        editingPlanetText._planetId
                    );
                }
            }
        };

        const handleKeyDown = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                finishEditing(true);
            } else if (e.key === 'Escape') {
                e.preventDefault();
                finishEditing(false);
            }
        };

        const handleInput = () => {
            let newText = textEditInput.value;
            if (newText.length > 8) {
                newText = newText.substring(0, 8);
                textEditInput.value = newText;
            }

            editingPlanetText.text(newText);
            editingPlanetText.textDecoration(retrogradeState ? 'underline' : '');
            this.layer.batchDraw();
            markSessionDirty();
        };

        const handleColorChange = (hex) => {
            editingPlanetText.fill(hex);
            this.layer.batchDraw();
            markSessionDirty();
        };

        let handleRetrograde = null;
        const applyRetrogradePreview = (isRetrograde) => {
            editingPlanetText.textDecoration(isRetrograde ? 'underline' : '');
            textEditInput.style.textDecoration = isRetrograde ? 'underline' : 'none';
            if (retrogradeButton) {
                retrogradeButton.classList.toggle('active', isRetrograde);
            }
            this.layer.batchDraw();
        };

        this.isEditingPlanet = true;
        this.currentlyEditingPlanet = planetText;
        this.planetEditSession = {
            finish: finishEditing
        };

        if (retrogradeButton) {
            applyRetrogradePreview(retrogradeState);
            handleRetrograde = () => {
                retrogradeState = !retrogradeState;
                applyRetrogradePreview(retrogradeState);
                markSessionDirty();
            };
            retrogradeButton.addEventListener('click', handleRetrograde);
        }

        if (deleteButton) {
            deleteButton.style.display = 'inline-flex';
        }

        textEditInput.value = initialText;
        CitranaColorPicker.initGrahaBar();
        CitranaColorPicker.setValue(textEditColor, initialColor, false);
        CitranaColorPicker.setGrahaPickCallback(handleColorChange);
        if (planetText.text().includes('ᵣ')) {
            editingPlanetText.text(initialText);
        }

        textEditControls.style.display = 'flex';

        setTimeout(() => {
            textEditInput.focus();
            if (textEditInput.value !== initialText) {
                textEditInput.value = initialText;
            }
            const length = textEditInput.value.length;
            textEditInput.setSelectionRange(length, length);
        }, 100);

        editingPlanetText.draggable(false);

        saveButton.addEventListener('click', handleSave);
        cancelButton.addEventListener('click', handleCancel);
        textEditInput.addEventListener('keydown', handleKeyDown);
        textEditInput.addEventListener('input', handleInput);
        if (deleteButton) {
            deleteButton.addEventListener('click', handleDelete);
        }

        textEditInput.removeAttribute('placeholder');
    }

    /**
     * Persist retrograde underline state for a Graha on the chart
     * @param {KonvaText} planetText - The Graha text object
     * @param {boolean} retrograde - Whether the Graha is retrograde
     */
    setPlanetRetrogradeState(planetText, retrograde) {
        if (!planetText || planetText._planetHouseNumber === undefined || !window.app?.chartTemplates) {
            return;
        }

        const chartType = window.app.chartTemplates.currentChartType;
        const template = chartType === 'south-indian' ?
            window.app.chartTemplates.southIndianTemplate :
            window.app.chartTemplates.northIndianTemplate;
        const houseData = chartType === 'south-indian' ?
            template.houseDataSouth :
            template.houseDataNorth;
        const house = houseData[planetText._planetHouseNumber];
        const planet = house?.planets?.find((p) => p.id === planetText._planetId);

        if (planet) {
            planet.retrograde = retrograde;
        }

        planetText.textDecoration(retrograde ? 'underline' : '');
        planetText.getLayer()?.batchDraw();

        if (window.app?.recordHistory) {
            window.app.recordHistory('Edit Graha');
        }
    }

    /**
     * Cancel any existing Graha editing session
     */
    cancelPlanetEditing() {
        if (this.planetEditSession?.finish) {
            // Commit label/colour/retrograde changes when the edit bar is dismissed
            this.planetEditSession.finish(true);
        }
    }

    /**
     * Show floating Edit UI for style controls (stroke, font, colour, delete).
     * Content edits use inline editors; heading line count is limited in editHeading().
     * @param {Object} element - The Konva element to edit
     * @param {string} tool - The tool type
     */
    showEditUI(element, tool) {
        citranaDebug(`[EDIT UI] Showing Edit UI for ${tool} tool, element:`, element);

        // Cancel any existing Graha editing
        this.cancelPlanetEditing();

        // Hide any existing Edit UI first
        this.editUI.hide();

        // Set up delete callback
        this.editUI.setDeleteCallback(() => {
            this.deleteSelectedShape();
        });

        // Show Edit UI for the clicked element
        this.editUI.show(element, tool);
    }

    /**
     * Add double-tap support for Konva shapes
     * @param {KonvaShape} shape - The Konva shape to add double-tap support to
     * @param {string} tool - The tool type (e.g., 'arrow', 'line', 'pen')
     */
    addDoubleTapSupport(shape, tool) {
        if (!this.isTouchDevice) return;
        if (shape._editUiDoubleTapBound) return;
        shape._editUiDoubleTapBound = true;

        let lastTap = 0;
        let tapCount = 0;
        let tapTimer = null;
        let isProcessingTap = false;

        const handleTap = (e) => {
            // Prevent event bubbling and default behavior
            e.cancelBubble = true;
            e.evt.preventDefault();
            e.evt.stopPropagation();

            // Prevent processing if already handling a tap
            if (isProcessingTap) return;

            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;

            if (tapLength < 500 && tapLength > 0) {
                // Double tap detected
                tapCount++;
                if (tapCount === 2) {
                    clearTimeout(tapTimer);
                    tapCount = 0;
                    isProcessingTap = true;

                    // Small delay to ensure drawing is complete
                    setTimeout(() => {
                        this.showEditUIForShape(shape);
                        isProcessingTap = false;
                    }, 50);
                }
            } else {
                tapCount = 1;
            }

            lastTap = currentTime;

            // Reset tap count after a delay
            if (tapTimer) clearTimeout(tapTimer);
            tapTimer = setTimeout(() => {
                tapCount = 0;
                isProcessingTap = false;
            }, 500);
        };

        // Add tap event listener with higher priority
        shape.on('tap', handleTap);
        shape._tapHandler = handleTap; // Store handler for cleanup

        // Also add click handler for desktop compatibility
        shape.on('click', (e) => {
            // Only handle click if not on mobile
            if (!this.isTouchDevice) {
                this.showEditUIForShape(shape);
            }
        });
    }

    startHeading(pos) {
        const heading = new Konva.Text({
            x: pos.x,
            y: pos.y,
            text: 'Rashi Chart 1\nD1',
            fontSize: 18,
            fontFamily: 'Arial Black, Arial, sans-serif',
            fontWeight: 'bold',
            fill: '#000000',
            draggable: true,
            name: 'drawing-heading',
            align: 'center',
            verticalAlign: 'middle',
            listening: true,
            padding: 4
        });
        this.currentShape = heading;
        this.layer.add(heading);
        this.layer.batchDraw();
        // Make heading editable on click/double-tap
        this.makeHeadingEditable(heading);
        this.makeShapeSelectable(heading);
        // Auto-switch to select tool after creating heading
        setTimeout(() => {
            if (window.app) {
                window.app.setTool('select');
            }
        }, 100);
    }

    makeHeadingEditable(heading) {
        // Double-click to edit (desktop)
        heading.on('dblclick', () => {
            this.editHeading(heading);
        });
        // Double-tap to edit (mobile)
        let lastTap = 0;
        let tapCount = 0;
        let tapTimer = null;
        heading.on('tap', (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            if (tapLength < 500 && tapLength > 0) {
                tapCount++;
                if (tapCount === 2) {
                    clearTimeout(tapTimer);
                    tapCount = 0;
                    this.editHeading(heading);
                }
            } else {
                tapCount = 1;
            }
            lastTap = currentTime;
            if (tapTimer) clearTimeout(tapTimer);
            tapTimer = setTimeout(() => {
                tapCount = 0;
            }, 500);
        });
        // Show Edit UI on click (desktop)
        heading.on('click', (e) => {
            e.cancelBubble = true;
            this.showEditUI(heading, 'heading');
        });
    }

    /**
     * Inline heading editor (double-click / double-tap). Enforces a 2-line limit.
     * @param {Konva.Text} heading
     */
    editHeading(heading) {
        // Prevent multiple textareas
        const existingTextarea = document.querySelector('.konva-textarea');
        if (existingTextarea) {
            existingTextarea.remove();
        }
        // Get the absolute position of the heading
        const textPosition = heading.absolutePosition();
        const stageBox = this.stage.container().getBoundingClientRect();
        // Calculate position relative to viewport
        const areaPosition = {
            x: stageBox.left + textPosition.x,
            y: stageBox.top + textPosition.y
        };
        // Create textarea
        const textarea = document.createElement('textarea');
        textarea.className = 'konva-textarea';
        document.body.appendChild(textarea);
        const initialText = heading.text();
        textarea.value = initialText;
        // Style the textarea
        textarea.style.position = 'absolute';
        textarea.style.top = areaPosition.y + 'px';
        textarea.style.left = areaPosition.x + 'px';
        textarea.style.width = Math.max(150, heading.width()) + 'px';
        // Apply canvas scale to font size and height for editing precision
        const scale = this.stage.scaleX();
        const scaledFontSize = heading.fontSize() * scale;
        textarea.style.fontSize = '16px'; // Prevent mobile zoom
        textarea.style.lineHeight = scaledFontSize + 'px';
        textarea.style.height = (scaledFontSize * 2 + 8) + 'px'; // 2 lines
        textarea.style.fontFamily = heading.fontFamily();
        textarea.style.color = heading.fill();
        textarea.style.fontWeight = 'bold';
        textarea.style.textAlign = heading.align();
        textarea.style.border = 'none';
        textarea.style.borderRadius = '0px';
        textarea.style.padding = '0px';
        textarea.style.margin = '0px';
        textarea.style.background = 'transparent';
        textarea.style.outline = 'none';
        textarea.style.resize = 'none';
        textarea.style.zIndex = '10000';
        textarea.style.boxShadow = 'none';
        textarea.style.transform = '';
        textarea.style.transformOrigin = '';
        textarea.style.touchAction = 'manipulation';
        textarea.style.WebkitTouchAction = 'manipulation';
        textarea.rows = 2;
        textarea.maxLength = 200;
        textarea.addEventListener('input', function() {
            const lines = textarea.value.split('\n');
            if (lines.length > 2) {
                textarea.value = lines.slice(0, 2).join('\n');
            }
        });
        // Focus and select all text
        textarea.focus();
        textarea.select();
        // Disable dragging while editing and hide the original heading
        heading.setAttrs({
            draggable: false,
            visible: false
        });
        let finished = false;

        const finishEditing = (save = true) => {
            if (finished) {
                return;
            }
            finished = true;

            const committedText = save ? textarea.value.trim() : initialText;
            heading.text(committedText);

            textarea.remove();
            heading.setAttrs({
                draggable: true,
                visible: true
            });
            this.layer.batchDraw();

            if (save && committedText !== initialText) {
                window.app?.recordHistory('Edit heading');
            }

            textarea.removeEventListener('blur', handleBlur);
            textarea.removeEventListener('input', handleLivePreview);
            document.removeEventListener('click', handleOutsideClick);
            document.removeEventListener('keydown', handleKeyDown);
        };

        const handleKeyDown = (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                finishEditing(true);
            } else if (e.key === 'Escape') {
                e.preventDefault();
                finishEditing(false);
            }
        };

        const handleOutsideClick = (e) => {
            if (e.target !== textarea) {
                finishEditing(true);
            }
        };

        const handleBlur = () => finishEditing(true);

        const handleLivePreview = () => {
            heading.text(textarea.value);
            this.layer.batchDraw();
        };

        textarea.addEventListener('blur', handleBlur);
        document.addEventListener('keydown', handleKeyDown);
        setTimeout(() => {
            document.addEventListener('click', handleOutsideClick);
        }, 100);
        textarea.addEventListener('input', handleLivePreview);
    }

    /**
     * Shape bounds in layer space (immune to stage zoom/pan).
     * @param {Konva.Node} shape
     * @returns {{ x: number, y: number, width: number, height: number }}
     */
    getShapeBoundsInLayer(shape) {
        return shape.getClientRect({ relativeTo: this.layer });
    }

    /**
     * Create an invisible bounding box around a drawing object for easier selection
     * @param {KonvaShape} shape - The shape to create a bounding box for
     * @param {string} toolType - The type of drawing tool
     * @returns {KonvaRect} The invisible bounding box
     */
    createBoundingBox(shape, toolType) {
        // Use larger padding for mobile devices for easier double-tap/selection
        let padding = 15;
        if (this.isMobile()) {
            padding = 40; // Much larger for mobile
        }
        const bounds = this.getShapeBoundsInLayer(shape);

        const boundingBox = new Konva.Rect({
            x: bounds.x - padding,
            y: bounds.y - padding,
            width: bounds.width + (padding * 2),
            height: bounds.height + (padding * 2),
            fill: 'transparent',
            stroke: 'transparent',
            strokeWidth: 0,
            name: `bounding-box-${toolType}`,
            listening: true,
            draggable: false,
            perfectDrawEnabled: false
        });

        // Establish two-way relationship
        shape.boundingBox = boundingBox;
        boundingBox.actualShape = shape;

        // Add event handlers to the bounding box that delegate to the shape
        boundingBox.on('click', () => {
            this.showEditUI(shape, toolType);
        });

        boundingBox.on('tap', (e) => {
            // Delegate tap events to the shape
            if (shape._tapHandler) {
                shape._tapHandler(e);
            }
        });

        // Update bounding box position when shape moves
        shape.on('dragmove', () => {
            this.updateBoundingBox(boundingBox, shape);
        });

        return boundingBox;
    }

    /**
     * Update bounding box position when shape moves
     * @param {KonvaRect} boundingBox - The bounding box to update
     * @param {KonvaShape} shape - The shape being moved
     */
    updateBoundingBox(boundingBox, shape) {
        // Use same padding logic as createBoundingBox
        let padding = 15;
        if (this.isMobile()) {
            padding = 40;
        }
        const bounds = this.getShapeBoundsInLayer(shape);

        boundingBox.setAttrs({
            x: bounds.x - padding,
            y: bounds.y - padding,
            width: bounds.width + (padding * 2),
            height: bounds.height + (padding * 2)
        });

        this.layer.batchDraw();
    }
}