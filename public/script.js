// Advanced Particle System with Star Constellation effect
class Particle {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.reset();
    }

    reset() {
        this.x = Math.random() * this.canvas.width;
        this.y = Math.random() * this.canvas.height;
        this.size = Math.random() * 2.5 + 1.5;
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.speedY = (Math.random() - 0.5) * 0.4;
        this.opacity = Math.random() * 0.5 + 0.5;
        this.baseOpacity = this.opacity;
        this.pulseSpeed = Math.random() * 0.001 + 0.0005;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > this.canvas.width) this.x = 0;
        if (this.x < 0) this.x = this.canvas.width;
        if (this.y > this.canvas.height) this.y = 0;
        if (this.y < 0) this.y = this.canvas.height;

        this.opacity = this.baseOpacity + Math.sin(Date.now() * this.pulseSpeed) * 0.3;
    }

    draw() {
        // Main particle glow
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = `rgba(100, 150, 255, ${this.opacity})`;
        
        // Draw main particle
        this.ctx.fillStyle = `rgba(150, 180, 255, ${this.opacity})`;
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Outer glow
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(120, 160, 255, ${this.opacity * 0.3})`;
        this.ctx.fill();
        
        this.ctx.shadowBlur = 0;
    }
}

class ParticleSystem {
    constructor(canvas, particleCount = 120) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.particleCount = particleCount;
        this.mouse = { x: null, y: null, radius: 200 };
        
        this.init();
        this.animate();
        this.addEventListeners();
    }

    init() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push(new Particle(this.canvas));
        }
    }

    addEventListeners() {
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });

        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.x;
            this.mouse.y = e.y;
        });

        window.addEventListener('mouseout', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });
    }

    connectParticles() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 180) {
                    const opacity = 0.3 * (1 - distance / 180);
                    
                    this.ctx.strokeStyle = `rgba(100, 150, 255, ${opacity})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }
    }

    mouseInteraction() {
        if (this.mouse.x == null) return;

        for (let particle of this.particles) {
            const dx = this.mouse.x - particle.x;
            const dy = this.mouse.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.mouse.radius) {
                const force = (this.mouse.radius - distance) / this.mouse.radius;
                const angle = Math.atan2(dy, dx);
                particle.x -= Math.cos(angle) * force * 2;
                particle.y -= Math.sin(angle) * force * 2;
            }
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let particle of this.particles) {
            particle.update();
            particle.draw();
        }

        this.connectParticles();
        this.mouseInteraction();

        requestAnimationFrame(() => this.animate());
    }
}

// Initialize particle system
const canvas = document.getElementById('particleCanvas');
new ParticleSystem(canvas, 120);

// Format NGL URL
function formatNGLUrl(input) {
    input = input.trim();
    
    if (input.startsWith('https://ngl.link/')) {
        return input;
    } else if (input.startsWith('ngl.link/')) {
        return 'https://' + input;
    } else {
        return 'https://ngl.link/' + input;
    }
}

// Show result message with animation
function showResult(message, isSuccess) {
    const resultDiv = document.getElementById('result');
    resultDiv.textContent = message;
    resultDiv.className = 'result ' + (isSuccess ? 'success' : 'error');
    resultDiv.style.display = 'block';
    
    setTimeout(() => {
        resultDiv.style.opacity = '1';
    }, 10);
}

// Hide result message
function hideResult() {
    const resultDiv = document.getElementById('result');
    resultDiv.style.opacity = '0';
    setTimeout(() => {
        resultDiv.style.display = 'none';
    }, 400);
}

// Show/hide loading with smooth transition
function setLoading(isLoading) {
    const loadingDiv = document.getElementById('loading');
    const submitBtn = document.querySelector('.btn-send');
    
    if (isLoading) {
        loadingDiv.style.display = 'block';
        setTimeout(() => {
            loadingDiv.style.opacity = '1';
        }, 10);
    } else {
        loadingDiv.style.opacity = '0';
        setTimeout(() => {
            loadingDiv.style.display = 'none';
        }, 400);
    }
    
    submitBtn.disabled = isLoading;
}

// Send spam messages
async function sendSpam(nglUrl, message, count) {
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < count; i++) {
        try {
            const encodedUrl = encodeURIComponent(nglUrl);
            const encodedMessage = encodeURIComponent(message);
            
            const apiUrl = `/api/spamngl?url=${encodedUrl}&message=${encodedMessage}`;
            
            const response = await fetch(apiUrl);
            const data = await response.json();
            
            if (data.status === 'success') {
                successCount++;
            } else {
                failCount++;
                console.error('Error:', data.message);
            }
            
            if (i < count - 1) {
                await new Promise(resolve => setTimeout(resolve, 600));
            }
        } catch (error) {
            failCount++;
            console.error('Request failed:', error);
        }
    }
    
    return { successCount, failCount };
}

// Handle form submission
document.getElementById('spamForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const nglUrlInput = document.getElementById('nglUrl').value;
    const message = document.getElementById('message').value;
    const count = parseInt(document.getElementById('count').value);
    
    if (!nglUrlInput || !message || count < 1 || count > 100) {
        showResult('Mohon isi semua field dengan benar', false);
        return;
    }
    
    const nglUrl = formatNGLUrl(nglUrlInput);
    
    hideResult();
    setLoading(true);
    
    try {
        const { successCount, failCount } = await sendSpam(nglUrl, message, count);
        
        setLoading(false);
        
        if (successCount > 0) {
            showResult(
                `Berhasil mengirim ${successCount} pesan${failCount > 0 ? ` | Gagal: ${failCount}` : ''}`,
                true
            );
        } else {
            showResult('Gagal mengirim pesan. Silakan coba lagi', false);
        }
    } catch (error) {
        setLoading(false);
        showResult('Terjadi kesalahan: ' + error.message, false);
    }
});

// Reset form with smooth animation
function resetForm() {
    const form = document.getElementById('spamForm');
    const inputs = form.querySelectorAll('input, textarea');
    
    inputs.forEach((input, index) => {
        setTimeout(() => {
            input.style.transform = 'scale(0.95)';
            setTimeout(() => {
                input.value = input.type === 'number' ? '1' : '';
                input.style.transform = 'scale(1)';
            }, 100);
        }, index * 50);
    });
    
    hideResult();
}

// Smooth input animations
document.querySelectorAll('input, textarea').forEach(element => {
    element.addEventListener('focus', function() {
        this.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
    });
    
    element.addEventListener('blur', function() {
        this.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
    });
});

// Add ripple effect to buttons
document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(255, 255, 255, 0.5)';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'rippleEffect 0.6s ease-out';
        ripple.style.pointerEvents = 'none';
        
        this.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// Add ripple animation to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes rippleEffect {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
    
    button {
        position: relative;
        overflow: hidden;
    }
    
    .result {
        opacity: 0;
        transition: opacity 0.4s ease;
    }
    
    .loading {
        opacity: 0;
        transition: opacity 0.4s ease;
    }
`;
document.head.appendChild(style);

// Parallax effect on mouse move
let mouseX = 0;
let mouseY = 0;
let currentX = 0;
let currentY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX - window.innerWidth / 2) / 50;
    mouseY = (e.clientY - window.innerHeight / 2) / 50;
});

function animateParallax() {
    currentX += (mouseX - currentX) * 0.05;
    currentY += (mouseY - currentY) * 0.05;
    
    const container = document.querySelector('.container');
    if (container && !container.matches(':hover')) {
        container.style.transform = `perspective(1000px) rotateX(${currentY * 0.3}deg) rotateY(${currentX * 0.3}deg)`;
    }
    
    requestAnimationFrame(animateParallax);
}

animateParallax();

// Add floating animation to container
let floatTime = 0;

function floatAnimation() {
    floatTime += 0.01;
    const container = document.querySelector('.container');
    
    if (container && !container.matches(':hover')) {
        const floatY = Math.sin(floatTime) * 5;
        const currentTransform = container.style.transform || '';
        container.style.transform = currentTransform + ` translateY(${floatY}px)`;
    }
    
    requestAnimationFrame(floatAnimation);
}

floatAnimation();

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('spamForm').dispatchEvent(new Event('submit'));
    }
    
    if (e.key === 'Escape') {
        resetForm();
    }
});

// Add input validation with smooth feedback
document.getElementById('count').addEventListener('input', function() {
    const value = parseInt(this.value);
    const note = this.parentElement.querySelector('.input-note');
    
    if (value > 100) {
        this.value = 100;
        note.style.color = '#ff6b9d';
        note.textContent = 'Maksimal 100 pesan';
        setTimeout(() => {
            note.style.color = '#808080';
        }, 2000);
    } else if (value < 1) {
        this.value = 1;
        note.style.color = '#ff6b9d';
        note.textContent = 'Minimal 1 pesan';
        setTimeout(() => {
            note.style.color = '#808080';
            note.textContent = 'Maksimal 100 pesan';
        }, 2000);
    }
});

// Add character counter for textarea
const messageTextarea = document.getElementById('message');
const messageLabel = messageTextarea.previousElementSibling;

messageTextarea.addEventListener('input', function() {
    const length = this.value.length;
    const maxLength = 500;
    
    if (!document.getElementById('charCounter')) {
        const counter = document.createElement('span');
        counter.id = 'charCounter';
        counter.style.cssText = `
            float: right;
            font-size: 12px;
            color: #808080;
            transition: color 0.3s ease;
        `;
        messageLabel.appendChild(counter);
    }
    
    const counter = document.getElementById('charCounter');
    counter.textContent = `${length}/${maxLength}`;
    
    if (length > maxLength * 0.9) {
        counter.style.color = '#ff6b9d';
    } else if (length > maxLength * 0.7) {
        counter.style.color = '#ffa500';
    } else {
        counter.style.color = '#808080';
    }
});

// Auto-save form data to memory
let formData = {
    url: '',
    message: '',
    count: 1
};

document.getElementById('nglUrl').addEventListener('input', (e) => {
    formData.url = e.target.value;
});

document.getElementById('message').addEventListener('input', (e) => {
    formData.message = e.target.value;
});

document.getElementById('count').addEventListener('input', (e) => {
    formData.count = e.target.value;
});

// Add focus trap
const focusableElements = document.querySelectorAll('input, textarea, button');

focusableElements.forEach((element, index) => {
    element.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (index === 0) {
                    e.preventDefault();
                    focusableElements[focusableElements.length - 1].focus();
                }
            } else {
                if (index === focusableElements.length - 1) {
                    e.preventDefault();
                    focusableElements[0].focus();
                }
            }
        }
    });
});

// Add title glitch effect
const title = document.querySelector('h1');
const originalText = title.textContent;

setInterval(() => {
    if (Math.random() > 0.98) {
        const glitchChars = '!<>-_\\/[]{}—=+*^?#________';
        let glitchedText = '';
        
        for (let i = 0; i < originalText.length; i++) {
            if (Math.random() > 0.9) {
                glitchedText += glitchChars[Math.floor(Math.random() * glitchChars.length)];
            } else {
                glitchedText += originalText[i];
            }
        }
        
        title.textContent = glitchedText;
        
        setTimeout(() => {
            title.textContent = originalText;
        }, 50);
    }
}, 3000);