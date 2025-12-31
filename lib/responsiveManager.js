/**
 * Responsive Manager Module
 * Handles viewport detection and mobile/desktop layout switching
 */

const ResponsiveManager = {
    isMobile: false,
    breakpoint: 768,

    /**
     * Initialize the responsive manager
     */
    init() {
        this.breakpoint = JOURNAL_SETTINGS.responsive?.mobileBreakpoint || 768;
        this.checkViewport();

        // Listen for resize events with debounce
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => this.checkViewport(), 150);
        });

        // Set up mobile navigation handlers
        this.setupMobileControls();

        console.log(`ResponsiveManager initialized (mobile: ${this.isMobile})`);
    },

    /**
     * Check viewport size and update mobile state
     */
    checkViewport() {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth < this.breakpoint;

        if (wasMobile !== this.isMobile) {
            this.onViewportChange();
        }

        this.updateMobileControls();
    },

    /**
     * Handle viewport mode change (mobile <-> desktop)
     */
    onViewportChange() {
        console.log(`Viewport changed: ${this.isMobile ? 'mobile' : 'desktop'}`);

        // StPageFlip doesn't support updateSettings
        // We need to recreate the book instance with new settings
        if (BookEngine.pageFlipInstance) {
            const currentPage = BookEngine.pageFlipInstance.getCurrentPageIndex();

            // Destroy current instance
            BookEngine.pageFlipInstance.destroy();

            // Update settings for new viewport
            JOURNAL_SETTINGS.usePortrait = this.isMobile;

            // Reinitialize with new settings
            BookEngine.initPageFlip();

            // Restore page position
            setTimeout(() => {
                BookEngine.pageFlipInstance.turnToPage(currentPage);
            }, 100);
        }
    },

    /**
     * Update visibility of mobile controls
     */
    updateMobileControls() {
        const mobileControls = document.getElementById('mobile-nav-controls');
        const desktopControls = document.getElementById('ui-controls');

        if (mobileControls) {
            mobileControls.style.display = this.isMobile ? 'flex' : 'none';
        }

        if (desktopControls) {
            desktopControls.style.display = this.isMobile ? 'none' : 'flex';
        }
    },

    /**
     * Set up mobile navigation button handlers
     */
    setupMobileControls() {
        const btnPrev = document.getElementById('btn-prev-page');
        const btnNext = document.getElementById('btn-next-page');
        const btnSettings = document.getElementById('btn-settings-mobile');
        const btnTocMobile = document.getElementById('btn-toc-mobile');

        if (btnPrev) {
            btnPrev.addEventListener('click', () => {
                if (BookEngine.pageFlipInstance) {
                    BookEngine.pageFlipInstance.flipPrev();
                }
            });
        }

        if (btnNext) {
            btnNext.addEventListener('click', () => {
                if (BookEngine.pageFlipInstance) {
                    BookEngine.pageFlipInstance.flipNext();
                }
            });
        }

        if (btnTocMobile) {
            btnTocMobile.addEventListener('click', () => {
                if (BookEngine.pageFlipInstance) {
                    BookEngine.pageFlipInstance.flip(2); // TOC is page 2
                }
            });
        }

        if (btnSettings) {
            btnSettings.addEventListener('click', () => {
                // Will be implemented in Phase 3
                const modal = document.getElementById('settings-modal');
                if (modal) {
                    modal.classList.toggle('active');
                }
            });
        }
    }
};
