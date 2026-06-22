/**
 * citrana-drawing-tools.js
 * Citrana • https://github.com/IAmVigneswaran/Soothsayer-Citrana 
 * © 2026 Vigneswaran Rajkumar • Licensed under MIT License
 * Handles all drawing functionality with precise mouse positioning and control points
 */

/** Minimum px between sampled pen points when drawing slowly (more detail) */
const PEN_MIN_POINT_DISTANCE = 2;
/** Wider spacing on fast strokes — avoids dense jitter and keeps curves natural */
const PEN_MIN_POINT_DISTANCE_FAST = 5;
/** px/ms above which pen sampling uses the fast spacing */
const PEN_SPEED_FAST_THRESHOLD = 0.85;
/** Konva spline tension — 0 is straight segments; ~0.5–0.6 gives smooth marker curves */
const PEN_TENSION = 0.55;
const PEN_DEFAULT_STROKE_WIDTH = 4;
/** Shared double-click window for pen edit gesture detectors (bbox click, stage click). */
const PEN_EDIT_ACTIVATION_MS = 450;

function getPenHitMinWidth() {
    return typeof CitranaDevice !== 'undefined' && CitranaDevice.isMobileUA() ? 28 : 18;
}

function isTaperedPen(shape) {
    return shape?.getAttr?.('penTaper') === true;
}

function getPenStrokeWidth(shape) {
    if (isTaperedPen(shape)) {
        return shape.getAttr('penBaseWidth') || PEN_DEFAULT_STROKE_WIDTH;
    }

    return shape?.strokeWidth?.() || PEN_DEFAULT_STROKE_WIDTH;
}

function getPenStrokeColor(shape) {
    if (isTaperedPen(shape)) {
        return shape.getAttr('penStrokeColor') || '#FF0000';
    }

    return shape?.stroke?.() || '#FF0000';
}

function smoothPenWidths(widths) {
    if (!widths || widths.length < 3) {
        return widths;
    }

    const smoothed = [widths[0]];
    for (let i = 1; i < widths.length - 1; i++) {
        smoothed.push(0.25 * widths[i - 1] + 0.5 * widths[i] + 0.25 * widths[i + 1]);
    }
    smoothed.push(widths[widths.length - 1]);
    return smoothed;
}

/**
 * Per-vertex width from stroke tips and drawing speed.
 * @param {number[]} flatPoints
 * @param {number[]} sampleTimes
 * @param {number} baseWidth
 * @returns {number[]}
 */
function computePenTaperWidths(flatPoints, sampleTimes, baseWidth) {
    const count = flatPoints.length / 2;
    if (count < 2) {
        return [baseWidth];
    }

    if (count === 2) {
        const tip = Math.max(0.6, baseWidth * 0.45);
        return [tip, tip];
    }

    const minWidth = Math.max(0.45, baseWidth * 0.12);
    const widths = new Array(count);

    for (let i = 0; i < count; i++) {
        const t = i / (count - 1);
        const endFactor = Math.pow(Math.sin(Math.PI * t), 0.82);

        let velocityFactor = 1;
        if (i > 0) {
            const dx = flatPoints[i * 2] - flatPoints[i * 2 - 2];
            const dy = flatPoints[i * 2 + 1] - flatPoints[i * 2 - 1];
            const dist = Math.hypot(dx, dy);
            const dt = Math.max(8, (sampleTimes[i] ?? sampleTimes[sampleTimes.length - 1] ?? 0)
                - (sampleTimes[i - 1] ?? 0));
            const speed = dist / dt;
            velocityFactor = Math.max(0.42, Math.min(1.12, 1.1 - speed * 0.42));
        }

        widths[i] = Math.max(minWidth, baseWidth * endFactor * velocityFactor);
    }

    return smoothPenWidths(widths);
}

function drawTaperedPenPath(context, points, widths, color) {
    if (!points || points.length < 4 || !widths?.length) {
        return;
    }

    context.save();
    context.strokeStyle = color;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.globalAlpha = 1;

    for (let i = 0; i < points.length - 2; i += 2) {
        const index = i / 2;
        const width = Math.max(0.35, (widths[index] + widths[index + 1]) / 2);
        context.lineWidth = width;
        context.beginPath();
        context.moveTo(points[i], points[i + 1]);
        context.lineTo(points[i + 2], points[i + 3]);
        context.stroke();
    }

    context.restore();
}

function configureTaperedPenShape(shape) {
    shape.sceneFunc((context, node) => {
        drawTaperedPenPath(
            context,
            node.getAttr('penTaperPoints'),
            node.getAttr('penTaperWidths'),
            node.getAttr('penStrokeColor') || '#FF0000'
        );
    });

    shape.hitFunc((context, node) => {
        const points = node.getAttr('penTaperPoints');
        const widths = node.getAttr('penTaperWidths');
        if (!points || points.length < 4 || !widths?.length) {
            return;
        }

        const hitPad = 4;
        const minHit = getPenHitMinWidth();
        context.lineCap = 'round';
        context.lineJoin = 'round';

        for (let i = 0; i < points.length - 2; i += 2) {
            const index = i / 2;
            const segmentWidth = Math.max(0.35, (widths[index] + widths[index + 1]) / 2);
            const width = Math.max(minHit, segmentWidth + hitPad);
            context.beginPath();
            context.lineWidth = width;
            context.moveTo(points[i], points[i + 1]);
            context.lineTo(points[i + 2], points[i + 3]);
            context.strokeShape(node);
        }
    });
}

function toLocalPenPoints(flatPoints, offsetX, offsetY) {
    const local = [];
    for (let i = 0; i < flatPoints.length; i += 2) {
        local.push(flatPoints[i] - offsetX, flatPoints[i + 1] - offsetY);
    }
    return local;
}

/**
 * Chaikin corner-cutting — one pass yields smoother, more natural curves.
 * @param {number[]} flatPoints
 * @returns {number[]}
 */
function chaikinPenPoints(flatPoints) {
    if (!flatPoints || flatPoints.length < 8) {
        return flatPoints;
    }

    const next = [flatPoints[0], flatPoints[1]];

    for (let i = 0; i < flatPoints.length - 4; i += 2) {
        const x0 = flatPoints[i];
        const y0 = flatPoints[i + 1];
        const x1 = flatPoints[i + 2];
        const y1 = flatPoints[i + 3];
        next.push(
            0.75 * x0 + 0.25 * x1,
            0.75 * y0 + 0.25 * y1,
            0.25 * x0 + 0.75 * x1,
            0.25 * y0 + 0.75 * y1
        );
    }

    next.push(flatPoints[flatPoints.length - 2], flatPoints[flatPoints.length - 1]);
    return next;
}

class DrawingTools {
    constructor(stage, layer) {
        this.stage = stage;
        this.layer = layer;
        this.isDrawing = false;
        this.currentShape = null;
        this.currentTool = null;
        this.lastPoint = null;
        this.isTouchDevice = CitranaDevice.isTouchDevice();
        this.selectedShape = null;

        // Track editing state to prevent conflicts
        this.isEditingPlanet = false;
        this.planetEditSession = null;

        // Control points functionality
        this.controlPoints = {
            startPoint: null,
            endPoint: null
        };
        this.isDraggingControlPoint = false;
        this.isPenDragActive = false;
        this.draggedControlPoint = null;

        // Animation frame for bulletproof control point sync
        this.controlPointAnimationFrame = null;

        if (typeof CitranaLaser !== 'undefined') {
            CitranaLaser.init(stage);
        }

        // Initialize Edit UI
        this.editUI = new EditUI();

        // Do NOT call setupTouchEvents(); let citrana-app.js handle all mobile touch events
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

    /** Laser pointer — ephemeral overlay; available on desktop and mobile. */
    isLaserToolAvailable() {
        return typeof CitranaLaser !== 'undefined' && CitranaLaser.isAvailable();
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

        if (tool === 'laser' && !this.isLaserToolAvailable()) {
            this.isDrawing = false;
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
            case 'laser':
                this.startLaser(pos);
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
        if (!this.isDrawing || !pos) return;
        if (tool !== 'laser' && !this.currentShape) return;

        // Validate position coordinates
        if (typeof pos.x !== 'number' || typeof pos.y !== 'number' ||
            isNaN(pos.x) || isNaN(pos.y)) {
            console.warn('Invalid position coordinates in draw:', pos);
            return;
        }

        const minDistance = tool === 'laser' ? CitranaLaser.MIN_POINT_DISTANCE : 1;

        if (tool === 'pen' && this.lastPoint) {
            const dist = this.getDistance(pos, this.lastPoint);
            const now = performance.now();
            const dt = Math.max(8, now - (this.penLastSampleTime || now));
            const speed = dist / dt;
            const penMinDistance = speed > PEN_SPEED_FAST_THRESHOLD
                ? PEN_MIN_POINT_DISTANCE_FAST
                : PEN_MIN_POINT_DISTANCE;

            if (dist < penMinDistance) {
                return;
            }

            this.penLastSampleTime = now;
        } else if (this.lastPoint && this.getDistance(pos, this.lastPoint) < minDistance) {
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
            case 'laser':
                this.updateLaser(pos);
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

        if (completedTool === 'laser' && typeof CitranaLaser !== 'undefined') {
            CitranaLaser.endStroke();
        }

        // Bind selection/drag handlers once when the stroke is complete (not per mousemove)
        let finishedShape = completedShape;
        if (finishedShape && completedTool === 'pen') {
            finishedShape = this.finishPenStroke(finishedShape) || finishedShape;
        }
        if (finishedShape && (completedTool === 'arrow' || completedTool === 'line' || completedTool === 'pen')) {
            this.makeShapeSelectable(finishedShape, completedTool);
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
        if (completedTool && completedTool !== 'laser' && window.app?.recordHistory) {
            window.app.recordHistory(drawLabels[completedTool] || 'Draw');
        }

        // Auto-switch to Select Tool for Arrow and Line tools
        if (window.app && (completedTool === 'arrow' || completedTool === 'line')) {
            window.app.setTool('select');
        }

        if (completedTool && completedTool !== 'laser' && completedTool !== 'text' && completedTool !== 'heading') {
            this.raiseDrawingsAboveChart();
        }

        citranaDebug('Drawing stopped');
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
        this.bindAnnotationPillSync(shape);

        // Touch double-tap for Edit UI — bind once per shape
        if (this.isTouchDevice && !shape._editUiDoubleTapBound) {
            const tapTool = toolForTap ?? this.currentTool;
            setTimeout(() => {
                if (shape.getLayer()) {
                    this.addDoubleTapSupport(shape, tapTool);
                }
            }, 150);
        }

        const resolvedTool = toolForTap ?? (shape.name() || '').replace('drawing-', '');
        if (resolvedTool === 'line' || resolvedTool === 'pen') {
            this.applyDrawingHitTarget(shape, resolvedTool);
        }
        this.syncBoundingBoxListening();
        this.raiseDrawingsAboveChart();
    }

    /**
     * Resolve a pick target to the real drawing node (never an invisible bounding box).
     * @param {Konva.Node|null} node
     * @returns {Konva.Node|null}
     */
    normalizeDrawingShape(node) {
        if (!node) {
            return null;
        }

        const name = node.name?.() || '';

        if (name.startsWith('bounding-box-')) {
            return node.actualShape || null;
        }

        if (name.startsWith('drawing-')) {
            return node;
        }

        return null;
    }

    /**
     * Whether a drawing shape uses the shared Selection Pill.
     * @param {KonvaShape} shape
     * @returns {boolean}
     */
    supportsAnnotationSelectionPill(shape) {
        const name = shape?.name?.() || '';
        return name === 'drawing-text' ||
            name === 'drawing-heading' ||
            name.includes('drawing-pen');
    }

    getAnnotationSelectionExtraPadding(shape) {
        return shape?.name?.()?.includes('drawing-pen') ? 8 : 0;
    }

    syncAnnotationSelectionPill() {
        const shape = this.selectedShape;
        if (!shape || !this.supportsAnnotationSelectionPill(shape)) {
            return;
        }

        if (isTaperedPen(shape)) {
            this.syncPenSelectionPill(shape);
            return;
        }

        CitranaSelection?.sync?.(shape, this.getAnnotationSelectionExtraPadding(shape));
    }

    syncPenSelectionPill(shape) {
        const pill = shape?._selectionPill;
        const parent = shape?.getParent();
        if (!pill || !parent || !isTaperedPen(shape)) {
            return;
        }

        pill.fillEnabled(false);

        const bounds = this.getTaperedPenBoundsInLayer(shape);
        const pad = (CitranaSelection?.getPadding?.() || 4) + this.getAnnotationSelectionExtraPadding(shape);

        pill.setAttrs({
            x: bounds.x - pad,
            y: bounds.y - pad,
            width: Math.max(8, bounds.width + pad * 2),
            height: Math.max(8, bounds.height + pad * 2),
            cornerRadius: 3
        });
        pill.moveToTop();
        shape.moveToTop();
        this.layer?.batchDraw();
    }

    attachAnnotationSelectionPill(shape) {
        if (!this.supportsAnnotationSelectionPill(shape)) {
            return;
        }

        const parent = shape.getParent();
        if (!parent || typeof CitranaSelection === 'undefined') {
            return;
        }

        if (isTaperedPen(shape)) {
            if (!shape._selectionPill) {
                const pill = new Konva.Rect({
                    name: CitranaSelection.PILL_NAME,
                    fillEnabled: false,
                    stroke: 'rgba(107, 114, 128, 0.75)',
                    strokeWidth: 1.5,
                    dash: [4, 3],
                    listening: false,
                    cornerRadius: 3
                });
                parent.add(pill);
                shape._selectionPill = pill;
            } else {
                shape._selectionPill.fillEnabled(false);
            }
            this.syncPenSelectionPill(shape);
            return;
        }

        CitranaSelection.attach(shape, parent, this.getAnnotationSelectionExtraPadding(shape));
    }

    detachAnnotationSelectionPill(shape) {
        if (shape && this.supportsAnnotationSelectionPill(shape)) {
            CitranaSelection?.detach?.(shape);
        }
    }

    bindAnnotationPillSync(shape) {
        if (!shape || shape._annotationPillSyncBound || !this.supportsAnnotationSelectionPill(shape)) {
            return;
        }

        shape._annotationPillSyncBound = true;
        shape.on('dragmove', () => {
            if (this.selectedShape === shape) {
                if (isTaperedPen(shape)) {
                    this.syncPenSelectionPill(shape);
                } else {
                    CitranaSelection?.sync?.(shape, this.getAnnotationSelectionExtraPadding(shape));
                }
            }
        });
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

    /**
     * Client coordinates from mouse or touch DOM events.
     * @param {MouseEvent|TouchEvent} domEvt
     * @returns {{ x: number, y: number }}
     */
    getDomEventClientXY(domEvt) {
        const touch = domEvt?.touches?.[0] || domEvt?.changedTouches?.[0];
        if (touch) {
            return { x: touch.clientX, y: touch.clientY };
        }

        return { x: domEvt.clientX, y: domEvt.clientY };
    }

    /**
     * Whether touch handlers should skip preventDefault so Konva drag can run.
     * @param {Konva.Node|null} target
     * @returns {boolean}
     */
    shouldPreserveTouchDrag(target) {
        const name = target?.name?.() || '';

        if (name === 'control-point-start' ||
            name === 'control-point-end' ||
            name.startsWith('planet-') ||
            name.startsWith('planet-hit-')) {
            return true;
        }

        if (this.isDraggingControlPoint || this.isPenDragActive) {
            return true;
        }

        if (window.app?.currentTool === 'select') {
            return name.startsWith('bounding-box-') || name.startsWith('drawing-');
        }

        return false;
    }

    /**
     * Move a pen stroke by pointer delta on touch (Konva startDrag is unreliable after touchmove).
     * @param {Konva.Node} penShape
     * @param {Konva.Rect} boundingBox
     * @param {Konva.KonvaEventObject} startEvt
     */
    beginManualPenDrag(penShape, boundingBox, startEvt) {
        const stage = penShape.getStage();
        if (!stage || !startEvt?.evt) {
            return;
        }

        let last = this.getDomEventClientXY(startEvt.evt);
        this.isPenDragActive = true;
        penShape.fire('dragstart', { evt: startEvt.evt });

        const onDragMove = (moveEvt) => {
            const cur = this.getDomEventClientXY(moveEvt.evt);
            const scale = stage.scaleX() || 1;
            penShape.position({
                x: penShape.x() + (cur.x - last.x) / scale,
                y: penShape.y() + (cur.y - last.y) / scale
            });
            last = cur;
            this.updateBoundingBox(boundingBox, penShape);
            penShape.fire('dragmove', { evt: moveEvt.evt });
            this.layer.batchDraw();
        };

        const onDragEnd = (upEvt) => {
            stage.off('mousemove.penManual touchmove.penManual', onDragMove);
            stage.off('mouseup.penManual touchend.penManual touchcancel.penManual', onDragEnd);
            this.isPenDragActive = false;
            penShape.fire('dragend', { evt: upEvt?.evt });
        };

        stage.on('mousemove.penManual touchmove.penManual', onDragMove);
        stage.on('mouseup.penManual touchend.penManual touchcancel.penManual', onDragEnd);
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
            strokeWidth: 4,
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
        this.applyDrawingHitTarget(line, 'line');
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
        this.penLastSampleTime = performance.now();

        const line = new Konva.Line({
            points: [pos.x, pos.y],
            stroke: '#FF0000',
            strokeWidth: PEN_DEFAULT_STROKE_WIDTH,
            lineCap: 'round',
            lineJoin: 'round',
            name: 'drawing-pen',
            opacity: 1,
            perfectDrawEnabled: false,
            listening: true,
            draggable: false, // Will be enabled when select tool is active
            tension: PEN_TENSION
        });
        line.setAttr('penSampleTimes', [this.penLastSampleTime]);

        // Create invisible bounding box for easier selection
        const boundingBox = this.createBoundingBox(line, 'pen');
        line.boundingBox = boundingBox;

        this.currentShape = line;
        this.applyDrawingHitTarget(line, 'pen');
        this.layer.add(line);
        this.layer.add(boundingBox);
        this.raiseDrawingsAboveChart();
        this.layer.batchDraw();
    }

    updatePen(pos) {
        if (!this.currentShape) return;

        const points = this.currentShape.points();
        points.push(pos.x, pos.y);
        this.currentShape.points(points);

        const sampleTimes = this.currentShape.getAttr('penSampleTimes') || [];
        sampleTimes.push(performance.now());
        this.currentShape.setAttr('penSampleTimes', sampleTimes);

        // Update bounding box if it exists
        if (this.currentShape.boundingBox) {
            this.updateBoundingBox(this.currentShape.boundingBox, this.currentShape);
        }

        this.layer.batchDraw();
    }

    startLaser(pos) {
        if (typeof CitranaLaser === 'undefined') return;
        CitranaLaser.startStroke(pos);
    }

    updateLaser(pos) {
        if (typeof CitranaLaser === 'undefined') return;
        CitranaLaser.extendStroke(pos);
    }

    clearLaser() {
        if (typeof CitranaLaser !== 'undefined') {
            CitranaLaser.clear();
        }
    }

    /**
     * Light 3-point moving average on pen points (endpoints unchanged).
     * @param {number[]} flatPoints
     * @returns {number[]}
     */
    smoothPenPoints(flatPoints) {
        if (!flatPoints || flatPoints.length < 8) {
            return flatPoints;
        }

        const smoothed = [flatPoints[0], flatPoints[1]];
        for (let i = 2; i < flatPoints.length - 2; i += 2) {
            const x0 = flatPoints[i - 2];
            const y0 = flatPoints[i - 1];
            const x1 = flatPoints[i];
            const y1 = flatPoints[i + 1];
            const x2 = flatPoints[i + 2];
            const y2 = flatPoints[i + 3];
            smoothed.push(
                0.25 * x0 + 0.5 * x1 + 0.25 * x2,
                0.25 * y0 + 0.5 * y1 + 0.25 * y2
            );
        }
        smoothed.push(flatPoints[flatPoints.length - 2], flatPoints[flatPoints.length - 1]);
        return smoothed;
    }

    /**
     * Finalise a pen stroke: smooth, taper width, and render as a custom shape.
     * @param {Konva.Line|Konva.Shape} line
     * @returns {Konva.Shape|Konva.Line}
     */
    finishPenStroke(line) {
        if (!line || typeof line.points !== 'function') {
            return line;
        }

        let points = this.smoothPenPoints(line.points());
        points = chaikinPenPoints(points);

        if (points.length < 4) {
            line.opacity(1);
            line.tension(PEN_TENSION);
            if (line.boundingBox) {
                this.updateBoundingBox(line.boundingBox, line);
            }
            return line;
        }

        const sampleTimes = line.getAttr('penSampleTimes') || [];
        const baseWidth = line.strokeWidth() || PEN_DEFAULT_STROKE_WIDTH;
        const color = line.stroke();
        const widths = computePenTaperWidths(points, sampleTimes, baseWidth);

        return this.replaceWithTaperedPen(line, points, widths, color, baseWidth);
    }

    /**
     * @param {Konva.Line} line
     * @param {number[]} points
     * @param {number[]} widths
     * @param {string} color
     * @param {number} baseWidth
     * @returns {Konva.Shape}
     */
    replaceWithTaperedPen(line, points, widths, color, baseWidth) {
        const layer = this.layer;
        const zIndex = line.zIndex();
        const boundingBox = line.boundingBox;
        const offsetX = line.x();
        const offsetY = line.y();

        const shape = new Konva.Shape({
            name: 'drawing-pen',
            x: offsetX,
            y: offsetY,
            rotation: line.rotation(),
            scaleX: line.scaleX(),
            scaleY: line.scaleY(),
            draggable: line.draggable(),
            listening: line.listening(),
            opacity: 1,
            perfectDrawEnabled: false
        });

        shape.setAttr('penTaper', true);
        shape.setAttr('penTaperPoints', toLocalPenPoints(points, offsetX, offsetY));
        shape.setAttr('penTaperWidths', widths);
        shape.setAttr('penStrokeColor', color);
        shape.setAttr('penBaseWidth', baseWidth);
        configureTaperedPenShape(shape);

        layer.add(shape);
        shape.zIndex(zIndex);

        if (boundingBox) {
            boundingBox.actualShape = shape;
            shape.boundingBox = boundingBox;
            this.updateBoundingBox(boundingBox, shape);
            boundingBox.moveToTop();
        }

        line.destroy();
        return shape;
    }

    syncPenTaperWidth(shape, newBaseWidth) {
        if (!isTaperedPen(shape)) {
            return;
        }

        const oldBase = shape.getAttr('penBaseWidth') || PEN_DEFAULT_STROKE_WIDTH;
        if (!oldBase) {
            return;
        }

        const ratio = newBaseWidth / oldBase;
        const widths = shape.getAttr('penTaperWidths') || [];
        shape.setAttr('penBaseWidth', newBaseWidth);
        shape.setAttr('penTaperWidths', widths.map((width) => width * ratio));
        shape.getLayer()?.batchDraw();

        if (shape.boundingBox) {
            this.updateBoundingBox(shape.boundingBox, shape);
        }
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
            fill: '#000000',
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

        this.editUI?.hide();

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
        textarea.style.minHeight = (scaledFontSize + 4) + 'px';
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

        this.syncInlineTextareaHeight(textarea, scaledFontSize + 4);
        this.focusInlineTextarea(textarea);

        this.detachAnnotationSelectionPill(text);

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

            if (this.selectedShape === text) {
                this.attachAnnotationSelectionPill(text);
            }

            if (save && committedText !== initialText) {
                window.app?.recordHistory('Edit text');
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
            text.text(textarea.value || 'Double-click to edit');
            textarea.style.width = Math.max(100, text.width()) + 'px';
            this.syncInlineTextareaHeight(textarea, scaledFontSize + 4);
            this.layer.batchDraw();
        };

        textarea.addEventListener('blur', handleBlur);
        textarea.addEventListener('input', handleLivePreview);
        document.addEventListener('keydown', handleKeyDown);

        setTimeout(() => {
            document.addEventListener('click', handleOutsideClick);
        }, 100);
    }

    clearAll() {
        this.clearLaser();
        this.clearSelection();

        const drawingObjects = this.layer.find(node => {
            const name = node.name();
            return name && (
                name.startsWith('drawing-') ||
                name.startsWith('bounding-box-') ||
                name === CitranaSelection?.PILL_NAME
            );
        });

        drawingObjects.forEach(shape => {
            shape.destroy();
        });

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

            this.bindRestoredDrawingInteractions(shape);
        });

        this.syncBoundingBoxListening();
        this.raiseDrawingsAboveChart();
        this.updateDrawingObjectsDraggable(this.currentTool === 'select');
        this.layer.batchDraw();
    }

    /**
     * Re-attach interaction handlers after undo/redo or session restore.
     * @param {Konva.Node} shape
     */
    bindRestoredDrawingInteractions(shape) {
        if (!shape || !shape.name()) {
            return;
        }

        const shapeName = shape.name();
        let toolType = null;

        if (shapeName === 'drawing-text') {
            toolType = 'text';
            this.makeTextEditable(shape);
            shape.on('click', (e) => {
                e.cancelBubble = true;
                this.showEditUI(shape, 'text');
            });
            if (this.isTouchDevice) {
                this.addDoubleTapSupport(shape, 'text');
            }
        } else if (shapeName === 'drawing-heading') {
            toolType = 'heading';
            this.makeHeadingEditable(shape);
        } else if (shapeName.includes('drawing-arrow')) {
            toolType = 'arrow';
            shape.on('click', () => {
                this.showEditUI(shape, 'arrow');
            });
        } else if (shapeName === 'drawing-line') {
            toolType = 'line';
            shape.on('click', () => {
                this.showEditUI(shape, 'line');
            });
        } else if (shapeName.includes('drawing-pen')) {
            toolType = 'pen';
            if (isTaperedPen(shape)) {
                configureTaperedPenShape(shape);
            }
            if (shape.boundingBox) {
                this.updateBoundingBox(shape.boundingBox, shape);
            }
        } else {
            shape.on('click tap', (e) => {
                e.cancelBubble = true;
                this.showEditUIForShape(shape);
            });
        }

        this.makeShapeSelectable(shape, toolType);
        if (toolType === 'line' || toolType === 'pen') {
            this.applyDrawingHitTarget(shape, toolType);
        }
        this.syncBoundingBoxListening();
    }

    getDrawingHitStrokeWidth() {
        return CitranaDevice.isMobileUA() ? 28 : 18;
    }

    /**
     * Track double-click / double-tap activation for pen edit (click-based detectors).
     * @param {number|string} shapeId
     * @param {number} [windowMs]
     * @returns {boolean} True when this event completes a double-activation.
     */
    trackPenEditActivation(shapeId, windowMs = PEN_EDIT_ACTIVATION_MS) {
        const now = Date.now();

        if (this._penEditActivation?.id === shapeId && now - this._penEditActivation.time < windowMs) {
            this._penEditActivation = null;
            return true;
        }

        this._penEditActivation = { id: shapeId, time: now };
        return false;
    }

    /**
     * True while waiting for a second click/tap to open pen edit (suppresses drag start).
     * @param {number|string} shapeId
     * @param {number} [windowMs]
     * @returns {boolean}
     */
    isPenEditActivationPending(shapeId, windowMs = PEN_EDIT_ACTIVATION_MS) {
        const activation = this._penEditActivation;
        if (!activation || activation.id !== shapeId) {
            return false;
        }

        return Date.now() - activation.time < windowMs;
    }

    /**
     * Single gesture entry for pen edit — all double-click/tap detectors funnel here.
     * @param {Konva.Node} shape
     * @param {Konva.KonvaEventObject} [evt]
     * @param {{ cancelPendingDrag?: () => void }} [options]
     */
    requestPenEdit(shape, evt, options = {}) {
        if (evt) {
            evt.cancelBubble = true;
        }

        options.cancelPendingDrag?.();

        const penShape = this.normalizeDrawingShape(shape);
        penShape?.stopDrag?.();
        this.editPenAnnotation(penShape, evt);
    }

    /**
     * Open pen style controls — same path as Items menu → Edit.
     * @param {Konva.Node} shape
     * @param {Konva.KonvaEventObject} [e]
     */
    editPenAnnotation(shape, e) {
        shape = this.normalizeDrawingShape(shape);
        if (!shape?.name?.()?.includes('drawing-pen')) {
            return;
        }

        const now = Date.now();
        if (this._penEditLast?.id === shape._id && now - this._penEditLast.time < 120) {
            return;
        }
        this._penEditLast = { id: shape._id, time: now };

        if (e) {
            e.cancelBubble = true;
        }

        this.clearControlPoints();
        shape.stopDrag?.();

        if (window.app?.currentTool !== 'select') {
            window.app?.setTool?.('select');
        }

        this.selectShape(shape);
        this.showEditUI(shape, 'pen');
        this.raiseDrawingsAboveChart();
    }

    applyDrawingHitTarget(shape, toolType) {
        if (!shape) {
            return;
        }

        if (toolType === 'line' || (toolType === 'pen' && !isTaperedPen(shape))) {
            shape.hitStrokeWidth(this.getDrawingHitStrokeWidth());
        }
    }

    syncBoundingBoxListening() {
        this.repairPenPickRects();

        const enablePick = this.currentTool === 'select' || window.app?.currentTool === 'select';

        this.layer.find((node) => {
            const name = node.name();
            return name && name.startsWith('bounding-box-');
        }).forEach((box) => {
            // Invisible on canvas (opacity 0) but hittable — avoids faint grey from rgba(0,0,0,0.01).
            const fill = box.fill?.();
            if (box.opacity?.() !== 0 ||
                fill === 'rgba(0,0,0,0.01)' ||
                fill === 'rgba(0,0,0,0)' ||
                box.fillEnabled?.() === false) {
                box.fill('#000000');
                box.opacity(0);
                box.fillEnabled(true);
            }
            if (!box._pickHitFuncBound) {
                box._pickHitFuncBound = true;
                box.hitFunc((context, node) => {
                    context.beginPath();
                    context.rect(0, 0, node.width(), node.height());
                    context.closePath();
                    context.fillStrokeShape(node);
                });
            }
            // Invisible pick rects block Graha drag when listening — only enable in Select tool.
            box.listening(enablePick);
            if (enablePick) {
                box.moveToTop();
            }
        });

        this.layer.find((node) => {
            const name = node.name() || '';
            return name.includes('drawing-pen');
        }).forEach((shape) => {
            if (shape.boundingBox) {
                this.updateBoundingBox(shape.boundingBox, shape);
            }
        });

        this.raiseControlPointsAbovePickRects();
    }

    /**
     * Keep arrow/line endpoint handles above invisible pick rects so they stay draggable.
     */
    raiseControlPointsAbovePickRects() {
        this.controlPoints.startPoint?.moveToTop();
        this.controlPoints.endPoint?.moveToTop();
    }

    /**
     * Resolve a drawing node under the pointer when the event target is the stage/chart.
     * @param {Konva.KonvaEventObject} e
     * @returns {Konva.Node|null}
     */
    /**
     * Layer-space bounds for tapered pen shapes (getClientRect is empty on custom Konva.Shape).
     * @param {Konva.Shape} shape
     * @returns {{ x: number, y: number, width: number, height: number }}
     */
    getTaperedPenBoundsInLayer(shape) {
        const points = shape.getAttr('penTaperPoints') || [];
        if (points.length < 4) {
            return shape.getClientRect({ relativeTo: this.layer });
        }

        const widths = shape.getAttr('penTaperWidths') || [];
        const ox = shape.x();
        const oy = shape.y();
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        for (let i = 0; i < points.length; i += 2) {
            const index = i / 2;
            const half = Math.max(2, ((widths[index] || 0) + (widths[index + 1] || widths[index] || 0)) / 2);
            const px = points[i] + ox;
            const py = points[i + 1] + oy;
            minX = Math.min(minX, px - half);
            minY = Math.min(minY, py - half);
            maxX = Math.max(maxX, px + half);
            maxY = Math.max(maxY, py + half);
        }

        return {
            x: minX,
            y: minY,
            width: Math.max(8, maxX - minX),
            height: Math.max(8, maxY - minY)
        };
    }

    /**
     * Find the topmost drawing pick-rect or stroke under a layer-space point.
     * @param {{ x: number, y: number }} pos
     * @returns {Konva.Node|null}
     */
    findDrawingAtLayerPoint(pos) {
        if (!pos || !this.layer) {
            return null;
        }

        const boxes = this.layer.find((node) => {
            const name = node.name() || '';
            return name.startsWith('bounding-box-');
        });

        for (let i = boxes.length - 1; i >= 0; i--) {
            const box = boxes[i];
            const shape = box.actualShape;
            if (!shape?.getParent?.()) {
                continue;
            }

            const x = box.x();
            const y = box.y();
            const w = box.width();
            const h = box.height();
            if (w > 0 && h > 0 &&
                pos.x >= x && pos.x <= x + w &&
                pos.y >= y && pos.y <= y + h) {
                return shape;
            }
        }

        return null;
    }

    /**
     * Remove orphan pen pick rects and refresh links/sizes for tapered strokes.
     */
    repairPenPickRects() {
        if (!this.layer) {
            return;
        }

        this.layer.find((node) => {
            const name = node.name() || '';
            return name.startsWith('bounding-box-pen');
        }).forEach((box) => {
            const shape = box.actualShape;
            if (!shape?.getParent?.()) {
                box.destroy();
            }
        });

        this.layer.find((node) => {
            const name = node.name() || '';
            return name.includes('drawing-pen');
        }).forEach((shape) => {
            if (shape.boundingBox && !shape.boundingBox.getParent()) {
                shape.boundingBox = null;
            }

            if (shape.boundingBox) {
                shape.boundingBox.actualShape = shape;
                this.updateBoundingBox(shape.boundingBox, shape);
            }
        });
    }

    resolveDrawingHitTarget(e) {
        const direct = e?.target;
        const directName = direct?.name?.() || '';

        if (directName.startsWith('bounding-box-')) {
            return this.normalizeDrawingShape(direct);
        }

        if (directName.startsWith('drawing-')) {
            return direct;
        }

        const pos = this.getPrecisePositionFromKonva(e);
        const byPoint = pos ? this.findDrawingAtLayerPoint(pos) : null;
        if (byPoint) {
            return this.normalizeDrawingShape(byPoint) || byPoint;
        }

        const pointer = this.stage?.getPointerPosition?.();
        if (!pointer) {
            return null;
        }

        const hit = this.stage.getIntersection(pointer);
        return this.normalizeDrawingShape(hit);
    }

    /**
     * Select tool: double-click a pen stroke to open Edit UI (stage-level fallback).
     * @param {Konva.KonvaEventObject} e
     */
    handleSelectDoubleClick(e) {
        if (window.app?.currentTool !== 'select') {
            return;
        }

        const shape = this.resolveDrawingHitTarget(e);
        if (shape?.name?.()?.includes('drawing-pen')) {
            this.requestPenEdit(shape, e);
        }
    }

    /**
     * Manual double-click detection for pen strokes (Konva dblclick is unreliable).
     * @param {Konva.KonvaEventObject} e
     */
    handleSelectPenClick(e) {
        if (window.app?.currentTool !== 'select' || !e) {
            return;
        }

        const shape = this.resolveDrawingHitTarget(e) || this.selectedShape;
        if (!shape?.name?.()?.includes('drawing-pen')) {
            this._penEditActivation = null;
            return;
        }

        if (this.trackPenEditActivation(shape._id)) {
            this.requestPenEdit(shape, e);
        }
    }

    /**
     * Keep annotations above North Indian rashi indicator boxes (and chart content).
     */
    raiseDrawingsAboveChart() {
        if (!this.layer) {
            return;
        }

        const drawingNodes = this.layer.find((node) => {
            const name = node.name() || '';
            return name.startsWith('drawing-') ||
                name.startsWith('bounding-box-') ||
                name === CitranaSelection?.PILL_NAME ||
                name === 'control-point-start' ||
                name === 'control-point-end';
        });

        drawingNodes.forEach((node) => node.moveToTop());
        this.controlPoints.startPoint?.moveToTop();
        this.controlPoints.endPoint?.moveToTop();

        // Pick rects must sit above tapered pen Konva.Shape nodes for reliable hit testing.
        this.layer.find((node) => {
            const name = node.name() || '';
            return name.startsWith('drawing-');
        }).forEach((shape) => {
            shape.boundingBox?.moveToTop();
        });

        this.raiseControlPointsAbovePickRects();
    }

    getControlPointBaseRadius() {
        return CitranaDevice.isMobileUA() ? 12 : 6;
    }

    restoreCanvasCursor() {
        const tool = window.app?.currentTool;
        if (window.app?.setCanvasCursor) {
            if (tool === 'hand') {
                window.app.setCanvasCursor('grab');
            } else if (tool === 'select') {
                window.app.setCanvasCursor('default');
            } else {
                window.app.setCanvasCursor('crosshair');
            }
            return;
        }

        const container = document.getElementById('canvas-container');
        if (!container) {
            return;
        }

        if (tool === 'hand') {
            container.style.cursor = 'grab';
        } else if (tool === 'select') {
            container.style.cursor = 'default';
        } else {
            container.style.cursor = 'crosshair';
        }
    }

    /**
     * @param {Konva.Circle} circle
     * @param {'idle'|'hover'|'active'} state
     * @param {number} [baseRadius]
     */
    applyControlPointStyle(circle, state, baseRadius) {
        if (!circle) {
            return;
        }

        const radius = baseRadius ?? circle._cpBaseRadius ?? this.getControlPointBaseRadius();

        if (state === 'hover') {
            circle.fill('#000000');
            circle.stroke('#ffffff');
            circle.strokeWidth(2);
            circle.radius(radius * 1.2);
        } else if (state === 'active') {
            circle.fill('#000000');
            circle.stroke('#ffffff');
            circle.strokeWidth(2);
            circle.radius(radius * 1.15);
        } else {
            circle.fill('#ffffff');
            circle.stroke('#000000');
            circle.strokeWidth(2);
            circle.radius(radius);
        }
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {string} name
     * @param {number} baseRadius
     * @returns {Konva.Circle}
     */
    createControlPointCircle(x, y, name, baseRadius) {
        const circle = new Konva.Circle({
            x,
            y,
            radius: baseRadius,
            fill: '#ffffff',
            stroke: '#000000',
            strokeWidth: 2,
            name,
            listening: true,
            draggable: true,
            hitStrokeWidth: CitranaDevice.isMobileUA() ? 0 : 10
        });

        circle._cpBaseRadius = baseRadius;
        this.bindControlPointHover(circle);
        return circle;
    }

    /**
     * Desktop hover and drag feedback for arrow/line control points.
     * @param {Konva.Circle} circle
     */
    bindControlPointHover(circle) {
        const container = document.getElementById('canvas-container');
        const supportsHover = typeof window !== 'undefined' &&
            window.matchMedia('(hover: hover) and (pointer: fine)').matches;

        const resetToIdle = () => {
            this.applyControlPointStyle(circle, 'idle');
            this.restoreCanvasCursor();
            this.layer?.batchDraw();
        };

        const setActive = () => {
            this.applyControlPointStyle(circle, 'active');
            if (container) {
                container.style.cursor = 'grabbing';
            }
            this.layer?.batchDraw();
        };

        if (supportsHover) {
            circle.on('mouseenter', () => {
                if (this.isDraggingControlPoint) {
                    return;
                }

                this.applyControlPointStyle(circle, 'hover');
                if (container) {
                    container.style.cursor = 'grab';
                }
                this.layer?.batchDraw();
            });

            circle.on('mouseleave', () => {
                if (!this.isDraggingControlPoint) {
                    resetToIdle();
                }
            });
        }

        circle.on('dragstart', setActive);
        circle.on('dragend', () => {
            requestAnimationFrame(() => {
                const stage = circle.getStage();
                const pointer = stage?.getPointerPosition();

                if (supportsHover && pointer && stage.getIntersection(pointer) === circle) {
                    this.applyControlPointStyle(circle, 'hover');
                    if (container) {
                        container.style.cursor = 'grab';
                    }
                    this.layer?.batchDraw();
                    return;
                }

                resetToIdle();
            });
        });
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
        if (points.length < 4) return;

        const cpRadius = this.getControlPointBaseRadius();

        // Clear existing control points
        this.clearControlPoints();

        // Create start control point
        this.controlPoints.startPoint = this.createControlPointCircle(
            points[0],
            points[1],
            'control-point-start',
            cpRadius
        );

        // Create end control point
        this.controlPoints.endPoint = this.createControlPointCircle(
            points[2],
            points[3],
            'control-point-end',
            cpRadius
        );

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

                // Remove shape's position offset
                let localX = controlX - shapeX;
                let localY = controlY - shapeY;

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

                // Remove shape's position offset
                let localX = controlX - shapeX;
                let localY = controlY - shapeY;

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
        this.syncBoundingBoxListening();
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

        const shapeX = shape.x();
        const shapeY = shape.y();
        const scaleX = shape.scaleX();
        const scaleY = shape.scaleY();

        const startPoint = {
            x: points[0] * scaleX,
            y: points[1] * scaleY
        };

        const endPoint = {
            x: points[2] * scaleX,
            y: points[3] * scaleY
        };

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

        const name = shape.name();
        if (name.includes('drawing-pen')) {
            return false;
        }

        return name.includes('drawing-arrow') || name.includes('drawing-line');
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
        this.syncBoundingBoxListening();
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

        citranaDebug(`Updated ${drawingObjects.length} drawing objects to draggable: ${draggable}`);
    }

    /**
     * Clear current selection
     */
    clearSelection() {
        this.stopControlPointSyncLoop();
        if (this.selectedShape) {
            this.detachAnnotationSelectionPill(this.selectedShape);
            this.selectedShape = null;
        }
        this.clearControlPoints();
        this.syncBoundingBoxListening(null);
        this.layer.batchDraw();
        window.app?.notifyCanvasSelectionChanged?.();
    }

    /**
     * Select a drawing object
     * @param {KonvaObject} shape - The shape to select
     */
    selectShape(shape) {
        shape = this.normalizeDrawingShape(shape);
        window.app?.clearPlanetSelection?.();
        this.clearSelection();

        if (shape && shape.name() && shape.name().startsWith('drawing-')) {
            this.selectedShape = shape;

            if (window.app?.currentTool === 'select' && shape.name().includes('drawing-pen')) {
                shape.draggable(true);
            }

            // Show control points for arrow and line shapes
            if (this.supportsControlPoints(shape)) {
                this.createControlPoints(shape);
                this.updateControlPointsPosition(shape); // Immediate sync
                this.startControlPointSyncLoop(shape); // Per-frame sync
            }

            if (this.supportsAnnotationSelectionPill(shape)) {
                this.attachAnnotationSelectionPill(shape);
            }

            this.syncBoundingBoxListening();
            this.layer.batchDraw();
        }
        window.app?.notifyCanvasSelectionChanged?.();
    }

    /**
     * Handle mouse down for select tool (desktop)
     * @param {Object} pos - Mouse position
     * @param {KonvaEvent} e - Konva event
     */
    handleSelectMouseDown(pos, e) {
        if (!pos) return;

        let clickedShape = e.target;

        // Check if clicked on a control point
        if (clickedShape && (
                clickedShape.name() === 'control-point-start' ||
                clickedShape.name() === 'control-point-end'
            )) {
            // Let the control point handle its own dragging
            return;
        }

        const resolved = this.resolveDrawingHitTarget(e);
        if (resolved) {
            clickedShape = resolved;
        } else if ((e.target?.name?.() || '').startsWith('bounding-box-')) {
            const fromBox = this.normalizeDrawingShape(e.target);
            if (fromBox) {
                clickedShape = fromBox;
            }
        }

        // Check if clicked on a drawing object or its bounding box
        if (clickedShape && clickedShape.name() && clickedShape.name().startsWith('drawing-')) {
            this.selectShape(clickedShape);
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

        let clickedShape = e.target;

        // Check if clicked on a control point
        if (clickedShape && (
                clickedShape.name() === 'control-point-start' ||
                clickedShape.name() === 'control-point-end'
            )) {
            // Let the control point handle its own dragging
            return;
        }

        const resolved = this.resolveDrawingHitTarget(e);
        if (resolved) {
            clickedShape = resolved;
        } else if ((e.target?.name?.() || '').startsWith('bounding-box-')) {
            const fromBox = this.normalizeDrawingShape(e.target);
            if (fromBox) {
                clickedShape = fromBox;
            }
        }

        if (clickedShape && clickedShape.name() && clickedShape.name().startsWith('drawing-')) {
            this.selectShape(clickedShape);

            // Add double-tap detection for Edit UI
            this.setupDoubleTapForEditUI(clickedShape);
        } else {
            // Clicked on empty space, clear selection
            this.clearSelection();
        }
    }

    /**
     * Handle touch up for select tool
     */
    handleSelectTouchUp() {
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
                    const target = this.normalizeDrawingShape(shape);
                    if (target?.name?.()?.includes('drawing-pen')) {
                        this.requestPenEdit(target, e);
                    } else {
                        this.showEditUIForShape(shape);
                    }
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
     * Handle mouse up for select tool
     */
    handleSelectMouseUp() {
    }

    /**
     * Delete the currently selected shape
     */
    deleteSelectedShape() {
        if (!this.selectedShape) return;

        this.clearControlPoints();
        this.detachAnnotationSelectionPill(this.selectedShape);

        // Remove bounding box if it exists
        if (this.selectedShape.boundingBox) {
            this.selectedShape.boundingBox.destroy();
            this.selectedShape.boundingBox = null;
        }

        // Remove the shape
        this.selectedShape.destroy();
        this.selectedShape = null;

        // Hide Edit UI
        if (this.editUI) {
            this.editUI._skipHistoryOnHide = true;
            this.editUI.hide();
        }

        this.repairPenPickRects();
        this.syncBoundingBoxListening();
        this.raiseDrawingsAboveChart();
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
        };

        const handleSave = () => this.dismissPlanetEditing();
        const handleCancel = () => this.cancelPlanetEditing();

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
                this.dismissPlanetEditing();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                this.cancelPlanetEditing();
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
     * Dismiss the Graha edit bar (e.g. click outside, open drawing Edit UI, Presentation View).
     * Commits label, colour, and retrograde if the session was edited — same as Save.
     */
    dismissPlanetEditing() {
        if (this.planetEditSession?.finish) {
            this.planetEditSession.finish(true);
        }
    }

    /**
     * Discard in-progress Graha edits and close the edit bar (Cancel button / Escape).
     */
    cancelPlanetEditing() {
        if (this.planetEditSession?.finish) {
            this.planetEditSession.finish(false);
        }
    }

    /**
     * Open the inline textarea editor for text or heading annotations.
     * @param {Konva.Text} shape
     */
    startInlineContentEdit(shape) {
        if (!shape || !shape.name()) {
            return;
        }

        const name = shape.name();
        if (name.includes('drawing-heading')) {
            this.editHeading(shape);
        } else if (name.includes('drawing-text')) {
            this.editText(shape);
        }
    }

    /**
     * Focus an inline Konva textarea and open the mobile keyboard when possible.
     * @param {HTMLTextAreaElement} textarea
     * @param {boolean} allowRetry
     */
    focusInlineTextarea(textarea, allowRetry = true) {
        if (!textarea) {
            return;
        }

        textarea.focus({ preventScroll: true });

        try {
            const length = textarea.value.length;
            textarea.setSelectionRange(0, length);
        } catch (_) {
            textarea.select();
        }

        if (this.isTouchDevice && allowRetry) {
            setTimeout(() => {
                if (document.activeElement !== textarea) {
                    this.focusInlineTextarea(textarea, false);
                }
            }, 100);
        }
    }

    /**
     * Match inline textarea height to its content (multi-line headings).
     * @param {HTMLTextAreaElement} textarea
     * @param {number} minHeightPx
     */
    syncInlineTextareaHeight(textarea, minHeightPx) {
        if (!textarea) {
            return;
        }

        textarea.style.height = '0px';
        textarea.style.height = Math.max(minHeightPx, textarea.scrollHeight) + 'px';
    }

    /**
     * Show floating Edit UI for style controls (stroke, font, colour, delete).
     * Content edits use inline editors (editText / editHeading).
     * @param {Object} element - The Konva element to edit
     * @param {string} tool - The tool type
     */
    showEditUI(element, tool) {
        element = this.normalizeDrawingShape(element);
        if (!element) {
            return;
        }

        citranaDebug(`[EDIT UI] Showing Edit UI for ${tool} tool, element:`, element);

        // Dismiss any open Graha edit bar before showing drawing Edit UI (commits if edited)
        this.dismissPlanetEditing();

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
                        const target = this.normalizeDrawingShape(shape);
                        if (target?.name?.()?.includes('drawing-pen')) {
                            this.requestPenEdit(target, e);
                        } else {
                            this.showEditUIForShape(shape);
                        }
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
     * Inline heading editor (double-click / double-tap). Supports multiple lines (Shift+Enter).
     * @param {Konva.Text} heading
     */
    editHeading(heading) {
        // Prevent multiple textareas
        const existingTextarea = document.querySelector('.konva-textarea');
        if (existingTextarea) {
            existingTextarea.remove();
        }

        this.editUI?.hide();

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
        textarea.style.minHeight = (scaledFontSize + 8) + 'px';
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
        textarea.maxLength = 200;
        this.syncInlineTextareaHeight(textarea, scaledFontSize + 8);
        this.focusInlineTextarea(textarea);
        this.detachAnnotationSelectionPill(heading);

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

            if (this.selectedShape === heading) {
                this.attachAnnotationSelectionPill(heading);
            }

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
            textarea.style.width = Math.max(150, heading.width()) + 'px';
            this.syncInlineTextareaHeight(textarea, scaledFontSize + 8);
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
        if (isTaperedPen(shape)) {
            return this.getTaperedPenBoundsInLayer(shape);
        }

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
        if (CitranaDevice.isMobileUA()) {
            padding = 40; // Much larger for mobile
        }
        const bounds = this.getShapeBoundsInLayer(shape);

        const boundingBox = new Konva.Rect({
            x: bounds.x - padding,
            y: bounds.y - padding,
            width: Math.max(8, bounds.width + (padding * 2)),
            height: Math.max(8, bounds.height + (padding * 2)),
            fill: '#000000',
            opacity: 0,
            stroke: 'transparent',
            strokeWidth: 0,
            name: `bounding-box-${toolType}`,
            listening: false,
            draggable: false,
            perfectDrawEnabled: false
        });

        boundingBox.hitFunc((context, node) => {
            context.beginPath();
            context.rect(0, 0, node.width(), node.height());
            context.closePath();
            context.fillStrokeShape(node);
        });

        // Establish two-way relationship
        shape.boundingBox = boundingBox;
        boundingBox.actualShape = shape;

        const delegateEdit = (evt) => {
            if (evt) {
                evt.cancelBubble = true;
            }

            this.selectShape(shape);
            this.showEditUI(shape, toolType);
        };

        if (toolType !== 'pen') {
            boundingBox.on('click', delegateEdit);
            boundingBox.on('dblclick', delegateEdit);
            boundingBox.on('dbltap', delegateEdit);
        } else {
            this.bindPenPickRectInteraction(boundingBox, shape);
        }

        boundingBox.on('tap', (evt) => {
            // Delegate tap events to the shape
            if (shape._tapHandler) {
                shape._tapHandler(evt);
            }
        });

        // Update bounding box position when shape moves
        shape.on('dragmove', () => {
            this.updateBoundingBox(boundingBox, shape);
        });

        return boundingBox;
    }

    /**
     * Pen pick-rect: double-click opens Edit UI; drag starts only after a small move
     * so click / double-click are not swallowed by Konva drag.
     * @param {Konva.Rect} boundingBox
     * @param {Konva.Node} shape
     */
    bindPenPickRectInteraction(boundingBox, shape) {
        if (!boundingBox || !shape || boundingBox._penPickInteractionBound) {
            return;
        }

        boundingBox._penPickInteractionBound = true;

        const dragThreshold = CitranaDevice.isMobileUA() ? 10 : 6;
        let activeDragCleanup = null;

        if (!shape._penDragEndBound) {
            shape._penDragEndBound = true;
            shape.on('dragend.penPickClear', () => {
                this.isPenDragActive = false;
            });
        }

        const cancelPendingDrag = () => {
            if (activeDragCleanup) {
                activeDragCleanup();
                activeDragCleanup = null;
            }
        };

        boundingBox.on('click', (evt) => {
            if (window.app?.currentTool !== 'select') {
                return;
            }

            evt.cancelBubble = true;

            const id = shape._id;

            if (this.trackPenEditActivation(id)) {
                this.requestPenEdit(shape, evt, { cancelPendingDrag });
                return;
            }

            this.selectShape(shape);
        });

        boundingBox.on('mousedown touchstart', (evt) => {
            if (window.app?.currentTool !== 'select') {
                return;
            }

            const penShape = boundingBox.actualShape;
            if (!penShape) {
                return;
            }

            const stage = boundingBox.getStage();
            if (!stage || !evt?.evt) {
                return;
            }

            cancelPendingDrag();

            const origin = this.getDomEventClientXY(evt.evt);

            const cleanup = () => {
                stage.off('mousemove.penPick touchmove.penPick', onMove);
                stage.off('mouseup.penPick touchend.penPick touchcancel.penPick', onUp);
                if (activeDragCleanup === cleanup) {
                    activeDragCleanup = null;
                }
            };
            activeDragCleanup = cleanup;

            const onMove = (moveEvt) => {
                if (window.app?.currentTool !== 'select') {
                    cleanup();
                    return;
                }

                const pointer = this.getDomEventClientXY(moveEvt.evt);
                const dx = pointer.x - origin.x;
                const dy = pointer.y - origin.y;
                if (Math.hypot(dx, dy) >= dragThreshold) {
                    cleanup();
                    this._penEditActivation = null;
                    penShape.draggable(true);
                    this.beginManualPenDrag(penShape, boundingBox, evt);
                }
            };

            const onUp = () => cleanup();

            stage.on('mousemove.penPick touchmove.penPick', onMove);
            stage.on('mouseup.penPick touchend.penPick touchcancel.penPick', onUp);
        });
    }

    /**
     * Update bounding box position when shape moves
     * @param {KonvaRect} boundingBox - The bounding box to update
     * @param {KonvaShape} shape - The shape being moved
     */
    updateBoundingBox(boundingBox, shape) {
        // Use same padding logic as createBoundingBox
        let padding = 15;
        if (CitranaDevice.isMobileUA()) {
            padding = 40;
        }
        const bounds = this.getShapeBoundsInLayer(shape);

        boundingBox.setAttrs({
            x: bounds.x - padding,
            y: bounds.y - padding,
            width: Math.max(8, bounds.width + (padding * 2)),
            height: Math.max(8, bounds.height + (padding * 2))
        });

        this.layer.batchDraw();
    }
}