/**
 * edit-ui.js
 * Citrana • https://github.com/IAmVigneswaran/Soothsayer-Citrana 
 * © 2026 Vigneswaran Rajkumar • Licensed under MIT License
 * Provides context-sensitive editing controls for different drawing tools and elements
 */
class EditUI {
    constructor() {
        this.currentElement = null;
        this.currentTool = null;
        this.isVisible = false;
        this.onDelete = null; // Callback for delete action
        this._sessionDirty = false;
        this._skipHistoryOnHide = false;

        // Initialize the Edit UI container
        this.initEditUIContainer();

        // Default properties for different tools
        this.defaultProperties = {
            pen: {
                strokeWidth: 4,
                strokeColor: '#FF0000'
            },
            line: {
                strokeWidth: 4,
                strokeColor: '#FF0000'
            },
            arrow: {
                strokeWidth: 4,
                strokeColor: '#FF0000'
            },
            text: {
                fontSize: 16,
                fontWeight: 400,
                fontStyle: 'normal',
                fill: '#000000'
            }
        };
    }

    /**
     * Initialize the Edit UI container in the DOM
     */
    initEditUIContainer() {
        // Create the main Edit UI container
        const editUIContainer = document.createElement('div');
        editUIContainer.id = 'edit-ui-container';
        editUIContainer.className = 'floating-edit-ui';
        editUIContainer.style.display = 'none';

        // Create the content area
        const contentArea = document.createElement('div');
        contentArea.id = 'edit-ui-content';
        contentArea.className = 'edit-ui-content';

        editUIContainer.appendChild(contentArea);

        // Add to the body
        document.body.appendChild(editUIContainer);
    }

    /**
     * Show Edit UI for a specific element and tool
     * @param {Object} element - The element to edit (Konva shape)
     * @param {string} tool - The tool type ('pen', 'line', 'arrow', 'text')
     */
    show(element, tool) {
        citranaDebug(`[EDIT UI] show() called with tool: ${tool}, element:`, element);

        this.currentElement = element;
        this.currentTool = tool;
        this.isVisible = true;
        this._sessionDirty = false;
        this._skipHistoryOnHide = false;

        // Note: Text properties will be handled safely in the click handlers

        // Clear previous content
        this.clearContent();

        // Create tool-specific controls
        this.createToolControls(tool);

        // Show the container
        const container = document.getElementById('edit-ui-container');
        if (container) {
            container.style.display = 'flex';
            citranaDebug(`[EDIT UI] Container displayed`);
        } else {
            console.error(`[EDIT UI] Container not found!`);
        }

        // Position the Edit UI
        this.positionEditUI();

        // Add touch outside to dismiss for mobile
        this.setupTouchOutsideToDismiss();
    }

    /**
     * Add touch support to a button for better mobile experience
     * @param {HTMLElement} button - The button element
     * @param {Function} handler - The click handler function
     */
    addTouchSupport(button, handler) {
        // Add click listener
        button.addEventListener('click', handler);

        // Add touch listener for mobile
        button.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
            handler();
        });
    }

    /**
     * Whether a text/heading annotation is visually bold (weight or Arial Black family).
     * @param {Konva.Text} element
     * @returns {boolean}
     */
    isAnnotationBold(element) {
        if (typeof CitranaAnnotationFonts !== 'undefined') {
            return CitranaAnnotationFonts.isBold(element);
        }

        if (!element) {
            return false;
        }

        const weight = element.fontWeight?.() ?? 'normal';
        const family = element.fontFamily?.() ?? '';
        const weightBold = weight === 'bold' || weight === 700 || weight === '700';
        const familyBold = /Arial Black/i.test(family);

        return weightBold || familyBold;
    }

    /**
     * Apply or remove bold styling on a text/heading annotation.
     * @param {Konva.Text} element
     * @param {boolean} bold
     */
    setAnnotationBold(element, bold) {
        if (typeof CitranaAnnotationFonts !== 'undefined') {
            CitranaAnnotationFonts.setBold(element, bold);
            return;
        }

        if (!element) {
            return;
        }

        if (bold) {
            element.fontFamily('Arial Black, Arial, sans-serif');
            element.fontWeight('bold');
        } else {
            element.fontFamily('Arial, sans-serif');
            element.fontWeight('normal');
        }
    }

    /**
     * Whether a text/heading annotation is italic.
     * @param {Konva.Text} element
     * @returns {boolean}
     */
    isAnnotationItalic(element) {
        if (typeof CitranaAnnotationFonts !== 'undefined') {
            return CitranaAnnotationFonts.isItalic(element);
        }

        if (!element) {
            return false;
        }

        const style = element.fontStyle?.() ?? 'normal';
        return style === 'italic' || style === 'oblique';
    }

    /**
     * Apply or remove italic styling on a text/heading annotation.
     * @param {Konva.Text} element
     * @param {boolean} italic
     */
    setAnnotationItalic(element, italic) {
        if (typeof CitranaAnnotationFonts !== 'undefined') {
            CitranaAnnotationFonts.setItalic(element, italic);
            return;
        }

        if (!element) {
            return;
        }

        element.fontStyle(italic ? 'italic' : 'normal');
    }

    /**
     * Current horizontal alignment for a text/heading annotation.
     * @param {Konva.Text} element
     * @returns {'left'|'center'|'right'}
     */
    getAnnotationAlign(element) {
        if (!element) {
            return 'left';
        }

        const align = element.align?.();
        if (align === 'left' || align === 'center' || align === 'right') {
            return align;
        }

        return 'left';
    }

    /**
     * Set horizontal alignment and sync Konva offset for text/heading annotations.
     * @param {Konva.Text} element
     * @param {'left'|'center'|'right'} align
     */
    setAnnotationAlign(element, align) {
        if (!element) {
            return;
        }

        element.align(align);

        if (align === 'center') {
            element.offsetX(element.width() / 2);
        } else if (align === 'right') {
            element.offsetX(element.width());
        } else {
            element.offsetX(0);
        }
    }

    /**
     * @param {'left'|'center'|'right'} activeAlign
     * @param {HTMLButtonElement} alignLeftBtn
     * @param {HTMLButtonElement} alignCenterBtn
     * @param {HTMLButtonElement} alignRightBtn
     */
    updateAlignButtonStates(activeAlign, alignLeftBtn, alignCenterBtn, alignRightBtn) {
        alignLeftBtn.classList.toggle('active', activeAlign === 'left');
        alignCenterBtn.classList.toggle('active', activeAlign === 'center');
        alignRightBtn.classList.toggle('active', activeAlign === 'right');
    }

    /**
     * Setup touch outside to dismiss functionality for mobile
     */
    setupTouchOutsideToDismiss() {
        // Remove any existing listeners
        if (this.touchOutsideHandler) {
            document.removeEventListener('touchstart', this.touchOutsideHandler);
        }

        // Create new touch outside handler
        this.touchOutsideHandler = (e) => {
            const container = document.getElementById('edit-ui-container');
            const contextMenu = document.getElementById('context-menu');

            // Don't hide if touching inside Edit UI
            if (container && container.contains(e.target)) {
                return;
            }

            // Don't hide if touching inside context menu
            if (contextMenu && contextMenu.contains(e.target)) {
                return;
            }

            // Don't hide if touching inside JSColorPicker popup (rendered outside Edit UI)
            if (typeof CitranaColorPicker !== 'undefined' && CitranaColorPicker.isPickerPopupTarget(e.target)) {
                return;
            }

            // Don't hide if touching the inline text/heading editor
            if (e.target.closest('.konva-textarea')) {
                return;
            }

            // Don't hide if touching on context menu items
            if (e.target.closest('.context-menu-item')) {
                return;
            }

            // Touch was outside both Edit UI and context menu, hide Edit UI
            this.hide();
        };

        // Add touch listener with a small delay to prevent immediate dismissal
        setTimeout(() => {
            document.addEventListener('touchstart', this.touchOutsideHandler, {
                passive: true
            });
        }, 100);
    }

    /**
     * Hide the Edit UI
     */
    hide() {
        this._commitEditHistoryIfNeeded();

        this.isVisible = false;
        this.currentElement = null;
        this.currentTool = null;
        this._sessionDirty = false;
        this._skipHistoryOnHide = false;

        // Remove touch outside listener
        if (this.touchOutsideHandler) {
            document.removeEventListener('touchstart', this.touchOutsideHandler);
            this.touchOutsideHandler = null;
        }

        const container = document.getElementById('edit-ui-container');
        container.style.display = 'none';
    }

    /**
     * Clear the content area
     */
    clearContent() {
        const content = document.getElementById('edit-ui-content');
        content.querySelectorAll('button.edit-color-input, input.edit-color-input').forEach((input) => {
            if (typeof CitranaColorPicker !== 'undefined') {
                CitranaColorPicker.destroy(input);
            }
        });
        content.innerHTML = '';
    }

    /**
     * Create a themed colour control for the drawing Edit UI
     * @param {string} color - Initial hex colour
     * @param {string} title - Accessible label
     * @param {Function} onPick - Called with hex when colour changes
     * @returns {HTMLButtonElement}
     */
    createColorControl(color, title, onPick) {
        return CitranaColorPicker.createInput({
            color,
            title,
            context: 'drawing',
            onPick
        });
    }

    /**
     * Create tool-specific controls
     * @param {string} tool - The tool type
     */
    createToolControls(tool) {
        const content = document.getElementById('edit-ui-content');

        switch (tool) {
            case 'pen':
            case 'line':
                this.createStrokeControls(content);
                break;
            case 'arrow':
                this.createArrowControls(content);
                break;
            case 'text':
            case 'heading':
                this.createTextControls(content);
                break;
        }
    }

    /**
     * Create stroke controls for pen and line tools
     * @param {HTMLElement} container - The container to add controls to
     */
    createStrokeControls(container) {
        const isTapered = this.currentElement?.getAttr?.('penTaper') === true;
        const currentStrokeWidth = isTapered
            ? (this.currentElement.getAttr('penBaseWidth') || this.defaultProperties.pen.strokeWidth)
            : (this.currentElement.strokeWidth ? this.currentElement.strokeWidth() : this.defaultProperties.pen.strokeWidth);
        const currentStrokeColor = isTapered
            ? (this.currentElement.getAttr('penStrokeColor') || this.defaultProperties.pen.strokeColor)
            : (this.currentElement.stroke ? this.currentElement.stroke() : this.defaultProperties.pen.strokeColor);

        // Create controls container
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'edit-controls-group';

        // Stroke Width Control
        const decreaseWidth = document.createElement('button');
        decreaseWidth.innerHTML = '<i data-lucide="minus"></i>';
        decreaseWidth.className = 'edit-btn';
        decreaseWidth.title = 'Decrease thickness';

        const widthValue = document.createElement('span');
        widthValue.textContent = currentStrokeWidth;
        widthValue.className = 'edit-value';

        const increaseWidth = document.createElement('button');
        increaseWidth.innerHTML = '<i data-lucide="plus"></i>';
        increaseWidth.className = 'edit-btn';
        increaseWidth.title = 'Increase thickness';

        // Width event listeners
        decreaseWidth.addEventListener('click', () => {
            const isPenTapered = this.currentElement?.getAttr?.('penTaper') === true;
            const currentWidth = isPenTapered
                ? (this.currentElement.getAttr('penBaseWidth') || this.defaultProperties.pen.strokeWidth)
                : (this.currentElement.strokeWidth ? this.currentElement.strokeWidth() : this.defaultProperties.pen.strokeWidth);
            const newWidth = Math.max(1, currentWidth - 1);
            this.updateStrokeWidth(newWidth);
            widthValue.textContent = newWidth;
        });

        increaseWidth.addEventListener('click', () => {
            const isPenTapered = this.currentElement?.getAttr?.('penTaper') === true;
            const currentWidth = isPenTapered
                ? (this.currentElement.getAttr('penBaseWidth') || this.defaultProperties.pen.strokeWidth)
                : (this.currentElement.strokeWidth ? this.currentElement.strokeWidth() : this.defaultProperties.pen.strokeWidth);
            const newWidth = Math.min(10, currentWidth + 1);
            this.updateStrokeWidth(newWidth);
            widthValue.textContent = newWidth;
        });

        // Stroke Color Control
        const colorInput = this.createColorControl(
            currentStrokeColor,
            'Line colour',
            (hex) => this.updateStrokeColor(hex)
        );

        // Add all controls to container
        controlsDiv.appendChild(decreaseWidth);
        controlsDiv.appendChild(widthValue);
        controlsDiv.appendChild(increaseWidth);
        controlsDiv.appendChild(colorInput);
        // --- Add Delete button ---
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '<i data-lucide="trash-2"></i>';
        deleteBtn.className = 'edit-btn danger';
        deleteBtn.title = 'Delete';
        deleteBtn.addEventListener('click', () => {
            this._skipHistoryOnHide = true;
            if (this.onDelete) this.onDelete();
        });
        controlsDiv.appendChild(deleteBtn);
        container.appendChild(controlsDiv);

        // Initialize Lucide icons
        lucide.createIcons();
    }

    /**
     * Create arrow controls
     * @param {HTMLElement} container - The container to add controls to
     */
    createArrowControls(container) {
        // Get current values from the element with proper fallbacks
        const currentStrokeWidth = CitranaArrow.isArrow(this.currentElement)
            ? (this.currentElement.getAttr('arrowStrokeWidth') ?? this.defaultProperties.arrow.strokeWidth ?? 4)
            : (this.currentElement.strokeWidth ? this.currentElement.strokeWidth() : (this.defaultProperties.arrow.strokeWidth || 4));
        const currentStrokeColor = CitranaColorPicker.fromKonvaShape(this.currentElement);

        // Create controls container
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'edit-controls-group';

        // Arrow Thickness Control
        const decreaseWidth = document.createElement('button');
        decreaseWidth.innerHTML = '<i data-lucide="minus"></i>';
        decreaseWidth.className = 'edit-btn';
        decreaseWidth.title = 'Decrease thickness';

        const widthValue = document.createElement('span');
        widthValue.textContent = currentStrokeWidth;
        widthValue.className = 'edit-value';

        const increaseWidth = document.createElement('button');
        increaseWidth.innerHTML = '<i data-lucide="plus"></i>';
        increaseWidth.className = 'edit-btn';
        increaseWidth.title = 'Increase thickness';

        // Width event listeners
        const getArrowWidth = () => (CitranaArrow.isArrow(this.currentElement)
            ? (this.currentElement.getAttr('arrowStrokeWidth') ?? this.defaultProperties.arrow.strokeWidth ?? 4)
            : (this.currentElement.strokeWidth ? this.currentElement.strokeWidth() : (this.defaultProperties.arrow.strokeWidth || 4)));

        decreaseWidth.addEventListener('click', () => {
            const newWidth = Math.max(1, getArrowWidth() - 1);
            this.updateStrokeWidth(newWidth);
            widthValue.textContent = newWidth;
        });

        increaseWidth.addEventListener('click', () => {
            const newWidth = Math.min(10, getArrowWidth() + 1);
            this.updateStrokeWidth(newWidth);
            widthValue.textContent = newWidth;
        });

        // Arrow Color Control
        const colorInput = this.createColorControl(
            currentStrokeColor,
            'Arrow colour',
            (hex) => this.updateStrokeColor(hex)
        );

        // Add all controls to container
        controlsDiv.appendChild(decreaseWidth);
        controlsDiv.appendChild(widthValue);
        controlsDiv.appendChild(increaseWidth);
        controlsDiv.appendChild(colorInput);
        // --- Add Delete button ---
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '<i data-lucide="trash-2"></i>';
        deleteBtn.className = 'edit-btn danger';
        deleteBtn.title = 'Delete';

        // Enhanced delete functionality that works with both click and touch
        const handleDelete = () => {
            citranaDebug('[EDIT UI] Delete button pressed');
            this._skipHistoryOnHide = true;

            // Call the delete callback if it exists (to properly handle control points)
            if (this.onDelete && typeof this.onDelete === 'function') {
                this.onDelete(this.currentElement);
            } else {
                // Fallback: Delete the element directly
                if (this.currentElement) {
                    this.currentElement.destroy();
                    this.currentElement.getLayer().batchDraw();
                    citranaDebug('[EDIT UI] Element deleted (fallback)');
                }
            }

            // Hide the Edit UI
            this.hide();
        };

        // Add both click and touch listeners for better mobile support
        deleteBtn.addEventListener('click', handleDelete);
        deleteBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
            handleDelete();
        });

        controlsDiv.appendChild(deleteBtn);
        container.appendChild(controlsDiv);

        // Initialize Lucide icons
        lucide.createIcons();
    }

    /**
     * Create text controls
     * @param {HTMLElement} container - The container to add controls to
     */
    createTextControls(container) {
        citranaDebug('[EDIT UI] Creating text controls for element:', this.currentElement);
        citranaDebug('[EDIT UI] Element properties:', {
            fontSize: this.currentElement.fontSize,
            fontWeight: this.currentElement.fontWeight,
            fontStyle: this.currentElement.fontStyle,
            fill: this.currentElement.fill
        });

        // Get current values from the element with proper fallbacks
        const currentFontSize = this.currentElement.fontSize ? this.currentElement.fontSize() : this.defaultProperties.text.fontSize;
        const currentFill = this.currentElement.fill ? this.currentElement.fill() : this.defaultProperties.text.fill;
        const isBold = this.isAnnotationBold(this.currentElement);
        const isItalic = this.isAnnotationItalic(this.currentElement);
        const isHandwritten = typeof CitranaAnnotationFonts !== 'undefined' &&
            CitranaAnnotationFonts.isHandwritten(this.currentElement);
        const currentAlign = this.getAnnotationAlign(this.currentElement);

        // Create controls container
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'edit-controls-group';

        // Font Size Control
        const decreaseSize = document.createElement('button');
        decreaseSize.innerHTML = '<i data-lucide="minus"></i>';
        decreaseSize.className = 'edit-btn';
        decreaseSize.title = 'Decrease font size';

        const sizeValue = document.createElement('span');
        sizeValue.textContent = currentFontSize;
        sizeValue.className = 'edit-value';

        const increaseSize = document.createElement('button');
        increaseSize.innerHTML = '<i data-lucide="plus"></i>';
        increaseSize.className = 'edit-btn';
        increaseSize.title = 'Increase font size';

        // Size event listeners
        this.addTouchSupport(decreaseSize, () => {
            // Get current font size from element
            const currentSize = this.currentElement.fontSize ? this.currentElement.fontSize() : this.defaultProperties.text.fontSize;
            const newSize = Math.max(8, currentSize - 2);

            // Set font size safely
            if (typeof this.currentElement.fontSize === 'function') {
                this.currentElement.fontSize(newSize);
            } else {
                this.currentElement.attrs.fontSize = newSize;
            }

            this.currentElement.getLayer().batchDraw();
            sizeValue.textContent = newSize;
            this.markEditDirty();
        });

        this.addTouchSupport(increaseSize, () => {
            // Get current font size from element
            const currentSize = this.currentElement.fontSize ? this.currentElement.fontSize() : this.defaultProperties.text.fontSize;
            const newSize = Math.min(72, currentSize + 2);

            // Set font size safely
            if (typeof this.currentElement.fontSize === 'function') {
                this.currentElement.fontSize(newSize);
            } else {
                this.currentElement.attrs.fontSize = newSize;
            }

            this.currentElement.getLayer().batchDraw();
            sizeValue.textContent = newSize;
            this.markEditDirty();
        });

        // Font Style Controls
        const boldBtn = document.createElement('button');
        boldBtn.innerHTML = '<i data-lucide="bold"></i>';
        boldBtn.className = `edit-btn ${isBold ? 'active' : ''}`;
        boldBtn.title = 'Bold';

        const italicBtn = document.createElement('button');
        italicBtn.innerHTML = '<i data-lucide="italic"></i>';
        italicBtn.className = `edit-btn ${isItalic ? 'active' : ''}`;
        italicBtn.title = 'Italic';

        // Style event listeners
        this.addTouchSupport(boldBtn, () => {
            const nextBold = !this.isAnnotationBold(this.currentElement);
            citranaDebug('[EDIT UI] Bold button clicked - nextBold:', nextBold);

            const applyBold = () => {
                this.setAnnotationBold(this.currentElement, nextBold);
                this.currentElement.getLayer().batchDraw();
                boldBtn.classList.toggle('active', nextBold);
                this.markEditDirty();
            };

            if (nextBold && CitranaAnnotationFonts?.isHandwritten?.(this.currentElement)) {
                CitranaAnnotationFonts.ensureLoaded().then(applyBold);
            } else {
                applyBold();
            }
        });

        this.addTouchSupport(italicBtn, () => {
            const nextItalic = !this.isAnnotationItalic(this.currentElement);
            citranaDebug('[EDIT UI] Italic button clicked - nextItalic:', nextItalic);

            this.setAnnotationItalic(this.currentElement, nextItalic);
            this.currentElement.getLayer().batchDraw();
            italicBtn.classList.toggle('active', nextItalic);
            this.markEditDirty();
        });

        const normalFontBtn = document.createElement('button');
        normalFontBtn.innerHTML = '<i data-lucide="case-sensitive"></i>';
        normalFontBtn.className = `edit-btn ${isHandwritten ? '' : 'active'}`.trim();
        normalFontBtn.title = 'Normal font';

        const handFontBtn = document.createElement('button');
        handFontBtn.innerHTML = '<i data-lucide="pen-line"></i>';
        handFontBtn.className = `edit-btn ${isHandwritten ? 'active' : ''}`.trim();
        handFontBtn.title = 'Hand-written font';

        const applyFontMode = (mode) => {
            const apply = () => {
                CitranaAnnotationFonts.setMode(this.currentElement, mode);
                this.currentElement.getLayer().batchDraw();
                const handwritten = CitranaAnnotationFonts.isHandwritten(this.currentElement);
                normalFontBtn.classList.toggle('active', !handwritten);
                handFontBtn.classList.toggle('active', handwritten);
                boldBtn.classList.toggle('active', this.isAnnotationBold(this.currentElement));
                this.markEditDirty();
            };

            if (mode === CitranaAnnotationFonts.MODE_HANDWRITTEN) {
                CitranaAnnotationFonts.ensureLoaded().then(apply);
            } else {
                apply();
            }
        };

        this.addTouchSupport(normalFontBtn, () => {
            applyFontMode(CitranaAnnotationFonts.MODE_NORMAL);
        });

        this.addTouchSupport(handFontBtn, () => {
            applyFontMode(CitranaAnnotationFonts.MODE_HANDWRITTEN);
        });

        // Text Color Control
        const colorInput = this.createColorControl(
            currentFill,
            'Text colour',
            (hex) => this.updateTextColor(hex)
        );

        // Add all controls to container
        controlsDiv.appendChild(decreaseSize);
        controlsDiv.appendChild(sizeValue);
        controlsDiv.appendChild(increaseSize);
        controlsDiv.appendChild(boldBtn);
        controlsDiv.appendChild(italicBtn);
        controlsDiv.appendChild(normalFontBtn);
        controlsDiv.appendChild(handFontBtn);
        controlsDiv.appendChild(colorInput);
        // --- Add text alignment buttons ---
        const alignLeftBtn = document.createElement('button');
        alignLeftBtn.innerHTML = '<i data-lucide="align-left"></i>';
        alignLeftBtn.className = 'edit-btn';
        alignLeftBtn.title = 'Align Left';
        const alignCenterBtn = document.createElement('button');
        alignCenterBtn.innerHTML = '<i data-lucide="align-center"></i>';
        alignCenterBtn.className = 'edit-btn';
        alignCenterBtn.title = 'Align Center';
        const alignRightBtn = document.createElement('button');
        alignRightBtn.innerHTML = '<i data-lucide="align-right"></i>';
        alignRightBtn.className = 'edit-btn';
        alignRightBtn.title = 'Align Right';

        this.updateAlignButtonStates(currentAlign, alignLeftBtn, alignCenterBtn, alignRightBtn);

        const applyAlign = (align) => {
            this.setAnnotationAlign(this.currentElement, align);
            this.currentElement.getLayer().batchDraw();
            this.updateAlignButtonStates(align, alignLeftBtn, alignCenterBtn, alignRightBtn);
            this.markEditDirty();
        };

        this.addTouchSupport(alignLeftBtn, () => applyAlign('left'));
        this.addTouchSupport(alignCenterBtn, () => applyAlign('center'));
        this.addTouchSupport(alignRightBtn, () => applyAlign('right'));

        controlsDiv.appendChild(alignLeftBtn);
        controlsDiv.appendChild(alignCenterBtn);
        controlsDiv.appendChild(alignRightBtn);

        // --- Add Retrograde button (only for planet text) ---
        const retrogradeBtn = document.createElement('button');
        retrogradeBtn.innerHTML = '<i data-lucide="rotate-ccw"></i>';
        retrogradeBtn.className = 'edit-btn';
        retrogradeBtn.title = 'Toggle Retrograde';

        // Check if this is planet text (has _planetHouseNumber property)
        const isPlanetText = this.currentElement._planetHouseNumber !== undefined;
        const isRetrograde = this.currentElement.textDecoration ?
            this.currentElement.textDecoration() === 'underline' :
            false;

        // Set initial active state
        if (isRetrograde) {
            retrogradeBtn.classList.add('active');
        }

        // Only show retrograde button for planet text
        if (isPlanetText) {
            retrogradeBtn.addEventListener('click', () => {
                const nextRetrograde = this.currentElement.textDecoration() !== 'underline';
                this.currentElement.textDecoration(nextRetrograde ? 'underline' : '');
                retrogradeBtn.classList.toggle('active', nextRetrograde);
                this.currentElement.getLayer().batchDraw();

                if (window.app?.drawingTools?.setPlanetRetrogradeState) {
                    window.app.drawingTools.setPlanetRetrogradeState(this.currentElement, nextRetrograde);
                }
            });

            controlsDiv.appendChild(retrogradeBtn);
        }

        // --- Add Delete button ---
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '<i data-lucide="trash-2"></i>';
        deleteBtn.className = 'edit-btn danger';
        deleteBtn.title = 'Delete';

        // Enhanced delete functionality that works with both click and touch
        const handleDelete = () => {
            citranaDebug('[EDIT UI] Delete button pressed');
            this._skipHistoryOnHide = true;

            // Call the delete callback if it exists (to properly handle control points)
            if (this.onDelete && typeof this.onDelete === 'function') {
                this.onDelete(this.currentElement);
            } else {
                // Fallback: Delete the element directly
                if (this.currentElement) {
                    this.currentElement.destroy();
                    this.currentElement.getLayer().batchDraw();
                    citranaDebug('[EDIT UI] Element deleted (fallback)');
                }
            }

            // Hide the Edit UI
            this.hide();
        };

        this.addTouchSupport(deleteBtn, handleDelete);

        controlsDiv.appendChild(deleteBtn);
        container.appendChild(controlsDiv);

        // Initialize Lucide icons
        lucide.createIcons();
    }

    /**
     * Position the Edit UI on screen
     */
    positionEditUI() {
        const container = document.getElementById('edit-ui-container');

        // Position at bottom center, same as planet text edit UI
        container.style.bottom = '20px';
        container.style.left = '50%';
        container.style.transform = 'translateX(-50%)';
    }

    /**
     * Update stroke width for the current element
     * @param {number} width - New stroke width
     */
    updateStrokeWidth(width) {
        if (this.currentElement) {
            if (CitranaArrow.isArrow(this.currentElement)) {
                CitranaArrow.setStrokeWidth(this.currentElement, width);
            } else if (this.currentElement.getAttr?.('penTaper') === true) {
                window.app?.drawingTools?.syncPenTaperWidth?.(this.currentElement, width);
            } else {
                this.currentElement.strokeWidth(width);
            }
            this.currentElement.getLayer().batchDraw();
            this.markEditDirty();
        }
    }

    /**
     * Update stroke color for the current element
     * @param {string} color - New stroke color
     */
    updateStrokeColor(color) {
        if (this.currentElement) {
            if (CitranaArrow.isArrow(this.currentElement)) {
                CitranaColorPicker.applyToKonvaArrow(this.currentElement, color);
            } else if (this.currentElement.getAttr?.('penTaper') === true) {
                this.currentElement.setAttr('penStrokeColor', color);
            } else {
                this.currentElement.stroke(color);
            }

            this.currentElement.getLayer().batchDraw();
            this.markEditDirty();
        }
    }

    /**
     * Update text color for the current element
     * @param {string} color - New text color
     */
    updateTextColor(color) {
        if (this.currentElement) {
            this.currentElement.fill(color);
            this.currentElement.getLayer().batchDraw();
            this.markEditDirty();
        }
    }

    markEditDirty() {
        this._sessionDirty = true;
        window.app?.drawingTools?.syncAnnotationSelectionPill?.();
    }

    _commitEditHistoryIfNeeded() {
        if (!this._sessionDirty || this._skipHistoryOnHide) {
            return;
        }

        const labels = {
            pen: 'Edit pen',
            line: 'Edit line',
            arrow: 'Edit arrow',
            text: 'Edit text',
            heading: 'Edit heading'
        };
        const label = labels[this.currentTool] || 'Edit drawing';
        window.app?.recordHistory(label);
    }

    /**
     * Check if Edit UI is currently visible
     * @returns {boolean} True if visible
     */
    isEditUIVisible() {
        return this.isVisible;
    }

    setDeleteCallback(callback) {
        this.onDelete = callback;
    }


}