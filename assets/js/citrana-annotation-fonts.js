/**
 * citrana-annotation-fonts.js
 * Citrana • https://github.com/IAmVigneswaran/Soothsayer-Citrana
 * © 2026 Vigneswaran Rajkumar • Licensed under MIT License
 * Normal and hand-written (Caveat) font modes for text/heading annotations
 */
const CitranaAnnotationFonts = (() => {
    const MODE_NORMAL = 'normal';
    const MODE_HANDWRITTEN = 'handwritten';
    const FAMILY_CAVEAT = 'Caveat, cursive';
    const FAMILY_CAVEAT_BRUSH = 'Caveat Brush, cursive';
    const FAMILY_ARIAL = 'Arial, sans-serif';
    const FAMILY_ARIAL_BLACK = 'Arial Black, Arial, sans-serif';

    function isHandwritten(element) {
        return /Caveat/i.test(element?.fontFamily?.() ?? '');
    }

    function isHandwrittenBold(element) {
        return /Caveat Brush/i.test(element?.fontFamily?.() ?? '');
    }

    function isItalic(element) {
        const style = element?.fontStyle?.() ?? 'normal';
        return style === 'italic' || style === 'oblique';
    }

    function isBold(element) {
        if (!element) {
            return false;
        }

        if (isHandwritten(element)) {
            return isHandwrittenBold(element);
        }

        const weight = element.fontWeight?.() ?? 'normal';
        const family = element.fontFamily?.() ?? '';
        return weight === 'bold' || weight === 700 || weight === '700' || /Arial Black/i.test(family);
    }

    function applyHandwrittenStyle(element, bold, italic) {
        element.fontFamily(bold ? FAMILY_CAVEAT_BRUSH : FAMILY_CAVEAT);
        element.fontStyle(italic ? 'italic' : 'normal');
    }

    function applyNormalStyle(element, bold, italic) {
        element.fontFamily(bold ? FAMILY_ARIAL_BLACK : FAMILY_ARIAL);
        element.fontWeight(bold ? 'bold' : 'normal');
        element.fontStyle(italic ? 'italic' : 'normal');
    }

    function setBold(element, bold) {
        if (!element) {
            return;
        }

        if (isHandwritten(element)) {
            applyHandwrittenStyle(element, bold, isItalic(element));
            return;
        }

        applyNormalStyle(element, bold, isItalic(element));
    }

    function setItalic(element, italic) {
        if (!element) {
            return;
        }

        if (isHandwritten(element)) {
            applyHandwrittenStyle(element, isBold(element), italic);
            return;
        }

        applyNormalStyle(element, isBold(element), italic);
    }

    function setMode(element, mode) {
        if (!element) {
            return;
        }

        const bold = isBold(element);
        const italic = isItalic(element);

        if (mode === MODE_HANDWRITTEN) {
            applyHandwrittenStyle(element, bold, italic);
            return;
        }

        applyNormalStyle(element, bold, italic);
    }

    function ensureLoaded() {
        if (!document.fonts?.load) {
            return Promise.resolve();
        }

        return Promise.all([
            document.fonts.load('16px "Caveat"'),
            document.fonts.load('italic 16px "Caveat"'),
            document.fonts.load('16px "Caveat Brush"')
        ]).catch(() => {});
    }

    return {
        MODE_NORMAL,
        MODE_HANDWRITTEN,
        isHandwritten,
        isItalic,
        isBold,
        setBold,
        setItalic,
        setMode,
        ensureLoaded
    };
})();
