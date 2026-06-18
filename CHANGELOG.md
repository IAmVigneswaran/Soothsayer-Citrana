# Changelog

### 2.0.0

**🎉 Released:**
- TBD

**🔧 Improvements:**
- Retrograde Grahas are now shown with **underlined text** instead of a Unicode subscript character (`ᵣ`), making retrograde status easier to read on the chart.
- The retrograde toggle in the Graha editing panel now applies underline styling directly, without appending extra characters to the Graha label.
- The 8-character Graha name limit now applies only to the label text; retrograde no longer uses a character slot.
- Graha right-click menu simplified to **Edit Graha** and **Delete Graha**, opening the same editing panel as double-click or removing the Graha from the chart.
- House right-click menus are now chart-type specific: **South Indian** shows **Set as Lagna (Ascendant)** only; **North Indian** shows **Set as First House** only.
- Removed **Set as Lagna** from the South Indian chart-level context menu; North Indian **Set Lagna as…** (zodiac) remains on chart right-click.
- Updated Help modal, Welcome modal, and README for accurate North Indian Lagna instructions and browser-session data guidance.
- South Indian house menu header now shows **House** numbering from the current Lagna position (fixed Rashi grid, rotating house count).
- Fixed in-session auto-save so chart Grahas, Lagna, and drawings serialize correctly to local storage during a visit; page refresh still starts a fresh session.
- **Clear House** now removes all Grahas from the selected bhava.

**🐛 Bug Fixes:**
- Fixed Graha and bhava right-click menus being overridden by the main chart context menu.
- Fixed dead context menu code that prevented **Edit Graha** and **Delete Graha** from running.
- Fixed **Set as First House** on North Indian charts so the Rashi in the clicked house becomes Lagna (e.g. selecting Cancer correctly sets Cancer Ascendant).

---

### 1.0.0

**🎉 Released:**
- 9th August 2025

This is the first public release of **Citrana**!
