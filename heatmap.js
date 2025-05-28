// Enhanced Fluid Gradient Visualization
document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('heatmap-canvas');
    const container = document.getElementById('heatmap-container');
    
    if (!canvas || !container) {
        console.error('Heatmap elements not found in the DOM');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    
    // Set canvas to container size with high resolution
    function resizeCanvas() {
        // Use device pixel ratio for higher resolution on retina displays
        const dpr = window.devicePixelRatio || 1;
        const rect = container.getBoundingClientRect();
        
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
        
        ctx.scale(dpr, dpr);
        
        // Reset gradient when resizing
        generateGradient();
    }
    
    // Initialize canvas size
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Mouse/touch tracking
    let mouseX = 0;
    let mouseY = 0;
    let lastMouseX = 0;
    let lastMouseY = 0;
    let isMouseActive = false;
    let mouseVelocityX = 0;
    let mouseVelocityY = 0;
    let mousePoints = [];
    const maxMousePoints = 50; // Store more points for smoother trails
    
    // Gradient animation variables
    const blobs = [];
    const numBlobs = 5;
    
    // Vibrant color palette (purple, pink, orange) matching your reference image
    const colorPalette = [
        { pos: 0.0, color: '#240040' },  // Deep purple
        { pos: 0.3, color: '#900C3F' },  // Rich purple/pink
        { pos: 0.5, color: '#FF2D6D' },  // Vibrant pink
        { pos: 0.7, color: '#FF8D29' },  // Warm orange
        { pos: 0.9, color: '#FFBD69' },  // Light orange
        { pos: 1.0, color: '#240040' }   // Back to deep purple for seamless loops
    ];
    
    // Generate fluid blobs
    function generateGradient() {
        blobs.length = 0;
        
        // Create main color blobs
        for (let i = 0; i < numBlobs; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const radius = (canvas.width / 4) * (0.5 + Math.random() * 0.5);
            const speedX = (Math.random() - 0.5) * 0.4;
            const speedY = (Math.random() - 0.5) * 0.4;
            const colorIdx = Math.floor(Math.random() * (colorPalette.length - 1));
            
            blobs.push({
                x, y, radius, speedX, speedY,
                color: colorPalette[colorIdx].color,
                amplitude: 0.2 + Math.random() * 0.4,
                phase: Math.random() * Math.PI * 2,
                phaseSpeed: 0.002 + Math.random() * 0.003
            });
        }
    }
    
    // Interpolate between colors for smooth transitions
    function interpolateColor(color1, color2, t) {
        // Parse hex colors
        const r1 = parseInt(color1.slice(1, 3), 16);
        const g1 = parseInt(color1.slice(3, 5), 16);
        const b1 = parseInt(color1.slice(5, 7), 16);
        
        const r2 = parseInt(color2.slice(1, 3), 16);
        const g2 = parseInt(color2.slice(3, 5), 16);
        const b2 = parseInt(color2.slice(5, 7), 16);
        
        // Linear interpolation
        const r = Math.round(r1 + (r2 - r1) * t);
        const g = Math.round(g1 + (g2 - g1) * t);
        const b = Math.round(b1 + (b2 - b1) * t);
        
        return `rgb(${r}, ${g}, ${b})`;
    }
    
    // Create a smooth radial gradient for each blob
    function drawBlob(blob, ctx) {
        // Create a radial gradient
        const gradient = ctx.createRadialGradient(
            blob.x, blob.y, 0,
            blob.x, blob.y, blob.radius
        );
        
        // Find closest colors from palette
        let closestColor = colorPalette[0].color;
        let minDist = 1000000;
        
        for (const colorStop of colorPalette) {
            const r1 = parseInt(blob.color.slice(1, 3), 16);
            const g1 = parseInt(blob.color.slice(3, 5), 16);
            const b1 = parseInt(blob.color.slice(5, 7), 16);
            
            const r2 = parseInt(colorStop.color.slice(1, 3), 16);
            const g2 = parseInt(colorStop.color.slice(3, 5), 16);
            const b2 = parseInt(colorStop.color.slice(5, 7), 16);
            
            const dist = Math.sqrt(
                Math.pow(r1 - r2, 2) + 
                Math.pow(g1 - g2, 2) + 
                Math.pow(b1 - b2, 2)
            );
            
            if (dist < minDist) {
                minDist = dist;
                closestColor = colorStop.color;
            }
        }
        
        // Set gradient colors
        gradient.addColorStop(0, blob.color);
        gradient.addColorStop(0.7, closestColor);
        gradient.addColorStop(1, 'rgba(36, 0, 64, 0)'); // Transparent edges
        
        ctx.fillStyle = gradient;
        ctx.globalCompositeOperation = 'screen'; // Creates more vibrant color mixing
        
        // Draw blob with slightly distorted circle for organic feel
        ctx.beginPath();
        
        const numPoints = 20;
        const angleStep = (Math.PI * 2) / numPoints;
        let angle = 0;
        
        for (let i = 0; i <= numPoints; i++) {
            const distortion = 1 + (Math.sin(angle * 3 + blob.phase) * blob.amplitude);
            const radius = blob.radius * distortion;
            
            const x = blob.x + Math.cos(angle) * radius;
            const y = blob.y + Math.sin(angle) * radius;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
            
            angle += angleStep;
        }
        
        ctx.closePath();
        ctx.fill();
    }
    
    // Draw mouse trail blobs
    function drawMouseTrail() {
        if (mousePoints.length <= 1) return;
        
        ctx.globalCompositeOperation = 'screen';
        
        for (let i = 0; i < mousePoints.length - 1; i++) {
            const point = mousePoints[i];
            const nextPoint = mousePoints[i + 1];
            
            // Skip if points are too close
            const dx = nextPoint.x - point.x;
            const dy = nextPoint.y - point.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 5) continue;
            
            // Draw gradient trail between points
            const gradient = ctx.createLinearGradient(
                point.x, point.y,
                nextPoint.x, nextPoint.y
            );
            
            // Age based color and opacity
            const ageRatio = 1 - (point.age / maxMousePoints);
            const colorIndex = Math.floor(point.colorPos * (colorPalette.length - 1));
            const nextColorIndex = (colorIndex + 1) % colorPalette.length;
            
            const color1 = colorPalette[colorIndex].color;
            const color2 = colorPalette[nextColorIndex].color;
            
            gradient.addColorStop(0, color1);
            gradient.addColorStop(1, color2);
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 30 * ageRatio;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            // Draw the line
            ctx.beginPath();
            ctx.moveTo(point.x, point.y);
            ctx.lineTo(nextPoint.x, nextPoint.y);
            ctx.stroke();
            
            // Draw glow effect
            ctx.shadowColor = color1;
            ctx.shadowBlur = 15;
            ctx.lineWidth = 15 * ageRatio;
            ctx.stroke();
            
            // Reset shadow
            ctx.shadowBlur = 0;
        }
    }
    
    // Update the fluid animation
    function updateGradient(time) {
        // Clear the canvas with base color
        ctx.fillStyle = '#240040'; // Deep purple background
        ctx.fillRect(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);
        ctx.globalCompositeOperation = 'source-over';
        
        // Update and draw each blob
        for (const blob of blobs) {
            // Update position with fluid movement
            blob.x += blob.speedX;
            blob.y += blob.speedY;
            
            // Update oscillation phase
            blob.phase += blob.phaseSpeed;
            
            // Bounce off edges with damping
            if (blob.x < -blob.radius || blob.x > canvas.width / window.devicePixelRatio + blob.radius) {
                blob.speedX *= -0.9;
            }
            if (blob.y < -blob.radius || blob.y > canvas.height / window.devicePixelRatio + blob.radius) {
                blob.speedY *= -0.9;
            }
            
            // Add slight mouse influence if mouse is active
            if (isMouseActive) {
                const dx = mouseX - blob.x;
                const dy = mouseY - blob.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < canvas.width / (2 * window.devicePixelRatio)) {
                    const influence = (1 - dist / (canvas.width / (2 * window.devicePixelRatio))) * 0.03;
                    blob.speedX += dx * influence;
                    blob.speedY += dy * influence;
                }
            }
            
            // Dampen speeds to prevent excessive movement
            blob.speedX *= 0.99;
            blob.speedY *= 0.99;
            
            // Draw the blob
            drawBlob(blob, ctx);
        }
        
        // Draw mouse trail
        drawMouseTrail();
        
        // Apply post-processing effects
        applyPostEffects();
        
        // Update mouse velocity
        if (isMouseActive) {
            mouseVelocityX = mouseX - lastMouseX;
            mouseVelocityY = mouseY - lastMouseY;
            lastMouseX = mouseX;
            lastMouseY = mouseY;
        } else {
            mouseVelocityX *= 0.95;
            mouseVelocityY *= 0.95;
        }
        
        // Update mouse points age
        for (let i = mousePoints.length - 1; i >= 0; i--) {
            mousePoints[i].age++;
            // Remove old points
            if (mousePoints[i].age > maxMousePoints) {
                mousePoints.splice(i, 1);
            }
        }
    }
    
    // Apply post-processing effects for more fluid look
    function applyPostEffects() {
        // Apply a blur effect for smoothness
        ctx.filter = 'blur(4px)';
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = 0.7;
        ctx.drawImage(canvas, 0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);
        ctx.filter = 'none';
        ctx.globalAlpha = 1.0;
        ctx.globalCompositeOperation = 'source-over';
    }
    
    // Handle mouse/touch interaction
    function handlePointerMove(x, y) {
        const rect = canvas.getBoundingClientRect();
        mouseX = (x - rect.left); // Already scaled by devicePixelRatio
        mouseY = (y - rect.top);
        isMouseActive = true;
        
        // Add to mouse points for trail effect with color position
        const colorPos = (Date.now() % 3000) / 3000; // Cycle through colors
        mousePoints.unshift({ 
            x: mouseX, 
            y: mouseY, 
            age: 0,
            colorPos: colorPos
        });
        
        // Limit the number of mouse points
        if (mousePoints.length > maxMousePoints) {
            mousePoints.pop();
        }
    }
    
    // Mouse events
    container.addEventListener('mousemove', function(e) {
        handlePointerMove(e.clientX, e.clientY);
    });
    
    container.addEventListener('mouseleave', function() {
        isMouseActive = false;
    });
    
    // Touch events for mobile
    container.addEventListener('touchmove', function(e) {
        e.preventDefault();
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
    });
    
    container.addEventListener('touchend', function() {
        isMouseActive = false;
    });
    
    // Animation loop with requestAnimationFrame
    function animate(timestamp) {
        updateGradient(timestamp);
        requestAnimationFrame(animate);
    }
    
    // Initialize and start animation
    generateGradient();
    requestAnimationFrame(animate);
    
    // Log that the heatmap has been initialized
    console.log('Heatmap visualization initialized');
});