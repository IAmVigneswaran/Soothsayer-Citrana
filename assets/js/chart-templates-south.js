/**
 * South Indian Chart Template Class
 * Handles South Indian chart layout and functionality
 */
class SouthIndianChartTemplate {
    constructor(stage, layer) {
        this.stage = stage;
        this.layer = layer;
        this.chartGroupSouth = null;
        this.houseDataSouth = {};
        this.lagnaHouseSouth = 1;
        this.firstHouseSouth = 1;
        this.selectedHouse = null; // Track selected house for highlight
        this.southIndianHouseOrder = null;
        
        if (stage && layer) {
            console.log('South Indian Chart Template initialized with stage and layer');
        }
    }

    getStage() {
        return this.stage;
    }

    getLayer() {
        return this.layer;
    }

    getChartGroup() {
        return this.chartGroupSouth;
    }

    getHouseData() {
        return this.houseDataSouth;
    }

    getDropZones() {
        return Object.keys(this.houseDataSouth);
    }

    createSouthIndianChart() {
        if (!this.stage || !this.layer) {
            console.error('Stage or layer not initialized');
            return;
        }

        this.clearChart();

        // Set Aries (house 1) as default Lagna
        this.lagnaHouseSouth = 1;

        // Create chart group
        this.chartGroupSouth = new Konva.Group({
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

        // Store the visual order for renumbering
        this.southIndianHouseOrder = positions.map(pos => pos.house);

        positions.forEach(pos => {
            this.createHouse(pos.x, pos.y, houseSize, houseSize, pos.house);
        });

        this.layer.add(this.chartGroupSouth);
        this.layer.batchDraw();

        // Zoom to fit
        this.zoomToFit();
        
        console.log('South Indian chart created');
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

        // Rashi (Zodiac signs) mapping
        const rashis = [
            '1', // Aries
            '2', // Taurus
            '3', // Gemini
            '4', // Cancer
            '5', // Leo
            '6', // Virgo
            '7', // Libra
            '8', // Scorpio
            '9', // Sagittarius
            '10', // Capricorn
            '11', // Aquarius
            '12'  // Pisces
        ];

        const rashiIndex = (houseNumber - 1) % 12;
        const rashiName = rashis[rashiIndex];

        // Create small rounded black box for Rashi
        const rashiNumberBoxSizeSouth = 20;
        const rashiNumberSouthBox = new Konva.Rect({
            x: x + width - rashiNumberBoxSizeSouth - 5,
            y: y + 5,
            width: rashiNumberBoxSizeSouth,
            height: rashiNumberBoxSizeSouth,
            fill: '#000000',
            cornerRadius: 4,
            name: `rashiNumberSouthBox-${houseNumber}`
        });

        // Create Rashi text (white text on black background)
        const rashiNumberSouthText = new Konva.Text({
            x: x + width - rashiNumberBoxSizeSouth - 5,
            y: y + 5,
            width: rashiNumberBoxSizeSouth,
            height: rashiNumberBoxSizeSouth,
            text: rashiName,
            fontSize: 10,
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fill: '#ffffff',
            align: 'center',
            verticalAlign: 'middle',
            name: `rashiNumberSouthText-${houseNumber}`
        });

        // Store house data
        this.houseDataSouth[houseNumber] = {
            x: x,
            y: y,
            width: width,
            height: height,
            planets: [],
            houseRectSouth: house,
            bhavaNumberSouthBox: null, // Initialize bhavaNumberSouthBox to null
            bhavaNumberSouthText: null, // Initialize bhavaNumberSouthText to null
            lagnaLinesSouth: null // Store Lagna indicator lines
        };

        // Add to chart group
        this.chartGroupSouth.add(house);
        this.chartGroupSouth.add(rashiNumberSouthBox);
        this.chartGroupSouth.add(rashiNumberSouthText);

        // Add duplicate Bhava number at bottom left
        const bhavaNumberSouthBox = new Konva.Rect({
            x: x + 5,
            y: y + height - rashiNumberBoxSizeSouth - 5,
            width: rashiNumberBoxSizeSouth,
            height: rashiNumberBoxSizeSouth,
            fill: '#145A32', // dark green
            cornerRadius: 4,
            name: `bhavaNumberSouthBox-${houseNumber}`
        });
        const bhavaNumberSouthText = new Konva.Text({
            x: x + 5,
            y: y + height - rashiNumberBoxSizeSouth - 5,
            width: rashiNumberBoxSizeSouth,
            height: rashiNumberBoxSizeSouth,
            text: houseNumber.toString(), // Will be updated by renumberHouses
            fontSize: 10,
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fill: '#ffffff', // white text for bhava
            align: 'center',
            verticalAlign: 'middle',
            name: `bhavaNumberSouthText-${houseNumber}`
        });
        this.chartGroupSouth.add(bhavaNumberSouthBox);
        this.chartGroupSouth.add(bhavaNumberSouthText);
        // Store references for later updates
        this.houseDataSouth[houseNumber].bhavaNumberSouthBox = bhavaNumberSouthBox;
        this.houseDataSouth[houseNumber].bhavaNumberSouthText = bhavaNumberSouthText;

        // Draw Lagna indicator lines if this is the Lagna house
        if (houseNumber === this.lagnaHouseSouth) {
            // Single diagonal line from top-left to a point near top and left sides
            const line = new Konva.Line({
                points: [x, y + 0, x + 0, y + height * 0.18, x + width * 0.18, y],
                stroke: '#374151', // Match grid color
                strokeWidth: 2,
                name: `lagna-line-${houseNumber}`
            });
            this.chartGroupSouth.add(line);
            this.houseDataSouth[houseNumber].lagnaLinesSouth = [line];
        }

        // Add right-click event for context menu
        house.on('contextmenu', (e) => {
            console.log('[DEBUG] South Indian Chart House right-clicked:', houseNumber);
            e.evt.preventDefault();
            this.highlightHouse(houseNumber);
            window.app.contextMenu.showHouseMenu(e.evt.clientX, e.evt.clientY, houseNumber);
        });
    }

    highlightHouse(houseNumber) {
        // Remove highlight from previous
        if (this.selectedHouse && this.houseDataSouth[this.selectedHouse]) {
            this.houseDataSouth[this.selectedHouse].houseRectSouth.fill('#ffffff');
        }
        // Highlight new
        if (this.houseDataSouth[houseNumber]) {
            this.houseDataSouth[houseNumber].houseRectSouth.fill('#f3f4f6'); // Tailwind gray-100
            this.selectedHouse = houseNumber;
            this.layer.batchDraw();
        }
    }

    clearHighlight() {
        if (this.selectedHouse && this.houseDataSouth[this.selectedHouse]) {
            this.houseDataSouth[this.selectedHouse].houseRectSouth.fill('#ffffff');
            this.selectedHouse = null;
            this.layer.batchDraw();
        }
    }

    addPlanetToHouse(planetAbbr, houseNumber) {
        const house = this.houseDataSouth[houseNumber];
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

        this.chartGroupSouth.add(planetText);
        this.layer.batchDraw();
    }

    setLagnaHouse(houseNumber) {
        console.log('[DEBUG] setLagnaHouse called with house number:', houseNumber);
        // Remove old Lagna indicator lines if present
        if (this.houseDataSouth[this.lagnaHouseSouth] && this.houseDataSouth[this.lagnaHouseSouth].lagnaLinesSouth) {
            this.houseDataSouth[this.lagnaHouseSouth].lagnaLinesSouth.forEach(line => line.destroy());
            this.houseDataSouth[this.lagnaHouseSouth].lagnaLinesSouth = null;
        }
        this.lagnaHouseSouth = houseNumber;
        this.renumberHouses();
        this.clearHighlight();
        // Add new Lagna indicator line
        if (this.houseDataSouth[houseNumber]) {
            const x = this.houseDataSouth[houseNumber].x;
            const y = this.houseDataSouth[houseNumber].y;
            const width = this.houseDataSouth[houseNumber].width;
            const height = this.houseDataSouth[houseNumber].height;
            const line = new Konva.Line({
                points: [x, y + 0, x + 0, y + height * 0.18, x + width * 0.18, y],
                stroke: '#374151', // Match grid color
                strokeWidth: 2,
                name: `lagna-line-${houseNumber}`
            });
            this.chartGroupSouth.add(line);
            this.houseDataSouth[houseNumber].lagnaLinesSouth = [line];
            this.layer.batchDraw();
        }
        console.log(`Lagna set to house ${houseNumber}`);
    }

    setFirstHouse(houseNumber) {
        this.firstHouseSouth = houseNumber;
        this.renumberHouses();
        console.log(`First house set to house ${houseNumber}`);
    }

    renumberHouses() {
        // Initialize debug array at the beginning
        const debugBhavas = [];
        
        // Visual order for South Indian chart (house numbers)
        const visualOrder = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
        let houseOrder;
        
        // Rotate visual order so Lagna is first
        const lagnaIdx = visualOrder.indexOf(this.lagnaHouseSouth);
        houseOrder = visualOrder.slice(lagnaIdx).concat(visualOrder.slice(0, lagnaIdx));
        
        const rashis = [
            '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'
        ];
        
        for (let i = 0; i < houseOrder.length; i++) {
            const houseNum = houseOrder[i];
            const bhavaNum = i + 1;
            
            // For South Indian chart, use the original logic
            const rashiIndex = (houseNum - 1) % 12;
            const rashiName = rashis[rashiIndex];
            
            debugBhavas.push({bhavaNum, houseNum, rashiName});
            
            // Update South Indian chart bhava numbers
            if (this.houseDataSouth[houseNum] && this.houseDataSouth[houseNum].bhavaNumberSouthText) {
                this.houseDataSouth[houseNum].bhavaNumberSouthText.text(bhavaNum.toString());
            }
        }
        
        this.layer.batchDraw();
        console.log('Bhava mapping:', debugBhavas);
        console.log('Houses renumbered');
    }

    clearChart() {
        if (this.chartGroupSouth) {
            this.chartGroupSouth.destroy();
            this.chartGroupSouth = null;
        }
        this.houseDataSouth = {};
        this.selectedHouse = null;
        
        // Reset stage scale and position
        if (this.stage) {
            this.stage.scale({ x: 1, y: 1 });
            this.stage.position({ x: 0, y: 0 });
            this.stage.batchDraw();
        }
        
        console.log('South Indian chart cleared');
    }

    zoomToFit() {
        if (!this.stage || !this.chartGroupSouth) return;

        const stageWidth = this.stage.width();
        const stageHeight = this.stage.height();
        const chartBounds = this.chartGroupSouth.getClientRect();

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
    }

    getChartData() {
        return {
            chartType: 'south-indian',
            lagnaHouse: this.lagnaHouseSouth,
            firstHouse: this.firstHouseSouth,
            houseData: this.houseDataSouth
        };
    }

    loadChartData(data) {
        if (!data || data.chartType !== 'south-indian') return;
        
        try {
            this.lagnaHouseSouth = data.lagnaHouse || 1;
            this.firstHouseSouth = data.firstHouse || 1;
            this.houseDataSouth = data.houseData || {};
            
            // Recreate the chart
            this.createSouthIndianChart();
            
            console.log('South Indian chart data loaded successfully');
        } catch (error) {
            console.error('Error loading South Indian chart data:', error);
        }
    }
} 