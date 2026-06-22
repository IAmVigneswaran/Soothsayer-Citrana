/**
 * citrana-selection.js
 * Citrana • https://github.com/IAmVigneswaran/Soothsayer-Citrana
 * © 2026 Vigneswaran Rajkumar • Licensed under MIT License
 * Selection Pill — colour-independent pill behind Graha labels and annotations
 */
const CitranaSelection = (() => {
    const PILL_NAME = 'selection-pill';
    const PADDING_DESKTOP = 4;
    const PADDING_MOBILE = 7;

    function getPadding() {
        return typeof CitranaDevice !== 'undefined' && CitranaDevice.isMobileUA()
            ? PADDING_MOBILE
            : PADDING_DESKTOP;
    }

    function positionPill(pill, labelText, relativeTo) {
        const rect = labelText.getClientRect({ relativeTo });
        const pad = getPadding();

        pill.setAttrs({
            x: rect.x - pad,
            y: rect.y - pad,
            width: Math.max(8, rect.width + pad * 2),
            height: Math.max(8, rect.height + pad * 2),
            cornerRadius: 3
        });
    }

    /**
     * @param {Konva.Text} labelText
     * @param {Konva.Container} parentContainer
     * @returns {Konva.Rect|null}
     */
    function attach(labelText, parentContainer) {
        if (!labelText || !parentContainer || typeof Konva === 'undefined') {
            return null;
        }

        detach(labelText);

        const pill = new Konva.Rect({
            name: PILL_NAME,
            fill: 'transparent',
            stroke: 'rgba(107, 114, 128, 0.75)',
            strokeWidth: 1.5,
            dash: [4, 3],
            listening: false
        });

        positionPill(pill, labelText, parentContainer);
        parentContainer.add(pill);
        labelText._selectionPill = pill;
        pill.moveToTop();
        labelText.moveToTop();

        return pill;
    }

    /**
     * @param {Konva.Text} labelText
     */
    function sync(labelText) {
        const pill = labelText?._selectionPill;
        const parent = labelText?.getParent();
        if (!pill || !parent) {
            return;
        }

        positionPill(pill, labelText, parent);
        pill.moveToTop();
        labelText.moveToTop();
    }

    /**
     * @param {Konva.Text} labelText
     */
    function detach(labelText) {
        const pill = labelText?._selectionPill;
        if (!pill) {
            return;
        }

        pill.destroy();
        labelText._selectionPill = null;
    }

    return {
        attach,
        sync,
        detach,
        getPadding,
        PILL_NAME
    };
})();
