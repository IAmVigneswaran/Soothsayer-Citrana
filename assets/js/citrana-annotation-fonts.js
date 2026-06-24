/**
 * citrana-annotation-fonts.js
 * Citrana • https://github.com/IAmVigneswaran/Soothsayer-Citrana
 * © 2026 Vigneswaran Rajkumar • Licensed under MIT License
 * Normal and hand-written (Shantell Sans) font modes for text/heading annotations
 */
const CitranaAnnotationFonts = (() => {
    const MODE_NORMAL = 'normal';
    const MODE_HANDWRITTEN = 'handwritten';
    const FAMILY_SHANTELL = '"Shantell Sans", cursive';
    const FAMILY_ARIAL = 'Arial, sans-serif';
    const FAMILY_ARIAL_BLACK = 'Arial Black, Arial, sans-serif';

    function styleIncludesItalic(style) {
        return /\bitalic\b/i.test(style) || /\boblique\b/i.test(style);
    }

    function styleIncludesBold(style) {
        return /\bbold\b/i.test(style);
    }

    function weightIsBold(weight) {
        return weight === 'bold' || weight === 700 || weight === '700';
    }

    function buildHandwrittenFontStyle(bold, italic) {
        if (bold && italic) {
            return 'italic bold';
        }
        if (bold) {
            return 'bold';
        }
        if (italic) {
            return 'italic';
        }
        return 'normal';
    }

    function isHandwritten(element) {
        const family = element?.fontFamily?.() ?? '';
        return /Shantell Sans/i.test(family) || /Caveat/i.test(family);
    }

    function isLegacyHandwrittenBold(element) {
        return /Caveat Brush/i.test(element?.fontFamily?.() ?? '');
    }

    function isItalic(element) {
        const style = element?.fontStyle?.() ?? 'normal';
        return styleIncludesItalic(style);
    }

    function isBold(element) {
        if (!element) {
            return false;
        }

        if (isHandwritten(element)) {
            if (isLegacyHandwrittenBold(element)) {
                return true;
            }

            const style = element?.fontStyle?.() ?? 'normal';
            if (styleIncludesBold(style)) {
                return true;
            }

            // Data saved before Konva fontStyle wiring used fontWeight only
            return weightIsBold(element.fontWeight?.() ?? 'normal');
        }

        const weight = element.fontWeight?.() ?? 'normal';
        const family = element.fontFamily?.() ?? '';
        return weightIsBold(weight) || /Arial Black/i.test(family);
    }

    function applyHandwrittenStyle(element, bold, italic) {
        // Konva.Text builds canvas font from fontStyle (not fontWeight) — must be
        // 'bold', 'italic', or 'italic bold' to match @font-face Shantell faces.
        element.fontFamily(FAMILY_SHANTELL);
        element.fontStyle(buildHandwrittenFontStyle(bold, italic));
        if (element.fontWeight) {
            element.fontWeight('normal');
        }
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
            document.fonts.load('16px "Shantell Sans"'),
            document.fonts.load('bold 16px "Shantell Sans"'),
            document.fonts.load('italic 16px "Shantell Sans"'),
            document.fonts.load('italic bold 16px "Shantell Sans"')
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
