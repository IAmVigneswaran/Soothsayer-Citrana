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

    /**
     * @param {Konva.Node} targetNode — text, heading, or stroke annotation
     * @param {Konva.Container} parentContainer
     * @param {number} [extraPadding=0]
     * @returns {Konva.Rect|null}
     */
    function attach(targetNode, parentContainer, extraPadding = 0) {
        if (!targetNode || !parentContainer || typeof Konva === 'undefined') {
            return null;
        }

        detach(targetNode);

        const pill = new Konva.Rect({
            name: PILL_NAME,
            fillEnabled: false,
            stroke: 'rgba(107, 114, 128, 0.75)',
            strokeWidth: 1.5,
            dash: [4, 3],
            listening: false
        });

        positionPill(pill, targetNode, parentContainer, extraPadding);
        parentContainer.add(pill);
        targetNode._selectionPill = pill;
        pill.moveToTop();
        targetNode.moveToTop();

        return pill;
    }

    /**
     * @param {Konva.Node} targetNode
     * @param {number} [extraPadding=0]
     */
    function sync(targetNode, extraPadding = 0) {
        const pill = targetNode?._selectionPill;
        const parent = targetNode?.getParent();
        if (!pill || !parent) {
            return;
        }

        positionPill(pill, targetNode, parent, extraPadding);
        pill.fillEnabled(false);
        pill.moveToTop();
        targetNode.moveToTop();
    }

    /**
     * @param {Konva.Node} targetNode
     */
    function detach(targetNode) {
        const pill = targetNode?._selectionPill;
        if (!pill) {
            return;
        }

        pill.destroy();
        targetNode._selectionPill = null;
    }

    function positionPill(pill, targetNode, relativeTo, extraPadding = 0) {
        const rect = targetNode.getClientRect({ relativeTo });
        const pad = getPadding() + extraPadding;

        pill.setAttrs({
            x: rect.x - pad,
            y: rect.y - pad,
            width: Math.max(8, rect.width + pad * 2),
            height: Math.max(8, rect.height + pad * 2),
            cornerRadius: 3
        });
    }

    return {
        attach,
        sync,
        detach,
        getPadding,
        PILL_NAME
    };
})();
