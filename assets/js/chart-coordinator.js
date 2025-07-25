/**
 * Chart Coordinator Class
 * Coordinates between South Indian and North Indian chart templates
 */
class ChartCoordinator {
    constructor(stage, layer) {
        this.stage = stage;
        this.layer = layer;
        this.currentChartType = null;
        
        // Initialize separate chart template instances
        this.southIndianTemplate = new SouthIndianChartTemplate(stage, layer);
        this.northIndianTemplate = new NorthIndianChartTemplate(stage, layer);
        
        if (stage && layer) {
            console.log('ChartCoordinator initialized with stage and layer');
        }
    }

    getStage() {
        return this.stage;
    }

    getLayer() {
        return this.layer;
    }

    getChartGroup() {
        if (this.currentChartType === 'south-indian') {
            return this.southIndianTemplate.getChartGroup();
        } else if (this.currentChartType === 'north-indian') {
            return this.northIndianTemplate.getChartGroup();
        }
        return null;
    }

    getHouseData() {
        if (this.currentChartType === 'south-indian') {
            return this.southIndianTemplate.getHouseData();
        } else if (this.currentChartType === 'north-indian') {
            return this.northIndianTemplate.getHouseData();
        }
        return {};
    }

    getDropZones() {
        if (this.currentChartType === 'south-indian') {
            return this.southIndianTemplate.getDropZones();
        } else if (this.currentChartType === 'north-indian') {
            return this.northIndianTemplate.getDropZones();
        }
        return [];
    }

    createSouthIndianChart() {
        this.clearChart();
        this.currentChartType = 'south-indian';
        this.southIndianTemplate.createSouthIndianChart();
    }

    createNorthIndianChart() {
        this.clearChart();
        this.currentChartType = 'north-indian';
        this.northIndianTemplate.createNorthIndianChart();
    }

    highlightHouse(houseNumber) {
        if (this.currentChartType === 'south-indian') {
            this.southIndianTemplate.highlightHouse(houseNumber);
        } else if (this.currentChartType === 'north-indian') {
            this.northIndianTemplate.highlightHouse(houseNumber);
        }
    }

    clearHighlight() {
        if (this.currentChartType === 'south-indian') {
            this.southIndianTemplate.clearHighlight();
        } else if (this.currentChartType === 'north-indian') {
            this.northIndianTemplate.clearHighlight();
        }
    }

    addPlanetToHouse(planetAbbr, houseNumber, label = null, id = null) {
        if (this.currentChartType === 'south-indian') {
            this.southIndianTemplate.addPlanetToHouse(planetAbbr, houseNumber, label, id);
        } else if (this.currentChartType === 'north-indian') {
            this.northIndianTemplate.addPlanetToHouse(planetAbbr, houseNumber, label, id);
        }
    }

    setLagnaHouse(houseNumber) {
        console.log('[DEBUG] ChartCoordinator - setLagnaHouse called with house number:', houseNumber);
        console.log('[DEBUG] Current chart type:', this.currentChartType);
        
        if (this.currentChartType === 'south-indian') {
            console.log('[DEBUG] Delegating to South Indian template');
            this.southIndianTemplate.setLagnaHouse(houseNumber);
        } else if (this.currentChartType === 'north-indian') {
            console.log('[DEBUG] Delegating to North Indian template');
            this.northIndianTemplate.setLagnaHouse(houseNumber);
        } else {
            console.log('[DEBUG] ERROR: Unknown chart type:', this.currentChartType);
        }
    }

    setFirstHouse(houseNumber) {
        if (this.currentChartType === 'south-indian') {
            this.southIndianTemplate.setFirstHouse(houseNumber);
        } else if (this.currentChartType === 'north-indian') {
            this.northIndianTemplate.setFirstHouse(houseNumber);
        }
    }

    renumberHouses() {
        if (this.currentChartType === 'south-indian') {
            this.southIndianTemplate.renumberHouses();
        } else if (this.currentChartType === 'north-indian') {
            this.northIndianTemplate.renumberHouses();
        }
    }

    clearChart() {
        this.southIndianTemplate.clearChart();
        this.northIndianTemplate.clearChart();
        this.currentChartType = null;
    }

    zoomIn() {
        if (!this.stage) return;
        
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
            
        this.stage.scale({ x: newScale, y: newScale });
            
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
        if (!this.stage) return;
        
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
            
        this.stage.scale({ x: newScale, y: newScale });
            
            const newPos = {
                x: stageCenter.x - mousePointTo.x * newScale,
                y: stageCenter.y - mousePointTo.y * newScale
            };
            this.stage.position(newPos);
        this.stage.batchDraw();
        this.updateZoomLevel();
        }
    }

    zoomToFit() {
        console.log('[DEBUG] zoomToFit called, currentChartType:', this.currentChartType);
        
        // Check if chart groups exist to determine chart type
        if (this.southIndianTemplate && this.southIndianTemplate.chartGroupSouth) {
            console.log('[DEBUG] Using South Indian zoomToFit');
            this.southIndianTemplate.zoomToFit();
        } else if (this.northIndianTemplate && this.northIndianTemplate.chartGroupNorth) {
            console.log('[DEBUG] Using North Indian zoomToFit');
            this.northIndianTemplate.zoomToFit();
        } else {
            console.log('[DEBUG] No chart groups found, using simple reset');
            // Fallback to simple reset
            if (this.stage) {
                this.stage.scale({ x: 1, y: 1 });
                this.stage.position({ x: 0, y: 0 });
                this.stage.batchDraw();
                this.updateZoomLevel();
            }
        }
    }

    updateZoomLevel() {
        if (!this.stage) return;
        
        const zoomPercent = Math.round(this.stage.scaleX() * 100);
        const zoomLevel = document.getElementById('zoom-level');
        if (zoomLevel) {
            zoomLevel.textContent = `${zoomPercent}%`;
        }
    }

    getChartData() {
        if (this.currentChartType === 'south-indian') {
            return this.southIndianTemplate.getChartData();
        } else if (this.currentChartType === 'north-indian') {
            return this.northIndianTemplate.getChartData();
        }
        return {
            chartType: null,
            lagnaHouse: 1,
            firstHouse: 1,
            houseData: {}
        };
    }

    loadChartData(data) {
        if (!data) return;
        
        try {
            this.currentChartType = data.chartType;
            
            if (data.chartType === 'south-indian') {
                this.southIndianTemplate.loadChartData(data);
            } else if (data.chartType === 'north-indian') {
                this.northIndianTemplate.loadChartData(data);
            }
            
            console.log('Chart data loaded successfully');
        } catch (error) {
            console.error('Error loading chart data:', error);
        }
    }

    clearAllPlanets() {
        if (this.currentChartType === 'south-indian') {
            this.southIndianTemplate.clearAllPlanets();
        } else if (this.currentChartType === 'north-indian') {
            this.northIndianTemplate.clearAllPlanets();
        }
    }
} 