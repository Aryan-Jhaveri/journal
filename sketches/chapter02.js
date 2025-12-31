/**
 * Chapter 2 Scene - "The Letter"
 * Parchment texture with ink-like flowing patterns
 */

class Chapter02Scene {
    constructor(p) {
        this.p = p;
        this.inkFlows = [];
        this.time = 0;
    }

    setup() {
        // Parchment color
        this.p.background(240, 230, 210);

        // Create ink flows
        for (let i = 0; i < 8; i++) {
            this.inkFlows.push({
                x: this.p.random(this.p.width),
                y: this.p.random(this.p.height),
                points: [],
                maxPoints: this.p.random(30, 60),
                speed: this.p.random(1, 3),
                hue: this.p.random(200, 220)
            });

            // Initialize points
            for (let j = 0; j < this.inkFlows[i].maxPoints; j++) {
                this.inkFlows[i].points.push({
                    x: this.inkFlows[i].x,
                    y: this.inkFlows[i].y
                });
            }
        }
    }

    draw() {
        // Parchment with slight transparency for trails
        this.p.background(240, 230, 210, 15);

        this.time += 0.01;

        // Draw paper texture
        this.p.noStroke();
        for (let i = 0; i < 200; i++) {
            let x = this.p.random(this.p.width);
            let y = this.p.random(this.p.height);
            let alpha = this.p.random(5, 15);
            this.p.fill(180, 160, 130, alpha);
            this.p.ellipse(x, y, this.p.random(1, 3));
        }

        // Draw ink flows
        for (let flow of this.inkFlows) {
            // Update head position with flowing motion
            flow.x += this.p.cos(this.time + flow.y * 0.01) * flow.speed;
            flow.y += this.p.sin(this.time + flow.x * 0.01) * flow.speed;

            // Wrap around
            if (flow.x < 0) flow.x = this.p.width;
            if (flow.x > this.p.width) flow.x = 0;
            if (flow.y < 0) flow.y = this.p.height;
            if (flow.y > this.p.height) flow.y = 0;

            // Update points (trail)
            flow.points.shift();
            flow.points.push({ x: flow.x, y: flow.y });

            // Draw the flow
            this.p.noFill();
            this.p.beginShape();
            for (let i = 0; i < flow.points.length; i++) {
                let alpha = this.p.map(i, 0, flow.points.length, 0, 60);
                this.p.stroke(40, 35, 50, alpha);
                this.p.strokeWeight(this.p.map(i, 0, flow.points.length, 1, 4));
                this.p.curveVertex(flow.points[i].x, flow.points[i].y);
            }
            this.p.endShape();
        }
    }
}
