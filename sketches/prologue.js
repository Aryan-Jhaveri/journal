/**
 * Prologue Scene - "The Old Attic"
 * Dusty, nostalgic atmosphere with floating dust particles
 */

class PrologueScene {
    constructor(p) {
        this.p = p;
        this.dustParticles = [];
        this.time = 0;
    }

    setup() {
        // Warm, dusty brown background
        this.p.background(58, 52, 45);

        // Create dust particles
        for (let i = 0; i < 80; i++) {
            this.dustParticles.push({
                x: this.p.random(this.p.width),
                y: this.p.random(this.p.height),
                size: this.p.random(1, 4),
                speed: this.p.random(0.1, 0.5),
                alpha: this.p.random(30, 100),
                offset: this.p.random(1000)
            });
        }
    }

    draw() {
        // Subtle gradient background
        this.p.background(58, 52, 45, 20);

        this.time += 0.01;

        // Draw floating dust
        for (let dust of this.dustParticles) {
            // Gentle floating motion
            dust.y -= dust.speed;
            dust.x += this.p.sin(this.time + dust.offset) * 0.5;

            // Wrap around
            if (dust.y < 0) dust.y = this.p.height;
            if (dust.x < 0) dust.x = this.p.width;
            if (dust.x > this.p.width) dust.x = 0;

            // Draw dust particle
            this.p.noStroke();
            this.p.fill(200, 180, 140, dust.alpha);
            this.p.ellipse(dust.x, dust.y, dust.size);
        }

        // Subtle vignette effect
        this.drawVignette();
    }

    drawVignette() {
        this.p.push();
        this.p.noFill();
        for (let i = 0; i < 50; i++) {
            let alpha = this.p.map(i, 0, 50, 0, 30);
            this.p.stroke(0, alpha);
            this.p.strokeWeight(2);
            this.p.rect(i * 10, i * 10, this.p.width - i * 20, this.p.height - i * 20);
        }
        this.p.pop();
    }
}
