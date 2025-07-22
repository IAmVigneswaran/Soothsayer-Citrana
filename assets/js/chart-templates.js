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
        this.selectedHouse = null; // Track selected house for highlight
        
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

        // Set Aries (house 1) as default Lagna
        this.lagnaHouse = 1;

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

        // Store the visual order for renumbering
        this.southIndianHouseOrder = positions.map(pos => pos.house);

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

        // Create separate group for tiny boxes to ensure they render on top
        this.tinyBoxGroup = new Konva.Group({
            name: 'tiny-boxes-group'
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

        // Global offset for tiny boxes - adjust these values to move all tiny boxes
        const globalOffset = {
            x: 8,  // Adjust X offset (positive = right, negative = left)
            y: 8   // Adjust Y offset (positive = down, negative = up)
        };

        // Exact tiny box positions from reference SVG - treated as individual elements
        // These positions are fixed and independent of house polygons
        const tinyBoxPositions = {
            1: { x: 230.8155 + globalOffset.x, y: 209.75027 + globalOffset.y }, // tanbhav - center diamond
            2: { x: 111.8155 + globalOffset.x, y: 87.72997 + globalOffset.y },  // dhanbhav - top left triangle
            3: { x: 90.53612 + globalOffset.x, y: 111.8155 + globalOffset.y },  // anujbhav - top left corner
            4: { x: 208.55092 + globalOffset.x, y: 230.8155 + globalOffset.y }, // maatabhav - left side
            5: { x: 252.67113 + globalOffset.x, y: 230.8155 + globalOffset.y }, // santanbhav - right side
            6: { x: 230.8155 + globalOffset.x, y: 254.56586 + globalOffset.y }, // rogbhav - bottom center
            7: { x: 90.53612 + globalOffset.x, y: 349.8655 + globalOffset.y },  // dampathyabhav - bottom left
            8: { x: 111.7655 + globalOffset.x, y: 373.90103 + globalOffset.y }, // aayubhav - bottom left corner
            9: { x: 349.8655 + globalOffset.x, y: 371.49796 + globalOffset.y }, // bhagyabhav - bottom right
            10: { x: 371.09488 + globalOffset.x, y: 349.8155 + globalOffset.y }, // karmabhav - bottom right corner
            11: { x: 371.09488 + globalOffset.x, y: 111.7655 + globalOffset.y }, // laabbhav - top right corner
            12: { x: 349.8155 + globalOffset.x, y: 90.13304 + globalOffset.y }   // karchbhav - top right
        };

        houseDefinitions.forEach((houseDef) => {
            const houseNumber = houseDef.number;
            
            // Create house polygon
            const housePolygon = new Konva.Line({
                points: houseDef.points,
                stroke: '#374151',
                strokeWidth: 2,
                fill: '#ffffff', // Ensure fill is white for hit detection
                closed: true,
                lineJoin: 'round',
                lineCap: 'round',
                name: `house-${houseNumber}`
            });

            // Make the polygon selectable by listening to click events
            housePolygon.on('mousedown', (e) => {
                this.highlightHouse(houseNumber);
                if (this.currentChartType === 'north-indian') {
                    console.log(`[DEBUG] North Indian chart house clicked: ${houseNumber}`);
                }
            });

            // Add right-click event for context menu
            housePolygon.on('contextmenu', (e) => {
                e.evt.preventDefault();
                this.highlightHouse(houseNumber);
                window.app.contextMenu.showHouseMenu(e.evt.clientX, e.evt.clientY, houseNumber);
            });

            // Store house data
            const centerX = houseDef.points.reduce((sum, val, index) => index % 2 === 0 ? sum + val : sum, 0) / (houseDef.points.length / 2);
            const centerY = houseDef.points.reduce((sum, val, index) => index % 2 === 1 ? sum + val : sum, 0) / (houseDef.points.length / 2);
            this.houseData[houseNumber] = {
                x: centerX,
                y: centerY,
                width: 100, // Approximate for hit detection
                height: 100, // Approximate for hit detection
                planets: [],
                points: houseDef.points,
                housePolygon: housePolygon
            };

            // Add house polygon to chart group
            this.chartGroup.add(housePolygon);
        });

        // Create tiny boxes as individual elements with exact positions
        const tinyBoxSize = 17; // Match the reference SVG size (16.95)
        const rashis = [
            '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'
        ];

        // Calculate correct Rashi numbers based on Lagna and First House
        const calculateRashiNumber = (houseNumber) => {
            // For North Indian chart, the house order is different from standard 1-12
            // Based on the North Indian layout, the correct house order is:
            // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] but with different Rashi mapping
            // For now, let's use the simple mapping: House N = Rashi N
            // This will be corrected by the renumberHouses() function later
            return houseNumber.toString();
        };

        Object.entries(tinyBoxPositions).forEach(([houseNumber, position]) => {
            const houseNum = parseInt(houseNumber);
            const rashiName = calculateRashiNumber(houseNum);

            // Create tiny black box
            const tinyBox = new Konva.Rect({
                x: position.x - tinyBoxSize/2,
                y: position.y - tinyBoxSize/2,
                width: tinyBoxSize,
                height: tinyBoxSize,
                fill: '#000000',
                cornerRadius: 4,
                name: `RashiBox${houseNum}`
                // Removed listening: false to make it clickable
            });

            // Create Rashi text
            const rashiText = new Konva.Text({
                x: position.x - tinyBoxSize/2,
                y: position.y - tinyBoxSize/2,
                width: tinyBoxSize,
                height: tinyBoxSize,
                text: rashiName,
                fontSize: 10,
                fontFamily: 'Arial',
                fontWeight: 'bold',
                fill: '#ffffff',
                align: 'center',
                verticalAlign: 'middle',
                name: `RashiText${houseNum}`
                // Removed listening: false to make it clickable
            });

            // Add click event to tiny box for debug
            tinyBox.on('click', (e) => {
                e.evt.stopPropagation(); // Prevent event bubbling
                console.log(`[DEBUG] Tiny box clicked - House: ${houseNum}, Rashi: ${rashiName}`);
                console.log(`[DEBUG] Tiny box number displayed: ${rashiName}`);
                console.log(`[DEBUG] Current Lagna: ${this.lagnaHouse}`);
                console.log(`[DEBUG] Current First House: ${this.firstHouse}`);
                console.log(`[DEBUG] Click position: x=${e.evt.clientX}, y=${e.evt.clientY}`);
            });

            // Also add click event to text for better coverage
            rashiText.on('click', (e) => {
                e.evt.stopPropagation(); // Prevent event bubbling
                console.log(`[DEBUG] Rashi text clicked - House: ${houseNum}, Rashi: ${rashiName}`);
                console.log(`[DEBUG] Tiny box number displayed: ${rashiName}`);
                console.log(`[DEBUG] Current Lagna: ${this.lagnaHouse}`);
                console.log(`[DEBUG] Current First House: ${this.firstHouse}`);
                console.log(`[DEBUG] Click position: x=${e.evt.clientX}, y=${e.evt.clientY}`);
            });

            // Add to tiny box group
            this.tinyBoxGroup.add(tinyBox);
            this.tinyBoxGroup.add(rashiText);
        });

        // Add both groups to layer - tiny boxes on top
        this.layer.add(this.chartGroup);
        this.layer.add(this.tinyBoxGroup);
        
        // Ensure tiny boxes are on top by moving them to the end of the layer
        this.tinyBoxGroup.moveToTop();
        this.layer.batchDraw();
        
        console.log('[DEBUG] North Indian chart created with clickable tiny boxes');

        // Call renumberHouses to set correct Rashi numbers based on Lagna and First House
        this.renumberHouses();

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
        const rashiBoxSize = 20;
        const rashiBox = new Konva.Rect({
            x: x + width - rashiBoxSize - 5,
            y: y + 5,
            width: rashiBoxSize,
            height: rashiBoxSize,
            fill: '#000000',
            cornerRadius: 4,
            name: `rashi-box-${houseNumber}`
        });

        // Create Rashi text (white text on black background)
        const rashiText = new Konva.Text({
            x: x + width - rashiBoxSize - 5,
            y: y + 5,
            width: rashiBoxSize,
            height: rashiBoxSize,
            text: rashiName,
            fontSize: 10,
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fill: '#ffffff',
            align: 'center',
            verticalAlign: 'middle',
            name: `rashi-${houseNumber}`
        });

        // Store house data
        this.houseData[houseNumber] = {
            x: x,
            y: y,
            width: width,
            height: height,
            planets: [],
            houseRect: house,
            bhavaBox: null, // Initialize bhavaBox to null
            bhavaText: null, // Initialize bhavaText to null
            lagnaLines: null // Store Lagna indicator lines
        };

        // Add to chart group
        this.chartGroup.add(house);
        this.chartGroup.add(rashiBox);
        this.chartGroup.add(rashiText);

        // Add duplicate Bhava number at bottom left
        const bhavaBoxBottomLeft = new Konva.Rect({
            x: x + 5,
            y: y + height - rashiBoxSize - 5,
            width: rashiBoxSize,
            height: rashiBoxSize,
            fill: '#145A32', // dark green
            cornerRadius: 4,
            name: `bhava-box-bottomleft-${houseNumber}`
        });
        const bhavaTextBottomLeft = new Konva.Text({
            x: x + 5,
            y: y + height - rashiBoxSize - 5,
            width: rashiBoxSize,
            height: rashiBoxSize,
            text: houseNumber.toString(), // Will be updated by renumberHouses
            fontSize: 10,
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fill: '#ffffff', // white text for bhava
            align: 'center',
            verticalAlign: 'middle',
            name: `bhava-bottomleft-${houseNumber}`
        });
        this.chartGroup.add(bhavaBoxBottomLeft);
        this.chartGroup.add(bhavaTextBottomLeft);
        // Store references for later updates
        this.houseData[houseNumber].bhavaBox = bhavaBoxBottomLeft;
        this.houseData[houseNumber].bhavaText = bhavaTextBottomLeft;

        // Draw Lagna indicator lines if this is the Lagna house and South Indian chart
        if (this.currentChartType === 'south-indian' && houseNumber === this.lagnaHouse) {
            // Single diagonal line from top-left to a point near top and left sides
            const line = new Konva.Line({
                points: [x, y + 0, x + 0, y + height * 0.18, x + width * 0.18, y],
                stroke: '#374151', // Match grid color
                strokeWidth: 2,
                name: `lagna-line-${houseNumber}`
            });
            this.chartGroup.add(line);
            this.houseData[houseNumber].lagnaLines = [line];
        }

        // Add right-click event for context menu
        house.on('contextmenu', (e) => {
            console.log('[DEBUG] House right-clicked:', houseNumber);
            e.evt.preventDefault();
            this.highlightHouse(houseNumber);
            window.app.contextMenu.showHouseMenu(e.evt.clientX, e.evt.clientY, houseNumber);
        });
    }

    highlightHouse(houseNumber) {
        // Remove highlight from previous
        if (this.selectedHouse && this.houseData[this.selectedHouse]) {
            if (this.currentChartType === 'south-indian') {
                this.houseData[this.selectedHouse].houseRect.fill('#ffffff');
            } else if (this.currentChartType === 'north-indian') {
                this.houseData[this.selectedHouse].housePolygon.fill('#ffffff');
            }
        }
        // Highlight new
        if (this.houseData[houseNumber]) {
            if (this.currentChartType === 'south-indian') {
                this.houseData[houseNumber].houseRect.fill('#f3f4f6'); // Tailwind gray-100
            } else if (this.currentChartType === 'north-indian') {
                this.houseData[houseNumber].housePolygon.fill('#f3f4f6'); // Tailwind gray-100
            }
            this.selectedHouse = houseNumber;
            this.layer.batchDraw();
        }
    }

    clearHighlight() {
        if (this.selectedHouse && this.houseData[this.selectedHouse]) {
            if (this.currentChartType === 'south-indian') {
                this.houseData[this.selectedHouse].houseRect.fill('#ffffff');
            } else if (this.currentChartType === 'north-indian') {
                this.houseData[this.selectedHouse].housePolygon.fill('#ffffff');
            }
            this.selectedHouse = null;
            this.layer.batchDraw();
        }
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
        console.log('[DEBUG] setLagnaHouse called with:', houseNumber);
        // Remove old Lagna indicator lines if present (South Indian only)
        if (this.currentChartType === 'south-indian' && this.houseData[this.lagnaHouse] && this.houseData[this.lagnaHouse].lagnaLines) {
            this.houseData[this.lagnaHouse].lagnaLines.forEach(line => line.destroy());
            this.houseData[this.lagnaHouse].lagnaLines = null;
        }
        this.lagnaHouse = houseNumber;
        this.renumberHouses();
        this.clearHighlight();
        // Add new Lagna indicator line
        if (this.currentChartType === 'south-indian' && this.houseData[houseNumber]) {
            const x = this.houseData[houseNumber].x;
            const y = this.houseData[houseNumber].y;
            const width = this.houseData[houseNumber].width;
            const height = this.houseData[houseNumber].height;
            const line = new Konva.Line({
                points: [x, y + 0, x + 0, y + height * 0.18, x + width * 0.18, y],
                stroke: '#374151', // Match grid color
                strokeWidth: 2,
                name: `lagna-line-${houseNumber}`
            });
            this.chartGroup.add(line);
            this.houseData[houseNumber].lagnaLines = [line];
            this.layer.batchDraw();
        }
        console.log(`Lagna set to house ${houseNumber}`);
    }

    setFirstHouse(houseNumber) {
        this.firstHouse = houseNumber;
        this.renumberHouses();
        console.log(`First house set to house ${houseNumber}`);
    }

    renumberHouses() {
        // Visual order for South Indian chart (house numbers)
        const visualOrder = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
        let houseOrder;
        if (this.currentChartType === 'south-indian') {
            // Rotate visual order so Lagna is first
            const lagnaIdx = visualOrder.indexOf(this.lagnaHouse);
            houseOrder = visualOrder.slice(lagnaIdx).concat(visualOrder.slice(0, lagnaIdx));
        } else if (this.southIndianHouseOrder) {
            houseOrder = this.southIndianHouseOrder;
        } else {
            houseOrder = Object.keys(this.houseData).map(Number).sort((a, b) => a - b);
        }
        const rashis = [
            '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'
        ];
        const debugBhavas = [];
        for (let i = 0; i < houseOrder.length; i++) {
            const houseNum = houseOrder[i];
            const bhavaNum = i + 1;
            
            // Calculate Rashi number based on chart type
            let rashiName;
            if (this.currentChartType === 'north-indian') {
                // For North Indian chart, Rashi number is based on the house position relative to Lagna
                // House 1 (Lagna) = Rashi 1, House 2 = Rashi 2, etc.
                const rashiIndex = (houseNum - this.lagnaHouse + 12) % 12;
                rashiName = rashis[rashiIndex];
            } else {
                // For South Indian chart, use the original logic
                const rashiIndex = (houseNum - 1) % 12;
                rashiName = rashis[rashiIndex];
            }
            
            debugBhavas.push({bhavaNum, houseNum, rashiName});
            
            // Update South Indian chart bhava numbers
            if (this.currentChartType === 'south-indian' && this.houseData[houseNum] && this.houseData[houseNum].bhavaText) {
                this.houseData[houseNum].bhavaText.text(bhavaNum.toString());
            }
            
            // Update North Indian chart Rashi numbers
            if (this.currentChartType === 'north-indian') {
                // Find the rashi text in the tiny box group
                const rashiText = this.tinyBoxGroup?.findOne(`RashiText${houseNum}`);
                if (rashiText) {
                    rashiText.text(rashiName);
                }
            }
        }
        this.layer.batchDraw();
        console.log('Bhava mapping:', debugBhavas);
        console.log('Houses renumbered');
    }

    clearChart() {
        if (this.chartGroup) {
            this.chartGroup.destroy();
            this.chartGroup = null;
        }
        this.houseData = {};
        this.currentChartType = null;
        // Do NOT reset this.southIndianHouseOrder here
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