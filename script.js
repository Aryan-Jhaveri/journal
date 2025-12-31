/**
 * Main Application Entry Point
 * Orchestrates the interactive journal using modular components
 */

document.addEventListener('DOMContentLoaded', initApp);

async function initApp() {
    console.log("Initializing Interactive Journal...");

    // 1. Apply Visual Settings
    applyVisualSettings();

    // 2. Initialize Background Scene Manager
    if (JOURNAL_SETTINGS.shaderBackgrounds.enabled) {
        BackgroundSceneManager.init();
    }

    // 3. Load Chapter Data
    const chapters = await DataLoader.loadChapters(JOURNAL_SETTINGS.dataSource);
    if (!chapters || chapters.length === 0) {
        console.error("No chapters loaded");
        return;
    }

    // 4. Render Book Content
    BookEngine.renderContent(chapters);

    // 5. Initialize Page Flip
    BookEngine.initPageFlip();

    // 6. Initialize Responsive Manager (mobile/desktop detection)
    if (typeof ResponsiveManager !== 'undefined') {
        ResponsiveManager.init();
    }

    // 7. Connect Page Change Events to Scene Switching
    BookEngine.onPageChange((pageData) => {
        const chapterInfo = BookEngine.getChapterForPage(pageData);
        if (chapterInfo && JOURNAL_SETTINGS.shaderBackgrounds.enabled) {
            BackgroundSceneManager.switchScene(chapterInfo);
        }
    });

    console.log("Journal initialization complete!");
}

/**
 * Applies styles from settings.js to the document
 */
function applyVisualSettings() {
    const r = document.querySelector(':root');
    if (!r || !window.JOURNAL_SETTINGS) return;

    const s = JOURNAL_SETTINGS;

    // Set CSS variables
    r.style.setProperty('--font-body', s.fonts.body);
    r.style.setProperty('--font-headers', s.fonts.headers);
    r.style.setProperty('--page-margin', s.pageMargins);
    r.style.setProperty('--font-size', s.fontSize);
}
