/**
 * citrana-colorpicker.js
 * Citrana • https://github.com/IAmVigneswaran/Soothsayer-Citrana
 * © 2026 Vigneswaran Rajkumar • Licensed under MIT License
 * Centralised JSColorPicker (v1.1.0) theme and helpers for Citrana
 * Documentation https://www.jscolorpicker.com/#customization
 */
const CitranaColorPicker = (() => {
    /**
     * Apple-style rainbow swatches — shared by Graha bar and drawing Edit UI.
     * 16 colours in continuous spectral order (black → rose); 2 rows of 8.
     * Warm pinks run dark → light: magenta → raspberry → pink → rose.
     * Reference https://developer.apple.com/design/human-interface-guidelines/color
     */
    const SWATCHES = [
        '#000000', // Black
        '#FF3B30', // Red
        '#FF9500', // Orange
        '#FFCC00', // Yellow
        '#34C759', // Green
        '#00C7BE', // Mint
        '#30B0C7', // Teal
        '#32ADE6', // Cyan
        '#007AFF', // Blue
        '#5856D6', // Indigo
        '#AF52DE', // Purple
        '#BF5AF2', // Violet
        '#C93484', // Magenta
        '#FF375F', // Raspberry
        '#FF2D55', // Pink
        '#FF6482'  // Rose
    ];

    /** Chip-only toggle (no hex field in the toolbar) */
    const BASE_OPTIONS = {
        toggleStyle: 'button',
        submitMode: 'instant',
        enableAlpha: true,
        /** Hide HEX/RGB format tabs — hex input stays via defaultFormat */
        formats: false,
        defaultFormat: 'hex',
        enableEyedropper: true,
        swatches: SWATCHES,
        showClearButton: false,
        dismissOnOutsideClick: true,
        dismissOnEscape: true,
        dialogPlacement: 'auto',
        dialogOffset: 8
    };

    const CONTEXT_OPTIONS = {
        graha: {
            dialogPlacement: 'top'
        },
        drawing: {
            dialogPlacement: 'top'
        }
    };

    let grahaPickCallback = null;

    function isAvailable() {
        return typeof ColorPicker !== 'undefined';
    }

    function toHex(color) {
        if (!color) {
            return '#000000';
        }
        if (typeof color === 'string') {
            return color;
        }
        if (typeof color.string === 'function') {
            const alpha = typeof color.alpha === 'function' ? color.alpha() : 1;
            if (alpha < 1) {
                return color.string('rgba');
            }
            return color.string('hex');
        }
        return '#000000';
    }

    function clamp01(value) {
        return Math.min(1, Math.max(0, Number(value)));
    }

    function componentToHex(value) {
        const n = Math.round(Math.min(255, Math.max(0, Number(value))));
        const hex = n.toString(16);
        return hex.length === 1 ? `0${hex}` : hex;
    }

    function rgbToHex(r, g, b) {
        return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;
    }

    function expandHex(hex) {
        if (/^#[0-9a-fA-F]{3}$/.test(hex)) {
            return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
        }
        if (/^#[0-9a-fA-F]{6}$/i.test(hex)) {
            return hex;
        }
        return null;
    }

    /**
     * Split a CSS colour into opaque paint + alpha (for Konva shape.opacity).
     * @param {string} color
     * @returns {{ paint: string, opacity: number }}
     */
    function parseColorString(color) {
        if (!color) {
            return { paint: '#000000', opacity: 1 };
        }

        const value = String(color).trim();
        const rgbaMatch = value.match(/^rgba\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)$/i);
        if (rgbaMatch) {
            return {
                paint: rgbToHex(rgbaMatch[1], rgbaMatch[2], rgbaMatch[3]),
                opacity: clamp01(rgbaMatch[4])
            };
        }

        const rgbMatch = value.match(/^rgb\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)$/i);
        if (rgbMatch) {
            return {
                paint: rgbToHex(rgbMatch[1], rgbMatch[2], rgbMatch[3]),
                opacity: 1
            };
        }

        if (/^#[0-9a-fA-F]{8}$/i.test(value)) {
            return {
                paint: value.slice(0, 7),
                opacity: clamp01(parseInt(value.slice(7, 9), 16) / 255)
            };
        }

        const hex = expandHex(value);
        if (hex) {
            return { paint: hex, opacity: 1 };
        }

        return { paint: value, opacity: 1 };
    }

    function toRgbaString(paint, opacity) {
        const { paint: rgbPaint } = parseColorString(paint);
        const hex = expandHex(rgbPaint);
        if (!hex) {
            return paint;
        }
        const alpha = clamp01(opacity);
        if (alpha >= 1) {
            return hex;
        }
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    /**
     * Read a Konva shape colour for the picker (merges stroke/fill with shape opacity).
     * @param {Konva.Node} shape
     * @returns {string}
     */
    function fromKonvaShape(shape) {
        if (!shape) {
            return '#000000';
        }

        const paint = (typeof CitranaArrow !== 'undefined' && CitranaArrow.isArrow(shape) && shape.fill())
            || (typeof shape.stroke === 'function' && shape.stroke())
            || (typeof shape.fill === 'function' && shape.fill())
            || '#000000';
        const parsed = parseColorString(paint);
        const shapeOpacity = typeof shape.opacity === 'function' ? clamp01(shape.opacity()) : 1;

        return toRgbaString(parsed.paint, parsed.opacity * shapeOpacity);
    }

    /**
     * Apply colour to an arrow (unified fill + shape opacity).
     * @param {Konva.Node} arrow
     * @param {string} color
     */
    function applyToKonvaArrow(arrow, color) {
        if (!arrow) {
            return;
        }
        const { paint, opacity } = parseColorString(color);

        if (typeof CitranaArrow !== 'undefined' && CitranaArrow.isArrow(arrow)) {
            arrow.fill(paint);
            arrow.strokeEnabled(false);
            arrow.opacity(opacity);
            return;
        }

        if (arrow instanceof Konva.Arrow) {
            arrow.stroke(paint);
            arrow.fill(paint);
            arrow.opacity(opacity);
        }
    }

    function getContextOptions(context) {
        return CONTEXT_OPTIONS[context] || {};
    }

    function buildOptions(context, overrides = {}) {
        return {
            ...BASE_OPTIONS,
            ...getContextOptions(context),
            ...overrides
        };
    }

    function attachNativeFallback(element, { color, onPick } = {}) {
        let target = element;
        if (element.tagName === 'BUTTON') {
            const input = document.createElement('input');
            input.type = 'color';
            input.className = element.className;
            input.title = element.title || '';
            input.setAttribute('aria-label', element.getAttribute('aria-label') || '');
            element.replaceWith(input);
            target = input;
        } else if (element.tagName === 'INPUT') {
            element.type = 'color';
        }
        if (color) {
            target.value = color;
        }
        if (onPick) {
            const handler = (e) => onPick(e.target.value);
            target.addEventListener('input', handler);
            target.addEventListener('change', handler);
        }
        return {
            destroy() {},
            getValue: () => target.value,
            setValue: (value) => {
                target.value = value;
            }
        };
    }

    function destroy(element) {
        if (!element) {
            return;
        }
        const picker = element._citranaColorPicker;
        if (picker && typeof picker.destroy === 'function') {
            picker.destroy();
        }
        delete element._citranaColorPicker;
        delete element.dataset.citranaPickerInit;
    }

    function attach(element, { color = null, onPick = null, context = 'drawing', options = {} } = {}) {
        if (!element) {
            return null;
        }

        destroy(element);

        if (!isAvailable()) {
            console.warn('JSColorPicker not loaded; using native color input');
            const fallback = attachNativeFallback(element, { color, onPick });
            element._citranaColorPicker = fallback;
            return fallback;
        }

        const picker = new ColorPicker(element, buildOptions(context, options));
        if (color) {
            picker.setColor(color, false);
        }
        if (onPick) {
            picker.on('pick', (picked) => onPick(toHex(picked)));
        }

        element._citranaColorPicker = picker;
        element.dataset.citranaPickerInit = '1';
        return picker;
    }

    function getValue(element) {
        if (!element) {
            return '#000000';
        }
        const picker = element._citranaColorPicker;
        if (picker && picker.color) {
            return toHex(picker.color);
        }
        if (element.dataset?.color) {
            return element.dataset.color;
        }
        return element.value || '#000000';
    }

    function setValue(element, color, emit = false) {
        if (!element) {
            return;
        }
        const picker = element._citranaColorPicker;
        if (picker && typeof picker.setColor === 'function') {
            picker.setColor(color, emit);
            return;
        }
        if (element.tagName === 'BUTTON') {
            element.dataset.color = color;
            element.style.backgroundColor = color;
            return;
        }
        element.value = color;
    }

    function initGrahaBar() {
        const element = document.getElementById('text-edit-color');
        if (!element || element.dataset.citranaPickerInit) {
            return;
        }

        attach(element, {
            context: 'graha',
            color: '#000000',
            onPick: (hex) => {
                if (typeof grahaPickCallback === 'function') {
                    grahaPickCallback(hex);
                }
            }
        });
    }

    function setGrahaPickCallback(callback) {
        grahaPickCallback = typeof callback === 'function' ? callback : null;
    }

    function createInput({ color, title, context = 'drawing', onPick, className = 'edit-color-input' }) {
        const toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = className;
        toggle.title = title;
        toggle.setAttribute('aria-label', title);
        attach(toggle, { color, context, onPick });
        return toggle;
    }

    return {
        SWATCHES,
        BASE_OPTIONS,
        CONTEXT_OPTIONS,
        isAvailable,
        toHex,
        parseColorString,
        fromKonvaShape,
        applyToKonvaArrow,
        attach,
        destroy,
        getValue,
        setValue,
        initGrahaBar,
        setGrahaPickCallback,
        createInput
    };
})();
