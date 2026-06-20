/**
 * citrana-arrow.js
 * Citrana • https://github.com/IAmVigneswaran/Soothsayer-Citrana
 * © 2026 Vigneswaran Rajkumar • Licensed under MIT License
 * Unified filled-arrow geometry (shaft + head as one shape for correct transparency)
 */
const CitranaArrow = (() => {
    const DEFAULTS = {
        strokeWidth: 4,
        pointerLength: 14,
        pointerWidth: 16,
        fill: '#FF0000'
    };

    function isArrow(shape) {
        return Boolean(shape?.name?.()?.includes('drawing-arrow'));
    }

    function getAnchors(shape) {
        const stored = shape.getAttr('arrowAnchors');
        if (Array.isArray(stored) && stored.length >= 4) {
            return stored.slice(0, 4);
        }

        if (shape instanceof Konva.Arrow) {
            const points = shape.points();
            return points.length >= 4 ? points.slice(0, 4) : [0, 0, 0, 0];
        }

        return [0, 0, 0, 0];
    }

    /**
     * Build a closed outline: constant-width shaft + prominent triangular head (no taper).
     * Shaft sides stay parallel; the head flares at a step, then meets at the tip.
     */
    function buildOutlinePoints(x1, y1, x2, y2, strokeWidth, pointerLength, pointerWidth) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const length = Math.sqrt(dx * dx + dy * dy);

        if (length < 0.001) {
            return [x1, y1, x1, y1, x1, y1, x1, y1, x1, y1, x1, y1, x1, y1];
        }

        const ux = dx / length;
        const uy = dy / length;
        const px = -uy;
        const py = ux;
        const halfShaft = strokeWidth / 2;
        const headWidth = Math.max(pointerWidth, strokeWidth + 6);
        const headLength = Math.max(pointerLength, strokeWidth * 2);
        const halfHead = headWidth / 2;
        const headLen = Math.min(headLength, length * 0.85);
        const baseX = x2 - ux * headLen;
        const baseY = y2 - uy * headLen;

        return [
            x1 + px * halfShaft, y1 + py * halfShaft,
            baseX + px * halfShaft, baseY + py * halfShaft,
            baseX + px * halfHead, baseY + py * halfHead,
            x2, y2,
            baseX - px * halfHead, baseY - py * halfHead,
            baseX - px * halfShaft, baseY - py * halfShaft,
            x1 - px * halfShaft, y1 - py * halfShaft
        ];
    }

    function rebuild(shape) {
        const [x1, y1, x2, y2] = getAnchors(shape);
        const strokeWidth = shape.getAttr('arrowStrokeWidth') ?? DEFAULTS.strokeWidth;
        const pointerLength = shape.getAttr('arrowPointerLength') ?? DEFAULTS.pointerLength;
        const pointerWidth = shape.getAttr('arrowPointerWidth') ?? DEFAULTS.pointerWidth;

        shape.points(buildOutlinePoints(x1, y1, x2, y2, strokeWidth, pointerLength, pointerWidth));
    }

    function setAnchors(shape, anchors) {
        shape.setAttr('arrowAnchors', anchors.slice(0, 4));
        rebuild(shape);
    }

    function setAnchor(shape, which, x, y) {
        const anchors = getAnchors(shape);
        if (which === 'start') {
            anchors[0] = x;
            anchors[1] = y;
        } else {
            anchors[2] = x;
            anchors[3] = y;
        }
        setAnchors(shape, anchors);
    }

    function setStrokeWidth(shape, width) {
        shape.setAttr('arrowStrokeWidth', width);
        rebuild(shape);
    }

    function create({
        x1,
        y1,
        x2,
        y2,
        fill = DEFAULTS.fill,
        strokeWidth = DEFAULTS.strokeWidth,
        pointerLength = DEFAULTS.pointerLength,
        pointerWidth = DEFAULTS.pointerWidth
    } = {}) {
        const anchors = [x1, y1, x2, y2];
        const arrow = new Konva.Line({
            points: buildOutlinePoints(x1, y1, x2, y2, strokeWidth, pointerLength, pointerWidth),
            closed: true,
            fill,
            strokeEnabled: false,
            name: 'drawing-arrow',
            perfectDrawEnabled: false,
            listening: true,
            draggable: false
        });

        arrow.setAttr('arrowAnchors', anchors);
        arrow.setAttr('arrowStrokeWidth', strokeWidth);
        arrow.setAttr('arrowPointerLength', pointerLength);
        arrow.setAttr('arrowPointerWidth', pointerWidth);

        return arrow;
    }

    /**
     * Convert a legacy Konva.Arrow (saved charts) into a unified filled arrow.
     * @param {Konva.Arrow} node
     * @returns {Konva.Line}
     */
    function fromLegacyNode(node) {
        const pickerColor = typeof CitranaColorPicker !== 'undefined'
            ? CitranaColorPicker.fromKonvaShape(node)
            : (node.fill() || node.stroke() || DEFAULTS.fill);
        const points = node.points();
        const anchors = points.length >= 4 ? points.slice(0, 4) : [0, 0, 0, 0];

        const arrow = create({
            x1: anchors[0],
            y1: anchors[1],
            x2: anchors[2],
            y2: anchors[3],
            fill: DEFAULTS.fill,
            strokeWidth: node.strokeWidth() ?? DEFAULTS.strokeWidth,
            pointerLength: node.pointerLength?.() ?? DEFAULTS.pointerLength,
            pointerWidth: node.pointerWidth?.() ?? DEFAULTS.pointerWidth
        });

        arrow.x(node.x());
        arrow.y(node.y());
        arrow.rotation(node.rotation());
        arrow.scaleX(node.scaleX());
        arrow.scaleY(node.scaleY());
        arrow.visible(node.visible());
        arrow.name(node.name());

        node.destroy();

        if (typeof CitranaColorPicker !== 'undefined') {
            CitranaColorPicker.applyToKonvaArrow(arrow, pickerColor);
        }

        return arrow;
    }

    function getControlPoints(shape) {
        return getAnchors(shape);
    }

    return {
        DEFAULTS,
        isArrow,
        getAnchors,
        getControlPoints,
        rebuild,
        setAnchors,
        setAnchor,
        setStrokeWidth,
        create,
        fromLegacyNode
    };
})();
