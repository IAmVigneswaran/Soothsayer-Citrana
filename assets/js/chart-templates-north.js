/**
 * North Indian Chart Template Class
 * Handles North Indian chart layout and functionality
 */
class NorthIndianChartTemplate {
    constructor(stage, layer) {
        this.stage = stage;
        this.layer = layer;
        this.chartGroupNorth = null;
        this.tinyBoxGroupNorth = null;
        this.houseDataNorth = {};
        this.lagnaHouseNorth = 1;
        this.firstHouseNorth = 1;
        this.selectedHouse = null; // Track selected house for highlight
        
        if (stage && layer) {
            console.log('North Indian Chart Template initialized with stage and layer');
        }
    }

    getStage() {
        return this.stage;
    }

    getLayer() {
        return this.layer;
    }

    getChartGroup() {
        return this.chartGroupNorth;
    }

    getHouseData() {
        return this.houseDataNorth;
    }

    getDropZones() {
        return Object.keys(this.houseDataNorth);
    }

    createNorthIndianChart() {
        if (!this.stage || !this.layer) {
            console.error('Stage or layer not initialized');
            return;
        }

        this.clearChart();

        // Create chart group
        this.chartGroupNorth = new Konva.Group({
            name: 'north-indian-chart'
        });

        // Create separate group for rashi number boxes to ensure they render on top
        this.tinyBoxGroupNorth = new Konva.Group({
            name: 'rashi-number-boxes-group-north'
        });

        // House definitions based on SVG polygon coordinates
        const houseDefinitionsNorth = [
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
        const globalOffsetNorth = {
            x: 8,  // Adjust X offset (positive = right, negative = left)
            y: 8   // Adjust Y offset (positive = down, negative = up)
        };

        // Exact rashi number box positions from reference SVG - treated as individual elements
        // These positions are fixed and independent of house polygons
        const tinyBoxPositionsNorth = {
            1: { x: 230.8155 + globalOffsetNorth.x, y: 209.75027 + globalOffsetNorth.y }, // tanbhav - center diamond
            2: { x: 111.8155 + globalOffsetNorth.x, y: 87.72997 + globalOffsetNorth.y },  // dhanbhav - top left triangle
            3: { x: 90.53612 + globalOffsetNorth.x, y: 111.8155 + globalOffsetNorth.y },  // anujbhav - top left corner
            4: { x: 208.55092 + globalOffsetNorth.x, y: 230.8155 + globalOffsetNorth.y }, // maatabhav - left side
            5: { x: 252.67113 + globalOffsetNorth.x, y: 230.8155 + globalOffsetNorth.y }, // santanbhav - right side
            6: { x: 230.8155 + globalOffsetNorth.x, y: 254.56586 + globalOffsetNorth.y }, // rogbhav - bottom center
            7: { x: 90.53612 + globalOffsetNorth.x, y: 349.8655 + globalOffsetNorth.y },  // dampathyabhav - bottom left
            8: { x: 111.7655 + globalOffsetNorth.x, y: 373.90103 + globalOffsetNorth.y }, // aayubhav - bottom left corner
            9: { x: 349.8655 + globalOffsetNorth.x, y: 371.49796 + globalOffsetNorth.y }, // bhagyabhav - bottom right
            10: { x: 371.09488 + globalOffsetNorth.x, y: 349.8155 + globalOffsetNorth.y }, // karmabhav - bottom right corner
            11: { x: 371.09488 + globalOffsetNorth.x, y: 111.7655 + globalOffsetNorth.y }, // laabbhav - top right corner
            12: { x: 349.8155 + globalOffsetNorth.x, y: 90.13304 + globalOffsetNorth.y }   // karchbhav - top right
        };

        houseDefinitionsNorth.forEach((houseDefNorth) => {
            const houseNumberNorth = houseDefNorth.number;
            
            // Create house polygon
            const housePolygonNorth = new Konva.Line({
                points: houseDefNorth.points,
                stroke: '#374151',
                strokeWidth: 2,
                fill: '#ffffff', // Ensure fill is white for hit detection
                closed: true,
                lineJoin: 'round',
                lineCap: 'round',
                name: `house-${houseNumberNorth}`
            });

            // Make the polygon selectable by listening to click events
            housePolygonNorth.on('mousedown', (e) => {
                this.highlightHouse(houseNumberNorth);
                console.log(`[DEBUG] North Indian Chart House Polygon clicked: ${houseNumberNorth}`);
            });

            // Add right-click event for context menu
            housePolygonNorth.on('contextmenu', (e) => {
                e.evt.preventDefault();
                this.highlightHouse(houseNumberNorth);
                window.app.contextMenu.showHouseMenu(e.evt.clientX, e.evt.clientY, houseNumberNorth);
            });

            // Store house data
            const centerXNorth = houseDefNorth.points.reduce((sum, val, index) => index % 2 === 0 ? sum + val : sum, 0) / (houseDefNorth.points.length / 2);
            const centerYNorth = houseDefNorth.points.reduce((sum, val, index) => index % 2 === 1 ? sum + val : sum, 0) / (houseDefNorth.points.length / 2);
            this.houseDataNorth[houseNumberNorth] = {
                x: centerXNorth,
                y: centerYNorth,
                width: 100, // Approximate for hit detection
                height: 100, // Approximate for hit detection
                planets: [],
                points: houseDefNorth.points,
                housePolygonNorth: housePolygonNorth
            };

            // Add house polygon to chart group
            this.chartGroupNorth.add(housePolygonNorth);
        });

        // Create rashi number boxes as individual elements with exact positions
        const rashiNumberBoxSizeNorth = 17; // Match the reference SVG size (16.95)
        const rashis = [
            '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'
        ];

        // Calculate correct Rashi numbers based on Lagna and First House
        const calculateRashiNumberNorth = (houseNumberNorth) => {
            // For North Indian chart, the house order is different from standard 1-12
            // Based on the North Indian layout, the correct house order is:
            // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] but with different Rashi mapping
            // For now, let's use the simple mapping: House N = Rashi N
            // This will be corrected by the renumberHouses() function later
            return houseNumberNorth.toString();
        };

        Object.entries(tinyBoxPositionsNorth).forEach(([houseNumberNorth, positionNorth]) => {
            const houseNumNorth = parseInt(houseNumberNorth);
            const rashiNameNorth = calculateRashiNumberNorth(houseNumNorth);

            // Create rashi number box
            const rashiNumberBoxNorth = new Konva.Rect({
                x: positionNorth.x - rashiNumberBoxSizeNorth/2,
                y: positionNorth.y - rashiNumberBoxSizeNorth/2,
                width: rashiNumberBoxSizeNorth,
                height: rashiNumberBoxSizeNorth,
                fill: '#000000',
                cornerRadius: 4,
                name: `RashiNumberBoxNorth${houseNumNorth}`
            });

            // Create Rashi text
            const rashiNumberTextNorth = new Konva.Text({
                x: positionNorth.x - rashiNumberBoxSizeNorth/2,
                y: positionNorth.y - rashiNumberBoxSizeNorth/2,
                width: rashiNumberBoxSizeNorth,
                height: rashiNumberBoxSizeNorth,
                text: rashiNameNorth,
                fontSize: 10,
                fontFamily: 'Arial',
                fontWeight: 'bold',
                fill: '#ffffff',
                align: 'center',
                verticalAlign: 'middle',
                name: `RashiNumberTextNorth${houseNumNorth}`
            });

            // Add click event to rashi number box for debug
            rashiNumberBoxNorth.on('click', (e) => {
                e.evt.stopPropagation(); // Prevent event bubbling
                console.log(`[DEBUG] North Indian Rashi Number Box clicked - House: ${houseNumNorth}, Rashi: ${rashiNameNorth}`);
                console.log(`[DEBUG] Rashi Number Box displays: ${rashiNameNorth}`);
                console.log(`[DEBUG] Current Lagna House: ${this.lagnaHouseNorth}`);
                console.log(`[DEBUG] Current First House: ${this.firstHouseNorth}`);
                console.log(`[DEBUG] Click position: x=${e.evt.clientX}, y=${e.evt.clientY}`);
            });

            // Also add click event to text for better coverage
            rashiNumberTextNorth.on('click', (e) => {
                e.evt.stopPropagation(); // Prevent event bubbling
                console.log(`[DEBUG] North Indian Rashi Number Text clicked - House: ${houseNumNorth}, Rashi: ${rashiNameNorth}`);
                console.log(`[DEBUG] Rashi Number Box displays: ${rashiNameNorth}`);
                console.log(`[DEBUG] Current Lagna House: ${this.lagnaHouseNorth}`);
                console.log(`[DEBUG] Current First House: ${this.firstHouseNorth}`);
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

    highlightHouse(houseNumber) {
        // Remove highlight from previous
        if (this.selectedHouse && this.houseDataNorth[this.selectedHouse]) {
            this.houseDataNorth[this.selectedHouse].housePolygonNorth.fill('#ffffff');
        }
        // Highlight new
        if (this.houseDataNorth[houseNumber]) {
            this.houseDataNorth[houseNumber].housePolygonNorth.fill('#f3f4f6'); // Tailwind gray-100
            this.selectedHouse = houseNumber;
            this.layer.batchDraw();
        }
    }

    clearHighlight() {
        if (this.selectedHouse && this.houseDataNorth[this.selectedHouse]) {
            this.houseDataNorth[this.selectedHouse].housePolygonNorth.fill('#ffffff');
            this.selectedHouse = null;
            this.layer.batchDraw();
        }
    }

    setLagnaHouse(houseNumber) {
        console.log('[DEBUG] setLagnaHouse called with house number:', houseNumber);
        this.lagnaHouseNorth = houseNumber;
        this.renumberHouses();
        this.clearHighlight();
        console.log(`Lagna set to house ${houseNumber}`);
    }

    setFirstHouse(houseNumber) {
        this.firstHouseNorth = houseNumber;
        this.renumberHouses();
        console.log(`First house set to house ${houseNumber}`);
    }

    renumberHouses() {
        // Initialize debug array at the beginning
        const debugBhavas = [];
        
        // The tinyBoxPositions keys are actually the Rashi numbers, not house numbers
        // Based on debug output, we need to map Rashi numbers to house numbers
        // Let's create the correct mapping from Rashi number to house number
        const rashiToHouseMappingNorth = {
            1: 1,   // Rashi 1 = House 1 (Center diamond - Aries Lagna)
            2: 2,   // Rashi 2 = House 2 (Top triangle - Taurus)
            3: 3,   // Rashi 3 = House 3 (Top left corner - Gemini)
            4: 4,   // Rashi 4 = House 4 (Left side - Cancer)
            5: 10,  // Rashi 5 = House 10 (Bottom right corner - Leo) - debug shows Rashi 5
            6: 7,   // Rashi 6 = House 7 (Bottom left - Virgo) - debug shows Rashi 6
            7: 5,   // Rashi 7 = House 5 (Right side - Libra) - debug shows Rashi 7
            8: 6,   // Rashi 8 = House 6 (Bottom center - Scorpio) - debug shows Rashi 8
            9: 8,   // Rashi 9 = House 8 (Bottom left corner - Sagittarius) - debug shows Rashi 9
            10: 9,  // Rashi 10 = House 9 (Bottom right - Capricorn) - debug shows Rashi 10
            11: 11, // Rashi 11 = House 11 (Top right corner - Aquarius)
            12: 12  // Rashi 12 = House 12 (Top right - Pisces)
        };
        
        // Apply the mapping with Lagna adjustment
        for (let rashiNumberNorth = 1; rashiNumberNorth <= 12; rashiNumberNorth++) {
            // Get the actual house number for this Rashi number
            const houseNumNorth = rashiToHouseMappingNorth[rashiNumberNorth];
            
            // For Aries Lagna (house 1), the Rashi numbers should follow natural zodiac order
            // starting from the Lagna position. Since house 1 is Lagna, it should be Rashi 1
            const baseRashiNorth = rashiNumberNorth; // The Rashi number corresponds to the natural zodiac order
            
            // Adjust for Lagna: (base rashi - lagna rashi + 12) % 12 + 1
            const lagnaRashiNorth = rashiToHouseMappingNorth[this.lagnaHouseNorth];
            const adjustedRashiNorth = ((baseRashiNorth - lagnaRashiNorth + 12) % 12) + 1;
            const rashiNameNorth = adjustedRashiNorth.toString();
            
            // Update North Indian chart Rashi numbers using the Rashi number
            const rashiTextNorth = this.tinyBoxGroupNorth?.findOne(`RashiNumberTextNorth${rashiNumberNorth}`);
            if (rashiTextNorth) {
                rashiTextNorth.text(rashiNameNorth);
            }
            debugBhavas.push({rashiNumberNorth, houseNumNorth, rashiNameNorth, baseRashiNorth, lagnaRashiNorth});
        }
        
        this.layer.batchDraw();
        console.log('Bhava mapping:', debugBhavas);
        console.log('Houses renumbered');
    }

    clearChart() {
        if (this.chartGroupNorth) {
            this.chartGroupNorth.destroy();
            this.chartGroupNorth = null;
        }
        if (this.tinyBoxGroupNorth) {
            this.tinyBoxGroupNorth.destroy();
            this.tinyBoxGroupNorth = null;
        }
        this.houseDataNorth = {};
        this.selectedHouse = null;
        
        // Reset stage scale and position
        if (this.stage) {
            this.stage.scale({ x: 1, y: 1 });
            this.stage.position({ x: 0, y: 0 });
            this.stage.batchDraw();
        }
        
        console.log('North Indian chart cleared');
    }

    zoomToFit() {
        if (!this.stage || !this.chartGroupNorth) return;

        const stageWidth = this.stage.width();
        const stageHeight = this.stage.height();
        const chartBounds = this.chartGroupNorth.getClientRect();

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
            chartType: 'north-indian',
            lagnaHouse: this.lagnaHouseNorth,
            firstHouse: this.firstHouseNorth,
            houseData: this.houseDataNorth
        };
    }

    loadChartData(data) {
        if (!data || data.chartType !== 'north-indian') return;
        
        try {
            this.lagnaHouseNorth = data.lagnaHouse || 1;
            this.firstHouseNorth = data.firstHouse || 1;
            this.houseDataNorth = data.houseData || {};
            
            // Recreate the chart
            this.createNorthIndianChart();
            
            console.log('North Indian chart data loaded successfully');
        } catch (error) {
            console.error('Error loading North Indian chart data:', error);
        }
    }
} 