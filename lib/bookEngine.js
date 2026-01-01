/**
 * Book Engine Module
 * Handles page rendering, pagination, and page flip functionality
 * PDF-only mode: renders PDF pages as images in the flip-book
 */

const BookEngine = {
    pageFlipInstance: null,
    chapters: [],
    pageToChapterMap: {},

    /**
     * Renders book content from chapter data (PDF pages)
     * @param {Array} chapters - Array of chapter objects with pages array
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

        // Clear TOC
        tocList.innerHTML = '';

        // Reset global index
        let globalPageIndex = staticPageCount;

        chapters.forEach((chapter, chapterIdx) => {
            // 1. Create TOC Entry
            const li = document.createElement('li');
            li.textContent = chapter.title;

            // Capture specific page index for TOC navigation
            const targetPage = globalPageIndex;
            li.onclick = () => {
                if (this.pageFlipInstance) this.pageFlipInstance.flip(targetPage);
            };
            tocList.appendChild(li);

            // 2. Render PDF pages (1:1 mapping)
            if (chapter.pages && chapter.pages.length > 0) {
                chapter.pages.forEach((pdfPage, pageIndex) => {
                    const isFirstPage = pageIndex === 0;
                    const pageDiv = this.createPDFPageElement(
                        pdfPage,
                        chapter,
                        isFirstPage,
                        pageIndex + 1,
                        chapter.pages.length
                    );
                    bookElement.appendChild(pageDiv);

                    // Map page index to chapter
                    this.pageToChapterMap[globalPageIndex] = {
                        chapterIndex: chapterIdx,
                        chapter: chapter,
                        filename: chapter.pdfFile || 'default',
                        pdfPageNumber: pdfPage.pageNumber
                    };

                    globalPageIndex++;
                });
            } else {
                // No pages - show error placeholder
                const errorDiv = this.createErrorPageElement(chapter);
                bookElement.appendChild(errorDiv);

                this.pageToChapterMap[globalPageIndex] = {
                    chapterIndex: chapterIdx,
                    chapter: chapter,
                    filename: 'error'
                };
                globalPageIndex++;
            }
        });

        // Add 4 blank end pages before back cover
        for (let i = 0; i < 4; i++) {
            const blankPage = document.createElement('div');
            blankPage.classList.add('page', 'blank-page');
            blankPage.innerHTML = `<div class="page-content"></div>`;
            bookElement.appendChild(blankPage);
        }

        // Add inside back cover (pairs with exterior back cover)
        const insideBackCover = document.createElement('div');
        insideBackCover.classList.add('page', 'cover', 'inside-back-cover');
        insideBackCover.setAttribute('data-density', 'hard');
        insideBackCover.innerHTML = `<div class="page-content"></div>`;
        bookElement.appendChild(insideBackCover);

        // Add back cover exterior (styled like front cover)
        const backCover = document.createElement('div');
        backCover.classList.add('page', 'cover', 'back-cover');
        backCover.setAttribute('data-density', 'hard');
        backCover.innerHTML = `<div class="page-content"></div>`;
        bookElement.appendChild(backCover);

        console.log(`Rendered ${globalPageIndex - staticPageCount} content pages`);
    },

    /**
     * Creates a page element from a PDF page image
     * @param {Object} pdfPage - PDF page object with dataUrl
     * @param {Object} chapter - Chapter object
     * @param {boolean} isFirstPage - Whether this is the first page of the chapter
     * @param {number} partNum - Current page number within chapter
     * @param {number} totalParts - Total pages in chapter
     * @returns {HTMLElement} Page div element
     */
    createPDFPageElement(pdfPage, chapter, isFirstPage, partNum, totalParts) {
        const pageDiv = document.createElement('div');
        pageDiv.classList.add('page');

        const contentDiv = document.createElement('div');
        contentDiv.classList.add('page-content', 'pdf-page');

        // Full-page PDF image
        contentDiv.innerHTML = `
            <img src="${pdfPage.dataUrl}" 
                 alt="${chapter.title} - Page ${partNum}" 
                 class="pdf-page-image"
                 draggable="false">
        `;

        pageDiv.appendChild(contentDiv);
        return pageDiv;
    },

    /**
     * Creates an error placeholder page
     * @param {Object} chapter - Chapter object with error
     * @returns {HTMLElement} Page div element
     */
    createErrorPageElement(chapter) {
        const pageDiv = document.createElement('div');
        pageDiv.classList.add('page');

        const contentDiv = document.createElement('div');
        contentDiv.classList.add('page-content');
        contentDiv.innerHTML = `
            <h2>${chapter.title}</h2>
            <p class="error-message">Failed to load PDF content</p>
            <p class="error-detail">${chapter.error || 'Unknown error'}</p>
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
