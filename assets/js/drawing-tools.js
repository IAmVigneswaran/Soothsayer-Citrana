/**
 * Drawing Tools Class
 * Handles all drawing functionality (arrow, line, pen, text)
 * 100% precise and accurate to mouse position
 */
class DrawingTools {
    constructor(stage, layer) {
        this.stage = stage;
        this.layer = layer;
        this.isDrawing = false;
        this.currentShape = null;
        this.currentTool = null;
        this.undoStack = [];
        this.redoStack = [];
        this.maxUndoSteps = 50;
        this.lastPoint = null;
        this.isTouchDevice = this.detectTouchDevice();
        this.selectedShape = null;
        this.isDragging = false;

        // Track editing state to prevent conflicts
        this.isEditingPlanet = false;
        this.currentlyEditingPlanet = null;

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
                this.updateControlPointsPosition(shape);
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
     * Get precise mouse/touch position accounting for stage transformations
     * @param {Event|Touch} event - Mouse or touch event
     * @returns {Object} Precise position {x, y}
     */
    getPrecisePosition(event) {
        // Get the stage container's bounding rect
        const stageBox = this.stage.container().getBoundingClientRect();

        // Get client coordinates
        let clientX, clientY;
        if (event.clientX !== undefined) {
            // Mouse event
            clientX = event.clientX;
            clientY = event.clientY;
        } else {
            // Touch event
            clientX = event.clientX || event.pageX;
            clientY = event.clientY || event.pageY;
        }

        // Calculate position relative to stage container
        const x = (clientX - stageBox.left) / this.stage.scaleX();
        const y = (clientY - stageBox.top) / this.stage.scaleY();

        // Account for stage position
        const finalX = x - this.stage.x() / this.stage.scaleX();
        const finalY = y - this.stage.y() / this.stage.scaleY();

        // Ensure pixel-perfect positioning
        return {
            x: Math.round(finalX * 100) / 100,
            y: Math.round(finalY * 100) / 100
        };
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

        // Add the completed shape to undo stack
        if (this.currentShape) {
            this.addToUndoStack(this.currentShape, 'add');
        }

        this.isDrawing = false;
        this.currentShape = null;
        this.currentTool = null;
        this.lastPoint = null;

        // Ensure the layer is updated
        this.layer.batchDraw();

        // Trigger snapshot for undo/redo
        if (window.app && window.app.pushSnapshot) {
            window.app.pushSnapshot();
        }

        console.log('Drawing stopped');
    }

    /**
     * Ensure drawing objects are properly selectable after creation
     * @param {KonvaShape} shape - The shape to make selectable
     */
    makeShapeSelectable(shape) {
        if (!shape) return;

        // Ensure the shape is listening for events
        shape.setAttrs({
            listening: true,
            draggable: false // Will be enabled when select tool is active
        });

        // Add drag event handlers for shapes that support control points
        if (this.supportsControlPoints(shape)) {
            // Add dragmove handler to update control points when shape is dragged
            shape.on('dragmove', () => {
                if (this.selectedShape === shape && this.controlPoints.startPoint && this.controlPoints.endPoint) {
                    this.updateControlPointsPosition(shape);
                }
            });

            // Add dragend handler to add to undo stack and update control points
            shape.on('dragend', () => {
                if (this.selectedShape === shape) {
                    this.addToUndoStack(shape, 'modify');
                    this.updateControlPointsPosition(shape);
                }
            });
        }

        // Add a small delay to ensure the shape is fully rendered
        setTimeout(() => {
            // Re-add double-tap support if it's a touch device
            if (this.isTouchDevice) {
                this.addDoubleTapSupport(shape, this.currentTool);
            }
        }, 150);
    }

    getDistance(pos1, pos2) {
        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    startArrow(pos) {
        const arrow = new Konva.Arrow({
            points: [pos.x, pos.y, pos.x, pos.y],
            stroke: '#FF0000',
            strokeWidth: 5,
            fill: '#FF0000',
            pointerLength: 10,
            pointerWidth: 8,
            name: 'drawing-arrow',
            perfectDrawEnabled: true,
            listening: true,
            draggable: false // Will be enabled when select tool is active
        });

        // Create invisible bounding box for easier selection
        const boundingBox = this.createBoundingBox(arrow, 'arrow');

        // Add click handler for Edit UI
        arrow.on('click', () => {
            this.showEditUI(arrow, 'arrow');
        });

        // Add double-tap support for mobile
        this.addDoubleTapSupport(arrow, 'arrow');

        this.currentShape = arrow;
        this.layer.add(arrow);
        this.layer.add(boundingBox);
        this.layer.batchDraw();
    }

    updateArrow(pos) {
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

        // Make the shape selectable after drawing
        this.makeShapeSelectable(this.currentShape);
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

        // Add click handler for Edit UI
        line.on('click', () => {
            this.showEditUI(line, 'line');
        });

        // Add double-tap support for mobile
        this.addDoubleTapSupport(line, 'line');

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

        // Make the shape selectable after drawing
        this.makeShapeSelectable(this.currentShape);
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

        // Add click handler for Edit UI
        line.on('click', (e) => {
            e.cancelBubble = true;
            this.showEditUI(line, 'pen');
        });

        // Add double-tap support for mobile
        this.addDoubleTapSupport(line, 'pen');

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

        // Make the shape selectable after drawing
        this.makeShapeSelectable(this.currentShape);
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
        textarea.value = text.text() === 'Double-click to edit' ? '' : text.text();

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

        const finishEditing = () => {
            const newText = textarea.value.trim();
            if (newText) {
                text.text(newText);
            } else {
                text.text('Double-click to edit');
            }

            textarea.remove();
            text.setAttrs({
                draggable: true,
                visible: true // Show the text again after editing
            });
            this.layer.batchDraw();

            // Remove event listeners
            document.removeEventListener('click', handleOutsideClick);
            document.removeEventListener('keydown', handleKeyDown);
        };

        const handleKeyDown = (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                finishEditing();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                textarea.value = text.text();
                finishEditing();
            }
        };

        const handleOutsideClick = (e) => {
            if (e.target !== textarea) {
                finishEditing();
            }
        };

        // Add event listeners
        textarea.addEventListener('blur', finishEditing);
        document.addEventListener('keydown', handleKeyDown);

        // Delay outside click handler to prevent immediate closure
        setTimeout(() => {
            document.addEventListener('click', handleOutsideClick);
        }, 100);
    }

    addToUndoStack(shape, actionType = 'add') {
        if (this.undoStack.length >= this.maxUndoSteps) {
            this.undoStack.shift(); // Remove oldest action
        }

        this.undoStack.push({
            type: actionType,
            shape: shape
        });

        // Clear redo stack when new action is added
        this.redoStack = [];
    }

    undo() {
        if (this.undoStack.length === 0) return;

        const lastAction = this.undoStack.pop();
        this.redoStack.push(lastAction);

        if (lastAction.type === 'add') {
            // Remove the shape and its bounding box
            if (lastAction.shape) {
                if (lastAction.shape.boundingBox) {
                    lastAction.shape.boundingBox.destroy();
                }
                lastAction.shape.destroy();
            }
        } else if (lastAction.type === 'delete') {
            // Restore the shape and recreate its bounding box
            if (lastAction.shape) {
                this.layer.add(lastAction.shape);

                // Recreate bounding box if it's a drawing object
                if (lastAction.shape.name() && lastAction.shape.name().startsWith('drawing-')) {
                    const toolType = lastAction.shape.name().replace('drawing-', '');
                    const boundingBox = this.createBoundingBox(lastAction.shape, toolType);
                    lastAction.shape.boundingBox = boundingBox;
                    this.layer.add(boundingBox);
                }
            }
        }

        this.layer.batchDraw();
        this.clearSelection();
    }

    redo() {
        if (this.redoStack.length === 0) return;

        const lastAction = this.redoStack.pop();
        this.undoStack.push(lastAction);

        if (lastAction.type === 'add') {
            // Restore the shape and recreate its bounding box
            if (lastAction.shape) {
                this.layer.add(lastAction.shape);

                // Recreate bounding box if it's a drawing object
                if (lastAction.shape.name() && lastAction.shape.name().startsWith('drawing-')) {
                    const toolType = lastAction.shape.name().replace('drawing-', '');
                    const boundingBox = this.createBoundingBox(lastAction.shape, toolType);
                    lastAction.shape.boundingBox = boundingBox;
                    this.layer.add(boundingBox);
                }
            }
        } else if (lastAction.type === 'delete') {
            // Remove the shape and its bounding box
            if (lastAction.shape) {
                if (lastAction.shape.boundingBox) {
                    lastAction.shape.boundingBox.destroy();
                }
                lastAction.shape.destroy();
            }
        }

        this.layer.batchDraw();
        this.clearSelection();
    }

    clearAll() {
        // Clear all drawing objects
        const shapes = this.layer.find('*');
        shapes.forEach(shape => {
            if (shape.name() && shape.name().startsWith('drawing-')) {
                shape.destroy();
            }
        });
        this.clearSelection();
        this.clearControlPoints();
        this.layer.batchDraw();
    }

    /**
     * Create control points for arrow or line shapes
     * @param {KonvaObject} shape - The shape to add control points to
     */
    createControlPoints(shape) {
        if (!shape || !shape.points) return;

        const points = shape.points();
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
                const newPoints = this.selectedShape.points();
                newPoints[0] = localX;
                newPoints[1] = localY;
                this.selectedShape.points(newPoints);

                // Update bounding box if it exists
                if (this.selectedShape.boundingBox) {
                    this.updateBoundingBox(this.selectedShape.boundingBox, this.selectedShape);
                }

                this.layer.batchDraw();
            }
        });

        this.controlPoints.startPoint.on('dragend', () => {
            this.isDraggingControlPoint = false;
            this.draggedControlPoint = null;
            // Add to undo stack
            this.addToUndoStack(this.selectedShape, 'modify');
        });

        // Add drag event handlers for end point
        this.controlPoints.endPoint.on('dragstart', () => {
            this.isDraggingControlPoint = true;
            this.draggedControlPoint = 'end';
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
                const newPoints = this.selectedShape.points();
                newPoints[2] = localX;
                newPoints[3] = localY;
                this.selectedShape.points(newPoints);

                // Update bounding box if it exists
                if (this.selectedShape.boundingBox) {
                    this.updateBoundingBox(this.selectedShape.boundingBox, this.selectedShape);
                }

                this.layer.batchDraw();
            }
        });

        this.controlPoints.endPoint.on('dragend', () => {
            this.isDraggingControlPoint = false;
            this.draggedControlPoint = null;
            // Add to undo stack
            this.addToUndoStack(this.selectedShape, 'modify');
        });

        // Add control points to layer
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

        const points = shape.points();
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

    getDrawingStats() {
        const arrows = this.layer.find(node => node.name() === 'drawing-arrow').length;
        const lines = this.layer.find(node => node.name() === 'drawing-line').length;
        const penStrokes = this.layer.find(node => node.name() === 'drawing-pen').length;
        const texts = this.layer.find(node => node.name() === 'drawing-text').length;

        return {
            arrows,
            lines,
            penStrokes,
            texts,
            total: arrows + lines + penStrokes + texts
        };
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
            if (obj.name() !== 'drawing-text') {
                // Text objects handle their own dragging
                obj.draggable(draggable);
            }
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
        } else if (shape.name().includes('drawing-text')) {
            toolType = 'text';
        }

        // Show Edit UI
        if (this.editUI) {
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
     * Get the EditUI instance
     * @returns {EditUI} The EditUI instance
     */
    getEditUI() {
        return this.editUI;
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

        // Add to undo stack before deleting
        this.addToUndoStack(this.selectedShape, 'delete');

        // Clear control points
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
            this.editUI.hide();
        }

        this.layer.batchDraw();

        // Trigger snapshot for undo/redo
        if (window.app && window.app.pushSnapshot) {
            window.app.pushSnapshot();
        }
    }

    /**
     * Make planet text editable with live preview
     * @param {KonvaText} planetText - The planet text object
     * @param {Function} onUpdate - Callback function to update the planet label
     */
    makePlanetTextEditable(planetText, onUpdate) {
        // Double-click to edit planet text (desktop)
        planetText.on('dblclick', () => {
            // Prevent multiple editing sessions
            if (this.isEditingPlanet) {
                console.log('[DEBUG] Already editing a planet, ignoring double-click');
                return;
            }
            this.editPlanetText(planetText, onUpdate);
        });

        // Double-tap to edit planet text (mobile)
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
                        console.log('[DEBUG] Already editing a planet, ignoring double-tap');
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
     * Edit planet text using the floating UI
     * @param {KonvaText} planetText - The planet text object
     * @param {Function} onUpdate - Callback function to update the planet label
     */
    editPlanetText(planetText, onUpdate) {
        // Check if text edit controls are already visible
        const textEditControls = document.getElementById('text-edit-controls');
        if (textEditControls && textEditControls.style.display === 'flex') {
            console.log('[DEBUG] Text edit controls already visible, ignoring edit request');
            return;
        }

        // Set editing state
        this.isEditingPlanet = true;
        this.currentlyEditingPlanet = planetText;

        const currentText = planetText.text();
        const currentColor = planetText.fill() || '#000000';

        // Store reference to the specific planet being edited
        const editingPlanetText = planetText;

        // Get the text edit UI elements
        const textEditInput = document.getElementById('text-edit-input');
        const textEditColor = document.getElementById('text-edit-color');
        const saveButton = document.getElementById('text-edit-save');
        const cancelButton = document.getElementById('text-edit-cancel');
        const deleteButton = document.getElementById('text-edit-delete');
        const retrogradeButton = document.getElementById('text-edit-retrograde');

        if (!textEditControls || !textEditInput || !textEditColor || !saveButton || !cancelButton) {
            console.error('Text edit UI elements not found');
            this.isEditingPlanet = false;
            this.currentlyEditingPlanet = null;
            return;
        }

        // Set up retrograde button
        const isRetrograde = currentText.includes('ᵣ'); // Unicode subscript R
        if (retrogradeButton) {
            // Set initial state
            if (isRetrograde) {
                retrogradeButton.classList.add('active');
            } else {
                retrogradeButton.classList.remove('active');
            }

            // Add click event listener
            const handleRetrograde = () => {
                const currentInputText = textEditInput.value;
                let newText;

                if (currentInputText.includes('ᵣ')) {
                    // Remove retrograde "R" subscript
                    newText = currentInputText.replace(/ᵣ/g, '');
                    retrogradeButton.classList.remove('active');
                } else {
                    // Add retrograde "R" subscript
                    newText = currentInputText + 'ᵣ';
                    retrogradeButton.classList.add('active');
                }

                textEditInput.value = newText;
                // Trigger input event to update any live preview
                textEditInput.dispatchEvent(new Event('input'));
            };

            retrogradeButton.addEventListener('click', handleRetrograde);
        }

        // Always show the Delete button for planet text
        if (deleteButton) {
            deleteButton.style.display = 'inline-flex';
        }

        // Clear any existing value and set initial value
        textEditInput.value = '';
        textEditInput.value = currentText;
        textEditColor.value = currentColor;

        // Show the text edit UI
        textEditControls.style.display = 'flex';

        // Focus the input and place cursor at the end (after a small delay to ensure UI is ready)
        setTimeout(() => {
            textEditInput.focus();
            // Double-check the value is set correctly
            if (textEditInput.value !== currentText) {
                textEditInput.value = currentText;
            }
            // Set cursor at the end
            const length = textEditInput.value.length;
            textEditInput.setSelectionRange(length, length);
        }, 100);

        // Disable dragging while editing
        editingPlanetText.draggable(false);

        const finishEditing = (save = false) => {
            // Clear editing state
            this.isEditingPlanet = false;
            this.currentlyEditingPlanet = null;

            // Hide the text edit UI
            textEditControls.style.display = 'none';

            if (save) {
                const newText = textEditInput.value.trim();
                const newColor = textEditColor.value;
                const baseText = newText.replace(/ᵣ/g, ''); // Remove R subscript for length check
                if (newText && baseText.length <= 6) {
                    // Update the planet label through callback
                    if (onUpdate) {
                        onUpdate(newText, newColor);
                    }
                } else {
                    // Restore original text and color if invalid
                    editingPlanetText.text(currentText);
                    editingPlanetText.fill(currentColor);
                }
            } else {
                // Restore original text and color if cancelled
                editingPlanetText.text(currentText);
                editingPlanetText.fill(currentColor);
            }

            // Re-enable dragging
            editingPlanetText.draggable(true);

            // Remove event listeners
            saveButton.removeEventListener('click', handleSave);
            cancelButton.removeEventListener('click', handleCancel);
            textEditInput.removeEventListener('keydown', handleKeyDown);
            textEditInput.removeEventListener('input', handleInput);
            textEditColor.removeEventListener('change', handleColorChange);
            textEditColor.removeEventListener('input', handleColorChange);
            if (deleteButton) {
                deleteButton.removeEventListener('click', handleDelete);
            }
            if (retrogradeButton) {
                retrogradeButton.removeEventListener('click', handleRetrograde);
            }
        };

        const handleSave = () => {
            finishEditing(true);
        };

        const handleCancel = () => {
            finishEditing(false);
        };

        const handleDelete = () => {
            // Clear editing state
            this.isEditingPlanet = false;
            this.currentlyEditingPlanet = null;

            // Hide the text edit UI
            textEditControls.style.display = 'none';

            // Remove the planet from its house
            if (typeof editingPlanetText._planetHouseNumber !== 'undefined' && typeof editingPlanetText._planetId !== 'undefined') {
                // Try to remove from South or North chart
                if (window.app && window.app.chartTemplates) {
                    const chartType = window.app.chartTemplates.currentChartType;
                    if (chartType === 'south-indian' && window.app.chartTemplates.southIndianTemplate) {
                        window.app.chartTemplates.southIndianTemplate.removePlanetFromHouseById(editingPlanetText._planetHouseNumber, editingPlanetText._planetId);
                    } else if (chartType === 'north-indian' && window.app.chartTemplates.northIndianTemplate) {
                        window.app.chartTemplates.northIndianTemplate.removePlanetFromHouseById(editingPlanetText._planetHouseNumber, editingPlanetText._planetId);
                    }
                }
            }

            // Re-enable dragging
            editingPlanetText.draggable(true);

            // Remove event listeners
            saveButton.removeEventListener('click', handleSave);
            cancelButton.removeEventListener('click', handleCancel);
            textEditInput.removeEventListener('keydown', handleKeyDown);
            textEditInput.removeEventListener('input', handleInput);
            textEditColor.removeEventListener('change', handleColorChange);
            textEditColor.removeEventListener('input', handleColorChange);
            if (deleteButton) {
                deleteButton.removeEventListener('click', handleDelete);
            }
            if (retrogradeButton) {
                retrogradeButton.removeEventListener('click', handleRetrograde);
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
            // Allow backspace to work normally in the input field
        };

        const handleInput = () => {
            let newText = textEditInput.value;

            // Enforce 6 character limit, but allow "ᵣ" to be added beyond it
            const baseText = newText.replace(/ᵣ/g, ''); // Remove R subscript for length check
            if (baseText.length > 6) {
                // If base text is too long, truncate it but preserve R subscript if it was there
                const truncatedBase = baseText.substring(0, 6);
                const hasR = newText.includes('ᵣ');
                newText = hasR ? truncatedBase + 'ᵣ' : truncatedBase;
                textEditInput.value = newText;
            }

            // Update ONLY the specific planet text being edited
            editingPlanetText.text(newText);
            this.layer.batchDraw();
        };

        const handleColorChange = (e) => {
            const newColor = e.target.value;

            console.log(`[DEBUG] Color changed to: ${newColor} for planet text`);

            // Update ONLY the specific planet text being edited
            editingPlanetText.fill(newColor);
            this.layer.batchDraw();
        };

        // Add event listeners
        saveButton.addEventListener('click', handleSave);
        cancelButton.addEventListener('click', handleCancel);
        textEditInput.addEventListener('keydown', handleKeyDown);
        textEditInput.addEventListener('input', handleInput);
        textEditColor.addEventListener('change', handleColorChange);
        textEditColor.addEventListener('input', handleColorChange);
        if (deleteButton) {
            deleteButton.addEventListener('click', handleDelete);
        }

        // Ensure the input field is properly initialized
        textEditInput.removeAttribute('placeholder');
        textEditInput.value = currentText;
        textEditColor.value = currentColor;
    }

    /**
     * Cancel any existing planet editing session
     */
    cancelPlanetEditing() {
        if (this.isEditingPlanet && this.currentlyEditingPlanet) {
            // Hide the text edit UI
            const textEditControls = document.getElementById('text-edit-controls');
            if (textEditControls) {
                textEditControls.style.display = 'none';
            }

            // Re-enable dragging
            this.currentlyEditingPlanet.draggable(true);

            // Clear editing state
            this.isEditingPlanet = false;
            this.currentlyEditingPlanet = null;

            console.log('[DEBUG] Cancelled existing planet editing session');
        }
    }

    /**
     * Show Edit UI for a specific element
     * @param {Object} element - The Konva element to edit
     * @param {string} tool - The tool type
     */
    showEditUI(element, tool) {
        console.log(`[EDIT UI] Showing Edit UI for ${tool} tool, element:`, element);

        // Cancel any existing planet editing
        this.cancelPlanetEditing();

        // Hide any existing Edit UI first
        this.editUI.hide();

        // Set up delete callback
        this.editUI.setDeleteCallback(() => {
            this.deleteSelectedShape();
        });

        // Show Edit UI for the clicked element
        if (tool === 'heading') {
            // Show Edit UI with 2-line limit
            this.editUI.show(element, 'heading');
        } else {
            this.editUI.show(element, tool);
        }
    }

    /**
     * Add double-tap support for Konva shapes
     * @param {KonvaShape} shape - The Konva shape to add double-tap support to
     * @param {string} tool - The tool type (e.g., 'arrow', 'line', 'pen')
     */
    addDoubleTapSupport(shape, tool) {
        if (!this.isTouchDevice) return;

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
        // Set initial value
        textarea.value = heading.text();
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
        // Enforce 2-line limit
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
        const finishEditing = () => {
            const newText = textarea.value.trim();
            heading.text(newText);
            textarea.remove();
            heading.setAttrs({
                draggable: true,
                visible: true
            });
            this.layer.batchDraw();
            document.removeEventListener('click', handleOutsideClick);
            document.removeEventListener('keydown', handleKeyDown);
        };
        const handleKeyDown = (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                finishEditing();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                textarea.value = heading.text();
                finishEditing();
            }
        };
        const handleOutsideClick = (e) => {
            if (e.target !== textarea) {
                finishEditing();
            }
        };
        textarea.addEventListener('blur', finishEditing);
        document.addEventListener('keydown', handleKeyDown);
        setTimeout(() => {
            document.addEventListener('click', handleOutsideClick);
        }, 100);
        // Live update preview
        textarea.addEventListener('input', () => {
            heading.text(textarea.value);
            this.layer.batchDraw();
        });
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
        if (window.Utils && window.Utils.isMobile && window.Utils.isMobile()) {
            padding = 40; // Much larger for mobile
        }
        const bounds = shape.getClientRect();

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
        if (window.Utils && window.Utils.isMobile && window.Utils.isMobile()) {
            padding = 40;
        }
        const bounds = shape.getClientRect();

        boundingBox.setAttrs({
            x: bounds.x - padding,
            y: bounds.y - padding,
            width: bounds.width + (padding * 2),
            height: bounds.height + (padding * 2)
        });

        this.layer.batchDraw();
    }
}