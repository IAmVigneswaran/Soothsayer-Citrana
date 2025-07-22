/**
 * Chart Templates Class
 * Handles South Indian and North Indian chart layouts
 */
class ChartTemplates {
    constructor(stage, layer) {
        this.stage = stage;
        this.layer = layer;
        this.chartGroupSouth = null;
        this.chartGroupNorth = null;
        this.currentChartType = null;
        this.houseDataSouth = {};
        this.houseDataNorth = {};
        this.lagnaHouseSouth = 1;
        this.lagnaHouseNorth = 1;
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
        this.currentChartType = 'south-indian';

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

    createNorthIndianChart() {
        if (!this.stage || !this.layer) {
            console.error('Stage or layer not initialized');
            return;
        }

        this.clearChart();
        this.currentChartType = 'north-indian';

        // Create chart group
        this.chartGroupNorth = new Konva.Group({
            name: 'north-indian-chart'
        });

        // Create separate group for rashi number boxes to ensure they render on top
        this.tinyBoxGroupNorth = new Konva.Group({
            name: 'rashi-number-boxes-group-north'
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

        // Global offset for rashi number boxes - adjust these values to move all rashi number boxes
        const globalOffset = {
            x: 8,  // Adjust X offset (positive = right, negative = left)
            y: 8   // Adjust Y offset (positive = down, negative = up)
        };

        // Exact rashi number box positions from reference SVG - treated as individual elements
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
                    console.log(`[DEBUG] North Indian Chart House Polygon clicked: ${houseNumber}`);
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
            this.houseDataNorth[houseNumber] = {
                x: centerX,
                y: centerY,
                width: 100, // Approximate for hit detection
                height: 100, // Approximate for hit detection
                planets: [],
                points: houseDef.points,
                housePolygonNorth: housePolygon
            };

            // Add house polygon to chart group
            this.chartGroupNorth.add(housePolygon);
        });

        // Create rashi number boxes as individual elements with exact positions
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
            const rashiNumberBoxNorth = new Konva.Rect({
                x: position.x - tinyBoxSize/2,
                y: position.y - tinyBoxSize/2,
                width: tinyBoxSize,
                height: tinyBoxSize,
                fill: '#000000',
                cornerRadius: 4,
                name: `RashiNumberBoxNorth${houseNum}`
            });

            // Create Rashi text
            const rashiNumberTextNorth = new Konva.Text({
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
                name: `RashiNumberTextNorth${houseNum}`
            });

            // Add click event to rashi number box for debug
            rashiNumberBoxNorth.on('click', (e) => {
                e.evt.stopPropagation(); // Prevent event bubbling
                console.log(`[DEBUG] North Indian Rashi Number Box clicked - House: ${houseNum}, Rashi: ${rashiName}`);
                console.log(`[DEBUG] Rashi Number Box displays: ${rashiName}`);
                console.log(`[DEBUG] Current Lagna House: ${this.lagnaHouseNorth}`);
                console.log(`[DEBUG] Current First House: ${this.firstHouse}`);
                console.log(`[DEBUG] Click position: x=${e.evt.clientX}, y=${e.evt.clientY}`);
            });

            // Also add click event to text for better coverage
            rashiNumberTextNorth.on('click', (e) => {
                e.evt.stopPropagation(); // Prevent event bubbling
                console.log(`[DEBUG] North Indian Rashi Number Text clicked - House: ${houseNum}, Rashi: ${rashiName}`);
                console.log(`[DEBUG] Rashi Number Box displays: ${rashiName}`);
                console.log(`[DEBUG] Current Lagna House: ${this.lagnaHouseNorth}`);
                console.log(`[DEBUG] Current First House: ${this.firstHouse}`);
                console.log(`[DEBUG] Click position: x=${e.evt.clientX}, y=${e.evt.clientY}`);
            });

            // Add to rashi number box group
            this.tinyBoxGroupNorth.add(rashiNumberBoxNorth);
            this.tinyBoxGroupNorth.add(rashiNumberTextNorth);
        });

        // Add both groups to layer - rashi number boxes on top
        this.layer.add(this.chartGroupNorth);
        this.layer.add(this.tinyBoxGroupNorth);
        
        // Ensure rashi number boxes are on top by moving them to the end of the layer
        this.tinyBoxGroupNorth.moveToTop();
        this.layer.batchDraw();
        
        console.log('[DEBUG] North Indian chart created with clickable Rashi Number Boxes');

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
        const rashiNumberSouthBox = new Konva.Rect({
            x: x + width - rashiBoxSize - 5,
            y: y + 5,
            width: rashiBoxSize,
            height: rashiBoxSize,
            fill: '#000000',
            cornerRadius: 4,
            name: `rashiNumberSouthBox-${houseNumber}`
        });

        // Create Rashi text (white text on black background)
        const rashiNumberSouthText = new Konva.Text({
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
            y: y + height - rashiBoxSize - 5,
            width: rashiBoxSize,
            height: rashiBoxSize,
            fill: '#145A32', // dark green
            cornerRadius: 4,
            name: `bhavaNumberSouthBox-${houseNumber}`
        });
        const bhavaNumberSouthText = new Konva.Text({
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
            name: `bhavaNumberSouthText-${houseNumber}`
        });
        this.chartGroupSouth.add(bhavaNumberSouthBox);
        this.chartGroupSouth.add(bhavaNumberSouthText);
        // Store references for later updates
        this.houseDataSouth[houseNumber].bhavaNumberSouthBox = bhavaNumberSouthBox;
        this.houseDataSouth[houseNumber].bhavaNumberSouthText = bhavaNumberSouthText;

        // Draw Lagna indicator lines if this is the Lagna house and South Indian chart
        if (this.currentChartType === 'south-indian' && houseNumber === this.lagnaHouseSouth) {
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
            if (this.currentChartType === 'south-indian') {
                this.houseDataSouth[this.selectedHouse].houseRectSouth.fill('#ffffff');
            } else if (this.currentChartType === 'north-indian') {
                this.houseDataNorth[this.selectedHouse].housePolygonNorth.fill('#ffffff');
            }
        }
        // Highlight new
        if (this.houseDataSouth[houseNumber]) {
            if (this.currentChartType === 'south-indian') {
                this.houseDataSouth[houseNumber].houseRectSouth.fill('#f3f4f6'); // Tailwind gray-100
            } else if (this.currentChartType === 'north-indian') {
                this.houseDataNorth[houseNumber].housePolygonNorth.fill('#f3f4f6'); // Tailwind gray-100
            }
            this.selectedHouse = houseNumber;
            this.layer.batchDraw();
        }
    }

    clearHighlight() {
        if (this.selectedHouse && this.houseDataSouth[this.selectedHouse]) {
            if (this.currentChartType === 'south-indian') {
                this.houseDataSouth[this.selectedHouse].houseRectSouth.fill('#ffffff');
            } else if (this.currentChartType === 'north-indian') {
                this.houseDataNorth[this.selectedHouse].housePolygonNorth.fill('#ffffff');
            }
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
        // Remove old Lagna indicator lines if present (South Indian only)
        if (this.currentChartType === 'south-indian' && this.houseDataSouth[this.lagnaHouseSouth] && this.houseDataSouth[this.lagnaHouseSouth].lagnaLinesSouth) {
            this.houseDataSouth[this.lagnaHouseSouth].lagnaLinesSouth.forEach(line => line.destroy());
            this.houseDataSouth[this.lagnaHouseSouth].lagnaLinesSouth = null;
        }
        this.lagnaHouseSouth = houseNumber;
        this.renumberHouses();
        this.clearHighlight();
        // Add new Lagna indicator line
        if (this.currentChartType === 'south-indian' && this.houseDataSouth[houseNumber]) {
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
            const lagnaIdx = visualOrder.indexOf(this.lagnaHouseSouth);
            houseOrder = visualOrder.slice(lagnaIdx).concat(visualOrder.slice(0, lagnaIdx));
        } else if (this.currentChartType === 'north-indian') {
            // For North Indian chart, use the house data keys
            houseOrder = Object.keys(this.houseDataNorth).map(Number).sort((a, b) => a - b);
        } else if (this.southIndianHouseOrder) {
            houseOrder = this.southIndianHouseOrder;
        } else {
            houseOrder = Object.keys(this.houseDataSouth).map(Number).sort((a, b) => a - b);
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
                const rashiIndex = (houseNum - this.lagnaHouseNorth + 12) % 12;
                rashiName = rashis[rashiIndex];
            } else {
                // For South Indian chart, use the original logic
                const rashiIndex = (houseNum - 1) % 12;
                rashiName = rashis[rashiIndex];
            }
            
            debugBhavas.push({bhavaNum, houseNum, rashiName});
            
            // Update South Indian chart bhava numbers
            if (this.currentChartType === 'south-indian' && this.houseDataSouth[houseNum] && this.houseDataSouth[houseNum].bhavaNumberSouthText) {
                this.houseDataSouth[houseNum].bhavaNumberSouthText.text(bhavaNum.toString());
            }
            
            // Update North Indian chart Rashi numbers
            if (this.currentChartType === 'north-indian') {
                            // Find the rashi text in the rashi number box group
            const rashiText = this.tinyBoxGroupNorth?.findOne(`RashiNumberTextNorth${houseNum}`);
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
        if (this.chartGroupSouth) {
            this.chartGroupSouth.destroy();
            this.chartGroupSouth = null;
        }
        if (this.chartGroupNorth) {
            this.chartGroupNorth.destroy();
            this.chartGroupNorth = null;
        }
        if (this.tinyBoxGroupNorth) {
            this.tinyBoxGroupNorth.destroy();
            this.tinyBoxGroupNorth = null;
        }
        this.houseDataSouth = {};
        this.houseDataNorth = {};
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
        const chartGroup = this.currentChartType === 'south-indian' ? this.chartGroupSouth : this.chartGroupNorth;
        if (!this.stage || !chartGroup) return;

        const stageWidth = this.stage.width();
        const stageHeight = this.stage.height();
        const chartBounds = chartGroup.getClientRect();

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
            lagnaHouse: this.currentChartType === 'south-indian' ? this.lagnaHouseSouth : this.lagnaHouseNorth,
            firstHouse: this.firstHouse,
            houseData: this.currentChartType === 'south-indian' ? this.houseDataSouth : this.houseDataNorth
        };
    }

    loadChartData(data) {
        if (!data) return;
        
        try {
            this.currentChartType = data.chartType;
            if (data.chartType === 'south-indian') {
                this.lagnaHouseSouth = data.lagnaHouse || 1;
                this.houseDataSouth = data.houseData || {};
            } else if (data.chartType === 'north-indian') {
                this.lagnaHouseNorth = data.lagnaHouse || 1;
                this.houseDataNorth = data.houseData || {};
            }
            this.firstHouse = data.firstHouse || 1;
            
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