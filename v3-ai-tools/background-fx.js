// Brutalist Slide Builder - Canvas Ambient Background FX Engine
(function() {
  let activeCanvas = null;
  let animationFrameId = null;

  window.addEventListener('DOMContentLoaded', () => {
    // Check for prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      console.log("Reduced motion preferred. Ambient background FX disabled.");
      return;
    }

    // Initialize background based on data attribute on body
    const fxType = document.body.getAttribute('data-background-fx');
    if (fxType) {
      initBackgroundFX(fxType);
    }
  });

  function initBackgroundFX(type) {
    // Create background container canvas
    const canvas = document.createElement('canvas');
    canvas.id = 'slide-ambient-bg-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.zIndex = '-1';
    canvas.style.pointerEvents = 'none';
    
    // Inject canvas as the first child of body
    document.body.insertBefore(canvas, document.body.firstChild);
    activeCanvas = canvas;

    const ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    // Start target visual engine
    switch (type.toLowerCase()) {
      case 'particles':
        runParticleNetwork(ctx);
        break;
      case 'matrix':
        runMatrixRain(ctx);
        break;
      case 'ripple':
        runGridRipple(ctx);
        break;
    }
  }

  // 1. Particle Network Engine
  function runParticleNetwork(ctx) {
    const canvas = ctx.canvas;
    const particles = [];
    const particleCount = Math.min(60, Math.floor((canvas.width * canvas.height) / 20000));
    
    // Grab ink/accent colors from dynamic tokens or defaults
    const getAccentColor = () => getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim() || '#FF5A36';
    const getMutedColor = () => getComputedStyle(document.documentElement).getPropertyValue('--color-muted').trim() || '#8A8A85';

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.6;
        this.vy = (Math.random() - 0.5) * 0.6;
        this.radius = Math.random() * 2.5 + 1;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        
        // Bounce bounds
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = getMutedColor() + '66'; // 40% alpha
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and Draw particles
      particles.forEach(p => {
        p.update();
        p.draw();
      });

      // Draw connections
      const maxDist = 140;
      const accent = getAccentColor();
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.18;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = accent + Math.floor(alpha * 255).toString(16).padStart(2, '0');
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    }
    animate();
  }

  // 2. Matrix Code Rain Engine
  function runMatrixRain(ctx) {
    const canvas = ctx.canvas;
    const fontSize = 16;
    const columns = Math.floor(canvas.width / fontSize) + 1;
    const drops = Array(columns).fill(1);

    const getAccentColor = () => getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim() || '#FF5A36';
    const getBgColor = () => getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim() || '#1A1A1A';

    // Characters array
    const chars = "01ABCDEFGHIJKLMNOPQRSTUVWXYZ$%#@&+=*~<>".split("");

    let lastTime = 0;
    const fps = 24;
    const interval = 1000 / fps;

    function animate(time) {
      animationFrameId = requestAnimationFrame(animate);
      
      const delta = time - lastTime;
      if (delta < interval) return;
      lastTime = time - (delta % interval);

      // Semi-transparent bg to create trailing effect
      ctx.fillStyle = getBgColor() + '22'; // 13% opacity
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = getAccentColor() + '55'; // 33% opacity accent
      ctx.font = `bold ${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        ctx.fillText(text, x, y);

        if (y > canvas.height && Math.random() > 0.985) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }
    requestAnimationFrame(animate);
  }

  // 3. Grid Ripple Engine
  function runGridRipple(ctx) {
    const canvas = ctx.canvas;
    const spacing = 40;
    let mouse = { x: -1000, y: -1000 };

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    const getAccentColor = () => getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim() || '#FF5A36';

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = getAccentColor() + '22'; // faint ripple dots

      const cols = Math.floor(canvas.width / spacing) + 2;
      const rows = Math.floor(canvas.height / spacing) + 2;

      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const x = c * spacing;
          const y = r * spacing;

          // Calculate displacement from mouse
          const dx = mouse.x - x;
          const dy = mouse.y - y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          let size = 2.5;
          let offset = { x: 0, y: 0 };

          if (dist < 220) {
            const force = (220 - dist) / 220;
            size = 2.5 + force * 4.5;
            
            // Push dots away slightly
            offset.x = -(dx / dist) * force * 12;
            offset.y = -(dy / dist) * force * 12;
          }

          ctx.beginPath();
          ctx.arc(x + offset.x, y + offset.y, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    }
    animate();
  }
})();
