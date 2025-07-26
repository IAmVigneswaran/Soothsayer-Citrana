/**
 * Edit UI Class
 * Provides context-sensitive editing controls for different drawing tools and elements
 */
class EditUI {
    constructor() {
        this.currentElement = null;
        this.currentTool = null;
        this.isVisible = false;
        this.onDelete = null; // Callback for delete action

        // Initialize the Edit UI container
        this.initEditUIContainer();

        // Default properties for different tools
        this.defaultProperties = {
            pen: {
                strokeWidth: 5,
                strokeColor: '#FF0000'
            },
            line: {
                strokeWidth: 5,
                strokeColor: '#FF0000'
            },
            arrow: {
                strokeWidth: 5,
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
        console.log(`[EDIT UI] show() called with tool: ${tool}, element:`, element);

        this.currentElement = element;
        this.currentTool = tool;
        this.isVisible = true;

        // Note: Text properties will be handled safely in the click handlers

        // Clear previous content
        this.clearContent();

        // Create tool-specific controls
        this.createToolControls(tool);

        // Show the container
        const container = document.getElementById('edit-ui-container');
        if (container) {
            container.style.display = 'flex';
            console.log(`[EDIT UI] Container displayed`);
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
        this.isVisible = false;
        this.currentElement = null;
        this.currentTool = null;

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
        content.innerHTML = '';
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
                this.createTextControls(content);
                break;
            case 'heading':
                this.createTextControls(content, 2); // 2-line limit
                break;
        }
    }

    /**
     * Create stroke controls for pen and line tools
     * @param {HTMLElement} container - The container to add controls to
     */
    createStrokeControls(container) {
        // Get current values from the element with proper fallbacks
        const currentStrokeWidth = this.currentElement.strokeWidth ? this.currentElement.strokeWidth() : this.defaultProperties.pen.strokeWidth;
        const currentStrokeColor = this.currentElement.stroke ? this.currentElement.stroke() : this.defaultProperties.pen.strokeColor;

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
            const currentWidth = this.currentElement.strokeWidth ? this.currentElement.strokeWidth() : this.defaultProperties.pen.strokeWidth;
            const newWidth = Math.max(1, currentWidth - 1);
            this.updateStrokeWidth(newWidth);
            widthValue.textContent = newWidth;
        });

        increaseWidth.addEventListener('click', () => {
            const currentWidth = this.currentElement.strokeWidth ? this.currentElement.strokeWidth() : this.defaultProperties.pen.strokeWidth;
            const newWidth = Math.min(10, currentWidth + 1);
            this.updateStrokeWidth(newWidth);
            widthValue.textContent = newWidth;
        });

        // Stroke Color Control
        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.value = currentStrokeColor;
        colorInput.className = 'edit-color-input';
        colorInput.title = 'Line color';

        colorInput.addEventListener('change', (e) => {
            this.updateStrokeColor(e.target.value);
        });

        // Also listen for input event for better Chrome compatibility
        colorInput.addEventListener('input', (e) => {
            this.updateStrokeColor(e.target.value);
        });

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
        const currentStrokeWidth = this.currentElement.strokeWidth ? this.currentElement.strokeWidth() : (this.defaultProperties.arrow.strokeWidth || 5);
        const currentStrokeColor = this.currentElement.stroke ? this.currentElement.stroke() : this.defaultProperties.arrow.strokeColor;

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
        decreaseWidth.addEventListener('click', () => {
            const currentWidth = this.currentElement.strokeWidth ? this.currentElement.strokeWidth() : (this.defaultProperties.arrow.strokeWidth || 5);
            const newWidth = Math.max(1, currentWidth - 1);
            this.updateStrokeWidth(newWidth);
            widthValue.textContent = newWidth;
        });

        increaseWidth.addEventListener('click', () => {
            const currentWidth = this.currentElement.strokeWidth ? this.currentElement.strokeWidth() : (this.defaultProperties.arrow.strokeWidth || 5);
            const newWidth = Math.min(10, currentWidth + 1);
            this.updateStrokeWidth(newWidth);
            widthValue.textContent = newWidth;
        });

        // Arrow Color Control
        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.value = currentStrokeColor;
        colorInput.className = 'edit-color-input';
        colorInput.title = 'Arrow color';

        colorInput.addEventListener('change', (e) => {
            this.updateStrokeColor(e.target.value);
        });

        // Also listen for input event for better Chrome compatibility
        colorInput.addEventListener('input', (e) => {
            this.updateStrokeColor(e.target.value);
        });

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
            console.log('[EDIT UI] Delete button pressed');

            // Call the delete callback if it exists (to properly handle control points)
            if (this.onDelete && typeof this.onDelete === 'function') {
                this.onDelete(this.currentElement);
            } else {
                // Fallback: Delete the element directly
                if (this.currentElement) {
                    this.currentElement.destroy();
                    this.currentElement.getLayer().batchDraw();
                    console.log('[EDIT UI] Element deleted (fallback)');
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
    createTextControls(container, maxLines) {
        console.log('[EDIT UI] Creating text controls for element:', this.currentElement);
        console.log('[EDIT UI] Element properties:', {
            fontSize: this.currentElement.fontSize,
            fontWeight: this.currentElement.fontWeight,
            fontStyle: this.currentElement.fontStyle,
            fill: this.currentElement.fill
        });

        // Get current values from the element with proper fallbacks
        const currentFontSize = this.currentElement.fontSize ? this.currentElement.fontSize() : this.defaultProperties.text.fontSize;
        const currentFontWeight = this.currentElement.fontWeight ? this.currentElement.fontWeight() : this.defaultProperties.text.fontWeight;
        const currentFontStyle = this.currentElement.fontStyle ? this.currentElement.fontStyle() : this.defaultProperties.text.fontStyle;
        const currentFill = this.currentElement.fill ? this.currentElement.fill() : this.defaultProperties.text.fill;

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
        });

        // Font Style Controls
        const boldBtn = document.createElement('button');
        boldBtn.innerHTML = '<i data-lucide="bold"></i>';
        boldBtn.className = `edit-btn ${currentFontWeight === 'bold' ? 'active' : ''}`;
        boldBtn.title = 'Bold';

        const italicBtn = document.createElement('button');
        italicBtn.innerHTML = '<i data-lucide="italic"></i>';
        italicBtn.className = `edit-btn ${currentFontStyle === 'italic' ? 'active' : ''}`;
        italicBtn.title = 'Italic';

        // Style event listeners
        boldBtn.addEventListener('click', () => {
            // Get current font weight from the element with safe fallback
            let currentWeight = 400; // Default to normal
            if (this.currentElement.fontWeight && typeof this.currentElement.fontWeight === 'function') {
                currentWeight = this.currentElement.fontWeight();
            }

            const isBold = currentWeight === 'bold' || currentWeight === 700 || currentWeight === '700';
            const newWeight = isBold ? 'normal' : 'bold';
            console.log('[EDIT UI] Bold button clicked - currentWeight:', currentWeight, 'isBold:', isBold, 'newWeight:', newWeight);

            // Set font weight and ensure it works
            if (newWeight === 'bold') {
                // For bold, try setting both font family and weight
                this.currentElement.fontFamily('Arial Black, Arial, sans-serif');
                if (typeof this.currentElement.fontWeight === 'function') {
                    this.currentElement.fontWeight('bold');
                } else {
                    this.currentElement.attrs.fontWeight = 'bold';
                }
                console.log('[EDIT UI] Set to bold with Arial Black');
            } else {
                // For normal, reset to regular font family
                this.currentElement.fontFamily('Arial, sans-serif');
                if (typeof this.currentElement.fontWeight === 'function') {
                    this.currentElement.fontWeight('normal');
                } else {
                    this.currentElement.attrs.fontWeight = 'normal';
                }
                console.log('[EDIT UI] Set to normal with Arial');
            }

            // Force a redraw to ensure the change is applied
            this.currentElement.getLayer().batchDraw();

            this.currentElement.getLayer().batchDraw();
            boldBtn.classList.toggle('active');
        });

        italicBtn.addEventListener('click', () => {
            // Get current font style from the element with safe fallback
            let currentStyle = 'normal'; // Default to normal
            if (this.currentElement.fontStyle && typeof this.currentElement.fontStyle === 'function') {
                currentStyle = this.currentElement.fontStyle();
            }

            const newStyle = currentStyle === 'italic' ? 'normal' : 'italic';
            console.log('[EDIT UI] Italic button clicked - currentStyle:', currentStyle, 'newStyle:', newStyle);

            // Set font style safely
            if (typeof this.currentElement.fontStyle === 'function') {
                this.currentElement.fontStyle(newStyle);
                console.log('[EDIT UI] Set fontStyle to', newStyle);
            } else {
                // If fontStyle function doesn't exist, try setting it as a property
                this.currentElement.attrs.fontStyle = newStyle;
                console.log('[EDIT UI] Set fontStyle as property to', newStyle);
            }

            this.currentElement.getLayer().batchDraw();
            italicBtn.classList.toggle('active');
        });

        // Text Color Control
        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.value = currentFill;
        colorInput.className = 'edit-color-input';
        colorInput.title = 'Text color';

        colorInput.addEventListener('change', (e) => {
            this.updateTextColor(e.target.value);
        });

        // Also listen for input event for better Chrome compatibility
        colorInput.addEventListener('input', (e) => {
            this.updateTextColor(e.target.value);
        });

        // Add all controls to container
        controlsDiv.appendChild(decreaseSize);
        controlsDiv.appendChild(sizeValue);
        controlsDiv.appendChild(increaseSize);
        controlsDiv.appendChild(boldBtn);
        controlsDiv.appendChild(italicBtn);
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
        // Set initial active state
        const currentAlign = this.currentElement.align ? this.currentElement.align() : 'center';
        if (currentAlign === 'left') alignLeftBtn.classList.add('active');
        else if (currentAlign === 'right') alignRightBtn.classList.add('active');
        else alignCenterBtn.classList.add('active');
        // Alignment event listeners
        alignLeftBtn.addEventListener('click', () => {
            this.currentElement.align('left');
            this.currentElement.offsetX(0);
            this.currentElement.getLayer().batchDraw();
            alignLeftBtn.classList.add('active');
            alignCenterBtn.classList.remove('active');
            alignRightBtn.classList.remove('active');
        });
        alignCenterBtn.addEventListener('click', () => {
            this.currentElement.align('center');
            this.currentElement.offsetX(this.currentElement.width() / 2);
            this.currentElement.getLayer().batchDraw();
            alignLeftBtn.classList.remove('active');
            alignCenterBtn.classList.add('active');
            alignRightBtn.classList.remove('active');
        });
        alignRightBtn.addEventListener('click', () => {
            this.currentElement.align('right');
            this.currentElement.offsetX(this.currentElement.width());
            this.currentElement.getLayer().batchDraw();
            alignLeftBtn.classList.remove('active');
            alignCenterBtn.classList.remove('active');
            alignRightBtn.classList.add('active');
        });
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
        const currentText = this.currentElement.text ? this.currentElement.text() : '';
        const isRetrograde = currentText.includes('R');

        // Set initial active state
        if (isRetrograde) {
            retrogradeBtn.classList.add('active');
        }

        // Only show retrograde button for planet text
        if (isPlanetText) {
            retrogradeBtn.addEventListener('click', () => {
                const currentText = this.currentElement.text();
                let newText;

                if (isRetrograde) {
                    // Remove retrograde "R" - find and remove the R subscript
                    newText = currentText.replace(/R/g, '');
                } else {
                    // Add retrograde "R" - add R as subscript
                    newText = currentText + 'R';
                }

                // Update the text
                this.currentElement.text(newText);
                this.currentElement.getLayer().batchDraw();

                // Toggle active state
                retrogradeBtn.classList.toggle('active');
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
            console.log('[EDIT UI] Delete button pressed');

            // Call the delete callback if it exists (to properly handle control points)
            if (this.onDelete && typeof this.onDelete === 'function') {
                this.onDelete(this.currentElement);
            } else {
                // Fallback: Delete the element directly
                if (this.currentElement) {
                    this.currentElement.destroy();
                    this.currentElement.getLayer().batchDraw();
                    console.log('[EDIT UI] Element deleted (fallback)');
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

        // Find the input element (textarea or input)
        const input = container.querySelector('.text-edit-input') || container.querySelector('input[type="text"]');
        if (input && maxLines) {
            input.addEventListener('input', function enforceLineLimit(e) {
                const lines = input.value.split('\n');
                if (lines.length > maxLines) {
                    input.value = lines.slice(0, maxLines).join('\n');
                }
            });
        }
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
            this.currentElement.strokeWidth(width);
            this.currentElement.getLayer().batchDraw();
        }
    }

    /**
     * Update stroke color for the current element
     * @param {string} color - New stroke color
     */
    updateStrokeColor(color) {
        if (this.currentElement) {
            this.currentElement.stroke(color);

            // For arrows, also update the fill color (arrowhead)
            if (this.currentElement instanceof Konva.Arrow) {
                this.currentElement.fill(color);
            }

            this.currentElement.getLayer().batchDraw();
        }
    }

    /**
     * Update font size for the current element
     * @param {number} size - New font size
     */
    updateFontSize(size) {
        console.log('[EDIT UI] updateFontSize called with:', size);
        if (this.currentElement) {
            console.log('[EDIT UI] Before update - fontSize:', this.currentElement.fontSize ? this.currentElement.fontSize() : 'undefined');
            this.currentElement.fontSize(size);
            console.log('[EDIT UI] After update - fontSize:', this.currentElement.fontSize ? this.currentElement.fontSize() : 'undefined');
            this.currentElement.getLayer().batchDraw();
        }
    }

    /**
     * Update font weight for the current element
     * @param {string} weight - New font weight
     */
    updateFontWeight(weight) {
        console.log('[EDIT UI] updateFontWeight called with:', weight);
        if (this.currentElement) {
            console.log('[EDIT UI] Before update - fontWeight:', this.currentElement.fontWeight ? this.currentElement.fontWeight() : 'undefined');
            this.currentElement.fontWeight(weight);
            console.log('[EDIT UI] After update - fontWeight:', this.currentElement.fontWeight ? this.currentElement.fontWeight() : 'undefined');
            this.currentElement.getLayer().batchDraw();
        }
    }

    /**
     * Update font style for the current element
     * @param {string} style - New font style
     */
    updateFontStyle(style) {
        console.log('[EDIT UI] updateFontStyle called with:', style);
        if (this.currentElement) {
            console.log('[EDIT UI] Before update - fontStyle:', this.currentElement.fontStyle ? this.currentElement.fontStyle() : 'undefined');
            this.currentElement.fontStyle(style);
            console.log('[EDIT UI] After update - fontStyle:', this.currentElement.fontStyle ? this.currentElement.fontStyle() : 'undefined');
            this.currentElement.getLayer().batchDraw();
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
        }
    }

    /**
     * Check if Edit UI is currently visible
     * @returns {boolean} True if visible
     */
    isEditUIVisible() {
        return this.isVisible;
    }

    /**
     * Get the current element being edited
     * @returns {Object|null} Current element or null
     */
    getCurrentElement() {
        return this.currentElement;
    }

    /**
     * Get the current tool type
     * @returns {string|null} Current tool type or null
     */
    getCurrentTool() {
        return this.currentTool;
    }

    setDeleteCallback(callback) {
        this.onDelete = callback;
    }


}