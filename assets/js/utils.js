/**
 * utils.js
 * Citrana • https://github.com/IAmVigneswaran/Soothsayer-Citrana 
 * © 2025 Vigneswaran Rajkumar • Licensed under MIT License
 * Utility functions for common operations across the application
 */

/**
 * Utility class for common operations
 */
class Utils {
    /**
     * Debounce function for performance optimization
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Update status text
     */
    static updateStatus(message) {
        const statusText = document.getElementById('status-text');
        if (statusText) {
            statusText.textContent = message;
        }
        console.log('Status:', message);
    }

    /**
     * Show notification
     */
    static showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium transition-all duration-300 transform translate-x-full`;

        // Set background color based on type
        switch (type) {
            case 'success':
                notification.style.backgroundColor = '#10B981';
                break;
            case 'error':
                notification.style.backgroundColor = '#EF4444';
                break;
            case 'warning':
                notification.style.backgroundColor = '#F59E0B';
                break;
            default:
                notification.style.backgroundColor = '#3B82F6';
        }

        notification.textContent = message;
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(full)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    /**
     * Save chart data to localStorage
     */
    static saveChartData(data) {
        try {
            localStorage.setItem('citranaChartData', JSON.stringify(data));
            console.log('Chart data saved');
        } catch (error) {
            console.error('Failed to save chart data:', error);
        }
    }

    /**
     * Load chart data from localStorage
     */
    static loadChartData() {
        try {
            const data = localStorage.getItem('citranaChartData');
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Failed to load chart data:', error);
        }
    }

    /**
     * Clear chart data from localStorage
     */
    static clearChartData() {
        try {
            localStorage.removeItem('citranaChartData');
            console.log('Chart data cleared');
        } catch (error) {
            console.error('Failed to clear chart data:', error);
        }
    }

    /**
     * Export canvas as PNG
     */
    static exportCanvasAsPNG(stage, filename = 'vedic-chart.png') {
        try {
            const dataURL = stage.toDataURL();
            const link = document.createElement('a');
            link.download = filename;
            link.href = dataURL;
            link.click();
            console.log('Chart exported as PNG');
        } catch (error) {
            console.error('Failed to export chart:', error);
            throw error;
        }
    }

    /**
     * Calculate distance between two points
     */
    static distance(point1, point2) {
        const dx = point2.x - point1.x;
        const dy = point2.y - point1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Check if point is inside rectangle
     */
    static pointInRect(point, rect) {
        return point.x >= rect.left &&
            point.x <= rect.left + rect.width &&
            point.y >= rect.top &&
            point.y <= rect.top + rect.height;
    }

    /**
     * Format coordinates for display
     */
    static formatCoordinates(x, y) {
        return `${Math.round(x)}, ${Math.round(y)}`;
    }

    /**
     * Generate unique ID
     */
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Validate chart data
     */
    static validateChartData(data) {
        if (!data) return false;

        const requiredFields = ['type', 'lagna', 'firstHouse', 'houses'];
        return requiredFields.every(field => data.hasOwnProperty(field));
    }

    /**
     * Get chart statistics
     */
    static getChartStatistics(chartData) {
        if (!chartData || !chartData.houses) return null;

        const stats = {
            totalPlanets: 0,
            housesWithPlanets: 0,
            emptyHouses: [],
            planetDistribution: {}
        };

        chartData.houses.forEach((house, index) => {
            const planetCount = house.length;
            stats.totalPlanets += planetCount;

            if (planetCount > 0) {
                stats.housesWithPlanets++;
                house.forEach(planet => {
                    stats.planetDistribution[planet] = (stats.planetDistribution[planet] || 0) + 1;
                });
            } else {
                stats.emptyHouses.push(index + 1);
            }
        });

        return stats;
    }

    /**
     * Format file size
     */
    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Copy text to clipboard
     */
    static async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            return false;
        }
    }

    /**
     * Download data as file
     */
    static downloadFile(data, filename, type = 'text/plain') {
        const blob = new Blob([data], {
            type
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    }

    /**
     * Get current timestamp
     */
    static getTimestamp() {
        return new Date().toISOString();
    }

    /**
     * Format date for display
     */
    static formatDate(date) {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }

    /**
     * Check if device is mobile
     */
    static isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    /**
     * Check if device supports touch
     */
    static isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    /**
     * Get device pixel ratio
     */
    static getPixelRatio() {
        return window.devicePixelRatio || 1;
    }

    /**
     * Throttle function for performance
     */
    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Deep clone object
     */
    static deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => Utils.deepClone(item));
        if (typeof obj === 'object') {
            const clonedObj = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = Utils.deepClone(obj[key]);
                }
            }
            return clonedObj;
        }
    }

    /**
     * Merge objects
     */
    static merge(target, ...sources) {
        sources.forEach(source => {
            for (const key in source) {
                if (source.hasOwnProperty(key)) {
                    if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
                        target[key] = target[key] || {};
                        Utils.merge(target[key], source[key]);
                    } else {
                        target[key] = source[key];
                    }
                }
            }
        });
        return target;
    }
}

// Export for use in other modules
window.Utils = Utils;