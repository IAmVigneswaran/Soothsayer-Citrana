/**
 * citrana-app.js
 * Citrana • https://github.com/IAmVigneswaran/Soothsayer-Citrana 
 * © 2026 Vigneswaran Rajkumar • Licensed under MIT License
 * Main application coordinator that manages all components and application lifecycle
 */
class CitranaApp {
    constructor() {
        this.stage = null;
        this.layer = null;
        this.chartTemplates = null;
        this.planetSystem = null;
        this.drawingTools = null;
        this.contextMenu = null;
        this.itemsMenu = null;
        this.currentTool = 'select';
        this.isDrawing = false;
        this.lastPoint = null;
        this.exportWithWhiteBg = true; // Default: white background
        this.isExporting = false; // Prevent multiple concurrent exports
        this.zoomLocked = true; // Block wheel and +/- zoom until user unlocks
        this.presentationView = false;
        this.welcomeLoadingInterval = null;
        this._modalFocusStack = [];
        this.options = {
            northHideIndicators: localStorage.getItem('citrana_north_hide_indicators') === '1',
            southHideIndicators: localStorage.getItem('citrana_south_hide_indicators') === '1',
            saveChartOnly: localStorage.getItem('citrana_save_chart_only') === '1'
        };
        this.init();
    }

    init() {
        citranaDebug('Initializing Citrana App...');

        this.setupCanvas();
        this.setupComponents();
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.drawingTools.syncBoundingBoxListening();
        // Each visit starts fresh; clear any legacy chart data from older builds.
        localStorage.removeItem('citranaChartData');

        // Show welcome modal on first visit
        this.showWelcomeModal();

        citranaDebug('App initialization complete');
    }

    setupCanvas() {
        const container = document.getElementById('canvas-container');
        this.stage = new Konva.Stage({
            container: 'canvas-container',
            width: container.offsetWidth,
            height: container.offsetHeight
        });

        // Safari-specific configuration for better drag and drop
        this.stage.draggable(false); // Disable stage dragging by default
        this.stage.on('dragstart', (e) => {
            // Prevent stage dragging when dragging Grahas
            if (e.target && e.target.name() && e.target.name().startsWith('planet-')) {
                e.evt.preventDefault();
            }
        });

        this.layer = new Konva.Layer();
        this.stage.add(this.layer);

        this.stage.on('scaleXChange scaleYChange', () => this.updateZoomLevel());

        citranaDebug('Canvas setup complete');
    }

    /**
     * Apply a cursor to the canvas container and Konva stage canvases (inherit alone is unreliable in some browsers).
     * @param {string} cursor
     */
    setCanvasCursor(cursor) {
        const container = document.getElementById('canvas-container');
        if (!container) {
            return;
        }

        container.style.cursor = cursor;

        const content = this.stage?.content;
        if (content) {
            content.style.cursor = cursor;
        }

        container.querySelectorAll('canvas').forEach((canvas) => {
            canvas.style.cursor = cursor;
        });
    }

    setupComponents() {
        this.chartTemplates = new ChartCoordinator(this.stage, this.layer);
        this.planetSystem = new PlanetSystem(this.stage, this.layer, this.chartTemplates);
        this.drawingTools = new DrawingTools(this.stage, this.layer);
        this.contextMenu = new ContextMenu();
        this.itemsMenu = new CitranaItemsMenu();

        // Initialize components
        this.planetSystem.init();
        this.contextMenu.init();
        this.itemsMenu.init();
        CitranaAnnotationFonts?.ensureLoaded?.();

        if (typeof CitranaColorPicker !== 'undefined') {
            CitranaColorPicker.initGrahaBar();
        }

        this.updateZoomLevel();

        this.history = new CitranaHistory({
            maxSteps: 50,
            captureState: () => this.captureHistoryState(),
            restoreState: (state) => this.restoreHistoryState(state)
        });
        this.history.record('Start');
        this.updateHistoryButtons();

        citranaDebug('Components setup complete');
    }

    /**
     * True when the Konva target is not a Graha, drawing, or control handle.
     * @param {Konva.Node|null} target
     * @returns {boolean}
     */
    isEmptyCanvasTarget(target) {
        if (!target || typeof target.name !== 'function') {
            return true;
        }

        const name = target.name() || '';
        if (name.startsWith('planet-') || name.startsWith('planet-hit-')) {
            return false;
        }
        if (name.startsWith('house-')) {
            return false;
        }
        if (name.startsWith('drawing-') || name.startsWith('bounding-box-')) {
            return false;
        }
        if (name === 'control-point-start' || name === 'control-point-end') {
            return false;
        }

        return true;
    }

    /**
     * True when the pointer hit an existing annotation (not chart content).
     * Used by the pen tool to avoid starting a stroke on top of another drawing.
     * @param {Konva.Node|null} target
     * @returns {boolean}
     */
    isAnnotationTarget(target) {
        if (!target || typeof target.name !== 'function') {
            return false;
        }

        const name = target.name() || '';
        return name.startsWith('drawing-') ||
            name.startsWith('bounding-box-') ||
            name === CitranaSelection?.PILL_NAME ||
            name === 'control-point-start' ||
            name === 'control-point-end';
    }

    clearPlanetSelection() {
        this.chartTemplates?.southIndianTemplate?.clearSelectedPlanet?.();
        this.chartTemplates?.northIndianTemplate?.clearSelectedPlanet?.();
    }

    clearBhavaHighlight() {
        this.chartTemplates?.southIndianTemplate?.clearHighlight?.();
        this.chartTemplates?.northIndianTemplate?.clearHighlight?.();
        window.selectedBhavaSouth = null;
        window.selectedBhavaNorth = null;
    }

    /**
     * Clear Graha, Bhava, and annotation selections plus any open edit bars.
     */
    clearCanvasSelection() {
        this.clearPlanetSelection();
        this.clearBhavaHighlight();
        this.drawingTools?.clearSelection?.();
        this.drawingTools?.editUI?.hide?.();
        this.drawingTools?.dismissPlanetEditing?.();
        this.notifyCanvasSelectionChanged();
    }

    getDrawingShapes() {
        return this.drawingTools?.layer?.find((node) => {
            const name = node.name();
            return name && name.startsWith('drawing-');
        }) || [];
    }

    /**
     * Current canvas selection for Items panel row highlight.
     * @returns {{ type: 'graha'|'bhava'|'annotation', houseNumber?: number, planetId?: string, shapeIndex?: number }|null}
     */
    getCanvasSelection() {
        const chartType = this.chartTemplates?.currentChartType;

        if (chartType === 'south-indian') {
            const template = this.chartTemplates.southIndianTemplate;
            const selectedPlanet = template?.selectedPlanet;
            if (selectedPlanet) {
                return {
                    type: 'graha',
                    houseNumber: selectedPlanet.houseNumber,
                    planetId: selectedPlanet.id
                };
            }

            const houseNumber = template?.selectedHouse || window.selectedBhavaSouth;
            if (houseNumber) {
                return { type: 'bhava', houseNumber: parseInt(houseNumber, 10) };
            }
        } else if (chartType === 'north-indian') {
            const template = this.chartTemplates.northIndianTemplate;
            const selectedPlanet = template?.selectedPlanet;
            if (selectedPlanet) {
                return {
                    type: 'graha',
                    houseNumber: selectedPlanet.houseNumber,
                    planetId: selectedPlanet.id
                };
            }

            const houseNumber = template?.selectedHouse || window.selectedBhavaNorth;
            if (houseNumber) {
                return { type: 'bhava', houseNumber: parseInt(houseNumber, 10) };
            }
        }

        const selectedShape = this.drawingTools?.selectedShape;
        if (selectedShape?.name?.()?.startsWith('drawing-')) {
            const shapes = this.getDrawingShapes();
            const shapeIndex = shapes.indexOf(selectedShape);
            if (shapeIndex >= 0) {
                return { type: 'annotation', shapeIndex };
            }
        }

        return null;
    }

    notifyCanvasSelectionChanged() {
        this.itemsMenu?.refreshSelectionHighlight?.();
    }

    setupEventListeners() {
        // Tool selection
        document.getElementById('select-tool').addEventListener('click', () => this.setTool('select'));
        document.getElementById('arrow-tool').addEventListener('click', () => this.setTool('arrow'));
        document.getElementById('line-tool').addEventListener('click', () => this.setTool('line'));
        document.getElementById('pen-tool').addEventListener('click', () => this.setTool('pen'));
        document.getElementById('laser-tool').addEventListener('click', () => this.setTool('laser'));
        document.getElementById('text-tool').addEventListener('click', () => this.setTool('text'));
        document.getElementById('hand-tool').addEventListener('click', () => this.setTool('hand'));
        document.getElementById('heading-tool').addEventListener('click', () => this.setTool('heading'));

        // Action buttons
        document.getElementById('undo-btn').addEventListener('click', () => this.undo());
        document.getElementById('redo-btn').addEventListener('click', () => this.redo());
        document.getElementById('export-btn').addEventListener('click', () => this.exportChart());

        const saveSessionBtn = document.getElementById('save-session-btn');
        const openSessionBtn = document.getElementById('open-session-btn');
        const openSessionInput = document.getElementById('open-session-input');

        if (saveSessionBtn) {
            saveSessionBtn.addEventListener('click', () => this.saveSession());
        }

        if (openSessionBtn && openSessionInput) {
            openSessionBtn.addEventListener('click', () => {
                openSessionInput.click();
            });

            openSessionInput.addEventListener('change', (e) => {
                const file = e.target.files?.[0];
                if (file) {
                    this.openSessionFromFile(file);
                }
                e.target.value = '';
            });
        }

        // Toggle Transparency Button
        const toggleBtn = document.getElementById('toggle-transparency-btn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                if (this.options.saveChartOnly) {
                    return;
                }
                this.exportWithWhiteBg = !this.exportWithWhiteBg;
                this.updateTransparencyToggleUI();
            });
        }
        this.applySaveChartOnlyTransparency();

        // Help Button
        const helpBtn = document.getElementById('help-btn');
        const helpModal = document.getElementById('help-modal');
        const helpModalClose = document.getElementById('help-modal-close');

        if (helpBtn && helpModal && helpModalClose) {
            helpBtn.addEventListener('click', () => {
                this.openModal(helpModal);
            });

            helpModalClose.addEventListener('click', () => {
                this.closeModal(helpModal);
            });

            // Close modal when clicking outside
            helpModal.addEventListener('click', (e) => {
                if (e.target === helpModal) {
                    this.closeModal(helpModal);
                }
            });
        }

        // Options Button
        const optionsBtn = document.getElementById('options-btn');
        const optionsModal = document.getElementById('options-modal');
        const optionsModalClose = document.getElementById('options-modal-close');
        const southHideIndicatorsToggle = document.getElementById('south-hide-indicators-toggle');
        const northHideIndicatorsToggle = document.getElementById('north-hide-indicators-toggle');
        const saveChartOnlyToggle = document.getElementById('save-chart-only-toggle');

        if (northHideIndicatorsToggle) {
            northHideIndicatorsToggle.checked = this.options.northHideIndicators;
            northHideIndicatorsToggle.addEventListener('change', (e) => {
                this.setNorthHideIndicators(e.target.checked);
            });
        }

        if (southHideIndicatorsToggle) {
            southHideIndicatorsToggle.checked = this.options.southHideIndicators;
            southHideIndicatorsToggle.addEventListener('change', (e) => {
                this.setSouthHideIndicators(e.target.checked);
            });
        }

        if (saveChartOnlyToggle) {
            saveChartOnlyToggle.checked = this.options.saveChartOnly;
            saveChartOnlyToggle.addEventListener('change', (e) => {
                this.setSaveChartOnly(e.target.checked);
            });
        }

        if (optionsBtn && optionsModal && optionsModalClose) {
            optionsBtn.addEventListener('click', () => {
                if (northHideIndicatorsToggle) {
                    northHideIndicatorsToggle.checked = this.options.northHideIndicators;
                }
                if (southHideIndicatorsToggle) {
                    southHideIndicatorsToggle.checked = this.options.southHideIndicators;
                }
                if (saveChartOnlyToggle) {
                    saveChartOnlyToggle.checked = this.options.saveChartOnly;
                }
                this.openModal(optionsModal);
            });

            optionsModalClose.addEventListener('click', () => {
                this.closeModal(optionsModal);
            });

            optionsModal.addEventListener('click', (e) => {
                if (e.target === optionsModal) {
                    this.closeModal(optionsModal);
                }
            });
        }

        // About Button
        const aboutBtn = document.getElementById('about-btn');
        const aboutModal = document.getElementById('about-modal');
        const aboutModalClose = document.getElementById('about-modal-close');
        const welcomeModal = document.getElementById('welcome-modal');
        const welcomeModalClose = document.getElementById('welcome-modal-close');

        if (aboutBtn && aboutModal && aboutModalClose) {
            aboutBtn.addEventListener('click', () => {
                this.openModal(aboutModal);
            });

            aboutModalClose.addEventListener('click', () => {
                this.closeModal(aboutModal);
            });

            // Close modal when clicking outside
            aboutModal.addEventListener('click', (e) => {
                if (e.target === aboutModal) {
                    this.closeModal(aboutModal);
                }
            });
        }

        // Welcome modal event listeners
        if (welcomeModal && welcomeModalClose) {
            welcomeModalClose.addEventListener('click', () => {
                this.closeWelcomeModal();
            });

            // Close modal when clicking outside
            welcomeModal.addEventListener('click', (e) => {
                if (e.target === welcomeModal) {
                    this.closeWelcomeModal();
                }
            });
        }

        // Zoom controls
        document.getElementById('zoom-in').addEventListener('click', () => this.zoomIn());
        document.getElementById('zoom-out').addEventListener('click', () => this.zoomOut());
        document.getElementById('reset-zoom').addEventListener('click', () => this.zoomToFit());
        document.getElementById('zoom-lock').addEventListener('click', () => this.toggleZoomLock());

        this.updateZoomLockUI();

        // Canvas events
        this.stage.on('mousedown', (e) => {
            if (this.isEmptyCanvasTarget(e.target)) {
                this.clearCanvasSelection();
            } else {
                const editUI = this.drawingTools?.editUI;
                if (editUI?.isEditUIVisible()) {
                    const pickerOpen = typeof CitranaColorPicker !== 'undefined' &&
                        CitranaColorPicker.isPickerDialogOpen();
                    if (!pickerOpen) {
                        editUI.hide();
                    }
                }
                if (this.drawingTools.isEditingPlanet) {
                    this.drawingTools.dismissPlanetEditing();
                }
            }

            this.handleMouseDown(e);
        });
        this.stage.on('dblclick', (e) => {
            this.drawingTools.handleSelectDoubleClick(e);
        });
        this.stage.on('click', (e) => {
            if (this.currentTool === 'select') {
                this.drawingTools.handleSelectPenClick(e);
            }
        });
        this.stage.on('mousemove', (e) => this.handleMouseMove(e));
        this.stage.on('mouseup', (e) => this.handleMouseUp(e));
        this.stage.on('wheel', (e) => this.handleWheel(e));

        // Touch events for mobile
        this.stage.on('touchstart', (e) => this.handleTouchStart(e));
        this.stage.on('touchmove', (e) => this.handleTouchMove(e));
        this.stage.on('touchend', (e) => this.handleTouchEnd(e));

        // Tap-outside-to-deselect for mobile
        this.stage.on('tap', (e) => {
            if (this.isEmptyCanvasTarget(e.target)) {
                this.clearCanvasSelection();
            }
        });

        // Safari-specific fix for toolbar visibility
        this.setupSafariToolbarFix();

        // Prevent zooming on input focus in mobile browsers
        this.setupMobileInputZoomPrevention();

        // Window resize
        window.addEventListener('resize', () => this.handleResize());
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', () => this.handleResize());
        }

        // Confirmation Dialog
        this.setupConfirmationDialog();

        this.setupToolbarScroll();
    }

    /**
     * Mobile toolbar: horizontal scroll with chevron nudges when items overflow.
     */
    setupToolbarScroll() {
        const viewport = document.getElementById('toolbar-scroll-viewport');
        const prev = document.getElementById('toolbar-scroll-prev');
        const next = document.getElementById('toolbar-scroll-next');
        if (!viewport || !prev || !next) return;

        this._toolbarScrollMQ = window.matchMedia('(max-width: 768px)');
        const scrollStep = 140;

        const updateToolbarScrollButtons = () => {
            if (!this._toolbarScrollMQ.matches) {
                prev.hidden = true;
                next.hidden = true;
                viewport.scrollLeft = 0;
                return;
            }

            const maxScroll = viewport.scrollWidth - viewport.clientWidth;
            const hasOverflow = maxScroll > 1;

            prev.hidden = !hasOverflow;
            next.hidden = !hasOverflow;
            prev.disabled = viewport.scrollLeft <= 1;
            next.disabled = viewport.scrollLeft >= maxScroll - 1;
        };

        this.updateToolbarScrollButtons = updateToolbarScrollButtons;

        prev.addEventListener('click', () => {
            viewport.scrollBy({ left: -scrollStep, behavior: 'smooth' });
        });

        next.addEventListener('click', () => {
            viewport.scrollBy({ left: scrollStep, behavior: 'smooth' });
        });

        viewport.addEventListener('scroll', updateToolbarScrollButtons, { passive: true });
        this._toolbarScrollMQ.addEventListener('change', updateToolbarScrollButtons);
        window.addEventListener('load', updateToolbarScrollButtons);
        requestAnimationFrame(updateToolbarScrollButtons);
    }

    /**
     * Setup Safari-specific fix to ensure toolbar remains visible
     */
    setupSafariToolbarFix() {
        // Only apply Safari-specific fixes
        if (!this.isTouchDevice()) return;

        const toolbar = document.querySelector('.floating-top-toolbar');
        const editUI = document.querySelector('.floating-edit-ui');
        const textEditControls = document.querySelector('.floating-text-edit-controls');

        // Fix UI elements visibility after focus events (keyboard dismissal)
        const fixUIElementsVisibility = () => {
            if (window.app?.presentationView) return;

            setTimeout(() => {
                // Fix top toolbar - always visible
                if (toolbar) {
                    toolbar.style.visibility = 'visible';
                    toolbar.style.opacity = '1';
                    // Don't force display - let existing CSS control it
                    citranaDebug('[SAFARI] Top toolbar visibility restored');
                }

                // Fix floating edit UI - only if it should be visible
                if (editUI && editUI.style.display !== 'none') {
                    editUI.style.visibility = 'visible';
                    editUI.style.opacity = '1';
                    // Don't force display - let JavaScript control it
                    citranaDebug('[SAFARI] Floating Edit UI visibility restored');
                }

                // Fix floating text edit controls - only if it should be visible
                if (textEditControls && textEditControls.style.display !== 'none') {
                    textEditControls.style.visibility = 'visible';
                    textEditControls.style.opacity = '1';
                    // Don't force display - let JavaScript control it
                    citranaDebug('[SAFARI] Text Edit Controls visibility restored');

                    // Fix individual Graha text edit input elements
                    const textEditInput = document.getElementById('text-edit-input');
                    const textEditColor = document.getElementById('text-edit-color');
                    const textEditButtons = textEditControls.querySelectorAll('button');

                    if (textEditInput) {
                        textEditInput.style.visibility = 'visible';
                        textEditInput.style.opacity = '1';
                        // Don't force display - let existing CSS control it
                    }

                    if (textEditColor) {
                        textEditColor.style.visibility = 'visible';
                        textEditColor.style.opacity = '1';
                        // Don't force display - let existing CSS control it
                    }

                    textEditButtons.forEach(button => {
                        button.style.visibility = 'visible';
                        button.style.opacity = '1';
                        // Don't force display - let existing CSS control it
                    });

                    citranaDebug('[SAFARI] Graha text edit input elements restored');
                }
            }, 100);
        };

        // Listen for focus events that might indicate keyboard dismissal
        document.addEventListener('focusin', fixUIElementsVisibility);
        document.addEventListener('focusout', fixUIElementsVisibility);

        // Listen for window resize events (Safari sometimes triggers these)
        window.addEventListener('resize', fixUIElementsVisibility);

        // Listen for scroll events (Safari sometimes hides elements during scroll)
        window.addEventListener('scroll', fixUIElementsVisibility);

        // iOS keyboard open/close — visualViewport changes more reliably than window resize
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', fixUIElementsVisibility);
            window.visualViewport.addEventListener('scroll', fixUIElementsVisibility);
        }
    }

    /**
     * iOS zooms focused text fields with font-size below 16px; checkboxes and other controls should not be intercepted.
     * @param {EventTarget|null} target
     * @returns {boolean}
     */
    shouldPreventMobileInputZoom(target) {
        if (!target || !(target instanceof HTMLElement)) {
            return false;
        }

        if (target.tagName === 'TEXTAREA') {
            return true;
        }

        if (target.tagName !== 'INPUT') {
            return false;
        }

        const type = (target.getAttribute('type') || 'text').toLowerCase();
        return ['text', 'number', 'email', 'password', 'search', 'tel', 'url', 'color'].includes(type);
    }

    /**
     * Setup mobile input zoom prevention
     */
    setupMobileInputZoomPrevention() {
        // Only apply on mobile devices
        if (!this.isTouchDevice()) return;

        // Prevent zoom on input focus
        const preventZoomOnFocus = (e) => {
            const target = e.target;

            if (!this.shouldPreventMobileInputZoom(target)) {
                return;
            }

            // Force minimum font size to prevent zoom
            target.style.fontSize = '16px';

            // Prevent zoom by ensuring proper viewport
            const viewport = document.querySelector('meta[name="viewport"]');
            if (viewport) {
                // Temporarily set viewport to prevent zoom
                viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, user-scalable=no');

                // Restore viewport after a short delay
                setTimeout(() => {
                    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, user-scalable=yes, maximum-scale=5.0, minimum-scale=0.1, viewport-fit=cover');
                }, 100);
            }

            citranaDebug('[MOBILE] Prevented zoom on input focus');
        };

        // Listen for focus events on input fields
        document.addEventListener('focusin', preventZoomOnFocus);

        // Also prevent zoom on touch events for text-entry inputs
        const preventZoomOnTouch = (e) => {
            const target = e.target;

            if (!this.shouldPreventMobileInputZoom(target)) {
                return;
            }

            // Prevent default zoom behavior
            e.preventDefault();

            // Force focus without zoom
            target.focus();

            citranaDebug('[MOBILE] Prevented zoom on input touch');
        };

        // Listen for touch events on input fields
        document.addEventListener('touchstart', preventZoomOnTouch, {
            passive: false
        });
    }

    setupConfirmationDialog() {
        const confirmationModal = document.getElementById('confirmation-modal');
        const confirmationClose = document.getElementById('confirmation-modal-close');
        const confirmationYes = document.getElementById('confirmation-yes');
        const confirmationNo = document.getElementById('confirmation-no');

        if (confirmationModal && confirmationClose && confirmationYes && confirmationNo) {
            // Close button
            confirmationClose.addEventListener('click', () => {
                this.closeModal(confirmationModal);
            });

            // No button - close modal
            confirmationNo.addEventListener('click', () => {
                this.closeModal(confirmationModal);
            });

            // Yes button - execute the callback
            confirmationYes.addEventListener('click', () => {
                if (this.pendingConfirmationCallback) {
                    this.pendingConfirmationCallback();
                    this.pendingConfirmationCallback = null;
                }
                this.closeModal(confirmationModal);
            });

            // Close when clicking outside
            confirmationModal.addEventListener('click', (e) => {
                if (e.target === confirmationModal) {
                    this.closeModal(confirmationModal);
                }
            });
        }
    }

    showConfirmationDialog(message, callback) {
        const confirmationModal = document.getElementById('confirmation-modal');
        const confirmationMessage = document.getElementById('confirmation-message');

        if (confirmationModal && confirmationMessage) {
            confirmationMessage.textContent = message;
            this.pendingConfirmationCallback = callback;
            this.openModal(confirmationModal);
        }
    }

    exportChart() {
        // Prevent multiple concurrent exports
        if (this.isExporting) {
            citranaDebug('Export already in progress, ignoring duplicate request');
            return;
        }

        citranaDebug('=== Starting export process ===');
        this.isExporting = true;
        this.showExportProgress();

        const performExport = () => {
            const chartOnly = this.options.saveChartOnly === true && this.chartTemplates?.hasActiveChart();
            let savedView = null;
            let selectedShape = null;

            try {
                this.updateExportProgress(50, chartOnly
                    ? 'Generating chart image...'
                    : 'Generating high-resolution image...');

                if (chartOnly) {
                    savedView = {
                        scaleX: this.stage.scaleX(),
                        scaleY: this.stage.scaleY(),
                        x: this.stage.x(),
                        y: this.stage.y()
                    };
                    selectedShape = this.drawingTools?.selectedShape ?? null;
                    this.drawingTools?.clearControlPoints();
                    this.chartTemplates.zoomToFit();
                }

                const crop = chartOnly ? this.chartTemplates.getExportCropRect() : null;
                if (chartOnly && !crop) {
                    throw new Error('Could not determine chart bounds for export');
                }

                const stageWidth = this.stage.width();
                const stageHeight = this.stage.height();
                let bgRect = null;

                if (!chartOnly && this.exportWithWhiteBg) {
                    bgRect = new Konva.Rect({
                        x: 0,
                        y: 0,
                        width: stageWidth,
                        height: stageHeight,
                        fill: 'white',
                        listening: false,
                        name: 'export-bg-rect'
                    });
                    this.layer.add(bgRect);
                    bgRect.moveToBottom();
                    this.layer.batchDraw();
                }

                this.stage.batchDraw();

                const exportConfig = {
                    pixelRatio: 2,
                    mimeType: 'image/png'
                };
                if (chartOnly && crop) {
                    exportConfig.x = Math.floor(crop.x);
                    exportConfig.y = Math.floor(crop.y);
                    exportConfig.width = Math.ceil(crop.width);
                    exportConfig.height = Math.ceil(crop.height);
                }

                const dataURL = this.stage.toDataURL(exportConfig);

                if (bgRect) {
                    bgRect.destroy();
                    this.layer.batchDraw();
                }

                if (savedView) {
                    this.stage.scale({ x: savedView.scaleX, y: savedView.scaleY });
                    this.stage.position({ x: savedView.x, y: savedView.y });
                    this.stage.batchDraw();
                    this.updateZoomLevel();
                    if (selectedShape && this.drawingTools?.supportsControlPoints(selectedShape)) {
                        this.drawingTools.createControlPoints(selectedShape);
                    }
                }

                this.updateExportProgress(chartOnly ? 85 : 80, chartOnly
                    ? 'Preparing download...'
                    : 'Adding padding and watermark...');

                this.finalizeExportImage(dataURL, { chartOnly });
            } catch (error) {
                console.error('Error exporting chart:', error);
                if (savedView) {
                    this.stage.scale({ x: savedView.scaleX, y: savedView.scaleY });
                    this.stage.position({ x: savedView.x, y: savedView.y });
                    this.stage.batchDraw();
                    this.updateZoomLevel();
                    if (selectedShape && this.drawingTools?.supportsControlPoints(selectedShape)) {
                        this.drawingTools.createControlPoints(selectedShape);
                    }
                }
                this.updateExportProgress(0, 'Export failed. Please try again.');
                setTimeout(() => {
                    this.hideExportProgress();
                    this.isExporting = false;
                    this._lastDownloadedFile = null;
                }, 1000);
            }
        };

        requestAnimationFrame(performExport);
    }

    finalizeExportImage(dataURL, { chartOnly = false } = {}) {
        const img = new window.Image();
        img.onload = () => {
            try {
                this.updateExportProgress(90, 'Creating final image...');

                const padding = chartOnly ? 0 : 100;
                const paddedWidth = img.width + padding * 2;
                const paddedHeight = img.height + padding * 2;
                const offscreen = document.createElement('canvas');
                offscreen.width = paddedWidth;
                offscreen.height = paddedHeight;
                const ctx = offscreen.getContext('2d');

                const useWhiteBg = chartOnly ? false : this.exportWithWhiteBg;

                if (useWhiteBg) {
                    ctx.fillStyle = 'white';
                    ctx.fillRect(0, 0, paddedWidth, paddedHeight);
                } else {
                    ctx.clearRect(0, 0, paddedWidth, paddedHeight);
                }

                ctx.drawImage(img, padding, padding);

                if (!chartOnly) {
                    ctx.font = '24px sans-serif';
                    ctx.fillStyle = '#888';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'bottom';
                    const watermark = 'Generated using Citrana - https://citrana.soothsayer.life/';
                    ctx.fillText(watermark, paddedWidth / 2, paddedHeight - 30);
                }

                this.updateExportProgress(95, 'Preparing download...');

                const finalDataURL = offscreen.toDataURL('image/png');
                const now = new Date();
                const year = now.getFullYear();
                const month = String(now.getMonth() + 1).padStart(2, '0');
                const day = String(now.getDate()).padStart(2, '0');
                const hours = String(now.getHours()).padStart(2, '0');
                const minutes = String(now.getMinutes()).padStart(2, '0');
                const seconds = String(now.getSeconds()).padStart(2, '0');
                const timestamp = `${year}-${month}-${day}-${hours}${minutes}${seconds}`;
                const filename = `citrana-chart-${timestamp}.png`;

                this.downloadFile(finalDataURL, filename);
                this.updateExportProgress(100, 'Export completed successfully!');

                setTimeout(() => {
                    this.hideExportProgress();
                    this.isExporting = false;
                    this._lastDownloadedFile = null;
                    citranaDebug(`Chart exported successfully as: ${filename}`);
                }, 300);
            } catch (error) {
                console.error('Error processing export:', error);
                this.updateExportProgress(0, 'Export failed. Please try again.');
                setTimeout(() => {
                    this.hideExportProgress();
                    this.isExporting = false;
                    this._lastDownloadedFile = null;
                }, 1000);
            }
        };

        img.onerror = () => {
            console.error('Error loading image for export');
            this.updateExportProgress(0, 'Export failed. Please try again.');
            setTimeout(() => {
                this.hideExportProgress();
                this.isExporting = false;
                this._lastDownloadedFile = null;
            }, 1000);
        };

        img.src = dataURL;
    }

    showExportProgress() {
        const modal = document.getElementById('export-progress-modal');
        const progressFill = document.getElementById('export-progress-fill');
        const progressText = document.getElementById('export-progress-text');

        if (modal && progressFill && progressText) {
            const wasVisible = modal.style.display === 'block';
            progressFill.style.width = '0%';
            progressText.textContent = 'Preparing chart for export...';
            modal.style.display = 'block';
            modal.setAttribute('aria-hidden', 'false');
            modal.setAttribute('aria-busy', 'true');
            if (!wasVisible) {
                this.pushModalFocus();
                requestAnimationFrame(() => this.focusModalEntry(modal));
            }
        }
    }

    updateExportProgress(percentage, message) {
        const progressFill = document.getElementById('export-progress-fill');
        const progressText = document.getElementById('export-progress-text');

        if (progressFill && progressText) {
            progressFill.style.width = `${percentage}%`;
            progressText.textContent = message;
        }
    }

    hideExportProgress() {
        const modal = document.getElementById('export-progress-modal');
        if (modal) {
            const wasVisible = modal.style.display === 'block';
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
            modal.setAttribute('aria-busy', 'false');
            if (wasVisible) {
                this.popModalFocus();
            }
        }
    }

    downloadFile(dataURL, filename) {
        // Chrome-specific fix: Use a more robust download method
        citranaDebug('Starting download for:', filename);

        // Prevent multiple downloads of the same file
        if (this._lastDownloadedFile === filename) {
            citranaDebug('File already downloaded, skipping duplicate:', filename);
            return;
        }
        this._lastDownloadedFile = filename;

        // Detect Chrome/Brave
        const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
        const isBrave = navigator.brave && navigator.brave.isBrave();

        if (isChrome || isBrave) {
            // Chrome/Brave specific method: Use blob with proper cleanup
            citranaDebug('Using Chrome/Brave specific download method');

            // Convert dataURL to blob
            const byteString = atob(dataURL.split(',')[1]);
            const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);

            for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }

            const blob = new Blob([ab], {
                type: mimeString
            });
            const url = window.URL.createObjectURL(blob);

            // Chrome/Brave specific: Use a more robust approach
            // Create download link with unique ID to prevent conflicts
            const linkId = 'download-link-' + Date.now();
            const link = document.createElement('a');
            link.id = linkId;
            link.href = url;
            link.download = filename;
            link.style.display = 'none';
            link.style.position = 'absolute';
            link.style.left = '-9999px';
            link.style.top = '-9999px';
            link.style.zIndex = '-9999';

            // Add to DOM
            document.body.appendChild(link);

            // Chrome/Brave specific: Use a more reliable click method
            const triggerDownload = () => {
                try {
                    // Try the standard click method first
                    link.click();
                    citranaDebug('Standard click triggered for Chrome/Brave');
                } catch (clickError) {
                    console.error('Standard click failed, trying alternative:', clickError);

                    // Alternative: Create a mouse event
                    const clickEvent = new MouseEvent('click', {
                        view: window,
                        bubbles: true,
                        cancelable: true
                    });
                    link.dispatchEvent(clickEvent);
                    citranaDebug('Mouse event triggered for Chrome/Brave');
                }

                // Cleanup after a shorter delay for Chrome/Brave
                setTimeout(() => {
                    const linkElement = document.getElementById(linkId);
                    if (linkElement) {
                        document.body.removeChild(linkElement);
                    }
                    window.URL.revokeObjectURL(url);
                    citranaDebug('Chrome/Brave download completed for:', filename);
                }, 200); // Reduced from 500ms to 200ms
            };

            // Use a shorter delay for Chrome/Brave to ensure DOM is ready
            setTimeout(triggerDownload, 10); // Reduced from 50ms to 10ms

        } else {
            // Standard method for other browsers
            citranaDebug('Using standard download method');

            try {
                const link = document.createElement('a');
                link.download = filename;
                link.href = dataURL;
                link.style.display = 'none';

                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                citranaDebug('Standard download completed for:', filename);

            } catch (error) {
                console.error('Standard download failed, trying blob method:', error);

                // Fallback to blob method
                try {
                    const response = fetch(dataURL);
                    response.then(res => res.blob()).then(blob => {
                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = filename;
                        link.style.display = 'none';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(url);
                        citranaDebug('Blob download completed for:', filename);
                    });
                } catch (blobError) {
                    console.error('All download methods failed:', blobError);

                    // Last resort: Open in new window
                    const newWindow = window.open(dataURL, '_blank');
                    if (newWindow) {
                        citranaDebug('Opened image in new window as last resort');
                    }
                }
            }
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Check if we're in text editing mode
            const textarea = document.querySelector('.konva-textarea');
            const textEditInput = document.getElementById('text-edit-input');
            if ((textarea && document.activeElement === textarea) ||
                (textEditInput && document.activeElement === textEditInput)) {
                // Only allow Enter and Escape in text editing mode
                if (e.key === 'Enter' || e.key === 'Escape') {
                    return; // Let the textarea handle these
                }
                return; // Ignore all other keyboard shortcuts during text editing
            }

            if (e.key === 'Escape' && this.dismissActiveModalOnEscape()) {
                e.preventDefault();
                return;
            }

            if (e.key === 'Tab' && this.trapModalFocus(e)) {
                return;
            }

            if (this.isModalBlockingShortcuts()) {
                return;
            }

            // Tool shortcuts
            if (e.key === 'v' || e.key === 'V') {
                e.preventDefault();
                this.setTool('select');
            } else if (e.key === 'a' || e.key === 'A') {
                e.preventDefault();
                this.setTool('arrow');
            } else if (e.key === 'l' || e.key === 'L') {
                e.preventDefault();
                this.setTool('line');
            } else if (e.key === 'p' || e.key === 'P') {
                e.preventDefault();
                this.setTool('pen');
            } else if ((e.key === 'k' || e.key === 'K') && this.drawingTools?.isLaserToolAvailable()) {
                e.preventDefault();
                this.setTool('laser');
            } else if (e.key === 't' || e.key === 'T') {
                e.preventDefault();
                this.setTool('text');
            } else if (e.key === 'h' || e.key === 'H') {
                e.preventDefault();
                this.setTool('hand');
            }

            // Action shortcuts
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'z' && !e.shiftKey) {
                    e.preventDefault();
                    this.undo();
                } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
                    e.preventDefault();
                    this.redo();
                }
            }

            // Zoom shortcuts
            if (e.key === '+' || e.key === '=') {
                if (!this.zoomLocked) {
                    e.preventDefault();
                    this.zoomIn();
                }
            } else if (e.key === '-') {
                if (!this.zoomLocked) {
                    e.preventDefault();
                    this.zoomOut();
                }
            } else if (e.key === '0') {
                e.preventDefault();
                this.zoomToFit();
            }

            // Delete: selected Graha first, else selected drawing (Select tool only)
            if (e.key === 'Delete') {
                const chartType = this.chartTemplates?.currentChartType;
                if (chartType === 'south-indian') {
                    const selected = this.chartTemplates.southIndianTemplate?.selectedPlanet;
                    if (selected) {
                        e.preventDefault();
                        this.chartTemplates.southIndianTemplate.removePlanetFromHouseById(
                            selected.houseNumber,
                            selected.id
                        );
                        return;
                    }
                } else if (chartType === 'north-indian') {
                    const selected = this.chartTemplates.northIndianTemplate?.selectedPlanet;
                    if (selected) {
                        e.preventDefault();
                        this.chartTemplates.northIndianTemplate.removePlanetFromHouseById(
                            selected.houseNumber,
                            selected.id
                        );
                        return;
                    }
                }
                if (this.currentTool === 'select') {
                    e.preventDefault();
                    this.drawingTools.deleteSelectedShape();
                }
            }

            // Help modal shortcut
            if (e.key === '?' || e.key === '/') {
                e.preventDefault();
                const helpModal = document.getElementById('help-modal');
                if (helpModal) {
                    this.openModal(helpModal);
                }
            }
        });
    }

    setTool(tool) {
        if (tool === 'laser' && !this.drawingTools?.isLaserToolAvailable()) {
            tool = 'select';
        }

        this.currentTool = tool;
        this.drawingTools.setTool(tool);

        // Update UI
        document.querySelectorAll('.toolbar-btn').forEach(btn => btn.classList.remove('active'));
        const mainBtn = document.getElementById(`${tool}-tool`);
        if (mainBtn) mainBtn.classList.add('active');

        // Update cursor and touch behavior
        if (tool === 'hand') {
            this.setCanvasCursor('grab');
            // Don't enable draggable here - only enable it during touch/mouse down
        } else if (tool === 'select') {
            this.setCanvasCursor('default');
            // Ensure stage is not draggable when switching to select tool
            this.stage.draggable(false);
        } else {
            this.setCanvasCursor('crosshair');
            // Ensure stage is not draggable for drawing tools
            this.stage.draggable(false);
        }

        citranaDebug(`Tool set to: ${tool}`);
    }

    handleMouseDown(e) {
        const pos = this.drawingTools.getPrecisePositionFromKonva(e);

        if (this.currentTool === 'hand') {
            // Safari-specific: Ensure stage is draggable for hand tool
            this.stage.draggable(true);
            this.setCanvasCursor('grabbing');
        } else if (this.currentTool === 'select') {
            this.drawingTools.handleSelectMouseDown(pos, e);
        } else if (pos) {
            // Pen stays active after a stroke — do not start on top of an existing annotation
            if (this.currentTool === 'pen' && this.isAnnotationTarget(e.target)) {
                return;
            }

            if (this.currentTool === 'pen' && !this.isEmptyCanvasTarget(e.target)) {
                e.cancelBubble = true;
            }

            this.lastPoint = pos;
            this.drawingTools.startDrawing(pos, this.currentTool);
            this.isDrawing = this.drawingTools.isDrawing;
        }
    }

    handleMouseMove(e) {
        const pos = this.drawingTools.getPrecisePositionFromKonva(e);

        if (this.isDrawing && pos) {
            this.drawingTools.draw(pos, this.currentTool);
            this.lastPoint = pos;
        }
    }

    handleMouseUp(e) {
        if (this.currentTool === 'hand') {
            // Safari-specific: Disable stage dragging when hand tool is released
            this.stage.draggable(false);
            this.setCanvasCursor('grab');
        } else if (this.currentTool === 'select') {
            this.drawingTools.handleSelectMouseUp();
        } else {
            this.isDrawing = false;
            this.drawingTools.stopDrawing();
        }
    }

    /**
     * Handle touch start events for mobile
     * @param {KonvaEvent} e - Konva touch event
     */
    handleTouchStart(e) {
        const target = e.target;
        const targetName = target?.name?.() || '';
        const preserveTouchDrag = targetName === 'control-point-start' ||
            targetName === 'control-point-end' ||
            targetName.startsWith('planet-') ||
            targetName.startsWith('planet-hit-');

        // Allow Konva drag on Grahas and arrow/line control points; block scroll elsewhere
        if (!preserveTouchDrag) {
            e.evt.preventDefault();
        }

        if (this.currentTool === 'hand') {
            // Enable stage dragging for hand tool
            this.stage.draggable(true);
            this.setCanvasCursor('grabbing');
        } else if (this.currentTool === 'select') {
            const pos = this.drawingTools.getPrecisePositionFromKonva(e);
            if (this.isEmptyCanvasTarget(e.target)) {
                this.clearCanvasSelection();
            }
            this.drawingTools.handleSelectTouchDown(pos, e);
        } else {
            // For drawing tools, use the existing touch handling
            const pos = this.drawingTools.getPrecisePositionFromKonva(e);
            if (this.currentTool === 'pen' && this.isAnnotationTarget(e.target)) {
                return;
            }
            if (pos) {
                this.lastPoint = pos;
                this.drawingTools.startDrawing(pos, this.currentTool);
                this.isDrawing = this.drawingTools.isDrawing;
            }
        }
    }

    /**
     * Handle touch move events for mobile
     * @param {KonvaEvent} e - Konva touch event
     */
    handleTouchMove(e) {
        const target = e.target;
        const targetName = target?.name?.() || '';
        const preserveTouchDrag = targetName === 'control-point-start' ||
            targetName === 'control-point-end' ||
            targetName.startsWith('planet-') ||
            targetName.startsWith('planet-hit-') ||
            this.drawingTools?.isDraggingControlPoint;

        if (!preserveTouchDrag) {
            e.evt.preventDefault();
        }

        if (this.isDrawing) {
            const pos = this.drawingTools.getPrecisePositionFromKonva(e);
            if (pos) {
                this.drawingTools.draw(pos, this.currentTool);
                this.lastPoint = pos;
            }
        }
        // Hand tool panning is handled automatically by Konva's draggable
    }

    /**
     * Handle touch end events for mobile
     * @param {KonvaEvent} e - Konva touch event
     */
    handleTouchEnd(e) {
        // Prevent default to avoid browser gestures
        e.evt.preventDefault();

        if (this.currentTool === 'hand') {
            // Disable stage dragging when hand tool is released
            this.stage.draggable(false);
            this.setCanvasCursor('grab');
        } else if (this.currentTool === 'select') {
            this.drawingTools.handleSelectTouchUp();
        } else {
            this.isDrawing = false;
            this.drawingTools.stopDrawing();

            // After drawing is complete, ensure the shape can be selected
            if (this.drawingTools.currentShape) {
                // Small delay to ensure the shape is fully created
                setTimeout(() => {
                    this.drawingTools.currentShape.setAttrs({
                        listening: true,
                        draggable: false // Will be enabled when select tool is active
                    });
                }, 100);
            }
        }
    }

    handleWheel(e) {
        // Allow pinch-to-zoom on mobile devices
        if (this.isTouchDevice()) {
            return;
        }

        if (this.zoomLocked) {
            return;
        }

        const pointer = this.stage.getPointerPosition();
        if (!pointer) {
            return;
        }

        e.evt.preventDefault();

        const scaleBy = 1.1;
        const oldScale = this.stage.scaleX();
        const MIN_ZOOM = 0.1;
        const MAX_ZOOM = 5;

        let newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
        newScale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, newScale));

        if (newScale === oldScale) {
            return;
        }

        const mousePointTo = {
            x: (pointer.x - this.stage.x()) / oldScale,
            y: (pointer.y - this.stage.y()) / oldScale
        };

        this.stage.scale({
            x: newScale,
            y: newScale
        });

        const newPos = {
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale
        };

        this.stage.position(newPos);
        this.stage.batchDraw();
    }

    isTouchDevice() {
        return CitranaDevice.isTouchDevice();
    }

    isPresentationView() {
        return this.presentationView;
    }

    getModalFocusableElements(modal) {
        const selector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
        return Array.from(modal.querySelectorAll(selector)).filter((el) => {
            if (el.disabled || el.getAttribute('aria-hidden') === 'true') {
                return false;
            }
            return el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0;
        });
    }

    getModalInitialFocusElement(modal) {
        const closeButton = modal.querySelector('button[class*="modal-close"]');
        if (closeButton) {
            return closeButton;
        }

        const focusable = this.getModalFocusableElements(modal);
        return focusable[0] || null;
    }

    pushModalFocus() {
        this._modalFocusStack.push(document.activeElement);
    }

    popModalFocus() {
        const previous = this._modalFocusStack.pop();
        if (previous && document.contains(previous) && typeof previous.focus === 'function') {
            previous.focus();
        }
    }

    focusModalEntry(modal) {
        const target = this.getModalInitialFocusElement(modal);
        if (target) {
            target.focus();
            return;
        }

        if (!modal.hasAttribute('tabindex')) {
            modal.setAttribute('tabindex', '-1');
        }
        modal.focus();
    }

    trapModalFocus(e) {
        const modal = this.getActiveModal();
        if (!modal) {
            return false;
        }

        const focusable = this.getModalFocusableElements(modal);
        if (focusable.length === 0) {
            e.preventDefault();
            this.focusModalEntry(modal);
            return true;
        }

        if (focusable.length === 1) {
            e.preventDefault();
            focusable[0].focus();
            return true;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement;

        if (e.shiftKey) {
            if (active === first || !modal.contains(active)) {
                e.preventDefault();
                last.focus();
                return true;
            }
        } else if (active === last || !modal.contains(active)) {
            e.preventDefault();
            first.focus();
            return true;
        }

        return false;
    }

    openModal(modal) {
        if (!modal) return;
        const wasActive = modal.classList.contains('active');
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        if (!wasActive) {
            this.pushModalFocus();
            requestAnimationFrame(() => this.focusModalEntry(modal));
        }
    }

    closeModal(modal) {
        if (!modal) return;
        const wasActive = modal.classList.contains('active');
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        if (wasActive) {
            this.popModalFocus();
        }
    }

    closeWelcomeModal() {
        const welcomeModal = document.getElementById('welcome-modal');
        if (!welcomeModal?.classList.contains('active')) return;
        this.clearWelcomeLoadingInterval();
        this.closeModal(welcomeModal);
        localStorage.setItem('citrana_welcome_seen', 'true');
    }

    /**
     * Returns the topmost open modal overlay, or null.
     * Export progress is included but is not dismissible with Escape.
     */
    getActiveModal() {
        const exportModal = document.getElementById('export-progress-modal');
        if (exportModal?.style.display === 'block') {
            return exportModal;
        }

        const modalIds = [
            'confirmation-modal',
            'welcome-modal',
            'help-modal',
            'options-modal',
            'items-modal',
            'about-modal'
        ];

        for (const id of modalIds) {
            const el = document.getElementById(id);
            if (el?.classList.contains('active')) {
                return el;
            }
        }

        return null;
    }

    /**
     * Close the active modal on Escape. Returns true when a modal was dismissed.
     */
    dismissActiveModalOnEscape() {
        const modal = this.getActiveModal();
        if (!modal || modal.id === 'export-progress-modal') {
            return false;
        }

        if (modal.id === 'welcome-modal') {
            this.closeWelcomeModal();
        } else {
            this.closeModal(modal);
        }

        return true;
    }

    /**
     * True when a modal overlay is open — canvas shortcuts should not run.
     */
    isModalBlockingShortcuts() {
        const activeModalIds = [
            'help-modal',
            'options-modal',
            'items-modal',
            'about-modal',
            'welcome-modal',
            'confirmation-modal'
        ];

        for (const id of activeModalIds) {
            const el = document.getElementById(id);
            if (el?.classList.contains('active')) {
                return true;
            }
        }

        const exportModal = document.getElementById('export-progress-modal');
        return exportModal?.style.display === 'block';
    }

    togglePresentationView() {
        this.presentationView = !this.presentationView;
        document.body.classList.toggle('presentation-view', this.presentationView);
        if (this.presentationView) {
            this.drawingTools?.editUI?.hide();
            this.drawingTools?.clearSelection?.();
            if (this.drawingTools?.isEditingPlanet) {
                this.drawingTools.dismissPlanetEditing();
            }
        }
        citranaDebug('Presentation view:', this.presentationView);
    }

    handleResize() {
        const container = document.getElementById('canvas-container');
        if (!container || !this.stage) return;

        const width = window.visualViewport?.width ?? container.offsetWidth;
        const height = window.visualViewport?.height ?? container.offsetHeight;
        this.stage.width(width);
        this.stage.height(height);
        this.stage.batchDraw();
        CitranaLaser?.resize?.();
        this.updateToolbarScrollButtons?.();
    }

    updateZoomLevel() {
        if (!this.stage) return;

        const zoomLevel = document.getElementById('zoom-level');
        if (!zoomLevel) return;

        const zoomPercent = Math.round(this.stage.scaleX() * 100);
        zoomLevel.textContent = `${zoomPercent}%`;
        this.zoomLevel = this.stage.scaleX();
    }

    zoomIn() {
        if (this.zoomLocked) return;
        this.chartTemplates?.zoomIn();
    }

    zoomOut() {
        if (this.zoomLocked) return;
        this.chartTemplates?.zoomOut();
    }

    zoomToFit() {
        this.chartTemplates?.zoomToFit();
    }

    toggleZoomLock() {
        this.zoomLocked = !this.zoomLocked;
        this.updateZoomLockUI();
    }

    /**
     * Toggle South Indian Lagna line and bhava/rashi number boxes (saved in localStorage).
     * @param {boolean} hide - When true, indicators are hidden
     */
    setSouthHideIndicators(hide) {
        this.options.southHideIndicators = hide;
        if (hide) {
            localStorage.setItem('citrana_south_hide_indicators', '1');
        } else {
            localStorage.removeItem('citrana_south_hide_indicators');
        }
        if (this.chartTemplates?.currentChartType === 'south-indian') {
            this.chartTemplates.southIndianTemplate.applySouthIndicatorsPreference();
        }
    }

    /**
     * Toggle North Indian bhava/rashi number boxes in tiny black corners (saved in localStorage).
     * @param {boolean} hide - When true, indicators are hidden
     */
    setNorthHideIndicators(hide) {
        this.options.northHideIndicators = hide;
        if (hide) {
            localStorage.setItem('citrana_north_hide_indicators', '1');
        } else {
            localStorage.removeItem('citrana_north_hide_indicators');
        }
        if (this.chartTemplates?.currentChartType === 'north-indian') {
            this.chartTemplates.northIndianTemplate.applyNorthIndicatorsPreference();
        }
    }

    /**
     * When enabled, Save exports the chart bounds only (fits chart, ignores zoom/pan, no watermark).
     * @param {boolean} enabled
     */
    setSaveChartOnly(enabled) {
        this.options.saveChartOnly = enabled;
        if (enabled) {
            localStorage.setItem('citrana_save_chart_only', '1');
        } else {
            localStorage.removeItem('citrana_save_chart_only');
        }
        this.applySaveChartOnlyTransparency();
    }

    syncOptionsUI() {
        const northHideIndicatorsToggle = document.getElementById('north-hide-indicators-toggle');
        const southHideIndicatorsToggle = document.getElementById('south-hide-indicators-toggle');
        const saveChartOnlyToggle = document.getElementById('save-chart-only-toggle');

        if (northHideIndicatorsToggle) {
            northHideIndicatorsToggle.checked = this.options.northHideIndicators;
        }
        if (southHideIndicatorsToggle) {
            southHideIndicatorsToggle.checked = this.options.southHideIndicators;
        }
        if (saveChartOnlyToggle) {
            saveChartOnlyToggle.checked = this.options.saveChartOnly;
        }
    }

    applySaveChartOnlyTransparency() {
        if (this.options.saveChartOnly) {
            this.exportWithWhiteBg = false;
        }
        this.updateTransparencyToggleUI();
    }

    updateTransparencyToggleUI() {
        const toggleBtn = document.getElementById('toggle-transparency-btn');
        if (!toggleBtn) {
            return;
        }

        const transparent = !this.exportWithWhiteBg;
        toggleBtn.classList.toggle('active', transparent);
        const locked = this.options.saveChartOnly === true;
        toggleBtn.disabled = locked;
        toggleBtn.title = locked
            ? 'Transparency is on while Save Chart Only is enabled'
            : 'Toggle Transparency';
    }

    updateZoomLockUI() {
        const lockBtn = document.getElementById('zoom-lock');
        const zoomInBtn = document.getElementById('zoom-in');
        const zoomOutBtn = document.getElementById('zoom-out');
        if (!lockBtn) return;

        const locked = this.zoomLocked;
        const iconName = locked ? 'lock' : 'lock-open';

        lockBtn.innerHTML = `<i data-lucide="${iconName}"></i>`;
        lockBtn.title = locked ? 'Unlock zoom' : 'Lock zoom';
        lockBtn.setAttribute('aria-label', lockBtn.title);
        lockBtn.setAttribute('aria-pressed', locked ? 'true' : 'false');

        if (zoomInBtn) zoomInBtn.disabled = locked;
        if (zoomOutBtn) zoomOutBtn.disabled = locked;

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    clearChart() {
        this.layer.destroyChildren();
        this.stage.batchDraw();
        this.chartTemplates.clearChart();
        localStorage.removeItem('citranaChartData');
        window.selectedBhavaSouth = null;
        window.selectedBhavaNorth = null;
        this.recordHistory('Clear canvas');
        citranaDebug('Chart cleared');
    }

    resetChart() {
        // Clear all Grahas from the chart
        this.chartTemplates.clearAllPlanets();
        // Clear all annotations/drawings
        this.drawingTools.clearAll();
        // Clear bhava selection used as drop fallback
        window.selectedBhavaSouth = null;
        window.selectedBhavaNorth = null;
        this.recordHistory('Reset chart');
        this.layer.batchDraw();
        citranaDebug('Chart reset: all Grahas and annotations cleared');
    }

    resetDrawings() {
        // Clear only the drawings (arrows, lines, pen strokes, text, headings)
        this.drawingTools.clearAll();

        // Hide edit UI if it's showing
        this.drawingTools.editUI?.hide();

        this.recordHistory('Reset drawings');
        this.layer.batchDraw();
        citranaDebug('Drawings reset: all drawing elements cleared while keeping chart structure and Grahas');
    }

    // --- HISTORY (undo / redo) ---
    recordHistory(label = 'Edit') {
        this.history?.record(label);
        this.updateHistoryButtons();
    }

    captureHistoryState() {
        return {
            chartData: this.chartTemplates.getChartData(),
            drawingData: this.serializeDrawings()
        };
    }

    restoreHistoryState(state) {
        if (!state) return;

        const savedViewport = {
            scaleX: this.stage.scaleX(),
            scaleY: this.stage.scaleY(),
            x: this.stage.x(),
            y: this.stage.y()
        };

        this.drawingTools?.editUI?.hide();
        this.drawingTools?.clearSelection?.();
        document.querySelector('.konva-textarea')?.remove();

        this.chartTemplates.loadChartData(state.chartData);
        this.restoreDrawings(state.drawingData);

        this.drawingTools?.updateDrawingObjectsDraggable(this.currentTool === 'select');
        this.drawingTools?.syncBoundingBoxListening?.();

        // loadChartData → clearChart() resets stage to 1× at origin; restore user's zoom/pan
        this.stage.scale({ x: savedViewport.scaleX, y: savedViewport.scaleY });
        this.stage.position({ x: savedViewport.x, y: savedViewport.y });
        this.updateZoomLevel();

        window.selectedBhavaSouth = null;
        window.selectedBhavaNorth = null;
        this.layer.batchDraw();
    }

    serializeDrawings() {
        return this.layer.find((node) => {
            const name = node.name();
            return name && name.startsWith('drawing-');
        }).map((node) => {
            const obj = node.toObject();
            const className = node.getClassName?.();

            if (className === 'Arrow' || className === 'Line') {
                obj.attrs = {
                    ...obj.attrs,
                    points: node.points().slice(),
                    x: node.x(),
                    y: node.y()
                };
                if (node.name()?.includes('drawing-arrow')) {
                    obj.attrs.arrowAnchors = node.getAttr('arrowAnchors');
                    obj.attrs.arrowStrokeWidth = node.getAttr('arrowStrokeWidth');
                    obj.attrs.arrowPointerLength = node.getAttr('arrowPointerLength');
                    obj.attrs.arrowPointerWidth = node.getAttr('arrowPointerWidth');
                }
            } else if (className === 'Text') {
                obj.attrs = {
                    ...obj.attrs,
                    x: node.x(),
                    y: node.y(),
                    text: node.text()
                };
            } else if (className === 'Shape' && node.getAttr('penTaper')) {
                obj.attrs = {
                    ...obj.attrs,
                    penTaper: true,
                    penTaperPoints: node.getAttr('penTaperPoints')?.slice(),
                    penTaperWidths: node.getAttr('penTaperWidths')?.slice(),
                    penStrokeColor: node.getAttr('penStrokeColor'),
                    penBaseWidth: node.getAttr('penBaseWidth'),
                    x: node.x(),
                    y: node.y()
                };
            }

            return obj;
        });
    }

    restoreDrawings(drawingData) {
        this.drawingTools.restorePersistedDrawings(drawingData);
    }

    // --- SESSION (.citrana.json) ---
    hasSessionContent() {
        return !!(this.chartTemplates?.hasActiveChart()
            || (this.serializeDrawings()?.length > 0));
    }

    saveSession() {
        if (typeof CitranaSession === 'undefined') {
            window.alert('Session save is unavailable.');
            return;
        }

        try {
            const session = CitranaSession.capture(this);
            CitranaSession.download(session);
        } catch (error) {
            console.error('Error saving session:', error);
            window.alert(error.message || 'Could not save session.');
        }
    }

    openSessionFromFile(file) {
        if (typeof CitranaSession === 'undefined') {
            window.alert('Session open is unavailable.');
            return;
        }

        CitranaSession.readFile(file)
            .then((session) => {
                const apply = () => {
                    try {
                        this.restoreSessionState(session);
                        citranaDebug('Session imported successfully');
                    } catch (error) {
                        console.error('Error importing session:', error);
                        window.alert(error.message || 'Could not open session.');
                    }
                };

                if (this.hasSessionContent()) {
                    this.showConfirmationDialog(
                        'Opening a session will replace your current chart and annotations. Do you want to continue?',
                        apply
                    );
                } else {
                    apply();
                }
            })
            .catch((error) => {
                console.error('Error reading session:', error);
                window.alert(error.message || 'Could not open session.');
            });
    }

    restoreSessionState(session) {
        if (!session) return;

        this.drawingTools?.editUI?.hide();
        this.drawingTools?.clearSelection?.();

        this.chartTemplates.loadChartData(session.chartData);
        this.restoreDrawings(session.drawingData || []);
        CitranaSession.applyOptions(this, session.options);

        if (this.chartTemplates?.hasActiveChart()) {
            this.chartTemplates.zoomToFit();
        } else {
            this.stage.scale({ x: 1, y: 1 });
            this.stage.position({ x: 0, y: 0 });
            this.updateZoomLevel();
        }

        window.selectedBhavaSouth = null;
        window.selectedBhavaNorth = null;
        this.layer.batchDraw();

        const baseline = this.captureHistoryState();
        this.history?.resetToState(baseline, 'Imported session');
        this.updateHistoryButtons();
    }

    undo() {
        this.history?.undo();
        this.updateHistoryButtons();
    }

    redo() {
        this.history?.redo();
        this.updateHistoryButtons();
    }

    updateHistoryButtons() {
        const undoBtn = document.getElementById('undo-btn');
        const redoBtn = document.getElementById('redo-btn');
        if (!undoBtn || !redoBtn) return;

        undoBtn.disabled = !this.history?.canUndo();
        redoBtn.disabled = !this.history?.canRedo();
    }

    /**
     * Show welcome modal on first visit
     */
    clearWelcomeLoadingInterval() {
        if (this.welcomeLoadingInterval != null) {
            clearInterval(this.welcomeLoadingInterval);
            this.welcomeLoadingInterval = null;
        }
    }

    showWelcomeModal() {
        const welcomeModal = document.getElementById('welcome-modal');
        const welcomeLoadingFill = document.querySelector('.welcome-loading-fill');
        const welcomeLoadingText = document.querySelector('.welcome-loading-text');

        if (!welcomeModal || !welcomeLoadingFill || !welcomeLoadingText) return;

        // Check if user has seen the welcome modal before
        const hasSeenWelcome = localStorage.getItem('citrana_welcome_seen');

        if (hasSeenWelcome) {
            // User has seen it before, don't show
            return;
        }

        // Show the modal
        this.openModal(welcomeModal);

        this.clearWelcomeLoadingInterval();

        // Simulate loading progress
        let progress = 0;
        this.welcomeLoadingInterval = setInterval(() => {
            progress += Math.random() * 15; // Random progress increments
            if (progress > 100) progress = 100;

            welcomeLoadingFill.style.width = progress + '%';

            if (progress < 30) {
                welcomeLoadingText.textContent = 'Loading Citrana...';
            } else if (progress < 60) {
                welcomeLoadingText.textContent = 'Initialising components...';
            } else if (progress < 90) {
                welcomeLoadingText.textContent = 'Setting up chart templates...';
            } else {
                welcomeLoadingText.textContent = 'Ready!';
            }

            if (progress >= 100) {
                this.clearWelcomeLoadingInterval();
                // Don't auto-close - let user close manually
                // Mark as seen when user closes the modal
            }
        }, 100);
    }
}

// App initialization is handled in index.html
// This prevents duplicate initialization 