

// Global Configuration for the Interactive Journal
const JOURNAL_SETTINGS = {
    // --- Book Dimensions & Setup ---
    bookId: 'book',
    tocId: 'toc-list',
    dataSource: 'chapters.json',

    // Size of a *single* page. The book will be double this width when open.
    width: 400,
    height: 600,

    // Set to true to force single-page view (portrait). 
    // Set to false to allow two-page spread (landscape) when screen is wide enough.
    usePortrait: false,

    // --- Visuals ---
    // Set to false to disable the p5.js particle background
    enableBackgroundAnimation: false,

    // --- Shader Background Settings ---
    shaderBackgrounds: {
        enabled: true,  // Master toggle for shader backgrounds
        fallbackToParticles: true,  // Use particle system if shaders fail
        performanceMode: 'auto'  // 'auto', 'high', 'low'
    },

    // Scene mapping: chapter filename -> sketch scene name
    sceneMapping: {
        'prologue': 'PrologueScene',
        'chapter_01': 'Chapter01Scene',
        'chapter_02': 'Chapter02Scene',
        'chapter_03': 'Chapter03Scene',
        'default': 'DefaultScene'
    },

    // --- Styling (Applied at runtime) ---
    // CSS font strings. Make sure these fonts are imported in css or available.
    fonts: {
        body: "'IM Fell English', serif",
        headers: "'Dancing Script', cursive",
        handwriting: "'Dancing Script', cursive"
    },

    // Inner spacing of the page text
    pageMargins: "5px",

    // Font size for body text
    fontSize: "10px",

    // --- Content ---
    // Approximate characters per page before splitting to a new page.
    charsPerPage: 500  // Low default to demonstrate splitting easily
};

