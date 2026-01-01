/**
 * Data Loader Module
 * Handles fetching and loading chapter data from JSON and PDF files
 * PDF-only mode: expects pdfFile references in chapters.json
 */

const DataLoader = {
    /**
     * Loads all chapter data from the manifest and PDF files
     * @param {string} manifestUrl - URL to chapters.json
     * @returns {Promise<Array>} Array of chapter objects with rendered pages
     */
    async loadChapters(manifestUrl) {
        try {
            const response = await fetch(manifestUrl);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const manifest = await response.json();

            // Process each chapter entry
            const chapters = await Promise.all(manifest.map(async (chapter) => {
                // Initialize pages array
                chapter.pages = [];
                chapter.contentType = 'pdf';

                if (chapter.pdfFile) {
                    try {
                        // Load PDF and render all pages
                        const pdfPages = await PDFLoader.loadPDF(chapter.pdfFile);
                        chapter.pages = pdfPages;
                        console.log(`Loaded ${pdfPages.length} pages from ${chapter.pdfFile}`);
                    } catch (err) {
                        console.error(`Failed to load PDF ${chapter.pdfFile}:`, err);
                        chapter.pages = [];
                        chapter.error = err.message;
                    }
                } else {
                    console.warn(`Chapter "${chapter.title}" has no pdfFile defined`);
                }

                return chapter;
            }));

            return chapters;
        } catch (e) {
            console.error("Failed to load story data:", e);
            // Get fallback content from settings
            const fallback = JOURNAL_SETTINGS.content?.fallback || {};
            return [
                {
                    title: fallback.title || 'Welcome',
                    date: new Date().toDateString(),
                    pages: [],
                    contentType: 'pdf',
                    error: 'Could not load chapters.json'
                }
            ];
        }
    }
};
