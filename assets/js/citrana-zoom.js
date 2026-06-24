/**
 * citrana-zoom.js
 * Citrana • https://github.com/IAmVigneswaran/Soothsayer-Citrana
 * © 2026 Vigneswaran Rajkumar • Licensed under MIT License
 * Zoom step presets for buttons, keyboard, and scroll wheel
 */
const CitranaZoom = (() => {
    const MIN_SCALE = 0.1;
    const MAX_SCALE = 5;
    const DEFAULT_STEP = 'fine';
    const VALID_STEPS = new Set(['fine', 'small', 'medium', 'large']);

    const MULTIPLIERS = {
        small: { in: 1.1, out: 1 / 1.1 },
        medium: { in: 1.2, out: 0.8 },
        large: { in: 1.25, out: 0.8 }
    };

    function resolveZoomStep(value) {
        if (typeof value === 'string' && VALID_STEPS.has(value)) {
            return value;
        }
        return DEFAULT_STEP;
    }

    /**
     * @param {number} oldScale Current stage scale
     * @param {'in'|'out'} direction
     * @param {string} [zoomStep]
     * @returns {number} Clamped next scale
     */
    function computeNextScale(oldScale, direction, zoomStep) {
        const step = resolveZoomStep(zoomStep);
        let newScale;

        if (step === 'fine') {
            const percent = Math.round(oldScale * 100);
            const delta = direction === 'in' ? 1 : -1;
            const newPercent = Math.min(MAX_SCALE * 100, Math.max(MIN_SCALE * 100, percent + delta));
            newScale = newPercent / 100;
        } else {
            const mult = MULTIPLIERS[step];
            const factor = direction === 'in' ? mult.in : mult.out;
            newScale = oldScale * factor;
        }

        return Math.min(MAX_SCALE, Math.max(MIN_SCALE, newScale));
    }

    return {
        MIN_SCALE,
        MAX_SCALE,
        DEFAULT_STEP,
        VALID_STEPS,
        resolveZoomStep,
        computeNextScale
    };
})();
