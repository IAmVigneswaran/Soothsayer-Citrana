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
            // House 2
            {
                number: 2,
                points: [1.19048, 1.19048, 239.28571, 1.19048, 120.23809, 120.23809],
                name: 'Dhan'
            },
            // House 3
            {
                number: 3,
                points: [1.19048, 1.19048, 1.19048, 239.28571, 120.23809, 120.23809],
                name: 'Sahaj'
            },
            // House 4
            {
                number: 4,
                points: [120.23809, 120.23809, 1.19048, 239.28571, 120.23809, 358.33333, 239.28571, 239.28571],
                name: 'Bandhu'
            },
            // House 5
            {
                number: 5,
                points: [1.19048, 239.28571, 120.23809, 358.33333, 1.19048, 477.38095],
                name: 'Putra'
            },
            // House 6
            {
                number: 6,
                points: [239.28571, 477.38095, 120.23809, 358.33333, 1.19048, 477.38095],
                name: 'Ripu'
            },
            // House 7
            {
                number: 7,
                points: [239.28571, 477.38095, 120.23809, 358.33333, 239.28571, 239.28571, 358.33333, 358.33333],
                name: 'Kalatra'
            },
            // House 8
            {
                number: 8,
                points: [239.28571, 477.38095, 358.33333, 358.33333, 477.38095, 477.38095],
                name: 'Mrit'
            },
            // House 9
            {
                number: 9,
                points: [358.33333, 358.33333, 477.38095, 477.38095, 477.38095, 239.28571],
                name: 'Bhagya'
            },
            // House 10
            {
                number: 10,
                points: [358.33333, 358.33333, 477.38095, 239.28571, 358.33333, 120.23809, 239.28571, 239.28571],
                name: 'Karma'
            },
            // House 11
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
            1: { x: 230.8155 + globalOffsetNorth.x, y: 209.75027 + globalOffsetNorth.y }, // center diamond
            2: { x: 111.8155 + globalOffsetNorth.x, y: 87.72997 + globalOffsetNorth.y },  // top left triangle
            3: { x: 90.53612 + globalOffsetNorth.x, y: 111.8155 + globalOffsetNorth.y },  // top left corner
            4: { x: 208.55092 + globalOffsetNorth.x, y: 230.8155 + globalOffsetNorth.y }, // left side
            5: { x: 252.67113 + globalOffsetNorth.x, y: 230.8155 + globalOffsetNorth.y }, // right side
            6: { x: 230.8155 + globalOffsetNorth.x, y: 254.56586 + globalOffsetNorth.y }, // bottom center
            7: { x: 90.53612 + globalOffsetNorth.x, y: 349.8655 + globalOffsetNorth.y },  // bottom left
            8: { x: 111.7655 + globalOffsetNorth.x, y: 373.90103 + globalOffsetNorth.y }, // bottom left corner
            9: { x: 349.8655 + globalOffsetNorth.x, y: 371.49796 + globalOffsetNorth.y }, // bottom right
            10: { x: 371.09488 + globalOffsetNorth.x, y: 349.8155 + globalOffsetNorth.y }, // bottom right corner
            11: { x: 371.09488 + globalOffsetNorth.x, y: 111.7655 + globalOffsetNorth.y }, // top right corner
            12: { x: 349.8155 + globalOffsetNorth.x, y: 90.13304 + globalOffsetNorth.y }   // top right
        };

        // Save the original positions
        const originalTinyBoxPositionsNorth = { ...tinyBoxPositionsNorth };

        tinyBoxPositionsNorth[5] = originalTinyBoxPositionsNorth[7];
        tinyBoxPositionsNorth[6] = originalTinyBoxPositionsNorth[8];
        tinyBoxPositionsNorth[7] = originalTinyBoxPositionsNorth[6];
        tinyBoxPositionsNorth[8] = originalTinyBoxPositionsNorth[9];
        tinyBoxPositionsNorth[9] = originalTinyBoxPositionsNorth[10];
        tinyBoxPositionsNorth[10] = originalTinyBoxPositionsNorth[5];

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
                name: `house-${houseNumberNorth}`,
                listening: true
            });

            // Make the polygon selectable by listening to click events
            housePolygonNorth.on('mousedown', (e) => {
                this.highlightHouse(houseNumberNorth);
                window.selectedBhavaNorth = houseNumberNorth;
                console.log('[SELECT] North Indian Chart House selected:', houseNumberNorth);
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

        // For now, just use empty Rashi numbers - will be filled manually
        const calculateRashiNumberNorth = (houseNumberNorth) => {
            return ''; // Empty for now
        };

        Object.entries(tinyBoxPositionsNorth).forEach(([houseNumberNorth, positionNorth]) => {
            const houseNumNorth = parseInt(houseNumberNorth);
            const rashiNameNorth = calculateRashiNumberNorth(houseNumNorth);
            const uniqueId = `${houseNumNorth}NRB`;

            // Create rashi number box
            const rashiNumberBoxNorth = new Konva.Rect({
                x: positionNorth.x - rashiNumberBoxSizeNorth/2,
                y: positionNorth.y - rashiNumberBoxSizeNorth/2,
                width: rashiNumberBoxSizeNorth,
                height: rashiNumberBoxSizeNorth,
                fill: '#000000',
                cornerRadius: 4,
                name: `RashiNumberBoxNorth${houseNumNorth}`,
                id: uniqueId // Assign unique ID
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
                name: `RashiNumberTextNorth${houseNumNorth}`,
                id: uniqueId // Assign unique ID
            });
            
            console.log(`[DEBUG] Created Rashi text element with name: RashiNumberTextNorth${houseNumNorth}`);

            // Add click event to rashi number box for debug
            rashiNumberBoxNorth.on('click', (e) => {
                e.evt.stopPropagation(); // Prevent event bubbling
                const currentRashiNumber = this.getCurrentRashiNumber(houseNumNorth);
                console.log(`[DEBUG] Clicked Rashi Box ID: ${uniqueId}, Rashi: ${currentRashiNumber}, Lagna: ${this.lagnaHouseNorth}`);
            });

            // Also add click event to text for better coverage
            rashiNumberTextNorth.on('click', (e) => {
                e.evt.stopPropagation(); // Prevent event bubbling
                const currentRashiNumber = this.getCurrentRashiNumber(houseNumNorth);
                console.log(`[DEBUG] Clicked Rashi Box ID: ${uniqueId}, Rashi: ${currentRashiNumber}, Lagna: ${this.lagnaHouseNorth}`);
            });

            // Add to rashi number box group
            this.tinyBoxGroupNorth.add(rashiNumberBoxNorth);
            this.tinyBoxGroupNorth.add(rashiNumberTextNorth);
        });

        // Add both groups to layer - rashi number boxes on top
        this.layer.add(this.chartGroupNorth);
        this.layer.add(this.tinyBoxGroupNorth);
        
        // Ensure house polygons are always on top for hit detection
        this.chartGroupNorth.moveToTop();
        this.tinyBoxGroupNorth.moveToTop();
        this.layer.batchDraw();
        
        console.log('[DEBUG] North Indian chart created with clickable Rashi Number Boxes');

        // Call renumberHouses to set correct Rashi numbers based on Lagna and First House
        this.renumberHouses();

        // Zoom to fit
        this.zoomToFit();
        
        console.log('North Indian chart created');

        // Add editable label above the chart (not in the center) - ensure it's on top
        // Recalculate chart bounds after zoomToFit
        const chartBoundsAfterZoom = this.chartGroupNorth.getClientRect();
        const chartWidth = chartBoundsAfterZoom.width;
        const labelWidth = 400; // Fixed label width
        const fontSize = 18;
        const labelHeight = fontSize * 4; // Allow up to 4 lines
        const labelY = -labelHeight - -5; // 12px margin above chart group
        // Fine-tune label offset for each browser
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        const isMobile = window.innerWidth <= 600;
        let labelOffset;
        if (isMobile) {
            // Fine-tune these values for mobile Safari and mobile Chrome/Brave
            labelOffset = isSafari ? -33 : 2;
        } else {
            // Desktop values
            labelOffset = isSafari ? -117 : -95;
        }
        const labelX = (chartWidth - labelWidth) / 2 + labelOffset;
        const centerLabel = new Konva.Text({
            x: labelX,
            y: labelY,
            width: labelWidth,
            height: labelHeight,
            text: 'Rashi Chart 1\nD1',
            fontSize: fontSize,
            fontFamily: 'Arial Black, Arial, sans-serif',
            fontWeight: 'bold',
            fill: '#000000',
            align: 'center',
            verticalAlign: 'middle',
            draggable: false,
            name: 'north-label-text',
            listening: true
        });
        this.chartGroupNorth.add(centerLabel);
        centerLabel.moveToTop();
        // In-place editing on double-click (centered in viewport)
        centerLabel.on('dblclick dbltap', () => {
            const textarea = document.createElement('textarea');
            textarea.className = 'konva-textarea';
            document.body.appendChild(textarea);
            textarea.value = centerLabel.text();
            textarea.maxLength = 200;
            // Restrict to max 4 lines
            textarea.addEventListener('input', (e) => {
                const lines = textarea.value.split('\n');
                if (lines.length > 4) {
                    textarea.value = lines.slice(0, 4).join('\n');
                }
            });
            // Center the textarea in the viewport
            const textareaWidth = 400;
            const textareaHeight = Math.max(28, centerLabel.height() - 6);
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            textarea.style.width = textareaWidth + 'px';
            textarea.style.height = textareaHeight + 'px';
            textarea.style.left = ((viewportWidth - textareaWidth) / 2) + 'px';
            textarea.style.top = ((viewportHeight - textareaHeight) / 2) + 'px';
            textarea.style.position = 'absolute';
            textarea.style.fontSize = centerLabel.fontSize() + 'px';
            textarea.style.lineHeight = centerLabel.fontSize() + 'px';
            textarea.style.fontFamily = centerLabel.fontFamily();
            textarea.style.color = centerLabel.fill();
            textarea.style.fontWeight = 'bold';
            textarea.style.textAlign = 'center';
            textarea.style.border = '1.5px solid #374151';
            textarea.style.background = 'white';
            textarea.style.outline = 'none';
            textarea.style.resize = 'none';
            textarea.style.zIndex = '10000';
            textarea.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
            textarea.style.padding = '0';
            textarea.style.margin = '0';
            textarea.style.overflow = 'hidden';
            textarea.focus();
            textarea.select();
            // Save on blur or Enter
            const finishEditing = () => {
                centerLabel.text(textarea.value);
                textarea.remove();
                this.layer.batchDraw();
            };
            textarea.addEventListener('blur', finishEditing);
            textarea.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    finishEditing();
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    textarea.value = centerLabel.text();
                    finishEditing();
                }
            });
        });
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
        console.log('[DEBUG] North Indian Chart - setLagnaHouse called with house number:', houseNumber);
        console.log('[DEBUG] Previous Lagna House:', this.lagnaHouseNorth);
        
        this.lagnaHouseNorth = houseNumber;
        
        console.log('[DEBUG] New Lagna House set to:', this.lagnaHouseNorth);
        console.log('[DEBUG] Calling renumberHouses() to update Rashi numbers...');
        
        this.renumberHouses();
        this.clearHighlight();
        
        // Reposition all planets based on their stored Rashi numbers
        this.repositionPlanetsForNewLagna();
        
        // Get zodiac sign name for the Lagna
        const zodiacSigns = [
            'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
            'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
        ];
        const lagnaSignName = zodiacSigns[houseNumber - 1] || 'Unknown';
        
        console.log(`[DEBUG] North Indian Chart - Lagna successfully set to house ${houseNumber} (${lagnaSignName})`);
        console.log('[DEBUG] Chart should now display updated Rashi numbers for the new Lagna');
        console.log('[DEBUG] All planets have been repositioned to their correct Rashis');
    }

    setFirstHouse(houseNumber) {
        this.firstHouseNorth = houseNumber;
        this.renumberHouses();
        console.log(`First house set to house ${houseNumber}`);
    }

    getCurrentRashiNumber(visualPosition) {
        // For now, return empty - will be filled manually
        return '';
    }

    /**
     * Get the Rashi number for a given house with the current Lagna
     * @param {number} houseNumber - The house number (1-12)
     * @returns {number} The Rashi number (1-12)
     */
    getRashiNumberForHouse(houseNumber) {
        return ((houseNumber + this.lagnaHouseNorth - 2) % 12) + 1;
    }

    /**
     * Get the house number for a given Rashi with the current Lagna
     * @param {number} rashiNumber - The Rashi number (1-12)
     * @returns {number} The house number (1-12)
     */
    getHouseNumberForRashi(rashiNumber) {
        // Reverse the formula: house = ((rashi - lagna + 1) % 12) + 1
        let houseNumber = ((rashiNumber - this.lagnaHouseNorth + 1) % 12);
        if (houseNumber <= 0) houseNumber += 12;
        return houseNumber;
    }

    /**
     * Reposition all planets to their correct houses based on their stored Rashi numbers
     * This is called when the Lagna changes to ensure planets stay in their Rashis
     */
    repositionPlanetsForNewLagna() {
        console.log('[DEBUG] Repositioning planets for new Lagna...');
        
        // Collect all planets with their Rashi numbers
        const allPlanets = [];
        for (const houseNum in this.houseDataNorth) {
            const house = this.houseDataNorth[houseNum];
            if (house.planets && house.planets.length > 0) {
                house.planets.forEach(planet => {
                    if (planet.rashiNumber) {
                        allPlanets.push({
                            ...planet,
                            currentHouse: parseInt(houseNum)
                        });
                    }
                });
            }
        }
        
        console.log(`[DEBUG] Found ${allPlanets.length} planets to reposition`);
        
        // Clear all planets from current positions
        for (const houseNum in this.houseDataNorth) {
            this.houseDataNorth[houseNum].planets = [];
        }
        
        // Reposition each planet to its correct house based on Rashi
        allPlanets.forEach(planet => {
            const newHouseNumber = this.getHouseNumberForRashi(planet.rashiNumber);
            console.log(`[DEBUG] Planet ${planet.abbr} (Rashi ${planet.rashiNumber}) moving from house ${planet.currentHouse} to house ${newHouseNumber}`);
            
            // Add planet to new house
            const house = this.houseDataNorth[newHouseNumber];
            if (house) {
                if (!house.planets) house.planets = [];
                house.planets.push({
                    abbr: planet.abbr,
                    label: planet.label,
                    id: planet.id,
                    rashiNumber: planet.rashiNumber,
                    color: planet.color
                });
            }
        });
        
        // Update visual representation for all houses
        for (const houseNum in this.houseDataNorth) {
            this.updatePlanetsInHouse(parseInt(houseNum));
        }
        
        this.layer.batchDraw();
        console.log('[DEBUG] Planet repositioning completed');
    }



    /**
     * Updates the Rashi numbers in the North Indian chart for any Lagna.
     * Uses the universal formula:
     *   Rashi = ((house + lagna - 2) % 12) + 1
     * Where:
     *   - house: the logical house number (1-12, matches the visual box after swapping)
     *   - lagna: the current Lagna (1-12)
     * This formula works for all 12 Lagnas and ensures correct Rashi numbering in every box.
     */
    renumberHouses() {
        for (let house = 1; house <= 12; house++) {
            const rashiNumber = ((house + this.lagnaHouseNorth - 2) % 12) + 1;
            console.log(`[DEBUG] renumberHouses: house=${house}, lagna=${this.lagnaHouseNorth}, rashi=${rashiNumber}`);
            const rashiText = this.tinyBoxGroupNorth?.findOne(`[name="RashiNumberTextNorth${house}"]`);
            if (rashiText) {
                rashiText.text(rashiNumber.toString());
            } else {
                const foundElement = this.tinyBoxGroupNorth?.children.find(child => child.name() === `RashiNumberTextNorth${house}`);
                if (foundElement) {
                    foundElement.text(rashiNumber.toString());
                }
            }
        }
        this.layer.batchDraw();
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

        // Detect mobile vs desktop
        const isMobile = window.innerWidth <= 600;
        const scaleFactor = isMobile ? 0.95 : 0.7;
        const extraTopMargin = isMobile ? 20 : -50;

        const scaleX = (stageWidth * scaleFactor) / chartBounds.width;
        const scaleY = (stageHeight * scaleFactor) / chartBounds.height;
        const scale = Math.min(scaleX, scaleY, 2); // Max scale of 2

        this.stage.scale({ x: scale, y: scale });

        // Center the chart, but add extra top margin for the label
        const chartCenter = {
            x: chartBounds.x + chartBounds.width / 2,
            y: chartBounds.y + chartBounds.height / 2
        };
        const stageCenter = {
            x: stageWidth / 2,
            y: (stageHeight / 2) + (extraTopMargin / 2)
        };
        const newPos = {
            x: stageCenter.x - chartCenter.x * scale,
            y: stageCenter.y - chartCenter.y * scale - extraTopMargin
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
            
            // Reposition planets if they have Rashi numbers stored
            this.repositionPlanetsForNewLagna();
            
            console.log('North Indian chart data loaded successfully');
        } catch (error) {
            console.error('Error loading North Indian chart data:', error);
        }
    }

    clearAllPlanets() {
        for (const houseNum in this.houseDataNorth) {
            this.houseDataNorth[houseNum].planets = [];
            this.updatePlanetsInHouse(houseNum);
        }
        this.layer.batchDraw();
        console.log('All planets cleared from North Indian chart');
    }

    // --- Robust Planet Management ---
    addPlanetToHouse(planetAbbr, houseNumber, label = null, id = null, existingRashiNumber = null) {
        const house = this.houseDataNorth[houseNumber];
        if (!house) return;
        if (!house.planets) house.planets = [];
        // Use unique ID for each planet instance
        const planetId = id || (Date.now().toString(36) + Math.random().toString(36).substr(2, 5));
        
        // If this is a planet being moved (has existing Rashi), preserve it
        // Otherwise, calculate the Rashi number for this house with current Lagna
        const rashiNumber = existingRashiNumber || this.getRashiNumberForHouse(houseNumber);
        
        // Get planet color
        const planet = window.app.planetSystem.getPlanetInfo(planetAbbr);
        const planetColor = planet ? planet.color : '#000000';
        
        house.planets.push({ 
            abbr: planetAbbr, 
            label: label || planetAbbr, 
            id: planetId,
            rashiNumber: rashiNumber, // Store the Rashi number when planet is placed
            color: planetColor
        });
        this.updatePlanetsInHouse(houseNumber);
        if (window.app && window.app.pushSnapshot) window.app.pushSnapshot();
        console.log(`[ADD] Planet ${planetAbbr} (id=${planetId}) added to house ${houseNumber} in Rashi ${rashiNumber}`);
    }

    removePlanetFromHouseById(houseNumber, planetId) {
        const house = this.houseDataNorth[houseNumber];
        if (!house || !house.planets) return;
        house.planets = house.planets.filter((planet) => planet.id !== planetId);
        this.updatePlanetsInHouse(houseNumber);
        this.layer.batchDraw();
        this.clearSelectedPlanet && this.clearSelectedPlanet();
        if (window.app && window.app.pushSnapshot) window.app.pushSnapshot();
    }

    updatePlanetsInHouse(houseNumber) {
        const house = this.houseDataNorth[houseNumber];
        if (!house) return;
        // Remove all existing planet texts for this house
        this.chartGroupNorth.getChildren(node => node.name() && node.name().startsWith(`planet-`) && node.name().includes(`-${houseNumber}-`)).forEach(node => node.destroy());
        // Calculate font size based on number of planets
        const n = house.planets.length;
        const BASE_FONT = 20;
        const MIN_FONT = 10;
        const STEP = 4;
        const fontSize = Math.max(MIN_FONT, BASE_FONT - (n-1)*STEP);
        // Perfectly center all planet texts both horizontally and vertically in the house
        const totalHeight = n * fontSize + (n-1) * 4;
        const startY = house.y - totalHeight/2;
        house.planets.forEach((planetObj, i) => {
            const planet = window.app.planetSystem.getPlanetInfo(planetObj.abbr);
            const planetY = startY + i * (fontSize + 4);
            
            // Add a transparent rectangle for easier hit area
            const hitRect = new Konva.Rect({
                x: house.x - fontSize,
                y: planetY - fontSize/2,
                width: fontSize * 2,
                height: fontSize,
                fill: 'rgba(0,0,0,0)',
                name: `planet-hit-${planetObj.id}`,
                listening: true
            });
            // The planet text - perfectly centered
            const planetText = new Konva.Text({
                x: house.x,
                y: planetY,
                text: planetObj.label,
                fontSize: fontSize,
                fontFamily: 'Arial Black, Arial, sans-serif',
                fontWeight: 'bold',
                fill: planetObj.color || (planet ? planet.color : '#000'),
                name: `planet-${planetObj.abbr}-${houseNumber}-${planetObj.id}`,
                draggable: true,
                align: 'center',
                verticalAlign: 'middle',
                offsetX: fontSize/2,
                offsetY: fontSize/2,
            });
            planetText._planetHouseNumber = houseNumber;
            planetText._planetId = planetObj.id;

            // Make planet text editable with live preview
            if (window.app && window.app.drawingTools) {
                window.app.drawingTools.makePlanetTextEditable(planetText, (newLabel, newColor) => {
                    // Update the planet label in the house data
                    const planetIndex = house.planets.findIndex(p => p.id === planetObj.id);
                    if (planetIndex !== -1) {
                        house.planets[planetIndex].label = newLabel;
                        house.planets[planetIndex].color = newColor;
                        // Update the planet text and color
                        planetText.text(newLabel);
                        planetText.fill(newColor);
                        this.layer.batchDraw();
                        console.log(`[DEBUG] Planet ${planetObj.abbr} updated - Label: ${newLabel}, Color: ${newColor}`);
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
                this.selectPlanet && this.selectPlanet(planetText, houseNumber, planetObj.abbr, planetObj.id);
            };
            hitRect.on('click', selectHandler);
            planetText.on('click', selectHandler);
            // Right-click context menu
            const contextHandler = (e) => {
                e.evt.preventDefault();
                this.selectPlanet && this.selectPlanet(planetText, houseNumber, planetObj.abbr, planetObj.id);
                window.app.contextMenu.showPlanetMenu(e.evt.clientX, e.evt.clientY, houseNumber, planetObj.abbr, planetObj.id);
            };
            hitRect.on('contextmenu', contextHandler);
            planetText.on('contextmenu', contextHandler);
            // Drag-and-drop between bhavas
            planetText.on('dragstart', (e) => {
                this._dragSource = { 
                    houseNumber, 
                    abbr: planetObj.abbr, 
                    id: planetObj.id, 
                    label: planetObj.label,
                    rashiNumber: planetObj.rashiNumber, // Store the Rashi number for the move
                    color: planetObj.color
                };
                planetText.opacity(0.5);
                planetText.moveToTop();
                hitRect.moveToTop();
                this.layer.batchDraw();
                console.log(`[DRAGSTART] Planet ${planetObj.abbr} (id=${planetObj.id}) from house ${houseNumber} in Rashi ${planetObj.rashiNumber}`);
            });
            planetText.on('dragend', (e) => {
                planetText.opacity(1);
                this.layer.batchDraw();
                // Transform pointer to chart coordinates
                const pointer = this.stage.getPointerPosition();
                let targetHouse = null;
                if (pointer) {
                    // Adjust for stage scale and position
                    const scale = this.stage.scaleX();
                    const stagePos = this.stage.position();
                    const px = (pointer.x - stagePos.x) / scale;
                    const py = (pointer.y - stagePos.y) / scale;
                    for (const hNum in this.houseDataNorth) {
                        const h = this.houseDataNorth[hNum];
                        if (NorthIndianChartTemplate.isPointInPolygon(h.points, px, py)) {
                            targetHouse = parseInt(hNum);
                            break;
                        }
                    }
                }
                // Restore z-order: move all planet texts and hitRects to top
                this.chartGroupNorth.getChildren(node => node.name() && (node.name().startsWith('planet-') || node.name().startsWith('planet-hit-'))).forEach(node => node.moveToTop());
                this.tinyBoxGroupNorth.moveToTop();
                this.layer.batchDraw();
                if (targetHouse && targetHouse !== houseNumber) {
                    // Move planet to new bhava by ID, preserving its Rashi number and color
                    this.removePlanetFromHouseById(houseNumber, planetObj.id);
                    this.addPlanetToHouse(planetObj.abbr, targetHouse, planetObj.label, planetObj.id, planetObj.rashiNumber);
                    // Update the color of the moved planet
                    const targetHouseData = this.houseDataNorth[targetHouse];
                    if (targetHouseData && targetHouseData.planets) {
                        const movedPlanet = targetHouseData.planets.find(p => p.id === planetObj.id);
                        if (movedPlanet) {
                            movedPlanet.color = planetObj.color;
                        }
                    }
                    this.updatePlanetsInHouse(targetHouse);
                    if (window.app && window.app.pushSnapshot) window.app.pushSnapshot();
                    console.log(`[DROP] Planet ${planetObj.abbr} (id=${planetObj.id}) moved to house ${targetHouse}, staying in Rashi ${planetObj.rashiNumber}`);
                } else {
                    // Snap back to original position
                    this.updatePlanetsInHouse(houseNumber);
                    console.log(`[SNAPBACK] Planet ${planetObj.abbr} (id=${planetObj.id})`);
                }
                this.layer.batchDraw();
            });
            this.chartGroupNorth.add(hitRect);
            this.chartGroupNorth.add(planetText);
            hitRect.moveToTop();
            planetText.moveToTop();
        });
        // Do NOT move the house polygon to the top here!
        this.layer.batchDraw();
    }

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

    // --- Utility: Point-in-Polygon ---
    static isPointInPolygon(points, px, py) {
        let inside = false;
        for (let i = 0, j = points.length / 2 - 1; i < points.length / 2; j = i++) {
            const xi = points[2 * i], yi = points[2 * i + 1];
            const xj = points[2 * j], yj = points[2 * j + 1];
            const intersect = ((yi > py) !== (yj > py)) &&
                (px < (xj - xi) * (py - yi) / (yj - yi + 0.00001) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }
} 