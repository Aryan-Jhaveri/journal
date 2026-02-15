
// =============================================================================
// JOURNAL SETTINGS - Global Configuration
// =============================================================================
// All configurable values for the Interactive Journal.
// Modify these settings to customize the appearance and behavior.

const JOURNAL_SETTINGS = {

    // =========================================================================
    // CORE SETUP
    // =========================================================================

    // Data source for chapter content
    dataSource: 'chapters.json',

    // DOM element IDs
    elements: {
        bookId: 'book',
        tocListId: 'toc-list',
        p5ContainerId: 'p5-container',
        mobileControlsId: 'mobile-nav-controls',
        desktopControlsId: 'ui-controls',
        btnTocId: 'btn-toc',
        btnPrevId: 'btn-prev-page',
        btnNextId: 'btn-next-page',
        btnTocMobileId: 'btn-toc-mobile',
        btnSettingsId: 'btn-settings-mobile',
        settingsModalId: 'settings-modal'
    },

    // =========================================================================
    // BOOK LAYOUT
    // =========================================================================

    // Set to true to force single-page view (portrait mode)
    // Set to false to allow two-page spread when screen is wide enough
    usePortrait: false,

    // Number of static pages before dynamic content (Cover, Blank, TOC, Blank)
    staticPageCount: 4,

    // TOC page index (for navigation buttons)
    tocPageIndex: 2,

    // Back cover text
    backCoverText: 'The End',

    // =========================================================================
    // BOOK SIZING - Desktop (Two-page spread)
    // A6 Paper: 105mm x 148mm (Portrait: width < height)
    // Aspect ratio: 0.709 (width/height)
    // Sized to fit comfortably in viewport with margins
    // =========================================================================
    desktop: {
        pageWidthPercent: 0.22,   // Each page as % of viewport width (~44% total for spread)
        pageHeightPercent: 0.75,  // Page height as % of viewport height
        maxPageWidth: 280,        // Max width per page in pixels
        maxPageHeight: 395        // Max height (280 / 0.709 ≈ 395)
    },

    // =========================================================================
    // BOOK SIZING - Mobile (Single page view)
    // A6 Paper proportions maintained (Portrait)
    // Sized to fit within mobile viewport with room for controls
    // =========================================================================
    mobile: {
        pageWidthPercent: 0.75,   // Page width as % of viewport width
        pageHeightPercent: 0.60,  // Page height as % of viewport height
        maxPageWidth: 260,        // Max width in pixels
        maxPageHeight: 367        // Max height (260 / 0.709 ≈ 367)
    },

    // =========================================================================
    // STPAGEFLIP LIBRARY SETTINGS
    // =========================================================================
    pageFlip: {
        minWidth: 120,
        maxWidth: 600, // Increased to allow mobile's 380px without conflict
        minHeight: 170,
        maxHeight: 700,
        maxShadowOpacity: 0.5,
        showCover: true,
        mobileScrollSupport: false,
        autoSize: false  // Must be false so page-flip leaf aligns with book dimensions
    },

    // =========================================================================
    // RESPONSIVE BEHAVIOR
    // =========================================================================
    responsive: {
        mobileBreakpoint: 768,       // px - below this triggers mobile mode
        forceSinglePageOnMobile: true,
        showMobileControls: true,
        resizeDebounceMs: 150,       // Debounce delay for resize events
        pageRestoreDelayMs: 100      // Delay before restoring page after resize
    },

    // =========================================================================
    // CONTENT SETTINGS
    // =========================================================================
    content: {
        // Fallback content when chapters.json fails to load
        fallback: {
            title: 'Welcome',
            message: 'Could not load chapters.json. Please check your connection.'
        }
    },

    // =========================================================================
    // TYPOGRAPHY & STYLING
    // =========================================================================
    fonts: {
        body: "'IM Fell English', serif",
        headers: "'Dancing Script', cursive",
        handwriting: "'Dancing Script', cursive"
    },

    // Page content styling
    pageMargins: '5px',
    fontSize: '10px',

    // =========================================================================
    // SHADER BACKGROUNDS
    // =========================================================================
    shaderBackgrounds: {
        enabled: true,               // Master toggle
        fallbackToParticles: true,   // Use particles if shaders fail
        performanceMode: 'auto'      // 'auto', 'high', 'low'
    },

    // =========================================================================
    // AUDIO & HAPTICS
    // =========================================================================
    audio: {
        enabled: true,         // Master audio toggle
        volume: 0.4,           // Effect volume (0.0 - 1.0)
        pitchVariation: 0.1    // Random pitch variance for realism
    },

    haptics: {
        enabled: true,         // Master haptic toggle
        duration: 20           // Vibration duration in ms
    },

    // =========================================================================
    // DEBUG & LOGGING
    // =========================================================================
    debug: {
        logPageChanges: false,
        logSceneSwitches: true,
        logResponsiveChanges: true,
        logAudio: false
    }
};

// Legacy accessors for backwards compatibility
JOURNAL_SETTINGS.bookId = JOURNAL_SETTINGS.elements.bookId;
JOURNAL_SETTINGS.tocId = JOURNAL_SETTINGS.elements.tocListId;
