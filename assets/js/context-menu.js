/**
 * context-menu.js
 * Citrana • https://github.com/IAmVigneswaran/Soothsayer-Citrana 
 * © 2026 Vigneswaran Rajkumar • Licensed under MIT License
 * Handles all right-click and long-press context menu functionality
 */
class ContextMenu {
    constructor() {
        this.menu = null;
        this._menuTouchBound = false;
        this._canvasContextMenuEnabled = true;

        try {
            const stored = localStorage.getItem('citrana_context_menu_enabled');
            if (stored !== null) {
                this._canvasContextMenuEnabled = stored === 'true';
            }
        } catch (_) {
            // localStorage unavailable
        }
    }

    init() {
        this.createMenu();
        this.setupEventListeners();
        citranaDebug('Context menu initialized');
    }

    createMenu() {
        // Remove existing menu if any
        const existingMenu = document.getElementById('context-menu');
        if (existingMenu) {
            existingMenu.remove();
        }

        // Create new menu
        this.menu = document.createElement('div');
        this.menu.id = 'context-menu';
        this.menu.className = 'context-menu hidden';
        document.body.appendChild(this.menu);
    }

    setupEventListeners() {
        // Prevent default context menu on canvas
        const canvas = document.getElementById('canvas-container');

        if (canvas) {
            // Desktop: Right-click context menu
            canvas.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                if (this.shouldBlockCanvasContextMenu()) {
                    return;
                }
                this.openContextMenuAtClientPoint(e.clientX, e.clientY);
            });

            // Mobile: Long press for context menu (Select tool only)
            let longPressTimer = null;
            let longPressTriggered = false;

            canvas.addEventListener('touchstart', (e) => {
                if (e.touches.length !== 1) {
                    return;
                }

                if (this.shouldBlockCanvasContextMenu()) {
                    return;
                }

                longPressTriggered = false;
                const clientX = e.touches[0].clientX;
                const clientY = e.touches[0].clientY;
                longPressTimer = setTimeout(() => {
                    e.preventDefault();
                    longPressTriggered = true;
                    this.openContextMenuAtClientPoint(clientX, clientY);
                }, 500);
            }, { passive: false });

            canvas.addEventListener('touchmove', (e) => {
                // Cancel long press if user moves finger
                if (longPressTimer) {
                    clearTimeout(longPressTimer);
                    longPressTimer = null;
                }
            });

            canvas.addEventListener('touchend', (e) => {
                // Cancel long press if user lifts finger before threshold
                if (longPressTimer) {
                    clearTimeout(longPressTimer);
                    longPressTimer = null;
                }

                // If long press was triggered, prevent the menu from being hidden
                if (longPressTriggered) {
                    e.preventDefault();
                    e.stopPropagation();
                    // Reset the flag after a short delay to allow normal touch behavior
                    setTimeout(() => {
                        longPressTriggered = false;
                    }, 100);
                }
            });

            canvas.addEventListener('touchcancel', (e) => {
                // Cancel long press if touch is cancelled
                if (longPressTimer) {
                    clearTimeout(longPressTimer);
                    longPressTimer = null;
                }
            });
        } else {
            console.error('Canvas container not found for context menu');
        }

        // Hide menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.menu && !this.menu.contains(e.target)) {
                this.hide();
            }
        });

        // Hide menu when touching outside (mobile) - but not immediately after long press
        document.addEventListener('touchend', (e) => {
            // Add a small delay to prevent immediate hiding after long press
            setTimeout(() => {
                if (this.menu && !this.menu.contains(e.target)) {
                    this.hide();
                }
            }, 150);
        });

        // Prevent immediate hiding when touching inside the menu
        document.addEventListener('touchstart', (e) => {
            citranaDebug('[CONTEXT MENU] Document touchstart, target:', e.target);
            if (this.menu && this.menu.contains(e.target)) {
                citranaDebug('[CONTEXT MENU] Touching inside menu, preventing propagation');
                // Prevent the touchstart from triggering the hide logic
                e.stopPropagation();
            }
        }, {
            passive: false
        });

        // Hide menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hide();
            }
        });
    }

    shouldBlockCanvasContextMenu() {
        if (!this.isCanvasContextMenuEnabled()) {
            return true;
        }

        const app = window.app;
        if (!app) {
            return false;
        }

        if (app.isDrawing) {
            return true;
        }

        const tool = app.currentTool;
        return tool && tool !== 'select' && tool !== 'hand';
    }

    isCanvasContextMenuEnabled() {
        return this._canvasContextMenuEnabled !== false;
    }

    setCanvasContextMenuEnabled(enabled) {
        this._canvasContextMenuEnabled = !!enabled;

        try {
            localStorage.setItem('citrana_context_menu_enabled', String(this._canvasContextMenuEnabled));
        } catch (_) {
            // localStorage unavailable
        }

        if (!enabled) {
            this.hide();
        }
    }

    toggleCanvasContextMenu() {
        this.setCanvasContextMenuEnabled(!this.isCanvasContextMenuEnabled());
        return this.isCanvasContextMenuEnabled();
    }

    getContextMenuToggleLabel() {
        return this.isCanvasContextMenuEnabled() ? 'Disable Context Menu' : 'Enable Context Menu';
    }

    getShapeAtClientPoint(clientX, clientY) {
        const stage = window.app?.stage;
        if (!stage) return null;

        const container = stage.container();
        if (!container) return null;

        const rect = container.getBoundingClientRect();
        const pos = {
            x: clientX - rect.left,
            y: clientY - rect.top
        };

        return stage.getIntersection(pos);
    }

    findPlanetContextById(planetId) {
        const template = this.getActiveChartTemplate();
        if (!template || !planetId) return null;

        const houseData = template.getHouseData();
        for (const hNum in houseData) {
            const planets = houseData[hNum]?.planets;
            if (!Array.isArray(planets)) continue;

            const planet = planets.find((p) => p.id === planetId);
            if (planet) {
                return {
                    houseNumber: parseInt(hNum, 10),
                    abbr: planet.abbr,
                    planetId: planet.id
                };
            }
        }
        return null;
    }

    resolveContextTarget(shape) {
        let node = shape;
        while (node) {
            const name = typeof node.name === 'function' ? node.name() : '';
            if (!name) {
                node = node.getParent();
                continue;
            }

            if (name.startsWith('house-')) {
                const houseNumber = parseInt(name.slice('house-'.length), 10);
                if (houseNumber) {
                    return { kind: 'house', houseNumber };
                }
            }

            if (name.startsWith('planet-hit-')) {
                const planetId = name.slice('planet-hit-'.length);
                const ctx = this.findPlanetContextById(planetId);
                if (ctx) {
                    return { kind: 'planet', ...ctx };
                }
            }

            if (name.startsWith('planet-') && !name.startsWith('planet-hit-')) {
                const match = name.match(/^planet-(.+)-(\d+)-(.+)$/);
                if (match) {
                    return {
                        kind: 'planet',
                        abbr: match[1],
                        houseNumber: parseInt(match[2], 10),
                        planetId: match[3]
                    };
                }
            }

            node = node.getParent();
        }
        return null;
    }

    openContextMenuAtClientPoint(clientX, clientY) {
        if (!this.isCanvasContextMenuEnabled()) {
            return;
        }

        const shape = this.getShapeAtClientPoint(clientX, clientY);
        const target = this.resolveContextTarget(shape);

        if (target?.kind === 'house') {
            const template = this.getActiveChartTemplate();
            if (template?.highlightHouse) {
                template.highlightHouse(target.houseNumber);
            }
            if (window.app?.chartTemplates?.currentChartType === 'south-indian') {
                window.selectedBhavaSouth = target.houseNumber;
            } else if (window.app?.chartTemplates?.currentChartType === 'north-indian') {
                window.selectedBhavaNorth = target.houseNumber;
            }
            this.showHouseMenu(clientX, clientY, target.houseNumber);
            return;
        }

        if (target?.kind === 'planet') {
            const template = this.getActiveChartTemplate();
            const planetText = this.findPlanetTextNode(target.houseNumber, target.planetId);
            if (template?.selectPlanet && planetText) {
                template.selectPlanet(planetText, target.houseNumber, target.abbr, target.planetId);
            }
            this.showPlanetMenu(clientX, clientY, target.houseNumber, target.abbr, target.planetId);
            return;
        }

        this.showChartMenu(clientX, clientY);
    }

    getPresentationViewMenuHtml(isLast = false) {
        const active = window.app?.isPresentationView?.() ?? false;
        const label = active ? 'Exit Presentation View' : 'Presentation View';
        const icon = 'presentation';
        const lastClass = isLast ? ' last-item' : '';

        return `<div class="context-menu-item${lastClass}" data-action="toggle-presentation-view"><i data-lucide="${icon}"></i> ${label}</div>`;
    }

    showChartMenu(x, y) {
        const chartType = window.app?.chartTemplates?.currentChartType;

        if (chartType) {
            // Chart exists - show chart-specific menu
            this.showExistingChartMenu(x, y, chartType);
        } else {
            // No chart - show chart creation menu
            this.showCreateChartMenu(x, y);
        }
    }

    showCreateChartMenu(x, y) {
        this.menu.innerHTML = `
            <div class="context-menu-create-header">Create Chart</div>
            <div class="context-menu-separator"></div>
            <div class="context-menu-item" data-action="create-north-indian"><i data-lucide="plus-circle"></i> North Indian Chart</div>
            <div class="context-menu-item" data-action="create-south-indian"><i data-lucide="plus-circle"></i> South Indian Chart</div>
            <div class="context-menu-separator"></div>
            ${this.getPresentationViewMenuHtml()}
            <div class="context-menu-separator"></div>
            <div class="context-menu-item last-item" data-action="clear-chart"><i data-lucide="trash-2"></i> Clear Canvas</div>
        `;
        lucide.createIcons();
        this.show(x, y);
        this.setupMenuEventListeners();
    }

    showExistingChartMenu(x, y, chartType) {
        const chartName = chartType === 'south-indian' ? 'South Indian' : 'North Indian';
        const rashis = CitranaRashis.RASHIS;
        const lagnaMenuItems = rashis.map((rashi, i) =>
            `<div class='context-menu-item' data-action='set-lagna' data-house='${i + 1}'><span class='zodiac-symbol'>${rashi.symbol}</span> ${rashi.name}</div>`
        ).join('');

        let menuHtml = `
            <div class="context-menu-header">${chartName} Chart</div>
            <div class="context-menu-separator"></div>
        `;
        // North Indian chart menu: Set Lagna as … (Rashi). South Indian Lagna is set via Bhava right-click only.
        if (chartType === 'north-indian') {
            menuHtml += `
            <div class="context-menu-item has-submenu" data-action="set-lagna-parent"><i data-lucide="target"></i> Set Lagna as …
                <div class="context-submenu context-menu">
                    ${lagnaMenuItems}
                </div>
            </div>
            <div class="context-menu-separator"></div>
            `;
        }
        // Add 'Reset Chart', 'Reset Drawings', and 'Clear Canvas' (renamed from 'Clear Chart')
        menuHtml += `
            ${this.getPresentationViewMenuHtml()}
            <div class="context-menu-separator"></div>
            <div class="context-menu-item" data-action="reset-chart"><i data-lucide="trash-2"></i> Reset Chart</div>
            <div class="context-menu-item" data-action="reset-drawings"><i data-lucide="trash-2"></i> Reset Drawings</div>
            <div class="context-menu-item last-item" data-action="clear-chart"><i data-lucide="trash-2"></i> Clear Canvas</div>
        `;
        this.menu.innerHTML = menuHtml;
        lucide.createIcons();
        this.show(x, y);
        this.setupMenuEventListeners();
    }

    showHouseMenu(x, y, houseNumber) {
        this.currentHouseNumber = houseNumber;
        citranaDebug('showHouseMenu called for house:', houseNumber);
        const chartType = window.app?.chartTemplates?.currentChartType;
        const chartName = chartType === 'south-indian' ? 'South Indian' : 'North Indian';

        let houseLabel = houseNumber;
        if (chartType === 'south-indian') {
            const template = window.app?.chartTemplates?.southIndianTemplate;
            if (template) {
                houseLabel = template.getBhavaNumberForHouse(parseInt(houseNumber, 10));
            }
        }

        const headerSuffix = `Bhava ${houseLabel}`;

        let lagnaActionHtml = '';
        if (chartType === 'south-indian') {
            lagnaActionHtml = `<div class="context-menu-item" data-action="set-lagna" data-house="${houseNumber}"><i data-lucide="target"></i> Set as Lagna</div>`;
        } else if (chartType === 'north-indian') {
            lagnaActionHtml = `<div class="context-menu-item" data-action="set-first-house" data-house="${houseNumber}"><i data-lucide="home"></i> Set as First Bhava</div>`;
        }

        const menuHtml =
            `<div class="context-menu-header">${chartName} Chart - ${headerSuffix}</div>` +
            `<div class="context-menu-separator"></div>` +
            lagnaActionHtml +
            `<div class="context-menu-separator"></div>` +
            `<div class="context-menu-item danger" data-action="clear-house" data-house="${houseNumber}"><i data-lucide="trash-2"></i> Clear Bhava</div>` +
            `<div class="context-menu-separator"></div>` +
            `${this.getPresentationViewMenuHtml()}` +
            `<div class="context-menu-separator"></div>` +
            `<div class="context-menu-item" data-action="reset-chart"><i data-lucide="refresh-ccw"></i> Reset Chart</div>` +
            `<div class="context-menu-item last-item" data-action="clear-chart"><i data-lucide="trash-2"></i> Clear Canvas</div>`;

        this.menu.innerHTML = menuHtml;
        lucide.createIcons();

        const lagnaItem = this.menu.querySelector('[data-action="set-lagna"]');
        const firstHouseItem = this.menu.querySelector('[data-action="set-first-house"]');
        const clearHouseItem = this.menu.querySelector('[data-action="clear-house"]');
        if (lagnaItem) {
            lagnaItem.setAttribute('data-house', houseNumber);
            lagnaItem._houseNumber = houseNumber;
        }
        if (firstHouseItem) {
            firstHouseItem.setAttribute('data-house', houseNumber);
            firstHouseItem._houseNumber = houseNumber;
        }
        if (clearHouseItem) {
            clearHouseItem.setAttribute('data-house', houseNumber);
            clearHouseItem._houseNumber = houseNumber;
        }
        this.show(x, y);
        this.setupMenuEventListeners();
    }

    showPlanetMenu(x, y, houseNumber, planetAbbr, planetId) {
        const menuHtml = `
            <div class="context-menu-header">Graha Options</div>
            <div class="context-menu-separator"></div>
            <div class="context-menu-item" data-action="rename-planet" data-house="${houseNumber}" data-abbr="${planetAbbr}" data-planetid="${planetId}"><i data-lucide="edit"></i> Edit Graha</div>
            <div class="context-menu-item danger last-item" data-action="delete-planet" data-house="${houseNumber}" data-abbr="${planetAbbr}" data-planetid="${planetId}"><i data-lucide="trash-2"></i> Delete Graha</div>
        `;
        this.menu.innerHTML = menuHtml;
        lucide.createIcons();
        this.show(x, y);
        this.setupMenuEventListeners();
        this.menu.style.zIndex = '9999';
    }

    toggleSubmenuParent(item) {
        if (!item) return;

        const wasOpen = item.classList.contains('submenu-open');
        this.menu.querySelectorAll('.has-submenu.submenu-open').forEach((el) => {
            el.classList.remove('submenu-open');
        });

        if (!wasOpen) {
            item.classList.add('submenu-open');
        }
    }

    handleSubmenuParentAction(item, e) {
        if (!item || item.dataset.action !== 'set-lagna-parent') {
            return false;
        }

        if (!CitranaDevice.hasFinePointer()) {
            e.preventDefault();
            this.toggleSubmenuParent(item);
        }

        return true;
    }

    setupMenuEventListeners() {
        // Desktop: replace onclick each time menu HTML is rebuilt
        this.menu.onclick = (e) => {
            const item = e.target.closest('.context-menu-item');
            citranaDebug('Click event target:', e.target);
            citranaDebug('Closest .context-menu-item:', item);
            if (!item) return;
            e.preventDefault();
            if (this.handleSubmenuParentAction(item, e)) return;
            const action = item.dataset.action;
            const houseNumber = item.dataset.house || item._houseNumber || this.currentHouseNumber;
            const context = {
                planetId: item.dataset.planetid,
                abbr: item.dataset.abbr
            };
            citranaDebug('Menu item clicked:', action, houseNumber);
            this.handleAction(action, houseNumber, context);
            this.hide();
        };

        // Mobile: bind once — innerHTML changes do not remove listeners on this.menu
        if (this._menuTouchBound) {
            return;
        }
        this._menuTouchBound = true;

        this.menu.addEventListener('touchstart', (e) => {
            e.stopPropagation();
        }, {
            passive: false
        });

        this.menu.addEventListener('touchend', (e) => {
            const item = e.target.closest('.context-menu-item');
            if (item) {
                e.preventDefault();
                e.stopPropagation();
                if (this.handleSubmenuParentAction(item, e)) return;
                const action = item.dataset.action;
                const houseNumber = item.dataset.house || item._houseNumber || this.currentHouseNumber;
                const context = {
                    planetId: item.dataset.planetid,
                    abbr: item.dataset.abbr
                };
                citranaDebug('Menu item touched:', action, houseNumber);
                this.handleAction(action, houseNumber, context);
                this.hide();
            }
        }, {
            passive: false
        });
    }

    getActiveChartTemplate() {
        const chartType = window.app?.chartTemplates?.currentChartType;
        if (chartType === 'south-indian') {
            return window.app.chartTemplates.southIndianTemplate;
        }
        if (chartType === 'north-indian') {
            return window.app.chartTemplates.northIndianTemplate;
        }
        return null;
    }

    findPlanetTextNode(houseNumber, planetId) {
        const template = this.getActiveChartTemplate();
        if (!template || !planetId) return null;

        const chartGroup = template.getChartGroup();
        if (!chartGroup) return null;

        const byId = chartGroup.findOne((node) => node.getAttr?.('_planetId') === planetId);
        if (byId) {
            return byId;
        }

        const house = parseInt(houseNumber, 10);
        const suffix = `-${house}-${planetId}`;

        return chartGroup.findOne((node) => {
            const name = node.name();
            return name &&
                name.startsWith('planet-') &&
                !name.startsWith('planet-hit-') &&
                name.endsWith(suffix);
        });
    }

    openPlanetEditor(houseNumber, planetId) {
        const template = this.getActiveChartTemplate();
        const planetText = this.findPlanetTextNode(houseNumber, planetId);
        if (!template || !planetText || !window.app?.drawingTools) return;

        const house = parseInt(houseNumber, 10);
        const houseData = template.getHouseData()[house];
        if (!houseData?.planets) return;

        window.app.drawingTools.editPlanetText(planetText, (newLabel, newColor, newRetrograde) => {
            const planetIndex = houseData.planets.findIndex((p) => p.id === planetId);
            if (planetIndex === -1) return;

            houseData.planets[planetIndex].label = newLabel;
            houseData.planets[planetIndex].color = newColor;
            houseData.planets[planetIndex].retrograde = !!newRetrograde;
            template.updatePlanetsInHouse(house);
        });
    }

    removePlanetFromHouse(houseNumber, planetId) {
        const template = this.getActiveChartTemplate();
        if (!template || !planetId) return;

        const house = parseInt(houseNumber, 10);
        template.removePlanetFromHouseById(house, planetId);
    }

    clearHousePlanets(houseNumber) {
        const template = this.getActiveChartTemplate();
        if (!template) return;

        const house = parseInt(houseNumber, 10);
        const houseData = template.getHouseData()[house];
        if (!houseData) return;

        houseData.planets = [];
        template.updatePlanetsInHouse(house);
        template.getLayer().batchDraw();

        if (window.app?.recordHistory) {
            window.app.recordHistory('Clear Bhava');
        }
    }

    handleAction(action, houseNumber, context = {}) {
        switch (action) {
            case 'create-south-indian':
                window.app.chartTemplates.createSouthIndianChart();
                window.app.recordHistory('Create South Indian chart');
                break;

            case 'create-north-indian':
                window.app.chartTemplates.createNorthIndianChart();
                window.app.recordHistory('Create North Indian chart');
                break;

            case 'clear-chart':
                window.app.showConfirmationDialog(
                    'This will completely clear the entire canvas, removing all charts, Grahas, drawings, and any other content. The canvas will be returned to its initial blank state. This action cannot be undone.',
                    () => window.app.clearChart()
                );
                break;
            case 'reset-chart':
                window.app.showConfirmationDialog(
                    'This will reset the current chart by removing all Grahas and drawing elements (arrows, lines, pen strokes, text, and headings), but will preserve the chart structure and layout. The chart type (South Indian or North Indian) will remain the same. This action cannot be undone.',
                    () => window.app.resetChart()
                );
                break;

            case 'reset-drawings':
                window.app.showConfirmationDialog(
                    'This will remove all drawing elements (arrows, lines, pen strokes, text annotations, and headings) from the chart. The chart structure and all placed Grahas will remain unchanged. This action cannot be undone.',
                    () => window.app.resetDrawings()
                );
                break;

            case 'set-lagna':
                citranaDebug('Context Menu - set-lagna action triggered');
                citranaDebug('House number from menu:', houseNumber);

                if (!houseNumber || !window.app?.chartTemplates) {
                    citranaDebug('set-lagna skipped — missing house number or chart');
                    break;
                }

                window.app.chartTemplates.setLagnaHouse(parseInt(houseNumber, 10));
                break;

            case 'set-first-house':
                if (houseNumber && window.app?.chartTemplates?.currentChartType === 'north-indian') {
                    const template = window.app.chartTemplates.northIndianTemplate;
                    const visualHouse = parseInt(houseNumber, 10);
                    const rashiLagna = template.getRashiNumberForHouse(visualHouse);
                    window.app.chartTemplates.setLagnaHouse(rashiLagna);
                }
                break;

            case 'clear-house':
                if (houseNumber) {
                    this.clearHousePlanets(houseNumber);
                }
                break;

            case 'rename-planet':
                if (houseNumber && context.planetId) {
                    this.openPlanetEditor(houseNumber, context.planetId);
                }
                break;

            case 'delete-planet':
                if (houseNumber && context.planetId) {
                    this.removePlanetFromHouse(houseNumber, context.planetId);
                }
                break;

            case 'toggle-presentation-view':
                window.app?.togglePresentationView();
                break;
        }
    }

    show(x, y) {
        // Ensure proper positioning
        this.menu.style.position = 'absolute';
        this.menu.style.left = x + 'px';
        this.menu.style.top = y + 'px';
        this.menu.style.zIndex = '2000';

        // Ensure menu doesn't go off-screen
        const rect = this.menu.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        if (rect.right > viewportWidth) {
            this.menu.style.left = (x - rect.width) + 'px';
        }

        if (rect.bottom > viewportHeight) {
            this.menu.style.top = (y - rect.height) + 'px';
        }

        this.menu.classList.remove('hidden');
    }

    hide() {
        this.menu.classList.add('hidden');
    }
}