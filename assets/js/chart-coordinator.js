/**
 * chart-coordinator.js
 * Citrana • https://github.com/IAmVigneswaran/Soothsayer-Citrana 
 * © 2025 Vigneswaran Rajkumar • Licensed under MIT License
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

    stagePointerToChartCoords(pointer) {
        if (!this.stage || !pointer) return null;
        const scale = this.stage.scaleX();
        const stagePos = this.stage.position();
        return {
            x: (pointer.x - stagePos.x) / scale,
            y: (pointer.y - stagePos.y) / scale
        };
    }

    clientToChartCoords(clientX, clientY) {
        if (!this.stage) return null;
        const stageBox = this.stage.container().getBoundingClientRect();
        return this.stagePointerToChartCoords({
            x: clientX - stageBox.left,
            y: clientY - stageBox.top
        });
    }

    findHouseAtChartPoint(px, py) {
        if (this.currentChartType === 'south-indian') {
            return this.southIndianTemplate.findHouseAtChartPoint(px, py);
        } else if (this.currentChartType === 'north-indian') {
            return this.northIndianTemplate.findHouseAtChartPoint(px, py);
        }
        return null;
    }

    findHouseAtPointer(pointer) {
        const coords = this.stagePointerToChartCoords(pointer);
        if (!coords) return null;
        return this.findHouseAtChartPoint(coords.x, coords.y);
    }

    findHouseAtClientPoint(clientX, clientY) {
        const coords = this.clientToChartCoords(clientX, clientY);
        if (!coords) return null;
        return this.findHouseAtChartPoint(coords.x, coords.y);
    }

    /**
     * Resolve target bhava for Graha library drop or in-chart Graha drag end.
     * Pointer and client coords are converted for stage zoom/pan; chart-local fallback
     * uses coordinates already in chart space (e.g. dragged node position).
     */
    resolveDropHouse({ event = null, chartLocalX = null, chartLocalY = null } = {}) {
        if (!this.stage) return null;

        const pointer = this.stage.getPointerPosition();
        if (pointer) {
            const house = this.findHouseAtPointer(pointer);
            if (house) return house;
        }

        if (event?.evt) {
            const { clientX, clientY } = event.evt;
            if (clientX != null && clientY != null) {
                const house = this.findHouseAtClientPoint(clientX, clientY);
                if (house) return house;
            }
        }

        if (chartLocalX != null && chartLocalY != null) {
            return this.findHouseAtChartPoint(chartLocalX, chartLocalY);
        }

        return null;
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

    setLagnaHouse(houseNumber, options = {}) {
        citranaDebug('ChartCoordinator - setLagnaHouse called with house number:', houseNumber);
        citranaDebug('Current chart type:', this.currentChartType);

        if (this.currentChartType === 'south-indian') {
            citranaDebug('Delegating to South Indian template');
            this.southIndianTemplate.setLagnaHouse(houseNumber, options);
        } else if (this.currentChartType === 'north-indian') {
            citranaDebug('Delegating to North Indian template');
            this.northIndianTemplate.setLagnaHouse(houseNumber, options);
        } else {
            citranaDebug('ERROR: Unknown chart type:', this.currentChartType);
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
        }
    }

    zoomToFit() {
        citranaDebug('zoomToFit called, currentChartType:', this.currentChartType);

        // Check if chart groups exist to determine chart type
        if (this.southIndianTemplate && this.southIndianTemplate.chartGroupSouth) {
            citranaDebug('Using South Indian zoomToFit');
            this.southIndianTemplate.zoomToFit();
        } else if (this.northIndianTemplate && this.northIndianTemplate.chartGroupNorth) {
            citranaDebug('Using North Indian zoomToFit');
            this.northIndianTemplate.zoomToFit();
        } else if (this.stage) {
            citranaDebug('No chart groups found, using simple reset');
            this.stage.scale({
                x: 1,
                y: 1
            });
            this.stage.position({
                x: 0,
                y: 0
            });
            this.stage.batchDraw();
        }

        this.updateZoomLevel();
    }

    updateZoomLevel() {
        window.app?.updateZoomLevel();
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
            planetsByHouse: {}
        };
    }

    loadChartData(data) {
        if (!data) return;

        this.clearChart();

        if (!data.chartType) {
            return;
        }

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