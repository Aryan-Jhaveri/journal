
// --- configuration ---
const CONFIG = {
    // Reference to DOM elements
    bookId: 'book',
    tocId: 'toc-list',
    // Reference to data source
    dataSource: 'chapters.json',
    // Book dimensions
    bookDims: { width: 400, height: 600 }
};

let pageFlipInstance; // Global reference to the book instance

// --- p5.js Background Sketch ---
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


// --- Core Application Logic ---

document.addEventListener('DOMContentLoaded', initApp);

async function initApp() {
    console.log("Initializing Journal App...");

    // 1. Fetch Data
    const chapters = await loadStoryData(CONFIG.dataSource);
    if (!chapters || chapters.length === 0) return; // Exit if no data

    // 2. Render Content
    renderBookContent(chapters);

    // 3. Initialize Book Engine
    initPageFlip();
}

/**
 * Fetches story data from the JSON file.
 */
async function loadStoryData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (e) {
        console.error("Failed to load story data:", e);
        // Fallback for local testing without server
        return [
            {
                title: "Welcome",
                date: new Date().toDateString(),
                content: "If you see this, the 'chapters.json' file could not be loaded. Please ensure you are running a local server."
            }
        ];
    }
}

/**
 * Generates HTML for the TOC and Story Pages.
 */
function renderBookContent(chapters) {
    const bookElement = document.getElementById(CONFIG.bookId);
    const tocList = document.getElementById(CONFIG.tocId);

    // Clear existing dynamic content if any (useful for re-rendering)
    tocList.innerHTML = '';

    // We already have static pages in HTML (Cover, TOC), so we append dynamic pages after them.
    // Static pages count: Cover(0), TOC(1). Dynamic starts at index 2.
    // NOTE: If you add more static pages in HTML, update this offset.
    const startPageOffset = 2;

    chapters.forEach((chapter, index) => {
        const globalPageIndex = startPageOffset + index;

        // 1. Create TOC Entry
        const li = document.createElement('li');
        li.textContent = chapter.title;
        li.onclick = () => {
            if (pageFlipInstance) pageFlipInstance.flip(globalPageIndex);
        };
        tocList.appendChild(li);

        // 2. Create Page DOM
        const pageDiv = createPageElement(chapter);
        bookElement.appendChild(pageDiv);
    });

    // Append Back Cover
    const backCover = document.createElement('div');
    backCover.classList.add('page', 'cover');
    backCover.setAttribute('data-density', 'hard');
    backCover.innerHTML = '<div class="page-content"><center><p>The End</p></center></div>';
    bookElement.appendChild(backCover);
}

/**
 * Helpers to create a single page DOM element
 */
function createPageElement(chapter) {
    const pageDiv = document.createElement('div');
    pageDiv.classList.add('page');

    const contentDiv = document.createElement('div');
    contentDiv.classList.add('page-content');

    // Optional: Parse markdown here if desired in future
    contentDiv.innerHTML = `
        <h2>${chapter.title}</h2>
        <span class="date">${chapter.date}</span>
        <div class="story-text">
            <p>${chapter.content}</p>
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

    const bookEl = document.getElementById(CONFIG.bookId);

    pageFlipInstance = new St.PageFlip(bookEl, {
        width: CONFIG.bookDims.width,
        height: CONFIG.bookDims.height,
        size: 'stretch',
        minWidth: 315,
        maxWidth: 1000,
        minHeight: 420,
        maxHeight: 1350,
        maxShadowOpacity: 0.5,
        showCover: true,
        usePortrait: true, // Auto switch to portrait on resize
        mobileScrollSupport: true // Allow touch scroll inside pages
    });

    // Load all pages found in the DOM (static + dynamic)
    pageFlipInstance.loadFromHTML(document.querySelectorAll('.page'));

    console.log(`Book Engine Started. Total Pages: ${pageFlipInstance.getPageCount()}`);
}
