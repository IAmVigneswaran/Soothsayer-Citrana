/**
 * Main Application Class - Konva.js Implementation
 * Coordinates all components and manages the application lifecycle
 * Citrana Web Application
 */
class CitranaApp {
    constructor() {
        this.stage = null;
        this.layer = null;
        this.chartTemplates = null;
        this.planetSystem = null;
        this.drawingTools = null;
        this.contextMenu = null;
        this.currentTool = 'select';
        this.isDrawing = false;
        this.lastPoint = null;
        this.undoStack = [];
        this.redoStack = [];
        this.maxUndoSteps = 100;
        this.exportWithWhiteBg = true; // Default: white background
        this.isExporting = false; // Prevent multiple concurrent exports
        this.init();
    }

    init() {
        console.log('Initializing Citrana App...');

        this.setupCanvas();
        this.setupComponents();
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.loadSavedData();

        console.log('App initialization complete');
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
            // Prevent stage dragging when dragging planets
            if (e.target && e.target.name() && e.target.name().startsWith('planet-')) {
                e.evt.preventDefault();
            }
        });

        this.layer = new Konva.Layer();
        this.stage.add(this.layer);

        console.log('Canvas setup complete');
    }

    setupComponents() {
        this.chartTemplates = new ChartCoordinator(this.stage, this.layer);
        this.planetSystem = new PlanetSystem(this.stage, this.layer, this.chartTemplates);
        this.drawingTools = new DrawingTools(this.stage, this.layer);
        this.contextMenu = new ContextMenu();

        // Initialize components
        this.planetSystem.init();
        this.contextMenu.init();

        console.log('Components setup complete');
    }

    setupEventListeners() {
        // Tool selection
        document.getElementById('select-tool').addEventListener('click', () => {
            this.setTool('select');
            this.pushSnapshot();
        });
        document.getElementById('arrow-tool').addEventListener('click', () => {
            this.setTool('arrow');
            this.pushSnapshot();
        });
        document.getElementById('line-tool').addEventListener('click', () => {
            this.setTool('line');
            this.pushSnapshot();
        });
        document.getElementById('pen-tool').addEventListener('click', () => {
            this.setTool('pen');
            this.pushSnapshot();
        });
        document.getElementById('text-tool').addEventListener('click', () => {
            this.setTool('text');
            this.pushSnapshot();
        });
        document.getElementById('hand-tool').addEventListener('click', () => {
            this.setTool('hand');
            this.pushSnapshot();
        });
        document.getElementById('heading-tool').addEventListener('click', () => {
            this.setTool('heading');
            this.pushSnapshot();
        });
        // Add for zoom controls bar
        document.getElementById('zoom-hand-tool').addEventListener('click', () => {
            this.setTool('hand');
            this.pushSnapshot();
        });

        // Action buttons
        document.getElementById('undo-btn').addEventListener('click', () => this.undo());
        document.getElementById('redo-btn').addEventListener('click', () => this.redo());
        document.getElementById('export-btn').addEventListener('click', () => this.exportChart());

        // Toggle Transparency Button
        const toggleBtn = document.getElementById('toggle-transparency-btn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.exportWithWhiteBg = !this.exportWithWhiteBg;
                toggleBtn.classList.toggle('active', !this.exportWithWhiteBg);
            });
        }

        // Help Button
        const helpBtn = document.getElementById('help-btn');
        const helpModal = document.getElementById('help-modal');
        const helpModalClose = document.getElementById('help-modal-close');

        if (helpBtn && helpModal && helpModalClose) {
            helpBtn.addEventListener('click', () => {
                helpModal.classList.add('active');
            });

            helpModalClose.addEventListener('click', () => {
                helpModal.classList.remove('active');
            });

            // Close modal when clicking outside
            helpModal.addEventListener('click', (e) => {
                if (e.target === helpModal) {
                    helpModal.classList.remove('active');
                }
            });
        }

        // Zoom controls
        document.getElementById('zoom-in').addEventListener('click', () => this.chartTemplates.zoomIn());
        document.getElementById('zoom-out').addEventListener('click', () => this.chartTemplates.zoomOut());
        document.getElementById('reset-zoom').addEventListener('click', () => this.chartTemplates.zoomToFit());

        // Canvas events
        this.stage.on('mousedown', (e) => {
            // If click is on empty space (not a chart house or planet), clear highlight
            if (!e.target || (e.target && !e.target.name().startsWith('house-') && !e.target.name().startsWith('planet-') && !e.target.name().startsWith('planet-hit-'))) {
                if (this.chartTemplates.currentChartType === 'south-indian') {
                    this.chartTemplates.southIndianTemplate.clearHighlight();
                } else if (this.chartTemplates.currentChartType === 'north-indian') {
                    this.chartTemplates.northIndianTemplate.clearHighlight();
                }
            }

            // Hide Edit UI if clicking outside of it
            if (this.drawingTools.editUI && this.drawingTools.editUI.isEditUIVisible()) {
                this.drawingTools.editUI.hide();
            }

            // Cancel planet editing if clicking outside of editing areas
            if (this.drawingTools.isEditingPlanet) {
                this.drawingTools.cancelPlanetEditing();
            }

            this.handleMouseDown(e);
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
            if (!e.target || (
                    e.target &&
                    !e.target.name().startsWith('house-') &&
                    !e.target.name().startsWith('planet-') &&
                    !e.target.name().startsWith('planet-hit-')
                )) {
                if (this.chartTemplates.currentChartType === 'south-indian') {
                    this.chartTemplates.southIndianTemplate.clearHighlight();
                } else if (this.chartTemplates.currentChartType === 'north-indian') {
                    this.chartTemplates.northIndianTemplate.clearHighlight();
                }
            }
        });

        // Safari-specific fix for toolbar visibility
        this.setupSafariToolbarFix();

        // Prevent zooming on input focus in mobile browsers
        this.setupMobileInputZoomPrevention();

        // Window resize
        window.addEventListener('resize', () => this.handleResize());

        // Confirmation Dialog
        this.setupConfirmationDialog();
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
            setTimeout(() => {
                // Fix top toolbar - always visible
                if (toolbar) {
                    toolbar.style.visibility = 'visible';
                    toolbar.style.opacity = '1';
                    // Don't force display - let existing CSS control it
                    console.log('[SAFARI] Top toolbar visibility restored');
                }

                // Fix floating edit UI - only if it should be visible
                if (editUI && editUI.style.display !== 'none') {
                    editUI.style.visibility = 'visible';
                    editUI.style.opacity = '1';
                    // Don't force display - let JavaScript control it
                    console.log('[SAFARI] Floating Edit UI visibility restored');
                }

                // Fix floating text edit controls - only if it should be visible
                if (textEditControls && textEditControls.style.display !== 'none') {
                    textEditControls.style.visibility = 'visible';
                    textEditControls.style.opacity = '1';
                    // Don't force display - let JavaScript control it
                    console.log('[SAFARI] Text Edit Controls visibility restored');

                    // Fix individual planet text edit input elements
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

                    console.log('[SAFARI] Planet text edit input elements restored');
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

        // Periodic check to ensure UI elements are visible
        setInterval(() => {
            // Check top toolbar - always should be visible
            if (toolbar && (toolbar.style.visibility === 'hidden' || toolbar.style.display === 'none')) {
                fixUIElementsVisibility();
            }

            // Check floating edit UI - only if it should be visible
            if (editUI && editUI.style.display !== 'none' && (editUI.style.visibility === 'hidden' || editUI.style.opacity === '0')) {
                fixUIElementsVisibility();
            }

            // Check floating text edit controls - only if it should be visible
            if (textEditControls && textEditControls.style.display !== 'none' && (textEditControls.style.visibility === 'hidden' || textEditControls.style.opacity === '0')) {
                fixUIElementsVisibility();
            }
        }, 2000);
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

            // Check if it's an input field
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
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

                console.log('[MOBILE] Prevented zoom on input focus');
            }
        };

        // Listen for focus events on input fields
        document.addEventListener('focusin', preventZoomOnFocus);

        // Also prevent zoom on touch events for inputs
        const preventZoomOnTouch = (e) => {
            const target = e.target;

            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                // Prevent default zoom behavior
                e.preventDefault();

                // Force focus without zoom
                target.focus();

                console.log('[MOBILE] Prevented zoom on input touch');
            }
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
                confirmationModal.classList.remove('active');
            });

            // No button - close modal
            confirmationNo.addEventListener('click', () => {
                confirmationModal.classList.remove('active');
            });

            // Yes button - execute the callback
            confirmationYes.addEventListener('click', () => {
                if (this.pendingConfirmationCallback) {
                    this.pendingConfirmationCallback();
                    this.pendingConfirmationCallback = null;
                }
                confirmationModal.classList.remove('active');
            });

            // Close when clicking outside
            confirmationModal.addEventListener('click', (e) => {
                if (e.target === confirmationModal) {
                    confirmationModal.classList.remove('active');
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
            confirmationModal.classList.add('active');
        }
    }

    loadSavedData() {
        // Load saved chart data if available
        const savedData = localStorage.getItem('citranaChartData');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                this.chartTemplates.loadChartData(data);
                console.log('Saved chart data loaded');
            } catch (error) {
                console.error('Error loading saved data:', error);
            }
        }

        // Auto-save every 30 seconds
        setInterval(() => this.autoSave(), 30000);
    }

    autoSave() {
        try {
            const chartData = this.chartTemplates.getChartData();
            localStorage.setItem('citranaChartData', JSON.stringify(chartData));
            console.log('Chart data auto-saved');
        } catch (error) {
            console.error('Error auto-saving:', error);
        }
    }

    exportChart() {
        // Prevent multiple concurrent exports
        if (this.isExporting) {
            console.log('Export already in progress, ignoring duplicate request');
            return;
        }

        console.log('=== Starting export process ===');
        this.isExporting = true;
        this.showExportProgress();

        // Use requestAnimationFrame to ensure the canvas is fully rendered
        const performExport = () => {
            try {
                // Step 1: Prepare chart and generate PNG (50%)
                this.updateExportProgress(50, 'Generating high-resolution image...');

                const width = this.stage.width();
                const height = this.stage.height();

                let bgRect = null;
                if (this.exportWithWhiteBg) {
                    bgRect = new Konva.Rect({
                        x: 0,
                        y: 0,
                        width: width,
                        height: height,
                        fill: 'white',
                        listening: false,
                        name: 'export-bg-rect'
                    });
                    this.layer.add(bgRect);
                    bgRect.moveToBottom();
                    this.layer.batchDraw();
                }

                // Force a complete render cycle
                this.stage.batchDraw();

                // Take the screenshot immediately (optimized)
                const dataURL = this.stage.toDataURL({
                    pixelRatio: 2,
                    mimeType: 'image/png'
                });

                // Step 3: Clean up background rectangle
                if (bgRect) {
                    bgRect.destroy();
                    this.layer.batchDraw();
                }

                // Step 2: Process image with padding and watermark (80%)
                this.updateExportProgress(80, 'Adding padding and watermark...');

                // Optimized processing: Get dimensions directly from dataURL
                console.log('Processing dataURL directly...');
                try {
                    // Step 3: Create final image (90%)
                    this.updateExportProgress(90, 'Creating final image...');

                    // Get dimensions from the original dataURL without loading image
                    const img = new window.Image();
                    img.onload = () => {
                        const width = img.width;
                        const height = img.height;

                        // Create the padded canvas directly
                        const paddedWidth = width + 200;
                        const paddedHeight = height + 200;
                        const offscreen = document.createElement('canvas');
                        offscreen.width = paddedWidth;
                        offscreen.height = paddedHeight;
                        const ctx = offscreen.getContext('2d');

                        // Fill background
                        if (this.exportWithWhiteBg) {
                            ctx.fillStyle = 'white';
                            ctx.fillRect(0, 0, paddedWidth, paddedHeight);
                        } else {
                            ctx.clearRect(0, 0, paddedWidth, paddedHeight);
                        }

                        // Draw the chart
                        ctx.drawImage(img, 100, 100);

                        // Add watermark
                        ctx.font = '24px sans-serif';
                        ctx.fillStyle = '#888';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'bottom';
                        const watermark = 'Generated by Citrana - https://citrana.soothsayer.life/';
                        ctx.fillText(watermark, paddedWidth / 2, paddedHeight - 30);

                        // Step 4: Download file (95%)
                        this.updateExportProgress(95, 'Preparing download...');

                        const paddedDataURL = offscreen.toDataURL('image/png');
                        const now = new Date();
                        const year = now.getFullYear();
                        const month = String(now.getMonth() + 1).padStart(2, '0');
                        const day = String(now.getDate()).padStart(2, '0');
                        const hours = String(now.getHours()).padStart(2, '0');
                        const minutes = String(now.getMinutes()).padStart(2, '0');
                        const seconds = String(now.getSeconds()).padStart(2, '0');
                        const timestamp = `${year}-${month}-${day}-${hours}${minutes}${seconds}`;
                        const filename = `citrana-chart-${timestamp}.png`;

                        // Use a more reliable download method
                        console.log('Calling downloadFile with filename:', filename);
                        this.downloadFile(paddedDataURL, filename);

                        // Step 7: Complete (100%)
                        this.updateExportProgress(100, 'Export completed successfully!');

                        // Reduced delay for completion
                        setTimeout(() => {
                            this.hideExportProgress();
                            this.isExporting = false;
                            this._lastDownloadedFile = null; // Reset download tracking
                            console.log(`Chart exported successfully as: ${filename}`);
                        }, 300); // Reduced from 1000ms to 300ms
                    };

                    img.onerror = () => {
                        console.error('Error loading image for dimensions');
                        this.updateExportProgress(0, 'Export failed. Please try again.');
                        setTimeout(() => {
                            this.hideExportProgress();
                            this.isExporting = false;
                            this._lastDownloadedFile = null;
                        }, 1000); // Reduced from 2000ms to 1000ms
                    };

                    // Load the image to get dimensions
                    img.src = dataURL;

                } catch (error) {
                    console.error('Error processing export:', error);
                    this.updateExportProgress(0, 'Export failed. Please try again.');
                    setTimeout(() => {
                        this.hideExportProgress();
                        this.isExporting = false;
                        this._lastDownloadedFile = null; // Reset download tracking
                    }, 1000); // Reduced from 2000ms to 1000ms
                }

            } catch (error) {
                console.error('Error exporting chart:', error);
                this.updateExportProgress(0, 'Export failed. Please try again.');
                setTimeout(() => {
                    this.hideExportProgress();
                    this.isExporting = false;
                    this._lastDownloadedFile = null; // Reset download tracking
                }, 2000);
            }
        };

        // Start the export process on the next frame
        requestAnimationFrame(performExport);
    }

    showExportProgress() {
        const modal = document.getElementById('export-progress-modal');
        const progressFill = document.getElementById('export-progress-fill');
        const progressText = document.getElementById('export-progress-text');

        if (modal && progressFill && progressText) {
            progressFill.style.width = '0%';
            progressText.textContent = 'Preparing chart for export...';
            modal.style.display = 'block';
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
            modal.style.display = 'none';
        }
    }

    downloadFile(dataURL, filename) {
        // Chrome-specific fix: Use a more robust download method
        console.log('Starting download for:', filename);

        // Prevent multiple downloads of the same file
        if (this._lastDownloadedFile === filename) {
            console.log('File already downloaded, skipping duplicate:', filename);
            return;
        }
        this._lastDownloadedFile = filename;

        // Detect Chrome/Brave
        const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
        const isBrave = navigator.brave && navigator.brave.isBrave();

        if (isChrome || isBrave) {
            // Chrome/Brave specific method: Use blob with proper cleanup
            console.log('Using Chrome/Brave specific download method');

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
                    console.log('Standard click triggered for Chrome/Brave');
                } catch (clickError) {
                    console.error('Standard click failed, trying alternative:', clickError);

                    // Alternative: Create a mouse event
                    const clickEvent = new MouseEvent('click', {
                        view: window,
                        bubbles: true,
                        cancelable: true
                    });
                    link.dispatchEvent(clickEvent);
                    console.log('Mouse event triggered for Chrome/Brave');
                }

                // Cleanup after a shorter delay for Chrome/Brave
                setTimeout(() => {
                    const linkElement = document.getElementById(linkId);
                    if (linkElement) {
                        document.body.removeChild(linkElement);
                    }
                    window.URL.revokeObjectURL(url);
                    console.log('Chrome/Brave download completed for:', filename);
                }, 200); // Reduced from 500ms to 200ms
            };

            // Use a shorter delay for Chrome/Brave to ensure DOM is ready
            setTimeout(triggerDownload, 10); // Reduced from 50ms to 10ms

        } else {
            // Standard method for other browsers
            console.log('Using standard download method');

            try {
                const link = document.createElement('a');
                link.download = filename;
                link.href = dataURL;
                link.style.display = 'none';

                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                console.log('Standard download completed for:', filename);

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
                        console.log('Blob download completed for:', filename);
                    });
                } catch (blobError) {
                    console.error('All download methods failed:', blobError);

                    // Last resort: Open in new window
                    const newWindow = window.open(dataURL, '_blank');
                    if (newWindow) {
                        console.log('Opened image in new window as last resort');
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

            // Tool shortcuts
            if (e.key === 'v' || e.key === 'V') {
                e.preventDefault();
                this.setTool('select');
                this.pushSnapshot();
            } else if (e.key === 'a' || e.key === 'A') {
                e.preventDefault();
                this.setTool('arrow');
                this.pushSnapshot();
            } else if (e.key === 'l' || e.key === 'L') {
                e.preventDefault();
                this.setTool('line');
                this.pushSnapshot();
            } else if (e.key === 'p' || e.key === 'P') {
                e.preventDefault();
                this.setTool('pen');
                this.pushSnapshot();
            } else if (e.key === 't' || e.key === 'T') {
                e.preventDefault();
                this.setTool('text');
                this.pushSnapshot();
            } else if (e.key === 'h' || e.key === 'H') {
                e.preventDefault();
                this.setTool('hand');
                this.pushSnapshot();
            }

            // Action shortcuts
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'z') {
                    e.preventDefault();
                    this.undo();
                } else if (e.key === 'y') {
                    e.preventDefault();
                    this.redo();
                }
            }

            // Zoom shortcuts
            if (e.key === '+' || e.key === '=') {
                e.preventDefault();
                this.zoomIn();
            } else if (e.key === '-') {
                e.preventDefault();
                this.zoomOut();
            } else if (e.key === '0') {
                e.preventDefault();
                this.chartTemplates.zoomToFit();
            }

            // Delete selected shape (only with Delete key, not Backspace)
            if (e.key === 'Delete') {
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
                    helpModal.classList.add('active');
                }
            }
        });
    }

    setTool(tool) {
        this.currentTool = tool;
        this.drawingTools.setTool(tool);

        // Update UI
        document.querySelectorAll('.toolbar-btn').forEach(btn => btn.classList.remove('active'));
        // Main toolbar
        const mainBtn = document.getElementById(`${tool}-tool`);
        if (mainBtn) mainBtn.classList.add('active');
        // Special case: sync hand tool in zoom controls
        if (tool === 'hand') {
            const zoomHandBtn = document.getElementById('zoom-hand-tool');
            if (zoomHandBtn) zoomHandBtn.classList.add('active');
        } else {
            // Always remove active from zoom-hand-tool if not hand
            const zoomHandBtn = document.getElementById('zoom-hand-tool');
            if (zoomHandBtn) zoomHandBtn.classList.remove('active');
        }

        // Update cursor and touch behavior
        const container = document.getElementById('canvas-container');
        if (tool === 'hand') {
            container.style.cursor = 'grab';
            // Don't enable draggable here - only enable it during touch/mouse down
        } else if (tool === 'select') {
            container.style.cursor = 'default';
            // Ensure stage is not draggable when switching to select tool
            this.stage.draggable(false);
        } else {
            container.style.cursor = 'crosshair';
            // Ensure stage is not draggable for drawing tools
            this.stage.draggable(false);
        }

        console.log(`Tool set to: ${tool}`);
    }

    handleMouseDown(e) {
        const pos = this.drawingTools.getPrecisePositionFromKonva(e);

        if (this.currentTool === 'hand') {
            // Safari-specific: Ensure stage is draggable for hand tool
            this.stage.draggable(true);
            document.getElementById('canvas-container').style.cursor = 'grabbing';
        } else if (this.currentTool === 'select') {
            this.drawingTools.handleSelectMouseDown(pos, e);
        } else if (pos) {
            this.isDrawing = true;
            this.lastPoint = pos;
            this.drawingTools.startDrawing(pos, this.currentTool);
        }
    }

    handleMouseMove(e) {
        const pos = this.drawingTools.getPrecisePositionFromKonva(e);

        if (this.currentTool === 'select') {
            this.drawingTools.handleSelectMouseMove(pos);
        } else if (this.isDrawing && pos) {
            this.drawingTools.draw(pos, this.currentTool);
            this.lastPoint = pos;
        }
    }

    handleMouseUp(e) {
        if (this.currentTool === 'hand') {
            // Safari-specific: Disable stage dragging when hand tool is released
            this.stage.draggable(false);
            document.getElementById('canvas-container').style.cursor = 'grab';
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
        // Prevent default to avoid browser gestures
        e.evt.preventDefault();

        if (this.currentTool === 'hand') {
            // Enable stage dragging for hand tool
            this.stage.draggable(true);
            document.getElementById('canvas-container').style.cursor = 'grabbing';
        } else if (this.currentTool === 'select') {
            const pos = this.drawingTools.getPrecisePositionFromKonva(e);
            this.drawingTools.handleSelectTouchDown(pos, e);
        } else {
            // For drawing tools, use the existing touch handling
            const pos = this.drawingTools.getPrecisePositionFromKonva(e);
            if (pos) {
                this.isDrawing = true;
                this.lastPoint = pos;
                this.drawingTools.startDrawing(pos, this.currentTool);
            }
        }
    }

    /**
     * Handle touch move events for mobile
     * @param {KonvaEvent} e - Konva touch event
     */
    handleTouchMove(e) {
        // Prevent default to avoid browser gestures
        e.evt.preventDefault();

        if (this.currentTool === 'select') {
            const pos = this.drawingTools.getPrecisePositionFromKonva(e);
            this.drawingTools.handleSelectMouseMove(pos);
        } else if (this.isDrawing) {
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
            document.getElementById('canvas-container').style.cursor = 'grab';
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
            // Don't prevent default on mobile to allow browser pinch-to-zoom
            return;
        }

        e.evt.preventDefault();

        const scaleBy = 1.1;
        const oldScale = this.stage.scaleX();

        const pointer = this.stage.getPointerPosition();
        const mousePointTo = {
            x: (pointer.x - this.stage.x()) / oldScale,
            y: (pointer.y - this.stage.y()) / oldScale
        };

        const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

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

        this.updateZoomLevel();
    }

    isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    handleResize() {
        const container = document.getElementById('canvas-container');
        this.stage.width(container.offsetWidth);
        this.stage.height(container.offsetHeight);
        this.stage.batchDraw();
    }

    updateZoomLevel() {
        const zoomPercent = Math.round(this.stage.scaleX() * 100);
        document.getElementById('zoom-level').textContent = `${zoomPercent}%`;
        this.zoomLevel = this.stage.scaleX();
    }

    clearChart() {
        this.layer.destroyChildren();
        this.stage.batchDraw();
        this.chartTemplates.clearChart();
        console.log('Chart cleared');
    }

    resetChart() {
        // Clear all planets from the chart
        this.chartTemplates.clearAllPlanets();
        // Clear all annotations/drawings
        this.drawingTools.clearAll();
        // Optionally clear selection
        if (window.selectedBhavaSouth) window.selectedBhavaSouth = null;
        this.layer.batchDraw();
        console.log('Chart reset: all planets and annotations cleared');
    }

    // --- GLOBAL UNDO/REDO ---
    pushSnapshot() {
        const chartData = this.chartTemplates.getChartData();
        const drawingData = this.serializeDrawings();
        this.undoStack.push({
            chartData,
            drawingData
        });
        if (this.undoStack.length > this.maxUndoSteps) this.undoStack.shift();
        this.redoStack = [];
    }

    serializeDrawings() {
        // Only serialize drawing objects (name starts with 'drawing-')
        return this.layer.getChildren(node => node.name() && node.name().startsWith('drawing-')).map(node => node.toObject());
    }

    restoreDrawings(drawingData) {
        // Remove all current drawing objects
        this.drawingTools.clearAll();
        // Add from snapshot
        drawingData.forEach(obj => {
            const shape = Konva.Node.create(obj);
            this.layer.add(shape);
        });
        this.layer.batchDraw();
    }

    undo() {
        if (this.undoStack.length === 0) return;
        const current = {
            chartData: this.chartTemplates.getChartData(),
            drawingData: this.serializeDrawings()
        };
        this.redoStack.push(current);
        const snapshot = this.undoStack.pop();
        this.chartTemplates.loadChartData(snapshot.chartData);
        this.restoreDrawings(snapshot.drawingData);
    }

    redo() {
        if (this.redoStack.length > 0) {
            const drawingData = this.redoStack.pop();
            this.undoStack.push(this.serializeDrawings());
            this.restoreDrawings(drawingData);
            console.log('Redo performed');
        }
    }

    zoomIn() {
        const scaleBy = 1.2;
        const oldScale = this.stage.scaleX();
        const newScale = oldScale * scaleBy;

        if (newScale <= 5) { // Max zoom limit
            // Get the center of the stage
            const stageCenter = {
                x: this.stage.width() / 2,
                y: this.stage.height() / 2
            };

            const mousePointTo = {
                x: (stageCenter.x - this.stage.x()) / oldScale,
                y: (stageCenter.y - this.stage.y()) / oldScale
            };

            this.stage.scale({
                x: newScale,
                y: newScale
            });

            const newPos = {
                x: stageCenter.x - mousePointTo.x * newScale,
                y: stageCenter.y - mousePointTo.y * newScale
            };
            this.stage.position(newPos);
            this.stage.batchDraw();

            this.updateZoomLevel();
        }
    }

    zoomOut() {
        const scaleBy = 0.8;
        const oldScale = this.stage.scaleX();
        const newScale = oldScale * scaleBy;

        if (newScale >= 0.1) { // Min zoom limit
            // Get the center of the stage
            const stageCenter = {
                x: this.stage.width() / 2,
                y: this.stage.height() / 2
            };

            const mousePointTo = {
                x: (stageCenter.x - this.stage.x()) / oldScale,
                y: (stageCenter.y - this.stage.y()) / oldScale
            };

            this.stage.scale({
                x: newScale,
                y: newScale
            });

            const newPos = {
                x: stageCenter.x - mousePointTo.x * newScale,
                y: stageCenter.y - mousePointTo.y * newScale
            };
            this.stage.position(newPos);
            this.stage.batchDraw();

            this.updateZoomLevel();
        }
    }

    resetZoom() {
        this.stage.scale({
            x: 1,
            y: 1
        });
        this.stage.position({
            x: 0,
            y: 0
        });
        this.stage.batchDraw();
        this.updateZoomLevel();
    }
}

// App initialization is handled in index.html
// This prevents duplicate initialization 