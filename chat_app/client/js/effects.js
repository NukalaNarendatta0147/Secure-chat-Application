/**
 * Mystical Waterfall Particle System
 * Renders floating particles and ambient effects using HTML5 Canvas
 */

const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];

// Particle Configuration
const CONFIG = {
    count: 100,
    minSize: 1,
    maxSize: 3,
    minSpeed: 0.2,
    maxSpeed: 0.8,
    colors: [
        'rgba(56, 189, 248, 0.4)',  // Light Blue
        'rgba(45, 212, 191, 0.3)',  // Teal
        'rgba(129, 140, 248, 0.3)'  // Indigo
    ]
};

class Particle {
    constructor() {
        this.reset();
        // Randomize Y initially to fill screen
        this.y = Math.random() * height;
    }

    reset() {
        this.x = Math.random() * width;
        this.y = height + 10; // Start just below screen
        this.size = Math.random() * (CONFIG.maxSize - CONFIG.minSize) + CONFIG.minSize;
        this.speed = Math.random() * (CONFIG.maxSpeed - CONFIG.minSpeed) + CONFIG.minSpeed;
        this.color = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];
        this.wobble = Math.random() * Math.PI * 2;
        this.wobbleSpeed = Math.random() * 0.05;
    }

    update() {
        // Move Upwards (Reverse Waterfall / Floating effect) or Downwards?
        // "Mystical Waterfall" usually implies falling, but "Floating Particles" implies rising.
        // Let's go for a slow rising "spiritual" effect (Bubbles/Orbs).
        this.y -= this.speed;

        // Horizontal wobble
        this.wobble += this.wobbleSpeed;
        this.x += Math.sin(this.wobble) * 0.5;

        // Reset if off screen
        if (this.y < -10) {
            this.reset();
        }
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
    }
}

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}

function init() {
    resize();
    window.addEventListener('resize', resize);

    // Create particles
    for (let i = 0; i < CONFIG.count; i++) {
        particles.push(new Particle());
    }

    animate();
}

function animate() {
    ctx.clearRect(0, 0, width, height);

    // Draw background overlay helper (optional, handled by CSS)

    particles.forEach(p => {
        p.update();
        p.draw();
    });

    requestAnimationFrame(animate);
}

// Start immediately
init();
