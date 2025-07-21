/**
 * Chart Templates Class
 * Handles South Indian and North Indian chart layouts
 */
class ChartTemplates {
    constructor(stage, layer) {
        this.stage = stage;
        this.layer = layer;
        this.chartGroup = null;
        this.currentChartType = null;
        this.houseData = {};
        this.lagnaHouse = 1;
        this.firstHouse = 1;
        
        if (stage && layer) {
            console.log('ChartTemplates initialized with stage and layer');
        }
    }

    getStage() {
        return this.stage;
    }

    getLayer() {
        return this.layer;
    }

    getChartGroup() {
        return this.chartGroup;
    }

    getHouseData() {
        return this.houseData;
    }

    getDropZones() {
        return Object.keys(this.houseData);
    }

    createSouthIndianChart() {
        if (!this.stage || !this.layer) {
            console.error('Stage or layer not initialized');
            return;
        }

        this.clearChart();
        this.currentChartType = 'south-indian';

        // Create chart group
        this.chartGroup = new Konva.Group({
            name: 'south-indian-chart'
        });

        const chartWidth = 600;
        const chartHeight = 600;
        const houseSize = 150;
        const startX = (this.stage.width() - chartWidth) / 2;
        const startY = (this.stage.height() - chartHeight) / 2;

        // Create 4x4 grid with center empty (South Indian layout)
        const positions = [
            // Top row (houses 12, 1, 2, 3)
            { x: startX, y: startY, house: 12 },
            { x: startX + houseSize, y: startY, house: 1 },
            { x: startX + houseSize * 2, y: startY, house: 2 },
            { x: startX + houseSize * 3, y: startY, house: 3 },
            // Second row (houses 11, empty, empty, 4)
            { x: startX, y: startY + houseSize, house: 11 },
            { x: startX + houseSize * 3, y: startY + houseSize, house: 4 },
            // Third row (houses 10, empty, empty, 5)
            { x: startX, y: startY + houseSize * 2, house: 10 },
            { x: startX + houseSize * 3, y: startY + houseSize * 2, house: 5 },
            // Bottom row (houses 9, 8, 7, 6)
            { x: startX, y: startY + houseSize * 3, house: 9 },
            { x: startX + houseSize, y: startY + houseSize * 3, house: 8 },
            { x: startX + houseSize * 2, y: startY + houseSize * 3, house: 7 },
            { x: startX + houseSize * 3, y: startY + houseSize * 3, house: 6 }
        ];

        positions.forEach(pos => {
            this.createHouse(pos.x, pos.y, houseSize, houseSize, pos.house);
        });

        this.layer.add(this.chartGroup);
        this.layer.batchDraw();

        // Zoom to fit
        this.zoomToFit();
        
        console.log('South Indian chart created');
    }

    createNorthIndianChart() {
        if (!this.stage || !this.layer) {
            console.error('Stage or layer not initialized');
            return;
        }

        this.clearChart();
        this.currentChartType = 'north-indian';

        // Create chart group
        this.chartGroup = new Konva.Group({
            name: 'north-indian-chart'
        });

        // House definitions based on SVG polygon coordinates
        const houseDefinitions = [
            // House 1 (Lagna) - Center diamond
            {
                number: 1,
                points: [239.28571, 1.19048, 120.23809, 120.23809, 239.28571, 239.28571, 358.33333, 120.23809],
                name: 'Lagna'
            },
            // House 2 (Dhan)
            {
                number: 2,
                points: [1.19048, 1.19048, 239.28571, 1.19048, 120.23809, 120.23809],
                name: 'Dhan'
            },
            // House 3 (Sahaj)
            {
                number: 3,
                points: [1.19048, 1.19048, 1.19048, 239.28571, 120.23809, 120.23809],
                name: 'Sahaj'
            },
            // House 4 (Bandhu)
            {
                number: 4,
                points: [120.23809, 120.23809, 1.19048, 239.28571, 120.23809, 358.33333, 239.28571, 239.28571],
                name: 'Bandhu'
            },
            // House 5 (Putra)
            {
                number: 5,
                points: [1.19048, 239.28571, 120.23809, 358.33333, 1.19048, 477.38095],
                name: 'Putra'
            },
            // House 6 (Ripu)
            {
                number: 6,
                points: [239.28571, 477.38095, 120.23809, 358.33333, 1.19048, 477.38095],
                name: 'Ripu'
            },
            // House 7 (Kalatra)
            {
                number: 7,
                points: [239.28571, 477.38095, 120.23809, 358.33333, 239.28571, 239.28571, 358.33333, 358.33333],
                name: 'Kalatra'
            },
            // House 8 (Mrit)
            {
                number: 8,
                points: [239.28571, 477.38095, 358.33333, 358.33333, 477.38095, 477.38095],
                name: 'Mrit'
            },
            // House 9 (Bhagya)
            {
                number: 9,
                points: [358.33333, 358.33333, 477.38095, 477.38095, 477.38095, 239.28571],
                name: 'Bhagya'
            },
            // House 10 (Karma)
            {
                number: 10,
                points: [358.33333, 358.33333, 477.38095, 239.28571, 358.33333, 120.23809, 239.28571, 239.28571],
                name: 'Karma'
            },
            // House 11 (Labha)
            {
                number: 11,
                points: [477.38095, 239.28571, 358.33333, 120.23809, 477.38095, 1.19048],
                name: 'Labha'
            },
            // House 12 (Vyaya)
            {
                number: 12,
                points: [358.33333, 120.23809, 477.38095, 1.19048, 239.28571, 1.19048],
                name: 'Vyaya'
            }
        ];

        houseDefinitions.forEach((houseDef) => {
            const houseNumber = houseDef.number;
            
            // Create house polygon
            const housePolygon = new Konva.Line({
                points: houseDef.points,
                stroke: '#374151',
                strokeWidth: 2,
                fill: '#ffffff',
                closed: true,
                lineJoin: 'round',
                lineCap: 'round',
                name: `house-${houseNumber}`
            });

            // Calculate center for house number text
            const centerX = houseDef.points.reduce((sum, val, index) => index % 2 === 0 ? sum + val : sum, 0) / (houseDef.points.length / 2);
            const centerY = houseDef.points.reduce((sum, val, index) => index % 2 === 1 ? sum + val : sum, 0) / (houseDef.points.length / 2);
            
            // Add house number text
            const houseText = new Konva.Text({
                x: centerX - 10,
                y: centerY - 8,
                text: houseNumber.toString(),
                fontSize: 14,
                fontFamily: 'Arial',
                fontWeight: 'bold',
                fill: '#374151',
                name: `house-text-${houseNumber}`
            });

            // Store house data
            this.houseData[houseNumber] = {
                x: centerX,
                y: centerY,
                width: 100, // Approximate for hit detection
                height: 100, // Approximate for hit detection
                planets: [],
                points: houseDef.points
            };

            // Add to chart group
            this.chartGroup.add(housePolygon);
            this.chartGroup.add(houseText);
            
            // Add right-click event for context menu
            housePolygon.on('contextmenu', (e) => {
                e.evt.preventDefault();
                window.app.contextMenu.showHouseMenu(e.evt.clientX, e.evt.clientY, houseNumber);
            });
        });

        this.layer.add(this.chartGroup);
        this.layer.batchDraw();

        // Zoom to fit
        this.zoomToFit();
        
        console.log('North Indian chart created');
    }

    createHouse(x, y, width, height, houseNumber) {
        // Create house rectangle
        const house = new Konva.Rect({
            x: x,
            y: y,
            width: width,
            height: height,
            stroke: '#374151',
            strokeWidth: 2,
            fill: '#ffffff',
            name: `house-${houseNumber}`
        });

        // Create house number text
        const numberText = new Konva.Text({
            x: x + width / 2 - 10,
            y: y + height / 2 - 10,
            text: houseNumber.toString(),
            fontSize: 16,
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fill: '#374151',
            name: `house-number-${houseNumber}`
        });

        // Store house data
        this.houseData[houseNumber] = {
            x: x,
            y: y,
            width: width,
            height: height,
            planets: []
        };

        // Add to chart group
        this.chartGroup.add(house);
        this.chartGroup.add(numberText);

        // Add right-click event for context menu
        house.on('contextmenu', (e) => {
            e.evt.preventDefault();
            window.app.contextMenu.showHouseMenu(e.evt.clientX, e.evt.clientY, houseNumber);
        });
    }

    addPlanetToHouse(planetAbbr, houseNumber) {
        const house = this.houseData[houseNumber];
        if (!house) return;

        // Add to house data
        if (!house.planets) {
            house.planets = [];
        }
        house.planets.push(planetAbbr);

        // Create planet text
        this.createPlanetText(planetAbbr, houseNumber, house);
        
        console.log(`Planet ${planetAbbr} added to house ${houseNumber}`);
    }

    createPlanetText(planetAbbr, houseNumber, house) {
        const planet = window.app.planetSystem.getPlanetInfo(planetAbbr);
        if (!planet) return;

        // Calculate position for planet text
        const existingPlanets = house.planets.filter(p => p === planetAbbr).length - 1;
        const offsetY = existingPlanets * 25;

        const planetText = new Konva.Text({
            x: house.x + house.width / 2 - 15,
            y: house.y + house.height / 2 - 10 + offsetY,
            text: planetAbbr,
            fontSize: 18,
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fill: planet.color,
            name: `planet-${planetAbbr}-${houseNumber}-${existingPlanets}`,
            draggable: true
        });

        // Add drag events
        planetText.on('dragstart', () => {
            planetText.opacity(0.5);
        });

        planetText.on('dragend', () => {
            planetText.opacity(1);
            this.layer.batchDraw();
        });

        this.chartGroup.add(planetText);
        this.layer.batchDraw();
    }

    setLagnaHouse(houseNumber) {
        this.lagnaHouse = houseNumber;
        this.renumberHouses();
        console.log(`Lagna set to house ${houseNumber}`);
    }

    setFirstHouse(houseNumber) {
        this.firstHouse = houseNumber;
        this.renumberHouses();
        console.log(`First house set to house ${houseNumber}`);
    }

    renumberHouses() {
        // Implement house renumbering logic
        console.log('Houses renumbered');
    }

    clearChart() {
        if (this.chartGroup) {
            this.chartGroup.destroy();
            this.chartGroup = null;
        }
        this.houseData = {};
        this.currentChartType = null;
        
        // Reset stage scale and position
        if (this.stage) {
            this.stage.scale({ x: 1, y: 1 });
            this.stage.position({ x: 0, y: 0 });
            this.stage.batchDraw();
        }
        
        console.log('Chart cleared');
    }

    zoomIn() {
        if (!this.stage) return;
        
        const newScale = this.stage.scaleX() * 1.2;
        this.stage.scale({ x: newScale, y: newScale });
        this.stage.batchDraw();
        this.updateZoomLevel();
    }

    zoomOut() {
        if (!this.stage) return;
        
        const newScale = this.stage.scaleX() / 1.2;
        this.stage.scale({ x: newScale, y: newScale });
        this.stage.batchDraw();
        this.updateZoomLevel();
    }

    zoomToFit() {
        if (!this.stage || !this.chartGroup) return;

        const stageWidth = this.stage.width();
        const stageHeight = this.stage.height();
        const chartBounds = this.chartGroup.getClientRect();

        const scaleX = (stageWidth * 0.8) / chartBounds.width;
        const scaleY = (stageHeight * 0.8) / chartBounds.height;
        const scale = Math.min(scaleX, scaleY, 2); // Max scale of 2

        this.stage.scale({ x: scale, y: scale });

        // Center the chart
        const chartCenter = {
            x: chartBounds.x + chartBounds.width / 2,
            y: chartBounds.y + chartBounds.height / 2
        };

        const stageCenter = {
            x: stageWidth / 2,
            y: stageHeight / 2
        };

        const newPos = {
            x: stageCenter.x - chartCenter.x * scale,
            y: stageCenter.y - chartCenter.y * scale
        };

        this.stage.position(newPos);
        this.stage.batchDraw();
        this.updateZoomLevel();
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
        return {
            chartType: this.currentChartType,
            lagnaHouse: this.lagnaHouse,
            firstHouse: this.firstHouse,
            houseData: this.houseData
        };
    }

    loadChartData(data) {
        if (!data) return;
        
        try {
            this.currentChartType = data.chartType;
            this.lagnaHouse = data.lagnaHouse || 1;
            this.firstHouse = data.firstHouse || 1;
            this.houseData = data.houseData || {};
            
            // Recreate the chart if we have a chart type
            if (this.currentChartType) {
                if (this.currentChartType === 'south-indian') {
                    this.createSouthIndianChart();
                } else if (this.currentChartType === 'north-indian') {
                    this.createNorthIndianChart();
                }
            }
            
            console.log('Chart data loaded successfully');
        } catch (error) {
            console.error('Error loading chart data:', error);
        }
    }
} 