/**
 * citrana-items-menu.js
 * Citrana • https://github.com/IAmVigneswaran/Soothsayer-Citrana
 * © 2026 Vigneswaran Rajkumar • Licensed under MIT License
 * Canvas Items panel — chart, Bhava, Graha, and annotation actions (desktop and mobile)
 */
class CitranaItemsMenu {
    constructor() {
        this.modal = null;
        this.bodyEl = null;
        this.navEl = null;
        this.scrollContainer = null;
        this.openBtn = null;
        this._shapes = [];
        this._sectionNav = [];
        this._navObserver = null;
        this._sectionNavScrollHandler = null;
        this._sectionNavResizeHandler = null;
        this._sectionNavScrollMQ = null;
    }

    init() {
        this.modal = document.getElementById('items-modal');
        this.bodyEl = document.getElementById('items-modal-body');
        this.navEl = document.getElementById('items-modal-nav');
        this.scrollContainer = this.bodyEl;
        this.openBtn = document.getElementById('items-menu-btn');

        if (!this.modal || !this.bodyEl || !this.openBtn) {
            console.error('Items menu elements not found');
            return;
        }

        this.openBtn.addEventListener('click', () => this.open());
        document.getElementById('items-modal-close')?.addEventListener('click', () => this.close());
        this.navEl?.addEventListener('click', (e) => this.handleNavClick(e));

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
        if (this.scrollContainer) {
            this.scrollContainer.scrollTop = 0;
        }
        if (this._sectionNav.length > 0) {
            this.setActiveSectionChip(this._sectionNav[0].id);
        }
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

    getPlanetSystem() {
        return window.app?.planetSystem;
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

    renderSection(title, content, sectionId = '', navLabel = '') {
        if (!content) return '';

        const id = sectionId || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        const label = navLabel || title;
        this._sectionNav.push({ id, label });

        return `
            <section class="items-section" id="items-section-${id}">
                <h3 class="items-section-title">${title}</h3>
                <div class="items-list">${content}</div>
            </section>
        `;
    }

    renderSectionNav() {
        if (!this.navEl) {
            return;
        }

        this.teardownSectionNavScrollFades();

        if (this._sectionNav.length < 2) {
            this.navEl.innerHTML = '';
            this.navEl.hidden = true;
            this.teardownSectionNavObserver();
            return;
        }

        const chips = this._sectionNav.map(({ id, label }) => (
            `<button type="button" class="items-section-chip" data-items-section="${id}">${this.escapeHtml(label)}</button>`
        )).join('');

        this.navEl.hidden = false;
        this.navEl.innerHTML = `<div class="items-section-nav-scroll-wrap"><div class="items-section-nav">${chips}</div></div>`;
        this.setupSectionNavObserver();
        this.setupSectionNavScrollFades();
    }

    handleNavClick(e) {
        const chip = e.target.closest('[data-items-section]');
        if (!chip || !this.navEl?.contains(chip)) {
            return;
        }

        e.preventDefault();
        this.scrollToSection(chip.dataset.itemsSection);
        this.setActiveSectionChip(chip.dataset.itemsSection);
    }

    scrollToSection(sectionId) {
        const section = document.getElementById(`items-section-${sectionId}`);
        if (!section) {
            return;
        }

        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    setActiveSectionChip(sectionId) {
        if (!this.navEl) {
            return;
        }

        this.navEl.querySelectorAll('.items-section-chip').forEach((chip) => {
            chip.classList.toggle('active', chip.dataset.itemsSection === sectionId);
        });
    }

    setupSectionNavObserver() {
        this.teardownSectionNavObserver();

        if (!this.scrollContainer || !this.navEl || this.navEl.hidden) {
            return;
        }

        const sections = this.bodyEl.querySelectorAll('.items-section[id]');
        if (!sections.length) {
            return;
        }

        this._navObserver = new IntersectionObserver((entries) => {
            const visible = entries
                .filter((entry) => entry.isIntersecting)
                .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

            if (visible.length > 0) {
                const sectionId = visible[0].target.id.replace('items-section-', '');
                this.setActiveSectionChip(sectionId);
            }
        }, {
            root: this.scrollContainer,
            rootMargin: '-20% 0px -60% 0px',
            threshold: 0
        });

        sections.forEach((section) => this._navObserver.observe(section));
    }

    teardownSectionNavObserver() {
        this._navObserver?.disconnect();
        this._navObserver = null;
    }

    setupSectionNavScrollFades() {
        const scrollEl = this.navEl?.querySelector('.items-section-nav');
        const wrapEl = this.navEl?.querySelector('.items-section-nav-scroll-wrap');
        if (!scrollEl || !wrapEl) {
            return;
        }

        this._sectionNavScrollMQ = window.matchMedia('(max-width: 768px)');

        const updateSectionNavFades = () => {
            if (!this._sectionNavScrollMQ.matches) {
                wrapEl.classList.remove('items-section-nav-fade-start', 'items-section-nav-fade-end');
                return;
            }

            const maxScroll = scrollEl.scrollWidth - scrollEl.clientWidth;
            const hasOverflow = maxScroll > 1;

            wrapEl.classList.toggle('items-section-nav-fade-start', hasOverflow && scrollEl.scrollLeft > 1);
            wrapEl.classList.toggle('items-section-nav-fade-end', hasOverflow && scrollEl.scrollLeft < maxScroll - 1);
        };

        this._sectionNavScrollHandler = updateSectionNavFades;
        scrollEl.addEventListener('scroll', updateSectionNavFades, { passive: true });

        this._sectionNavResizeHandler = () => {
            requestAnimationFrame(updateSectionNavFades);
        };
        window.addEventListener('resize', this._sectionNavResizeHandler);
        this._sectionNavScrollMQ.addEventListener('change', updateSectionNavFades);

        requestAnimationFrame(updateSectionNavFades);
    }

    teardownSectionNavScrollFades() {
        const scrollEl = this.navEl?.querySelector('.items-section-nav');
        if (scrollEl && this._sectionNavScrollHandler) {
            scrollEl.removeEventListener('scroll', this._sectionNavScrollHandler);
        }

        if (this._sectionNavResizeHandler) {
            window.removeEventListener('resize', this._sectionNavResizeHandler);
        }

        if (this._sectionNavScrollMQ && this._sectionNavScrollHandler) {
            this._sectionNavScrollMQ.removeEventListener('change', this._sectionNavScrollHandler);
        }

        this.navEl?.querySelector('.items-section-nav-scroll-wrap')
            ?.classList.remove('items-section-nav-fade-start', 'items-section-nav-fade-end');

        this._sectionNavScrollHandler = null;
        this._sectionNavResizeHandler = null;
        this._sectionNavScrollMQ = null;
    }

    renderRow(label, meta, actionsHtml, rowIcon = '', options = {}) {
        const metaHtml = meta ? `<span class="items-row-meta">${meta}</span>` : '';
        const iconHtml = rowIcon
            ? `<span class="items-row-icon" aria-hidden="true"><i data-lucide="${rowIcon}"></i></span>`
            : '';
        const selectedClass = options.selected ? ' items-row-selected' : '';
        const extraClass = options.extraClass ? ` ${options.extraClass}` : '';
        return `
            <div class="items-row${selectedClass}${extraClass}">
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

            return this.renderSection('Chart', rows, 'chart');
        }

        const chartName = chartType === 'south-indian' ? 'South Indian' : 'North Indian';
        let html = this.renderSection('Chart', `
            <p class="items-chart-type">${chartName} Chart</p>
        `, 'chart');

        if (chartType === 'north-indian') {
            const lagnaButtons = CitranaRashis.RASHIS.map((rashi, i) => (
                `<button type="button" class="items-lagna-btn" data-action="set-lagna" data-house="${i + 1}" title="Set Lagna as ${rashi.name}" aria-label="Set Lagna as ${rashi.name}">
                    ${CitranaRashis.iconHtml(rashi.icon)}
                    <span class="items-lagna-name">${rashi.name}</span>
                </button>`
            )).join('');

            html += this.renderSection('Set Lagna as …', `<div class="items-lagna-grid">${lagnaButtons}</div>`, 'set-lagna', 'Lagna');
        }

        const chartActions = [
            this.renderRow(this.getPresentationLabel(), '', this.actionButton('toggle-presentation-view', this.getPresentationLabel(), 'presentation'), 'presentation'),
            this.renderRow('Reset Chart', '', this.actionButton('reset-chart', 'Reset Chart', 'trash-2'), 'trash-2'),
            this.renderRow('Reset Annotations', '', this.actionButton('reset-drawings', 'Reset Annotations', 'trash-2'), 'trash-2'),
            this.renderRow('Clear Canvas', '', this.actionButton('clear-chart', 'Clear Canvas', 'trash-2'), 'trash-2')
        ].join('');

        html += this.renderSection('Chart Actions', chartActions, 'chart-actions', 'Actions');
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

        const contextMenuTitle = cm.getContextMenuItemsTitle();
        const contextMenuMeta = cm.getContextMenuItemsMeta();
        const contextMenuActionLabel = cm.getContextMenuToggleActionLabel();
        const contextMenuEnabled = cm.isCanvasContextMenuEnabled();
        const contextMenuActionIcon = contextMenuEnabled ? 'power-off' : 'power';
        const contextMenuRowClass = contextMenuEnabled
            ? 'items-row-context-menu-on'
            : 'items-row-context-menu-off';

        const planetSystem = this.getPlanetSystem();
        const grahaLibraryTitle = planetSystem?.getGrahaLibraryItemsTitle?.() || 'Graha Library';
        const grahaLibraryMeta = planetSystem?.getGrahaLibraryItemsMeta?.() || 'On';
        const grahaLibraryActionLabel = planetSystem?.getGrahaLibraryToggleActionLabel?.() || 'Disable Graha Library';
        const grahaLibraryEnabled = planetSystem?.isGrahaLibraryEnabled?.() !== false;
        const grahaLibraryActionIcon = grahaLibraryEnabled ? 'power-off' : 'power';
        const grahaLibraryRowClass = grahaLibraryEnabled
            ? 'items-row-context-menu-on'
            : 'items-row-context-menu-off';

        const rows = [
            this.renderRow(
                'Clear Selection',
                'Grahas, Bhavas, Annotations',
                this.actionButton('clear-selection', 'Clear Selection', 'mouse-pointer-2'),
                'mouse-pointer-2'
            ),
            this.renderRow(
                contextMenuTitle,
                contextMenuMeta,
                this.actionButton('toggle-context-menu', contextMenuActionLabel, contextMenuActionIcon),
                'square-menu',
                { extraClass: contextMenuRowClass }
            ),
            this.renderRow(
                grahaLibraryTitle,
                grahaLibraryMeta,
                this.actionButton('toggle-graha-library', grahaLibraryActionLabel, grahaLibraryActionIcon),
                'orbit',
                { extraClass: grahaLibraryRowClass }
            ),
            this.renderRow(
                planetSystem?.getGrahaLibraryResetItemsTitle?.() || 'Reset Graha Library Position',
                planetSystem?.getGrahaLibraryResetItemsMeta?.() || 'Default Layout',
                this.actionButton(
                    'reset-graha-library-position',
                    planetSystem?.getGrahaLibraryResetActionLabel?.() || 'Reset Graha Library Position',
                    'move'
                ),
                'orbit'
            )
        ].join('');

        return this.renderSection('Canvas', rows, 'canvas');
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

        return this.renderSection('Bhavas', rows.join(''), 'bhavas');
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
            return this.renderSection('Grahas', '<p class="items-empty">No Grahas placed yet.</p>', 'grahas');
        }

        return this.renderSection('Grahas', rows.join(''), 'grahas');
    }

    renderAnnotationsSection() {
        this._shapes = this.getDrawingShapes();

        if (this._shapes.length === 0) {
            return this.renderSection('Annotations', '<p class="items-empty">No Annotations yet.</p>', 'annotations');
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

        return this.renderSection('Annotations', rows, 'annotations');
    }

    render() {
        this._sectionNav = [];
        const chartType = this.getChartTemplates()?.currentChartType || null;
        const template = this.getActiveTemplate();

        this.bodyEl.innerHTML = [
            this.renderUtilitySection(),
            this.renderChartSection(chartType),
            this.renderBhavasSection(chartType, template),
            this.renderGrahasSection(chartType, template),
            this.renderAnnotationsSection()
        ].join('');

        this.renderSectionNav();
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

            case 'toggle-graha-library':
                this.getPlanetSystem()?.toggleGrahaLibrary();
                this.render();
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
                break;

            case 'reset-graha-library-position':
                this.getPlanetSystem()?.resetGrahaLibraryPosition();
                this.close();
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
