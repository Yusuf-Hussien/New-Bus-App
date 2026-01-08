/**
 * Node.js script to generate PWA icons
 * Requires: npm install canvas
 * Run: node generate-icons.js
 */

const fs = require('fs');
const path = require('path');

// Check if canvas is available
let createCanvas;
try {
    const { createCanvas: cc } = require('canvas');
    createCanvas = cc;
} catch (e) {
    console.error('Error: canvas package is required.');
    console.error('Install it with: npm install canvas');
    console.error('\nAlternatively, use the HTML generator: generate-icons-auto.html');
    process.exit(1);
}

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Helper function to draw rounded rectangle
function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

function drawBusIcon(ctx, size) {
    const centerX = size / 2;
    const centerY = size / 2;
    
    // Background with gradient
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#4A90E2');
    gradient.addColorStop(1, '#2E5C8A');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    
    // Bus body (white)
    ctx.fillStyle = '#FFFFFF';
    const busWidth = size * 0.6;
    const busHeight = size * 0.4;
    const busX = centerX - busWidth / 2;
    const busY = centerY - busHeight / 2;
    
    // Rounded rectangle for bus
    const radius = size * 0.05;
    drawRoundedRect(ctx, busX, busY, busWidth, busHeight, radius);
    ctx.fill();
    
    // Bus windows
    ctx.fillStyle = '#4A90E2';
    const windowWidth = busWidth * 0.15;
    const windowHeight = busHeight * 0.4;
    const windowSpacing = busWidth * 0.2;
    const windowY = busY + busHeight * 0.2;
    
    // Left window
    ctx.fillRect(busX + windowSpacing, windowY, windowWidth, windowHeight);
    // Right window
    ctx.fillRect(busX + busWidth - windowSpacing - windowWidth, windowY, windowWidth, windowHeight);
    
    // Bus wheels
    ctx.fillStyle = '#2E5C8A';
    const wheelRadius = size * 0.06;
    // Left wheel
    ctx.beginPath();
    ctx.arc(busX + busWidth * 0.25, busY + busHeight, wheelRadius, 0, Math.PI * 2);
    ctx.fill();
    // Right wheel
    ctx.beginPath();
    ctx.arc(busX + busWidth * 0.75, busY + busHeight, wheelRadius, 0, Math.PI * 2);
    ctx.fill();
}

function generateIcons() {
    const outputDir = __dirname;
    console.log('Generating PWA icons for NewBus...\n');
    
    sizes.forEach(size => {
        const canvas = createCanvas(size, size);
        const ctx = canvas.getContext('2d');
        
        drawBusIcon(ctx, size);
        
        const filename = `icon-${size}x${size}.png`;
        const filepath = path.join(outputDir, filename);
        const buffer = canvas.toBuffer('image/png');
        
        fs.writeFileSync(filepath, buffer);
        console.log(`✓ Generated ${filename}`);
    });
    
    console.log(`\n✓ All icons generated successfully in '${outputDir}' directory!`);
    console.log('Icons are ready for PWA deployment.');
}

generateIcons();

