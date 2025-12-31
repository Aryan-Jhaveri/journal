/**
 * Chapter 1 Scene - "The Stranger"
 * Dark, mysterious atmosphere with swirling shadows
 */

class Chapter01Scene {
    constructor(p) {
        this.p = p;
        this.shadows = [];
        this.time = 0;
    }

    setup() {
        this.p.background(20, 18, 22);

        // Create shadow tendrils
        for (let i = 0; i < 15; i++) {
            this.shadows.push({
                x: this.p.random(this.p.width),
                y: this.p.random(this.p.height),
                angle: this.p.random(this.p.TWO_PI),
                length: this.p.random(100, 300),
                speed: this.p.random(0.005, 0.02),
                thickness: this.p.random(20, 60),
                offset: this.p.random(1000)
            });
        }
    }

    draw() {
        // Very dark background with slight transparency for trails
        this.p.background(20, 18, 22, 30);

        this.time += 0.01;

        // Draw swirling shadows
        for (let shadow of this.shadows) {
            shadow.angle += shadow.speed;

            // Calculate end point
            let endX = shadow.x + this.p.cos(shadow.angle + this.time) * shadow.length;
            let endY = shadow.y + this.p.sin(shadow.angle + this.time) * shadow.length;

            // Slowly drift
            shadow.x += this.p.sin(this.time * 0.5 + shadow.offset) * 0.3;
            shadow.y += this.p.cos(this.time * 0.5 + shadow.offset) * 0.3;

            // Wrap around
            if (shadow.x < -100) shadow.x = this.p.width + 100;
            if (shadow.x > this.p.width + 100) shadow.x = -100;
            if (shadow.y < -100) shadow.y = this.p.height + 100;
            if (shadow.y > this.p.height + 100) shadow.y = -100;

            // Draw shadow tendril
            this.p.stroke(10, 8, 15, 80);
            this.p.strokeWeight(shadow.thickness);
            this.p.line(shadow.x, shadow.y, endX, endY);

            // Add glow
            this.p.stroke(30, 25, 35, 40);
            this.p.strokeWeight(shadow.thickness + 10);
            this.p.line(shadow.x, shadow.y, endX, endY);
        }

        // Add subtle noise overlay
        this.p.loadPixels();
        for (let i = 0; i < this.p.pixels.length; i += 4) {
            if (this.p.random(1) > 0.95) {
                let noise = this.p.random(-20, 20);
                this.p.pixels[i] += noise;
                this.p.pixels[i + 1] += noise;
                this.p.pixels[i + 2] += noise;
            }
        }
        this.p.updatePixels();
    }
}
