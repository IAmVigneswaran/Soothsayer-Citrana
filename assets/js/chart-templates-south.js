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
        // Add click event for selection
        house.on('click', (e) => {
            this.highlightHouse(houseNumber);
            window.selectedBhavaSouth = houseNumber;
            console.log('[SELECT] South Indian Chart House selected:', houseNumber);
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

    // --- Robust Planet Management ---
    addPlanetToHouse(planetAbbr, houseNumber, label = null, id = null) {
        const house = this.houseDataSouth[houseNumber];
        if (!house) return;
        if (!house.planets) house.planets = [];
        // Use unique ID for each planet instance
        const planetId = id || (Date.now().toString(36) + Math.random().toString(36).substr(2, 5));
        house.planets.push({ abbr: planetAbbr, label: label || planetAbbr, id: planetId });
        this.updatePlanetsInHouse(houseNumber);
        if (window.app && window.app.pushSnapshot) window.app.pushSnapshot();
        console.log(`[ADD] Planet ${planetAbbr} (id=${planetId}) added to house ${houseNumber}`);
    }

    removePlanetFromHouseById(houseNumber, planetId) {
        const house = this.houseDataSouth[houseNumber];
        if (!house || !house.planets) return;
        house.planets = house.planets.filter((planet) => planet.id !== planetId);
        this.updatePlanetsInHouse(houseNumber);
        this.layer.batchDraw();
        this.clearSelectedPlanet();
        if (window.app && window.app.pushSnapshot) window.app.pushSnapshot();
    }

    renamePlanetInHouseById(houseNumber, planetId, newLabel) {
        const house = this.houseDataSouth[houseNumber];
        if (!house || !house.planets) return;
        const planet = house.planets.find((p) => p.id === planetId);
        if (planet) planet.label = newLabel;
        this.updatePlanetsInHouse(houseNumber);
        this.layer.batchDraw();
    }

    updatePlanetsInHouse(houseNumber) {
        const house = this.houseDataSouth[houseNumber];
        if (!house) return;
        // Remove all existing planet texts for this house
        this.chartGroupSouth.getChildren(node => node.name() && node.name().startsWith(`planet-`) && node.name().includes(`-${houseNumber}-`)).forEach(node => node.destroy());
        // Calculate font size based on number of planets
        const n = house.planets.length;
        const BASE_FONT = 24;
        const MIN_FONT = 14;
        const STEP = 4;
        const fontSize = Math.max(MIN_FONT, BASE_FONT - (n-1)*STEP);
        // Perfectly center all planet texts both horizontally and vertically in the house
        const totalHeight = n * fontSize + (n-1) * 4;
        const startY = house.y + house.height/2 - totalHeight/2;
        house.planets.forEach((planetObj, i) => {
            const planet = window.app.planetSystem.getPlanetInfo(planetObj.abbr);
            const planetY = startY + i * (fontSize + 4);
            
            // Add a transparent rectangle for easier hit area
            const hitRect = new Konva.Rect({
                x: house.x + house.width/2 - fontSize,
                y: planetY - fontSize/2,
                width: fontSize * 2,
                height: fontSize,
                fill: 'rgba(0,0,0,0)',
                name: `planet-hit-${planetObj.id}`,
                listening: true
            });
            // The planet text - perfectly centered
            const planetText = new Konva.Text({
                x: house.x + house.width/2,
                y: planetY,
                text: planetObj.label,
                fontSize: fontSize,
                fontFamily: 'Arial Black, Arial, sans-serif',
                fontWeight: 'bold',
                fill: planet ? planet.color : '#000',
                name: `planet-${planetObj.abbr}-${houseNumber}-${planetObj.id}`,
                draggable: true,
                align: 'center',
                verticalAlign: 'middle',
                offsetX: fontSize/2,
                offsetY: fontSize/2,
            });

            // Make planet text editable with live preview
            if (window.app && window.app.drawingTools) {
                window.app.drawingTools.makePlanetTextEditable(planetText, (newLabel) => {
                    // Update the planet label in the house data
                    const planetIndex = house.planets.findIndex(p => p.id === planetObj.id);
                    if (planetIndex !== -1) {
                        house.planets[planetIndex].label = newLabel;
                        // Update the planet text
                        planetText.text(newLabel);
                        this.layer.batchDraw();
                        // Trigger snapshot for undo/redo
                        if (window.app && window.app.pushSnapshot) {
                            window.app.pushSnapshot();
                        }
                    }
                });
            }
            // Selection logic
            const selectHandler = (e) => {
                e.cancelBubble = true;
                this.selectPlanet(planetText, houseNumber, planetObj.abbr, planetObj.id);
            };
            hitRect.on('click', selectHandler);
            planetText.on('click', selectHandler);
            // Right-click context menu
            const contextHandler = (e) => {
                e.evt.preventDefault();
                this.selectPlanet(planetText, houseNumber, planetObj.abbr, planetObj.id);
                window.app.contextMenu.showPlanetMenu(e.evt.clientX, e.evt.clientY, houseNumber, planetObj.abbr, planetObj.id);
            };
            hitRect.on('contextmenu', contextHandler);
            planetText.on('contextmenu', contextHandler);
            // Drag-and-drop between bhavas
            planetText.on('dragstart', (e) => {
                this._dragSource = { houseNumber, abbr: planetObj.abbr, id: planetObj.id, label: planetObj.label };
                planetText.opacity(0.5);
                planetText.moveToTop();
                hitRect.moveToTop();
                this.layer.batchDraw();
                console.log(`[DRAGSTART] Planet ${planetObj.abbr} (id=${planetObj.id}) from house ${houseNumber}`);
            });
            planetText.on('dragend', (e) => {
                planetText.opacity(1);
                // Find which bhava (if any) the drop is over
                const pointer = this.stage.getPointerPosition();
                let targetHouse = null;
                for (const hNum in this.houseDataSouth) {
                    const h = this.houseDataSouth[hNum];
                    if (
                        pointer.x >= h.x && pointer.x <= h.x + h.width &&
                        pointer.y >= h.y && pointer.y <= h.y + h.height
                    ) {
                        targetHouse = parseInt(hNum);
                        break;
                    }
                }
                if (targetHouse && targetHouse !== houseNumber) {
                    // Move planet to new bhava by ID
                    this.removePlanetFromHouseById(houseNumber, planetObj.id);
                    this.addPlanetToHouse(planetObj.abbr, targetHouse, planetObj.label, planetObj.id);
                    this.updatePlanetsInHouse(targetHouse);
                    console.log(`[DROP] Planet ${planetObj.abbr} (id=${planetObj.id}) moved to house ${targetHouse}`);
                } else {
                    // Snap back to original position
                    this.updatePlanetsInHouse(houseNumber);
                    console.log(`[SNAPBACK] Planet ${planetObj.abbr} (id=${planetObj.id})`);
                }
                this._dragSource = null;
                this.layer.batchDraw();
            });
            this.chartGroupSouth.add(hitRect);
            this.chartGroupSouth.add(planetText);
            hitRect.moveToTop();
            planetText.moveToTop();
        });
        this.layer.batchDraw();
    }

    // --- Selection and Keyboard Delete ---
    selectPlanet(planetText, houseNumber, abbr, id) {
        this.clearSelectedPlanet();
        this.selectedPlanet = { planetText, houseNumber, abbr, id };
        planetText.stroke('#f59e42');
        planetText.strokeWidth(2);
        this.layer.batchDraw();
        if (!this._deleteKeyListener) {
            this._deleteKeyListener = (e) => {
                            if (e.key === 'Delete' && this.selectedPlanet) {
                this.removePlanetFromHouseById(this.selectedPlanet.houseNumber, this.selectedPlanet.id);
            }
            };
            window.addEventListener('keydown', this._deleteKeyListener);
        }
    }
    clearSelectedPlanet() {
        if (this.selectedPlanet && this.selectedPlanet.planetText) {
            this.selectedPlanet.planetText.strokeEnabled(false);
            this.selectedPlanet.planetText.strokeWidth(0);
        }
        this.selectedPlanet = null;
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
        if (window.app && window.app.pushSnapshot) window.app.pushSnapshot();
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

    clearAllPlanets() {
        for (const houseNum in this.houseDataSouth) {
            this.houseDataSouth[houseNum].planets = [];
            this.updatePlanetsInHouse(houseNum);
        }
        this.layer.batchDraw();
        console.log('All planets cleared from South Indian chart');
    }
} 