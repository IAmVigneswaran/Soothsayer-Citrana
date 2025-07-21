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
        this.menu.className = 'hidden';
        document.body.appendChild(this.menu);
    }

    setupEventListeners() {
        // Prevent default context menu on canvas
        const canvas = document.getElementById('canvas-container');
        if (canvas) {
            canvas.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.showChartMenu(e.clientX, e.clientY);
            });
        }

        // Hide menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.menu.contains(e.target)) {
                this.hide();
            }
        });

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
            <div class="context-menu-header">Create Chart</div>
            <div class="context-menu-item" data-action="create-south-indian">
                Create South Indian Chart
            </div>
            <div class="context-menu-item" data-action="create-north-indian">
                Create North Indian Chart
            </div>
        `;

        this.show(x, y);
        this.setupMenuEventListeners();
    }

    showExistingChartMenu(x, y, chartType) {
        const chartName = chartType === 'south-indian' ? 'South Indian' : 'North Indian';
        
        this.menu.innerHTML = `
            <div class="context-menu-header">${chartName} Chart</div>
            <div class="context-menu-item" data-action="clear-chart">
                Clear Chart
            </div>
            <div class="context-menu-separator"></div>
            <div class="context-menu-item" data-action="create-south-indian">
                Create South Indian Chart
            </div>
            <div class="context-menu-item" data-action="create-north-indian">
                Create North Indian Chart
            </div>
        `;

        this.show(x, y);
        this.setupMenuEventListeners();
    }

    showHouseMenu(x, y, houseNumber) {
        const chartType = window.app?.chartTemplates?.currentChartType;
        const chartName = chartType === 'south-indian' ? 'South Indian' : 'North Indian';
        
        this.menu.innerHTML = `
            <div class="context-menu-header">${chartName} Chart - House ${houseNumber}</div>
            <div class="context-menu-item" data-action="set-lagna" data-house="${houseNumber}">
                Set as Lagna (Ascendant)
            </div>
            <div class="context-menu-item" data-action="set-first-house" data-house="${houseNumber}">
                Set as First House
            </div>
            <div class="context-menu-separator"></div>
            <div class="context-menu-item danger" data-action="clear-house" data-house="${houseNumber}">
                Clear House
            </div>
            <div class="context-menu-separator"></div>
            <div class="context-menu-item" data-action="clear-chart">
                Clear Chart
            </div>
        `;

        this.show(x, y);
        this.setupMenuEventListeners();
    }

    setupMenuEventListeners() {
        const menuItems = this.menu.querySelectorAll('.context-menu-item');
        
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const action = item.dataset.action;
                const houseNumber = item.dataset.house;
                
                this.handleAction(action, houseNumber);
                this.hide();
            });
        });
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
                
            case 'set-lagna':
                if (houseNumber) {
                    window.app.chartTemplates.setLagnaHouse(parseInt(houseNumber));
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
        }
    }

    show(x, y) {
        // Position menu
        this.menu.style.left = x + 'px';
        this.menu.style.top = y + 'px';
        
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