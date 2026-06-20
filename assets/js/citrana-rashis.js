/**
 * citrana-rashis.js
 * Citrana • https://github.com/IAmVigneswaran/Soothsayer-Citrana
 * © 2026 Vigneswaran Rajkumar • Licensed under MIT License
 * Shared Rashi names, symbols, and South Indian grid numbers (1–12)
 */
const CitranaRashis = (() => {
    const RASHIS = [
        { name: 'Aries', symbol: '\u2648', number: '1' },
        { name: 'Taurus', symbol: '\u2649', number: '2' },
        { name: 'Gemini', symbol: '\u264A', number: '3' },
        { name: 'Cancer', symbol: '\u264B', number: '4' },
        { name: 'Leo', symbol: '\u264C', number: '5' },
        { name: 'Virgo', symbol: '\u264D', number: '6' },
        { name: 'Libra', symbol: '\u264E', number: '7' },
        { name: 'Scorpio', symbol: '\u264F', number: '8' },
        { name: 'Sagittarius', symbol: '\u2650', number: '9' },
        { name: 'Capricorn', symbol: '\u2651', number: '10' },
        { name: 'Aquarius', symbol: '\u2652', number: '11' },
        { name: 'Pisces', symbol: '\u2653', number: '12' }
    ];

    const NAMES = RASHIS.map((r) => r.name);
    const NUMBERS = RASHIS.map((r) => r.number);

    function getName(rashiNumber) {
        return NAMES[rashiNumber - 1] || 'Unknown';
    }

    function getNumberForHouseIndex(houseIndex0to11) {
        return NUMBERS[houseIndex0to11 % 12];
    }

    return {
        RASHIS,
        NAMES,
        NUMBERS,
        getName,
        getNumberForHouseIndex
    };
})();
