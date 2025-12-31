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
        const bookElement = document.getElementById(JOURNAL_SETTINGS.bookId);
        const tocList = document.getElementById(JOURNAL_SETTINGS.tocId);

        // Clear existing dynamic pages
        const allPages = bookElement.querySelectorAll('.page');
        const staticPageCount = 4; // Cover, Blank, TOC, Blank

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
            const contentPages = this.splitTextIntoChunks(safeContent, JOURNAL_SETTINGS.charsPerPage || 800);

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
        backCover.innerHTML = '<div class="page-content"><center><p>The End</p></center></div>';
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

                const estimatedImageSize = 300;

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

        const bookEl = document.getElementById(JOURNAL_SETTINGS.bookId);

        // Detect if we're on mobile for initial setup
        const breakpoint = JOURNAL_SETTINGS.responsive?.mobileBreakpoint || 768;
        const isMobile = window.innerWidth < breakpoint;
        const usePortrait = isMobile || (JOURNAL_SETTINGS.usePortrait ?? false);

        // Calculate dynamic dimensions based on viewport
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        // For mobile: use most of viewport width, leave room for nav
        // For desktop: use configured dimensions or calculate from viewport
        let pageWidth, pageHeight;

        if (isMobile) {
            pageWidth = Math.min(vw * 0.9, 400);  // 90% of viewport, max 400px
            pageHeight = Math.min(vh * 0.75, 600); // 75% of viewport (leave room for nav)
        } else {
            pageWidth = JOURNAL_SETTINGS.width || Math.min(vw * 0.35, 500);
            pageHeight = JOURNAL_SETTINGS.height || Math.min(vh * 0.8, 700);
        }

        this.pageFlipInstance = new St.PageFlip(bookEl, {
            width: pageWidth,
            height: pageHeight,
            size: 'stretch',
            minWidth: 150,
            maxWidth: Math.min(vw * 0.45, 600),
            minHeight: 200,
            maxHeight: Math.min(vh * 0.85, 800),
            maxShadowOpacity: 0.5,
            showCover: true,
            usePortrait: usePortrait,
            mobileScrollSupport: true,
            autoSize: true
        });

        // Load all pages
        this.pageFlipInstance.loadFromHTML(document.querySelectorAll('.page'));

        console.log(`Book Engine Started (${isMobile ? 'mobile' : 'desktop'} mode, ${pageWidth}x${pageHeight})`);

        // UI Controls
        const btnToc = document.getElementById('btn-toc');
        if (btnToc) {
            btnToc.onclick = () => {
                this.pageFlipInstance.flip(1);
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
