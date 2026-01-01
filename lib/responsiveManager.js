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
        const settings = JOURNAL_SETTINGS;
        this.breakpoint = settings.responsive?.mobileBreakpoint || 768;
        this.checkViewport();

        // Listen for resize events with debounce
        const debounceMs = settings.responsive?.resizeDebounceMs || 150;
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => this.checkViewport(), debounceMs);
        });

        // Set up mobile navigation handlers
        this.setupMobileControls();

        if (settings.debug?.logResponsiveChanges) {
            console.log(`ResponsiveManager initialized (mobile: ${this.isMobile})`);
        }
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
    /**
     * Handle viewport mode change (mobile <-> desktop)
     */
    onViewportChange() {
        const settings = JOURNAL_SETTINGS;

        if (settings.debug?.logResponsiveChanges) {
            console.log(`Viewport changed: ${this.isMobile ? 'mobile' : 'desktop'}`);
        }

        // Add a safety check to ensure BookEngine is ready
        if (BookEngine && BookEngine.pageFlipInstance) {
            try {
                // Save current page index safely
                let currentPage = 0;
                try {
                    currentPage = BookEngine.pageFlipInstance.getCurrentPageIndex();
                } catch (e) {
                    console.warn("Could not get current page index", e);
                }

                // Destroy current instance
                BookEngine.pageFlipInstance.destroy();
                BookEngine.pageFlipInstance = null; // Clear reference

                // Update settings for new viewport
                settings.usePortrait = this.isMobile;

                // Reinitialize with new settings on next tick to allow DOM to settle
                setTimeout(() => {
                    BookEngine.initPageFlip();

                    // Restore page position
                    if (BookEngine.pageFlipInstance) {
                        const restoreDelay = settings.responsive?.pageRestoreDelayMs || 100;
                        setTimeout(() => {
                            try {
                                // Validate page index before turning
                                const totalPages = BookEngine.pageFlipInstance.getPageCount();
                                if (currentPage >= 0 && currentPage < totalPages) {
                                    BookEngine.pageFlipInstance.turnToPage(currentPage);
                                }
                            } catch (err) {
                                console.error("Failed to restore page:", err);
                            }
                        }, restoreDelay);
                    }
                }, 50);

            } catch (error) {
                console.error("Error during viewport change handling:", error);
            }
        }
    },

    /**
     * Update visibility of mobile controls
     */
    updateMobileControls() {
        const elements = JOURNAL_SETTINGS.elements || {};
        const mobileControls = document.getElementById(elements.mobileControlsId || 'mobile-nav-controls');
        const desktopControls = document.getElementById(elements.desktopControlsId || 'ui-controls');

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
        const elements = JOURNAL_SETTINGS.elements || {};
        const tocPageIndex = JOURNAL_SETTINGS.tocPageIndex || 2;

        const btnPrev = document.getElementById(elements.btnPrevId || 'btn-prev-page');
        const btnNext = document.getElementById(elements.btnNextId || 'btn-next-page');
        const btnSettings = document.getElementById(elements.btnSettingsId || 'btn-settings-mobile');
        const btnTocMobile = document.getElementById(elements.btnTocMobileId || 'btn-toc-mobile');

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
                    BookEngine.pageFlipInstance.flip(tocPageIndex);
                }
            });
        }

        if (btnSettings) {
            btnSettings.addEventListener('click', () => {
                const modal = document.getElementById(elements.settingsModalId || 'settings-modal');
                if (modal) {
                    modal.classList.toggle('active');
                }
            });
        }
    }
};
