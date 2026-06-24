/**
 * citrana-debug.js
 * Citrana • https://github.com/IAmVigneswaran/Soothsayer-Citrana
 * © 2026 Vigneswaran Rajkumar • Licensed under MIT License
 * Optional debug logging for contributors (enabled by default).
 */
window.citranaDebug = (...args) => {
    const disabled = window.CITRANA_DEBUG === false
        || (typeof localStorage !== 'undefined' && localStorage.getItem('citrana_debug') === '0');
    if (!disabled) {
        console.log(...args);
    }
};
