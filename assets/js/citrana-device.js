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

    /** Mobile / tablet UA (font weight, compact layout hints, etc.) */
    function isMobileUA() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    /** Compact chart layout breakpoint (matches CSS 600px mobile fit factor). */
    function isCompactViewport() {
        return window.innerWidth <= 600;
    }

    /** Laser pointer — available on all viewports including mobile/touch. */
    function isLaserViewport() {
        return true;
    }

    /** True when the primary input supports hover (desktop mouse/trackpad). */
    function hasFinePointer() {
        return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    }

    return {
        isTouchDevice,
        isMobileUA,
        isCompactViewport,
        isLaserViewport,
        hasFinePointer
    };
})();
