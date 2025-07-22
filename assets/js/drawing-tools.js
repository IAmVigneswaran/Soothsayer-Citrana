/**
 * Drawing Tools Class
 * Handles all drawing functionality (arrow, line, pen, text)
 */
class DrawingTools {
    constructor() {
        this.isDrawing = false;
        this.currentShape = null;
        this.undoStack = [];
        this.redoStack = [];
        this.maxUndoSteps = 50;
    }

    startDrawing(pos, tool) {
        if (!window.app?.stage) return;

        this.isDrawing = true;
        this.currentTool = tool;

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
        }
    }

    draw(pos, tool) {
        if (!this.isDrawing || !this.currentShape) return;

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
    }

    stopDrawing() {
        if (!this.isDrawing) return;

        this.isDrawing = false;
        
        if (this.currentShape) {
            this.addToUndoStack(this.currentShape);
            this.currentShape = null;
        }
    }

    startArrow(pos) {
        const arrow = new Konva.Arrow({
            points: [pos.x, pos.y, pos.x, pos.y],
            stroke: '#374151',
            strokeWidth: 2,
            fill: '#374151',
            pointerLength: 10,
            pointerWidth: 8,
            name: 'drawing-arrow'
        });

        this.currentShape = arrow;
        window.app.layer.add(arrow);
        window.app.layer.batchDraw();
    }

    updateArrow(pos) {
        if (!this.currentShape) return;

        const points = this.currentShape.points();
        points[2] = pos.x;
        points[3] = pos.y;
        this.currentShape.points(points);
        window.app.layer.batchDraw();
    }

    startLine(pos) {
        const line = new Konva.Line({
            points: [pos.x, pos.y, pos.x, pos.y],
            stroke: '#374151',
            strokeWidth: 2,
            name: 'drawing-line'
        });

        this.currentShape = line;
        window.app.layer.add(line);
        window.app.layer.batchDraw();
    }

    updateLine(pos) {
        if (!this.currentShape) return;

        const points = this.currentShape.points();
        points[2] = pos.x;
        points[3] = pos.y;
        this.currentShape.points(points);
        window.app.layer.batchDraw();
    }

    startPen(pos) {
        const line = new Konva.Line({
            points: [pos.x, pos.y],
            stroke: '#374151',
            strokeWidth: 2,
            lineCap: 'round',
            lineJoin: 'round',
            name: 'drawing-pen'
        });

        this.currentShape = line;
        window.app.layer.add(line);
        window.app.layer.batchDraw();
    }

    updatePen(pos) {
        if (!this.currentShape) return;

        const points = this.currentShape.points();
        points.push(pos.x, pos.y);
        this.currentShape.points(points);
        window.app.layer.batchDraw();
    }

    startText(pos) {
        const text = new Konva.Text({
            x: pos.x,
            y: pos.y,
            text: 'Text',
            fontSize: 16,
            fontFamily: 'Arial',
            fill: '#374151',
            draggable: true,
            name: 'drawing-text'
        });

        this.currentShape = text;
        window.app.layer.add(text);
        window.app.layer.batchDraw();

        // Make text editable
        this.makeTextEditable(text);
    }

    makeTextEditable(text) {
        text.on('dblclick', () => {
            // Create textarea over the text
            const textPosition = text.absolutePosition();
            const stageBox = window.app.stage.container().getBoundingClientRect();
            
            const areaPosition = {
                x: stageBox.left + textPosition.x,
                y: stageBox.top + textPosition.y
            };

            const textarea = document.createElement('textarea');
            document.body.appendChild(textarea);

            textarea.value = text.text();
            textarea.style.position = 'absolute';
            textarea.style.top = areaPosition.y + 'px';
            textarea.style.left = areaPosition.x + 'px';
            textarea.style.width = (text.width() - text.padding() * 2) + 'px';
            textarea.style.height = (text.height() - text.padding() * 2) + 'px';
            textarea.style.fontSize = text.fontSize() + 'px';
            textarea.style.border = 'none';
            textarea.style.padding = '0px';
            textarea.style.margin = '0px';
            textarea.style.overflow = 'hidden';
            textarea.style.background = 'none';
            textarea.style.outline = 'none';
            textarea.style.resize = 'none';
            textarea.style.lineHeight = text.lineHeight();
            textarea.style.fontFamily = text.fontFamily();
            textarea.style.transformOrigin = 'left top';
            textarea.style.textAlign = text.align();
            textarea.style.color = text.fill();
            textarea.style.zIndex = '1000';

            const scale = window.app.stage.scaleX();
            textarea.style.transform = `scale(${scale})`;

            textarea.focus();

            const removeTextarea = () => {
                textarea.parentNode.removeChild(textarea);
                window.removeEventListener('click', handleOutsideClick);
                text.setAttrs({
                    draggable: true
                });
            };

            textarea.addEventListener('blur', removeTextarea);
            textarea.addEventListener('keydown', (e) => {
                if (e.keyCode === 13 && !e.shiftKey) {
                    text.text(textarea.value);
                    removeTextarea();
                }
                if (e.keyCode === 27) {
                    removeTextarea();
                }
            });

            const handleOutsideClick = (e) => {
                if (e.target !== textarea) {
                    text.text(textarea.value);
                    removeTextarea();
                }
            };
            setTimeout(() => {
                document.addEventListener('click', handleOutsideClick);
            });

            text.setAttrs({
                draggable: false
            });
        });
    }

    addToUndoStack(shape) {
        this.undoStack.push(shape);
        this.redoStack = []; // Clear redo stack when new action is performed
        
        if (this.undoStack.length > this.maxUndoSteps) {
            this.undoStack.shift();
        }
    }

    undo() {
        if (this.undoStack.length === 0) return;

        const shape = this.undoStack.pop();
        this.redoStack.push(shape);
        
        shape.destroy();
        window.app.layer.batchDraw();
        
        console.log('Undo performed');
    }

    redo() {
        if (this.redoStack.length === 0) return;

        const shape = this.redoStack.pop();
        this.undoStack.push(shape);
        
        window.app.layer.add(shape);
        window.app.layer.batchDraw();
        
        console.log('Redo performed');
    }

    clearAll() {
        // Remove all drawing objects (not chart objects)
        const drawingObjects = window.app.layer.find(node => node.name() && node.name().startsWith('drawing-'));
        drawingObjects.forEach(obj => obj.destroy());
        window.app.layer.batchDraw();
        
        this.undoStack = [];
        this.redoStack = [];
        
        console.log('All drawings cleared');
    }

    getDrawingStats() {
        const arrows = window.app.layer.find('arrow').length;
        const lines = window.app.layer.find('line').length;
        const penStrokes = window.app.layer.find('pen').length;
        const texts = window.app.layer.find('text').length;
        
        return {
            arrows,
            lines,
            penStrokes,
            texts,
            total: arrows + lines + penStrokes + texts
        };
    }
} 