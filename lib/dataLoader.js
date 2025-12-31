/**
 * Data Loader Module
 * Handles fetching and loading chapter data from JSON and text files
 */

const DataLoader = {
    /**
     * Loads all chapter data from the manifest and content files
     * @param {string} manifestUrl - URL to chapters.json
     * @returns {Promise<Array>} Array of chapter objects with content
     */
    async loadChapters(manifestUrl) {
        try {
            const response = await fetch(manifestUrl);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const manifest = await response.json();

            // Fetch content for each chapter
            const chapters = await Promise.all(manifest.map(async (chapter) => {
                // Default content to empty string to prevent crashes
                chapter.content = "";

                if (chapter.filename) {
                    try {
                        const res = await fetch(chapter.filename);
                        if (res.ok) {
                            chapter.content = await res.text();
                        } else {
                            chapter.content = `[Error loading content: ${res.status}]`;
                            console.warn(`Failed to fetch ${chapter.filename}: ${res.status}`);
                        }
                    } catch (err) {
                        console.error(`Failed to load ${chapter.filename}:`, err);
                        chapter.content = "[Error loading content]";
                    }
                }
                return chapter;
            }));

            return chapters;
        } catch (e) {
            console.error("Failed to load story data:", e);
            // Fallback for local testing without server
            return [
                {
                    title: "Welcome",
                    date: new Date().toDateString(),
                    content: "Could not load chapters.json."
                }
            ];
        }
    }
};
