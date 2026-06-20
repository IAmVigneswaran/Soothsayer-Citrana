/**
 * citrana-device.js
 * Citrana • https://github.com/IAmVigneswaran/Soothsayer-Citrana
 * © 2026 Vigneswaran Rajkumar • Licensed under MIT License
 * Shared touch, mobile UA, and viewport helpers
 */
const CitranaDevice = (() => {
    function isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    /** Mobile / tablet UA (font weight, laser exclusion, etc.) */
    function isMobileUA() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    /** Compact chart layout breakpoint (matches CSS 600px mobile fit factor). */
    function isCompactViewport() {
        return window.innerWidth <= 600;
    }

    /** Desktop-wide viewport and non-mobile UA — laser pointer availability. */
    function isLaserViewport() {
        return window.matchMedia('(min-width: 769px)').matches && !isMobileUA();
    }

    return {
        isTouchDevice,
        isMobileUA,
        isCompactViewport,
        isLaserViewport
    };
})();
