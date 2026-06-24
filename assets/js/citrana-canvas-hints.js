/**
 * citrana-canvas-hints.js
 * Citrana • https://github.com/IAmVigneswaran/Soothsayer-Citrana
 * © 2026 Vigneswaran Rajkumar • Licensed under MIT License
 * Excalidraw-style onboarding hints on a blank canvas until the user creates content
 *
 * Hint PNGs share a 2084×501 artboard. Each hint declares arrowTip (px on that artboard)
 * and attaches that point to a live UI element edge — positions update on resize.
 */
const CitranaCanvasHints = {
    app: null,
    root: null,
    dismissed: false,
    hintEls: {},
    _raf: null,

    ARTBOARD_W: 2084,
    ARTBOARD_H: 501,

    /** Gap between arrow tip and the UI attach edge (px). */
    SPACING: 10,

    /** Anchored UI hints need a wide desktop viewport; below this they are hidden. */
    MIN_UI_HINT_VIEWPORT_WIDTH: 1100,

    /*
     * Per-hint tuning (UI hints only):
     *   arrowTip   — tip on PNG artboard (Photopea px)
     *   attachEdge — 'top' | 'bottom' | 'left' | 'right' of the target element
     *   attachX    — along top/bottom edge (0 = left, 1 = right)
     *   attachY    — along left/right edge (0 = top, 1 = bottom)
     *   spacing    — optional gap in px (default SPACING)
     *   offsetX/Y  — px nudge after anchor (+ right / + down); may be capped by clamp (see clampX)
     *   clampX     — 'both' (default) | 'min' — use 'min' for help so it can sit flush to the right edge
     */
    HINTS: [
        {
            id: 'start',
            src: 'assets/images/hint-start-message.png',
            desktopOnly: false,
            centeredStack: true,
            offsetX: 0,
            offsetY: 0,
            isVisible() {
                return !document.getElementById('welcome-modal')?.classList.contains('active');
            }
        },
        // Arrow tip (Photopea): (520, 60) — points up to library bottom
        {
            id: 'graha-library',
            src: 'assets/images/hint-graha-library.png',
            desktopOnly: true,
            arrowTip: { x: 520, y: 60 },
            attachEdge: 'bottom',
            attachX: 0.42,
            offsetX: 0,
            offsetY: 0,
            getTargetRect() {
                return document.getElementById('graha-library')?.getBoundingClientRect();
            },
            isVisible() {
                const library = document.getElementById('graha-library');
                return !!(library && !library.classList.contains('graha-library-hidden'));
            }
        },
        // Arrow tip (Photopea): (755, 85) — points up to toolbar bottom
        {
            id: 'main-toolbar',
            src: 'assets/images/hint-main-toolbar.png',
            desktopOnly: true,
            arrowTip: { x: 755, y: 85 },
            attachEdge: 'bottom',
            attachX: 0.5,
            offsetX: 0,
            offsetY: 0,
            getTargetRect() {
                return document.querySelector('.floating-top-toolbar')?.getBoundingClientRect();
            },
            isVisible() {
                return true;
            }
        },
        // Arrow tip (Photopea): (455, 485) — points down to zoom bar top
        {
            id: 'zoom-bar',
            src: 'assets/images/hint-zoom-bar.png',
            desktopOnly: true,
            arrowTip: { x: 455, y: 485 },
            attachEdge: 'top',
            attachX: 0.22,
            offsetX: 0,
            offsetY: 0,
            getTargetRect() {
                return document.querySelector('.floating-zoom-controls')?.getBoundingClientRect();
            },
            isVisible() {
                return true;
            }
        },
        // Tip (1415, 95) — on right of artboard; points up into top-right #help-btn.
        // attachX along bottom edge: + toward right (0 = left of button, 1 = right).
        // offsetX + moves right only if clampX is 'min' (default clamp blocks right edge).
        {
            id: 'help',
            src: 'assets/images/hint-help.png',
            desktopOnly: true,
            arrowTip: { x: 1415, y: 95 },
            attachEdge: 'bottom',
            attachX: 0.72,
            spacing: 8,
            clampX: 'min',
            offsetX: -10,
            offsetY: 0,
            getTargetRect() {
                return document.getElementById('help-btn')?.getBoundingClientRect();
            },
            isVisible() {
                return true;
            }
        }
    ],

    init(app) {
        this.app = app;
        this.createOverlay();
        window.addEventListener('resize', () => this.scheduleUpdate());
        window.visualViewport?.addEventListener('resize', () => this.scheduleUpdate());
        window.visualViewport?.addEventListener('scroll', () => this.scheduleUpdate());
    },

    createOverlay() {
        const root = document.createElement('div');
        root.className = 'citrana-canvas-hints is-hidden';
        root.setAttribute('aria-hidden', 'true');

        this.HINTS.forEach((cfg) => {
            const el = document.createElement('div');
            el.className = `citrana-canvas-hint citrana-canvas-hint--${cfg.id}`;
            if (cfg.desktopOnly) {
                el.classList.add('citrana-canvas-hint--desktop');
            }

            if (cfg.centeredStack) {
                const brand = document.createElement('div');
                brand.className = 'citrana-canvas-hint-start-brand';

                const logo = document.createElement('img');
                logo.className = 'citrana-canvas-hint-start-logo';
                logo.src = 'assets/images/Soothsayer-Citrana-Full-Logo-Black.png';
                logo.alt = '';
                logo.draggable = false;
                logo.decoding = 'async';
                logo.addEventListener('load', () => this.scheduleUpdate());

                brand.appendChild(logo);
                el.appendChild(brand);
            }

            const img = document.createElement('img');
            img.src = cfg.src;
            img.alt = '';
            img.draggable = false;
            img.decoding = 'async';
            if (cfg.centeredStack) {
                img.className = 'citrana-canvas-hint-start-message';
            }
            img.addEventListener('load', () => {
                cfg.artboardW = img.naturalWidth || this.ARTBOARD_W;
                cfg.artboardH = img.naturalHeight || this.ARTBOARD_H;
                this.scheduleUpdate();
            });
            el.appendChild(img);

            root.appendChild(el);
            this.hintEls[cfg.id] = { el, cfg };
        });

        document.body.appendChild(root);
        this.root = root;
    },

    isDesktop() {
        return window.matchMedia('(min-width: 769px)').matches;
    },

    showUiHints() {
        return this.isDesktop() && window.innerWidth >= this.MIN_UI_HINT_VIEWPORT_WIDTH;
    },

    isWelcomeOpen() {
        return document.getElementById('welcome-modal')?.classList.contains('active');
    },

    isCanvasEmpty() {
        return !this.app?.hasSessionContent?.();
    },

    shouldShow() {
        if (this.dismissed) {
            return false;
        }
        if (this.app?.presentationView) {
            return false;
        }
        if (!this.isCanvasEmpty()) {
            this.dismiss();
            return false;
        }
        return true;
    },

    dismiss() {
        this.dismissed = true;
        this.root?.classList.add('is-hidden');
    },

    scheduleUpdate() {
        if (this._raf != null) {
            cancelAnimationFrame(this._raf);
        }
        this._raf = requestAnimationFrame(() => {
            this._raf = null;
            this.update();
        });
    },

    update() {
        if (!this.root) {
            return;
        }

        this.root.classList.toggle('citrana-canvas-hints--with-welcome', this.isWelcomeOpen());

        if (!this.shouldShow()) {
            this.root.classList.add('is-hidden');
            return;
        }

        this.root.classList.remove('is-hidden');
        this.positionAll();
    },

    getDisplayWidth() {
        const vw = window.innerWidth;
        if (this.isDesktop()) {
            return Math.min(520, Math.max(380, vw * 0.36));
        }
        return Math.min(440, vw - 32);
    },

    getHintDimensions(cfg) {
        const artW = cfg.artboardW || this.ARTBOARD_W;
        const artH = cfg.artboardH || this.ARTBOARD_H;
        const width = this.getDisplayWidth();
        const height = width * (artH / artW);
        return { width, height, artW, artH };
    },

    /** Map arrow tip to a point on the target element (#help-btn, etc.). */
    getAttachPoint(targetRect, cfg) {
        const gap = cfg.spacing ?? this.SPACING;
        const attachX = cfg.attachX ?? 0.5;
        const attachY = cfg.attachY ?? 0.5;

        switch (cfg.attachEdge) {
            case 'left':
                return {
                    x: targetRect.left - gap,
                    y: targetRect.top + targetRect.height * attachY
                };
            case 'right':
                return {
                    x: targetRect.right + gap,
                    y: targetRect.top + targetRect.height * attachY
                };
            case 'top':
                return {
                    x: targetRect.left + targetRect.width * attachX,
                    y: targetRect.top - gap
                };
            case 'bottom':
            default:
                return {
                    x: targetRect.left + targetRect.width * attachX,
                    y: targetRect.bottom + gap
                };
        }
    },

    placeFromAnchor(cfg, dims) {
        const tip = cfg.arrowTip;
        const scale = dims.width / dims.artW;
        const tipPxX = tip.x * scale;
        const tipPxY = tip.y * scale;

        const targetRect = cfg.getTargetRect?.();
        if (!targetRect?.width || !targetRect?.height) {
            return null;
        }

        const attach = this.getAttachPoint(targetRect, cfg);
        const offsetX = cfg.offsetX ?? 0;
        const offsetY = cfg.offsetY ?? 0;

        return {
            left: attach.x - tipPxX + offsetX,
            top: attach.y - tipPxY + offsetY,
            width: dims.width,
            height: dims.height
        };
    },

    placeCentered(cfg, dims) {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const offsetX = cfg.offsetX ?? 0;
        const offsetY = cfg.offsetY ?? 0;
        return {
            left: (vw - dims.width) / 2 + offsetX,
            top: (vh - dims.height) / 2 + offsetY,
            width: dims.width,
            height: dims.height
        };
    },

    resolvePlacement(cfg) {
        const dims = this.getHintDimensions(cfg);
        if (cfg.centered) {
            return this.placeCentered(cfg, dims);
        }
        return this.placeFromAnchor(cfg, dims);
    },

    clampRect(rect, cfg = {}) {
        const margin = 8;
        const maxLeft = window.innerWidth - rect.width - margin;
        const maxTop = window.innerHeight - rect.height - margin;
        const minOnly = cfg.clampX === 'min';

        return {
            left: minOnly
                ? Math.max(rect.left, margin)
                : Math.min(Math.max(rect.left, margin), Math.max(margin, maxLeft)),
            top: Math.min(Math.max(rect.top, margin), Math.max(margin, maxTop)),
            width: rect.width,
            height: rect.height
        };
    },

    positionAll() {
        const showUiHints = this.showUiHints();

        this.HINTS.forEach((cfg) => {
            const entry = this.hintEls[cfg.id];
            if (!entry) {
                return;
            }

            const { el } = entry;
            const hideDesktopOnly = cfg.desktopOnly && !showUiHints;
            const visible = !hideDesktopOnly && cfg.isVisible();

            if (!visible) {
                el.hidden = true;
                return;
            }

            if (cfg.centeredStack) {
                const width = this.getDisplayWidth();
                const offsetX = cfg.offsetX ?? 0;
                const offsetY = cfg.offsetY ?? 0;
                const margin = 8;
                el.hidden = false;
                el.style.width = `${width}px`;
                el.style.height = 'auto';
                el.style.left = `${Math.max(margin, (window.innerWidth - width) / 2 + offsetX)}px`;
                const height = el.offsetHeight;
                el.style.top = `${Math.max(margin, (window.innerHeight - height) / 2 + offsetY)}px`;
                return;
            }

            const rect = this.resolvePlacement(cfg);
            if (!rect) {
                el.hidden = true;
                return;
            }

            el.hidden = false;
            const clamped = this.clampRect(rect, cfg);
            el.style.width = `${clamped.width}px`;
            el.style.height = `${clamped.height}px`;
            el.style.left = `${clamped.left}px`;
            el.style.top = `${clamped.top}px`;
        });
    }
};
