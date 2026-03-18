/**
 * Zoom Manager Module
 * Handles zoom (scale) and pan (translate) for the book wrapper.
 * Applies CSS transforms to .book-wrapper so StPageFlip internals are unaffected.
 *
 * Controls:
 *   - Ctrl+scroll / trackpad pinch: zoom in/out at cursor
 *   - Shift+click-drag: pan the book (any zoom level)
 *   - Touch pinch: zoom on mobile
 *   - Touch drag (when zoomed): pan on mobile
 *   - Ctrl/Cmd + +/-/0: keyboard zoom in/out/reset
 *   - Reset button: #btn-zoom-reset
 */

const ZoomManager = {
    scale: 1,
    panX: 0,
    panY: 0,
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0,
    panStartX: 0,
    panStartY: 0,
    wrapper: null,

    /**
     * Initialize zoom/pan on .book-wrapper
     */
    init() {
        const settings = JOURNAL_SETTINGS.zoom || {};
        this.minScale = settings.minScale || 1;
        this.maxScale = settings.maxScale || 3;
        this.step = settings.step || 0.25;
        this.panSpeed = settings.panSpeed || 1;
        this.scrollZoom = settings.scrollZoom !== false;

        this.wrapper = document.querySelector('.book-wrapper');
        if (!this.wrapper) {
            console.error('ZoomManager: .book-wrapper not found');
            return;
        }

        // Set transform origin
        this.wrapper.style.transformOrigin = 'center center';

        this._bindEvents();
        this._updateTransform();

        console.log('ZoomManager initialized');
    },

    // =========================================================================
    // PUBLIC API
    // =========================================================================

    zoomIn() {
        this.scale = Math.min(this.scale + this.step, this.maxScale);
        this._clampPan();
        this._updateTransform();
    },

    zoomOut() {
        this.scale = Math.max(this.scale - this.step, this.minScale);
        this._clampPan();
        this._updateTransform();
    },

    resetZoom() {
        this.scale = 1;
        this.panX = 0;
        this.panY = 0;
        this._updateTransform();
    },

    /**
     * Zoom centered on a specific point (for scroll/pinch zoom)
     */
    zoomAtPoint(delta, clientX, clientY) {
        const rect = this.wrapper.getBoundingClientRect();
        const offsetX = clientX - rect.left - rect.width / 2;
        const offsetY = clientY - rect.top - rect.height / 2;

        const oldScale = this.scale;
        this.scale = Math.min(Math.max(this.scale + delta, this.minScale), this.maxScale);
        const ratio = this.scale / oldScale;

        // Adjust pan so the point under the cursor stays fixed
        this.panX = offsetX - ratio * (offsetX - this.panX);
        this.panY = offsetY - ratio * (offsetY - this.panY);

        this._clampPan();
        this._updateTransform();
    },

    // =========================================================================
    // EVENT BINDING
    // =========================================================================

    _bindEvents() {
        // --- Scroll wheel zoom (Ctrl+scroll or trackpad pinch) ---
        if (this.scrollZoom) {
            this.wrapper.addEventListener('wheel', (e) => {
                // Only zoom on Ctrl+scroll or pinch (ctrlKey is set by trackpad pinch)
                if (!e.ctrlKey) return;
                e.preventDefault();

                const delta = e.deltaY > 0 ? -this.step : this.step;
                this.zoomAtPoint(delta, e.clientX, e.clientY);
            }, { passive: false });
        }

        // --- Shift+drag to pan (avoids conflict with StPageFlip click-to-flip) ---
        this.wrapper.addEventListener('mousedown', (e) => {
            // Only pan when Shift is held
            if (!e.shiftKey) return;
            if (e.button !== 0) return;

            this.isDragging = true;
            this.dragStartX = e.clientX;
            this.dragStartY = e.clientY;
            this.panStartX = this.panX;
            this.panStartY = this.panY;
            this.wrapper.style.cursor = 'grabbing';
            e.preventDefault();  // Prevent StPageFlip from capturing this
            e.stopPropagation();
        });

        window.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;
            const dx = (e.clientX - this.dragStartX) * this.panSpeed;
            const dy = (e.clientY - this.dragStartY) * this.panSpeed;
            this.panX = this.panStartX + dx;
            this.panY = this.panStartY + dy;
            this._clampPan();
            this._updateTransform();
        });

        window.addEventListener('mouseup', () => {
            if (this.isDragging) {
                this.isDragging = false;
                this.wrapper.style.cursor = 'default';
            }
        });

        // --- Touch: pinch-to-zoom + drag when zoomed ---
        let lastTouchDist = 0;
        let lastTouchMid = { x: 0, y: 0 };

        this.wrapper.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                lastTouchDist = this._touchDistance(e.touches);
                lastTouchMid = this._touchMidpoint(e.touches);
            } else if (e.touches.length === 1 && this.scale > 1) {
                this.isDragging = true;
                this.dragStartX = e.touches[0].clientX;
                this.dragStartY = e.touches[0].clientY;
                this.panStartX = this.panX;
                this.panStartY = this.panY;
            }
        }, { passive: true });

        this.wrapper.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2) {
                e.preventDefault();
                const dist = this._touchDistance(e.touches);
                const mid = this._touchMidpoint(e.touches);
                const scaleDelta = (dist - lastTouchDist) * 0.005;
                this.zoomAtPoint(scaleDelta, mid.x, mid.y);
                lastTouchDist = dist;
                lastTouchMid = mid;
            } else if (e.touches.length === 1 && this.isDragging) {
                const dx = (e.touches[0].clientX - this.dragStartX) * this.panSpeed;
                const dy = (e.touches[0].clientY - this.dragStartY) * this.panSpeed;
                this.panX = this.panStartX + dx;
                this.panY = this.panStartY + dy;
                this._clampPan();
                this._updateTransform();
            }
        }, { passive: false });

        this.wrapper.addEventListener('touchend', () => {
            this.isDragging = false;
            lastTouchDist = 0;
        }, { passive: true });

        // --- Keyboard shortcuts ---
        window.addEventListener('keydown', (e) => {
            if (e.key === '=' || e.key === '+') {
                if (e.ctrlKey || e.metaKey) { e.preventDefault(); this.zoomIn(); }
            } else if (e.key === '-') {
                if (e.ctrlKey || e.metaKey) { e.preventDefault(); this.zoomOut(); }
            } else if (e.key === '0') {
                if (e.ctrlKey || e.metaKey) { e.preventDefault(); this.resetZoom(); }
            }
        });

        // --- Reset button ---
        const btnZoomReset = document.getElementById('btn-zoom-reset');
        if (btnZoomReset) btnZoomReset.addEventListener('click', () => this.resetZoom());
    },

    // =========================================================================
    // INTERNAL HELPERS
    // =========================================================================

    _updateTransform() {
        if (!this.wrapper) return;
        this.wrapper.style.transform =
            `scale(${this.scale}) translate(${this.panX / this.scale}px, ${this.panY / this.scale}px)`;
    },

    _clampPan() {
        if (this.scale <= 1) {
            this.panX = 0;
            this.panY = 0;
            return;
        }
        // Allow panning proportional to zoom level
        const maxPan = 300 * (this.scale - 1);
        this.panX = Math.max(-maxPan, Math.min(maxPan, this.panX));
        this.panY = Math.max(-maxPan, Math.min(maxPan, this.panY));
    },

    _touchDistance(touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    },

    _touchMidpoint(touches) {
        return {
            x: (touches[0].clientX + touches[1].clientX) / 2,
            y: (touches[0].clientY + touches[1].clientY) / 2
        };
    }
};
