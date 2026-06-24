/**
 * citrana-rashis.js
 * Citrana • https://github.com/IAmVigneswaran/Soothsayer-Citrana
 * © 2026 Vigneswaran Rajkumar • Licensed under MIT License
 * Shared Rashi names, Lucide zodiac icons, and South Indian grid numbers (1–12)
 */
const CitranaRashis = (() => {
    const RASHIS = [
        { name: 'Aries', icon: 'zodiac-aries', number: '1' },
        { name: 'Taurus', icon: 'zodiac-taurus', number: '2' },
        { name: 'Gemini', icon: 'zodiac-gemini', number: '3' },
        { name: 'Cancer', icon: 'zodiac-cancer', number: '4' },
        { name: 'Leo', icon: 'zodiac-leo', number: '5' },
        { name: 'Virgo', icon: 'zodiac-virgo', number: '6' },
        { name: 'Libra', icon: 'zodiac-libra', number: '7' },
        { name: 'Scorpio', icon: 'zodiac-scorpio', number: '8' },
        { name: 'Sagittarius', icon: 'zodiac-sagittarius', number: '9' },
        { name: 'Capricorn', icon: 'zodiac-capricorn', number: '10' },
        { name: 'Aquarius', icon: 'zodiac-aquarius', number: '11' },
        { name: 'Pisces', icon: 'zodiac-pisces', number: '12' }
    ];

    const NAMES = RASHIS.map((r) => r.name);
    const NUMBERS = RASHIS.map((r) => r.number);

    function getName(rashiNumber) {
        return NAMES[rashiNumber - 1] || 'Unknown';
    }

    function getNumberForHouseIndex(houseIndex0to11) {
        return NUMBERS[houseIndex0to11 % 12];
    }

    function iconHtml(icon) {
        if (!icon) {
            return '';
        }
        return `<span class="zodiac-icon" aria-hidden="true"><i data-lucide="${icon}"></i></span>`;
    }

    return {
        RASHIS,
        NAMES,
        NUMBERS,
        getName,
        getNumberForHouseIndex,
        iconHtml
    };
})();
