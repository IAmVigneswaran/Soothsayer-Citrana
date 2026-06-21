/**
 * citrana-session.js
 * Citrana • https://github.com/IAmVigneswaran/Soothsayer-Citrana
 * © 2026 Vigneswaran Rajkumar • Licensed under MIT License
 * Save and open .citrana.json session files (chart, Grahas, drawings, options)
 */
const CitranaSession = (() => {
    const FORMAT = 'citrana-session';
    const VERSION = 1;
    const FILE_EXTENSION = '.citrana.json';

    const CHART_TYPES = new Set([null, 'south-indian', 'north-indian']);

    function isValidFileName(fileName) {
        return typeof fileName === 'string'
            && fileName.toLowerCase().endsWith(FILE_EXTENSION);
    }

    function isBoolean(value) {
        return value === true || value === false;
    }

    function validateChartData(chartData) {
        if (!chartData || typeof chartData !== 'object' || Array.isArray(chartData)) {
            throw new Error('Session file is missing valid chart data.');
        }

        const chartType = chartData.chartType ?? null;
        if (!CHART_TYPES.has(chartType)) {
            throw new Error('Session file contains an unsupported chart type.');
        }

        if (chartType && (typeof chartData.lagnaHouse !== 'number' || chartData.lagnaHouse < 1 || chartData.lagnaHouse > 12)) {
            throw new Error('Session file contains an invalid Lagna value.');
        }

        if (chartData.planetsByHouse != null && (typeof chartData.planetsByHouse !== 'object' || Array.isArray(chartData.planetsByHouse))) {
            throw new Error('Session file contains invalid Graha data.');
        }

        return true;
    }

    function validateOptions(options) {
        if (!options || typeof options !== 'object' || Array.isArray(options)) {
            throw new Error('Session file is missing valid options.');
        }

        if (!isBoolean(options.northHideIndicators)
            || !isBoolean(options.southHideIndicators)
            || !isBoolean(options.saveChartOnly)) {
            throw new Error('Session file contains invalid options.');
        }

        return true;
    }

    /**
     * @param {unknown} data Parsed JSON from a session file
     * @returns {object} Normalised session payload
     */
    function validate(data) {
        if (!data || typeof data !== 'object' || Array.isArray(data)) {
            throw new Error('Session file is not a valid Citrana session.');
        }

        if (data.format !== FORMAT) {
            throw new Error('This file is not a Citrana session.');
        }

        if (data.version !== VERSION) {
            throw new Error('This session file uses an unsupported format version and cannot be opened.');
        }

        validateChartData(data.chartData);
        validateOptions(data.options);

        if (data.drawingData != null && !Array.isArray(data.drawingData)) {
            throw new Error('Session file contains invalid annotation data.');
        }

        return {
            format: FORMAT,
            version: VERSION,
            exportedAt: typeof data.exportedAt === 'string' ? data.exportedAt : null,
            chartData: data.chartData,
            drawingData: Array.isArray(data.drawingData) ? data.drawingData : [],
            options: {
                northHideIndicators: data.options.northHideIndicators,
                southHideIndicators: data.options.southHideIndicators,
                saveChartOnly: data.options.saveChartOnly
            }
        };
    }

    /**
     * @param {object} app Citrana application instance
     */
    function capture(app) {
        if (!app || typeof app.captureHistoryState !== 'function') {
            throw new Error('Citrana is not ready to save a session.');
        }

        const { chartData, drawingData } = app.captureHistoryState();

        return {
            format: FORMAT,
            version: VERSION,
            exportedAt: new Date().toISOString(),
            chartData,
            drawingData,
            options: {
                northHideIndicators: !!app.options?.northHideIndicators,
                southHideIndicators: !!app.options?.southHideIndicators,
                saveChartOnly: !!app.options?.saveChartOnly
            }
        };
    }

    /**
     * @param {object} app Citrana application instance
     * @param {{ northHideIndicators: boolean, southHideIndicators: boolean, saveChartOnly: boolean }} options
     */
    function applyOptions(app, options) {
        if (!app || !options) return;

        if (typeof app.setNorthHideIndicators === 'function') {
            app.setNorthHideIndicators(!!options.northHideIndicators);
        }
        if (typeof app.setSouthHideIndicators === 'function') {
            app.setSouthHideIndicators(!!options.southHideIndicators);
        }
        if (typeof app.setSaveChartOnly === 'function') {
            app.setSaveChartOnly(!!options.saveChartOnly);
        }
        if (typeof app.syncOptionsUI === 'function') {
            app.syncOptionsUI();
        }
    }

    function buildExportFileName(date = new Date()) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `citrana-session-${year}-${month}-${day}-${hours}${minutes}${seconds}${FILE_EXTENSION}`;
    }

    function download(session) {
        const json = JSON.stringify(session, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = buildExportFileName();
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        citranaDebug('Session saved:', link.download);
        return link.download;
    }

    /**
     * @param {File} file
     * @returns {Promise<object>}
     */
    function readFile(file) {
        return new Promise((resolve, reject) => {
            if (!(file instanceof File)) {
                reject(new Error('No session file was selected.'));
                return;
            }

            if (!isValidFileName(file.name)) {
                reject(new Error(`Only ${FILE_EXTENSION} files can be opened.`));
                return;
            }

            const reader = new FileReader();

            reader.onload = () => {
                try {
                    const parsed = JSON.parse(String(reader.result ?? ''));
                    resolve(validate(parsed));
                } catch (error) {
                    reject(error instanceof Error ? error : new Error('Session file could not be read.'));
                }
            };

            reader.onerror = () => {
                reject(new Error('Session file could not be read.'));
            };

            reader.readAsText(file);
        });
    }

    return {
        FORMAT,
        VERSION,
        FILE_EXTENSION,
        isValidFileName,
        validate,
        capture,
        applyOptions,
        buildExportFileName,
        download,
        readFile
    };
})();
