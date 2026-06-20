/**
 * citrana-laser.js
 * Citrana • https://github.com/IAmVigneswaran/Soothsayer-Citrana
 * © 2026 Vigneswaran Rajkumar • Licensed under MIT License
 * Ephemeral laser pointer overlay (Canvas 2D — not Konva; not saved or undoable)
 */
const CitranaLaser = (() => {
    const COLOR = '#FF3333';
    const STROKE_WIDTH = 4;
    /** Sample spacing along the stroke in chart coordinates (px) */
    const SAMPLE_STEP = 1;
    /** Min mouse movement before extending (drawing-tools uses this too) */
    const MIN_POINT_DISTANCE = 1;
    const FADE_DURATION_MS = 3000;

    let stage = null;
    let canvas = null;
    let ctx = null;
    /** @type {{ x: number, y: number, t: number }[][]} */
    let strokes = [];
    /** @type {{ x: number, y: number, t: number }[] | null} */
    let activeStroke = null;
    let fadeRaf = null;
    let lastPoint = null;
    let lastTime = 0;

    function isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    function isAvailable() {
        return window.matchMedia('(min-width: 769px)').matches && !isMobile();
    }

    function hasVisibleStrokes() {
        return strokes.some((stroke) => stroke.length > 0);
    }

    function pruneStrokes(now) {
        for (let s = strokes.length - 1; s >= 0; s--) {
            const stroke = strokes[s];

            for (let i = stroke.length - 1; i >= 0; i--) {
                if (now - stroke[i].t >= FADE_DURATION_MS) {
                    stroke.splice(i, 1);
                }
            }

            if (stroke.length === 0) {
                if (activeStroke === stroke) {
                    activeStroke = null;
                }
                strokes.splice(s, 1);
            }
        }
    }

    function syncCanvasSize() {
        if (!stage || !canvas) return;

        const dpr = window.devicePixelRatio || 1;
        const width = stage.width();
        const height = stage.height();

        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        ctx = canvas.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        paint();
    }

    function interpolatePoints(stroke, x1, y1, x2, y2, tStart, tEnd) {
        const dist = Math.hypot(x2 - x1, y2 - y1);

        if (dist < SAMPLE_STEP * 0.5) {
            stroke.push({ x: x2, y: y2, t: tEnd });
            return;
        }

        const steps = Math.max(1, Math.ceil(dist / SAMPLE_STEP));
        const dt = Math.max(1, tEnd - tStart) / steps;

        for (let i = 1; i <= steps; i++) {
            const u = i / steps;
            stroke.push({
                x: x1 + (x2 - x1) * u,
                y: y1 + (y2 - y1) * u,
                t: tStart + i * dt
            });
        }
    }

    function drawStroke(stroke, now) {
        if (stroke.length === 0) return;

        if (stroke.length === 1) {
            const point = stroke[0];
            const progress = (now - point.t) / FADE_DURATION_MS;
            if (progress >= 1) return;

            ctx.globalAlpha = 1 - progress;
            ctx.fillStyle = COLOR;
            const radius = (STROKE_WIDTH * (1 - progress * 0.65)) / 2;
            ctx.beginPath();
            ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
            ctx.fill();
            return;
        }

        for (let i = 1; i < stroke.length; i++) {
            const p0 = stroke[i - 1];
            const p1 = stroke[i];
            const age = now - p0.t;
            const progress = age / FADE_DURATION_MS;

            if (progress >= 1) continue;

            ctx.globalAlpha = 1 - progress;
            ctx.lineWidth = STROKE_WIDTH * (1 - progress * 0.65);
            ctx.beginPath();
            ctx.moveTo(p0.x, p0.y);
            ctx.lineTo(p1.x, p1.y);
            ctx.stroke();
        }
    }

    function paint() {
        if (!ctx || !stage) return;

        const width = stage.width();
        const height = stage.height();
        ctx.clearRect(0, 0, width, height);

        const now = performance.now();
        pruneStrokes(now);

        if (!hasVisibleStrokes()) return;

        ctx.save();
        ctx.translate(stage.x(), stage.y());
        ctx.scale(stage.scaleX(), stage.scaleY());
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = COLOR;

        for (const stroke of strokes) {
            drawStroke(stroke, now);
        }

        ctx.restore();
        ctx.globalAlpha = 1;
    }

    function ensureFadeLoop() {
        if (fadeRaf) return;

        const tick = () => {
            paint();

            if (hasVisibleStrokes()) {
                fadeRaf = requestAnimationFrame(tick);
            } else {
                fadeRaf = null;
            }
        };

        fadeRaf = requestAnimationFrame(tick);
    }

    function init(stageRef) {
        stage = stageRef;
        if (!stage) return;

        const container = stage.container();
        canvas = document.createElement('canvas');
        canvas.className = 'citrana-laser-canvas';
        canvas.setAttribute('aria-hidden', 'true');
        container.appendChild(canvas);

        syncCanvasSize();

        const redraw = () => paint();
        stage.on('xChange yChange scaleXChange scaleYChange', redraw);
        window.addEventListener('resize', syncCanvasSize);
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', syncCanvasSize);
        }
    }

    function startStroke(pos) {
        const t = performance.now();
        lastPoint = { x: pos.x, y: pos.y };
        lastTime = t;
        activeStroke = [{ x: pos.x, y: pos.y, t }];
        strokes.push(activeStroke);
        ensureFadeLoop();
        paint();
    }

    function extendStroke(pos) {
        if (!lastPoint || !activeStroke) return;

        const dx = pos.x - lastPoint.x;
        const dy = pos.y - lastPoint.y;
        if (Math.hypot(dx, dy) < MIN_POINT_DISTANCE) return;

        const tNow = performance.now();
        interpolatePoints(activeStroke, lastPoint.x, lastPoint.y, pos.x, pos.y, lastTime, tNow);
        lastPoint = { x: pos.x, y: pos.y };
        lastTime = tNow;
        ensureFadeLoop();
        paint();
    }

    function endStroke() {
        activeStroke = null;
        lastPoint = null;
        lastTime = 0;
    }

    function clear() {
        if (fadeRaf) {
            cancelAnimationFrame(fadeRaf);
            fadeRaf = null;
        }

        strokes = [];
        activeStroke = null;
        lastPoint = null;
        lastTime = 0;

        if (ctx && stage) {
            ctx.clearRect(0, 0, stage.width(), stage.height());
        }
    }

    return {
        MIN_POINT_DISTANCE,
        init,
        isAvailable,
        startStroke,
        extendStroke,
        endStroke,
        clear,
        resize: syncCanvasSize
    };
})();
