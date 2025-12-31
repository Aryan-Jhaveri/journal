/**
 * Book Engine Module
 * Handles page rendering, pagination, and page flip functionality
 */

const BookEngine = {
    pageFlipInstance: null,
    chapters: [],
    pageToChapterMap: {},

    /**
     * Renders book content from chapter data
     * @param {Array} chapters - Array of chapter objects
     */
    renderContent(chapters) {
        this.chapters = chapters;
        const settings = JOURNAL_SETTINGS;
        const elements = settings.elements || {};

        const bookElement = document.getElementById(elements.bookId || settings.bookId);
        const tocList = document.getElementById(elements.tocListId || settings.tocId);

        // Clear existing dynamic pages
        const allPages = bookElement.querySelectorAll('.page');
        const staticPageCount = settings.staticPageCount || 4;

        // Remove any previously added dynamic pages
        for (let i = allPages.length - 1; i >= staticPageCount; i--) {
            allPages[i].remove();
        }

        // Reset global index
        let globalPageIndex = staticPageCount;

        chapters.forEach((chapter, chapterIdx) => {
            // 1. Create TOC Entry
            const li = document.createElement('li');
            li.textContent = chapter.title;

            // Capture specific page index
            const targetPage = globalPageIndex;
            li.onclick = () => {
                if (this.pageFlipInstance) this.pageFlipInstance.flip(targetPage);
            };
            tocList.appendChild(li);

            // 2. Split Content
            const safeContent = chapter.content || "";
            const charsPerPage = settings.content?.charsPerPage || settings.charsPerPage || 800;
            const contentPages = this.splitTextIntoChunks(safeContent, charsPerPage);

            contentPages.forEach((chunk, chunkIndex) => {
                const isFirstPage = chunkIndex === 0;
                const pageDiv = this.createPageElement(chapter, chunk, isFirstPage, chunkIndex + 1, contentPages.length);
                bookElement.appendChild(pageDiv);

                // Map page index to chapter
                this.pageToChapterMap[globalPageIndex] = {
                    chapterIndex: chapterIdx,
                    chapter: chapter,
                    filename: chapter.filename || 'default'
                };

                globalPageIndex++;
            });
        });

        // Add back cover
        const backCover = document.createElement('div');
        backCover.classList.add('page', 'cover');
        backCover.setAttribute('data-density', 'hard');
        const backCoverText = settings.backCoverText || 'The End';
        backCover.innerHTML = `<div class="page-content"><center><p>${backCoverText}</p></center></div>`;
        bookElement.appendChild(backCover);
    },

    /**
     * Splits text into chunks based on char limit, preserving paragraphs and handling images
     * @param {string} text - Text to split
     * @param {number} maxChars - Maximum characters per chunk
     * @returns {Array<string>} Array of text chunks
     */
    splitTextIntoChunks(text, maxChars) {
        if (!text) return [];

        // Identify images and split around them
        // Pattern: ![alt text](path/to/image.ext)
        const imageRegex = /(!\[.*?\]\(.*?\))/g;
        const sections = text.split(imageRegex);

        let pages = [];
        let currentChunk = "";

        sections.forEach(section => {
            // Check if this section is an image
            const imageMatch = section.match(/!\[(.*?)\]\((.*?)\)/);
            if (imageMatch) {
                // It's an image - extract alt and src
                const alt = imageMatch[1];
                const src = imageMatch[2];
                const imgHTML = `<div class="story-image-container"><img src="${src}" alt="${alt}" class="story-image"></div>`;

                const estimatedImageSize = JOURNAL_SETTINGS.content?.estimatedImageSize || 300;

                if ((currentChunk.length + estimatedImageSize) > maxChars && currentChunk.length > 0) {
                    pages.push(currentChunk);
                    currentChunk = imgHTML + "\n";
                } else {
                    currentChunk += imgHTML + "\n";
                }
            } else {
                // Regular text - split by newlines
                const paragraphs = section.split('\n');
                paragraphs.forEach(para => {
                    if (!para.trim()) return;

                    if ((currentChunk.length + para.length) > maxChars && currentChunk.length > 0) {
                        pages.push(currentChunk);
                        currentChunk = para + "\n";
                    } else {
                        currentChunk += para + "\n";
                    }
                });
            }
        });

        if (currentChunk.trim().length > 0) {
            pages.push(currentChunk);
        }
        return pages;
    },

    /**
     * Creates a single page DOM element
     * @param {Object} chapter - Chapter object
     * @param {string} textContent - Text content for this page
     * @param {boolean} isFirstPage - Whether this is the first page of the chapter
     * @param {number} partNum - Current part number
     * @param {number} totalParts - Total number of parts
     * @returns {HTMLElement} Page div element
     */
    createPageElement(chapter, textContent, isFirstPage, partNum, totalParts) {
        const pageDiv = document.createElement('div');
        pageDiv.classList.add('page');

        const contentDiv = document.createElement('div');
        contentDiv.classList.add('page-content');

        let headerHTML = '';
        if (isFirstPage) {
            headerHTML = `
                <h2>${chapter.title}</h2>
                <span class="date">${chapter.date}</span>
            `;
        } else {
            headerHTML = `<span class="date" style="font-size: 0.8em; opacity: 0.5;">${chapter.title} (Cont.)</span>`;
        }

        contentDiv.innerHTML = `
            ${headerHTML}
            <div class="story-text">
                <p>${textContent.replace(/\n/g, '<br>')}</p>
            </div>
            <div class="page-footer" style="margin-top: auto; text-align: center; font-size: 0.7em; opacity: 0.4;">
                ${partNum} / ${totalParts}
            </div>
        `;

        pageDiv.appendChild(contentDiv);
        return pageDiv;
    },

    /**
     * Initializes the StPageFlip library
     */
    initPageFlip() {
        if (typeof St === 'undefined') {
            console.error("StPageFlip library not loaded.");
            return;
        }

        const settings = JOURNAL_SETTINGS;
        const elements = settings.elements || {};
        const bookEl = document.getElementById(elements.bookId || settings.bookId);

        // Detect if we're on mobile for initial setup
        const breakpoint = settings.responsive?.mobileBreakpoint || 768;
        const isMobile = window.innerWidth < breakpoint;
        const usePortrait = isMobile || (settings.usePortrait ?? false);

        // Calculate dynamic dimensions based on viewport and settings
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        // Get sizing config from settings
        const sizeConfig = isMobile ? settings.mobile : settings.desktop;
        const flipConfig = settings.pageFlip || {};

        // Calculate page dimensions
        const pageWidth = Math.min(vw * sizeConfig.pageWidthPercent, sizeConfig.maxPageWidth);
        const pageHeight = Math.min(vh * sizeConfig.pageHeightPercent, sizeConfig.maxPageHeight);

        this.pageFlipInstance = new St.PageFlip(bookEl, {
            width: pageWidth,
            height: pageHeight,
            size: 'stretch',
            minWidth: flipConfig.minWidth || 150,
            maxWidth: flipConfig.maxWidth || 500,
            minHeight: flipConfig.minHeight || 200,
            maxHeight: flipConfig.maxHeight || 700,
            maxShadowOpacity: flipConfig.maxShadowOpacity || 0.5,
            showCover: flipConfig.showCover !== false,
            usePortrait: usePortrait,
            mobileScrollSupport: flipConfig.mobileScrollSupport !== false,
            autoSize: flipConfig.autoSize !== false
        });

        // Load all pages
        this.pageFlipInstance.loadFromHTML(document.querySelectorAll('.page'));

        console.log(`Book Engine Started (${isMobile ? 'mobile' : 'desktop'} mode, ${Math.round(pageWidth)}x${Math.round(pageHeight)})`);

        // UI Controls
        const tocPageIndex = settings.tocPageIndex || 2;
        const btnToc = document.getElementById(elements.btnTocId || 'btn-toc');
        if (btnToc) {
            btnToc.onclick = () => {
                this.pageFlipInstance.flip(tocPageIndex);
            };
        }
    },

    /**
     * Register a callback for page change events
     * @param {Function} callback - Callback function(pageIndex)
     */
    onPageChange(callback) {
        if (this.pageFlipInstance) {
            this.pageFlipInstance.on('flip', (e) => {
                callback(e.data);
            });
        }
    },

    /**
     * Get chapter information for a given page index
     * @param {number} pageIndex - Page index
     * @returns {Object|null} Chapter info or null
     */
    getChapterForPage(pageIndex) {
        return this.pageToChapterMap[pageIndex] || null;
    }
};
