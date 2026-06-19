/**
 * chart-templates-north.js
 * Citrana • https://github.com/IAmVigneswaran/Soothsayer-Citrana 
 * © 2025 Vigneswaran Rajkumar • Licensed under MIT License
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

    findHouseAtChartPoint(px, py) {
        for (const hNum in this.houseDataNorth) {
            const h = this.houseDataNorth[hNum];
            if (h && h.points && NorthIndianChartTemplate.isPointInPolygon(h.points, px, py)) {
                return parseInt(hNum, 10);
            }
        }

        let closest = null;
        let closestDist = Infinity;
        for (const hNum in this.houseDataNorth) {
            const h = this.houseDataNorth[hNum];
            if (!h || !h.points) continue;
            const vertexCount = h.points.length / 2;
            let cx = 0;
            let cy = 0;
            for (let i = 0; i < h.points.length; i += 2) {
                cx += h.points[i];
                cy += h.points[i + 1];
            }
            cx /= vertexCount;
            cy /= vertexCount;
            const distance = Math.hypot(px - cx, py - cy);
            const threshold = Math.max(h.width, h.height) / 2;
            if (distance < threshold && distance < closestDist) {
                closestDist = distance;
                closest = parseInt(hNum, 10);
            }
        }
        return closest;
    }

    createNorthIndianChart(options = {}) {
        const { initialLagna = 1 } = options;

        if (!this.stage || !this.layer) {
            console.error('Stage or layer not initialized');
            return;
        }

        this.clearChart();

        this.lagnaHouseNorth = initialLagna;

        // Create chart group
        this.chartGroupNorth = new Konva.Group({
            name: 'north-indian-chart'
        });

        // Create separate group for rashi number boxes to ensure they render on top
        this.tinyBoxGroupNorth = new Konva.Group({
            name: 'rashi-number-boxes-group-north',
            listening: false
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
            x: 8, // Adjust X offset (positive = right, negative = left)
            y: 8 // Adjust Y offset (positive = down, negative = up)
        };

        // Exact rashi number box positions from reference SVG - treated as individual elements
        // These positions are fixed and independent of house polygons
        const tinyBoxPositionsNorth = {
            1: {
                x: 230.8155 + globalOffsetNorth.x,
                y: 209.75027 + globalOffsetNorth.y
            }, // center diamond
            2: {
                x: 111.8155 + globalOffsetNorth.x,
                y: 87.72997 + globalOffsetNorth.y
            }, // top left triangle
            3: {
                x: 90.53612 + globalOffsetNorth.x,
                y: 111.8155 + globalOffsetNorth.y
            }, // top left corner
            4: {
                x: 208.55092 + globalOffsetNorth.x,
                y: 230.8155 + globalOffsetNorth.y
            }, // left side
            5: {
                x: 252.67113 + globalOffsetNorth.x,
                y: 230.8155 + globalOffsetNorth.y
            }, // right side
            6: {
                x: 230.8155 + globalOffsetNorth.x,
                y: 254.56586 + globalOffsetNorth.y
            }, // bottom center
            7: {
                x: 90.53612 + globalOffsetNorth.x,
                y: 349.8655 + globalOffsetNorth.y
            }, // bottom left
            8: {
                x: 111.7655 + globalOffsetNorth.x,
                y: 373.90103 + globalOffsetNorth.y
            }, // bottom left corner
            9: {
                x: 349.8655 + globalOffsetNorth.x,
                y: 371.49796 + globalOffsetNorth.y
            }, // bottom right
            10: {
                x: 371.09488 + globalOffsetNorth.x,
                y: 349.8155 + globalOffsetNorth.y
            }, // bottom right corner
            11: {
                x: 371.09488 + globalOffsetNorth.x,
                y: 111.7655 + globalOffsetNorth.y
            }, // top right corner
            12: {
                x: 349.8155 + globalOffsetNorth.x,
                y: 90.13304 + globalOffsetNorth.y
            } // top right
        };

        // Save the original positions
        const originalTinyBoxPositionsNorth = {
            ...tinyBoxPositionsNorth
        };

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

            // Add touch support for mobile selection
            housePolygonNorth.on('tap', (e) => {
                this.highlightHouse(houseNumberNorth);
                window.selectedBhavaNorth = houseNumberNorth;
                console.log('[SELECT] North Indian Chart House selected via touch:', houseNumberNorth);
            });

            // Add right-click event for context menu
            housePolygonNorth.on('contextmenu', (e) => {
                e.evt.preventDefault();
                e.evt.stopPropagation();
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

        Object.entries(tinyBoxPositionsNorth).forEach(([houseNumberNorth, positionNorth]) => {
            const houseNumNorth = parseInt(houseNumberNorth);
            const uniqueId = `${houseNumNorth}NRB`;

            // Create rashi number box
            const rashiNumberBoxNorth = new Konva.Rect({
                x: positionNorth.x - rashiNumberBoxSizeNorth / 2,
                y: positionNorth.y - rashiNumberBoxSizeNorth / 2,
                width: rashiNumberBoxSizeNorth,
                height: rashiNumberBoxSizeNorth,
                fill: '#000000',
                cornerRadius: 4,
                name: `RashiNumberBoxNorth${houseNumNorth}`,
                id: uniqueId,
                listening: false
            });

            // Create Rashi text
            const rashiNumberTextNorth = new Konva.Text({
                x: positionNorth.x - rashiNumberBoxSizeNorth / 2,
                y: positionNorth.y - rashiNumberBoxSizeNorth / 2,
                width: rashiNumberBoxSizeNorth,
                height: rashiNumberBoxSizeNorth,
                text: '',
                fontSize: 10,
                fontFamily: 'Arial',
                fontWeight: 'bold',
                fill: '#ffffff',
                align: 'center',
                verticalAlign: 'middle',
                name: `RashiNumberTextNorth${houseNumNorth}`,
                id: uniqueId,
                listening: false
            });

            citranaDebug(`Created Rashi text element with name: RashiNumberTextNorth${houseNumNorth}`);

            // Add to rashi number box group
            this.tinyBoxGroupNorth.add(rashiNumberBoxNorth);
            this.tinyBoxGroupNorth.add(rashiNumberTextNorth);
        });

        // Rashi boxes render above the chart; listening is off so clicks reach houses and Grahas below
        this.layer.add(this.chartGroupNorth);
        this.layer.add(this.tinyBoxGroupNorth);
        this.chartGroupNorth.moveToTop();
        this.tinyBoxGroupNorth.moveToTop();
        this.layer.batchDraw();

        citranaDebug('North Indian chart created with rashi number boxes (display only)');

        // Call renumberHouses to set correct Rashi numbers based on Lagna and First House
        this.renumberHouses();

        // Zoom to fit
        this.zoomToFit();

        console.log('North Indian chart created');

        // Do not add or handle the center label anymore.
    }

    highlightHouse(houseNumber) {
        // Remove highlight from previous
        if (this.selectedHouse && this.houseDataNorth[this.selectedHouse]) {
            this.houseDataNorth[this.selectedHouse].housePolygonNorth.fill('#ffffff');
        }
        // Highlight new
        if (this.houseDataNorth[houseNumber]) {
            this.houseDataNorth[houseNumber].housePolygonNorth.fill('#f3f4f6'); // Light grey highlight
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
        citranaDebug('North Indian Chart - setLagnaHouse called with house number:', houseNumber);
        citranaDebug('Previous Lagna House:', this.lagnaHouseNorth);

        this.lagnaHouseNorth = houseNumber;

        citranaDebug('New Lagna House set to:', this.lagnaHouseNorth);
        citranaDebug('Calling renumberHouses() to update Rashi numbers...');

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

        citranaDebug(`North Indian Chart - Lagna successfully set to house ${houseNumber} (${lagnaSignName})`);
        citranaDebug('Chart should now display updated Rashi numbers for the new Lagna');
        citranaDebug('All planets have been repositioned to their correct Rashis');
        if (window.app?.recordHistory) window.app.recordHistory('Set Lagna');
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
        citranaDebug('Repositioning planets for new Lagna...');

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

        citranaDebug(`Found ${allPlanets.length} planets to reposition`);

        // Clear all planets from current positions
        for (const houseNum in this.houseDataNorth) {
            this.houseDataNorth[houseNum].planets = [];
        }

        // Reposition each planet to its correct house based on Rashi
        allPlanets.forEach(planet => {
            const newHouseNumber = this.getHouseNumberForRashi(planet.rashiNumber);
            citranaDebug(`Planet ${planet.abbr} (Rashi ${planet.rashiNumber}) moving from house ${planet.currentHouse} to house ${newHouseNumber}`);

            // Add planet to new house
            const house = this.houseDataNorth[newHouseNumber];
            if (house) {
                if (!house.planets) house.planets = [];
                house.planets.push({
                    abbr: planet.abbr,
                    label: planet.label,
                    id: planet.id,
                    rashiNumber: planet.rashiNumber,
                    color: planet.color,
                    retrograde: planet.retrograde || false
                });
            }
        });

        // Update visual representation for all houses
        for (const houseNum in this.houseDataNorth) {
            this.updatePlanetsInHouse(parseInt(houseNum));
        }

        this.layer.batchDraw();
        citranaDebug('Planet repositioning completed');
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
            citranaDebug(`renumberHouses: house=${house}, lagna=${this.lagnaHouseNorth}, rashi=${rashiNumber}`);
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

        console.log('North Indian chart cleared');
    }

    zoomToFit() {
        if (!this.stage || !this.chartGroupNorth) return;

        const stageWidth = this.stage.width();
        const stageHeight = this.stage.height();

        // Get the chart bounds in local coordinates (not screen coordinates)
        const chartBounds = this.chartGroupNorth.getClientRect();

        // Convert screen bounds to local bounds
        const scale = this.stage.scaleX();
        const stagePos = this.stage.position();
        const localBounds = {
            x: (chartBounds.x - stagePos.x) / scale,
            y: (chartBounds.y - stagePos.y) / scale,
            width: chartBounds.width / scale,
            height: chartBounds.height / scale
        };

        // Detect mobile vs desktop
        const isMobile = window.innerWidth <= 600;
        const scaleFactor = isMobile ? 0.95 : 0.7;
        const extraTopMargin = isMobile ? 20 : -50;

        const scaleX = (stageWidth * scaleFactor) / localBounds.width;
        const scaleY = (stageHeight * scaleFactor) / localBounds.height;
        const newScale = Math.min(scaleX, scaleY, 2); // Max scale of 2

        this.stage.scale({
            x: newScale,
            y: newScale
        });

        // Center the chart, but add extra top margin for the label
        const chartCenter = {
            x: localBounds.x + localBounds.width / 2,
            y: localBounds.y + localBounds.height / 2
        };
        const stageCenter = {
            x: stageWidth / 2,
            y: (stageHeight / 2) + (extraTopMargin / 2)
        };
        const newPos = {
            x: stageCenter.x - chartCenter.x * newScale,
            y: stageCenter.y - chartCenter.y * newScale - extraTopMargin
        };
        this.stage.position(newPos);
        this.stage.batchDraw();

        citranaDebug('North Indian zoomToFit - scale:', newScale, 'position:', newPos, 'extraTopMargin:', extraTopMargin);
    }

    extractSerializablePlanets(houseData = this.houseDataNorth) {
        const planetsByHouse = {};
        for (const houseNum in houseData) {
            const planets = houseData[houseNum]?.planets;
            if (!Array.isArray(planets) || planets.length === 0) continue;
            const serialized = planets
                .filter((planet) => planet && typeof planet.abbr === 'string')
                .map((planet) => ({
                    abbr: planet.abbr,
                    label: planet.label || planet.abbr,
                    id: planet.id,
                    color: planet.color,
                    rashiNumber: planet.rashiNumber,
                    retrograde: !!planet.retrograde
                }));
            if (serialized.length > 0) {
                planetsByHouse[houseNum] = serialized;
            }
        }
        return planetsByHouse;
    }

    parseSavedPlanets(data) {
        if (data.planetsByHouse) {
            return data.planetsByHouse;
        }
        return this.extractSerializablePlanets(data.houseData || {});
    }

    restoreSavedPlanets(planetsByHouse, skipSnapshot = true) {
        for (const houseNum in planetsByHouse) {
            const fallbackHouse = parseInt(houseNum, 10);
            for (const planet of planetsByHouse[houseNum]) {
                const rashiNumber = planet.rashiNumber || this.getRashiNumberForHouse(fallbackHouse);
                const targetHouse = this.getHouseNumberForRashi(rashiNumber);
                this.addPlanetToHouse(
                    planet.abbr,
                    targetHouse,
                    planet.label,
                    planet.id,
                    rashiNumber,
                    !!planet.retrograde,
                    skipSnapshot
                );
            }
        }
    }

    getChartData() {
        return {
            chartType: 'north-indian',
            lagnaHouse: this.lagnaHouseNorth,
            planetsByHouse: this.extractSerializablePlanets()
        };
    }

    loadChartData(data) {
        if (!data || data.chartType !== 'north-indian') return;

        try {
            const lagnaHouse = data.lagnaHouse || 1;
            const planetsByHouse = this.parseSavedPlanets(data);

            this.createNorthIndianChart({ initialLagna: lagnaHouse });
            this.restoreSavedPlanets(planetsByHouse, true);

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
    addPlanetToHouse(planetAbbr, houseNumber, label = null, id = null, existingRashiNumber = null, existingRetrograde = null, skipSnapshot = false) {
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
        let resolvedLabel = label || planetAbbr;
        let resolvedRetrograde = existingRetrograde ?? false;
        if (resolvedLabel.includes('ᵣ')) {
            resolvedRetrograde = true;
            resolvedLabel = resolvedLabel.replace(/ᵣ/g, '');
        }

        house.planets.push({
            abbr: planetAbbr,
            label: resolvedLabel,
            id: planetId,
            rashiNumber: rashiNumber, // Store the Rashi number when planet is placed
            color: planetColor,
            retrograde: resolvedRetrograde
        });
        this.updatePlanetsInHouse(houseNumber);
        if (!skipSnapshot && window.app?.recordHistory) window.app.recordHistory('Add Graha');
        citranaDebug(`[ADD] Planet ${planetAbbr} (id=${planetId}) added to house ${houseNumber} in Rashi ${rashiNumber}`);
    }

    removePlanetFromHouseById(houseNumber, planetId, skipSnapshot = false) {
        const house = this.houseDataNorth[houseNumber];
        if (!house || !house.planets) return;
        house.planets = house.planets.filter((planet) => planet.id !== planetId);
        this.updatePlanetsInHouse(houseNumber);
        this.layer.batchDraw();
        this.clearSelectedPlanet && this.clearSelectedPlanet();
        if (!skipSnapshot && window.app?.recordHistory) window.app.recordHistory('Remove Graha');
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
        const fontSize = Math.max(MIN_FONT, BASE_FONT - (n - 1) * STEP);
        // Perfectly center all planet texts both horizontally and vertically in the house
        const totalHeight = n * fontSize + (n - 1) * 4;
        const startY = house.y - totalHeight / 2;
        house.planets.forEach((planetObj, i) => {
            const planet = window.app.planetSystem.getPlanetInfo(planetObj.abbr);
            const planetY = startY + i * (fontSize + 4);

            // Add a transparent rectangle for easier hit area
            const hitRect = new Konva.Rect({
                x: house.x - fontSize,
                y: planetY - fontSize / 2,
                width: fontSize * 2,
                height: fontSize,
                fill: 'rgba(0,0,0,0)',
                name: `planet-hit-${planetObj.id}`,
                listening: true
            });
            // The planet text - perfectly centered
            const isMobile = /Mobile|Android|iP(ad|hone|od)/.test(navigator.userAgent);
            const planetText = new Konva.Text({
                x: house.x,
                y: planetY,
                text: planetObj.label,
                fontSize: fontSize,
                fontFamily: 'Arial Black, Arial, sans-serif',
                fontWeight: isMobile ? 700 : 'bold',
                fill: planetObj.color || (planet ? planet.color : '#000'),
                textDecoration: planetObj.retrograde ? 'underline' : '',
                name: `planet-${planetObj.abbr}-${houseNumber}-${planetObj.id}`,
                draggable: true,
                align: 'left',
                verticalAlign: 'top',
                offsetX: 0,
                offsetY: 0,
            });

            // Calculate exact center position
            setTimeout(() => {
                const textWidth = planetText.width();
                const textHeight = planetText.height();
                planetText.x(house.x - textWidth / 2);
                planetText.y(planetY - textHeight / 2);
                this.layer.batchDraw();
            }, 10);

            planetText._planetHouseNumber = houseNumber;
            planetText._planetId = planetObj.id;

            // Make planet text editable with live preview
            if (window.app && window.app.drawingTools) {
                window.app.drawingTools.makePlanetTextEditable(planetText, (newLabel, newColor, newRetrograde) => {
                    // Update the planet label in the house data
                    const planetIndex = house.planets.findIndex(p => p.id === planetObj.id);
                    if (planetIndex !== -1) {
                        house.planets[planetIndex].label = newLabel;
                        house.planets[planetIndex].color = newColor;
                        house.planets[planetIndex].retrograde = !!newRetrograde;
                        // Update the planet text and color
                        planetText.text(newLabel);
                        planetText.fill(newColor);
                        planetText.textDecoration(newRetrograde ? 'underline' : '');

                        // Re-center the text after editing
                        setTimeout(() => {
                            const textWidth = planetText.width();
                            const textHeight = planetText.height();
                            planetText.x(house.x - textWidth / 2);
                            planetText.y(planetY - textHeight / 2);
                            this.layer.batchDraw();
                        }, 10);

                        this.layer.batchDraw();
                        citranaDebug(`Planet ${planetObj.abbr} updated - Label: ${newLabel}, Color: ${newColor}`);
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
                e.evt.stopPropagation();
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
                    color: planetObj.color,
                    retrograde: planetObj.retrograde
                };
                planetText.opacity(0.5);
                planetText.moveToTop();
                hitRect.moveToTop();
                this.layer.batchDraw();
                citranaDebug(`[DRAGSTART] Planet ${planetObj.abbr} (id=${planetObj.id}) from house ${houseNumber} in Rashi ${planetObj.rashiNumber}`);
            });
            planetText.on('dragend', (e) => {
                planetText.opacity(1);
                this.layer.batchDraw();

                const coordinator = window.app?.chartTemplates;
                const targetHouse = coordinator?.resolveDropHouse({
                    event: e,
                    chartLocalX: planetText.x(),
                    chartLocalY: planetText.y()
                }) ?? null;

                // Restore z-order: move all planet texts and hitRects to top
                this.chartGroupNorth.getChildren(node => node.name() && (node.name().startsWith('planet-') || node.name().startsWith('planet-hit-'))).forEach(node => node.moveToTop());
                this.tinyBoxGroupNorth.moveToTop();
                this.layer.batchDraw();
                if (targetHouse && targetHouse !== houseNumber) {
                    // Move planet to new bhava by ID, preserving its Rashi number and color
                    this.removePlanetFromHouseById(houseNumber, planetObj.id, true);
                    this.addPlanetToHouse(planetObj.abbr, targetHouse, planetObj.label, planetObj.id, planetObj.rashiNumber, planetObj.retrograde, true);
                    // Update the color of the moved planet
                    const targetHouseData = this.houseDataNorth[targetHouse];
                    if (targetHouseData && targetHouseData.planets) {
                        const movedPlanet = targetHouseData.planets.find(p => p.id === planetObj.id);
                        if (movedPlanet) {
                            movedPlanet.color = planetObj.color;
                        }
                    }
                    this.updatePlanetsInHouse(targetHouse);
                    if (window.app?.recordHistory) window.app.recordHistory('Move Graha');
                    citranaDebug(`[DROP] Planet ${planetObj.abbr} (id=${planetObj.id}) moved to house ${targetHouse}, staying in Rashi ${planetObj.rashiNumber}`);
                } else {
                    // Snap back to original position
                    this.updatePlanetsInHouse(houseNumber);
                    citranaDebug(`[SNAPBACK] Planet ${planetObj.abbr} (id=${planetObj.id})`);
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
        this.selectedPlanet = {
            planetText,
            houseNumber,
            abbr,
            id
        };
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
            const xi = points[2 * i],
                yi = points[2 * i + 1];
            const xj = points[2 * j],
                yj = points[2 * j + 1];
            const intersect = ((yi > py) !== (yj > py)) &&
                (px < (xj - xi) * (py - yi) / (yj - yi + 0.00001) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }
}