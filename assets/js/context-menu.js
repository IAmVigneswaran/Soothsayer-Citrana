/**
 * Context Menu Class
 * Handles all right-click context menu functionality
 */
class ContextMenu {
    constructor() {
        this.menu = null;
        this.isVisible = false;
    }

    init() {
        this.createMenu();
        this.setupEventListeners();
        console.log('Context menu initialized');
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
                this.showChartMenu(e.clientX, e.clientY);
            });
            
            // Mobile: Long press for context menu
            let longPressTimer = null;
            let longPressTriggered = false;
            
            canvas.addEventListener('touchstart', (e) => {
                if (e.touches.length === 1) { // Single touch only
                    longPressTriggered = false;
                    longPressTimer = setTimeout(() => {
                        const touch = e.touches[0];
                        e.preventDefault();
                        longPressTriggered = true;
                        this.showChartMenu(touch.clientX, touch.clientY);
                    }, 500);
                }
            });
            
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
            if (this.menu && this.menu.contains(e.target)) {
                // Prevent the touchstart from triggering the hide logic
                e.stopPropagation();
            }
        }, { passive: false });

        // Hide menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hide();
            }
        });
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
        `;
        lucide.createIcons();
        this.show(x, y);
        this.setupMenuEventListeners();
    }

    showExistingChartMenu(x, y, chartType) {
        const chartName = chartType === 'south-indian' ? 'South Indian' : 'North Indian';
        let menuHtml = `
            <div class="context-menu-header">${chartName} Chart</div>
            <div class="context-menu-separator"></div>
        `;
        // Add 'Set as Lagna' menu item only for South Indian chart
        if (chartType === 'south-indian') {
            menuHtml += `
            <div class="context-menu-item" data-action="set-lagna"><i data-lucide="target"></i> Set as Lagna</div>
            <div class="context-menu-separator"></div>
            `;
        }
        // Add 'Set Lagna as ...' with 12 sub-menu items for North Indian chart
        if (chartType === 'north-indian') {
            const rashis = [
                { name: 'Aries', symbol: '\u2648' },
                { name: 'Taurus', symbol: '\u2649' },
                { name: 'Gemini', symbol: '\u264A' },
                { name: 'Cancer', symbol: '\u264B' },
                { name: 'Leo', symbol: '\u264C' },
                { name: 'Virgo', symbol: '\u264D' },
                { name: 'Libra', symbol: '\u264E' },
                { name: 'Scorpio', symbol: '\u264F' },
                { name: 'Sagittarius', symbol: '\u2650' },
                { name: 'Capricorn', symbol: '\u2651' },
                { name: 'Aquarius', symbol: '\u2652' },
                { name: 'Pisces', symbol: '\u2653' }
            ];
            menuHtml += `
            <div class="context-menu-item has-submenu" data-action="set-lagna-parent"><i data-lucide="target"></i> Set Lagna as ...
                <div class="context-submenu context-menu">
                    ${rashis.map((rashi, i) => `<div class='context-menu-item' data-action='set-lagna' data-house='${i+1}'><span class='zodiac-symbol'>${rashi.symbol}</span> ${rashi.name}</div>`).join('')}
                </div>
            </div>
            <div class="context-menu-separator"></div>
            `;
        }
        // Add 'Reset Chart' and 'Clear Canvas' (renamed from 'Clear Chart')
        menuHtml += `
            <div class="context-menu-item" data-action="reset-chart"><i data-lucide="refresh-ccw"></i> Reset Chart</div>
            <div class="context-menu-item last-item" data-action="clear-chart"><i data-lucide="trash-2"></i> Clear Canvas</div>
        `;
        this.menu.innerHTML = menuHtml;
        lucide.createIcons();
        this.show(x, y);
        this.setupMenuEventListeners();
        // Setup submenu hover logic
        this.setupSubmenuHover();
    }

    setupSubmenuHover() {
        // Show/hide submenu on hover for .has-submenu
        const parent = this.menu.querySelector('.has-submenu');
        if (parent) {
            const submenu = parent.querySelector('.context-submenu');
            parent.addEventListener('mouseenter', () => {
                submenu.style.display = 'block';
            });
            parent.addEventListener('mouseleave', () => {
                submenu.style.display = 'none';
            });
        }
    }

    showHouseMenu(x, y, houseNumber) {
        this.currentHouseNumber = houseNumber;
        console.log('[DEBUG] showHouseMenu called for house:', houseNumber);
        const chartType = window.app?.chartTemplates?.currentChartType;
        const chartName = chartType === 'south-indian' ? 'South Indian' : 'North Indian';
        const menuHtml =
            `<div class="context-menu-header">${chartName} Chart - House ${houseNumber}</div>` +
            `<div class="context-menu-separator"></div>` +
            `<div class="context-menu-item" data-action="set-lagna" data-house="${houseNumber}"><i data-lucide="target"></i> Set as Lagna (Ascendant)</div>` +
            `<div class="context-menu-item" data-action="set-first-house" data-house="${houseNumber}"><i data-lucide="home"></i> Set as First House</div>` +
            `<div class="context-menu-separator"></div>` +
            `<div class="context-menu-item danger" data-action="clear-house" data-house="${houseNumber}"><i data-lucide="eraser"></i> Clear House</div>` +
            `<div class="context-menu-separator"></div>` +
            `<div class="context-menu-item" data-action="reset-chart"><i data-lucide="refresh-ccw"></i> Reset Chart</div>` +
            `<div class="context-menu-item last-item" data-action="clear-chart"><i data-lucide="trash-2"></i> Clear Canvas</div>`;
        console.log('[DEBUG] Menu HTML:', menuHtml);
        this.menu.innerHTML = menuHtml;
        lucide.createIcons();
        // Explicitly set data-house attributes after rendering
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
        // Custom context menu for planet text
        const menuHtml = `
            <div class="context-menu-header">Planet Options</div>
            <div class="context-menu-separator"></div>
            <div class="context-menu-item has-submenu" data-action="edit-planet-parent"><i data-lucide="edit"></i> Edit
                <div class="context-submenu context-menu">
                    <div class="context-menu-item" data-action="rename-planet" data-house="${houseNumber}" data-abbr="${planetAbbr}" data-planetid="${planetId}"><i data-lucide="type"></i> Rename</div>
                    <div class="context-menu-item danger" data-action="delete-planet" data-house="${houseNumber}" data-abbr="${planetAbbr}" data-planetid="${planetId}"><i data-lucide="trash-2"></i> Delete</div>
                </div>
            </div>
        `;
        this.menu.innerHTML = menuHtml;
        lucide.createIcons();
        this.show(x, y);
        this.setupMenuEventListeners();
        this.setupSubmenuHover();
        this.menu.style.zIndex = '9999';
    }

    setupMenuEventListeners() {
        // Remove any previous event listener to avoid duplicates
        this.menu.onclick = null;
        this.menu.onclick = (e) => {
            const item = e.target.closest('.context-menu-item');
            console.log('[DEBUG] Click event target:', e.target);
            console.log('[DEBUG] Closest .context-menu-item:', item);
            if (!item) return;
            e.preventDefault();
            const action = item.dataset.action;
            const houseNumber = item.dataset.house || item._houseNumber || this.currentHouseNumber;
            console.log('[DEBUG] Menu item clicked:', action, houseNumber);
            this.handleAction(action, houseNumber);
            this.hide();
        };
        
        // Add touch event handling for mobile
        this.menu.addEventListener('touchstart', (e) => {
            // Prevent touch events from bubbling up to document
            e.stopPropagation();
        }, { passive: false });
        
        this.menu.addEventListener('touchend', (e) => {
            const item = e.target.closest('.context-menu-item');
            if (item) {
                e.preventDefault();
                e.stopPropagation();
                const action = item.dataset.action;
                const houseNumber = item.dataset.house || item._houseNumber || this.currentHouseNumber;
                console.log('[DEBUG] Menu item touched:', action, houseNumber);
                this.handleAction(action, houseNumber);
                this.hide();
            }
        }, { passive: false });
    }

    handleAction(action, houseNumber) {
        switch (action) {
            case 'create-south-indian':
                window.app.chartTemplates.createSouthIndianChart();
                break;
                
            case 'create-north-indian':
                window.app.chartTemplates.createNorthIndianChart();
                break;
                
            case 'clear-chart':
                window.app.clearChart();
                break;
            case 'reset-chart':
                window.app.resetChart();
                break;
                
            case 'set-lagna':
                // Set the right-clicked house as Lagna directly
                console.log('[DEBUG] Context Menu - set-lagna action triggered');
                console.log('[DEBUG] House number from menu:', houseNumber);
                console.log('[DEBUG] Parsed house number:', parseInt(houseNumber));
                if (window.app && window.app.chartTemplates && houseNumber) {
                    console.log('[DEBUG] Calling chartTemplates.setLagnaHouse with:', parseInt(houseNumber));
                    window.app.chartTemplates.setLagnaHouse(parseInt(houseNumber));
                } else {
                    console.log('[DEBUG] ERROR: Cannot set Lagna - missing app, chartTemplates, or houseNumber');
                }
                break;
                
            case 'set-first-house':
                if (houseNumber) {
                    window.app.chartTemplates.setFirstHouse(parseInt(houseNumber));
                }
                break;
                
            case 'clear-house':
                if (houseNumber) {
                    // Implement house clearing logic
                    console.log(`Clear house ${houseNumber}`);
                }
                break;

            // Add planet actions
            if (action === 'rename-planet') {
                const abbr = this.menu.querySelector('[data-action="rename-planet"]').dataset.abbr;
                const planetId = this.menu.querySelector('[data-action="rename-planet"]').dataset.planetid;
                const newLabel = prompt('Enter new label for this planet:');
                if (newLabel && window.app.chartTemplates.currentChartType === 'south-indian') {
                    window.app.chartTemplates.southIndianTemplate.renamePlanetInHouseById(parseInt(houseNumber), planetId, newLabel);
                }
            } else if (action === 'delete-planet') {
                const abbr = this.menu.querySelector('[data-action="delete-planet"]').dataset.abbr;
                const planetId = this.menu.querySelector('[data-action="delete-planet"]').dataset.planetid;
                if (window.app.chartTemplates.currentChartType === 'south-indian') {
                    window.app.chartTemplates.southIndianTemplate.removePlanetFromHouseById(parseInt(houseNumber), planetId);
                }
            }
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
        this.isVisible = true;
    }

    hide() {
        this.menu.classList.add('hidden');
        this.isVisible = false;
    }

    isMenuVisible() {
        return this.isVisible;
    }
} 