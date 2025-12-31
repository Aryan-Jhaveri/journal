// --- configuration ---
// The CONFIG object is removed as JOURNAL_SETTINGS is now used.

let pageFlipInstance; // Global reference to the book instance

// --- p5.js Background Sketch ---
if (window.JOURNAL_SETTINGS && JOURNAL_SETTINGS.enableBackgroundAnimation) {
    const backgroundSketch = (p) => {
        let particles = [];

        p.setup = () => {
            let canvas = p.createCanvas(p.windowWidth, p.windowHeight);
            canvas.parent('p5-container');
            p.background(44, 41, 37);

            for (let i = 0; i < 50; i++) {
                particles.push(new Particle(p));
            }
        };

        p.draw = () => {
            p.background(44, 41, 37, 10);
            for (let particle of particles) {
                particle.update();
                particle.show();
            }
        };

        p.windowResized = () => {
            p.resizeCanvas(p.windowWidth, p.windowHeight);
        };

        class Particle {
            constructor(p) {
                this.p = p;
                this.x = p.random(p.width);
                this.y = p.random(p.height);
                this.vx = p.random(-0.5, 0.5);
                this.vy = p.random(-0.5, 0.5);
                this.size = p.random(1, 3);
                this.alpha = p.random(50, 150);
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Mouse interaction
                let d = this.p.dist(this.x, this.y, this.p.mouseX, this.p.mouseY);
                if (d < 100) {
                    let angle = this.p.atan2(this.y - this.p.mouseY, this.x - this.p.mouseX);
                    this.x += this.p.cos(angle) * 2;
                    this.y += this.p.sin(angle) * 2;
                }

                if (this.x < 0) this.x = this.p.width;
                if (this.x > this.p.width) this.x = 0;
                if (this.y < 0) this.y = this.p.height;
                if (this.y > this.p.height) this.y = 0;
            }

            show() {
                this.p.noStroke();
                this.p.fill(200, 190, 170, this.alpha);
                this.p.ellipse(this.x, this.y, this.size);
            }
        }
    };

    new p5(backgroundSketch);
}


// --- Core Application Logic ---

document.addEventListener('DOMContentLoaded', initApp);

async function initApp() {
    console.log("Initializing Journal App...");

    // Apply User Settings (Fonts, Margins)
    applyVisualSettings();

    // 1. Fetch Data
    const chapters = await loadStoryData(JOURNAL_SETTINGS.dataSource);
    if (!chapters || chapters.length === 0) return; // Exit if no data

    // 2. Render Content
    renderBookContent(chapters);

    // 3. Initialize Book Engine
    initPageFlip();
}

/**
 * Applies styles from settings.js to the document
 */
function applyVisualSettings() {
    const r = document.querySelector(':root');
    if (!r || !window.JOURNAL_SETTINGS) return;

    const s = JOURNAL_SETTINGS;

    // We can directly modify CSS variables or specific elements
    // For simplicity, we'll maintain the CSS class structure but inject a standard style block 
    // or modify variables if we had set them up. 
    // Since we didn't use vars in CSS initially, let's set them on specific elements or 
    // inject a dynamic stylesheet.

    // Let's use CSS Variables which is cleaner
    r.style.setProperty('--font-body', s.fonts.body);
    r.style.setProperty('--font-headers', s.fonts.headers);
    r.style.setProperty('--page-margin', s.pageMargins);
    r.style.setProperty('--font-size', s.fontSize);
}

/**
 * Fetches story data from the JSON file.
 */
async function loadStoryData(url) {
    try {
        const response = await fetch(url);
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

/**
 * Generates HTML for the TOC and Story Pages.
 */
function renderBookContent(chapters) {
    const bookElement = document.getElementById(JOURNAL_SETTINGS.bookId);
    const tocList = document.getElementById(JOURNAL_SETTINGS.tocId);

    // Clear existing dynamic content
    // Clear existing dynamic pages correctly
    // We only want to keep the initial static pages (Cover, Blank, TOC, Blank -> 4 pages)
    // Identify static pages by absence of a specific class or just keep the first 4?
    // Safer: Add a class 'static-page' to HTML and remove everything else.
    // Or just check if we have more than 4 pages.
    const allPages = bookElement.querySelectorAll('.page');
    const staticPageCount = 4; // Cover, Blank, TOC, Blank

    // Remove any previously added dynamic pages
    for (let i = allPages.length - 1; i >= staticPageCount; i--) {
        allPages[i].remove();
    }

    // Reset global index
    let globalPageIndex = staticPageCount;

    chapters.forEach((chapter) => {
        // 1. Create TOC Entry (Links to the *start* of the chapter)
        const li = document.createElement('li');
        li.textContent = chapter.title;

        // Capture specific page index
        const targetPage = globalPageIndex;
        li.onclick = () => {
            // Ensure pageFlipInstance is ready
            if (pageFlipInstance) pageFlipInstance.flip(targetPage);
        };
        tocList.appendChild(li);

        // 2. Split Content
        const safeContent = chapter.content || "";
        const contentPages = splitTextIntoChunks(safeContent, JOURNAL_SETTINGS.charsPerPage || 800);

        contentPages.forEach((chunk, chunkIndex) => {
            // Helper to determine if we need to mark these pages for easier removal later? 
            // We just rely on index slicing above.
            const isFirstPage = chunkIndex === 0;
            const pageDiv = createPageElement(chapter, chunk, isFirstPage, chunkIndex + 1, contentPages.length);
            bookElement.appendChild(pageDiv);
            globalPageIndex++;
        });
    });

    // Ensure total page count is even before adding Back Cover?
    // StPageFlip works best with even total pages usually, but let's just add the back cover.
    // If we want the back cover to be a "Hard" cover at the very end.

    const backCover = document.createElement('div');
    backCover.classList.add('page', 'cover');
    backCover.setAttribute('data-density', 'hard');
    backCover.innerHTML = '<div class="page-content"><center><p>The End</p></center></div>';
    bookElement.appendChild(backCover);
}

/**
 * Splits text into chunks based on char limit, preserving paragraphs.
 */
/**
 * Splits text into chunks based on char limit, preserving paragraphs and handling images.
 */
function splitTextIntoChunks(text, maxChars) {
    if (!text) return [];

    // Pre-process: Identify images and temporarily replace them or split around them.
    // Regex for Markdown image: ![alt](url)
    // We'll split the text by images first.
    const imageRegex = /(!\[.*?\]\(.*?\))/g;
    const sections = text.split(imageRegex); // This preserves the captured group (the image tag)

    let pages = [];
    let currentChunk = "";

    sections.forEach(section => {
        if (section.match(imageRegex)) {
            // It's an image. Parse it to HTML.
            // Format: ![alt](url)
            const match = section.match(/!\[(.*?)\]\((.*?)\)/);
            const alt = match[1];
            const src = match[2];
            const imgHTML = `<div class="story-image-container"><img src="${src}" alt="${alt}" class="story-image"></div>`;

            // If current chunk has content, image might fit or start new page.
            // Images take a lot of visual space. Let's assume an image takes ~400 chars worth of space?
            // Or force a page break for large images.
            // Approach: If image + current chunk > max, push current chunk, then push image (or add to new).
            // Simplification: Treat image as a chunk of length 300.
            const estimatedImageSize = 300;

            if ((currentChunk.length + estimatedImageSize) > maxChars && currentChunk.length > 0) {
                // Page break before image
                pages.push(currentChunk);
                currentChunk = imgHTML + "\n";
            } else {
                currentChunk += imgHTML + "\n";
            }
        } else {
            // Regular text. Split by paragraphs as before.
            const paragraphs = section.split('\n');
            paragraphs.forEach(para => {
                if (!para.trim()) return; // Skip empty splits if any

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
}

/**
 * Helpers to create a single page DOM element
 */
function createPageElement(chapter, textContent, isFirstPage, partNum, totalParts) {
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
}

/**
 * Initializes the StPageFlip library.
 */
function initPageFlip() {
    if (typeof St === 'undefined') {
        console.error("StPageFlip library not loaded.");
        return;
    }

    const bookEl = document.getElementById(JOURNAL_SETTINGS.bookId);

    pageFlipInstance = new St.PageFlip(bookEl, {
        width: JOURNAL_SETTINGS.width,
        height: JOURNAL_SETTINGS.height,
        size: 'stretch',
        minWidth: 315,
        maxWidth: 1000,
        minHeight: 420,
        maxHeight: 1350,
        maxShadowOpacity: 0.5,
        showCover: true,
        usePortrait: JOURNAL_SETTINGS.usePortrait ?? false, // Default to false (two-page) if undefined
        mobileScrollSupport: true // Allow touch scroll inside pages
    });

    // Load all pages found in the DOM (static + dynamic)
    pageFlipInstance.loadFromHTML(document.querySelectorAll('.page'));

    console.log(`Book Engine Started.`);

    // UI Controls
    const btnToc = document.getElementById('btn-toc');
    if (btnToc) {
        btnToc.onclick = () => {
            // TOC is page 1 (cover is 0)
            // But StPageFlip uses 0-based index.
            // If we have Cover(0), TOC(1).
            pageFlipInstance.flip(1);
        };
    }
}
