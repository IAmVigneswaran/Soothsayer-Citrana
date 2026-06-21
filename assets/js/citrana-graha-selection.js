/**
 * citrana-graha-selection.js
 * Citrana • https://github.com/IAmVigneswaran/Soothsayer-Citrana
 * © 2026 Vigneswaran Rajkumar • Licensed under MIT License
 * Graha Selection Pill — colour-independent pill behind planet labels
 */
const CitranaGrahaSelection = (() => {
    const PILL_NAME = 'planet-selection-pill';
    const PADDING_DESKTOP = 4;
    const PADDING_MOBILE = 7;

    function getPadding() {
        return typeof CitranaDevice !== 'undefined' && CitranaDevice.isMobileUA()
            ? PADDING_MOBILE
            : PADDING_DESKTOP;
    }

    function positionPill(pill, planetText, relativeTo) {
        const rect = planetText.getClientRect({ relativeTo });
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
     * @param {Konva.Text} planetText
     * @param {Konva.Group} parentGroup
     * @returns {Konva.Rect|null}
     */
    function attach(planetText, parentGroup) {
        if (!planetText || !parentGroup || typeof Konva === 'undefined') {
            return null;
        }

        detach(planetText);

        const pill = new Konva.Rect({
            name: PILL_NAME,
            fill: 'transparent',
            stroke: 'rgba(107, 114, 128, 0.75)',
            strokeWidth: 1.5,
            dash: [4, 3],
            listening: false
        });

        positionPill(pill, planetText, parentGroup);
        parentGroup.add(pill);
        planetText._selectionPill = pill;
        pill.moveToTop();
        planetText.moveToTop();

        return pill;
    }

    /**
     * @param {Konva.Text} planetText
     */
    function sync(planetText) {
        const pill = planetText?._selectionPill;
        const parent = planetText?.getParent();
        if (!pill || !parent) {
            return;
        }

        positionPill(pill, planetText, parent);
        pill.moveToTop();
        planetText.moveToTop();
    }

    /**
     * @param {Konva.Text} planetText
     */
    function detach(planetText) {
        const pill = planetText?._selectionPill;
        if (!pill) {
            return;
        }

        pill.destroy();
        planetText._selectionPill = null;
    }

    return {
        attach,
        sync,
        detach,
        getPadding,
        PILL_NAME
    };
})();
