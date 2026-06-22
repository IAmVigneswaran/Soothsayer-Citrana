/**
 * citrana-chart-templates-south.js
 * Citrana • https://github.com/IAmVigneswaran/Soothsayer-Citrana 
 * © 2026 Vigneswaran Rajkumar • Licensed under MIT License
 * Handles South Indian chart layout and functionality
 */
class SouthIndianChartTemplate {
    constructor(stage, layer) {
        this.stage = stage;
        this.layer = layer;
        this.chartGroupSouth = null;
        this.houseDataSouth = {};
        this.lagnaHouseSouth = 1;
        this._southIndicatorsVisible = true;
        this.selectedHouse = null; // Track selected Bhava for highlight

        if (stage && layer) {
            citranaDebug('South Indian Chart Template initialized with stage and layer');
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

    findHouseAtChartPoint(px, py) {
        for (const hNum in this.houseDataSouth) {
            const h = this.houseDataSouth[hNum];
            if (!h || h.width == null) continue;
            if (px >= h.x && px <= h.x + h.width && py >= h.y && py <= h.y + h.height) {
                return parseInt(hNum, 10);
            }
        }

        let closest = null;
        let closestDist = Infinity;
        for (const hNum in this.houseDataSouth) {
            const h = this.houseDataSouth[hNum];
            if (!h || h.width == null) continue;
            const centerX = h.x + h.width / 2;
            const centerY = h.y + h.height / 2;
            const distance = Math.hypot(px - centerX, py - centerY);
            const threshold = Math.max(h.width, h.height) / 2;
            if (distance < threshold && distance < closestDist) {
                closestDist = distance;
                closest = parseInt(hNum, 10);
            }
        }
        return closest;
    }

    createSouthIndianChart(options = {}) {
        const { initialLagna = 1, skipZoomToFit = false } = options;

        if (!this.stage || !this.layer) {
            console.error('Stage or layer not initialized');
            return;
        }

        this.clearChart();

        this.lagnaHouseSouth = initialLagna;

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
            // Top row (Bhavas 12, 1, 2, 3)
            {
                x: startX,
                y: startY,
                house: 12
            },
            {
                x: startX + houseSize,
                y: startY,
                house: 1
            },
            {
                x: startX + houseSize * 2,
                y: startY,
                house: 2
            },
            {
                x: startX + houseSize * 3,
                y: startY,
                house: 3
            },
            // Second row (Bhavas 11, empty, empty, 4)
            {
                x: startX,
                y: startY + houseSize,
                house: 11
            },
            {
                x: startX + houseSize * 3,
                y: startY + houseSize,
                house: 4
            },
            // Third row (Bhavas 10, empty, empty, 5)
            {
                x: startX,
                y: startY + houseSize * 2,
                house: 10
            },
            {
                x: startX + houseSize * 3,
                y: startY + houseSize * 2,
                house: 5
            },
            // Bottom row (Bhavas 9, 8, 7, 6)
            {
                x: startX,
                y: startY + houseSize * 3,
                house: 9
            },
            {
                x: startX + houseSize,
                y: startY + houseSize * 3,
                house: 8
            },
            {
                x: startX + houseSize * 2,
                y: startY + houseSize * 3,
                house: 7
            },
            {
                x: startX + houseSize * 3,
                y: startY + houseSize * 3,
                house: 6
            }
        ];

        positions.forEach(pos => {
            this.createHouse(pos.x, pos.y, houseSize, houseSize, pos.house);
        });

        // Fill the center 4 boxes with a single white rectangle with black border
        const centerRect = new Konva.Rect({
            x: startX + houseSize,
            y: startY + houseSize,
            width: houseSize * 2,
            height: houseSize * 2,
            fill: '#ffffff',
            stroke: '#374151',
            strokeWidth: 2,
            listening: false
        });
        this.chartGroupSouth.add(centerRect);

        // Add editable center text
        const centerText = new Konva.Text({
            x: startX + houseSize,
            y: startY + houseSize + houseSize / 2,
            width: houseSize * 2,
            height: houseSize,
            text: 'Rashi Chart 1\nD1',
            fontSize: 18,
            fontFamily: 'Arial Black, Arial, sans-serif',
            fontWeight: 'bold',
            fill: '#000000',
            align: 'center',
            verticalAlign: 'middle',
            draggable: false,
            name: 'center-label-text',
            listening: true
        });
        // In-place editing on double-click
        centerText.on('dblclick dbltap', () => {
            const stage = this.stage;
            const textRect = centerText.getClientRect({
                relativeTo: stage
            });
            const stageBox = stage.container().getBoundingClientRect();
            // Calculate position relative to viewport
            const areaPosition = {
                x: stageBox.left + textRect.x,
                y: stageBox.top + textRect.y
            };
            // Create textarea
            const textarea = document.createElement('textarea');
            textarea.className = 'konva-textarea';
            document.body.appendChild(textarea);
            textarea.value = centerText.text();
            const initialCenterText = centerText.text();
            // Style textarea to match the text bounding box
            textarea.style.position = 'absolute';
            textarea.style.top = areaPosition.y + 'px';
            textarea.style.left = areaPosition.x + 'px';
            textarea.style.width = textRect.width + 'px';
            textarea.style.height = Math.max(28, textRect.height - 8) + 'px';
            textarea.style.fontSize = centerText.fontSize() + 'px';
            textarea.style.lineHeight = centerText.fontSize() + 'px';
            textarea.style.fontFamily = centerText.fontFamily();
            textarea.style.color = centerText.fill();
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
            textarea.maxLength = 200;
            // Restrict to max 4 lines
            textarea.addEventListener('input', (e) => {
                const lines = textarea.value.split('\n');
                if (lines.length > 4) {
                    // Remove extra lines
                    textarea.value = lines.slice(0, 4).join('\n');
                }
            });
            // Save on blur or Enter
            const finishEditing = () => {
                const newText = textarea.value;
                centerText.text(newText);
                textarea.remove();
                this.layer.batchDraw();
                if (newText !== initialCenterText && window.app?.recordHistory) {
                    window.app.recordHistory('Edit centre label');
                }
            };
            textarea.addEventListener('blur', finishEditing);
            textarea.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    finishEditing();
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    textarea.value = centerText.text();
                    finishEditing();
                }
            });
            // Center the textarea in the viewport
            const textareaWidth = 400;
            const textareaHeight = Math.max(28, centerText.height() - 6);
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            textarea.style.width = textareaWidth + 'px';
            textarea.style.height = textareaHeight + 'px';
            textarea.style.left = ((viewportWidth - textareaWidth) / 2) + 'px';
            textarea.style.top = ((viewportHeight - textareaHeight) / 2) + 'px';
        });
        this.chartGroupSouth.add(centerText);

        this.layer.add(this.chartGroupSouth);
        this.layer.batchDraw();

        this.renumberHouses();
        this.applySouthIndicatorsPreference();

        if (!skipZoomToFit) {
            this.zoomToFit();
        }

        citranaDebug('South Indian chart created');
    }

    createHouse(x, y, width, height, houseNumber) {
        // Create Bhava rectangle
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

        const rashiName = CitranaRashis.getNumberForHouseIndex(houseNumber - 1);

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

        // Store Bhava data
        this.houseDataSouth[houseNumber] = {
            x: x,
            y: y,
            width: width,
            height: height,
            planets: [],
            houseRectSouth: house,
            rashiNumberSouthBox: rashiNumberSouthBox,
            rashiNumberSouthText: rashiNumberSouthText,
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
            fill: '#ffc600', // bright yellow
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
            fill: '#000000', // black text for bhava
            align: 'center',
            verticalAlign: 'middle',
            name: `bhavaNumberSouthText-${houseNumber}`
        });
        this.chartGroupSouth.add(bhavaNumberSouthBox);
        this.chartGroupSouth.add(bhavaNumberSouthText);
        // Store references for later updates
        this.houseDataSouth[houseNumber].bhavaNumberSouthBox = bhavaNumberSouthBox;
        this.houseDataSouth[houseNumber].bhavaNumberSouthText = bhavaNumberSouthText;

        // Draw Lagna indicator lines if this is the Lagna Bhava
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
            citranaDebug('South Indian Chart Bhava right-clicked:', houseNumber);
            e.evt.preventDefault();
            e.evt.stopPropagation();
            this.highlightHouse(houseNumber);
            window.app.contextMenu.showHouseMenu(e.evt.clientX, e.evt.clientY, houseNumber);
        });

        // Add click event for selection
        house.on('click', (e) => {
            this.clearSelectedPlanet();
            this.highlightHouse(houseNumber);
            window.selectedBhavaSouth = houseNumber;
            citranaDebug('[SELECT] South Indian Chart Bhava selected:', houseNumber);
        });

        // Add touch event for mobile selection
        house.on('tap', (e) => {
            this.clearSelectedPlanet();
            this.highlightHouse(houseNumber);
            window.selectedBhavaSouth = houseNumber;
            citranaDebug('[SELECT] South Indian Chart Bhava selected via touch:', houseNumber);
        });
    }

    highlightHouse(houseNumber) {
        // Remove highlight from previous
        if (this.selectedHouse && this.houseDataSouth[this.selectedHouse]) {
            this.houseDataSouth[this.selectedHouse].houseRectSouth.fill('#ffffff');
        }
        // Highlight new
        if (this.houseDataSouth[houseNumber]) {
            this.houseDataSouth[houseNumber].houseRectSouth.fill('#f3f4f6'); // Light grey highlight
            this.selectedHouse = houseNumber;
            this.layer.batchDraw();
        }
        window.app?.notifyCanvasSelectionChanged?.();
    }

    clearHighlight() {
        if (this.selectedHouse && this.houseDataSouth[this.selectedHouse]) {
            this.houseDataSouth[this.selectedHouse].houseRectSouth.fill('#ffffff');
            this.selectedHouse = null;
            this.layer.batchDraw();
        }
        window.app?.notifyCanvasSelectionChanged?.();
    }

    // --- Robust Graha Management ---
    addPlanetToHouse(planetAbbr, houseNumber, label = null, id = null, retrograde = false, skipSnapshot = false) {
        const house = this.houseDataSouth[houseNumber];
        if (!house) return;
        if (!house.planets) house.planets = [];
        // Use unique ID for each Graha instance
        const planetId = id || (Date.now().toString(36) + Math.random().toString(36).substr(2, 5));
        const planet = window.app.planetSystem.getPlanetInfo(planetAbbr);
        const planetColor = planet ? planet.color : '#000000';
        let resolvedLabel = label || planetAbbr;
        let resolvedRetrograde = retrograde;
        if (resolvedLabel.includes('ᵣ')) {
            resolvedRetrograde = true;
            resolvedLabel = resolvedLabel.replace(/ᵣ/g, '');
        }
        house.planets.push({
            abbr: planetAbbr,
            label: resolvedLabel,
            id: planetId,
            color: planetColor,
            retrograde: resolvedRetrograde
        });
        this.updatePlanetsInHouse(houseNumber);
        if (!skipSnapshot && window.app?.recordHistory) window.app.recordHistory('Add Graha');
        citranaDebug(`[ADD] Graha ${planetAbbr} (id=${planetId}) added to Bhava ${houseNumber}`);
    }

    removePlanetFromHouseById(houseNumber, planetId, skipSnapshot = false) {
        const house = this.houseDataSouth[houseNumber];
        if (!house || !house.planets) return;
        house.planets = house.planets.filter((planet) => planet.id !== planetId);
        this.updatePlanetsInHouse(houseNumber);
        this.layer.batchDraw();
        this.clearSelectedPlanet();
        if (!skipSnapshot && window.app?.recordHistory) window.app.recordHistory('Remove Graha');
    }

    updatePlanetsInHouse(houseNumber) {
        const house = this.houseDataSouth[houseNumber];
        if (!house) return;
        // Remove all existing Graha texts for this Bhava
        this.chartGroupSouth.getChildren(node => node.name() && node.name().startsWith(`planet-`) && node.name().includes(`-${houseNumber}-`)).forEach(node => node.destroy());
        // Calculate font size based on number of Grahas
        const n = house.planets.length;
        const BASE_FONT = 24;
        const MIN_FONT = 14;
        const STEP = 4;
        const fontSize = Math.max(MIN_FONT, BASE_FONT - (n - 1) * STEP);
        // Perfectly center all Graha texts both horizontally and vertically in the Bhava
        const totalHeight = n * fontSize + (n - 1) * 4;
        const startY = house.y + house.height / 2 - totalHeight / 2;
        house.planets.forEach((planetObj, i) => {
            const planet = window.app.planetSystem.getPlanetInfo(planetObj.abbr);
            const planetY = startY + i * (fontSize + 4);

            // Transparent hit area for easier click/right-click (not draggable)
            const hitRect = new Konva.Rect({
                x: house.x + house.width / 2 - fontSize,
                y: planetY - fontSize / 2,
                width: fontSize * 2,
                height: fontSize,
                fill: 'rgba(0,0,0,0)',
                name: `planet-hit-${planetObj.id}`,
                listening: true,
                draggable: false
            });

            // Safari-specific: Add touch event handling to hit rect
            hitRect.on('touchstart', () => {
                citranaDebug(`Touch start for hit rect of Graha ${planetObj.abbr} from Bhava ${houseNumber}`);
            });

            // The Graha text - perfectly centered
            const isMobile = CitranaDevice.isMobileUA();
            const planetText = new Konva.Text({
                x: house.x + house.width / 2,
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
                planetText.x(house.x + house.width / 2 - textWidth / 2);
                planetText.y(planetY - textHeight / 2);
                this.layer.batchDraw();
            }, 10);

            planetText._planetHouseNumber = houseNumber;
            planetText._planetId = planetObj.id;

            // Safari-specific: Ensure draggable is properly set
            setTimeout(() => {
                planetText.draggable(true);
            }, 10);

            // Safari-specific: Add touch event handling
            planetText.on('touchstart', () => {
                citranaDebug(`Touch start for Graha ${planetObj.abbr} from Bhava ${houseNumber}`);
            });

            // Make Graha text editable with live preview
            if (window.app && window.app.drawingTools) {
                window.app.drawingTools.makePlanetTextEditable(planetText, (newLabel, newColor, newRetrograde) => {
                    // Update the Graha label in the Bhava data
                    const planetIndex = house.planets.findIndex(p => p.id === planetObj.id);
                    if (planetIndex !== -1) {
                        house.planets[planetIndex].label = newLabel;
                        house.planets[planetIndex].color = newColor;
                        house.planets[planetIndex].retrograde = !!newRetrograde;
                        // Update the Graha text and color
                        planetText.text(newLabel);
                        planetText.fill(newColor);
                        planetText.textDecoration(newRetrograde ? 'underline' : '');

                        // Re-center the text after editing
                        setTimeout(() => {
                            const textWidth = planetText.width();
                            const textHeight = planetText.height();
                            planetText.x(house.x + house.width / 2 - textWidth / 2);
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
                this.selectPlanet(planetText, houseNumber, planetObj.abbr, planetObj.id);
            };
            hitRect.on('click', selectHandler);
            hitRect.on('tap', selectHandler);
            planetText.on('click', selectHandler);
            planetText.on('tap', selectHandler);
            // Right-click context menu
            const contextHandler = (e) => {
                e.evt.preventDefault();
                e.evt.stopPropagation();
                this.selectPlanet(planetText, houseNumber, planetObj.abbr, planetObj.id);
                window.app.contextMenu.showPlanetMenu(e.evt.clientX, e.evt.clientY, houseNumber, planetObj.abbr, planetObj.id);
            };
            hitRect.on('contextmenu', contextHandler);
            planetText.on('contextmenu', contextHandler);

            // Drag-and-drop between bhavas (label only; hit rect is for selection)
            const dragStartHandler = (e) => {
                citranaDebug(`Drag start for Graha ${planetObj.abbr} from Bhava ${houseNumber}`);

                planetText.opacity(0.5);
                if (this.selectedPlanet?.planetText === planetText) {
                    CitranaSelection?.sync?.(planetText);
                }
                planetText.moveToTop();
                hitRect.moveToTop();
                this.layer.batchDraw();
                citranaDebug(`[DRAGSTART] Graha ${planetObj.abbr} (id=${planetObj.id}) from Bhava ${houseNumber}`);
            };

            const dragMoveHandler = () => {
                if (this.selectedPlanet?.planetText === planetText) {
                    CitranaSelection?.sync?.(planetText);
                    hitRect.moveToTop();
                    planetText.moveToTop();
                    this.layer.batchDraw();
                }
            };

            const dragEndHandler = (e) => {
                planetText.opacity(1);

                const coordinator = window.app?.chartTemplates;
                const targetHouse = coordinator?.resolveDropHouse({
                    event: e,
                    chartLocalX: planetText.x(),
                    chartLocalY: planetText.y()
                }) ?? null;

                if (targetHouse && targetHouse !== houseNumber) {
                    // Move Graha to new Bhava by ID
                    this.removePlanetFromHouseById(houseNumber, planetObj.id, true);
                    this.addPlanetToHouse(planetObj.abbr, targetHouse, planetObj.label, planetObj.id, planetObj.retrograde, true);
                    // Update the color of the moved Graha
                    const targetHouseData = this.houseDataSouth[targetHouse];
                    if (targetHouseData && targetHouseData.planets) {
                        const movedPlanet = targetHouseData.planets.find(p => p.id === planetObj.id);
                        if (movedPlanet) {
                            movedPlanet.color = planetObj.color;
                        }
                    }
                    this.updatePlanetsInHouse(targetHouse);
                    if (window.app?.recordHistory) window.app.recordHistory('Move Graha');
                    citranaDebug(`[DROP] Planet ${planetObj.abbr} (id=${planetObj.id}) moved to Bhava ${targetHouse}`);
                } else {
                    // Snap back to original position
                    this.updatePlanetsInHouse(houseNumber);
                    citranaDebug(`[SNAPBACK] Planet ${planetObj.abbr} (id=${planetObj.id}) - Target Bhava: ${targetHouse}, Original Bhava: ${houseNumber}`);
                }
                this.layer.batchDraw();
            };

            planetText.on('dragstart', dragStartHandler);
            planetText.on('dragmove', dragMoveHandler);
            planetText.on('dragend', dragEndHandler);
            this.chartGroupSouth.add(hitRect);
            this.chartGroupSouth.add(planetText);
            hitRect.moveToTop();
            planetText.moveToTop();
        });

        this.restorePlanetSelectionInHouse(houseNumber);
        window.app?.drawingTools?.raiseDrawingsAboveChart?.();
        this.layer.batchDraw();
    }

    restorePlanetSelectionInHouse(houseNumber) {
        const selectedId = this.selectedPlanet?.id;
        const selectedHouse = this.selectedPlanet?.houseNumber;
        if (!selectedId || selectedHouse !== houseNumber) {
            return;
        }

        const house = this.houseDataSouth[houseNumber];
        const planet = house?.planets?.find((p) => p.id === selectedId);
        const planetText = this.chartGroupSouth.findOne((node) => node.getAttr?.('_planetId') === selectedId);
        if (!planet || !planetText) {
            this.clearSelectedPlanet();
            return;
        }

        this.selectedPlanet = null;
        this.selectPlanet(planetText, houseNumber, planet.abbr, selectedId);
    }

    // --- Selection and Keyboard Delete ---
    selectPlanet(planetText, houseNumber, abbr, id) {
        window.app?.chartTemplates?.northIndianTemplate?.clearSelectedPlanet?.();
        window.app?.drawingTools?.clearSelection?.();
        window.app?.drawingTools?.editUI?.hide?.();
        this.clearSelectedPlanet({ notify: false });

        const parent = planetText.getParent();
        if (typeof CitranaSelection !== 'undefined' && parent) {
            CitranaSelection.attach(planetText, parent);
            const hitRect = parent.findOne((node) => node.name() === `planet-hit-${id}`);
            hitRect?.moveToTop();
            planetText.moveToTop();
        }

        this.selectedPlanet = {
            planetText,
            houseNumber,
            abbr,
            id
        };
        this.layer.batchDraw();
        window.app?.notifyCanvasSelectionChanged?.();
    }
    clearSelectedPlanet({ notify = true } = {}) {
        if (this.selectedPlanet?.planetText) {
            CitranaSelection?.detach?.(this.selectedPlanet.planetText);
        }
        this.selectedPlanet = null;
        this.layer.batchDraw();
        if (notify) {
            window.app?.notifyCanvasSelectionChanged?.();
        }
    }

    setLagnaHouse(houseNumber, options = {}) {
        const { skipSnapshot = false } = options;
        citranaDebug('setLagnaHouse called with Bhava number:', houseNumber);
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
        this.applySouthIndicatorsPreference();
        if (!skipSnapshot && window.app?.recordHistory) window.app.recordHistory('Set Lagna');
        citranaDebug(`Lagna set to Bhava ${houseNumber}`);
    }

    /**
     * Get the bhava number (1–12 from Lagna) for a fixed grid Bhava position.
     * Rashis are fixed per cell in the South Indian layout; bhava counting rotates with Lagna.
     * @param {number} houseNumber - Fixed grid Bhava number (1–12)
     * @returns {number} Bhava number relative to current Lagna
     */
    getBhavaNumberForHouse(houseNumber) {
        const visualOrder = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
        const lagnaIdx = visualOrder.indexOf(this.lagnaHouseSouth);
        const houseOrder = visualOrder.slice(lagnaIdx).concat(visualOrder.slice(0, lagnaIdx));
        const bhavaIdx = houseOrder.indexOf(houseNumber);
        return bhavaIdx >= 0 ? bhavaIdx + 1 : houseNumber;
    }

    renumberHouses() {
        // Visual order for South Indian chart (Bhava numbers)
        const visualOrder = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
        let houseOrder;

        // Rotate visual order so Lagna is first
        const lagnaIdx = visualOrder.indexOf(this.lagnaHouseSouth);
        houseOrder = visualOrder.slice(lagnaIdx).concat(visualOrder.slice(0, lagnaIdx));

        for (let i = 0; i < houseOrder.length; i++) {
            const houseNum = houseOrder[i];
            const bhavaNum = i + 1;

            // Update South Indian chart bhava numbers
            if (this.houseDataSouth[houseNum] && this.houseDataSouth[houseNum].bhavaNumberSouthText) {
                this.houseDataSouth[houseNum].bhavaNumberSouthText.text(bhavaNum.toString());
            }
        }

        this.layer.batchDraw();
        citranaDebug('South Indian Bhavas renumbered');
    }

    /**
     * Show or hide Lagna line, bhava number boxes, and rashi number boxes on all Bhavas.
     * @param {boolean} visible
     */
    setSouthIndicatorsVisible(visible) {
        this._southIndicatorsVisible = visible;
        for (let houseNum = 1; houseNum <= 12; houseNum++) {
            const data = this.houseDataSouth[houseNum];
            if (!data) continue;
            if (data.rashiNumberSouthBox) data.rashiNumberSouthBox.visible(visible);
            if (data.rashiNumberSouthText) data.rashiNumberSouthText.visible(visible);
            if (data.bhavaNumberSouthBox) data.bhavaNumberSouthBox.visible(visible);
            if (data.bhavaNumberSouthText) data.bhavaNumberSouthText.visible(visible);
            if (data.lagnaLinesSouth) {
                data.lagnaLinesSouth.forEach((line) => line.visible(visible));
            }
        }
        this.layer?.batchDraw();
    }

    /** Apply user preference from app.options (default: indicators visible). */
    applySouthIndicatorsPreference() {
        const hide = window.app?.options?.southHideIndicators === true;
        this.setSouthIndicatorsVisible(!hide);
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

        citranaDebug('South Indian chart cleared');
    }

    zoomToFit() {
        if (!this.stage || !this.chartGroupSouth) return;

        const stageWidth = this.stage.width();
        const stageHeight = this.stage.height();

        // Convert screen bounds to local bounds (unaffected by current zoom/pan)
        const chartBounds = this.chartGroupSouth.getClientRect();
        const scale = this.stage.scaleX();
        const stagePos = this.stage.position();
        const localBounds = {
            x: (chartBounds.x - stagePos.x) / scale,
            y: (chartBounds.y - stagePos.y) / scale,
            width: chartBounds.width / scale,
            height: chartBounds.height / scale
        };

        // Detect mobile vs desktop (Zoom to fit)
        const isMobile = CitranaDevice.isCompactViewport();
        const scaleFactor = isMobile ? 0.95 : 0.7;
        const extraTopMargin = isMobile ? 20 : 20;

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
    }

    extractSerializablePlanets(houseData = this.houseDataSouth) {
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
            const houseNumber = parseInt(houseNum, 10);
            if (!houseNumber) continue;
            for (const planet of planetsByHouse[houseNum]) {
                this.addPlanetToHouse(
                    planet.abbr,
                    houseNumber,
                    planet.label,
                    planet.id,
                    !!planet.retrograde,
                    skipSnapshot
                );
            }
        }
    }

    getChartData() {
        let centerLabel = null;
        if (this.chartGroupSouth) {
            const centerText = this.chartGroupSouth.findOne((node) => node.name() === 'center-label-text');
            if (centerText) {
                centerLabel = centerText.text();
            }
        }

        return {
            chartType: 'south-indian',
            lagnaHouse: this.lagnaHouseSouth,
            planetsByHouse: this.extractSerializablePlanets(),
            centerLabel
        };
    }

    loadChartData(data) {
        if (!data || data.chartType !== 'south-indian') return;

        try {
            const lagnaHouse = data.lagnaHouse || 1;
            const planetsByHouse = this.parseSavedPlanets(data);

            this.createSouthIndianChart({ initialLagna: lagnaHouse, skipZoomToFit: true });
            this.restoreSavedPlanets(planetsByHouse, true);
            this.setLagnaHouse(lagnaHouse, { skipSnapshot: true });

            if (data.centerLabel && this.chartGroupSouth) {
                const centerText = this.chartGroupSouth.findOne((node) => node.name() === 'center-label-text');
                if (centerText) {
                    centerText.text(data.centerLabel);
                    this.layer.batchDraw();
                }
            }

            citranaDebug('South Indian chart data loaded successfully');
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
        citranaDebug('All Grahas cleared from South Indian chart');
    }
}