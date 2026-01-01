/**
 * PDF Loader Module
 * Handles loading PDFs and rendering pages to images using PDF.js
 * Optimized for A6 format (105mm x 148mm, aspect ratio ~0.707)
 */

const PDFLoader = {
    // A6 dimensions for scaling reference
    A6_WIDTH: 290,  // pixels at ~72 DPI
    A6_HEIGHT: 410, // pixels at ~72 DPI

    /**
     * Initializes PDF.js worker
     */
    init() {
        if (typeof pdfjsLib !== 'undefined') {
            // Set worker source to CDN
            pdfjsLib.GlobalWorkerOptions.workerSrc =
                'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            console.log('PDF.js initialized');
        } else {
            console.error('PDF.js library not loaded');
        }
    },

    /**
     * Loads a PDF from URL and renders all pages as image data URLs
     * @param {string} url - URL/path to PDF file
     * @param {Object} options - Render options
     * @param {number} options.scale - Render scale (default 2 for crisp display)
     * @param {number} options.targetWidth - Target width in pixels (default A6)
     * @param {number} options.targetHeight - Target height in pixels (default A6)
     * @returns {Promise<Array<Object>>} Array of page objects with dataUrl and dimensions
     */
    async loadPDF(url, options = {}) {
        const {
            scale = 2,
            targetWidth = this.A6_WIDTH,
            targetHeight = this.A6_HEIGHT
        } = options;

        try {
            console.log(`Loading PDF: ${url}`);
            const pdf = await pdfjsLib.getDocument(url).promise;
            const pages = [];

            console.log(`PDF loaded: ${pdf.numPages} pages`);

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale });

                // Create canvas for rendering
                const canvas = document.createElement('canvas');
                canvas.width = viewport.width;
                canvas.height = viewport.height;

                const context = canvas.getContext('2d');

                // Render PDF page to canvas
                await page.render({
                    canvasContext: context,
                    viewport: viewport
                }).promise;

                // Convert to data URL
                const dataUrl = canvas.toDataURL('image/png');

                pages.push({
                    dataUrl: dataUrl,
                    pageNumber: i,
                    width: viewport.width,
                    height: viewport.height,
                    aspectRatio: viewport.width / viewport.height
                });

                console.log(`Rendered page ${i}/${pdf.numPages}`);
            }

            return pages;
        } catch (error) {
            console.error(`Failed to load PDF: ${url}`, error);
            throw error;
        }
    },

    /**
     * Loads a PDF from a File object (for future upload support)
     * @param {File} file - PDF File object from input
     * @param {Object} options - Render options
     * @returns {Promise<Array<Object>>} Array of page objects
     */
    async loadFromFile(file, options = {}) {
        const arrayBuffer = await file.arrayBuffer();
        return this.loadPDF({ data: arrayBuffer }, options);
    }
};

// Auto-initialize when script loads
document.addEventListener('DOMContentLoaded', () => {
    PDFLoader.init();
});
