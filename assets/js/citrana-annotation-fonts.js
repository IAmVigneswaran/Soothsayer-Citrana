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
    const FAMILY_ARIAL = 'Arial, sans-serif';
    const FAMILY_ARIAL_BLACK = 'Arial Black, Arial, sans-serif';

    function isHeading(element) {
        return element?.name?.()?.includes('drawing-heading') ?? false;
    }

    function isHandwritten(element) {
        return /Caveat/i.test(element?.fontFamily?.() ?? '');
    }

    function isBold(element) {
        if (!element) {
            return false;
        }

        if (isHandwritten(element)) {
            const weight = element.fontWeight?.() ?? '600';
            return weight === 'bold' || weight === 700 || weight === '700';
        }

        const weight = element.fontWeight?.() ?? 'normal';
        const family = element.fontFamily?.() ?? '';
        return weight === 'bold' || weight === 700 || weight === '700' || /Arial Black/i.test(family);
    }

    function setBold(element, bold) {
        if (!element) {
            return;
        }

        if (isHandwritten(element)) {
            element.fontFamily(FAMILY_CAVEAT);
            element.fontWeight(bold ? '700' : '600');
            return;
        }

        if (bold) {
            element.fontFamily(FAMILY_ARIAL_BLACK);
            element.fontWeight('bold');
        } else {
            element.fontFamily(FAMILY_ARIAL);
            element.fontWeight('normal');
        }
    }

    function setMode(element, mode) {
        if (!element) {
            return;
        }

        const bold = isBold(element);

        if (mode === MODE_HANDWRITTEN) {
            element.fontFamily(FAMILY_CAVEAT);
            element.fontWeight(bold ? '700' : '600');
            return;
        }

        if (bold) {
            element.fontFamily(FAMILY_ARIAL_BLACK);
            element.fontWeight('bold');
        } else {
            element.fontFamily(FAMILY_ARIAL);
            element.fontWeight('normal');
        }
    }

    function ensureLoaded() {
        if (!document.fonts?.load) {
            return Promise.resolve();
        }

        return Promise.all([
            document.fonts.load('600 16px "Caveat"'),
            document.fonts.load('700 18px "Caveat"')
        ]).catch(() => {});
    }

    return {
        MODE_NORMAL,
        MODE_HANDWRITTEN,
        FAMILY_CAVEAT,
        isHeading,
        isHandwritten,
        isBold,
        setBold,
        setMode,
        ensureLoaded
    };
})();
