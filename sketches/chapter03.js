/**
 * Chapter 3 Scene - "The Discovery"
 * Energetic, mystical patterns with glowing elements
 */

class Chapter03Scene {
    constructor(p) {
        this.p = p;
        this.energyParticles = [];
        this.time = 0;
        this.centerX = 0;
        this.centerY = 0;
    }

    setup() {
        this.centerX = this.p.width / 2;
        this.centerY = this.p.height / 2;

        this.p.background(15, 20, 35);

        // Create energy particles
        for (let i = 0; i < 100; i++) {
            let angle = this.p.random(this.p.TWO_PI);
            let radius = this.p.random(50, 300);
            this.energyParticles.push({
                angle: angle,
                radius: radius,
                speed: this.p.random(0.01, 0.03),
                size: this.p.random(2, 8),
                color: this.p.color(
                    this.p.random(100, 200),
                    this.p.random(150, 255),
                    this.p.random(200, 255),
                    this.p.random(100, 200)
                ),
                pulseOffset: this.p.random(1000)
            });
        }
    }

    draw() {
        // Dark background with trails
        this.p.background(15, 20, 35, 40);

        this.time += 0.02;
        this.centerX = this.p.width / 2 + this.p.sin(this.time * 0.5) * 50;
        this.centerY = this.p.height / 2 + this.p.cos(this.time * 0.5) * 50;

        // Draw energy particles orbiting
        for (let particle of this.energyParticles) {
            particle.angle += particle.speed;

            // Calculate position
            let x = this.centerX + this.p.cos(particle.angle) * particle.radius;
            let y = this.centerY + this.p.sin(particle.angle) * particle.radius;

            // Pulsing size
            let pulse = this.p.sin(this.time * 2 + particle.pulseOffset) * 0.5 + 1;
            let currentSize = particle.size * pulse;

            // Draw particle with glow
            this.p.noStroke();
            this.p.fill(particle.color);
            this.p.ellipse(x, y, currentSize);

            // Outer glow
            let glowColor = this.p.color(
                this.p.red(particle.color),
                this.p.green(particle.color),
                this.p.blue(particle.color),
                50
            );
            this.p.fill(glowColor);
            this.p.ellipse(x, y, currentSize * 2);
        }

        // Draw connecting lines between nearby particles
        this.p.stroke(100, 150, 200, 30);
        this.p.strokeWeight(1);
        for (let i = 0; i < this.energyParticles.length; i++) {
            let p1 = this.energyParticles[i];
            let x1 = this.centerX + this.p.cos(p1.angle) * p1.radius;
            let y1 = this.centerY + this.p.sin(p1.angle) * p1.radius;

            for (let j = i + 1; j < this.energyParticles.length; j++) {
                let p2 = this.energyParticles[j];
                let x2 = this.centerX + this.p.cos(p2.angle) * p2.radius;
                let y2 = this.centerY + this.p.sin(p2.angle) * p2.radius;

                let d = this.p.dist(x1, y1, x2, y2);
                if (d < 100) {
                    let alpha = this.p.map(d, 0, 100, 50, 0);
                    this.p.stroke(100, 150, 200, alpha);
                    this.p.line(x1, y1, x2, y2);
                }
            }
        }

        // Central glow
        this.p.noStroke();
        for (let i = 5; i > 0; i--) {
            let alpha = this.p.map(i, 0, 5, 0, 30);
            this.p.fill(150, 200, 255, alpha);
            this.p.ellipse(this.centerX, this.centerY, i * 40);
        }
    }
}
