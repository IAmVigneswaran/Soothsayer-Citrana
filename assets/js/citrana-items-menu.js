/**
 * citrana-items-menu.js
 * Citrana • https://github.com/IAmVigneswaran/Soothsayer-Citrana
 * © 2026 Vigneswaran Rajkumar • Licensed under MIT License
 * Items panel — chart, Bhava, Graha, and annotation actions (desktop and mobile)
 */
class CitranaItemsMenu {
    constructor() {
        this.modal = null;
        this.bodyEl = null;
        this.openBtn = null;
        this._shapes = [];
    }

    init() {
        this.modal = document.getElementById('items-modal');
        this.bodyEl = document.getElementById('items-modal-body');
        this.openBtn = document.getElementById('items-menu-btn');

        if (!this.modal || !this.bodyEl || !this.openBtn) {
            console.error('Items menu elements not found');
            return;
        }

        this.openBtn.addEventListener('click', () => this.open());
        document.getElementById('items-modal-close')?.addEventListener('click', () => this.close());

        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });

        this.bodyEl.addEventListener('click', (e) => this.handleBodyClick(e));

        citranaDebug('Items menu initialized');
    }

    open() {
        this.render();
        window.app?.openModal(this.modal);
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    close() {
        window.app?.closeModal(this.modal);
    }

    getContextMenu() {
        return window.app?.contextMenu;
    }

    getChartTemplates() {
        return window.app?.chartTemplates;
    }

    getActiveTemplate() {
        return this.getContextMenu()?.getActiveChartTemplate?.() || null;
    }

    getDrawingShapes() {
        const layer = window.app?.drawingTools?.layer;
        if (!layer) return [];

        return layer.find((node) => {
            const name = node.name();
            return name && name.startsWith('drawing-');
        });
    }

    getAnnotationDisplayName(shape) {
        const name = shape.name();
        if (name.includes('arrow')) return 'Arrow';
        if (name === 'drawing-line') return 'Line';
        if (name.includes('pen')) return 'Pen';
        if (name === 'drawing-text') return shape.text() || 'Text';
        if (name === 'drawing-heading') return shape.text() || 'Heading';
        return 'Annotation';
    }

    getAnnotationIcon(shape) {
        const icons = {
            arrow: 'arrow-right',
            line: 'minus',
            pen: 'pen-tool',
            text: 'type',
            heading: 'heading'
        };
        return icons[this.getAnnotationToolType(shape)] || 'pen-line';
    }

    getAnnotationToolType(shape) {
        const name = shape.name();
        if (name.includes('arrow')) return 'arrow';
        if (name === 'drawing-line') return 'line';
        if (name.includes('pen')) return 'pen';
        if (name === 'drawing-text') return 'text';
        if (name === 'drawing-heading') return 'heading';
        return 'arrow';
    }

    canEditAnnotation(shape) {
        const name = shape.name();
        return name && (
            name.includes('arrow') ||
            name === 'drawing-line' ||
            name.includes('pen') ||
            name === 'drawing-text' ||
            name === 'drawing-heading'
        );
    }

    escapeHtml(text) {
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    actionButton(action, title, icon, extraAttrs = '') {
        return `<button type="button" class="items-action-btn" data-action="${action}" title="${title}" aria-label="${title}" ${extraAttrs}><i data-lucide="${icon}"></i></button>`;
    }

    renderSection(title, content) {
        if (!content) return '';
        return `
            <section class="items-section">
                <h3 class="items-section-title">${title}</h3>
                <div class="items-list">${content}</div>
            </section>
        `;
    }

    renderRow(label, meta, actionsHtml, rowIcon = '', options = {}) {
        const metaHtml = meta ? `<span class="items-row-meta">${meta}</span>` : '';
        const iconHtml = rowIcon
            ? `<span class="items-row-icon" aria-hidden="true"><i data-lucide="${rowIcon}"></i></span>`
            : '';
        const selectedClass = options.selected ? ' items-row-selected' : '';
        return `
            <div class="items-row${selectedClass}">
                <div class="items-row-main">
                    ${iconHtml}
                    <div class="items-row-label-wrap">
                        <span class="items-row-label">${label}</span>
                        ${metaHtml}
                    </div>
                </div>
                <div class="items-row-actions">${actionsHtml}</div>
            </div>
        `;
    }

    renderChartSection(chartType) {
        const cm = this.getContextMenu();
        if (!cm) return '';

        if (!chartType) {
            const rows = [
                this.renderRow('North Indian Chart', '', this.actionButton('create-north-indian', 'Create North Indian Chart', 'plus-circle'), 'plus-circle'),
                this.renderRow('South Indian Chart', '', this.actionButton('create-south-indian', 'Create South Indian Chart', 'plus-circle'), 'plus-circle'),
                this.renderRow(this.getPresentationLabel(), '', this.actionButton('toggle-presentation-view', this.getPresentationLabel(), 'presentation'), 'presentation'),
                this.renderRow('Clear Canvas', '', this.actionButton('clear-chart', 'Clear Canvas', 'trash-2'), 'trash-2')
            ].join('');

            return this.renderSection('Chart', rows);
        }

        const chartName = chartType === 'south-indian' ? 'South Indian' : 'North Indian';
        let html = this.renderSection('Chart', `
            <p class="items-chart-type">${chartName} Chart</p>
        `);

        if (chartType === 'north-indian') {
            const lagnaButtons = CitranaRashis.RASHIS.map((rashi, i) => (
                `<button type="button" class="items-lagna-btn" data-action="set-lagna" data-house="${i + 1}" title="Set Lagna as ${rashi.name}" aria-label="Set Lagna as ${rashi.name}">
                    ${CitranaRashis.iconHtml(rashi.icon)}
                    <span class="items-lagna-name">${rashi.name}</span>
                </button>`
            )).join('');

            html += this.renderSection('Set Lagna as …', `<div class="items-lagna-grid">${lagnaButtons}</div>`);
        }

        const chartActions = [
            this.renderRow(this.getPresentationLabel(), '', this.actionButton('toggle-presentation-view', this.getPresentationLabel(), 'presentation'), 'presentation'),
            this.renderRow('Reset Chart', '', this.actionButton('reset-chart', 'Reset Chart', 'trash-2'), 'trash-2'),
            this.renderRow('Reset Drawings', '', this.actionButton('reset-drawings', 'Reset Drawings', 'trash-2'), 'trash-2'),
            this.renderRow('Clear Canvas', '', this.actionButton('clear-chart', 'Clear Canvas', 'trash-2'), 'trash-2')
        ].join('');

        html += this.renderSection('Chart Actions', chartActions);
        return html;
    }

    getPresentationLabel() {
        return window.app?.presentationView ? 'Exit Presentation View' : 'Presentation View';
    }

    getPresentationIcon() {
        return 'presentation';
    }

    isRowSelected(kind, data = {}) {
        const selection = window.app?.getCanvasSelection?.();
        if (!selection || selection.type !== kind) {
            return false;
        }

        if (kind === 'bhava') {
            return selection.houseNumber === parseInt(data.houseNumber, 10);
        }

        if (kind === 'graha') {
            return selection.houseNumber === parseInt(data.houseNumber, 10) &&
                selection.planetId === data.planetId;
        }

        if (kind === 'annotation') {
            return selection.shapeIndex === parseInt(data.shapeIndex, 10);
        }

        return false;
    }

    refreshSelectionHighlight() {
        if (!this.modal || this.modal.getAttribute('aria-hidden') !== 'false') {
            return;
        }

        this.render();
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    renderUtilitySection() {
        const cm = this.getContextMenu();
        if (!cm) {
            return '';
        }

        const contextMenuLabel = cm.getContextMenuToggleLabel();
        const contextMenuIcon = cm.isCanvasContextMenuEnabled() ? 'circle-off' : 'circle';

        const rows = [
            this.renderRow(
                'Clear Selection',
                'Grahas, Bhavas, annotations',
                this.actionButton('clear-selection', 'Clear Selection', 'mouse-pointer-2'),
                'mouse-pointer-2'
            ),
            this.renderRow(
                contextMenuLabel,
                'Long-press and right-click menu',
                this.actionButton('toggle-context-menu', contextMenuLabel, contextMenuIcon),
                contextMenuIcon
            )
        ].join('');

        return this.renderSection('Canvas', rows);
    }

    getBhavaLabel(chartType, houseNumber) {
        if (chartType === 'south-indian') {
            const template = this.getChartTemplates()?.southIndianTemplate;
            if (template?.getBhavaNumberForHouse) {
                return template.getBhavaNumberForHouse(parseInt(houseNumber, 10));
            }
        }
        return houseNumber;
    }

    /** South Indian grid cells have fixed Rashis; North Indian rows use Bhava numbers. */
    getFixedRashiForHouse(houseNumber) {
        const house = parseInt(houseNumber, 10);
        if (house < 1 || house > 12) return null;
        return CitranaRashis.RASHIS[house - 1] || null;
    }

    getBhavaRowLabel(chartType, houseNumber) {
        if (chartType === 'south-indian') {
            const rashi = this.getFixedRashiForHouse(houseNumber);
            if (rashi) {
                return `${CitranaRashis.iconHtml(rashi.icon)} ${this.escapeHtml(rashi.name)}`;
            }
        }
        return this.escapeHtml(`Bhava ${this.getBhavaLabel(chartType, houseNumber)}`);
    }

    getBhavaMetaLabel(chartType, houseNumber) {
        if (chartType === 'south-indian') {
            const rashi = this.getFixedRashiForHouse(houseNumber);
            if (rashi) {
                return this.escapeHtml(rashi.name);
            }
        }
        return this.escapeHtml(`Bhava ${this.getBhavaLabel(chartType, houseNumber)}`);
    }

    renderBhavasSection(chartType, template) {
        if (!chartType || !template) return '';

        const houseData = template.getHouseData();
        const rows = [];

        for (let houseNumber = 1; houseNumber <= 12; houseNumber += 1) {
            const grahaCount = houseData[houseNumber]?.planets?.length || 0;
            const meta = grahaCount === 1 ? '1 Graha' : `${grahaCount} Grahas`;

            let lagnaAction = '';
            if (chartType === 'south-indian') {
                lagnaAction = this.actionButton('set-lagna', 'Set as Lagna', 'target', `data-house="${houseNumber}"`);
            } else if (chartType === 'north-indian') {
                lagnaAction = this.actionButton('set-first-house', 'Set as First Bhava', 'home', `data-house="${houseNumber}"`);
            }

            const actions = [
                this.actionButton('select-bhava', 'Select Bhava', 'mouse-pointer', `data-house="${houseNumber}"`),
                lagnaAction,
                this.actionButton('clear-house', 'Clear Bhava', 'trash-2', `data-house="${houseNumber}"`)
            ].filter(Boolean).join('');

            rows.push(this.renderRow(
                this.getBhavaRowLabel(chartType, houseNumber),
                meta,
                actions,
                '',
                { selected: this.isRowSelected('bhava', { houseNumber }) }
            ));
        }

        return this.renderSection('Bhavas', rows.join(''));
    }

    renderGrahasSection(chartType, template) {
        if (!chartType || !template) return '';

        const houseData = template.getHouseData();
        const rows = [];

        for (let houseNumber = 1; houseNumber <= 12; houseNumber += 1) {
            const planets = houseData[houseNumber]?.planets;
            if (!Array.isArray(planets)) continue;

            const bhavaLabel = this.getBhavaMetaLabel(chartType, houseNumber);

            planets.forEach((planet) => {
                const label = this.escapeHtml(planet.label || planet.abbr || 'Graha');
                const actions = [
                    this.actionButton('select-graha', 'Select Graha', 'mouse-pointer', `data-house="${houseNumber}" data-planet-id="${planet.id}"`),
                    this.actionButton('edit-graha', 'Edit Graha', 'pencil', `data-house="${houseNumber}" data-planet-id="${planet.id}"`),
                    this.actionButton('delete-graha', 'Delete Graha', 'trash-2', `data-house="${houseNumber}" data-planet-id="${planet.id}"`)
                ].join('');

                rows.push(this.renderRow(
                    label,
                    bhavaLabel,
                    actions,
                    'orbit',
                    { selected: this.isRowSelected('graha', { houseNumber, planetId: planet.id }) }
                ));
            });
        }

        if (rows.length === 0) {
            return this.renderSection('Grahas', '<p class="items-empty">No Grahas placed yet.</p>');
        }

        return this.renderSection('Grahas', rows.join(''));
    }

    renderAnnotationsSection() {
        this._shapes = this.getDrawingShapes();

        if (this._shapes.length === 0) {
            return this.renderSection('Annotations', '<p class="items-empty">No annotations yet.</p>');
        }

        const rows = this._shapes.map((shape, index) => {
            const label = this.escapeHtml(this.getAnnotationDisplayName(shape));
            const rowIcon = this.getAnnotationIcon(shape);
            const toolType = this.getAnnotationToolType(shape);
            const shapeAttrs = `data-shape-index="${index}"`;

            const actions = [
                this.actionButton('select-annotation', 'Select annotation', 'mouse-pointer', shapeAttrs)
            ];

            if (toolType === 'text' || toolType === 'heading') {
                actions.push(
                    this.actionButton('edit-annotation-text', 'Edit text', 'text-cursor', shapeAttrs),
                    this.actionButton('style-annotation', 'Style', 'palette', shapeAttrs)
                );
            } else if (this.canEditAnnotation(shape)) {
                actions.push(this.actionButton('edit-annotation', 'Edit annotation', 'pencil', shapeAttrs));
            }

            actions.push(this.actionButton('delete-annotation', 'Delete annotation', 'trash-2', shapeAttrs));

            return this.renderRow(
                label,
                '',
                actions.filter(Boolean).join(''),
                rowIcon,
                { selected: this.isRowSelected('annotation', { shapeIndex: index }) }
            );
        }).join('');

        return this.renderSection('Annotations', rows);
    }

    render() {
        const chartType = this.getChartTemplates()?.currentChartType || null;
        const template = this.getActiveTemplate();

        this.bodyEl.innerHTML = [
            this.renderUtilitySection(),
            this.renderChartSection(chartType),
            this.renderBhavasSection(chartType, template),
            this.renderGrahasSection(chartType, template),
            this.renderAnnotationsSection()
        ].join('');
    }

    handleBodyClick(e) {
        const btn = e.target.closest('[data-action]');
        if (!btn || !this.bodyEl.contains(btn)) return;

        const action = btn.dataset.action;
        const houseNumber = btn.dataset.house;
        const planetId = btn.dataset.planetId;
        const shapeIndex = btn.dataset.shapeIndex;

        const shape = shapeIndex !== undefined && shapeIndex !== ''
            ? this._shapes[parseInt(shapeIndex, 10)]
            : null;
        const inlineTextEdit = action === 'edit-annotation-text' && shape;

        if (!inlineTextEdit) {
            e.preventDefault();
        }

        switch (action) {
            case 'create-south-indian':
            case 'create-north-indian':
                this.getContextMenu()?.handleAction(action, houseNumber);
                this.close();
                break;

            case 'clear-chart':
            case 'reset-chart':
            case 'reset-drawings':
                this.close();
                this.getContextMenu()?.handleAction(action, houseNumber);
                break;

            case 'set-lagna':
            case 'set-first-house':
            case 'clear-house':
            case 'toggle-presentation-view':
                this.getContextMenu()?.handleAction(action, houseNumber);
                this.close();
                break;

            case 'clear-selection':
                window.app?.clearCanvasSelection?.();
                this.close();
                break;

            case 'toggle-context-menu':
                this.getContextMenu()?.toggleCanvasContextMenu();
                this.render();
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
                break;

            case 'select-bhava':
                this.selectBhava(houseNumber);
                break;

            case 'select-graha':
                this.selectGraha(houseNumber, planetId);
                break;

            case 'edit-graha':
                this.editGraha(houseNumber, planetId);
                break;

            case 'delete-graha':
                this.getContextMenu()?.handleAction('delete-planet', houseNumber, { planetId });
                this.close();
                break;

            case 'select-annotation':
                this.selectAnnotation(shapeIndex);
                break;

            case 'edit-annotation':
                this.editAnnotation(shapeIndex);
                break;

            case 'edit-annotation-text':
                this.editAnnotationText(shapeIndex);
                break;

            case 'style-annotation':
                this.styleAnnotation(shapeIndex);
                break;

            case 'delete-annotation':
                this.deleteAnnotation(shapeIndex);
                break;

            default:
                break;
        }
    }

    selectBhava(houseNumber) {
        const template = this.getActiveTemplate();
        if (!template || !houseNumber) return;

        this.close();
        window.app?.setTool('select');
        template.highlightHouse?.(parseInt(houseNumber, 10));
    }

    selectGraha(houseNumber, planetId) {
        const cm = this.getContextMenu();
        const template = this.getActiveTemplate();
        if (!cm || !template || !houseNumber || !planetId) return;

        const house = parseInt(houseNumber, 10);
        const houseData = template.getHouseData()[house];
        const planet = houseData?.planets?.find((p) => p.id === planetId);

        this.close();
        window.app?.setTool('select');
        template.highlightHouse?.(house);

        window.requestAnimationFrame(() => {
            const planetText = cm.findPlanetTextNode(house, planetId);
            if (planetText && planet && template.selectPlanet) {
                template.selectPlanet(planetText, house, planet.abbr, planetId);
            }
        });
    }

    editGraha(houseNumber, planetId) {
        this.close();
        window.app?.setTool('select');
        this.getContextMenu()?.openPlanetEditor(houseNumber, planetId);
    }

    selectAnnotation(shapeIndex) {
        const shape = this._shapes[parseInt(shapeIndex, 10)];
        if (!shape) return;

        this.close();
        window.app?.setTool('select');
        window.app?.drawingTools?.selectShape(shape);
    }

    editAnnotation(shapeIndex) {
        const shape = this._shapes[parseInt(shapeIndex, 10)];
        if (!shape || !this.canEditAnnotation(shape)) return;

        const toolType = this.getAnnotationToolType(shape);
        if (toolType === 'text' || toolType === 'heading') {
            return;
        }

        this.close();
        const drawingTools = window.app?.drawingTools;
        if (!drawingTools) return;

        if (toolType === 'pen') {
            drawingTools.editPenAnnotation(shape);
            return;
        }

        window.app?.setTool('select');
        drawingTools.selectShape(shape);
        drawingTools.showEditUI(shape, toolType);
    }

    editAnnotationText(shapeIndex) {
        const shape = this._shapes[parseInt(shapeIndex, 10)];
        if (!shape) return;

        const toolType = this.getAnnotationToolType(shape);
        if (toolType !== 'text' && toolType !== 'heading') {
            return;
        }

        this.close();
        window.app?.setTool('select');
        const drawingTools = window.app?.drawingTools;
        if (!drawingTools) return;

        drawingTools.selectShape(shape);
        drawingTools.startInlineContentEdit(shape);
    }

    styleAnnotation(shapeIndex) {
        const shape = this._shapes[parseInt(shapeIndex, 10)];
        if (!shape) return;

        const toolType = this.getAnnotationToolType(shape);
        if (toolType !== 'text' && toolType !== 'heading') {
            return;
        }

        this.close();
        window.app?.setTool('select');
        const drawingTools = window.app?.drawingTools;
        if (!drawingTools) return;

        drawingTools.selectShape(shape);
        drawingTools.showEditUI(shape, toolType);
    }

    deleteAnnotation(shapeIndex) {
        const shape = this._shapes[parseInt(shapeIndex, 10)];
        if (!shape) return;

        window.app?.setTool('select');
        window.app?.drawingTools?.selectShape(shape);
        window.app?.drawingTools?.deleteSelectedShape();
        this.render();
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
}
