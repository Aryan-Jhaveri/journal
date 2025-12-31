/**
 * Default Background Scene
 * Particle-based animation (existing background)
 */

class DefaultScene {
    constructor(p) {
        this.p = p;
        this.particles = [];
    }

    setup() {
        this.p.background(44, 41, 37);

        // Initialize particles
        for (let i = 0; i < 50; i++) {
            this.particles.push(new Particle(this.p));
        }
    }

    draw() {
        this.p.background(44, 41, 37, 10);

        for (let particle of this.particles) {
            particle.update();
            particle.show();
        }
    }
}

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

        // Wrap around edges
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
