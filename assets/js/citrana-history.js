/**
 * citrana-history.js
 * Citrana • https://github.com/IAmVigneswaran/Soothsayer-Citrana
 * © 2026 Vigneswaran Rajkumar • Licensed under MIT License
 * Unified undo/redo timeline for chart and drawing state
 */
class CitranaHistory {
    constructor(options = {}) {
        this.maxSteps = options.maxSteps ?? 50;
        this.captureState = options.captureState;
        this.restoreState = options.restoreState;
        this.entries = [];
        this.index = -1;
        this._restoring = false;
    }

    record(label = 'Edit') {
        if (this._restoring || typeof this.captureState !== 'function') {
            return;
        }

        const state = this.captureState();
        if (!state) return;

        if (this.index < this.entries.length - 1) {
            this.entries = this.entries.slice(0, this.index + 1);
        }

        this.entries.push({
            label,
            state: JSON.parse(JSON.stringify(state)),
            timestamp: Date.now()
        });
        this.index = this.entries.length - 1;

        while (this.entries.length > this.maxSteps) {
            this.entries.shift();
            this.index--;
        }

        citranaDebug('[history] record:', label, `(${this.index + 1}/${this.entries.length})`);
    }

    canUndo() {
        return this.index > 0;
    }

    canRedo() {
        return this.index >= 0 && this.index < this.entries.length - 1;
    }

    undo() {
        if (!this.canUndo()) return false;
        this.index--;
        this._apply(this.entries[this.index].state);
        citranaDebug('[history] undo →', this.entries[this.index].label);
        return true;
    }

    redo() {
        if (!this.canRedo()) return false;
        this.index++;
        this._apply(this.entries[this.index].state);
        citranaDebug('[history] redo →', this.entries[this.index].label);
        return true;
    }

    _apply(state) {
        if (typeof this.restoreState !== 'function') return;
        this._restoring = true;
        try {
            this.restoreState(state);
        } finally {
            this._restoring = false;
        }
    }

    /**
     * Replace the timeline with a single baseline entry (e.g. after importing a session).
     * @param {object} state
     * @param {string} label
     */
    resetToState(state, label = 'Start') {
        if (!state) return;

        this.entries = [{
            label,
            state: JSON.parse(JSON.stringify(state)),
            timestamp: Date.now()
        }];
        this.index = 0;
        citranaDebug('[history] reset →', label);
    }
}
